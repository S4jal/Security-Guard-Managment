import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { supabase, isSupabaseConfigured } from '../lib/supabase';

function fmt(ms) {
  const s = Math.floor(Math.max(0, ms) / 1000);
  return `${String(Math.floor(s / 3600)).padStart(2, '0')}:${String(Math.floor((s % 3600) / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;
}
function fmtTime(d) { return new Date(d).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true }); }

const POSTS = [
  { id: 'gate-a', name: 'Gate A - Main Entrance', zone: 'Zone A', address: 'Building 1, Main Road' },
  { id: 'gate-b', name: 'Gate B - Back Entrance', zone: 'Zone B', address: 'Building 1, Service Road' },
  { id: 'parking', name: 'Parking Area', zone: 'Zone A', address: 'Basement Level 1-2' },
  { id: 'lobby', name: 'Building Lobby', zone: 'Zone C', address: 'Ground Floor, Tower 1' },
  { id: 'perimeter', name: 'Perimeter Patrol', zone: 'Zone D', address: 'Outer Boundary' },
  { id: 'rooftop', name: 'Rooftop Access', zone: 'Zone C', address: 'Floor 15, Tower 1' },
];

function CommandCenter() {
  const { user, profile } = useAuth();
  const [active, setActive] = useState(null);
  const [elapsed, setElapsed] = useState(0);
  const [breakElapsed, setBreakElapsed] = useState(0);
  const [post, setPost] = useState('');
  const [busy, setBusy] = useState(false);
  const [ready, setReady] = useState(false);
  const [history, setHistory] = useState([]);
  const [logs, setLogs] = useState([]);
  const [now, setNow] = useState(new Date());
  const [gpsStatus, setGpsStatus] = useState('idle'); // idle | locating | granted | denied

  const onBreak = !!active?.break_start;
  const postInfo = POSTS.find(p => p.id === (active?.post || post));

  useEffect(() => { const t = setInterval(() => setNow(new Date()), 1000); return () => clearInterval(t); }, []);

  const load = useCallback(async () => {
    if (!isSupabaseConfigured || !user) { setReady(true); return; }
    try {
      const { data: o } = await supabase.from('time_entries').select('*').eq('guard_id', user.id).is('clock_out', null).order('clock_in', { ascending: false }).limit(1);
      setActive(o?.[0] || null);
      if (o?.[0]?.post) setPost(o[0].post);
      const { data: c } = await supabase.from('time_entries').select('*').eq('guard_id', user.id).not('clock_out', 'is', null).order('clock_in', { ascending: false }).limit(5);
      setHistory(c || []);
    } catch (e) {} finally { setReady(true); }
  }, [user]);

  useEffect(() => { load(); }, [load]);

  useEffect(() => {
    if (!active) { setElapsed(0); return; }
    const t = () => setElapsed(Date.now() - new Date(active.clock_in).getTime());
    t(); const iv = setInterval(t, 1000); return () => clearInterval(iv);
  }, [active]);

  useEffect(() => {
    if (!active?.break_start) { setBreakElapsed(0); return; }
    const t = () => setBreakElapsed(Date.now() - new Date(active.break_start).getTime());
    t(); const iv = setInterval(t, 1000); return () => clearInterval(iv);
  }, [active?.break_start]);

  function log(a) { setLogs(p => [{ a, t: new Date().toISOString(), id: Date.now() }, ...p].slice(0, 10)); }

  function getLocation() {
    return new Promise((resolve) => {
      if (!navigator.geolocation) { resolve(null); return; }
      setGpsStatus('locating');
      navigator.geolocation.getCurrentPosition(
        (pos) => { setGpsStatus('granted'); resolve({ lat: pos.coords.latitude, lng: pos.coords.longitude }); },
        () => { setGpsStatus('denied'); resolve(null); },
        { enableHighAccuracy: true, timeout: 10000 }
      );
    });
  }

  async function checkIn() {
    if (!post) return; setBusy(true);
    try {
      const loc = await getLocation();
      const entry = { guard_id: user.id, clock_in: new Date().toISOString(), post, break_total_seconds: 0 };
      if (loc) { entry.clock_in_lat = loc.lat; entry.clock_in_lng = loc.lng; }
      const { error } = await supabase.from('time_entries').insert(entry);
      if (error) throw error;
      log(loc ? `Checked In (${loc.lat.toFixed(4)}, ${loc.lng.toFixed(4)})` : 'Checked In (no GPS)');
      await load();
    } catch (e) { alert(e.message); } finally { setBusy(false); }
  }
  async function checkOut() {
    if (!active) return; setBusy(true);
    try {
      const loc = await getLocation();
      const u = { clock_out: new Date().toISOString() };
      if (loc) { u.clock_out_lat = loc.lat; u.clock_out_lng = loc.lng; }
      if (active.break_start) { u.break_start = null; u.break_total_seconds = (active.break_total_seconds || 0) + Math.floor((Date.now() - new Date(active.break_start).getTime()) / 1000); }
      const { error } = await supabase.from('time_entries').update(u).eq('id', active.id); if (error) throw error;
      log(loc ? `Checked Out (${loc.lat.toFixed(4)}, ${loc.lng.toFixed(4)})` : 'Checked Out (no GPS)');
      await load();
    } catch (e) { alert(e.message); } finally { setBusy(false); }
  }
  async function breakStart() {
    if (!active || active.break_start) return; setBusy(true);
    try { const { error } = await supabase.from('time_entries').update({ break_start: new Date().toISOString() }).eq('id', active.id); if (error) throw error; log('Break Started'); await load(); } catch (e) { alert(e.message); } finally { setBusy(false); }
  }
  async function breakEnd() {
    if (!active?.break_start) return; setBusy(true);
    try { const s = Math.floor((Date.now() - new Date(active.break_start).getTime()) / 1000); const { error } = await supabase.from('time_entries').update({ break_start: null, break_total_seconds: (active.break_total_seconds || 0) + s }).eq('id', active.id); if (error) throw error; log('Break Ended'); await load(); } catch (e) { alert(e.message); } finally { setBusy(false); }
  }

  const totalBrk = (active?.break_total_seconds || 0) + (active?.break_start ? Math.floor(breakElapsed / 1000) : 0);
  const netMs = elapsed - totalBrk * 1000;

  // Timer ring percentage (max 8 hours = 100%)
  const pct = active ? Math.min((elapsed / (8 * 3600 * 1000)) * 100, 100) : 0;
  const r = 54, c = 2 * Math.PI * r, dash = (pct / 100) * c;

  return (
    <div className="animate-fade-in max-w-6xl mx-auto">

      {/* ==================== TOP BAR ==================== */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 px-6 py-5 mb-5 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900 tracking-tight">Post Operations</h1>
          <p className="text-[13px] text-gray-400 mt-0.5">
            Status: <span className={`font-semibold ${active ? (onBreak ? 'text-amber-500' : 'text-emerald-500') : 'text-gray-400'}`}>
              {active ? (onBreak ? 'On Break' : 'Active On-Site') : 'Off Duty'}
            </span>
          </p>
        </div>
        <div className={`flex items-center gap-2.5 px-5 py-2.5 rounded-full text-[13px] font-bold tracking-wide shadow-sm
          ${active ? (onBreak ? 'bg-amber-400 text-amber-900 shadow-amber-200' : 'bg-emerald-500 text-white shadow-emerald-200') : 'bg-gray-100 text-gray-500'}`}>
          <span className={`w-2 h-2 rounded-full ${active ? 'bg-current animate-pulse' : 'bg-gray-400'}`} style={{ opacity: active ? 0.7 : 1 }} />
          {active ? (onBreak ? 'ON BREAK' : 'ON DUTY') : 'OFF DUTY'}
        </div>
      </div>

      {/* ==================== MAIN GRID ==================== */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 mb-5">

        {/* ===== PERSONNEL ACTION (dark) ===== */}
        <div className="lg:col-span-7 bg-[#0f1923] rounded-2xl p-7 flex flex-col" style={{ minHeight: 420 }}>
          <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-indigo-400 mb-6">Personnel Action</p>

          {/* Post select */}
          <label className="text-[11px] font-bold uppercase tracking-[0.15em] text-gray-500 mb-2 block">
            Select Assigned Post <span className="text-amber-400">{!active ? '(Required for Check In)' : ''}</span>
          </label>
          <div className="relative mb-6">
            <select value={active?.post || post} onChange={e => setPost(e.target.value)} disabled={!!active}
              className="w-full bg-[#1a2836] border border-[#2a3a4a] text-gray-200 rounded-xl px-4 py-3.5 text-sm focus:outline-none focus:border-indigo-500 disabled:opacity-50 appearance-none pr-10">
              <option value="">-- Select --</option>
              {POSTS.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
            <svg className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
          </div>

          {!active && <p className="text-[12px] text-gray-600 -mt-4 mb-6">Tip: If company has no areas, pick the company-only option.</p>}

          {/* Timer when active */}
          {active && (
            <div className="flex items-center justify-center gap-8 mb-6 py-4">
              {/* Ring timer */}
              <div className="relative w-28 h-28 flex-shrink-0">
                <svg className="w-full h-full -rotate-90" viewBox="0 0 120 120">
                  <circle cx="60" cy="60" r={r} fill="none" stroke="#1a2836" strokeWidth="8" />
                  <circle cx="60" cy="60" r={r} fill="none"
                    stroke={onBreak ? '#f59e0b' : '#10b981'} strokeWidth="8" strokeLinecap="round"
                    strokeDasharray={`${dash} ${c}`} className="transition-all duration-1000" />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-[11px] text-gray-500 uppercase">Shift</span>
                  <span className="text-lg font-bold font-mono text-white">{fmt(elapsed).slice(0, 5)}</span>
                </div>
              </div>
              {/* Breakdown */}
              <div className="space-y-3">
                <div>
                  <p className="text-[10px] uppercase tracking-widest text-gray-600">Net Work</p>
                  <p className="text-xl font-bold font-mono text-emerald-400">{fmt(Math.max(0, netMs))}</p>
                </div>
                <div>
                  <p className="text-[10px] uppercase tracking-widest text-gray-600">Break</p>
                  <p className="text-xl font-bold font-mono text-amber-400">{fmt(totalBrk * 1000)}</p>
                </div>
              </div>
            </div>
          )}

          {/* Spacer */}
          <div className="flex-1" />

          {/* Action Buttons */}
          <div className="grid grid-cols-2 gap-3 mb-3">
            {!active ? (
              <button onClick={checkIn} disabled={busy || !post || !ready}
                className="col-span-2 py-4 bg-amber-400 hover:bg-amber-300 text-[#0f1923] font-extrabold text-[13px] uppercase tracking-widest rounded-xl transition-all disabled:opacity-30 disabled:cursor-not-allowed active:scale-[0.98]">
                {busy ? 'Processing...' : 'Check In'}
              </button>
            ) : (
              <>
                <button onClick={checkIn} disabled className="py-3.5 bg-amber-400 text-[#0f1923] font-extrabold text-[13px] uppercase tracking-widest rounded-xl opacity-100 cursor-default">
                  Check In
                </button>
                <button onClick={checkOut} disabled={busy}
                  className="py-3.5 bg-[#1a2836] hover:bg-[#243444] border border-[#2a3a4a] text-gray-300 font-extrabold text-[13px] uppercase tracking-widest rounded-xl transition-all disabled:opacity-40 active:scale-[0.98]">
                  Check Out
                </button>
              </>
            )}
          </div>
          <div className="grid grid-cols-2 gap-3 mb-5">
            {!onBreak ? (
              <button onClick={breakStart} disabled={busy || !active}
                className="py-3.5 bg-[#1a2836] hover:bg-[#243444] border border-[#2a3a4a] text-gray-300 font-extrabold text-[13px] uppercase tracking-widest rounded-xl transition-all disabled:opacity-30 active:scale-[0.98]">
                Break Start
              </button>
            ) : (
              <button onClick={breakEnd} disabled={busy}
                className="py-3.5 bg-indigo-500 hover:bg-indigo-400 text-white font-extrabold text-[13px] uppercase tracking-widest rounded-xl transition-all disabled:opacity-40 animate-pulse-slow active:scale-[0.98]">
                Break End
              </button>
            )}
            <button onClick={onBreak ? breakEnd : breakStart} disabled={busy || !active}
              className="py-3.5 bg-[#1a2836] border border-[#2a3a4a] text-gray-300 font-extrabold text-[13px] uppercase tracking-widest rounded-xl opacity-0 pointer-events-none">
              _
            </button>
          </div>

          {/* Break status bar */}
          <div className="flex items-center justify-between text-[11px] px-1">
            <span className="text-gray-600">
              Break Status: {' '}
              <span className={onBreak ? 'text-amber-400 font-bold' : 'text-gray-500 font-semibold'}>
                {onBreak ? 'ON BREAK' : 'NOT ON BREAK'}
              </span>
            </span>
            <span className="text-gray-600">(Total: {Math.floor(totalBrk / 60)} min)</span>
          </div>
        </div>

        {/* ===== RIGHT COLUMN ===== */}
        <div className="lg:col-span-5 flex flex-col gap-5">

          {/* Assigned Details */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex-1">
            <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-gray-400 mb-5">Assigned Details</p>
            {postInfo ? (
              <div className="mb-6">
                <h3 className="text-[22px] font-bold text-gray-900 leading-tight mb-2">{postInfo.name}</h3>
                <p className="text-[13px] text-gray-500 mb-1">Area: <span className="font-semibold text-gray-700">{postInfo.zone}</span></p>
                <p className="text-[13px] text-gray-400">{postInfo.address}</p>
              </div>
            ) : (
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-300">No post selected</h3>
                <p className="text-[13px] text-gray-400 mt-1">Select a post to view details</p>
              </div>
            )}
            <div className="border-t border-gray-100 pt-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-gray-400">Tracking</span>
                <span className={`flex items-center gap-2 text-[12px] font-bold ${active ? 'text-emerald-500' : 'text-gray-400'}`}>
                  <span className={`w-2.5 h-2.5 rounded-full ${active ? 'bg-emerald-400 shadow-sm shadow-emerald-300' : 'bg-gray-300'}`}>
                    {active && <span className="block w-full h-full rounded-full bg-emerald-400 animate-ping opacity-75" />}
                  </span>
                  {active ? 'ACTIVE' : 'INACTIVE'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-gray-400">GPS</span>
                <span className={`flex items-center gap-1.5 text-[12px] font-semibold
                  ${gpsStatus === 'granted' ? 'text-emerald-500' : gpsStatus === 'denied' ? 'text-red-400' : gpsStatus === 'locating' ? 'text-blue-400' : 'text-gray-400'}`}>
                  <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/></svg>
                  {gpsStatus === 'locating' ? 'Locating...' : gpsStatus === 'granted' ? 'Captured' : gpsStatus === 'denied' ? 'Denied' : 'Waiting'}
                </span>
              </div>
              {active?.clock_in_lat && (
                <div className="bg-gray-50 rounded-lg px-3 py-2 text-[11px] text-gray-400 font-mono">
                  {active.clock_in_lat.toFixed(6)}, {active.clock_in_lng.toFixed(6)}
                </div>
              )}
            </div>
          </div>

          {/* Shift Summary */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-gray-400 mb-5">Shift Summary</p>
            <div className="space-y-4">
              {[
                { l: 'Checked In', v: active ? fmtTime(active.clock_in) : '-- : --', c: 'text-gray-800' },
                { l: 'Elapsed', v: active ? fmt(elapsed) : '00:00:00', c: 'text-gray-800 font-mono' },
                { l: 'Break Time', v: fmt(totalBrk * 1000), c: 'text-amber-500 font-mono' },
              ].map((r, i) => (
                <div key={i} className="flex items-center justify-between">
                  <span className="text-[13px] text-gray-500">{r.l}</span>
                  <span className={`text-[14px] font-semibold ${r.c}`}>{r.v}</span>
                </div>
              ))}
              <div className="border-t border-gray-100 pt-4 flex items-center justify-between">
                <span className="text-[13px] font-bold text-gray-700">Net Working</span>
                <span className="text-[16px] font-extrabold font-mono text-emerald-600">{active ? fmt(Math.max(0, netMs)) : '00:00:00'}</span>
              </div>
            </div>
          </div>

          {/* Live Clock */}
          <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl p-5 text-center">
            <p className="text-[10px] uppercase tracking-[0.2em] text-gray-500 mb-1">{now.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}</p>
            <p className="text-3xl font-bold font-mono text-white tracking-wider">
              {now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true })}
            </p>
          </div>
        </div>
      </div>

      {/* ==================== BOTTOM ==================== */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">

        {/* Activity */}
        <div className="lg:col-span-7 bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-gray-400 mb-5">Activity Timeline</p>
          {logs.length === 0 && history.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center text-xl mb-3 text-gray-300">&#128337;</div>
              <p className="text-[13px] text-gray-400">No activity yet today</p>
              <p className="text-[12px] text-gray-300 mt-1">Check in to start recording</p>
            </div>
          ) : (
            <div className="relative pl-5 border-l-2 border-gray-100 space-y-5">
              {logs.map(l => (
                <div key={l.id} className="relative">
                  <div className={`absolute -left-[25px] w-3 h-3 rounded-full border-2 border-white
                    ${l.a.includes('In') ? 'bg-emerald-500' : l.a.includes('Out') ? 'bg-red-400' : l.a.includes('Started') ? 'bg-amber-400' : 'bg-indigo-500'}`} />
                  <p className="text-[13px] font-semibold text-gray-700">{l.a}</p>
                  <p className="text-[12px] text-gray-400">{fmtTime(l.t)}</p>
                </div>
              ))}
              {history.map(e => (
                <div key={e.id} className="relative">
                  <div className="absolute -left-[25px] w-3 h-3 rounded-full border-2 border-white bg-gray-300" />
                  <p className="text-[13px] text-gray-500">Completed shift &middot; <span className="font-mono font-medium">{fmt(new Date(e.clock_out) - new Date(e.clock_in))}</span></p>
                  <p className="text-[12px] text-gray-400">{fmtTime(e.clock_in)} &ndash; {fmtTime(e.clock_out)}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Stats */}
        <div className="lg:col-span-5 bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-gray-400 mb-5">Today's Overview</p>
          <div className="grid grid-cols-3 gap-4 mb-6">
            {[
              { v: history.filter(e => new Date(e.clock_in).toDateString() === new Date().toDateString()).length + (active ? 1 : 0), l: 'Entries', c: 'bg-blue-50 text-blue-600' },
              { v: fmt(history.filter(e => new Date(e.clock_in).toDateString() === new Date().toDateString()).reduce((s, e) => s + (new Date(e.clock_out) - new Date(e.clock_in)), 0) + (active ? elapsed : 0)).slice(0, 5), l: 'Hours', c: 'bg-emerald-50 text-emerald-600' },
              { v: `${Math.floor(totalBrk / 60)}m`, l: 'Break', c: 'bg-amber-50 text-amber-600' },
            ].map((s, i) => (
              <div key={i} className={`rounded-xl p-4 text-center ${s.c}`}>
                <p className="text-2xl font-bold">{s.v}</p>
                <p className="text-[11px] font-semibold uppercase mt-1 opacity-70">{s.l}</p>
              </div>
            ))}
          </div>
          <div className="bg-gray-50 rounded-xl p-4">
            <p className="text-[11px] font-bold uppercase tracking-wider text-gray-400 mb-2">Guard Info</p>
            <div className="space-y-2">
              {[
                { l: 'Name', v: profile?.full_name || 'Guard' },
                { l: 'ID', v: user?.id?.slice(0, 8)?.toUpperCase() || '--' },
                { l: 'Role', v: 'Security Guard' },
              ].map((r, i) => (
                <div key={i} className="flex justify-between text-[13px]">
                  <span className="text-gray-400">{r.l}</span>
                  <span className="text-gray-700 font-medium">{r.v}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CommandCenter;
