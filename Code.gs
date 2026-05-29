const CONFIG = {
  SQUARE_ACCESS_TOKEN: 'EAAAl9SAnTU_kjc3PSmsbuToZsv8pVmp5TRhEBOdUQ0BjkOU2XAphurbLotot3CQ',
  SQUARE_LOCATION_ID: 'LXQKD400119PE',
  SQUARE_API_BASE: 'https://connect.squareup.com/v2',
};

const PINS = {
  'Abdo':  { pin: '5436', role: 'admin' },
  'Fares': { pin: '1503', role: 'team' },
  'Assim': { pin: '1738', role: 'team' },
  'Kamal': { pin: '9990', role: 'team' },
};

const PAY_RATES = {
  'Abdo': 20, 'Fares': 20, 'Assim': 14, 'Kamal': 11
};

const SHEETS = {
  LIVE:     'Square Cash',
  CASH_OUT: 'Cash Out Log',
  DRAWER:   'Drawer Log',
};

function doGet(e) {
  const action = e.parameter.action;
  let result;
  try {
    if      (action === 'getDashboard')    result = getDashboardData();
    else if (action === 'setDrawer')       result = setDrawerAmount(e.parameter.type, parseFloat(e.parameter.amount), e.parameter.who);
    else if (action === 'logCashOut')      result = logCashOut(e.parameter.who, parseFloat(e.parameter.amount), e.parameter.reason, e.parameter.note);
    else if (action === 'deleteCashOut')   result = deleteCashOutEntry(parseInt(e.parameter.rowIndex));
    else if (action === 'getReport')       result = getReportData(e.parameter.start, e.parameter.end);
    else if (action === 'getCashOutHistory') result = getCashOutHistory(e.parameter.start, e.parameter.end);
    else if (action === 'getSalesHistory') result = getSalesHistory(e.parameter.start, e.parameter.end);
    else if (action === 'getEmployeeHours') result = getEmployeeHours(e.parameter.start, e.parameter.end);
    else if (action === 'getPOSHistory')   result = getPOSDrawerHistory(e.parameter.start, e.parameter.end);
    else result = { error: 'Unknown action' };
  } catch(err) {
    result = { error: err.message };
  }
  return ContentService.createTextOutput(JSON.stringify(result)).setMimeType(ContentService.MimeType.JSON);
}

// ── DASHBOARD ──
function getDashboardData() {
  const today = getTodayDate();

  const liveSheet     = getSheet(SHEETS.LIVE);
  const cashIn        = liveSheet ? (parseFloat(liveSheet.getRange('B2').getValue()) || 0) : 0;
  const cashInUpdated = liveSheet ? String(liveSheet.getRange('D2').getValue()) : '—';
  const cashInTxn     = liveSheet ? (parseInt(liveSheet.getRange('C2').getValue()) || 0) : 0;
  const cardIn        = liveSheet ? (parseFloat(liveSheet.getRange('G2').getValue()) || 0) : 0;
  const cardInTxn     = liveSheet ? (parseInt(liveSheet.getRange('H2').getValue()) || 0) : 0;
  const drawerCashIn  = liveSheet ? (parseFloat(liveSheet.getRange('E2').getValue()) || 0) : 0;
  const drawerCashOut = liveSheet ? (parseFloat(liveSheet.getRange('F2').getValue()) || 0) : 0;

  // Pull opening/closing from Square shifts instead of manual sheet
  const drawerSheet  = getOrCreateSheet(SHEETS.DRAWER, ['Date','Type','Amount','Who','Time']);
  const cashOutSheet = getOrCreateSheet(SHEETS.CASH_OUT, ['Date','Time','Who','Amount','Reason','Note']);

  // Get today's opening/closing from Square cash drawer shifts
  const shiftAmounts = getTodayShiftAmounts();
  const openingAmount = shiftAmounts.opening;
  const closingAmount = shiftAmounts.closing;

  const cashOutData = getTodayCashOut(cashOutSheet, today);

  let effectiveOpening = openingAmount;
  if (openingAmount === 0) effectiveOpening = getLastClosingAmount(drawerSheet);

  const totalSales = cashIn + cardIn;
  const expectedInDrawer = effectiveOpening + cashIn + drawerCashIn - cashOutData.total - drawerCashOut;
  const dailyPL = totalSales - cashOutData.total - drawerCashOut;

  return {
    today, cashIn, cashInTxn, cashInUpdated,
    cardIn, cardInTxn, totalSales,
    drawerCashIn, drawerCashOut,
    openingAmount: effectiveOpening,
    closingAmount,
    openingSet: openingAmount > 0,
    cashOut: cashOutData.total,
    cashOutEntries: cashOutData.entries,
    expectedInDrawer, dailyPL,
  };
}

// ── DRAWER ──
function setDrawerAmount(type, amount, who) {
  const today = getTodayDate();
  const sheet = getOrCreateSheet(SHEETS.DRAWER, ['Date','Type','Amount','Who','Time']);
  const data  = sheet.getDataRange().getValues();
  for (let i = 1; i < data.length; i++) {
    if (toDateStr(data[i][0]) === today && String(data[i][1]) === type) {
      sheet.getRange(i+1, 3).setValue(amount);
      sheet.getRange(i+1, 4).setValue(who);
      sheet.getRange(i+1, 5).setValue(nowTime());
      return { success: true };
    }
  }
  sheet.appendRow([today, type, amount, who, nowTime()]);
  return { success: true };
}

// ── CASH OUT ──
function logCashOut(who, amount, reason, note) {
  const today = getTodayDate();
  const sheet = getOrCreateSheet(SHEETS.CASH_OUT, ['Date','Time','Who','Amount','Reason','Note']);
  sheet.appendRow([today, nowTime(), who, parseFloat(amount), reason, note || '']);
  return { success: true };
}

function deleteCashOutEntry(rowIndex) {
  const sheet = getOrCreateSheet(SHEETS.CASH_OUT, ['Date','Time','Who','Amount','Reason','Note']);
  sheet.deleteRow(rowIndex);
  return { success: true };
}

function getCashOutHistory(startDate, endDate) {
  const sheet = getOrCreateSheet(SHEETS.CASH_OUT, ['Date','Time','Who','Amount','Reason','Note']);
  const data  = sheet.getDataRange().getValues().slice(1);
  const entries = [];
  data.forEach((r, i) => {
    const date = toDateStr(r[0]);
    if (date >= startDate && date <= endDate) {
      let timeStr = '';
      try { timeStr = Utilities.formatDate(new Date(r[1]), 'America/Detroit', 'hh:mm a'); }
      catch(e) { timeStr = String(r[1]); }
      entries.push({ rowIndex: i+2, date, time: timeStr, who: r[2], amount: parseFloat(r[3]) || 0, reason: r[4], note: r[5] || '' });
    }
  });
  entries.sort((a,b) => b.date.localeCompare(a.date));
  const total = entries.reduce((s,e) => s + e.amount, 0);
  const byPerson = {};
  entries.forEach(e => { if (!byPerson[e.who]) byPerson[e.who] = 0; byPerson[e.who] += e.amount; });
  return { entries, total, byPerson };
}

// ── SALES HISTORY ──
function getSalesHistory(startDate, endDate) {
  const start = new Date(startDate), end = new Date(endDate);
  const days = [];
  for (let d = new Date(start); d <= end; d.setDate(d.getDate()+1)) {
    const dateStr   = Utilities.formatDate(d, 'America/Detroit', 'yyyy-MM-dd');
    const startTime = `${dateStr}T00:00:00Z`;
    const endTime   = `${dateStr}T23:59:59Z`;
    let cashTotal = 0, cashTxn = 0, cardTotal = 0, cardTxn = 0;
    let cursor = null;
    do {
      const payload = {
        location_ids: [CONFIG.SQUARE_LOCATION_ID],
        query: { filter: {
          date_time_filter: { created_at: { start_at: startTime, end_at: endTime } },
          state_filter: { states: ['COMPLETED'] }
        }},
        limit: 500,
      };
      if (cursor) payload.cursor = cursor;
      const res = callSquareApi('/orders/search', 'POST', payload);
      (res.orders || []).forEach(order => {
        (order.tenders || []).forEach(t => {
          const amt = (t.amount_money?.amount || 0) / 100;
          if (t.type === 'CASH') { cashTotal += amt; cashTxn++; }
          else if (t.type === 'CARD') { cardTotal += amt; cardTxn++; }
        });
      });
      cursor = res.cursor || null;
    } while (cursor);
    if (cashTotal > 0 || cardTotal > 0) {
      days.push({ date: dateStr, cashTotal, cashTxn, cardTotal, cardTxn, total: cashTotal + cardTotal });
    }
    Utilities.sleep(150);
  }
  const totalCash = days.reduce((s,d) => s + d.cashTotal, 0);
  const totalCard = days.reduce((s,d) => s + d.cardTotal, 0);
  return { days, totalCash, totalCard, total: totalCash + totalCard };
}

// ── POS DRAWER HISTORY ──
function getPOSDrawerHistory(startDate, endDate) {
  const events = [];
  try {
    const shiftsRes = callSquareApi(`/cash-drawers/shifts?location_id=${CONFIG.SQUARE_LOCATION_ID}&state=OPEN`, 'GET', null);
    const shifts = shiftsRes.cash_drawer_shifts || [];
    shifts.forEach(shift => {
      const eventsRes = callSquareApi(`/cash-drawers/shifts/${shift.id}/events?location_id=${CONFIG.SQUARE_LOCATION_ID}`, 'GET', null);
      (eventsRes.cash_drawer_shift_events || []).forEach(event => {
        const date = toDateStr(event.created_at);
        if (date < startDate || date > endDate) return;
        if (!['PAID_IN','PAID_OUT'].includes(event.event_type)) return;
        const amount = (event.event_money?.amount || 0) / 100;
        let timeStr = '';
        try { timeStr = Utilities.formatDate(new Date(event.created_at), 'America/Detroit', 'hh:mm a'); }
        catch(e) { timeStr = ''; }
        events.push({ date, time: timeStr, type: event.event_type, amount, description: event.description || '' });
      });
    });
  } catch(e) { Logger.log('POS history error: ' + e.message); }
  events.sort((a,b) => b.date.localeCompare(a.date) || b.time.localeCompare(a.time));
  const totalIn  = events.filter(e => e.type === 'PAID_IN').reduce((s,e) => s + e.amount, 0);
  const totalOut = events.filter(e => e.type === 'PAID_OUT').reduce((s,e) => s + e.amount, 0);
  return { events, totalIn, totalOut };
}

// ── EMPLOYEE HOURS ──
function getEmployeeHours(startDate, endDate) {
  const teamMap = getTeamMembers();

  // ── Pull timecards ──
  const payload = {
    query: {
      filter: {
        location_ids: [CONFIG.SQUARE_LOCATION_ID],
        workday: { date_range: { start_date: startDate, end_date: endDate }, match_on: 'START_AT' },
        status: 'CLOSED',
      }
    },
    limit: 200,
  };
  let allShifts = [], cursor = null;
  do {
    if (cursor) payload.cursor = cursor;
    const res = callSquareApi('/labor/shifts/search', 'POST', payload);
    allShifts = allShifts.concat(res.shifts || []);
    cursor = res.cursor || null;
  } while (cursor);

  // ── Pull PAID_OUT events for date range ──
  const paidOutEvents = [];
  try {
    const shiftsRes = callSquareApi(`/cash-drawers/shifts?location_id=${CONFIG.SQUARE_LOCATION_ID}&state=OPEN`, 'GET', null);
    (shiftsRes.cash_drawer_shifts || []).forEach(shift => {
      const eventsRes = callSquareApi(`/cash-drawers/shifts/${shift.id}/events?location_id=${CONFIG.SQUARE_LOCATION_ID}`, 'GET', null);
      (eventsRes.cash_drawer_shift_events || []).forEach(ev => {
        if (ev.event_type !== 'PAID_OUT') return;
        const date = toDateStr(ev.created_at);
        if (date < startDate || date > endDate) return;
        const emp = matchEmployee(ev.description || '');
        if (!emp) return;
        const category = categorizeExpense(ev.description || '', emp);
        let timeStr = '';
        try { timeStr = Utilities.formatDate(new Date(ev.created_at), 'America/Detroit', 'MM/dd hh:mm a'); } catch(e) {}
        paidOutEvents.push({
          date, time: timeStr,
          employee: emp,
          amount: (ev.event_money?.amount || 0) / 100,
          description: ev.description || '',
          category,
          period: getPayPeriod(date),
        });
      });
    });
  } catch(e) { Logger.log('PAID_OUT pull error: ' + e.message); }

  // ── Build timecard hours by employee by pay period ──
  const hoursByPeriod = {}; // key: "Assim|2026-05-17→2026-05-23"
  allShifts.forEach(shift => {
    const memberId = shift.team_member_id || shift.employee_id;
    const name = teamMap[memberId] || null;
    if (!name) return;
    const nameMap = {
  'Asim Alshabieby': 'Assim',
  'Kamal Gelan': 'Kamal',
  'Abdo Alasaadi': 'Abdo',
  'Fares Alasaadi': 'Fares',
};
const empName = nameMap[name];
if (!empName) return;
    const startAt = new Date(shift.start_at);
    const endAt   = new Date(shift.end_at);
    let hours = (endAt - startAt) / (1000 * 60 * 60);
    let breakMins = 0;
    (shift.breaks || []).forEach(b => {
      if (!b.is_paid && b.start_at && b.end_at)
        breakMins += (new Date(b.end_at) - new Date(b.start_at)) / (1000 * 60);
    });
    hours = Math.max(0, hours - breakMins / 60);
    const shiftName = empName;
    const rate = PAY_RATES[shiftName] || 0;
    const pay = hours * rate;
    const dateStr = toDateStr(shift.start_at);
    const period = getPayPeriod(dateStr);
    const key = `${shiftName}|${period.label}`;
    if (!hoursByPeriod[key]) hoursByPeriod[key] = { employee: shiftName, period, hours: 0, expectedPay: 0, shifts: [] };
    hoursByPeriod[key].hours += hours;
    hoursByPeriod[key].expectedPay += pay;
    let startTimeStr = '', endTimeStr = '';
    try {
      startTimeStr = Utilities.formatDate(startAt, 'America/Detroit', 'MM/dd hh:mm a');
      endTimeStr   = Utilities.formatDate(endAt,   'America/Detroit', 'MM/dd hh:mm a');
    } catch(e) {}
    hoursByPeriod[key].shifts.push({ date: dateStr, startTime: startTimeStr, endTime: endTimeStr, hours, rate, pay });
  });

  // ── Build per-employee data ──
  const employees = {};
  const empNames = ['Assim','Kamal','Abdo'];
  empNames.forEach(name => {
    employees[name] = { name, rate: PAY_RATES[name] || 0, periods: [], totalHours: 0, totalExpected: 0, totalTaken: 0, runningBalance: 0 };
  });

  // Get all pay periods in range
  const allPeriods = new Set();
  Object.values(hoursByPeriod).forEach(p => allPeriods.add(p.period.label));
  paidOutEvents.forEach(e => { if (empNames.includes(e.employee)) allPeriods.add(e.period.label); });

  // Sort periods chronologically
  const sortedPeriods = Array.from(allPeriods).sort();

  // Build period data per employee with carry-over
  empNames.forEach(name => {
    let carryOver = 0;
    sortedPeriods.forEach(periodLabel => {
      const tcKey = `${name}|${periodLabel}`;
      const tc = hoursByPeriod[tcKey] || null;
      const periodStart = periodLabel.split(' → ')[0];
      const periodEnd   = periodLabel.split(' → ')[1];

      const hours = tc ? tc.hours : 0;
      const expectedPay = tc ? tc.expectedPay : 0;
      const shifts = tc ? tc.shifts : [];

      // Get all payouts for this employee this period
      const payouts = paidOutEvents.filter(e => e.employee === name && e.period.label === periodLabel);
      const totalTaken = payouts.reduce((s, e) => s + e.amount, 0);

      // Group payouts by category
      const byCategory = {};
      payouts.forEach(p => {
        if (!byCategory[p.category]) byCategory[p.category] = { category: p.category, total: 0, entries: [] };
        byCategory[p.category].total += p.amount;
        byCategory[p.category].entries.push({ date: p.date, time: p.time, amount: p.amount, description: p.description });
      });

      const periodBalance = expectedPay - totalTaken;
      const closingBalance = carryOver + periodBalance;

      employees[name].periods.push({
        period: periodLabel, periodStart, periodEnd,
        hours, expectedPay, totalTaken,
        payouts: Object.values(byCategory),
        shifts,
        carryIn: carryOver,
        periodBalance,
        closingBalance,
      });

      employees[name].totalHours += hours;
      employees[name].totalExpected += expectedPay;
      employees[name].totalTaken += totalTaken;
      carryOver = closingBalance;
    });
    employees[name].runningBalance = carryOver;
  });

  // ── Fares — just show totals taken, no hours comparison ──
  const faresPaidOut = paidOutEvents.filter(e => e.employee === 'Fares');
  const faresTotal = faresPaidOut.reduce((s,e) => s + e.amount, 0);
  const faresByCategory = {};
  faresPaidOut.forEach(p => {
    if (!faresByCategory[p.category]) faresByCategory[p.category] = { category: p.category, total: 0, entries: [] };
    faresByCategory[p.category].total += p.amount;
    faresByCategory[p.category].entries.push({ date: p.date, time: p.time, amount: p.amount, description: p.description });
  });

  // ── Save to Payroll Log sheet ──
  savePayrollToSheet(employees, startDate, endDate);

  return {
    employees: Object.values(employees).filter(e => e.periods.length > 0),
    fares: { name: 'Fares', total: faresTotal, byCategory: Object.values(faresByCategory) },
    startDate, endDate,
  };
}

function getTeamMembers() {
  const map = {};
  try {
    const res = callSquareApi('/team-members/search', 'POST', { query: { filter: { location_ids: [CONFIG.SQUARE_LOCATION_ID], status: 'ACTIVE' } } });
    (res.team_members || []).forEach(m => {
      map[m.id] = `${m.given_name || ''} ${m.family_name || ''}`.trim();
    });
  } catch(e) { Logger.log('Team members error: ' + e.message); }
  return map;
}

// ── REPORTS ──
function getReportData(startDate, endDate) {
  const salesData    = getSalesHistory(startDate, endDate);
  const cashOutSheet = getOrCreateSheet(SHEETS.CASH_OUT, ['Date','Time','Who','Amount','Reason','Note']);
  const drawerSheet  = getOrCreateSheet(SHEETS.DRAWER,   ['Date','Type','Amount','Who','Time']);
  const cashOutAll   = cashOutSheet.getDataRange().getValues().slice(1);
  const drawerAll    = drawerSheet.getDataRange().getValues().slice(1);

  const dayMap = {};
  salesData.days.forEach(d => {
    dayMap[d.date] = { date: d.date, cashIn: d.cashTotal, cardIn: d.cardTotal, totalSales: d.total, cashInTxn: d.cashTxn, cardInTxn: d.cardTxn, cashOut: 0, posIn: 0, posOut: 0, opening: 0, closing: 0 };
  });

  cashOutAll.forEach(r => {
    const date = toDateStr(r[0]); const amount = parseFloat(r[3]) || 0;
    if (date >= startDate && date <= endDate) {
      if (!dayMap[date]) dayMap[date] = { date, cashIn: 0, cardIn: 0, totalSales: 0, cashInTxn: 0, cardInTxn: 0, cashOut: 0, posIn: 0, posOut: 0, opening: 0, closing: 0 };
      dayMap[date].cashOut += amount;
    }
  });

  drawerAll.forEach(r => {
    const date = toDateStr(r[0]); const type = String(r[1]); const amount = parseFloat(r[2]) || 0;
    if (date >= startDate && date <= endDate) {
      if (!dayMap[date]) dayMap[date] = { date, cashIn: 0, cardIn: 0, totalSales: 0, cashInTxn: 0, cardInTxn: 0, cashOut: 0, posIn: 0, posOut: 0, opening: 0, closing: 0 };
      if (type === 'opening') dayMap[date].opening = amount;
      if (type === 'closing') dayMap[date].closing = amount;
    }
  });

  // Add POS drawer events
  try {
    const posData = getPOSDrawerHistory(startDate, endDate);
    posData.events.forEach(ev => {
      if (!dayMap[ev.date]) dayMap[ev.date] = { date: ev.date, cashIn: 0, cardIn: 0, totalSales: 0, cashInTxn: 0, cardInTxn: 0, cashOut: 0, posIn: 0, posOut: 0, opening: 0, closing: 0 };
      if (ev.type === 'PAID_IN')  dayMap[ev.date].posIn  += ev.amount;
      if (ev.type === 'PAID_OUT') dayMap[ev.date].posOut += ev.amount;
    });
  } catch(e) {}

  const days = Object.values(dayMap).sort((a,b) => a.date.localeCompare(b.date));
  days.forEach(d => {
    d.pl = d.totalSales - d.cashOut - d.posOut;
    d.expected = d.opening + d.cashIn + d.posIn - d.cashOut - d.posOut;
    d.diff = d.closing > 0 ? d.closing - d.expected : null;
  });

  const cashOutEntries = [];
  cashOutAll.forEach((r, i) => {
    const date = toDateStr(r[0]);
    if (date >= startDate && date <= endDate) {
      let timeStr = '';
      try { timeStr = Utilities.formatDate(new Date(r[1]), 'America/Detroit', 'hh:mm a'); }
      catch(e) { timeStr = String(r[1]); }
      cashOutEntries.push({ date, time: timeStr, who: r[2], amount: parseFloat(r[3]) || 0, reason: r[4], note: r[5] || '' });
    }
  });
  cashOutEntries.sort((a,b) => b.date.localeCompare(a.date));

  const byPerson = {};
  cashOutAll.forEach(r => {
    const date = toDateStr(r[0]); const who = r[2]; const amount = parseFloat(r[3]) || 0;
    if (date >= startDate && date <= endDate) { if (!byPerson[who]) byPerson[who] = 0; byPerson[who] += amount; }
  });

  let overCount = 0, shortCount = 0, matchCount = 0;
  days.forEach(d => {
    if (d.diff === null) return;
    if (Math.abs(d.diff) < 0.01) matchCount++;
    else if (d.diff > 0) overCount++;
    else shortCount++;
  });

  return {
    days, byPerson, overCount, shortCount, matchCount, cashOutEntries,
    totalCash:  days.reduce((s,d) => s + d.cashIn, 0),
    totalCard:  days.reduce((s,d) => s + d.cardIn, 0),
    totalSales: days.reduce((s,d) => s + d.totalSales, 0),
    totalOut:   days.reduce((s,d) => s + d.cashOut, 0),
    totalPL:    days.reduce((s,d) => s + d.pl, 0),
  };
}

// ── LIVE UPDATE (5-min trigger) ──
function updateLiveCashTotal() {
  const sheet = getOrCreateSheet(SHEETS.LIVE, ['Date','Cash Sales','Cash Txn','Last Updated','Drawer Cash In','Drawer Cash Out','Card Sales','Card Txn']);
  const today = getTodayDate();
  const startTime = `${today}T00:00:00Z`;
  const endTime   = new Date().toISOString();

  let cashTotal = 0, cashTxn = 0, cardTotal = 0, cardTxn = 0, cursor = null;
  do {
    const payload = {
      location_ids: [CONFIG.SQUARE_LOCATION_ID],
      query: { filter: {
        date_time_filter: { created_at: { start_at: startTime, end_at: endTime } },
        state_filter: { states: ['COMPLETED'] }
      }},
      limit: 500,
    };
    if (cursor) payload.cursor = cursor;
    const response = callSquareApi('/orders/search', 'POST', payload);
    (response.orders || []).forEach(order => {
      (order.tenders || []).forEach(t => {
        const amt = (t.amount_money?.amount || 0) / 100;
        if (t.type === 'CASH') { cashTotal += amt; cashTxn++; }
        else if (t.type === 'CARD') { cardTotal += amt; cardTxn++; }
      });
    });
    cursor = response.cursor || null;
  } while (cursor);

  let drawerCashIn = 0, drawerCashOut = 0;
  try {
    const shiftsRes = callSquareApi(`/cash-drawers/shifts?location_id=${CONFIG.SQUARE_LOCATION_ID}&state=OPEN`, 'GET', null);
    (shiftsRes.cash_drawer_shifts || []).forEach(shift => {
      const eventsRes = callSquareApi(`/cash-drawers/shifts/${shift.id}/events?location_id=${CONFIG.SQUARE_LOCATION_ID}`, 'GET', null);
      (eventsRes.cash_drawer_shift_events || []).forEach(event => {
        const eventDate = toDateStr(event.created_at);
        if (eventDate !== today) return;
        const amount = (event.event_money?.amount || 0) / 100;
        if (event.event_type === 'PAID_IN')  drawerCashIn  += amount;
        if (event.event_type === 'PAID_OUT') drawerCashOut += amount;
      });
    });
  } catch(e) { Logger.log('Drawer error: ' + e.message); }

  const now = new Date().toLocaleString('en-US', { timeZone: 'America/Detroit' });
  sheet.getRange('A2').setValue(today);
  sheet.getRange('B2').setValue(cashTotal);
  sheet.getRange('C2').setValue(cashTxn);
  sheet.getRange('D2').setValue(now);
  sheet.getRange('E2').setValue(drawerCashIn);
  sheet.getRange('F2').setValue(drawerCashOut);
  sheet.getRange('G2').setValue(cardTotal);
  sheet.getRange('H2').setValue(cardTxn);
  Logger.log(`✓ Cash: $${cashTotal} (${cashTxn}) | Card: $${cardTotal} (${cardTxn}) | Drawer In: $${drawerCashIn} | Out: $${drawerCashOut}`);
}

// ── HELPERS ──
function getCashTenderAmount(order) {
  if (!order.tenders) return 0;
  return order.tenders.filter(t => t.type === 'CASH').reduce((s,t) => s + (t.amount_money?.amount || 0), 0);
}

function callSquareApi(endpoint, method, payload) {
  const options = {
    method, muteHttpExceptions: true,
    headers: { 'Authorization': `Bearer ${CONFIG.SQUARE_ACCESS_TOKEN}`, 'Square-Version': '2024-01-18', 'Content-Type': 'application/json' },
  };
  if (payload) options.payload = JSON.stringify(payload);
  const res = UrlFetchApp.fetch(CONFIG.SQUARE_API_BASE + endpoint, options);
  return JSON.parse(res.getContentText());
}

function toDateStr(val) {
  if (!val) return '';
  try { return Utilities.formatDate(new Date(val), 'America/Detroit', 'yyyy-MM-dd'); }
  catch(e) { return ''; }
}

function getDrawerAmount(sheet, today, type) {
  const data = sheet.getDataRange().getValues();
  for (let i = 1; i < data.length; i++) {
    if (toDateStr(data[i][0]) === today && String(data[i][1]) === type) return parseFloat(data[i][2]) || 0;
  }
  return 0;
}

function getTodayCashOut(sheet, today) {
  const data = sheet.getDataRange().getValues();
  let total = 0; const entries = [];
  for (let i = 1; i < data.length; i++) {
    if (toDateStr(data[i][0]) === today) {
      const amount = parseFloat(data[i][3]) || 0;
      total += amount;
      let timeStr = '';
      try { timeStr = Utilities.formatDate(new Date(data[i][1]), 'America/Detroit', 'hh:mm a'); }
      catch(e) { timeStr = String(data[i][1]); }
      entries.push({ rowIndex: i+1, time: timeStr, who: data[i][2], amount, reason: data[i][4], note: data[i][5] });
    }
  }
  return { total, entries };
}

function getLastClosingAmount(sheet) {
  const data = sheet.getDataRange().getValues();
  for (let i = data.length - 1; i >= 1; i--) {
    if (String(data[i][1]) === 'closing') return parseFloat(data[i][2]) || 0;
  }
  for (let i = data.length - 1; i >= 1; i--) {
    if (String(data[i][1]) === 'opening') return parseFloat(data[i][2]) || 0;
  }
  return 0;
}

function getTodayDate() { return Utilities.formatDate(new Date(), 'America/Detroit', 'yyyy-MM-dd'); }
function nowTime() { return new Date().toLocaleTimeString('en-US', { timeZone: 'America/Detroit' }); }
function getSheet(name) { return SpreadsheetApp.getActiveSpreadsheet().getSheetByName(name); }
function getOrCreateSheet(name, headers) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName(name);
  if (!sheet) { sheet = ss.insertSheet(name); sheet.appendRow(headers); sheet.getRange(1,1,1,headers.length).setFontWeight('bold'); }
  return sheet;
}
function debugDrawer() {
  const today = getTodayDate();
  const sheet = getOrCreateSheet(SHEETS.DRAWER, ['Date','Type','Amount','Who','Time']);
  const data = sheet.getDataRange().getValues();
  Logger.log('Today: ' + today);
  for (let i = 1; i < data.length; i++) {
    const converted = toDateStr(data[i][0]);
    Logger.log(`Row ${i}: converted=${converted}, type=${data[i][1]}, amount=${data[i][2]}, match=${converted === today}`);
  }
}
function testPOSDescriptions() {
  const shiftsRes = callSquareApi(
    `/cash-drawers/shifts?location_id=${CONFIG.SQUARE_LOCATION_ID}&state=OPEN`,
    'GET', null
  );
  const shifts = shiftsRes.cash_drawer_shifts || [];
  shifts.forEach(shift => {
    const eventsRes = callSquareApi(
      `/cash-drawers/shifts/${shift.id}/events?location_id=${CONFIG.SQUARE_LOCATION_ID}`,
      'GET', null
    );
    (eventsRes.cash_drawer_shift_events || []).forEach(event => {
      if (event.event_type === 'PAID_OUT') {
        Logger.log(`Date: ${event.created_at} | Amount: $${(event.event_money?.amount||0)/100} | Description: "${event.description}"`);
      }
    });
  });
}
function getTodayShiftAmounts() {
  const today = getTodayDate();
  let opening = 0, closing = 0;
  try {
    const res = callSquareApi(
      `/cash-drawers/shifts?location_id=${CONFIG.SQUARE_LOCATION_ID}&state=OPEN`,
      'GET', null
    );
    const shifts = res.cash_drawer_shifts || [];
    // Find the most recently opened shift
    const sorted = shifts.sort((a, b) => new Date(b.opened_at) - new Date(a.opened_at));
    if (sorted.length > 0) {
      const shift = sorted[0];
      opening = (shift.opened_cash_money?.amount || 0) / 100;
      closing = (shift.closed_cash_money?.amount || 0) / 100;
    }
    // Also check CLOSED shifts that closed today
    const closedRes = callSquareApi(
      `/cash-drawers/shifts?location_id=${CONFIG.SQUARE_LOCATION_ID}&state=CLOSED&begin_time=${today}T00:00:00Z&end_time=${today}T23:59:59Z`,
      'GET', null
    );
    const closedShifts = closedRes.cash_drawer_shifts || [];
    if (closedShifts.length > 0) {
      const latest = closedShifts.sort((a,b) => new Date(b.closed_at) - new Date(a.closed_at))[0];
      closing = (latest.closed_cash_money?.amount || 0) / 100;
    }
  } catch(e) {
    Logger.log('getTodayShiftAmounts error: ' + e.message);
  }
  return { opening, closing };
}

function matchEmployee(description) {
  if (!description) return null;
  const d = description.toLowerCase();
  if (d.includes('asim') || d.includes('assim') || d.includes('aszim')) return 'Assim';
  if (d.includes('kamal')) return 'Kamal';
  if (d.includes('abdo')) return 'Abdo';
  if (d.includes('fares')) return 'Fares';
  return null;
}

function categorizeExpense(description, employeeName) {
  if (!description) return 'Other';
  const d = description.toLowerCase();
  if (d.includes('pay') || d.includes('took') || d.includes('hours') || d.includes(' hr') || d.includes('week') || d.includes('salary')) return 'Employee Pay';
  if (d.includes('haircut')) return 'Haircut';
  if (d.includes('food') || d.includes('drinks') || d.includes('breakfast') || d.includes('lunch') || d.includes('dinner') || d.includes('eat')) return 'Food';
  if (d.includes('gas') || d.includes('truck') || d.includes('car')) return 'Vehicle';
  if (d.includes('bank') || d.includes('deposit') || d.includes('zell') || d.includes('zelle')) return 'Bank/Transfer';
  if (d.includes('register') || d.includes('drawer')) return 'Register Transfer';
  return 'Other';
}

function getPayPeriod(dateStr) {
  // Pay period is Sunday to Saturday
  const d = new Date(dateStr + 'T12:00:00Z');
  const day = d.getUTCDay(); // 0=Sun, 6=Sat
  const sun = new Date(d);
  sun.setUTCDate(d.getUTCDate() - day);
  const sat = new Date(sun);
  sat.setUTCDate(sun.getUTCDate() + 6);
  const fmt = (dt) => dt.toISOString().split('T')[0];
  return { start: fmt(sun), end: fmt(sat), label: `${fmt(sun)} → ${fmt(sat)}` };
}

function savePayrollToSheet(employees, startDate, endDate) {
  const sheet = getOrCreateSheet('Payroll Log', ['Pull Date','Employee','Pay Period','Hours','Expected Pay','Taken','Balance','Carry In','Closing Balance','Category Breakdown']);
  const existing = sheet.getDataRange().getValues();
  const existingKeys = new Set(existing.slice(1).map(r => `${r[1]}|${r[2]}`));

  const pullDate = getTodayDate();
  const rows = [];

  Object.values(employees).forEach(emp => {
    emp.periods.forEach(p => {
      const key = `${emp.name}|${p.period}`;
      if (existingKeys.has(key)) return; // skip already saved
      const categoryBreakdown = p.payouts.map(c => `${c.category}: $${c.total.toFixed(2)}`).join(' | ');
      rows.push([
        pullDate, emp.name, p.period,
        parseFloat(p.hours.toFixed(2)),
        parseFloat(p.expectedPay.toFixed(2)),
        parseFloat(p.totalTaken.toFixed(2)),
        parseFloat(p.periodBalance.toFixed(2)),
        parseFloat(p.carryIn.toFixed(2)),
        parseFloat(p.closingBalance.toFixed(2)),
        categoryBreakdown || '—'
      ]);
    });
  });

  if (rows.length > 0) {
    sheet.getRange(sheet.getLastRow() + 1, 1, rows.length, rows[0].length).setValues(rows);
    Logger.log(`Saved ${rows.length} new payroll rows.`);
  } else {
    Logger.log('No new payroll data to save.');
  }
}

function testPayroll() {
  const result = getEmployeeHours('2026-05-01', '2026-05-27');
  Logger.log(JSON.stringify(result));
}

function testTeamMap() {
  const map = getTeamMembers();
  Logger.log(JSON.stringify(map));
}

function testHouseAccount() {
  // Search orders for the last 90 days
  const endTime = new Date().toISOString();
  const startTime = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString();
  
  const payload = {
    location_ids: [CONFIG.SQUARE_LOCATION_ID],
    query: { filter: {
      date_time_filter: { created_at: { start_at: startTime, end_at: endTime } },
      state_filter: { states: ['OPEN', 'COMPLETED'] }
    }},
    limit: 50,
  };
  
  const res = callSquareApi('/orders/search', 'POST', payload);
  const orders = res.orders || [];
  
  // Look for any non-cash, non-card tenders
  orders.forEach(order => {
    (order.tenders || []).forEach(tender => {
      if (tender.type !== 'CASH' && tender.type !== 'CARD') {
        Logger.log(`Type: ${tender.type} | Amount: $${(tender.amount_money?.amount||0)/100} | Note: ${tender.note || ''} | OrderID: ${order.id}`);
      }
    });
  });
  
  Logger.log('Done scanning ' + orders.length + ' orders');


}


function testHouseAccountFull() {
  const endTime = new Date().toISOString();
  const startTime = new Date(Date.now() - 365 * 24 * 60 * 60 * 1000).toISOString();
  let cursor = null, count = 0, total = 0;
  
  do {
    const payload = {
      location_ids: [CONFIG.SQUARE_LOCATION_ID],
      query: { filter: {
        date_time_filter: { created_at: { start_at: startTime, end_at: endTime } },
        state_filter: { states: ['OPEN', 'COMPLETED'] }
      }},
      limit: 500,
    };
    if (cursor) payload.cursor = cursor;
    const res = callSquareApi('/orders/search', 'POST', payload);
    (res.orders || []).forEach(order => {
      (order.tenders || []).forEach(tender => {
        if (tender.type === 'SQUARE_ACCOUNT') {
          const amt = (tender.amount_money?.amount || 0) / 100;
          const date = order.created_at?.split('T')[0] || '';
          Logger.log(`Date: ${date} | Amount: $${amt} | Employee: ${tender.note || '—'}`);
          count++; total += amt;
        }
      });
    });
    cursor = res.cursor || null;
  } while (cursor);
  
  Logger.log(`Total: ${count} transactions, $${total.toFixed(2)}`);
}