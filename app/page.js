'use client';
import { useState, useEffect, useCallback, useRef } from 'react';
const [pinAlert, setPinAlert] = useState(false);
const [faresVideo, setFaresVideo] = useState(false);

const LANG = {
  en: {
    title: 'Choices For You', sub: 'Business Manager', enterPin: 'Enter your PIN to sign in',
    today: 'Today', cashOut: 'Cash Out', employees: 'Employees', reports: 'Reports',
    liveToday: '● Live · Today', expectedDrawer: 'Expected in Drawer',
    cashSales: 'Cash Sales', cardSales: 'Card Sales', manualOut: 'Manual Cash Out',
    posInOut: 'POS In/Out', opening: 'Opening', closing: 'Closing', actualDollar: 'Actual $',
    setOpening: 'Set Opening', setClosing: 'Set Closing', todayCashOut: "Today's Cash Out",
    fullHistory: 'Full History', noEntries: 'No entries yet today.', signOut: 'Sign out',
    reportCashOut: 'Report Cash Out', newEntry: 'New Entry', who: 'Who', amount: 'Amount ($)',
    reason: 'Reason', note: 'Note (optional)', reviewSubmit: 'Review & Submit',
    empHours: 'Employee Hours & Pay', loadHours: 'Load Hours', totalHours: 'Total Hours',
    totalPay: 'Total Pay', reportsHistory: 'Reports & History', pullReport: 'Pull Report',
    exportPDF: '📄 Export PDF', builtBy: 'Built by', needHelp: 'Need help? Contact me',
    todayPL: "Today's P&L", lowDrawerAlert: 'Low Drawer Alert', lowDrawerSub: 'Expected drawer is below $100',
    loading: 'Loading...', confirmCashOut: 'Confirm Cash Out', reviewBefore: 'Review before submitting.',
    cancel: 'Cancel', submit: 'Submit', done: 'Done!', close: 'Close', selectName: 'Select name...',
    selectReason: 'Select reason...', hoursWorked: 'Hours Worked', addDetails: 'Add details...',
    notSet: 'not set', setToday: 'set today', endOfDay: 'end of day', transactions: 'transactions',
    entries: 'entries', fromSquare: 'from square pos', recentCashOut: 'Recent Cash Out', viewAll: 'View All',
    sales: 'Sales', posIn: 'POS Cash In', posOut: 'POS Cash Out', totalOut: 'Total Out',
    noEntriesFound: 'No entries found.', noSalesFound: 'No sales found.', noPOSFound: 'No POS events found.',
    noTimecardFound: 'No timecard data found for this period.', cashOutHistory: 'Cash Out History',
    salesHistory: 'Sales History', posHistory: 'POS Cash In/Out History', cash: 'Cash', card: 'Card',
    total: 'Total', date: 'Date', time: 'Time', hours: 'Hours', pay: 'Pay', type: 'Type',
    payIn: 'Pay In', payOut: 'Pay Out', dailySales: 'Daily Sales', dailyBreakdown: 'Daily Breakdown',
    cashOutEntries: 'Cash Out Entries', drawer: 'Drawer', out: 'Out', over: 'Over', short: 'Short',
    match: 'Match', days: 'Days', noEntriesToday: 'No entries today.', openingDollar: 'Opening ($)',
    closingDollar: 'Closing ($)', salesLabel: 'Sales:', cashOutLabel: 'Cash Out:', posOutLabel: 'POS Out:',
    whoLabel: 'Who', amountLabel: 'Amount', reasonLabel: 'Reason', noteLabel: 'Note',
    tapHistory: 'tap for history ›', remove: '✕', confirm: 'Confirm Cash Out',
    builtByFull: 'Built by', contactMe: 'Need help? Contact me',
  },
  ar: {
    title: Choices For You', sub: 'مدير الأعمال', enterPin: 'أدخل رقم التعريف الشخصي لتسجيل الدخول',
    today: 'اليوم', cashOut: 'صرف نقدي', employees: 'الموظفون', reports: 'التقارير',
    liveToday: '● مباشر · اليوم', expectedDrawer: 'المتوقع في الصندوق',
    cashSales: 'مبيعات نقدية', cardSales: 'مبيعات بطاقة', manualOut: 'صرف يدوي',
    posInOut: 'نقدي داخل/خارج', opening: 'الافتتاح', closing: 'الإغلاق', actualDollar: 'الفعلي $',
    setOpening: 'تعيين الافتتاح', setClosing: 'تعيين الإغلاق', todayCashOut: 'الصرف النقدي اليوم',
    fullHistory: 'السجل الكامل', noEntries: 'لا توجد مدخلات اليوم.', signOut: 'تسجيل الخروج',
    reportCashOut: 'تسجيل صرف نقدي', newEntry: 'مدخل جديد', who: 'من', amount: 'المبلغ ($)',
    reason: 'السبب', note: 'ملاحظة (اختياري)', reviewSubmit: 'مراجعة وإرسال',
    empHours: 'ساعات الموظفين والأجر', loadHours: 'تحميل الساعات', totalHours: 'إجمالي الساعات',
    totalPay: 'إجمالي الأجر', reportsHistory: 'التقارير والسجل', pullReport: 'عرض التقرير',
    exportPDF: '📄 تصدير PDF', builtBy: 'بناء بواسطة', needHelp: 'تحتاج مساعدة؟ تواصل معي',
    todayPL: 'ربح وخسارة اليوم', lowDrawerAlert: 'تنبيه: رصيد منخفض', lowDrawerSub: 'المتوقع في الصندوق أقل من 100$',
    loading: 'جار التحميل...', confirmCashOut: 'تأكيد الصرف النقدي', reviewBefore: 'راجع قبل الإرسال.',
    cancel: 'إلغاء', submit: 'إرسال', done: 'تم!', close: 'إغلاق', selectName: 'اختر الاسم...',
    selectReason: 'اختر السبب...', hoursWorked: 'ساعات العمل', addDetails: 'أضف تفاصيل...',
    notSet: 'غير محدد', setToday: 'محدد اليوم', endOfDay: 'نهاية اليوم', transactions: 'معاملات',
    entries: 'مدخلات', fromSquare: 'من نقطة البيع', recentCashOut: 'الصرف الأخير', viewAll: 'عرض الكل',
    sales: 'المبيعات', posIn: 'نقدي داخل', posOut: 'نقدي خارج', totalOut: 'إجمالي الصرف',
    noEntriesFound: 'لا توجد مدخلات.', noSalesFound: 'لا توجد مبيعات.', noPOSFound: 'لا توجد أحداث نقدية.',
    noTimecardFound: 'لا توجد بيانات دوام لهذه الفترة.', cashOutHistory: 'سجل الصرف النقدي',
    salesHistory: 'سجل المبيعات', posHistory: 'سجل النقدي داخل/خارج', cash: 'نقدي', card: 'بطاقة',
    total: 'الإجمالي', date: 'التاريخ', time: 'الوقت', hours: 'الساعات', pay: 'الأجر', type: 'النوع',
    payIn: 'إيداع', payOut: 'سحب', dailySales: 'المبيعات اليومية', dailyBreakdown: 'التفصيل اليومي',
    cashOutEntries: 'مدخلات الصرف', drawer: 'الصندوق', out: 'خارج', over: 'زيادة', short: 'نقص',
    match: 'مطابق', days: 'أيام', noEntriesToday: 'لا مدخلات اليوم.', openingDollar: 'الافتتاح ($)',
    closingDollar: 'الإغلاق ($)', salesLabel: 'المبيعات:', cashOutLabel: 'الصرف:', posOutLabel: 'خارج POS:',
    whoLabel: 'من', amountLabel: 'المبلغ', reasonLabel: 'السبب', noteLabel: 'ملاحظة',
    tapHistory: 'اضغط للسجل ›', remove: '✕', confirm: 'تأكيد الصرف النقدي',
    builtByFull: ' بواسطة', contactMe: 'تحتاج مساعدة؟ تواصل معي',
  }
};

const PINS = {
  Abdo:  { pin: '5436', role: 'admin' },
  Fares: { pin: '1503', role: 'admin' },
  Assim: { pin: '1738', role: 'team' },
  Kamal: { pin: '9990', role: 'team' },
};

const PAY_RATES = { Abdo: 20, Fares: 20, Assim: 14, Kamal: 11 };

function fmt(n) {
  if (n == null || isNaN(n)) return '—';
  return '$' + parseFloat(n).toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}
function fmtH(h) {
  if (h == null || isNaN(h)) return '—';
  const hrs = Math.floor(h), mins = Math.round((h - hrs) * 60);
  return `${hrs}h ${mins}m`;
}
function callScript(action, params = {}) {
  const url = new URL('/api/proxy', window.location.origin);
  url.searchParams.set('action', action);
  Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, String(v)));
  return fetch(url.toString()).then(r => r.json());
}
function today() { return new Date().toISOString().split('T')[0]; }
function weekStart() { const d = new Date(); d.setDate(d.getDate() - d.getDay()); return d.toISOString().split('T')[0]; }
function daysAgo(n) { const d = new Date(); d.setDate(d.getDate() - n); return d.toISOString().split('T')[0]; }

function MC({ label, value, sub, c1, c2, onClick, tapLabel }) {
  return (
    <div onClick={onClick} style={{ background: c1, border: `1px solid ${c2}`, borderRadius: 16, padding: '16px 14px', cursor: onClick ? 'pointer' : 'default' }}>
      <div style={{ fontSize: 11, fontWeight: 500, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 6, color: c2 }}>{label}</div>
      <div style={{ fontSize: 24, fontWeight: 700, lineHeight: 1.2, color: c2 }}>{value}</div>
      <div style={{ fontSize: 11, color: '#888', marginTop: 5 }}>{sub}</div>
      {onClick && <div style={{ fontSize: 10, color: c2, opacity: .6, marginTop: 6 }}>{tapLabel || 'tap for history ›'}</div>}
    </div>
  );
}

function RamLoader() {
  const [prog, setProg] = useState(0);
  const dirRef = useRef(1), progRef = useRef(0), rafRef = useRef(null);
  useEffect(() => {
    const animate = () => {
      progRef.current += dirRef.current * 0.6;
      if (progRef.current >= 95) dirRef.current = -1;
      if (progRef.current <= 5)  dirRef.current =  1;
      setProg(progRef.current);
      rafRef.current = requestAnimationFrame(animate);
    };
    rafRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(rafRef.current);
  }, []);
  const glowOpacity = 0.4 + (prog / 100) * 0.6;
  return (
    <div style={{ position: 'relative', width: 120, height: 120 }}>
      <img src="/logo.png" alt="" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'contain', opacity: 0.12, filter: 'brightness(0) invert(1)' }} />
      <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', clipPath: `inset(${100 - prog}% 0 0 0)` }}>
        <img src="/logo.png" alt="" style={{ width: '100%', height: '100%', objectFit: 'contain', filter: `brightness(0) invert(1) sepia(1) saturate(3) hue-rotate(5deg) brightness(${glowOpacity + 0.5})` }} />
      </div>
      <div style={{ position: 'absolute', top: `${100 - prog - 4}%`, left: 0, right: 0, height: '10%', background: 'linear-gradient(to bottom, transparent, rgba(212,168,67,0.5), transparent)', pointerEvents: 'none' }} />
    </div>
  );
}

function Sheet({ title, onClose, closeLabel, children }) {
  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.85)', zIndex: 100, display: 'flex', flexDirection: 'column', justifyContent: 'flex-end' }} onClick={e => e.target === e.currentTarget && onClose()}>
      <div style={{ background: '#1a1a20', border: '1px solid rgba(255,255,255,.08)', borderRadius: '24px 24px 0 0', maxHeight: '90vh', display: 'flex', flexDirection: 'column' }}>
        <div style={{ padding: '12px 20px 0', flexShrink: 0 }}>
          <div style={{ width: 40, height: 4, background: '#2a2a35', borderRadius: 2, margin: '0 auto 14px' }} />
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
            <div style={{ fontSize: 18, fontWeight: 700 }}>{title}</div>
            <button onClick={onClose} style={{ background: '#22222a', border: 'none', borderRadius: 8, color: '#888', cursor: 'pointer', fontSize: 14, padding: '6px 12px' }}>{closeLabel || 'Close'}</button>
          </div>
        </div>
        <div style={{ overflowY: 'auto', padding: '0 20px 40px', flex: 1 }}>{children}</div>
      </div>
    </div>
  );
}

function DateRange({ start, end, onStart, onEnd, presets = true, lang = 'en' }) {
  const C = { surf2: '#22222a', bord: 'rgba(255,255,255,.08)', muted: '#888' };
  const inp = { background: C.surf2, border: `1px solid ${C.bord}`, borderRadius: 10, color: '#fff', fontSize: 15, padding: '10px 12px', width: '100%', outline: 'none', fontFamily: 'inherit', appearance: 'none' };
  const labels = lang === 'ar'
    ? [['اليوم', today(), today()],['7 أيام', daysAgo(6), today()],['30 يوم', daysAgo(29), today()],['هذا الأسبوع', weekStart(), today()]]
    : [['Today', today(), today()],['7 days', daysAgo(6), today()],['30 days', daysAgo(29), today()],['This week', weekStart(), today()]];
  return (
    <div style={{ marginBottom: 16 }}>
      {presets && (
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 10 }}>
          {labels.map(([l,s,e]) => (
            <button key={l} onClick={() => { onStart(s); onEnd(e); }} style={{ background: '#22222a', border: '1px solid rgba(255,255,255,.08)', borderRadius: 20, color: '#888', cursor: 'pointer', fontSize: 12, padding: '5px 12px', fontFamily: 'inherit' }}>{l}</button>
          ))}
        </div>
      )}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
        <input style={inp} type="date" value={start} onChange={e => onStart(e.target.value)} />
        <input style={inp} type="date" value={end} onChange={e => onEnd(e.target.value)} />
      </div>
    </div>
  );
}

export default function App() {
  const [lang, setLang] = useState('en');
  const t = LANG[lang];
  const isAr = lang === 'ar';

  const C = {
    bg: '#0f0f12', surf: '#1a1a20', surf2: '#22222a',
    bord: 'rgba(255,255,255,.08)', gold: '#d4a843',
    green: '#2db67d', red: '#e05252', blue: '#5b8af0',
    purple: '#a855f7', muted: '#888',
  };
  const inp = { background: C.surf2, border: `1px solid ${C.bord}`, borderRadius: 12, color: '#fff', fontSize: 16, padding: '14px 16px', width: '100%', outline: 'none', fontFamily: 'inherit', appearance: 'none', WebkitAppearance: 'none' };
  const btn = { display: 'block', width: '100%', background: C.gold, border: 'none', borderRadius: 14, color: '#0f0f12', fontSize: 16, fontWeight: 700, padding: 16, textAlign: 'center', cursor: 'pointer', fontFamily: 'inherit' };
  const btnG = { ...btn, background: C.surf2, border: `1px solid ${C.bord}`, color: '#fff', fontWeight: 500, padding: 14 };
  const card = { background: C.surf, border: `1px solid ${C.bord}`, borderRadius: 18, padding: 18, display: 'flex', flexDirection: 'column', gap: 14 };
  const fld = { display: 'flex', flexDirection: 'column', gap: 7 };
  const flbl = { fontSize: 11, color: C.muted, textTransform: 'uppercase', letterSpacing: 1.5 };
  const thStyle = { background: C.surf2, color: C.muted, fontSize: 11, letterSpacing: 1, padding: '10px 12px', textAlign: 'left', textTransform: 'uppercase', borderBottom: `1px solid ${C.bord}`, whiteSpace: 'nowrap' };
  const tdStyle = { padding: '11px 12px', borderBottom: `1px solid rgba(255,255,255,.05)`, fontSize: 14 };

  const [user, setUser] = useState(null);
  const [page, setPage] = useState('today');
  const [pin, setPin] = useState('');
  const [loginErr, setLoginErr] = useState('');
  const [dash, setDash] = useState(null);
  const [dashLoading, setDashLoading] = useState(true);
  const [actual, setActual] = useState('');
  const [openingAmt, setOpeningAmt] = useState('');
  const [closingAmt, setClosingAmt] = useState('');
  const [outWho, setOutWho] = useState('');
  const [outAmt, setOutAmt] = useState('');
  const [outReason, setOutReason] = useState('');
  const [outHours, setOutHours] = useState('');
  const [outNote, setOutNote] = useState('');
  const [confirmSheet, setConfirmSheet] = useState(false);
  const [successSheet, setSuccessSheet] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [pending, setPending] = useState(null);
  const [toast, setToast] = useState(null);
  const [activeSheet, setActiveSheet] = useState(null);
  const [sheetData, setSheetData] = useState(null);
  const [sheetLoading, setSheetLoading] = useState(false);
  const [sheetStart, setSheetStart] = useState(daysAgo(6));
  const [sheetEnd, setSheetEnd] = useState(today());
  const [rptStart, setRptStart] = useState(daysAgo(6));
  const [rptEnd, setRptEnd] = useState(today());
  const [rptData, setRptData] = useState(null);
  const [rptLoading, setRptLoading] = useState(false);
  const [empStart, setEmpStart] = useState(weekStart());
  const [empEnd, setEmpEnd] = useState(today());
  const [empData, setEmpData] = useState(null);
  const [empLoading, setEmpLoading] = useState(false);
  const [pdfLoading, setPdfLoading] = useState(false);
  const lowDrawerThreshold = 100;

  const showToast = (msg, type = 'ok') => { setToast({ msg, type }); setTimeout(() => setToast(null), 3000); };

  const loadDash = useCallback(() => {
    setDashLoading(true);
    callScript('getDashboard')
      .then(d => { setDash(d); setDashLoading(false); })
      .catch(() => { showToast('Load error', 'err'); setDashLoading(false); });
  }, []);

  useEffect(() => {
    if (user) { loadDash(); const timer = setInterval(loadDash, 5*60*1000); return () => clearInterval(timer); }
  }, [user, loadDash]);

  useEffect(() => {
  try {
    const s = sessionStorage.getItem('cashUser');
    if (s) {
      const u = JSON.parse(s);
      setUser(u);
      if (u.name === 'Fares') setFaresVideo(true);
    }
  } catch(e) {}
}, []);

  const openDetailSheet = (type) => {
    setActiveSheet(type);
    setSheetData(null);
    setSheetLoading(true);
    const action = type === 'cashout' ? 'getCashOutHistory' : type === 'sales' ? 'getSalesHistory' : type === 'pos' ? 'getPOSHistory' : 'getCashOutHistory';
    callScript(action, { start: sheetStart, end: sheetEnd })
      .then(d => { setSheetData(d); setSheetLoading(false); })
      .catch(() => { showToast('Error loading', 'err'); setSheetLoading(false); });
  };

  const reloadSheet = (type, start, end) => {
    setSheetData(null); setSheetLoading(true);
    const action = type === 'cashout' ? 'getCashOutHistory' : type === 'sales' ? 'getSalesHistory' : 'getPOSHistory';
    callScript(action, { start, end })
      .then(d => { setSheetData(d); setSheetLoading(false); })
      .catch(() => { showToast('Error loading', 'err'); setSheetLoading(false); });
  };

  const loadReport = () => {
    setRptLoading(true); setRptData(null);
    callScript('getReport', { start: rptStart, end: rptEnd })
      .then(d => { setRptData(d); setRptLoading(false); })
      .catch(() => { showToast('Error', 'err'); setRptLoading(false); });
  };

  const loadEmployees = () => {
    setEmpLoading(true); setEmpData(null);
    callScript('getEmployeeHours', { start: empStart, end: empEnd })
      .then(d => { setEmpData(d); setEmpLoading(false); })
      .catch(() => { showToast('Error', 'err'); setEmpLoading(false); });
  };

  useEffect(() => { if (page === 'employees' && !empData) loadEmployees(); }, [page]);

  const addPin = (k) => {
    if (pin.length >= 4) return;
    const np = pin + k; setPin(np);
    if (np.length === 4) setTimeout(() => doLogin(np), 180);
  };
  const doLogin = (p) => {
    const pval = p || pin;
    if (pval.length < 4) { setLoginErr(isAr ? 'أدخل رقم PIN المكون من 4 أرقام.' : 'Enter your 4-digit PIN.'); return; }
    const match = Object.entries(PINS).find(([, v]) => v.pin === pval);
    if (!match) { setPinAlert(true); setPin(''); return; }
    const userData = { name: match[0], role: match[1].role };
sessionStorage.setItem('cashUser', JSON.stringify(userData));
setUser(userData); setLoginErr(''); setPin('');
if (match[0] === 'Fares') setFaresVideo(true);
};
  const logout = () => { sessionStorage.removeItem('cashUser'); setUser(null); setPin(''); setPage('today'); setDash(null); };

  const expectedInDrawer = dash ? (dash.openingAmount + dash.cashIn + (dash.drawerCashIn||0) - dash.cashOut - (dash.drawerCashOut||0)) : 0;
  const diff = actual !== '' && !isNaN(parseFloat(actual)) ? parseFloat(actual) - expectedInDrawer : null;
  const lowDrawer = dash && expectedInDrawer < lowDrawerThreshold && expectedInDrawer > 0;

  const saveDrawer = (type) => {
    const val = parseFloat(type === 'opening' ? openingAmt : closingAmt);
    if (!val || val <= 0) { showToast(isAr ? 'أدخل مبلغاً صحيحاً.' : 'Enter a valid amount.', 'err'); return; }
    callScript('setDrawer', { type, amount: val, who: user.name })
      .then(() => { showToast(`${type === 'opening' ? t.opening : t.closing} → ${fmt(val)}`); loadDash(); })
      .catch(() => showToast('Error', 'err'));
  };
  const confirmOut = () => {
    if (!outWho) { showToast(isAr ? 'اختر الاسم.' : 'Select who.', 'err'); return; }
    if (!outAmt || parseFloat(outAmt) <= 0) { showToast(isAr ? 'أدخل مبلغاً صحيحاً.' : 'Enter a valid amount.', 'err'); return; }
    if (!outReason) { showToast(isAr ? 'اختر السبب.' : 'Select a reason.', 'err'); return; }
    if (outReason === 'Employee Pay' && !outHours) { showToast(isAr ? 'أدخل ساعات العمل.' : 'Enter hours worked.', 'err'); return; }
    let note = outNote;
    if (outReason === 'Employee Pay' && outHours) note = `${outHours} hrs${outNote ? ' · ' + outNote : ''}`;
    setPending({ who: outWho, amt: parseFloat(outAmt), reason: outReason, note });
    setConfirmSheet(true);
  };
  const submitOut = () => {
    setConfirmSheet(false); if (!pending) return;
    callScript('logCashOut', { who: pending.who, amount: pending.amt, reason: pending.reason, note: pending.note || '' })
      .then(() => {
        setSuccessMsg(`${fmt(pending.amt)} — ${pending.who} (${pending.reason})`);
        setSuccessSheet(true);
        setOutWho(''); setOutAmt(''); setOutReason(''); setOutHours(''); setOutNote('');
        setPending(null); loadDash();
      })
      .catch(() => showToast('Error submitting.', 'err'));
  };
  const delEntry = (rowIndex) => {
    if (!confirm(isAr ? 'حذف هذا المدخل؟' : 'Remove this entry?')) return;
    callScript('deleteCashOut', { rowIndex })
      .then(() => { showToast(isAr ? 'تم الحذف.' : 'Removed.'); loadDash(); if (activeSheet === 'cashout') reloadSheet('cashout', sheetStart, sheetEnd); })
      .catch(() => showToast('Error', 'err'));
  };

  // ── LOGIN ──
  if (!user) return (
    <div dir={isAr ? 'rtl' : 'ltr'} style={{ margin: 0, background: C.bg, color: '#fff', fontFamily: isAr ? "'Noto Sans Arabic', Arial, sans-serif" : "'Inter',-apple-system,sans-serif", minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px 20px' }}>
      <div style={{ background: C.surf, border: `1px solid ${C.bord}`, borderRadius: 24, padding: '32px 20px', width: '100%', maxWidth: 400 }}>
        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <img src="/logo.png" alt="Logo" style={{ width: 64, height: 64, objectFit: 'contain', background: '#111', borderRadius: 16, padding: 8, marginBottom: 14 }} />
          <div style={{ fontSize: 26, fontWeight: 700, color: C.gold }}>{t.title}</div>
          <div style={{ width: 36, height: 2, background: C.gold, margin: '8px auto', borderRadius: 2, opacity: .5 }} />
          <div style={{ fontSize: 11, color: C.muted, letterSpacing: 3, textTransform: 'uppercase' }}>{t.sub}</div>
        </div>
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 12 }}>
          <button onClick={() => setLang(l => l === 'en' ? 'ar' : 'en')} style={{ background: 'none', border: `1px solid ${C.bord}`, color: C.muted, fontSize: 13, padding: '5px 10px', borderRadius: 8, cursor: 'pointer', fontFamily: 'inherit' }}>{lang === 'en' ? 'ع' : 'EN'}</button>
        </div>
        <div style={{ fontSize: 14, color: C.muted, textAlign: 'center', marginBottom: 24 }}>{t.enterPin}</div>
        <div style={{ display: 'flex', gap: 16, justifyContent: 'center', marginBottom: 24 }}>
          {[0,1,2,3].map(i => <div key={i} style={{ width: 16, height: 16, borderRadius: '50%', background: i < pin.length ? C.gold : '#2a2a35', border: `1px solid ${i < pin.length ? C.gold : '#3a3a48'}`, transition: 'all .15s' }} />)}
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 10, marginBottom: 14 }}>
          {['1','2','3','4','5','6','7','8','9'].map(k => (
            <button key={k} onClick={() => addPin(k)} style={{ background: C.surf2, border: `1px solid ${C.bord}`, borderRadius: 14, color: '#fff', fontSize: 24, fontWeight: 600, padding: '18px 10px', cursor: 'pointer', fontFamily: 'inherit' }}>{k}</button>
          ))}
          <button onClick={() => setPin(p => p.slice(0,-1))} style={{ background: C.surf2, border: `1px solid ${C.bord}`, borderRadius: 14, color: C.muted, fontSize: 18, padding: '18px 10px', cursor: 'pointer', fontFamily: 'inherit' }}>⌫</button>
          <button onClick={() => addPin('0')} style={{ background: C.surf2, border: `1px solid ${C.bord}`, borderRadius: 14, color: '#fff', fontSize: 24, fontWeight: 600, padding: '18px 10px', cursor: 'pointer', fontFamily: 'inherit' }}>0</button>
          <button onClick={() => doLogin()} style={{ background: C.surf2, border: `1px solid ${C.bord}`, borderRadius: 14, color: C.gold, fontSize: 18, padding: '18px 10px', cursor: 'pointer', fontFamily: 'inherit' }}>✓</button>
        </div>
        <div style={{ color: C.red, fontSize: 13, textAlign: 'center', minHeight: 20, marginBottom: 6 }}>{loginErr}</div>
        <div style={{ textAlign: 'center', marginTop: 20, paddingTop: 16, borderTop: `1px solid ${C.bord}`, fontSize: 12, color: C.muted, lineHeight: 1.8 }}>
          {t.builtByFull} <strong style={{ color: C.gold }}>{isAr ? 'عبده الاسعدي' : 'Abdo Alasaadi'}</strong><br />{t.contactMe}
        </div>
      </div>
    </div>
  );

  const tabs = user.role === 'admin'
    ? [['today','🏠', t.today],['cashout','💸', t.cashOut],['employees','👥', t.employees],['reports','📊', t.reports]]
    : [['today','🏠', t.today],['cashout','💸', t.cashOut]];

  return (
    <div dir={isAr ? 'rtl' : 'ltr'} style={{ margin: 0, background: C.bg, color: '#fff', fontFamily: isAr ? "'Noto Sans Arabic', Arial, sans-serif" : "'Inter',-apple-system,sans-serif", minHeight: '100vh', fontSize: 16 }}>

      {/* TOPBAR */}
      <div style={{ background: C.surf, borderBottom: `1px solid ${C.bord}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 16px', height: 56, position: 'sticky', top: 0, zIndex: 40 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <img src="/logo.png" alt="Logo" style={{ width: 32, height: 32, objectFit: 'contain', background: '#111', borderRadius: 8, padding: 3 }} />
          <div>
            <div style={{ fontSize: 15, fontWeight: 700, color: C.gold }}>{t.title}</div>
            <div style={{ fontSize: 9, color: C.muted, letterSpacing: 2, textTransform: 'uppercase' }}>{t.sub}</div>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ fontSize: 12, color: C.muted, background: C.surf2, border: `1px solid ${C.bord}`, borderRadius: 20, padding: '5px 12px' }}>{user.name}{user.role === 'admin' ? ' ★' : ''}</div>
          <button onClick={() => setLang(l => l === 'en' ? 'ar' : 'en')} style={{ background: 'none', border: `1px solid ${C.bord}`, color: C.muted, fontSize: 13, padding: '6px 10px', borderRadius: 8, cursor: 'pointer', fontFamily: 'inherit' }}>{lang === 'en' ? 'ع' : 'EN'}</button>
          <button onClick={logout} style={{ background: 'none', border: `1px solid ${C.bord}`, color: C.muted, fontSize: 13, padding: '6px 12px', borderRadius: 8, cursor: 'pointer', fontFamily: 'inherit' }}>{t.signOut}</button>
        </div>
      </div>

      {/* ── TODAY ── */}
      {page === 'today' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12, padding: '14px 14px 90px' }}>
          <div style={{ fontSize: 12, color: C.muted, letterSpacing: 2, textTransform: 'uppercase' }}>{t.liveToday}</div>

          {dashLoading ? (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16, padding: '60px 20px' }}>
              <RamLoader />
              <div style={{ fontSize: 11, color: C.muted, letterSpacing: 2, textTransform: 'uppercase' }}>{t.loading}</div>
            </div>
          ) : (
            <>
              {lowDrawer && (
                <div style={{ background: 'rgba(255,82,82,.15)', border: '1px solid rgba(255,82,82,.4)', borderRadius: 12, padding: '12px 16px', display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{ fontSize: 20 }}>⚠️</div>
                  <div>
                    <div style={{ fontWeight: 700, color: C.red, fontSize: 14 }}>{t.lowDrawerAlert}</div>
                    <div style={{ fontSize: 12, color: C.muted, marginTop: 2 }}>{t.lowDrawerSub}</div>
                  </div>
                </div>
              )}

              <div style={{ position: 'sticky', top: 56, zIndex: 39, background: C.bg, paddingBottom: 4 }}>
                <div style={{ background: 'linear-gradient(135deg, rgba(212,168,67,.2), rgba(212,168,67,.05))', border: '1px solid rgba(212,168,67,.4)', borderRadius: 14, padding: '12px 18px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div>
                    <div style={{ fontSize: 10, color: C.gold, textTransform: 'uppercase', letterSpacing: 2, marginBottom: 3 }}>{t.expectedDrawer}</div>
                    <div style={{ fontSize: 28, fontWeight: 700, color: C.gold, lineHeight: 1 }}>{fmt(expectedInDrawer)}</div>
                  </div>
                  <div style={{ textAlign: isAr ? 'left' : 'right' }}>
                    <div style={{ fontSize: 10, color: C.muted, marginBottom: 4 }}>{fmt(dash?.openingAmount)} + {fmt(dash?.cashIn)} + {fmt(dash?.drawerCashIn||0)} − {fmt(dash?.cashOut)} − {fmt(dash?.drawerCashOut||0)}</div>
                    {diff !== null && (
                      <div style={{ fontSize: 13, fontWeight: 700, padding: '5px 10px', borderRadius: 8, background: Math.abs(diff) < 0.01 ? 'rgba(45,182,125,.2)' : diff > 0 ? 'rgba(255,209,102,.2)' : 'rgba(224,82,82,.2)', color: Math.abs(diff) < 0.01 ? C.green : diff > 0 ? '#ffd166' : C.red }}>
                        {Math.abs(diff) < 0.01 ? `✓ ${t.match}` : diff > 0 ? `+${fmt(diff)} ${t.over}` : `${fmt(diff)} ${t.short}`}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div style={{ background: dash?.dailyPL >= 0 ? 'rgba(45,182,125,.12)' : 'rgba(255,82,82,.12)', border: `1px solid ${dash?.dailyPL >= 0 ? 'rgba(45,182,125,.3)' : 'rgba(255,82,82,.3)'}`, borderRadius: 14, padding: '14px 18px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div>
                  <div style={{ fontSize: 10, color: C.muted, textTransform: 'uppercase', letterSpacing: 2, marginBottom: 4 }}>{t.todayPL}</div>
                  <div style={{ fontSize: 26, fontWeight: 700, color: dash?.dailyPL >= 0 ? C.green : C.red }}>{fmt(dash?.dailyPL)}</div>
                </div>
                <div style={{ textAlign: isAr ? 'left' : 'right', fontSize: 12, color: C.muted }}>
                  <div>{t.salesLabel} {fmt(dash?.totalSales)}</div>
                  <div>{t.cashOutLabel} −{fmt(dash?.cashOut)}</div>
                  <div>{t.posOutLabel} −{fmt(dash?.drawerCashOut||0)}</div>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                <MC label={t.cashSales} value={fmt(dash?.cashIn)} sub={`${dash?.cashInTxn||0} ${t.transactions}`} c1="rgba(45,182,125,.15)" c2="#2db67d" onClick={() => openDetailSheet('sales')} tapLabel={t.tapHistory} />
                <MC label={t.cardSales} value={fmt(dash?.cardIn)} sub={`${dash?.cardInTxn||0} ${t.transactions}`} c1="rgba(91,138,240,.15)" c2="#5b8af0" onClick={() => openDetailSheet('sales')} tapLabel={t.tapHistory} />
                <MC label={t.manualOut} value={fmt(dash?.cashOut)} sub={`${dash?.cashOutEntries?.length||0} ${t.entries}`} c1="rgba(224,82,82,.15)" c2="#e05252" onClick={() => openDetailSheet('cashout')} tapLabel={t.tapHistory} />
                <MC label={t.posInOut} value={`+${fmt(dash?.drawerCashIn||0)} / −${fmt(dash?.drawerCashOut||0)}`} sub={t.fromSquare} c1="rgba(168,85,247,.15)" c2="#a855f7" onClick={() => openDetailSheet('pos')} tapLabel={t.tapHistory} />
                <MC label={t.opening} value={fmt(dash?.openingAmount)} sub={dash?.openingAmount > 0 ? t.setToday : t.notSet} c1="rgba(91,138,240,.15)" c2="#5b8af0" />
                <MC label={t.closing} value={dash?.closingAmount > 0 ? fmt(dash.closingAmount) : '—'} sub={t.endOfDay} c1="rgba(212,168,67,.15)" c2="#d4a843" />
              </div>

              <div style={card}>
                <div style={{ textAlign: 'center', background: C.surf2, borderRadius: 14, padding: '18px 12px' }}>
                  <div style={{ fontSize: 11, color: C.muted, textTransform: 'uppercase', letterSpacing: 2, marginBottom: 8 }}>{t.expectedDrawer}</div>
                  <div style={{ fontSize: 40, fontWeight: 700, color: C.gold, lineHeight: 1 }}>{fmt(expectedInDrawer)}</div>
                  <div style={{ fontSize: 11, color: C.muted, marginTop: 6 }}>{fmt(dash?.openingAmount)} + {fmt(dash?.cashIn)} + {fmt(dash?.drawerCashIn||0)} − {fmt(dash?.cashOut)} − {fmt(dash?.drawerCashOut||0)}</div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <span style={{ fontSize: 11, color: C.muted, textTransform: 'uppercase', letterSpacing: 1, whiteSpace: 'nowrap' }}>{t.actualDollar}</span>
                  <input style={{ flex: 1, minWidth: 0, background: C.surf2, border: `1px solid ${C.bord}`, borderRadius: 10, color: '#fff', fontSize: 18, padding: '12px 14px', outline: 'none', fontFamily: 'inherit' }} type="number" placeholder="0.00" inputMode="decimal" value={actual} onChange={e => setActual(e.target.value)} />
                  <div style={{ fontSize: 13, fontWeight: 700, padding: '9px 12px', borderRadius: 10, whiteSpace: 'nowrap', flexShrink: 0, background: diff === null ? C.surf2 : Math.abs(diff) < 0.01 ? 'rgba(45,182,125,.2)' : diff > 0 ? 'rgba(255,209,102,.2)' : 'rgba(224,82,82,.2)', color: diff === null ? C.muted : Math.abs(diff) < 0.01 ? C.green : diff > 0 ? '#ffd166' : C.red }}>
                    {diff === null ? '—' : Math.abs(diff) < 0.01 ? `✓ ${t.match}` : diff > 0 ? `+${fmt(diff)}` : fmt(diff)}
                  </div>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                  <div style={fld}><label style={flbl}>{t.openingDollar}</label><input style={inp} type="number" placeholder="200.00" inputMode="decimal" value={openingAmt} onChange={e => setOpeningAmt(e.target.value)} /></div>
                  <div style={fld}><label style={flbl}>{t.closingDollar}</label><input style={inp} type="number" placeholder="850.00" inputMode="decimal" value={closingAmt} onChange={e => setClosingAmt(e.target.value)} /></div>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                  <button style={btnG} onClick={() => saveDrawer('opening')}>{t.setOpening}</button>
                  <button style={btnG} onClick={() => saveDrawer('closing')}>{t.setClosing}</button>
                </div>
              </div>

              <div style={card}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ fontSize: 18, fontWeight: 700 }}>{t.todayCashOut}</div>
                  <button onClick={() => openDetailSheet('cashout')} style={{ background: 'none', border: `1px solid ${C.bord}`, borderRadius: 8, color: C.muted, cursor: 'pointer', fontSize: 12, padding: '5px 10px', fontFamily: 'inherit' }}>{t.fullHistory}</button>
                </div>
                {!dash?.cashOutEntries?.length
                  ? <div style={{ textAlign: 'center', padding: 20, color: C.muted, fontSize: 14 }}>{t.noEntries}</div>
                  : <div style={{ overflowX: 'auto' }}>
                      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14, minWidth: 300 }}>
                        <thead><tr>{[t.time, t.who, t.amount, t.reason, user.role==='admin'?'':null].filter(h=>h!==null).map((h,i)=><th key={i} style={thStyle}>{h}</th>)}</tr></thead>
                        <tbody>{dash.cashOutEntries.map((e,i)=>(
                          <tr key={i}>
                            <td style={{...tdStyle,color:C.muted,fontSize:12}}>{e.time}</td>
                            <td style={tdStyle}>{e.who}</td>
                            <td style={{...tdStyle,color:C.red,fontWeight:600}}>{fmt(e.amount)}</td>
                            <td style={{...tdStyle,color:C.muted}}>{e.reason}</td>
                            {user.role==='admin'&&<td style={tdStyle}><button onClick={()=>delEntry(e.rowIndex)} style={{background:'none',border:`1px solid ${C.bord}`,borderRadius:6,color:C.muted,cursor:'pointer',fontSize:12,padding:'4px 8px'}}>{t.remove}</button></td>}
                          </tr>
                        ))}</tbody>
                      </table>
                    </div>}
              </div>

              <div style={{ textAlign: 'center', padding: 14, borderTop: `1px solid ${C.bord}`, fontSize: 12, color: C.muted, lineHeight: 1.8 }}>
                {t.builtByFull} <strong style={{ color: C.gold }}>{isAr ? 'عبده الاسعدي' : 'Abdo Alasaadi'}</strong><br />{t.contactMe}
              </div>
            </>
          )}
        </div>
      )}

      {/* ── CASH OUT ── */}
      {page === 'cashout' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12, padding: '14px 14px 90px' }}>
          <div style={{ fontSize: 12, color: C.muted, letterSpacing: 2, textTransform: 'uppercase' }}>{t.reportCashOut}</div>
          <div style={card}>
            <div style={{ fontSize: 18, fontWeight: 700 }}>{t.newEntry}</div>
            <div style={fld}><label style={flbl}>{t.who}</label>
              <select style={inp} value={outWho} onChange={e => setOutWho(e.target.value)}>
                <option value="">{t.selectName}</option>
                <option>Abdo</option><option>Fares</option><option>Assim</option><option>Kamal</option>
              </select>
            </div>
            <div style={fld}><label style={flbl}>{t.amount}</label><input style={inp} type="number" placeholder="0.00" inputMode="decimal" value={outAmt} onChange={e => setOutAmt(e.target.value)} /></div>
            <div style={fld}><label style={flbl}>{t.reason}</label>
              <select style={inp} value={outReason} onChange={e => { setOutReason(e.target.value); if (e.target.value !== 'Employee Pay') setOutHours(''); }}>
                <option value="">{t.selectReason}</option>
                <option>Bank Deposit</option><option>Refund</option><option>Supplier Payment</option>
                <option>Store Expense</option><option>Employee Pay</option><option>Adjustment</option><option>Other</option>
              </select>
            </div>
            {outReason === 'Employee Pay' && <div style={fld}><label style={flbl}>{t.hoursWorked}</label><input style={inp} type="number" placeholder="e.g. 8" inputMode="decimal" value={outHours} onChange={e => setOutHours(e.target.value)} /></div>}
            <div style={fld}><label style={flbl}>{t.note}</label><input style={inp} type="text" placeholder={t.addDetails} value={outNote} onChange={e => setOutNote(e.target.value)} /></div>
            <button style={btn} onClick={confirmOut}>{t.reviewSubmit}</button>
          </div>

          <div style={card}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ fontSize: 16, fontWeight: 700 }}>{t.recentCashOut}</div>
              <button onClick={() => openDetailSheet('cashout')} style={{ background: 'none', border: `1px solid ${C.bord}`, borderRadius: 8, color: C.muted, cursor: 'pointer', fontSize: 12, padding: '5px 10px', fontFamily: 'inherit' }}>{t.viewAll}</button>
            </div>
            {!dash?.cashOutEntries?.length
              ? <div style={{ textAlign: 'center', padding: 16, color: C.muted, fontSize: 14 }}>{t.noEntriesToday}</div>
              : dash.cashOutEntries.slice(0,5).map((e,i) => (
                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: i < dash.cashOutEntries.length-1 ? `1px solid rgba(255,255,255,.05)` : 'none' }}>
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 600 }}>{e.who} · {e.reason}</div>
                    <div style={{ fontSize: 12, color: C.muted, marginTop: 2 }}>{e.time}{e.note ? ` · ${e.note}` : ''}</div>
                  </div>
                  <div style={{ color: C.red, fontWeight: 700, fontSize: 16 }}>{fmt(e.amount)}</div>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* ── EMPLOYEES ── */}
      {page === 'employees' && user.role === 'admin' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12, padding: '14px 14px 90px' }}>
          <div style={{ fontSize: 12, color: C.muted, letterSpacing: 2, textTransform: 'uppercase' }}>{t.empHours}</div>
          <DateRange start={empStart} end={empEnd} onStart={setEmpStart} onEnd={setEmpEnd} lang={lang} />
          <button style={btn} onClick={loadEmployees}>{t.loadHours}</button>

          {empLoading && <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16, padding: '40px 20px' }}><RamLoader /><div style={{ fontSize: 11, color: C.muted, letterSpacing: 2, textTransform: 'uppercase' }}>{t.loading}</div></div>}

          {empData && !empLoading && (
            <>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                <div style={{ background: 'rgba(212,168,67,.12)', border: '1px solid rgba(212,168,67,.3)', borderRadius: 14, padding: '16px 14px' }}>
                  <div style={{ fontSize: 11, color: C.gold, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 6 }}>{t.totalHours}</div>
                  <div style={{ fontSize: 24, fontWeight: 700, color: C.gold }}>{fmtH(empData.totalHours)}</div>
                </div>
                <div style={{ background: 'rgba(224,82,82,.12)', border: '1px solid rgba(224,82,82,.3)', borderRadius: 14, padding: '16px 14px' }}>
                  <div style={{ fontSize: 11, color: C.red, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 6 }}>{t.totalPay}</div>
                  <div style={{ fontSize: 24, fontWeight: 700, color: C.red }}>{fmt(empData.totalPay)}</div>
                </div>
              </div>
              {empData.employees.length === 0
                ? <div style={{ textAlign: 'center', padding: 32, color: C.muted }}>{t.noTimecardFound}</div>
                : empData.employees.map((emp, ei) => (
                  <div key={ei} style={card}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <div>
                        <div style={{ fontSize: 18, fontWeight: 700 }}>{emp.name}</div>
                        <div style={{ fontSize: 12, color: C.muted, marginTop: 2 }}>${PAY_RATES[emp.name.split(' ')[0]] || '—'}/hr</div>
                      </div>
                      <div style={{ textAlign: isAr ? 'left' : 'right' }}>
                        <div style={{ fontSize: 20, fontWeight: 700, color: C.gold }}>{fmt(emp.totalPay)}</div>
                        <div style={{ fontSize: 12, color: C.muted, marginTop: 2 }}>{fmtH(emp.totalHours)}</div>
                      </div>
                    </div>
                    <div style={{ overflowX: 'auto' }}>
                      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13, minWidth: 300 }}>
                        <thead><tr>{[t.date, t.loading.slice(0,2)==='جا'?'دخول':'In', t.loading.slice(0,2)==='جا'?'خروج':'Out', t.hours, t.pay].map(h=><th key={h} style={thStyle}>{h}</th>)}</tr></thead>
                        <tbody>{emp.shifts.map((s,si)=>(
                          <tr key={si}>
                            <td style={{...tdStyle,color:C.muted,fontSize:12}}>{s.date}</td>
                            <td style={{...tdStyle,fontSize:13}}>{s.startTime}</td>
                            <td style={{...tdStyle,fontSize:13}}>{s.endTime}</td>
                            <td style={{...tdStyle,color:C.blue}}>{fmtH(s.hours)}</td>
                            <td style={{...tdStyle,color:C.gold,fontWeight:600}}>{fmt(s.pay)}</td>
                          </tr>
                        ))}</tbody>
                      </table>
                    </div>
                  </div>
                ))
              }
            </>
          )}
        </div>
      )}

      {/* ── REPORTS ── */}
      {page === 'reports' && user.role === 'admin' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12, padding: '14px 14px 90px' }}>
          <div style={{ fontSize: 12, color: C.muted, letterSpacing: 2, textTransform: 'uppercase' }}>{t.reportsHistory}</div>
          <DateRange start={rptStart} end={rptEnd} onStart={setRptStart} onEnd={setRptEnd} lang={lang} />
          <button style={btn} onClick={loadReport}>{t.pullReport}</button>

          {rptLoading && <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16, padding: '60px 20px' }}><RamLoader /><div style={{ fontSize: 11, color: C.muted, letterSpacing: 2, textTransform: 'uppercase' }}>{t.loading}</div></div>}

          {rptData && !rptLoading && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 8 }}>
                {[
                  [t.cashSales, fmt(rptData.totalCash), C.green],
                  [t.cardSales, fmt(rptData.totalCard), C.blue],
                  [t.total, fmt(rptData.totalSales), C.gold],
                  [t.cashOut, fmt(rptData.totalOut), C.red],
                  ['P&L', fmt(rptData.totalPL), rptData.totalPL >= 0 ? C.green : C.red],
                  [t.days, String(rptData.days?.length??0), C.muted],
                ].map(([l,v,c])=>(
                  <div key={l} style={{ background: C.surf, border: `1px solid ${C.bord}`, borderRadius: 14, padding: '14px 10px', textAlign: 'center' }}>
                    <div style={{ fontSize: 16, fontWeight: 700, color: c }}>{v}</div>
                    <div style={{ fontSize: 10, color: C.muted, textTransform: 'uppercase', letterSpacing: 1, marginTop: 4 }}>{l}</div>
                  </div>
                ))}
              </div>

              {rptData.days && rptData.days.length > 0 && (() => {
                const maxVal = Math.max(...rptData.days.map(d => d.totalSales), 1);
                return (
                  <div style={{ background: C.surf, border: `1px solid ${C.bord}`, borderRadius: 14, padding: 16 }}>
                    <div style={{ fontSize: 11, color: C.muted, textTransform: 'uppercase', letterSpacing: 2, marginBottom: 8 }}>{t.dailySales}</div>
                    <div style={{ display: 'flex', gap: 12, marginBottom: 10 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 11, color: C.muted }}><div style={{ width: 8, height: 8, borderRadius: 2, background: C.green }} />{t.cash}</div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 11, color: C.muted }}><div style={{ width: 8, height: 8, borderRadius: 2, background: C.blue }} />{t.card}</div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'flex-end', gap: 4, height: 100 }}>
                      {rptData.days.map((d,i)=>(
                        <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1, minWidth: 24, height: '100%', gap: 2 }}>
                          <div style={{ flex: 1, width: '100%', display: 'flex', alignItems: 'flex-end', gap: 1, justifyContent: 'center' }}>
                            <div style={{ width: '45%', background: C.green, borderRadius: '2px 2px 0 0', height: `${(d.cashIn/maxVal*100).toFixed(1)}%`, minHeight: d.cashIn>0?2:0, opacity:.85 }} />
                            <div style={{ width: '45%', background: C.blue, borderRadius: '2px 2px 0 0', height: `${(d.cardIn/maxVal*100).toFixed(1)}%`, minHeight: d.cardIn>0?2:0, opacity:.85 }} />
                          </div>
                          <div style={{ fontSize: 8, color: C.muted, textAlign: 'center' }}>{d.date.slice(5)}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })()}

              <div style={{ background: C.surf, border: `1px solid ${C.bord}`, borderRadius: 14, overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13, minWidth: 420 }}>
                  <thead><tr>{[t.date, t.cash, t.card, t.total, t.out, 'P&L', t.drawer].map(h=><th key={h} style={thStyle}>{h}</th>)}</tr></thead>
                  <tbody>{[...rptData.days].reverse().map((d,i)=>(
                    <tr key={i}>
                      <td style={{...tdStyle,color:C.muted,fontSize:12}}>{d.date}</td>
                      <td style={{...tdStyle,color:C.green,fontWeight:600}}>{fmt(d.cashIn)}</td>
                      <td style={{...tdStyle,color:C.blue,fontWeight:600}}>{fmt(d.cardIn)}</td>
                      <td style={{...tdStyle,color:C.gold,fontWeight:600}}>{fmt(d.totalSales)}</td>
                      <td style={{...tdStyle,color:C.red}}>{fmt(d.cashOut)}</td>
                      <td style={{...tdStyle,color:d.pl>=0?C.green:C.red,fontWeight:600}}>{fmt(d.pl)}</td>
                      <td style={tdStyle}>{d.diff==null?<span style={{color:C.muted}}>—</span>:Math.abs(d.diff)<0.01?<span style={{color:C.green}}>✓</span>:d.diff>0?<span style={{color:'#ffd166'}}>+{fmt(d.diff)}</span>:<span style={{color:C.red}}>{fmt(d.diff)}</span>}</td>
                    </tr>
                  ))}</tbody>
                </table>
              </div>

              {rptData.cashOutEntries?.length > 0 && (
                <div style={card}>
                  <div style={{ fontSize: 16, fontWeight: 700 }}>{t.cashOutEntries}</div>
                  <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13, minWidth: 380 }}>
                      <thead><tr>{[t.date, t.time, t.who, t.amount, t.reason, t.note].map(h=><th key={h} style={thStyle}>{h}</th>)}</tr></thead>
                      <tbody>{rptData.cashOutEntries.map((e,i)=>(
                        <tr key={i}>
                          <td style={{...tdStyle,color:C.muted,fontSize:12}}>{e.date}</td>
                          <td style={{...tdStyle,color:C.muted,fontSize:12}}>{e.time}</td>
                          <td style={tdStyle}>{e.who}</td>
                          <td style={{...tdStyle,color:C.red,fontWeight:600}}>{fmt(e.amount)}</td>
                          <td style={{...tdStyle,color:C.muted}}>{e.reason}</td>
                          <td style={{...tdStyle,color:C.muted,fontSize:12}}>{e.note||'—'}</td>
                        </tr>
                      ))}</tbody>
                    </table>
                  </div>
                </div>
              )}

              <button style={{ ...btn, background: '#1a1a20', border: `1px solid ${C.bord}`, color: C.gold, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }} onClick={() => {
                setPdfLoading(true);
                const html = `<!DOCTYPE html><html><head><meta charset="UTF-8"><title>Report - Choices For You</title>
                <style>*{box-sizing:border-box;margin:0;padding:0}body{font-family:-apple-system,Arial,sans-serif;background:#fff;color:#111;padding:40px;font-size:13px}.header{display:flex;align-items:center;gap:20px;margin-bottom:32px;padding-bottom:20px;border-bottom:2px solid #111}.logo{width:60px;height:60px;object-fit:contain;background:#111;border-radius:12px;padding:6px}h1{font-size:22px;font-weight:700}table{width:100%;border-collapse:collapse;margin-bottom:24px}th{background:#f0f0f0;font-size:10px;text-transform:uppercase;padding:10px 12px;text-align:left;color:#666}td{padding:10px 12px;border-bottom:1px solid #eee;font-size:12px}.footer{text-align:center;margin-top:32px;padding-top:16px;border-top:1px solid #eee;font-size:11px;color:#aaa;line-height:1.8}@media print{body{padding:20px}}</style>
                </head><body>
                <div class="header"><img class="logo" src="${window.location.origin}/logo.png" alt="Logo"/><div><h1>Choices For You</h1><p>Cash Manager Report · ${rptStart} to ${rptEnd}</p><p style="color:#888;margin-top:4px">Generated: ${new Date().toLocaleString()}</p></div></div>
                <h2 style="margin-bottom:12px;font-size:16px">Daily Breakdown</h2>
                <table><thead><tr><th>Date</th><th>Cash</th><th>Card</th><th>Total</th><th>Cash Out</th><th>P&L</th></tr></thead>
                <tbody>${[...rptData.days].reverse().map(d=>`<tr><td>${d.date}</td><td style="color:#1a8a5a">${fmt(d.cashIn)}</td><td style="color:#2563eb">${fmt(d.cardIn)}</td><td style="font-weight:600">${fmt(d.totalSales)}</td><td style="color:#c0392b">${fmt(d.cashOut)}</td><td style="color:${d.pl>=0?'#1a8a5a':'#c0392b'};font-weight:600">${fmt(d.pl)}</td></tr>`).join('')}</tbody></table>
                ${rptData.cashOutEntries?.length?`<h2 style="margin-bottom:12px;font-size:16px">Cash Out Entries</h2><table><thead><tr><th>Date</th><th>Who</th><th>Amount</th><th>Reason</th><th>Note</th></tr></thead><tbody>${rptData.cashOutEntries.map(e=>`<tr><td>${e.date}</td><td>${e.who}</td><td style="color:#c0392b">${fmt(e.amount)}</td><td>${e.reason}</td><td>${e.note||'—'}</td></tr>`).join('')}</tbody></table>`:''}
                <div class="footer"><strong>Choices For You</strong> · Business Manager<br/>Built by Abdo Alasaadi · ${new Date().toLocaleDateString()}</div>
                </body></html>`;
                const win = window.open('','_blank');
                win.document.write(html); win.document.close();
                setTimeout(()=>{ win.print(); setPdfLoading(false); }, 800);
              }} disabled={pdfLoading}>
                {pdfLoading ? (isAr ? 'جار الإنشاء...' : 'Generating...') : t.exportPDF}
              </button>
            </div>
          )}
        </div>
      )}

      {/* BOTTOM NAV */}
      <div style={{ position: 'fixed', bottom: 0, left: 0, right: 0, background: C.surf, borderTop: `1px solid ${C.bord}`, display: 'flex', zIndex: 40 }}>
        {tabs.map(([id,ic,lb])=>(
          <button key={id} onClick={()=>setPage(id)} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '12px 6px 10px', cursor: 'pointer', background: 'none', border: 'none', color: page===id?C.gold:C.muted, gap: 5, fontFamily: 'inherit' }}>
            <span style={{ fontSize: 22 }}>{ic}</span>
            <span style={{ fontSize: 10, fontWeight: 500 }}>{lb}</span>
          </button>
        ))}
      </div>

      {/* ── DETAIL SHEETS ── */}
      {activeSheet === 'cashout' && (
        <Sheet title={t.cashOutHistory} onClose={() => setActiveSheet(null)} closeLabel={t.close}>
          <DateRange start={sheetStart} end={sheetEnd} lang={lang}
            onStart={s => { setSheetStart(s); reloadSheet('cashout', s, sheetEnd); }}
            onEnd={e => { setSheetEnd(e); reloadSheet('cashout', sheetStart, e); }} />
          {sheetLoading && <div style={{ display: 'flex', justifyContent: 'center', padding: 32 }}><RamLoader /></div>}
          {sheetData && !sheetLoading && (
            <>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 16 }}>
                <div style={{ background: C.surf2, borderRadius: 12, padding: '12px 14px' }}>
                  <div style={{ fontSize: 11, color: C.muted, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 4 }}>{t.totalOut}</div>
                  <div style={{ fontSize: 22, fontWeight: 700, color: C.red }}>{fmt(sheetData.total)}</div>
                </div>
                <div style={{ background: C.surf2, borderRadius: 12, padding: '12px 14px' }}>
                  <div style={{ fontSize: 11, color: C.muted, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 4 }}>{t.entries}</div>
                  <div style={{ fontSize: 22, fontWeight: 700, color: C.gold }}>{sheetData.entries?.length || 0}</div>
                </div>
              </div>
              {Object.keys(sheetData.byPerson||{}).length > 0 && (
                <div style={{ marginBottom: 16 }}>
                  {Object.entries(sheetData.byPerson).sort((a,b)=>b[1]-a[1]).map(([name,amt])=>(
                    <div key={name} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: `1px solid rgba(255,255,255,.05)` }}>
                      <div style={{ fontSize: 14 }}>{name}</div>
                      <div style={{ color: C.red, fontWeight: 700 }}>{fmt(amt)}</div>
                    </div>
                  ))}
                </div>
              )}
              {!sheetData.entries?.length
                ? <div style={{ textAlign: 'center', padding: 32, color: C.muted }}>{t.noEntriesFound}</div>
                : <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13, minWidth: 340 }}>
                      <thead><tr>{[t.date, t.time, t.who, t.amount, t.reason].map(h=><th key={h} style={thStyle}>{h}</th>)}</tr></thead>
                      <tbody>{sheetData.entries.map((e,i)=>(
                        <tr key={i}>
                          <td style={{...tdStyle,color:C.muted,fontSize:12}}>{e.date}</td>
                          <td style={{...tdStyle,color:C.muted,fontSize:12}}>{e.time}</td>
                          <td style={tdStyle}>{e.who}</td>
                          <td style={{...tdStyle,color:C.red,fontWeight:700}}>{fmt(e.amount)}</td>
                          <td style={{...tdStyle,color:C.muted}}>{e.reason}</td>
                        </tr>
                      ))}</tbody>
                    </table>
                  </div>}
            </>
          )}
        </Sheet>
      )}

      {activeSheet === 'sales' && (
        <Sheet title={t.salesHistory} onClose={() => setActiveSheet(null)} closeLabel={t.close}>
          <DateRange start={sheetStart} end={sheetEnd} lang={lang}
            onStart={s => { setSheetStart(s); reloadSheet('sales', s, sheetEnd); }}
            onEnd={e => { setSheetEnd(e); reloadSheet('sales', sheetStart, e); }} />
          {sheetLoading && <div style={{ display: 'flex', justifyContent: 'center', padding: 32 }}><RamLoader /></div>}
          {sheetData && !sheetLoading && (
            <>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 8, marginBottom: 16 }}>
                {[[t.cash, fmt(sheetData.totalCash), C.green],[t.card, fmt(sheetData.totalCard), C.blue],[t.total, fmt(sheetData.total), C.gold]].map(([l,v,c])=>(
                  <div key={l} style={{ background: C.surf2, borderRadius: 12, padding: '12px 10px', textAlign: 'center' }}>
                    <div style={{ fontSize: 16, fontWeight: 700, color: c }}>{v}</div>
                    <div style={{ fontSize: 10, color: C.muted, textTransform: 'uppercase', marginTop: 3 }}>{l}</div>
                  </div>
                ))}
              </div>
              {!sheetData.days?.length
                ? <div style={{ textAlign: 'center', padding: 32, color: C.muted }}>{t.noSalesFound}</div>
                : <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13, minWidth: 300 }}>
                      <thead><tr>{[t.date, t.cash, t.card, t.total].map(h=><th key={h} style={thStyle}>{h}</th>)}</tr></thead>
                      <tbody>{[...sheetData.days].reverse().map((d,i)=>(
                        <tr key={i}>
                          <td style={{...tdStyle,color:C.muted,fontSize:12}}>{d.date}</td>
                          <td style={{...tdStyle,color:C.green,fontWeight:600}}>{fmt(d.cashTotal)}</td>
                          <td style={{...tdStyle,color:C.blue,fontWeight:600}}>{fmt(d.cardTotal)}</td>
                          <td style={{...tdStyle,color:C.gold,fontWeight:700}}>{fmt(d.total)}</td>
                        </tr>
                      ))}</tbody>
                    </table>
                  </div>}
            </>
          )}
        </Sheet>
      )}

      {activeSheet === 'pos' && (
        <Sheet title={t.posHistory} onClose={() => setActiveSheet(null)} closeLabel={t.close}>
          <DateRange start={sheetStart} end={sheetEnd} lang={lang}
            onStart={s => { setSheetStart(s); reloadSheet('pos', s, sheetEnd); }}
            onEnd={e => { setSheetEnd(e); reloadSheet('pos', sheetStart, e); }} />
          {sheetLoading && <div style={{ display: 'flex', justifyContent: 'center', padding: 32 }}><RamLoader /></div>}
          {sheetData && !sheetLoading && (
            <>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 16 }}>
                <div style={{ background: C.surf2, borderRadius: 12, padding: '12px 14px' }}>
                  <div style={{ fontSize: 11, color: C.muted, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 4 }}>{t.posIn}</div>
                  <div style={{ fontSize: 22, fontWeight: 700, color: C.green }}>{fmt(sheetData.totalIn)}</div>
                </div>
                <div style={{ background: C.surf2, borderRadius: 12, padding: '12px 14px' }}>
                  <div style={{ fontSize: 11, color: C.muted, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 4 }}>{t.posOut}</div>
                  <div style={{ fontSize: 22, fontWeight: 700, color: C.red }}>{fmt(sheetData.totalOut)}</div>
                </div>
              </div>
              {!sheetData.events?.length
                ? <div style={{ textAlign: 'center', padding: 32, color: C.muted }}>{t.noPOSFound}</div>
                : <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13, minWidth: 300 }}>
                      <thead><tr>{[t.date, t.time, t.type, t.amount, t.note].map(h=><th key={h} style={thStyle}>{h}</th>)}</tr></thead>
                      <tbody>{sheetData.events.map((e,i)=>(
                        <tr key={i}>
                          <td style={{...tdStyle,color:C.muted,fontSize:12}}>{e.date}</td>
                          <td style={{...tdStyle,color:C.muted,fontSize:12}}>{e.time}</td>
                          <td style={{...tdStyle,color:e.type==='PAID_IN'?C.green:C.red,fontWeight:600}}>{e.type==='PAID_IN'?t.payIn:t.payOut}</td>
                          <td style={{...tdStyle,color:e.type==='PAID_IN'?C.green:C.red,fontWeight:700}}>{e.type==='PAID_IN'?'+':'-'}{fmt(e.amount)}</td>
                          <td style={{...tdStyle,color:C.muted,fontSize:12}}>{e.description||'—'}</td>
                        </tr>
                      ))}</tbody>
                    </table>
                  </div>}
            </>
          )}
        </Sheet>
      )}

      {/* CONFIRM SHEET */}
      {confirmSheet && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.85)', zIndex: 100, display: 'flex', alignItems: 'flex-end', justifyContent: 'center' }} onClick={e=>e.target===e.currentTarget&&setConfirmSheet(false)}>
          <div style={{ background: C.surf, border: `1px solid ${C.bord}`, borderRadius: '28px 28px 0 0', padding: '12px 20px 48px', width: '100%', display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div style={{ width: 40, height: 4, background: '#2a2a35', borderRadius: 2, margin: '0 auto 6px' }} />
            <div style={{ fontSize: 36, textAlign: 'center' }}>💸</div>
            <div style={{ fontSize: 22, fontWeight: 700, textAlign: 'center' }}>{t.confirmCashOut}</div>
            <div style={{ fontSize: 14, color: C.muted, textAlign: 'center' }}>{t.reviewBefore}</div>
            <div style={{ background: C.surf2, border: `1px solid ${C.bord}`, borderRadius: 14, padding: '4px 16px' }}>
              {[[t.whoLabel, pending?.who],[t.amountLabel, fmt(pending?.amt)],[t.reasonLabel, pending?.reason], pending?.note?[t.noteLabel, pending.note]:null].filter(Boolean).map(([l,v],i,arr)=>(
                <div key={l} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 0', borderBottom: i<arr.length-1?`1px solid ${C.bord}`:'none' }}>
                  <span style={{ color: C.muted, fontSize: 15 }}>{l}</span>
                  <span style={{ color: l===t.amountLabel?C.gold:'#fff', fontWeight: 600, fontSize: 15 }}>{v}</span>
                </div>
              ))}
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              <button style={btnG} onClick={() => setConfirmSheet(false)}>{t.cancel}</button>
              <button style={btn} onClick={submitOut}>{t.submit}</button>
            </div>
          </div>
        </div>
      )}

      {/* SUCCESS SHEET */}
      {successSheet && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.85)', zIndex: 100, display: 'flex', alignItems: 'flex-end', justifyContent: 'center' }} onClick={e=>e.target===e.currentTarget&&setSuccessSheet(false)}>
          <div style={{ background: C.surf, border: `1px solid ${C.bord}`, borderRadius: '28px 28px 0 0', padding: '12px 20px 48px', width: '100%', display: 'flex', flexDirection: 'column', gap: 14, alignItems: 'center' }}>
            <div style={{ width: 40, height: 4, background: '#2a2a35', borderRadius: 2 }} />
            <div style={{ fontSize: 36 }}>✅</div>
            <div style={{ fontSize: 22, fontWeight: 700 }}>{t.done}</div>
            <div style={{ fontSize: 14, color: C.muted, textAlign: 'center' }}>{successMsg}</div>
            <button style={{ ...btn, marginTop: 8 }} onClick={() => setSuccessSheet(false)}>{t.close}</button>
          </div>
        </div>
      )}

      {/* TOAST */}


{/* PIN ALERT */}
{pinAlert && (
  <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.85)', zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 24px' }}>
    <div style={{ background: '#1a1a20', border: '1px solid rgba(224,82,82,.4)', borderRadius: 24, padding: '32px 24px', width: '100%', maxWidth: 360, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16, textAlign: 'center' }}>
      <div style={{ fontSize: 48 }}>🔒</div>
      <div style={{ fontSize: 20, fontWeight: 700, color: '#e05252' }}>{isAr ? 'رقم غير موجود' : 'Access Denied'}</div>
      <div style={{ fontSize: 14, color: '#888', lineHeight: 1.6 }}>
        {isAr
          ? 'هذا الرقم غير موجود في النظام.\nيرجى التواصل مع عبده الاسعدي للحصول على الصلاحية.'
          : 'This PIN is not in the system.\nPlease talk to Abdo Alasaadi for access.'}
      </div>
      <button onClick={() => setPinAlert(false)} style={{ background: '#d4a843', border: 'none', borderRadius: 14, color: '#0f0f12', fontSize: 16, fontWeight: 700, padding: '14px 40px', cursor: 'pointer', fontFamily: 'inherit', marginTop: 8 }}>
        {isAr ? 'حسناً' : 'OK'}
      </button>
    </div>
  </div>
)}
      {toast && (
        <div style={{ position: 'fixed', bottom: 90, left: '50%', transform: 'translateX(-50%)', background: C.surf, border: `1px solid ${toast.type==='err'?'rgba(224,82,82,.5)':'rgba(212,168,67,.5)'}`, borderRadius: 14, padding: '13px 22px', fontSize: 14, zIndex: 200, whiteSpace: 'nowrap', color: toast.type==='err'?C.red:C.gold }}>
          {toast.msg}
        </div>
      )}
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );

{/* FARES VIDEO */}
{faresVideo && (
  <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.95)', zIndex: 300, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
    onClick={() => setFaresVideo(false)}>
    <video
      src="https://drive.google.com/uc?export=download&id=1uobytQCOraf0a_u3KweK02xslVQg_EPt"
      autoPlay
      playsInline
      muted={false}
      style={{ maxWidth: '90vw', maxHeight: '80vh', borderRadius: 16 }}
      onEnded={() => setFaresVideo(false)}
    />
  </div>
)}
