import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { supabase, isSupabaseConfigured } from '../lib/supabase';

function pad(n) { return String(n).padStart(2, '0'); }
function fmtDur(ms) {
  const t = Math.floor(Math.max(0, ms) / 1000);
  return `${pad(Math.floor(t / 3600))}:${pad(Math.floor((t % 3600) / 60))}:${pad(t % 60)}`;
}
function fmtTime(d) { return new Date(d).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true }); }

const POSTS = [
  { id: 'gate-a', name: 'Gate A - Main Entrance', zone: 'Zone A', addr: 'Building 1, Main Road' },
  { id: 'gate-b', name: 'Gate B - Back Entrance', zone: 'Zone B', addr: 'Building 1, Service Road' },
  { id: 'parking', name: 'Parking Area', zone: 'Zone A', addr: 'Basement Level 1-2' },
  { id: 'lobby', name: 'Building Lobby', zone: 'Zone C', addr: 'Ground Floor, Tower 1' },
  { id: 'perimeter', name: 'Perimeter Patrol', zone: 'Zone D', addr: 'Outer Boundary' },
  { id: 'rooftop', name: 'Rooftop Access', zone: 'Zone C', addr: 'Floor 15, Tower 1' },
];

function CommandCenter() {
  const { user, profile } = useAuth();
  const [entry, setEntry] = useState(null);
  const [elapsed, setElapsed] = useState(0);
  const [brkElapsed, setBrkElapsed] = useState(0);
  const [post, setPost] = useState('');
  const [busy, setBusy] = useState(false);
  const [ready, setReady] = useState(false);
  const [hist, setHist] = useState([]);
  const [logs, setLogs] = useState([]);
  const [now, setNow] = useState(new Date());
  const [gps, setGps] = useState('idle');

  const onBreak = !!entry?.break_start;
  const pInfo = POSTS.find(p => p.id === (entry?.post || post));
  const brkTotal = (entry?.break_total_seconds || 0) + (entry?.break_start ? Math.floor(brkElapsed / 1000) : 0);

  useEffect(() => { const i = setInterval(() => setNow(new Date()), 1000); return () => clearInterval(i); }, []);

  const load = useCallback(async () => {
    if (!isSupabaseConfigured || !user) { setReady(true); return; }
    try {
      const { data: o } = await supabase.from('time_entries').select('*').eq('guard_id', user.id).is('clock_out', null).order('clock_in', { ascending: false }).limit(1);
      setEntry(o?.[0] || null); if (o?.[0]?.post) setPost(o[0].post);
      const { data: c } = await supabase.from('time_entries').select('*').eq('guard_id', user.id).not('clock_out', 'is', null).order('clock_in', { ascending: false }).limit(5);
      setHist(c || []);
    } catch (e) {} finally { setReady(true); }
  }, [user]);

  useEffect(() => { load(); }, [load]);
  useEffect(() => { if (!entry) { setElapsed(0); return; } const t = () => setElapsed(Date.now() - new Date(entry.clock_in).getTime()); t(); const i = setInterval(t, 1000); return () => clearInterval(i); }, [entry]);
  useEffect(() => { if (!entry?.break_start) { setBrkElapsed(0); return; } const t = () => setBrkElapsed(Date.now() - new Date(entry.break_start).getTime()); t(); const i = setInterval(t, 1000); return () => clearInterval(i); }, [entry?.break_start]);

  function addLog(a) { setLogs(p => [{ a, t: new Date().toISOString(), id: Date.now() }, ...p].slice(0, 8)); }

  function getLoc() {
    return new Promise(res => {
      if (!navigator.geolocation) { res(null); return; }
      setGps('locating');
      navigator.geolocation.getCurrentPosition(
        p => { setGps('ok'); res({ lat: p.coords.latitude, lng: p.coords.longitude }); },
        () => { setGps('denied'); res(null); },
        { enableHighAccuracy: true, timeout: 10000 }
      );
    });
  }

  async function doCheckIn() {
    if (!post) return; setBusy(true);
    try {
      const loc = await getLoc();
      const row = { guard_id: user.id, clock_in: new Date().toISOString(), post, break_total_seconds: 0 };
      if (loc) { row.clock_in_lat = loc.lat; row.clock_in_lng = loc.lng; }
      const { error } = await supabase.from('time_entries').insert(row); if (error) throw error;
      addLog(loc ? `Checked in \u00B7 GPS captured` : 'Checked in'); await load();
    } catch (e) { alert(e.message); } finally { setBusy(false); }
  }

  async function doCheckOut() {
    if (!entry) return; setBusy(true);
    try {
      const loc = await getLoc();
      const u = { clock_out: new Date().toISOString() };
      if (loc) { u.clock_out_lat = loc.lat; u.clock_out_lng = loc.lng; }
      if (entry.break_start) { u.break_start = null; u.break_total_seconds = (entry.break_total_seconds || 0) + Math.floor((Date.now() - new Date(entry.break_start).getTime()) / 1000); }
      const { error } = await supabase.from('time_entries').update(u).eq('id', entry.id); if (error) throw error;
      addLog('Checked out'); await load();
    } catch (e) { alert(e.message); } finally { setBusy(false); }
  }

  async function doBrkStart() {
    if (!entry || entry.break_start) return; setBusy(true);
    try { const { error } = await supabase.from('time_entries').update({ break_start: new Date().toISOString() }).eq('id', entry.id); if (error) throw error; addLog('Break started'); await load(); } catch (e) { alert(e.message); } finally { setBusy(false); }
  }

  async function doBrkEnd() {
    if (!entry?.break_start) return; setBusy(true);
    try { const s = Math.floor((Date.now() - new Date(entry.break_start).getTime()) / 1000); const { error } = await supabase.from('time_entries').update({ break_start: null, break_total_seconds: (entry.break_total_seconds || 0) + s }).eq('id', entry.id); if (error) throw error; addLog('Break ended'); await load(); } catch (e) { alert(e.message); } finally { setBusy(false); }
  }

  const netMs = elapsed - brkTotal * 1000;
  const pct = entry ? Math.min((elapsed / (8 * 3600000)) * 100, 100) : 0;
  const R = 58, C = 2 * Math.PI * R;

  return (
    <div className="animate-fade-in space-y-5 max-w-[1200px] mx-auto">

      {/* ====== HEADER ====== */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Command Center</h1>
          <p className="text-sm text-gray-400 mt-1">
            {now.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-right hidden md:block">
            <p className="text-xl font-semibold font-mono text-gray-800 tabular-nums">
              {now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true })}
            </p>
          </div>
          <div className={`h-10 px-5 rounded-full flex items-center gap-2 text-sm font-bold
            ${entry ? (onBreak ? 'bg-amber-100 text-amber-700' : 'bg-emerald-100 text-emerald-700') : 'bg-gray-100 text-gray-500'}`}>
            <span className={`w-2 h-2 rounded-full ${entry ? (onBreak ? 'bg-amber-500 animate-pulse' : 'bg-emerald-500 animate-pulse') : 'bg-gray-400'}`} />
            {entry ? (onBreak ? 'On Break' : 'On Duty') : 'Off Duty'}
          </div>
        </div>
      </div>

      {/* ====== MAIN 2-COL ====== */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">

        {/* LEFT - Action Panel */}
        <div className="lg:col-span-3 bg-[#111827] rounded-2xl overflow-hidden">

          {/* Timer Section */}
          <div className="px-8 pt-8 pb-6 flex items-center gap-8">
            {/* Ring */}
            <div className="relative w-32 h-32 flex-shrink-0">
              <svg className="w-full h-full -rotate-90" viewBox="0 0 128 128">
                <circle cx="64" cy="64" r={R} fill="none" stroke="#1f2937" strokeWidth="6" />
                <circle cx="64" cy="64" r={R} fill="none"
                  stroke={onBreak ? '#f59e0b' : entry ? '#10b981' : '#374151'}
                  strokeWidth="6" strokeLinecap="round"
                  strokeDasharray={`${(pct / 100) * C} ${C}`}
                  className="transition-all duration-1000" />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-[22px] font-bold font-mono text-white tabular-nums tracking-tight">
                  {fmtDur(elapsed)}
                </span>
                <span className="text-[10px] uppercase tracking-widest text-gray-500 mt-1">elapsed</span>
              </div>
            </div>

            {/* Breakdown */}
            <div className="flex-1 space-y-4">
              <div className="flex items-baseline justify-between">
                <span className="text-[11px] uppercase tracking-wider text-gray-500">Net Work</span>
                <span className="text-2xl font-bold font-mono text-emerald-400 tabular-nums">{fmtDur(Math.max(0, netMs))}</span>
              </div>
              <div className="h-px bg-gray-700/50" />
              <div className="flex items-baseline justify-between">
                <span className="text-[11px] uppercase tracking-wider text-gray-500">Break</span>
                <span className="text-2xl font-bold font-mono text-amber-400 tabular-nums">{fmtDur(brkTotal * 1000)}</span>
              </div>
              {entry && (
                <p className="text-[12px] text-gray-600">
                  Clocked in at <span className="text-gray-400">{fmtTime(entry.clock_in)}</span>
                </p>
              )}
            </div>
          </div>

          {/* Divider */}
          <div className="h-px bg-gray-700/30 mx-8" />

          {/* Controls */}
          <div className="p-8 space-y-5">
            {/* Post */}
            <div>
              <label className="text-[11px] font-semibold uppercase tracking-wider text-gray-500 mb-2 block">
                Assigned Post {!entry && <span className="text-amber-500 normal-case">(select to check in)</span>}
              </label>
              <div className="relative">
                <select value={entry?.post || post} onChange={e => setPost(e.target.value)} disabled={!!entry}
                  className="w-full bg-[#1f2937] border border-gray-700 text-gray-300 rounded-xl pl-4 pr-10 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 disabled:opacity-50 appearance-none transition-colors">
                  <option value="">-- Select --</option>
                  {POSTS.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                </select>
                <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-600">
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor"><path d="M4 6l4 4 4-4" /></svg>
                </div>
              </div>
            </div>

            {/* Buttons */}
            {!entry ? (
              <button onClick={doCheckIn} disabled={busy || !post || !ready}
                className="w-full h-14 bg-emerald-500 hover:bg-emerald-400 text-white font-bold text-sm uppercase tracking-wider rounded-xl transition-all disabled:opacity-30 disabled:cursor-not-allowed active:scale-[0.98]">
                {busy ? 'Locating & Processing...' : 'Check In'}
              </button>
            ) : (
              <div className="grid grid-cols-2 gap-3">
                <button onClick={doCheckOut} disabled={busy}
                  className="h-14 bg-white/10 hover:bg-white/15 backdrop-blur text-white font-bold text-sm uppercase tracking-wider rounded-xl border border-white/10 transition-all disabled:opacity-40 active:scale-[0.98]">
                  Check Out
                </button>
                {!onBreak ? (
                  <button onClick={doBrkStart} disabled={busy}
                    className="h-14 bg-amber-500 hover:bg-amber-400 text-white font-bold text-sm uppercase tracking-wider rounded-xl transition-all disabled:opacity-40 active:scale-[0.98]">
                    Start Break
                  </button>
                ) : (
                  <button onClick={doBrkEnd} disabled={busy}
                    className="h-14 bg-indigo-500 hover:bg-indigo-400 text-white font-bold text-sm uppercase tracking-wider rounded-xl transition-all disabled:opacity-40 active:scale-[0.98] animate-pulse-slow">
                    End Break
                  </button>
                )}
              </div>
            )}

            {/* Break info */}
            <div className="flex items-center justify-between text-[12px] text-gray-600 px-1">
              <span>Break: <span className={onBreak ? 'text-amber-400 font-semibold' : 'text-gray-500'}>{onBreak ? 'Active' : 'Inactive'}</span></span>
              <span>Total break: {Math.floor(brkTotal / 60)}m {brkTotal % 60}s</span>
            </div>
          </div>
        </div>

        {/* RIGHT */}
        <div className="lg:col-span-2 space-y-5">

          {/* Post Info */}
          <div className="bg-white rounded-2xl border border-gray-200/60 p-6 shadow-sm">
            <p className="text-[11px] font-bold uppercase tracking-[0.15em] text-gray-400 mb-4">Assigned Details</p>
            {pInfo ? (
              <>
                <p className="text-lg font-bold text-gray-900 leading-snug">{pInfo.name}</p>
                <p className="text-sm text-gray-500 mt-1.5">Area: <span className="text-gray-700 font-medium">{pInfo.zone}</span></p>
                <p className="text-sm text-gray-400 mt-0.5">{pInfo.addr}</p>
              </>
            ) : (
              <p className="text-sm text-gray-400 italic">Select a post to see details</p>
            )}
            <div className="mt-5 pt-4 border-t border-gray-100 space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold uppercase tracking-[0.15em] text-gray-400">Tracking</span>
                <span className={`flex items-center gap-1.5 text-xs font-bold ${entry ? 'text-emerald-600' : 'text-gray-400'}`}>
                  <span className={`w-2 h-2 rounded-full ${entry ? 'bg-emerald-500 animate-pulse' : 'bg-gray-300'}`} />
                  {entry ? 'Active' : 'Inactive'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold uppercase tracking-[0.15em] text-gray-400">GPS</span>
                <span className={`flex items-center gap-1.5 text-xs font-semibold ${gps === 'ok' ? 'text-emerald-600' : gps === 'denied' ? 'text-red-500' : gps === 'locating' ? 'text-blue-500' : 'text-gray-400'}`}>
                  <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd"/></svg>
                  {gps === 'ok' ? 'Captured' : gps === 'locating' ? 'Locating...' : gps === 'denied' ? 'Denied' : 'Standby'}
                </span>
              </div>
              {entry?.clock_in_lat && (
                <p className="text-[11px] font-mono text-gray-400 bg-gray-50 rounded-lg px-3 py-1.5">
                  {entry.clock_in_lat.toFixed(6)}, {entry.clock_in_lng.toFixed(6)}
                </p>
              )}
            </div>
          </div>

          {/* Summary */}
          <div className="bg-white rounded-2xl border border-gray-200/60 p-6 shadow-sm">
            <p className="text-[11px] font-bold uppercase tracking-[0.15em] text-gray-400 mb-4">Shift Summary</p>
            <div className="space-y-3">
              {[
                { l: 'Checked In', v: entry ? fmtTime(entry.clock_in) : '--', mono: false },
                { l: 'Elapsed', v: fmtDur(elapsed), mono: true },
                { l: 'Break', v: fmtDur(brkTotal * 1000), mono: true, amber: true },
              ].map((r, i) => (
                <div key={i} className="flex justify-between items-center text-sm">
                  <span className="text-gray-400">{r.l}</span>
                  <span className={`font-semibold ${r.mono ? 'font-mono tabular-nums' : ''} ${r.amber ? 'text-amber-500' : 'text-gray-800'}`}>{r.v}</span>
                </div>
              ))}
              <div className="border-t border-gray-100 pt-3 flex justify-between items-center">
                <span className="text-sm font-bold text-gray-700">Net Working</span>
                <span className="text-lg font-extrabold font-mono tabular-nums text-emerald-600">{fmtDur(Math.max(0, netMs))}</span>
              </div>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-3 gap-3">
            {[
              { v: hist.filter(e => new Date(e.clock_in).toDateString() === now.toDateString()).length + (entry ? 1 : 0), l: 'Entries', bg: 'bg-blue-50 text-blue-700' },
              { v: fmtDur(hist.filter(e => new Date(e.clock_in).toDateString() === now.toDateString()).reduce((s, e) => s + (new Date(e.clock_out) - new Date(e.clock_in)), 0) + (entry ? elapsed : 0)).slice(0, 5), l: 'Today', bg: 'bg-emerald-50 text-emerald-700' },
              { v: `${Math.floor(brkTotal / 60)}m`, l: 'Break', bg: 'bg-amber-50 text-amber-700' },
            ].map((s, i) => (
              <div key={i} className={`rounded-xl p-3.5 text-center ${s.bg}`}>
                <p className="text-xl font-bold tabular-nums">{s.v}</p>
                <p className="text-[10px] font-semibold uppercase mt-0.5 opacity-60">{s.l}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ====== BOTTOM ====== */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">

        {/* Timeline */}
        <div className="lg:col-span-3 bg-white rounded-2xl border border-gray-200/60 p-6 shadow-sm">
          <p className="text-[11px] font-bold uppercase tracking-[0.15em] text-gray-400 mb-5">Activity Timeline</p>
          {logs.length === 0 && hist.length === 0 ? (
            <div className="py-10 text-center">
              <p className="text-4xl mb-3 opacity-20">&#128337;</p>
              <p className="text-sm text-gray-400">No activity recorded yet</p>
              <p className="text-xs text-gray-300 mt-1">Check in to start your shift</p>
            </div>
          ) : (
            <div className="relative pl-6 space-y-4">
              <div className="absolute left-[7px] top-1 bottom-1 w-px bg-gray-100" />
              {logs.map(l => (
                <div key={l.id} className="relative flex items-start gap-3">
                  <div className={`absolute left-[-17px] w-4 h-4 rounded-full border-[3px] border-white
                    ${l.a.includes('in') ? 'bg-emerald-500' : l.a.includes('out') ? 'bg-red-400' : l.a.includes('started') ? 'bg-amber-400' : 'bg-indigo-500'}`} />
                  <div>
                    <p className="text-sm font-medium text-gray-700">{l.a}</p>
                    <p className="text-xs text-gray-400 mt-0.5">{fmtTime(l.t)}</p>
                  </div>
                </div>
              ))}
              {hist.map(e => (
                <div key={e.id} className="relative flex items-start gap-3">
                  <div className="absolute left-[-17px] w-4 h-4 rounded-full border-[3px] border-white bg-gray-300" />
                  <div>
                    <p className="text-sm text-gray-500">Shift completed <span className="font-mono text-gray-400">{fmtDur(new Date(e.clock_out) - new Date(e.clock_in))}</span></p>
                    <p className="text-xs text-gray-400 mt-0.5">{fmtTime(e.clock_in)} &ndash; {fmtTime(e.clock_out)}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Guard Card */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-200/60 p-6 shadow-sm">
          <p className="text-[11px] font-bold uppercase tracking-[0.15em] text-gray-400 mb-5">Guard Information</p>
          <div className="flex items-center gap-4 mb-5">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white text-xl font-bold shadow-lg shadow-indigo-200">
              {(profile?.full_name || 'G')[0].toUpperCase()}
            </div>
            <div>
              <p className="text-base font-bold text-gray-900">{profile?.full_name || 'Guard'}</p>
              <p className="text-xs text-gray-400">Security Personnel</p>
            </div>
          </div>
          <div className="space-y-3 text-sm">
            {[
              { l: 'ID', v: user?.id?.slice(0, 8)?.toUpperCase() || '--' },
              { l: 'Email', v: profile?.email || '--' },
              { l: 'Phone', v: profile?.phone || '--' },
              { l: 'Status', v: entry ? (onBreak ? 'On Break' : 'Active') : 'Off Duty' },
            ].map((r, i) => (
              <div key={i} className="flex justify-between py-1.5 border-b border-gray-50 last:border-0">
                <span className="text-gray-400">{r.l}</span>
                <span className="font-medium text-gray-700">{r.v}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default CommandCenter;
