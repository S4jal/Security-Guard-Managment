import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { supabase, isSupabaseConfigured } from '../lib/supabase';

function fmtTime(d) { return new Date(d).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true }); }

const POSTS = [
  { id: 'gate-a', name: 'Gate A - Main Entrance', zone: 'Zone A', addr: 'Building 1, Main Road, Dhaka' },
  { id: 'gate-b', name: 'Gate B - Back Entrance', zone: 'Zone B', addr: 'Building 1, Service Road, Dhaka' },
  { id: 'parking', name: 'Parking Area', zone: 'Zone A', addr: 'Basement Level 1-2, Tower Complex' },
  { id: 'lobby', name: 'Building Lobby', zone: 'Zone C', addr: 'Ground Floor, Tower 1, Gulshan' },
  { id: 'perimeter', name: 'Perimeter Patrol', zone: 'Zone D', addr: 'Outer Boundary, Main Campus' },
  { id: 'rooftop', name: 'Rooftop Access', zone: 'Zone C', addr: 'Floor 15, Tower 1, Gulshan' },
];

function CommandCenter() {
  const { user, profile } = useAuth();
  const [entry, setEntry] = useState(null);
  const [post, setPost] = useState('');
  const [busy, setBusy] = useState(false);
  const [ready, setReady] = useState(false);
  const [gps, setGps] = useState('idle');
  const [brkElapsed, setBrkElapsed] = useState(0);

  const onBreak = !!entry?.break_start;
  const pInfo = POSTS.find(p => p.id === (entry?.post || post));
  const brkTotal = (entry?.break_total_seconds || 0) + (entry?.break_start ? Math.floor(brkElapsed / 1000) : 0);

  const load = useCallback(async () => {
    if (!isSupabaseConfigured || !user) { setReady(true); return; }
    try {
      const { data: o } = await supabase.from('time_entries').select('*').eq('guard_id', user.id).is('clock_out', null).order('clock_in', { ascending: false }).limit(1);
      setEntry(o?.[0] || null); if (o?.[0]?.post) setPost(o[0].post);
    } catch (e) {} finally { setReady(true); }
  }, [user]);

  useEffect(() => { load(); }, [load]);

  useEffect(() => {
    if (!entry?.break_start) { setBrkElapsed(0); return; }
    const t = () => setBrkElapsed(Date.now() - new Date(entry.break_start).getTime());
    t(); const i = setInterval(t, 1000); return () => clearInterval(i);
  }, [entry?.break_start]);

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
      const { error } = await supabase.from('time_entries').insert(row); if (error) throw error; await load();
    } catch (e) { alert(e.message); } finally { setBusy(false); }
  }

  async function doCheckOut() {
    if (!entry) return; setBusy(true);
    try {
      const loc = await getLoc();
      const u = { clock_out: new Date().toISOString() };
      if (loc) { u.clock_out_lat = loc.lat; u.clock_out_lng = loc.lng; }
      if (entry.break_start) { u.break_start = null; u.break_total_seconds = (entry.break_total_seconds || 0) + Math.floor((Date.now() - new Date(entry.break_start).getTime()) / 1000); }
      const { error } = await supabase.from('time_entries').update(u).eq('id', entry.id); if (error) throw error; await load();
    } catch (e) { alert(e.message); } finally { setBusy(false); }
  }

  async function doBrkStart() {
    if (!entry || entry.break_start) return; setBusy(true);
    try { const { error } = await supabase.from('time_entries').update({ break_start: new Date().toISOString() }).eq('id', entry.id); if (error) throw error; await load(); } catch (e) { alert(e.message); } finally { setBusy(false); }
  }

  async function doBrkEnd() {
    if (!entry?.break_start) return; setBusy(true);
    try { const s = Math.floor((Date.now() - new Date(entry.break_start).getTime()) / 1000); const { error } = await supabase.from('time_entries').update({ break_start: null, break_total_seconds: (entry.break_total_seconds || 0) + s }).eq('id', entry.id); if (error) throw error; await load(); } catch (e) { alert(e.message); } finally { setBusy(false); }
  }

  const statusLabel = entry ? (onBreak ? 'On Break' : 'Active On-Site') : 'Off Duty';

  return (
    <div className="space-y-5">

      {/* ====== POST OPERATIONS HEADER ====== */}
      <div className="bg-white rounded-[20px] px-8 py-7 flex items-center justify-between shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
        <div>
          <h1 className="text-[28px] font-extrabold text-gray-900 tracking-tight">Post Operations</h1>
          <p className="text-[14px] text-gray-400 mt-1">
            Status: <span className={`font-semibold ${entry ? (onBreak ? 'text-amber-600' : 'text-gray-900') : 'text-gray-400'}`}>{statusLabel}</span>
          </p>
        </div>
        <button className={`flex items-center gap-2.5 px-7 py-3 rounded-full text-[13px] font-extrabold uppercase tracking-wider shadow-md transition-all
          ${entry
            ? (onBreak
              ? 'bg-amber-400 text-gray-900 shadow-amber-200/50'
              : 'bg-amber-500 text-white shadow-amber-300/50 hover:bg-amber-400')
            : 'bg-gray-200 text-gray-500 shadow-none cursor-default'
          }`}>
          <span className={`w-[7px] h-[7px] rounded-full ${entry ? (onBreak ? 'bg-gray-800' : 'bg-white') : 'bg-gray-400'}`} />
          {entry ? (onBreak ? 'On Break' : 'On Duty') : 'Off Duty'}
        </button>
      </div>

      {/* ====== MAIN 2-COL ====== */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">

        {/* LEFT - PERSONNEL ACTION */}
        <div className="lg:col-span-3 bg-[#0c1824] rounded-[20px] p-8 shadow-[0_4px_24px_rgba(0,0,0,0.15)]">

          <p className="text-[11px] font-extrabold uppercase tracking-[0.2em] text-amber-500 mb-6">Personnel Action</p>

          {/* Post Select */}
          <p className="text-[11px] font-bold uppercase tracking-[0.15em] text-gray-400 mb-2.5">
            Select Assigned Post <span className="text-gray-500">(Required for Check In)</span>
          </p>
          <div className="relative mb-3">
            <select
              value={entry?.post || post}
              onChange={e => setPost(e.target.value)}
              disabled={!!entry}
              className="w-full bg-[#162230] border border-[#253545] text-gray-300 rounded-xl pl-5 pr-12 py-4 text-[14px] focus:outline-none focus:border-amber-500/50 disabled:opacity-50 appearance-none transition-colors cursor-pointer"
            >
              <option value="">-- Select --</option>
              {POSTS.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
            <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-500">
              <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M6 9l6 6 6-6"/></svg>
            </div>
          </div>
          <p className="text-[12px] text-amber-600/70 mb-7 italic">Tip: If company has no areas, pick the company-only option.</p>

          {/* 2x2 Buttons */}
          <div className="grid grid-cols-2 gap-3 mb-3">
            <button
              onClick={doCheckIn}
              disabled={busy || !post || !ready || !!entry}
              className={`h-[52px] rounded-xl text-[13px] font-extrabold uppercase tracking-[0.15em] transition-all active:scale-[0.97]
                ${!entry
                  ? 'bg-amber-500 hover:bg-amber-400 text-white shadow-lg shadow-amber-500/20 disabled:opacity-30 disabled:shadow-none'
                  : 'bg-amber-500/20 text-amber-500/40 cursor-default'
                }`}
            >
              {busy && !entry ? 'Processing...' : 'Check In'}
            </button>
            <button
              onClick={doCheckOut}
              disabled={busy || !entry}
              className="h-[52px] bg-[#162230] hover:bg-[#1d2e40] border border-[#253545] text-gray-300 rounded-xl text-[13px] font-extrabold uppercase tracking-[0.15em] transition-all disabled:opacity-30 active:scale-[0.97]"
            >
              Check Out
            </button>
            <button
              onClick={doBrkStart}
              disabled={busy || !entry || onBreak}
              className="h-[52px] bg-[#162230] hover:bg-[#1d2e40] border border-[#253545] text-gray-300 rounded-xl text-[13px] font-extrabold uppercase tracking-[0.15em] transition-all disabled:opacity-30 active:scale-[0.97]"
            >
              Break Start
            </button>
            <button
              onClick={doBrkEnd}
              disabled={busy || !onBreak}
              className={`h-[52px] rounded-xl text-[13px] font-extrabold uppercase tracking-[0.15em] transition-all active:scale-[0.97]
                ${onBreak
                  ? 'bg-indigo-500 hover:bg-indigo-400 text-white animate-pulse-slow'
                  : 'bg-[#162230] border border-[#253545] text-gray-300 disabled:opacity-30'
                }`}
            >
              Break End
            </button>
          </div>

          {/* Break Status */}
          <div className="flex items-center justify-between mt-5 px-1">
            <p className="text-[12px] text-gray-500">
              Break Status:{' '}
              <span className={`font-bold ${onBreak ? 'text-amber-400' : 'text-emerald-500'}`}>
                {onBreak ? 'ON BREAK' : 'NOT ON BREAK'}
              </span>
            </p>
            <p className="text-[12px] text-gray-600">
              (Total: {Math.floor(brkTotal / 60)} min)
            </p>
          </div>
        </div>

        {/* RIGHT - ASSIGNED DETAILS */}
        <div className="lg:col-span-2 bg-white rounded-[20px] p-8 shadow-[0_1px_3px_rgba(0,0,0,0.04)] flex flex-col">

          <p className="text-[11px] font-extrabold uppercase tracking-[0.2em] text-gray-400 mb-5">Assigned Details</p>

          {pInfo ? (
            <div className="mb-auto">
              <h2 className="text-[22px] font-extrabold text-gray-900 leading-tight">{pInfo.name}</h2>
              <p className="text-[14px] text-gray-600 mt-2">Area: <span className="font-medium text-gray-400">{pInfo.zone}</span></p>
              <p className="text-[14px] text-gray-400 mt-0.5">{pInfo.addr}</p>
              {entry?.clock_in_lat && (
                <p className="text-[11px] font-mono text-gray-400 bg-gray-50 rounded-lg px-3 py-1.5 mt-3 inline-block">
                  GPS: {entry.clock_in_lat.toFixed(5)}, {entry.clock_in_lng.toFixed(5)}
                </p>
              )}
            </div>
          ) : (
            <div className="mb-auto">
              <h2 className="text-[18px] font-semibold text-gray-300">No post selected</h2>
              <p className="text-[13px] text-gray-400 mt-1">Select a post from the left panel</p>
            </div>
          )}

          {/* Tracking */}
          <div className="pt-5 mt-6 border-t border-gray-100 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-extrabold uppercase tracking-[0.2em] text-gray-400">Tracking</span>
              <span className={`flex items-center gap-2 text-[13px] font-bold ${entry ? 'text-emerald-500' : 'text-gray-400'}`}>
                <span className={`w-[8px] h-[8px] rounded-full ${entry ? 'bg-emerald-500 animate-pulse' : 'bg-gray-300'}`} />
                {entry ? 'ACTIVE' : 'INACTIVE'}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-extrabold uppercase tracking-[0.2em] text-gray-400">Location</span>
              <span className={`text-[13px] font-semibold ${gps === 'ok' ? 'text-emerald-500' : gps === 'denied' ? 'text-red-400' : gps === 'locating' ? 'text-blue-400' : 'text-gray-400'}`}>
                {gps === 'ok' ? 'Captured' : gps === 'locating' ? 'Locating...' : gps === 'denied' ? 'Denied' : 'Standby'}
              </span>
            </div>
            {entry && (
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-extrabold uppercase tracking-[0.2em] text-gray-400">Checked In</span>
                <span className="text-[13px] font-semibold text-gray-600">{fmtTime(entry.clock_in)}</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default CommandCenter;
