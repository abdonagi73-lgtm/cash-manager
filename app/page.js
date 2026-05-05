'use client';
import { useState, useEffect, useCallback } from 'react';

const SCRIPT_URL = '/api/proxy';

const PINS = {
  Abdo: { pin: '5436', role: 'admin' },
  Fares: { pin: '1503', role: 'team' },
  Assim: { pin: '1738', role: 'team' },
  Kamal: { pin: '9990', role: 'team' },
};

function fmt(n) {
  if (n == null || isNaN(n)) return '—';
  return '$' + parseFloat(n).toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}

function callScript(action, params = {}) {
  const url = new URL(SCRIPT_URL, window.location.origin);
  url.searchParams.set('action', action);
  Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v));
  return fetch(url.toString()).then(r => r.json());
}

export default function App() {
  const [user, setUser] = useState(null);
  const [page, setPage] = useState('today');
  const [pin, setPin] = useState('');
  const [loginName, setLoginName] = useState('');
  const [loginErr, setLoginErr] = useState('');
  const [dash, setDash] = useState(null);
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
  const [rptStart, setRptStart] = useState('');
  const [rptEnd, setRptEnd] = useState('');
  const [rptData, setRptData] = useState(null);
  const [rptLoading, setRptLoading] = useState(false);

  const showToast = (msg, type = 'ok') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const loadDash = useCallback(() => {
    callScript('getDashboard').then(setDash).catch(() => showToast('Load error', 'err'));
  }, []);

  useEffect(() => {
    if (user) { loadDash(); const t = setInterval(loadDash, 5 * 60 * 1000); return () => clearInterval(t); }
  }, [user, loadDash]);

  const addPin = (k) => {
    if (pin.length >= 4) return;
    const np = pin + k;
    setPin(np);
    if (np.length === 4) setTimeout(() => doLogin(np), 180);
  };

  const doLogin = (p) => {
    const pval = p || pin;
    if (!loginName) { setLoginErr('Please select your name.'); return; }
    if (pval.length < 4) { setLoginErr('Enter your 4-digit PIN.'); return; }
    const u = PINS[loginName];
    if (!u || u.pin !== pval) { setLoginErr('Incorrect PIN.'); setPin(''); return; }
    setUser({ name: loginName, role: u.role });
    setLoginErr('');
    setPin('');
  };

  const logout = () => { setUser(null); setLoginName(''); setPin(''); setPage('today'); };

  const expectedInDrawer = dash ? (dash.openingAmount + dash.cashIn - dash.cashOut) : 0;
  const diff = actual !== '' ? parseFloat(actual) - expectedInDrawer : null;

  const saveDrawer = (type) => {
    const val = parseFloat(type === 'opening' ? openingAmt : closingAmt);
    if (!val || val <= 0) { showToast('Enter a valid amount.', 'err'); return; }
    callScript('setDrawer', { type, amount: val, who: user.name })
      .then(() => { showToast(`${type === 'opening' ? 'Opening' : 'Closing'} set to ${fmt(val)}`); loadDash(); })
      .catch(() => showToast('Error', 'err'));
  };

  const confirmOut = () => {
    if (!outWho) { showToast('Select who.', 'err'); return; }
    if (!outAmt || parseFloat(outAmt) <= 0) { showToast('Enter a valid amount.', 'err'); return; }
    if (!outReason) { showToast('Select a reason.', 'err'); return; }
    if (outReason === 'Employee Pay' && !outHours) { showToast('Enter hours worked.', 'err'); return; }
    let note = outNote;
    if (outReason === 'Employee Pay' && outHours) note = `${outHours} hrs${outNote ? ' · ' + outNote : ''}`;
    setPending({ who: outWho, amt: parseFloat(outAmt), reason: outReason, note });
    setConfirmSheet(true);
  };

  const submitOut = () => {
    setConfirmSheet(false);
    if (!pending) return;
    callScript('logCashOut', { who: pending.who, amount: pending.amt, reason: pending.reason, note: pending.note || '' })
      .then(() => {
        setSuccessMsg(`${fmt(pending.amt)} by ${pending.who} (${pending.reason}) recorded.`);
        setSuccessSheet(true);
        setOutWho(''); setOutAmt(''); setOutReason(''); setOutHours(''); setOutNote('');
        setPending(null);
        loadDash();
      })
      .catch(() => showToast('Error submitting.', 'err'));
  };

  const delEntry = (rowIndex) => {
    if (!confirm('Remove this entry?')) return;
    callScript('deleteCashOut', { rowIndex })
      .then(() => { showToast('Removed.'); loadDash(); })
      .catch(() => showToast('Error', 'err'));
  };

  const setPreset = (days) => {
    const e = new Date(), s = new Date();
    s.setDate(e.getDate() - days + 1);
    setRptStart(e.toISOString().split('T')[0]);
    setRptEnd(s.toISOString().split('T')[0]);
  };

  const loadReport = () => {
    if (!rptStart || !rptEnd) { showToast('Select both dates.', 'err'); return; }
    setRptLoading(true);
    callScript('getReport', { start: rptStart, end: rptEnd })
      .then(d => { setRptData(d); setRptLoading(false); })
      .catch(() => { showToast('Error loading.', 'err'); setRptLoading(false); });
  };

  const s = {
    body: { margin: 0, padding: 0, background: '#0f0f12', color: '#fff', fontFamily: "'Inter', -apple-system, sans-serif", minHeight: '100vh', fontSize: 16 },
    loginWrap: { display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', padding: '24px 20px', background: 'radial-gradient(ellipse at 50% 10%, rgba(212,168,67,.1) 0%, transparent 60%)' },
    lbox: { background: '#1a1a20', border: '1px solid rgba(255,255,255,.08)', borderRadius: 24, padding: '32px 20px', width: '100%', maxWidth: 400 },
    lname: { fontSize: 26, fontWeight: 700, color: '#d4a843', textAlign: 'center', letterSpacing: -0.5 },
    lline: { width: 36, height: 2, background: '#d4a843', margin: '8px auto', borderRadius: 2, opacity: .5 },
    lsub: { fontSize: 11, color: '#888', letterSpacing: 3, textTransform: 'uppercase', textAlign: 'center' },
    lhint: { fontSize: 14, color: '#888', textAlign: 'center', margin: '20px 0' },
    llbl: { fontSize: 11, color: '#888', textTransform: 'uppercase', letterSpacing: 1.5, marginBottom: 7, display: 'block' },
    lsel: { width: '100%', background: '#22222a', border: '1px solid rgba(255,255,255,.08)', borderRadius: 12, color: '#fff', fontSize: 16, padding: '14px 16px', outline: 'none', appearance: 'none', WebkitAppearance: 'none', marginBottom: 16 },
    plbl: { fontSize: 11, color: '#888', textTransform: 'uppercase', letterSpacing: 1.5, display: 'block', marginBottom: 8 },
    pdots: { display: 'flex', gap: 16, justifyContent: 'center', marginBottom: 20 },
    pgrid: { display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 10, marginBottom: 14 },
    pkey: { background: '#22222a', border: '1px solid rgba(255,255,255,.08)', borderRadius: 14, color: '#fff', fontSize: 24, fontWeight: 600, padding: '18px 10px', textAlign: 'center', cursor: 'pointer', fontFamily: 'inherit' },
    perr: { color: '#e05252', fontSize: 13, textAlign: 'center', minHeight: 20, marginBottom: 6 },
    lcredit: { textAlign: 'center', marginTop: 20, paddingTop: 16, borderTop: '1px solid rgba(255,255,255,.08)', fontSize: 12, color: '#888', lineHeight: 1.8 },
    topbar: { background: '#1a1a20', borderBottom: '1px solid rgba(255,255,255,.08)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 16px', height: 56, position: 'sticky', top: 0, zIndex: 40 },
    tlogo: { fontSize: 17, fontWeight: 700, color: '#d4a843' },
    tsub: { fontSize: 9, color: '#888', letterSpacing: 2, textTransform: 'uppercase', marginTop: 1 },
    tchip: { fontSize: 12, color: '#888', background: '#22222a', border: '1px solid rgba(255,255,255,.08)', borderRadius: 20, padding: '5px 12px' },
    tout: { background: 'none', border: '1px solid rgba(255,255,255,.08)', color: '#888', fontSize: 13, padding: '6px 12px', borderRadius: 8, cursor: 'pointer', fontFamily: 'inherit' },
    pg: { display: 'flex', flexDirection: 'column', gap: 12, padding: '14px 14px 90px' },
    ptitle: { fontSize: 12, color: '#888', letterSpacing: 2, textTransform: 'uppercase' },
    mgrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 },
    dcard: { background: '#1a1a20', border: '1px solid rgba(255,255,255,.08)', borderRadius: 18, padding: 18, display: 'flex', flexDirection: 'column', gap: 12 },
    dexp: { textAlign: 'center', background: '#22222a', borderRadius: 14, padding: '18px 12px' },
    dlbl: { fontSize: 11, color: '#888', textTransform: 'uppercase', letterSpacing: 2, marginBottom: 8 },
    damt: { fontSize: 40, fontWeight: 700, color: '#d4a843', lineHeight: 1 },
    dform: { fontSize: 11, color: '#888', marginTop: 6 },
    arow: { display: 'flex', alignItems: 'center', gap: 10 },
    ainp: { flex: 1, minWidth: 0, background: '#22222a', border: '1px solid rgba(255,255,255,.08)', borderRadius: 10, color: '#fff', fontSize: 18, padding: '12px 14px', outline: 'none', fontFamily: 'inherit' },
    card: { background: '#1a1a20', border: '1px solid rgba(255,255,255,.08)', borderRadius: 18, padding: 18, display: 'flex', flexDirection: 'column', gap: 14 },
    ctitle: { fontSize: 18, fontWeight: 700 },
    fld: { display: 'flex', flexDirection: 'column', gap: 7 },
    flbl: { fontSize: 11, color: '#888', textTransform: 'uppercase', letterSpacing: 1.5 },
    finp: { background: '#22222a', border: '1px solid rgba(255,255,255,.08)', borderRadius: 12, color: '#fff', fontSize: 16, padding: '14px 16px', width: '100%', outline: 'none', fontFamily: 'inherit' },
    btn: { display: 'block', width: '100%', background: '#d4a843', border: 'none', borderRadius: 14, color: '#0f0f12', fontSize: 16, fontWeight: 700, padding: 16, textAlign: 'center', cursor: 'pointer', fontFamily: 'inherit' },
    btnGhost: { display: 'block', width: '100%', background: '#22222a', border: '1px solid rgba(255,255,255,.08)', borderRadius: 12, color: '#fff', fontSize: 14, fontWeight: 500, padding: 13, textAlign: 'center', cursor: 'pointer', fontFamily: 'inherit' },
    botnav: { position: 'fixed', bottom: 0, left: 0, right: 0, background: '#1a1a20', borderTop: '1px solid rgba(255,255,255,.08)', display: 'flex', zIndex: 40 },
    btb: { flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '12px 6px 10px', cursor: 'pointer', background: 'none', border: 'none', color: '#888', gap: 5, fontFamily: 'inherit' },
    ovl: { position: 'fixed', inset: 0, background: 'rgba(0,0,0,.85)', zIndex: 100, display: 'flex', alignItems: 'flex-end', justifyContent: 'center' },
    sheet: { background: '#1a1a20', border: '1px solid rgba(255,255,255,.08)', borderRadius: '28px 28px 0 0', padding: '12px 20px 48px', width: '100%', display: 'flex', flexDirection: 'column', gap: 14 },
    shandle: { width: 40, height: 4, background: '#2a2a35', borderRadius: 2, margin: '0 auto 6px' },
    sdet: { background: '#22222a', border: '1px solid rgba(255,255,255,.08)', borderRadius: 14, padding: '4px 16px' },
    srow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 0', borderBottom: '1px solid rgba(255,255,255,.08)' },
    foot: { textAlign: 'center', padding: 14, borderTop: '1px solid rgba(255,255,255,.08)', fontSize: 12, color: '#888', lineHeight: 1.8 },
  };

  const MetricCard = ({ label, value, sub, color }) => {
    const colors = { green: ['rgba(45,182,125,.15)', 'rgba(45,182,125,.3)', '#2db67d'], red: ['rgba(224,82,82,.15)', 'rgba(224,82,82,.3)', '#e05252'], blue: ['rgba(91,138,240,.15)', 'rgba(91,138,240,.3)', '#5b8af0'], gold: ['rgba(212,168,67,.15)', 'rgba(212,168,67,.3)', '#d4a843'] };
    const [bg, border, clr] = colors[color];
    return (
      <div style={{ background: bg, border: `1px solid ${border}`, borderRadius: 16, padding: '16px 14px' }}>
        <div style={{ fontSize: 11, fontWeight: 500, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8, color: clr, opacity: .8 }}>{label}</div>
        <div style={{ fontSize: 28, fontWeight: 700, lineHeight: 1, color: clr }}>{value}</div>
        <div style={{ fontSize: 11, color: '#888', marginTop: 5 }}>{sub}</div>
      </div>
    );
  };

  if (!user) return (
    <div style={s.body}>
      <div style={s.loginWrap}>
        <div style={s.lbox}>
          <div style={{ textAlign: 'center', marginBottom: 28 }}>
            <div style={s.lname}>Choices For You</div>
            <div style={s.lline} />
            <div style={s.lsub}>Cash Manager</div>
          </div>
          <div style={s.lhint}>Select your name and enter your PIN</div>
          <label style={s.llbl}>Who are you?</label>
          <select style={s.lsel} value={loginName} onChange={e => { setLoginName(e.target.value); setPin(''); setLoginErr(''); }}>
            <option value="">Select your name...</option>
            <option>Abdo</option><option>Fares</option><option>Assim</option><option>Kamal</option>
          </select>
          <label style={s.plbl}>PIN</label>
          <div style={s.pdots}>
            {[0,1,2,3].map(i => <div key={i} style={{ width: 16, height: 16, borderRadius: '50%', background: i < pin.length ? '#d4a843' : '#2a2a35', border: '1px solid ' + (i < pin.length ? '#d4a843' : '#3a3a48'), transition: 'all .15s' }} />)}
          </div>
          <div style={s.pgrid}>
            {['1','2','3','4','5','6','7','8','9'].map(k => <button key={k} style={s.pkey} onClick={() => addPin(k)}>{k}</button>)}
            <button style={{ ...s.pkey, color: '#888', fontSize: 18 }} onClick={() => setPin(p => p.slice(0,-1))}>⌫</button>
            <button style={s.pkey} onClick={() => addPin('0')}>0</button>
            <button style={{ ...s.pkey, color: '#d4a843', fontSize: 18 }} onClick={() => doLogin()}>✓</button>
          </div>
          <div style={s.perr}>{loginErr}</div>
          <div style={s.lcredit}>Built by <strong style={{ color: '#d4a843' }}>Abdo Alasaadi</strong><br />Need help? Contact me</div>
        </div>
      </div>
    </div>
  );

  const tabs = user.role === 'admin'
    ? [['today','🏠','Today'],['cashout','💸','Cash Out'],['reports','📊','Reports']]
    : [['today','🏠','Today'],['cashout','💸','Cash Out']];

  return (
    <div style={s.body}>
      {/* TOPBAR */}
      <div style={s.topbar}>
        <div><div style={s.tlogo}>Choices For You</div><div style={s.tsub}>Cash Manager</div></div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={s.tchip}>{user.name}{user.role === 'admin' ? ' ★' : ''}</div>
          <button style={s.tout} onClick={logout}>Sign out</button>
        </div>
      </div>

      {/* TODAY */}
      {page === 'today' && (
        <div style={s.pg}>
          <div style={s.ptitle}>● Live · Today</div>
          <div style={s.mgrid}>
            <MetricCard label="Cash In" value={fmt(dash?.cashIn)} sub={`${dash?.cashInTxn || 0} transactions`} color="green" />
            <MetricCard label="Cash Out" value={fmt(dash?.cashOut)} sub={`${dash?.cashOutEntries?.length || 0} entries`} color="red" />
            <MetricCard label="Opening" value={fmt(dash?.openingAmount)} sub={dash?.openingAmount > 0 ? 'set for today' : 'not set'} color="blue" />
            <MetricCard label="Closing" value={dash?.closingAmount > 0 ? fmt(dash.closingAmount) : '—'} sub="end of day" color="gold" />
          </div>

          <div style={s.dcard}>
            <div style={s.dexp}>
              <div style={s.dlbl}>Expected in Drawer</div>
              <div style={s.damt}>{fmt(expectedInDrawer)}</div>
              <div style={s.dform}>{fmt(dash?.openingAmount)} + {fmt(dash?.cashIn)} − {fmt(dash?.cashOut)}</div>
            </div>
            <div style={s.arow}>
              <span style={{ fontSize: 11, color: '#888', textTransform: 'uppercase', letterSpacing: 1, whiteSpace: 'nowrap' }}>Actual $</span>
              <input style={s.ainp} type="number" placeholder="0.00" inputMode="decimal" value={actual} onChange={e => setActual(e.target.value)} />
              {diff === null ? <div style={{ ...s.badge, background: '#22222a', color: '#888' }}>—</div>
                : Math.abs(diff) < 0.01 ? <div style={{ padding: '9px 12px', borderRadius: 10, background: 'rgba(45,182,125,.2)', color: '#2db67d', fontWeight: 700, fontSize: 13, whiteSpace: 'nowrap' }}>✓ Match</div>
                : diff > 0 ? <div style={{ padding: '9px 12px', borderRadius: 10, background: 'rgba(255,209,102,.2)', color: '#ffd166', fontWeight: 700, fontSize: 13, whiteSpace: 'nowrap' }}>+{fmt(diff)}</div>
                : <div style={{ padding: '9px 12px', borderRadius: 10, background: 'rgba(224,82,82,.2)', color: '#e05252', fontWeight: 700, fontSize: 13, whiteSpace: 'nowrap' }}>{fmt(diff)}</div>}
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              <div style={s.fld}><label style={s.flbl}>Opening ($)</label><input style={s.finp} type="number" placeholder="200.00" inputMode="decimal" value={openingAmt} onChange={e => setOpeningAmt(e.target.value)} /></div>
              <div style={s.fld}><label style={s.flbl}>Closing ($)</label><input style={s.finp} type="number" placeholder="850.00" inputMode="decimal" value={closingAmt} onChange={e => setClosingAmt(e.target.value)} /></div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
              <button style={s.btnGhost} onClick={() => saveDrawer('opening')}>Set Opening</button>
              <button style={s.btnGhost} onClick={() => saveDrawer('closing')}>Set Closing</button>
            </div>
          </div>

          <div style={s.card}>
            <div style={s.ctitle}>Today's Cash Out</div>
            {!dash?.cashOutEntries?.length ? <div style={{ textAlign: 'center', padding: '20px', color: '#888', fontSize: 14 }}>No entries yet today.</div> :
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
                  <thead><tr>{['Time','Who','Amount','Reason', user.role==='admin'?'':''].map((h,i) => <th key={i} style={{ background: '#22222a', color: '#888', fontSize: 11, letterSpacing: 1, padding: '10px 12px', textAlign: 'left', textTransform: 'uppercase', borderBottom: '1px solid rgba(255,255,255,.08)', whiteSpace: 'nowrap' }}>{h}</th>)}</tr></thead>
                  <tbody>{dash.cashOutEntries.map((e, i) => (
                    <tr key={i}>
                      <td style={{ padding: '12px', borderBottom: '1px solid rgba(255,255,255,.05)', color: '#888', fontSize: 13 }}>{e.time}</td>
                      <td style={{ padding: '12px', borderBottom: '1px solid rgba(255,255,255,.05)' }}>{e.who}</td>
                      <td style={{ padding: '12px', borderBottom: '1px solid rgba(255,255,255,.05)', color: '#e05252', fontWeight: 600 }}>{fmt(e.amount)}</td>
                      <td style={{ padding: '12px', borderBottom: '1px solid rgba(255,255,255,.05)', color: '#888' }}>{e.reason}</td>
                      {user.role === 'admin' && <td style={{ padding: '12px', borderBottom: '1px solid rgba(255,255,255,.05)' }}><button onClick={() => delEntry(e.rowIndex)} style={{ background: 'none', border: '1px solid rgba(255,255,255,.08)', borderRadius: 6, color: '#888', cursor: 'pointer', fontSize: 12, padding: '4px 8px' }}>✕</button></td>}
                    </tr>
                  ))}</tbody>
                </table>
              </div>}
          </div>
          <div style={s.foot}>Built by <strong style={{ color: '#d4a843' }}>Abdo Alasaadi</strong><br />Need help? Contact me</div>
        </div>
      )}

      {/* CASH OUT */}
      {page === 'cashout' && (
        <div style={s.pg}>
          <div style={s.ptitle}>Report Cash Out</div>
          <div style={s.card}>
            <div style={s.ctitle}>New Entry</div>
            <div style={s.fld}><label style={s.flbl}>Who</label>
              <select style={s.finp} value={outWho} onChange={e => setOutWho(e.target.value)}>
                <option value="">Select name...</option>
                <option>Abdo</option><option>Fares</option><option>Assim</option><option>Kamal</option>
              </select>
            </div>
            <div style={s.fld}><label style={s.flbl}>Amount ($)</label><input style={s.finp} type="number" placeholder="0.00" inputMode="decimal" value={outAmt} onChange={e => setOutAmt(e.target.value)} /></div>
            <div style={s.fld}><label style={s.flbl}>Reason</label>
              <select style={s.finp} value={outReason} onChange={e => { setOutReason(e.target.value); if (e.target.value !== 'Employee Pay') setOutHours(''); }}>
                <option value="">Select reason...</option>
                <option>Bank Deposit</option><option>Refund</option><option>Supplier Payment</option>
                <option>Store Expense</option><option>Employee Pay</option><option>Adjustment</option><option>Other</option>
              </select>
            </div>
            {outReason === 'Employee Pay' && <div style={s.fld}><label style={s.flbl}>Hours Worked</label><input style={s.finp} type="number" placeholder="e.g. 8" inputMode="decimal" value={outHours} onChange={e => setOutHours(e.target.value)} /></div>}
            <div style={s.fld}><label style={s.flbl}>Note (optional)</label><input style={s.finp} type="text" placeholder="Add details..." value={outNote} onChange={e => setOutNote(e.target.value)} /></div>
            <button style={s.btn} onClick={confirmOut}>Review & Submit</button>
          </div>
        </div>
      )}

      {/* REPORTS */}
      {page === 'reports' && user.role === 'admin' && (
        <div style={s.pg}>
          <div style={s.ptitle}>Reports & History</div>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {[[7,'7 days'],[14,'14 days'],[30,'30 days']].map(([d,l]) => <button key={d} style={{ background: '#22222a', border: '1px solid rgba(255,255,255,.08)', borderRadius: 20, color: '#888', cursor: 'pointer', fontSize: 13, padding: '7px 14px', fontFamily: 'inherit' }} onClick={() => setPreset(d)}>{l}</button>)}
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            <div style={s.fld}><label style={s.flbl}>Start</label><input style={s.finp} type="date" value={rptStart} onChange={e => setRptStart(e.target.value)} /></div>
            <div style={s.fld}><label style={s.flbl}>End</label><input style={s.finp} type="date" value={rptEnd} onChange={e => setRptEnd(e.target.value)} /></div>
          </div>
          <button style={s.btn} onClick={loadReport}>Pull Report</button>
          {rptLoading && <div style={{ textAlign: 'center', padding: 40, color: '#888' }}>Loading...</div>}
          {rptData && !rptLoading && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 8 }}>
      {[
        ['Cash In', fmt(rptData.totalIn), '#d4a843'],
        ['Cash Out', fmt(rptData.totalOut), '#e05252'],
        ['Days', rptData.days ? rptData.days.length : 0, '#5b8af0'],
        ['Over', rptData.overCount || 0, '#ffd166'],
        ['Short', rptData.shortCount || 0, '#e05252'],
        ['Match', rptData.matchCount || 0, '#5b8af0'],
      ].map(([l,v,c]) => (
        <div key={l} style={{ background: '#1a1a20', border: '1px solid rgba(255,255,255,.08)', borderRadius: 14, padding: '14px 10px', textAlign: 'center' }}>
          <div style={{ fontSize: 18, fontWeight: 700, color: c }}>{v}</div>
          <div style={{ fontSize: 10, color: '#888', textTransform: 'uppercase', letterSpacing: 1, marginTop: 4 }}>{l}</div>
        </div>
      ))}
    </div>

    {rptData.days && rptData.days.length > 0 && (
      <div style={{ background: '#1a1a20', border: '1px solid rgba(255,255,255,.08)', borderRadius: 14, overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14, minWidth: 340 }}>
          <thead>
            <tr>
              {['Date','Cash In','Txn','Cash Out','Diff'].map(h => (
                <th key={h} style={{ background: '#22222a', color: '#888', fontSize: 11, letterSpacing: 1, padding: '10px 12px', textAlign: 'left', textTransform: 'uppercase', borderBottom: '1px solid rgba(255,255,255,.08)', whiteSpace: 'nowrap' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {[...rptData.days].reverse().map((d, i) => (
              <tr key={i}>
                <td style={{ padding: '11px 12px', borderBottom: '1px solid rgba(255,255,255,.05)', color: '#888', fontSize: 12 }}>{d.date}</td>
                <td style={{ padding: '11px 12px', borderBottom: '1px solid rgba(255,255,255,.05)', color: '#2db67d', fontWeight: 600 }}>{fmt(d.cashIn)}</td>
                <td style={{ padding: '11px 12px', borderBottom: '1px solid rgba(255,255,255,.05)', color: '#888' }}>{d.cashInTxn}</td>
                <td style={{ padding: '11px 12px', borderBottom: '1px solid rgba(255,255,255,.05)', color: '#e05252' }}>{fmt(d.cashOut)}</td>
                <td style={{ padding: '11px 12px', borderBottom: '1px solid rgba(255,255,255,.05)' }}>
                  {d.diff === null ? '—' :
                    Math.abs(d.diff) < 0.01 ? <span style={{ color: '#2db67d' }}>✓</span> :
                    d.diff > 0 ? <span style={{ color: '#ffd166' }}>+{fmt(d.diff)}</span> :
                    <span style={{ color: '#e05252' }}>{fmt(d.diff)}</span>}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    )}
  </div>
)}