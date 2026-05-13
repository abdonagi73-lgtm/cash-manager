'use client';
import { useState, useEffect, useCallback, useRef } from 'react';

const PINS = {
  Abdo:  { pin: '5436', role: 'admin' },
  Fares: { pin: '1503', role: 'team' },
  Assim: { pin: '1738', role: 'team' },
  Kamal: { pin: '9990', role: 'team' },
};

function fmt(n) {
  if (n == null || isNaN(n)) return '—';
  return '$' + parseFloat(n).toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}

function callScript(action, params = {}) {
  const url = new URL('/api/proxy', window.location.origin);
  url.searchParams.set('action', action);
  Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, String(v)));
  return fetch(url.toString()).then(r => r.json());
}

function MC({ label, value, sub, c1, c2 }) {
  return (
    <div style={{ background: c1, border: `1px solid ${c2}`, borderRadius: 16, padding: '16px 14px' }}>
      <div style={{ fontSize: 11, fontWeight: 500, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8, color: c2 }}>{label}</div>
      <div style={{ fontSize: 26, fontWeight: 700, lineHeight: 1, color: c2 }}>{value}</div>
      <div style={{ fontSize: 11, color: '#888', marginTop: 5 }}>{sub}</div>
    </div>
  );
}

function Chart({ days }) {
  if (!days || !days.length) return null;
  const maxVal = Math.max(...days.map(d => Math.max(d.cashIn, d.cashOut)), 1);
  return (
    <div style={{ background: '#1a1a20', border: '1px solid rgba(255,255,255,.08)', borderRadius: 14, padding: 16 }}>
      <div style={{ fontSize: 11, color: '#888', textTransform: 'uppercase', letterSpacing: 2, marginBottom: 4 }}>Cash In vs Cash Out</div>
      <div style={{ display: 'flex', gap: 12, marginBottom: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11, color: '#888' }}>
          <div style={{ width: 10, height: 10, borderRadius: 2, background: '#2db67d' }} /> Cash In
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11, color: '#888' }}>
          <div style={{ width: 10, height: 10, borderRadius: 2, background: '#e05252' }} /> Cash Out
        </div>
      </div>
      <div style={{ display: 'flex', alignItems: 'flex-end', gap: 6, height: 120, overflowX: 'auto', paddingBottom: 4 }}>
        {days.map((d, i) => (
          <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3, flex: 1, minWidth: 32, height: '100%' }}>
            <div style={{ flex: 1, width: '100%', display: 'flex', alignItems: 'flex-end', gap: 2, justifyContent: 'center' }}>
              <div style={{ width: '45%', background: '#2db67d', borderRadius: '3px 3px 0 0', height: `${(d.cashIn / maxVal * 100).toFixed(1)}%`, minHeight: d.cashIn > 0 ? 3 : 0, opacity: .85 }} />
              <div style={{ width: '45%', background: '#e05252', borderRadius: '3px 3px 0 0', height: `${(d.cashOut / maxVal * 100).toFixed(1)}%`, minHeight: d.cashOut > 0 ? 3 : 0, opacity: .85 }} />
            </div>
            <div style={{ fontSize: 9, color: '#888', textAlign: 'center', whiteSpace: 'nowrap' }}>{d.date.slice(5)}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

function RamLoader() {
  const [prog, setProg] = useState(0);
  const progRef = useRef(0);
  const rafRef = useRef(null);

  useEffect(() => {
    const animate = () => {
      progRef.current = Math.min(progRef.current + 0.4, 90);
      setProg(progRef.current);
      if (progRef.current < 90) rafRef.current = requestAnimationFrame(animate);
    };
    rafRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(rafRef.current);
  }, []);

  const p = prog / 100;
  const eyeOpacity = prog >= 85 ? (prog - 85) / 15 : 0;
  const glowOpacity = 0.3 + p * 0.7;

  return (
    <div style={{ position: 'relative', width: 140, height: 140 }}>
      <img src="/logo.png" alt="Loading" style={{ position: 'absolute', top: 0, left: 0, width: 140, height: 140, objectFit: 'contain', opacity: 0.15, filter: 'brightness(0) invert(1)' }} />
      <div style={{ position: 'absolute', top: 0, left: 0, width: 140, height: 140, overflow: 'hidden', clipPath: `inset(${100 - prog}% 0 0 0)`, transition: 'clip-path 0.1s linear' }}>
        <img src="/logo.png" alt="" style={{ width: 140, height: 140, objectFit: 'contain', filter: `brightness(0) invert(1) sepia(1) saturate(3) hue-rotate(5deg) brightness(${glowOpacity + 0.5})` }} />
      </div>
      <div style={{ position: 'absolute', top: `${100 - prog - 5}%`, left: 0, right: 0, height: '12%', background: 'linear-gradient(to bottom, transparent, rgba(212,168,67,0.4), transparent)', pointerEvents: 'none', opacity: prog > 5 ? 1 : 0 }} />
      {eyeOpacity > 0 && <div style={{ position: 'absolute', top: '35%', left: '55%', width: 16, height: 16, borderRadius: '50%', background: '#d4a843', opacity: eyeOpacity * 0.7, filter: 'blur(6px)', transform: 'translate(-50%, -50%)', pointerEvents: 'none' }} />}
    </div>
  );
}

export default function App() {
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
  const [rptStart, setRptStart] = useState('');
  const [rptEnd, setRptEnd] = useState('');
  const [rptData, setRptData] = useState(null);
  const [rptLoading, setRptLoading] = useState(false);
  const [pdfLoading, setPdfLoading] = useState(false);
  const reportRef = useRef(null);

  const C = {
    bg: '#0f0f12', surf: '#1a1a20', surf2: '#22222a',
    bord: 'rgba(255,255,255,.08)', gold: '#d4a843',
    green: '#2db67d', red: '#e05252', blue: '#5b8af0', muted: '#888',
  };

  const inp = { background: C.surf2, border: `1px solid ${C.bord}`, borderRadius: 12, color: '#fff', fontSize: 16, padding: '14px 16px', width: '100%', outline: 'none', fontFamily: 'inherit', appearance: 'none', WebkitAppearance: 'none' };
  const btn = { display: 'block', width: '100%', background: C.gold, border: 'none', borderRadius: 14, color: '#0f0f12', fontSize: 16, fontWeight: 700, padding: 16, textAlign: 'center', cursor: 'pointer', fontFamily: 'inherit' };
  const btnG = { ...btn, background: C.surf2, border: `1px solid ${C.bord}`, color: '#fff', fontWeight: 500, padding: 14 };
  const card = { background: C.surf, border: `1px solid ${C.bord}`, borderRadius: 18, padding: 18, display: 'flex', flexDirection: 'column', gap: 14 };
  const fld = { display: 'flex', flexDirection: 'column', gap: 7 };
  const flbl = { fontSize: 11, color: C.muted, textTransform: 'uppercase', letterSpacing: 1.5 };

  const showToast = (msg, type = 'ok') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const loadDash = useCallback(() => {
    setDashLoading(true);
    callScript('getDashboard')
      .then(d => { setDash(d); setDashLoading(false); })
      .catch(() => { showToast('Load error', 'err'); setDashLoading(false); });
  }, []);

  useEffect(() => {
    if (user) {
      loadDash();
      const t = setInterval(loadDash, 5 * 60 * 1000);
      return () => clearInterval(t);
    }
  }, [user, loadDash]);

  useEffect(() => {
    try {
      const saved = sessionStorage.getItem('cashUser');
      if (saved) setUser(JSON.parse(saved));
    } catch(e) {}
  }, []);

  const addPin = (k) => {
    if (pin.length >= 4) return;
    const np = pin + k;
    setPin(np);
    if (np.length === 4) setTimeout(() => doLogin(np), 180);
  };

  const doLogin = (p) => {
    const pval = p || pin;
    if (pval.length < 4) { setLoginErr('Enter your 4-digit PIN.'); return; }
    const match = Object.entries(PINS).find(([, v]) => v.pin === pval);
    if (!match) { setLoginErr('Incorrect PIN. Try again.'); setPin(''); return; }
    const userData = { name: match[0], role: match[1].role };
    sessionStorage.setItem('cashUser', JSON.stringify(userData));
    setUser(userData);
    setLoginErr(''); setPin('');
  };

  const logout = () => {
    sessionStorage.removeItem('cashUser');
    setUser(null); setPin(''); setPage('today');
    setDash(null); setRptData(null);
  };

  const expectedInDrawer = dash ? (dash.openingAmount + dash.cashIn - dash.cashOut) : 0;
  const diff = actual !== '' && !isNaN(parseFloat(actual)) ? parseFloat(actual) - expectedInDrawer : null;

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
        setPending(null); loadDash();
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
    setRptStart(s.toISOString().split('T')[0]);
    setRptEnd(e.toISOString().split('T')[0]);
  };

  const loadReport = () => {
    if (!rptStart || !rptEnd) { showToast('Select both dates.', 'err'); return; }
    setRptLoading(true); setRptData(null);
    callScript('getReport', { start: rptStart, end: rptEnd })
      .then(d => { setRptData(d); setRptLoading(false); })
      .catch(() => { showToast('Error loading report.', 'err'); setRptLoading(false); });
  };

  const exportPDF = () => {
    if (!rptData) return;
    setPdfLoading(true);
    const maxVal = Math.max(...rptData.days.map(d => Math.max(d.cashIn, d.cashOut)), 1);
    const chartBars = rptData.days.map(d => `
      <div style="display:flex;flex-direction:column;align-items:center;gap:3px;flex:1;min-width:28px;height:100%">
        <div style="flex:1;width:100%;display:flex;align-items:flex-end;gap:2px;justify-content:center">
          <div style="width:45%;background:#2db67d;border-radius:3px 3px 0 0;height:${(d.cashIn/maxVal*100).toFixed(1)}%;min-height:${d.cashIn>0?'3px':'0'}"></div>
          <div style="width:45%;background:#e05252;border-radius:3px 3px 0 0;height:${(d.cashOut/maxVal*100).toFixed(1)}%;min-height:${d.cashOut>0?'3px':'0'}"></div>
        </div>
        <div style="font-size:8px;color:#888;text-align:center">${d.date.slice(5)}</div>
      </div>`).join('');
    const tableRows = [...rptData.days].reverse().map(d => `
      <tr>
        <td>${d.date}</td>
        <td style="color:#2db67d;font-weight:600">${fmt(d.cashIn)}</td>
        <td>${d.cashInTxn}</td>
        <td style="color:#e05252">${fmt(d.cashOut)}</td>
        <td>${fmt(d.opening)}</td>
        <td>${d.closing > 0 ? fmt(d.closing) : '—'}</td>
        <td>${d.diff == null ? '—' : Math.abs(d.diff) < 0.01 ? '✓ Match' : d.diff > 0 ? `+${fmt(d.diff)} OVER` : `${fmt(d.diff)} SHORT`}</td>
      </tr>`).join('');
    const byPersonRows = Object.entries(rptData.byPerson || {}).sort((a,b) => b[1]-a[1]).map(([name, amt]) => `
      <tr><td>${name}</td><td style="color:#e05252;font-weight:600">${fmt(amt)}</td></tr>`).join('');
    const html = `<!DOCTYPE html>
<html><head><meta charset="UTF-8"><title>Cash Report - Choices For You</title>
<style>
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: -apple-system, Arial, sans-serif; background: #fff; color: #111; padding: 40px; font-size: 13px; }
  .header { display: flex; align-items: center; gap: 20px; margin-bottom: 32px; padding-bottom: 20px; border-bottom: 2px solid #111; }
  .logo { width: 60px; height: 60px; object-fit: contain; background: #111; border-radius: 12px; padding: 6px; }
  .brand h1 { font-size: 22px; font-weight: 700; color: #111; }
  .brand p { font-size: 12px; color: #666; margin-top: 2px; }
  .summary { display: grid; grid-template-columns: repeat(3,1fr); gap: 12px; margin-bottom: 28px; }
  .sc { background: #f5f5f5; border-radius: 10px; padding: 14px; }
  .sc-val { font-size: 20px; font-weight: 700; color: #111; }
  .sc-lbl { font-size: 10px; color: #888; text-transform: uppercase; letter-spacing: 1px; margin-top: 4px; }
  .section-title { font-size: 11px; color: #888; text-transform: uppercase; letter-spacing: 2px; margin-bottom: 10px; }
  .chart { display: flex; align-items: flex-end; gap: 6px; height: 100px; background: #f9f9f9; border-radius: 10px; padding: 12px; margin-bottom: 28px; }
  table { width: 100%; border-collapse: collapse; margin-bottom: 28px; }
  th { background: #f0f0f0; font-size: 10px; text-transform: uppercase; padding: 10px 12px; text-align: left; color: #666; }
  td { padding: 10px 12px; border-bottom: 1px solid #eee; font-size: 12px; }
  tr:last-child td { border-bottom: none; }
  .footer { text-align: center; margin-top: 32px; padding-top: 16px; border-top: 1px solid #eee; font-size: 11px; color: #aaa; line-height: 1.8; }
  @media print { body { padding: 20px; } }
</style></head><body>
  <div class="header">
    <img class="logo" src="${window.location.origin}/logo.png" alt="Logo" />
    <div class="brand"><h1>Choices For You</h1><p>Cash Manager Report</p><p style="font-size:12px;color:#888;margin-top:4px">Period: ${rptStart} to ${rptEnd} · Generated: ${new Date().toLocaleString()}</p></div>
  </div>
  <div class="summary">
    <div class="sc"><div class="sc-val" style="color:#1a8a5a">${fmt(rptData.totalIn)}</div><div class="sc-lbl">Total Cash In</div></div>
    <div class="sc"><div class="sc-val" style="color:#c0392b">${fmt(rptData.totalOut)}</div><div class="sc-lbl">Total Cash Out</div></div>
    <div class="sc"><div class="sc-val">${rptData.days.length}</div><div class="sc-lbl">Days</div></div>
    <div class="sc"><div class="sc-val" style="color:#2563eb">${rptData.matchCount || 0}</div><div class="sc-lbl">Drawer Match</div></div>
    <div class="sc"><div class="sc-val" style="color:#b45309">${rptData.overCount || 0}</div><div class="sc-lbl">Over</div></div>
    <div class="sc"><div class="sc-val" style="color:#c0392b">${rptData.shortCount || 0}</div><div class="sc-lbl">Short</div></div>
  </div>
  <div class="section-title">Daily Cash In vs Cash Out</div>
  <div style="display:flex;gap:16px;margin-bottom:8px">
    <div style="display:flex;align-items:center;gap:6px;font-size:11px;color:#666"><div style="width:10px;height:10px;border-radius:2px;background:#2db67d"></div>Cash In</div>
    <div style="display:flex;align-items:center;gap:6px;font-size:11px;color:#666"><div style="width:10px;height:10px;border-radius:2px;background:#e05252"></div>Cash Out</div>
  </div>
  <div class="chart">${chartBars}</div>
  <div class="section-title">Daily Breakdown</div>
  <table><thead><tr><th>Date</th><th>Cash In</th><th>Txn</th><th>Cash Out</th><th>Opening</th><th>Closing</th><th>Drawer</th></tr></thead><tbody>${tableRows}</tbody></table>
  ${byPersonRows ? `<div class="section-title">Cash Out by Person</div><table><thead><tr><th>Name</th><th>Total</th></tr></thead><tbody>${byPersonRows}</tbody></table>` : ''}
  <div class="footer"><strong>Choices For You</strong> · Cash Manager<br/>Built by Abdo Alasaadi · Report generated ${new Date().toLocaleDateString()}</div>
</body></html>`;
    const win = window.open('', '_blank');
    win.document.write(html);
    win.document.close();
    setTimeout(() => { win.print(); setPdfLoading(false); }, 800);
  };

  if (!user) return (
    <div style={{ margin: 0, background: C.bg, color: '#fff', fontFamily: "'Inter',-apple-system,sans-serif", minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px 20px' }}>
      <div style={{ background: C.surf, border: `1px solid ${C.bord}`, borderRadius: 24, padding: '32px 20px', width: '100%', maxWidth: 400 }}>
        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <img src="/logo.png" alt="Logo" style={{ width: 64, height: 64, objectFit: 'contain', background: '#111', borderRadius: 16, padding: 8, marginBottom: 14 }} />
          <div style={{ fontSize: 26, fontWeight: 700, color: C.gold }}>Choices For You</div>
          <div style={{ width: 36, height: 2, background: C.gold, margin: '8px auto', borderRadius: 2, opacity: .5 }} />
          <div style={{ fontSize: 11, color: C.muted, letterSpacing: 3, textTransform: 'uppercase' }}>Cash Manager</div>
        </div>
        <div style={{ fontSize: 14, color: C.muted, textAlign: 'center', marginBottom: 24 }}>Enter your PIN to sign in</div>
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
          Built by <strong style={{ color: C.gold }}>Abdo Alasaadi</strong><br />Need help? Contact me
        </div>
      </div>
    </div>
  );

  const tabs = user.role === 'admin'
    ? [['today','🏠','Today'],['cashout','💸','Cash Out'],['reports','📊','Reports']]
    : [['today','🏠','Today'],['cashout','💸','Cash Out']];

  return (
    <div style={{ margin: 0, background: C.bg, color: '#fff', fontFamily: "'Inter',-apple-system,sans-serif", minHeight: '100vh', fontSize: 16 }}>

      {/* TOPBAR */}
      <div style={{ background: C.surf, borderBottom: `1px solid ${C.bord}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 16px', height: 56, position: 'sticky', top: 0, zIndex: 40 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <img src="/logo.png" alt="Logo" style={{ width: 32, height: 32, objectFit: 'contain', background: '#111', borderRadius: 8, padding: 3 }} />
          <div>
            <div style={{ fontSize: 15, fontWeight: 700, color: C.gold }}>Choices For You</div>
            <div style={{ fontSize: 9, color: C.muted, letterSpacing: 2, textTransform: 'uppercase' }}>Cash Manager</div>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ fontSize: 12, color: C.muted, background: C.surf2, border: `1px solid ${C.bord}`, borderRadius: 20, padding: '5px 12px' }}>
            {user.name}{user.role === 'admin' ? ' ★' : ''}
          </div>
          <button onClick={logout} style={{ background: 'none', border: `1px solid ${C.bord}`, color: C.muted, fontSize: 13, padding: '6px 12px', borderRadius: 8, cursor: 'pointer', fontFamily: 'inherit' }}>Sign out</button>
        </div>
      </div>

      {/* TODAY */}
      {page === 'today' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12, padding: '14px 14px 90px' }}>
          <div style={{ fontSize: 12, color: C.muted, letterSpacing: 2, textTransform: 'uppercase' }}>● Live · Today</div>

          {dashLoading ? (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16, padding: '60px 20px' }}>
              <RamLoader />
              <div style={{ fontSize: 11, color: C.muted, letterSpacing: 2, textTransform: 'uppercase' }}>Loading...</div>
            </div>
          ) : (
            <>
              <div style={{ position: 'sticky', top: 56, zIndex: 39, background: C.bg, paddingBottom: 4 }}>
                <div style={{ background: 'linear-gradient(135deg, rgba(212,168,67,.2), rgba(212,168,67,.05))', border: '1px solid rgba(212,168,67,.4)', borderRadius: 14, padding: '12px 18px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div>
                    <div style={{ fontSize: 10, color: C.gold, textTransform: 'uppercase', letterSpacing: 2, marginBottom: 3 }}>Expected in Drawer</div>
                    <div style={{ fontSize: 28, fontWeight: 700, color: C.gold, lineHeight: 1 }}>{fmt(expectedInDrawer)}</div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: 10, color: C.muted, marginBottom: 4 }}>{fmt(dash?.openingAmount)} + {fmt(dash?.cashIn)} − {fmt(dash?.cashOut)}</div>
                    {diff !== null && (
                      <div style={{ fontSize: 13, fontWeight: 700, padding: '5px 10px', borderRadius: 8, background: Math.abs(diff) < 0.01 ? 'rgba(45,182,125,.2)' : diff > 0 ? 'rgba(255,209,102,.2)' : 'rgba(224,82,82,.2)', color: Math.abs(diff) < 0.01 ? C.green : diff > 0 ? '#ffd166' : C.red }}>
                        {Math.abs(diff) < 0.01 ? '✓ Match' : diff > 0 ? `+${fmt(diff)} Over` : `${fmt(diff)} Short`}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                <MC label="Cash In" value={fmt(dash?.cashIn)} sub={`${dash?.cashInTxn || 0} transactions`} c1="rgba(45,182,125,.15)" c2="#2db67d" />
                <MC label="Cash Out" value={fmt(dash?.cashOut)} sub={`${dash?.cashOutEntries?.length || 0} entries`} c1="rgba(224,82,82,.15)" c2="#e05252" />
                <MC label="Opening" value={fmt(dash?.openingAmount)} sub={dash?.openingAmount > 0 ? 'set today' : 'not set'} c1="rgba(91,138,240,.15)" c2="#5b8af0" />
                <MC label="Closing" value={dash?.closingAmount > 0 ? fmt(dash.closingAmount) : '—'} sub="end of day" c1="rgba(212,168,67,.15)" c2="#d4a843" />
              </div>

              <div style={card}>
                <div style={{ textAlign: 'center', background: C.surf2, borderRadius: 14, padding: '18px 12px' }}>
                  <div style={{ fontSize: 11, color: C.muted, textTransform: 'uppercase', letterSpacing: 2, marginBottom: 8 }}>Expected in Drawer</div>
                  <div style={{ fontSize: 40, fontWeight: 700, color: C.gold, lineHeight: 1 }}>{fmt(expectedInDrawer)}</div>
                  <div style={{ fontSize: 11, color: C.muted, marginTop: 6 }}>{fmt(dash?.openingAmount)} + {fmt(dash?.cashIn)} − {fmt(dash?.cashOut)}</div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <span style={{ fontSize: 11, color: C.muted, textTransform: 'uppercase', letterSpacing: 1, whiteSpace: 'nowrap' }}>Actual $</span>
                  <input style={{ flex: 1, minWidth: 0, background: C.surf2, border: `1px solid ${C.bord}`, borderRadius: 10, color: '#fff', fontSize: 18, padding: '12px 14px', outline: 'none', fontFamily: 'inherit' }} type="number" placeholder="0.00" inputMode="decimal" value={actual} onChange={e => setActual(e.target.value)} />
                  <div style={{ fontSize: 13, fontWeight: 700, padding: '9px 12px', borderRadius: 10, whiteSpace: 'nowrap', flexShrink: 0, background: diff === null ? C.surf2 : Math.abs(diff) < 0.01 ? 'rgba(45,182,125,.2)' : diff > 0 ? 'rgba(255,209,102,.2)' : 'rgba(224,82,82,.2)', color: diff === null ? C.muted : Math.abs(diff) < 0.01 ? C.green : diff > 0 ? '#ffd166' : C.red }}>
                    {diff === null ? '—' : Math.abs(diff) < 0.01 ? '✓ Match' : diff > 0 ? `+${fmt(diff)}` : fmt(diff)}
                  </div>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                  <div style={fld}><label style={flbl}>Opening ($)</label><input style={inp} type="number" placeholder="200.00" inputMode="decimal" value={openingAmt} onChange={e => setOpeningAmt(e.target.value)} /></div>
                  <div style={fld}><label style={flbl}>Closing ($)</label><input style={inp} type="number" placeholder="850.00" inputMode="decimal" value={closingAmt} onChange={e => setClosingAmt(e.target.value)} /></div>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                  <button style={btnG} onClick={() => saveDrawer('opening')}>Set Opening</button>
                  <button style={btnG} onClick={() => saveDrawer('closing')}>Set Closing</button>
                </div>
              </div>

              <div style={card}>
                <div style={{ fontSize: 18, fontWeight: 700 }}>Today's Cash Out</div>
                {!dash?.cashOutEntries?.length
                  ? <div style={{ textAlign: 'center', padding: 20, color: C.muted, fontSize: 14 }}>No entries yet today.</div>
                  : <div style={{ overflowX: 'auto' }}>
                      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14, minWidth: 320 }}>
                        <thead><tr>{['Time','Who','Amount','Reason', user.role==='admin' ? '' : null].filter(h => h !== null).map((h,i) => <th key={i} style={{ background: C.surf2, color: C.muted, fontSize: 11, letterSpacing: 1, padding: '10px 12px', textAlign: 'left', textTransform: 'uppercase', borderBottom: `1px solid ${C.bord}`, whiteSpace: 'nowrap' }}>{h}</th>)}</tr></thead>
                        <tbody>{dash.cashOutEntries.map((e, i) => (
                          <tr key={i}>
                            <td style={{ padding: '11px 12px', borderBottom: `1px solid rgba(255,255,255,.05)`, color: C.muted, fontSize: 12 }}>{e.time}</td>
                            <td style={{ padding: '11px 12px', borderBottom: `1px solid rgba(255,255,255,.05)` }}>{e.who}</td>
                            <td style={{ padding: '11px 12px', borderBottom: `1px solid rgba(255,255,255,.05)`, color: C.red, fontWeight: 600 }}>{fmt(e.amount)}</td>
                            <td style={{ padding: '11px 12px', borderBottom: `1px solid rgba(255,255,255,.05)`, color: C.muted }}>{e.reason}</td>
                            {user.role === 'admin' && <td style={{ padding: '11px 12px', borderBottom: `1px solid rgba(255,255,255,.05)` }}><button onClick={() => delEntry(e.rowIndex)} style={{ background: 'none', border: `1px solid ${C.bord}`, borderRadius: 6, color: C.muted, cursor: 'pointer', fontSize: 12, padding: '4px 8px' }}>✕</button></td>}
                          </tr>
                        ))}</tbody>
                      </table>
                    </div>}
              </div>

              <div style={{ textAlign: 'center', padding: 14, borderTop: `1px solid ${C.bord}`, fontSize: 12, color: C.muted, lineHeight: 1.8 }}>
                Built by <strong style={{ color: C.gold }}>Abdo Alasaadi</strong><br />Need help? Contact me
              </div>
            </>
          )}
        </div>
      )}

      {/* CASH OUT */}
      {page === 'cashout' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12, padding: '14px 14px 90px' }}>
          <div style={{ fontSize: 12, color: C.muted, letterSpacing: 2, textTransform: 'uppercase' }}>Report Cash Out</div>
          <div style={card}>
            <div style={{ fontSize: 18, fontWeight: 700 }}>New Entry</div>
            <div style={fld}><label style={flbl}>Who</label>
              <select style={inp} value={outWho} onChange={e => setOutWho(e.target.value)}>
                <option value="">Select name...</option>
                <option>Abdo</option><option>Fares</option><option>Assim</option><option>Kamal</option>
              </select>
            </div>
            <div style={fld}><label style={flbl}>Amount ($)</label><input style={inp} type="number" placeholder="0.00" inputMode="decimal" value={outAmt} onChange={e => setOutAmt(e.target.value)} /></div>
            <div style={fld}><label style={flbl}>Reason</label>
              <select style={inp} value={outReason} onChange={e => { setOutReason(e.target.value); if (e.target.value !== 'Employee Pay') setOutHours(''); }}>
                <option value="">Select reason...</option>
                <option>Bank Deposit</option><option>Refund</option><option>Supplier Payment</option>
                <option>Store Expense</option><option>Employee Pay</option><option>Adjustment</option><option>Other</option>
              </select>
            </div>
            {outReason === 'Employee Pay' && <div style={fld}><label style={flbl}>Hours Worked</label><input style={inp} type="number" placeholder="e.g. 8" inputMode="decimal" value={outHours} onChange={e => setOutHours(e.target.value)} /></div>}
            <div style={fld}><label style={flbl}>Note (optional)</label><input style={inp} type="text" placeholder="Add details..." value={outNote} onChange={e => setOutNote(e.target.value)} /></div>
            <button style={btn} onClick={confirmOut}>Review & Submit</button>
          </div>
        </div>
      )}

      {/* REPORTS */}
      {page === 'reports' && user.role === 'admin' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12, padding: '14px 14px 90px' }}>
          <div style={{ fontSize: 12, color: C.muted, letterSpacing: 2, textTransform: 'uppercase' }}>Reports & History</div>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {[[7,'7 days'],[14,'14 days'],[30,'30 days']].map(([d,l]) => (
              <button key={d} onClick={() => setPreset(d)} style={{ background: C.surf2, border: `1px solid ${C.bord}`, borderRadius: 20, color: C.muted, cursor: 'pointer', fontSize: 13, padding: '7px 14px', fontFamily: 'inherit' }}>{l}</button>
            ))}
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            <div style={fld}><label style={flbl}>Start</label><input style={inp} type="date" value={rptStart} onChange={e => setRptStart(e.target.value)} /></div>
            <div style={fld}><label style={flbl}>End</label><input style={inp} type="date" value={rptEnd} onChange={e => setRptEnd(e.target.value)} /></div>
          </div>
          <button style={btn} onClick={loadReport}>Pull Report</button>

          {rptLoading && (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16, padding: '60px 20px' }}>
              <RamLoader />
              <div style={{ fontSize: 11, color: C.muted, letterSpacing: 2, textTransform: 'uppercase' }}>Loading...</div>
            </div>
          )}

          {rptData && !rptLoading && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }} ref={reportRef}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 8 }}>
                {[
                  ['Cash In',  fmt(rptData.totalIn),              C.gold],
                  ['Cash Out', fmt(rptData.totalOut),             C.red],
                  ['Days',     String(rptData.days?.length ?? 0), C.blue],
                  ['Over',     String(rptData.overCount  ?? 0),   '#ffd166'],
                  ['Short',    String(rptData.shortCount ?? 0),   C.red],
                  ['Match',    String(rptData.matchCount ?? 0),   C.green],
                ].map(([l,v,c]) => (
                  <div key={l} style={{ background: C.surf, border: `1px solid ${C.bord}`, borderRadius: 14, padding: '14px 10px', textAlign: 'center' }}>
                    <div style={{ fontSize: 18, fontWeight: 700, color: c }}>{v}</div>
                    <div style={{ fontSize: 10, color: C.muted, textTransform: 'uppercase', letterSpacing: 1, marginTop: 4 }}>{l}</div>
                  </div>
                ))}
              </div>

              <Chart days={rptData.days} />

              {rptData.days && rptData.days.length > 0 && (
                <div style={{ background: C.surf, border: `1px solid ${C.bord}`, borderRadius: 14, overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14, minWidth: 340 }}>
                    <thead><tr>{['Date','Cash In','Txn','Out','Diff'].map(h => <th key={h} style={{ background: C.surf2, color: C.muted, fontSize: 11, letterSpacing: 1, padding: '10px 12px', textAlign: 'left', textTransform: 'uppercase', borderBottom: `1px solid ${C.bord}`, whiteSpace: 'nowrap' }}>{h}</th>)}</tr></thead>
                    <tbody>{[...rptData.days].reverse().map((d, i) => (
                      <tr key={i}>
                        <td style={{ padding: '11px 12px', borderBottom: `1px solid rgba(255,255,255,.05)`, color: C.muted, fontSize: 12 }}>{String(d.date)}</td>
                        <td style={{ padding: '11px 12px', borderBottom: `1px solid rgba(255,255,255,.05)`, color: C.green, fontWeight: 600 }}>{fmt(d.cashIn)}</td>
                        <td style={{ padding: '11px 12px', borderBottom: `1px solid rgba(255,255,255,.05)`, color: C.muted }}>{String(d.cashInTxn)}</td>
                        <td style={{ padding: '11px 12px', borderBottom: `1px solid rgba(255,255,255,.05)`, color: C.red }}>{fmt(d.cashOut)}</td>
                        <td style={{ padding: '11px 12px', borderBottom: `1px solid rgba(255,255,255,.05)` }}>
                          {d.diff == null ? <span style={{ color: C.muted }}>—</span>
                            : Math.abs(d.diff) < 0.01 ? <span style={{ color: C.green }}>✓</span>
                            : d.diff > 0 ? <span style={{ color: '#ffd166' }}>+{fmt(d.diff)}</span>
                            : <span style={{ color: C.red }}>{fmt(d.diff)}</span>}
                        </td>
                      </tr>
                    ))}</tbody>
                  </table>
                </div>
              )}

              {rptData.cashOutEntries && rptData.cashOutEntries.length > 0 && (
                <div style={card}>
                  <div style={{ fontSize: 16, fontWeight: 700 }}>Cash Out Entries</div>
                  <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14, minWidth: 380 }}>
                      <thead><tr>{['Date','Time','Who','Amount','Reason','Note'].map(h => (
                        <th key={h} style={{ background: C.surf2, color: C.muted, fontSize: 11, letterSpacing: 1, padding: '10px 12px', textAlign: 'left', textTransform: 'uppercase', borderBottom: `1px solid ${C.bord}`, whiteSpace: 'nowrap' }}>{h}</th>
                      ))}</tr></thead>
                      <tbody>{rptData.cashOutEntries.map((e, i) => (
                        <tr key={i}>
                          <td style={{ padding: '10px 12px', borderBottom: `1px solid rgba(255,255,255,.05)`, color: C.muted, fontSize: 12 }}>{e.date}</td>
                          <td style={{ padding: '10px 12px', borderBottom: `1px solid rgba(255,255,255,.05)`, color: C.muted, fontSize: 12 }}>{e.time}</td>
                          <td style={{ padding: '10px 12px', borderBottom: `1px solid rgba(255,255,255,.05)` }}>{e.who}</td>
                          <td style={{ padding: '10px 12px', borderBottom: `1px solid rgba(255,255,255,.05)`, color: C.red, fontWeight: 600 }}>{fmt(e.amount)}</td>
                          <td style={{ padding: '10px 12px', borderBottom: `1px solid rgba(255,255,255,.05)`, color: C.muted }}>{e.reason}</td>
                          <td style={{ padding: '10px 12px', borderBottom: `1px solid rgba(255,255,255,.05)`, color: C.muted, fontSize: 12 }}>{e.note || '—'}</td>
                        </tr>
                      ))}</tbody>
                    </table>
                  </div>
                </div>
              )}

              <button style={{ ...btn, background: '#1a1a20', border: `1px solid ${C.bord}`, color: C.gold, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }} onClick={exportPDF} disabled={pdfLoading}>
                {pdfLoading ? 'Generating...' : '📄 Export PDF'}
              </button>
            </div>
          )}
        </div>
      )}

      {/* BOTTOM NAV */}
      <div style={{ position: 'fixed', bottom: 0, left: 0, right: 0, background: C.surf, borderTop: `1px solid ${C.bord}`, display: 'flex', zIndex: 40 }}>
        {tabs.map(([id, ic, lb]) => (
          <button key={id} onClick={() => setPage(id)} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '12px 6px 10px', cursor: 'pointer', background: 'none', border: 'none', color: page === id ? C.gold : C.muted, gap: 5, fontFamily: 'inherit' }}>
            <span style={{ fontSize: 22 }}>{ic}</span>
            <span style={{ fontSize: 10, fontWeight: 500 }}>{lb}</span>
          </button>
        ))}
      </div>

      {/* CONFIRM SHEET */}
      {confirmSheet && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.85)', zIndex: 100, display: 'flex', alignItems: 'flex-end', justifyContent: 'center' }} onClick={e => e.target === e.currentTarget && setConfirmSheet(false)}>
          <div style={{ background: C.surf, border: `1px solid ${C.bord}`, borderRadius: '28px 28px 0 0', padding: '12px 20px 48px', width: '100%', display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div style={{ width: 40, height: 4, background: '#2a2a35', borderRadius: 2, margin: '0 auto 6px' }} />
            <div style={{ fontSize: 36, textAlign: 'center' }}>💸</div>
            <div style={{ fontSize: 22, fontWeight: 700, textAlign: 'center' }}>Confirm Cash Out</div>
            <div style={{ fontSize: 14, color: C.muted, textAlign: 'center' }}>Review before submitting.</div>
            <div style={{ background: C.surf2, border: `1px solid ${C.bord}`, borderRadius: 14, padding: '4px 16px' }}>
              {[['Who', pending?.who],['Amount', fmt(pending?.amt)],['Reason', pending?.reason], pending?.note ? ['Note', pending.note] : null].filter(Boolean).map(([l,v], i, arr) => (
                <div key={l} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 0', borderBottom: i < arr.length-1 ? `1px solid ${C.bord}` : 'none' }}>
                  <span style={{ color: C.muted, fontSize: 15 }}>{l}</span>
                  <span style={{ color: l === 'Amount' ? C.gold : '#fff', fontWeight: 600, fontSize: 15 }}>{v}</span>
                </div>
              ))}
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              <button style={btnG} onClick={() => setConfirmSheet(false)}>Cancel</button>
              <button style={btn} onClick={submitOut}>Submit</button>
            </div>
          </div>
        </div>
      )}

      {/* SUCCESS SHEET */}
      {successSheet && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.85)', zIndex: 100, display: 'flex', alignItems: 'flex-end', justifyContent: 'center' }} onClick={e => e.target === e.currentTarget && setSuccessSheet(false)}>
          <div style={{ background: C.surf, border: `1px solid ${C.bord}`, borderRadius: '28px 28px 0 0', padding: '12px 20px 48px', width: '100%', display: 'flex', flexDirection: 'column', gap: 14, alignItems: 'center' }}>
            <div style={{ width: 40, height: 4, background: '#2a2a35', borderRadius: 2 }} />
            <div style={{ fontSize: 36 }}>✅</div>
            <div style={{ fontSize: 22, fontWeight: 700 }}>Done!</div>
            <div style={{ fontSize: 14, color: C.muted, textAlign: 'center' }}>{successMsg}</div>
            <button style={{ ...btn, marginTop: 8 }} onClick={() => setSuccessSheet(false)}>Close</button>
          </div>
        </div>
      )}

      {/* TOAST */}
      {toast && (
        <div style={{ position: 'fixed', bottom: 90, left: '50%', transform: 'translateX(-50%)', background: C.surf, border: `1px solid ${toast.type === 'err' ? 'rgba(224,82,82,.5)' : 'rgba(212,168,67,.5)'}`, borderRadius: 14, padding: '13px 22px', fontSize: 14, zIndex: 200, whiteSpace: 'nowrap', color: toast.type === 'err' ? C.red : C.gold }}>
          {toast.msg}
        </div>
      )}

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}