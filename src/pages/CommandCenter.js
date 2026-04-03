import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { supabase, isSupabaseConfigured } from '../lib/supabase';

function fmt(ms) {
  const s = Math.floor(ms / 1000);
  return `${String(Math.floor(s / 3600)).padStart(2, '0')}:${String(Math.floor((s % 3600) / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;
}
function fmtTime(d) { return new Date(d).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true }); }
function fmtDate(d) { return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }); }

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
  const [activeEntry, setActiveEntry] = useState(null);
  const [elapsed, setElapsed] = useState(0);
  const [breakElapsed, setBreakElapsed] = useState(0);
  const [selectedPost, setSelectedPost] = useState('');
  const [acting, setActing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [history, setHistory] = useState([]);
  const [activityLog, setActivityLog] = useState([]);
  const [now, setNow] = useState(new Date());

  const isOnBreak = activeEntry?.break_start && !activeEntry?.break_start_ended;
  const postInfo = POSTS.find(p => p.id === (activeEntry?.post || selectedPost));

  // Live clock
  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  // Fetch entries
  const fetchEntries = useCallback(async () => {
    if (!isSupabaseConfigured || !user) { setLoading(false); return; }
    try {
      const { data: open } = await supabase
        .from('time_entries').select('*')
        .eq('guard_id', user.id).is('clock_out', null)
        .order('clock_in', { ascending: false }).limit(1);
      setActiveEntry(open?.[0] || null);
      if (open?.[0]?.post) setSelectedPost(open[0].post);

      const { data: closed } = await supabase
        .from('time_entries').select('*')
        .eq('guard_id', user.id).not('clock_out', 'is', null)
        .order('clock_in', { ascending: false }).limit(5);
      setHistory(closed || []);
    } catch (e) {} finally { setLoading(false); }
  }, [user]);

  useEffect(() => { fetchEntries(); }, [fetchEntries]);

  // Shift timer
  useEffect(() => {
    if (!activeEntry) { setElapsed(0); return; }
    const tick = () => setElapsed(Date.now() - new Date(activeEntry.clock_in).getTime());
    tick(); const iv = setInterval(tick, 1000); return () => clearInterval(iv);
  }, [activeEntry]);

  // Break timer
  useEffect(() => {
    if (!activeEntry?.break_start) { setBreakElapsed(0); return; }
    const tick = () => setBreakElapsed(Date.now() - new Date(activeEntry.break_start).getTime());
    tick(); const iv = setInterval(tick, 1000); return () => clearInterval(iv);
  }, [activeEntry?.break_start]);

  function addLog(action) {
    setActivityLog(prev => [{ action, time: new Date().toISOString(), id: Date.now() }, ...prev].slice(0, 10));
  }

  async function handleCheckIn() {
    if (!selectedPost) { alert('Please select an assigned post first.'); return; }
    setActing(true);
    try {
      const { error } = await supabase.from('time_entries').insert({
        guard_id: user.id, clock_in: new Date().toISOString(),
        post: selectedPost, break_total_seconds: 0,
      });
      if (error) throw error;
      addLog('Checked In');
      await fetchEntries();
    } catch (e) { alert('Failed: ' + e.message); } finally { setActing(false); }
  }

  async function handleCheckOut() {
    if (!activeEntry) return;
    setActing(true);
    try {
      const updates = { clock_out: new Date().toISOString() };
      // If on break, end it first
      if (activeEntry.break_start) {
        const extra = Math.floor((Date.now() - new Date(activeEntry.break_start).getTime()) / 1000);
        updates.break_start = null;
        updates.break_total_seconds = (activeEntry.break_total_seconds || 0) + extra;
      }
      const { error } = await supabase.from('time_entries').update(updates).eq('id', activeEntry.id);
      if (error) throw error;
      addLog('Checked Out');
      await fetchEntries();
    } catch (e) { alert('Failed: ' + e.message); } finally { setActing(false); }
  }

  async function handleBreakStart() {
    if (!activeEntry || activeEntry.break_start) return;
    setActing(true);
    try {
      const { error } = await supabase.from('time_entries')
        .update({ break_start: new Date().toISOString() }).eq('id', activeEntry.id);
      if (error) throw error;
      addLog('Break Started');
      await fetchEntries();
    } catch (e) { alert('Failed: ' + e.message); } finally { setActing(false); }
  }

  async function handleBreakEnd() {
    if (!activeEntry?.break_start) return;
    setActing(true);
    try {
      const secs = Math.floor((Date.now() - new Date(activeEntry.break_start).getTime()) / 1000);
      const { error } = await supabase.from('time_entries').update({
        break_start: null,
        break_total_seconds: (activeEntry.break_total_seconds || 0) + secs,
      }).eq('id', activeEntry.id);
      if (error) throw error;
      addLog('Break Ended');
      await fetchEntries();
    } catch (e) { alert('Failed: ' + e.message); } finally { setActing(false); }
  }

  const totalBreakSec = (activeEntry?.break_total_seconds || 0) + (activeEntry?.break_start ? Math.floor(breakElapsed / 1000) : 0);
  const netWorkMs = elapsed - (totalBreakSec * 1000);

  const statusColor = !activeEntry ? 'gray' : isOnBreak ? 'amber' : 'emerald';
  const statusText = !activeEntry ? 'Off Duty' : isOnBreak ? 'On Break' : 'On Duty';

  return (
    <div className="animate-fade-in">
      {/* ===== Status Banner ===== */}
      <div className="bg-white rounded-2xl border border-gray-100 p-5 mb-6 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-indigo-100 text-indigo-600 flex items-center justify-center text-lg font-bold">
            {(profile?.full_name || 'G').charAt(0)}
          </div>
          <div>
            <h1 className="text-lg font-bold text-gray-800">Command Center</h1>
            <p className="text-sm text-gray-400">{profile?.full_name || 'Guard'} &middot; {now.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-right hidden sm:block">
            <p className="text-2xl font-bold font-mono text-gray-700">{now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true })}</p>
          </div>
          <div className={`flex items-center gap-2 px-4 py-2 rounded-xl font-semibold text-sm
            ${statusColor === 'emerald' ? 'bg-emerald-500 text-white' : ''}
            ${statusColor === 'amber' ? 'bg-amber-400 text-gray-900' : ''}
            ${statusColor === 'gray' ? 'bg-gray-200 text-gray-600' : ''}`}>
            <span className={`w-2 h-2 rounded-full animate-pulse ${statusColor === 'emerald' ? 'bg-white' : statusColor === 'amber' ? 'bg-gray-800' : 'bg-gray-400'}`} />
            {statusText}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        {/* ===== Personnel Action Panel ===== */}
        <div className="lg:col-span-2 bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl p-6 text-white">
          <p className="text-xs font-bold uppercase tracking-widest text-indigo-400 mb-5">Personnel Action</p>

          {/* Post Selector */}
          <div className="mb-5">
            <label className="block text-xs font-semibold uppercase tracking-wider text-gray-400 mb-2">
              Select Assigned Post {!activeEntry && <span className="text-amber-400">(Required)</span>}
            </label>
            <select
              value={activeEntry?.post || selectedPost}
              onChange={e => setSelectedPost(e.target.value)}
              disabled={!!activeEntry}
              className="w-full bg-gray-700/50 border border-gray-600 text-white rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-60 appearance-none cursor-pointer"
            >
              <option value="">-- Select Post --</option>
              {POSTS.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
          </div>

          {/* Live Timer */}
          {activeEntry && (
            <div className="bg-gray-700/40 rounded-xl p-4 mb-5 text-center">
              <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">Shift Duration</p>
              <p className="text-4xl font-bold font-mono text-white tracking-wider">{fmt(elapsed)}</p>
              <div className="flex justify-center gap-6 mt-3 text-xs">
                <span className="text-gray-400">Net: <span className="text-emerald-400 font-semibold">{fmt(Math.max(0, netWorkMs))}</span></span>
                <span className="text-gray-400">Break: <span className="text-amber-400 font-semibold">{fmt(totalBreakSec * 1000)}</span></span>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="grid grid-cols-2 gap-3 mb-4">
            {!activeEntry ? (
              <button onClick={handleCheckIn} disabled={acting || !selectedPost || loading}
                className="col-span-2 py-4 bg-emerald-500 hover:bg-emerald-400 text-white font-bold text-sm rounded-xl transition disabled:opacity-40 disabled:cursor-not-allowed">
                {acting ? 'Processing...' : 'CHECK IN'}
              </button>
            ) : (
              <>
                <button onClick={handleCheckOut} disabled={acting}
                  className="py-3.5 bg-red-500 hover:bg-red-400 text-white font-bold text-sm rounded-xl transition disabled:opacity-40">
                  {acting ? '...' : 'CHECK OUT'}
                </button>
                {!activeEntry.break_start ? (
                  <button onClick={handleBreakStart} disabled={acting}
                    className="py-3.5 bg-amber-400 hover:bg-amber-300 text-gray-900 font-bold text-sm rounded-xl transition disabled:opacity-40">
                    BREAK START
                  </button>
                ) : (
                  <button onClick={handleBreakEnd} disabled={acting}
                    className="py-3.5 bg-indigo-500 hover:bg-indigo-400 text-white font-bold text-sm rounded-xl transition disabled:opacity-40 animate-pulse-slow">
                    BREAK END
                  </button>
                )}
              </>
            )}
          </div>

          {/* Break Status */}
          <div className="flex items-center justify-between text-xs">
            <span className="text-gray-400">
              Break Status: {' '}
              <span className={activeEntry?.break_start ? 'text-amber-400 font-bold' : 'text-gray-500'}>
                {activeEntry?.break_start ? 'ON BREAK' : 'NOT ON BREAK'}
              </span>
            </span>
            <span className="text-gray-500">
              Total: {Math.floor(totalBreakSec / 60)} min
            </span>
          </div>
        </div>

        {/* ===== Right Column ===== */}
        <div className="space-y-5">
          {/* Assigned Details */}
          <div className="bg-white rounded-2xl border border-gray-100 p-6">
            <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-4">Assigned Details</p>
            {postInfo ? (
              <>
                <h3 className="text-lg font-bold text-gray-800 mb-1">{postInfo.name}</h3>
                <p className="text-sm text-gray-500 mb-1">Zone: <span className="font-medium text-gray-700">{postInfo.zone}</span></p>
                <p className="text-sm text-gray-400 mb-4">{postInfo.address}</p>
              </>
            ) : (
              <p className="text-sm text-gray-400 mb-4">No post selected</p>
            )}
            <div className="flex items-center justify-between pt-4 border-t border-gray-100">
              <span className="text-xs font-bold uppercase tracking-widest text-gray-400">Tracking</span>
              <span className={`flex items-center gap-1.5 text-xs font-semibold ${activeEntry ? 'text-emerald-500' : 'text-gray-400'}`}>
                <span className={`w-2 h-2 rounded-full ${activeEntry ? 'bg-emerald-500 animate-pulse' : 'bg-gray-300'}`} />
                {activeEntry ? 'ACTIVE' : 'INACTIVE'}
              </span>
            </div>
          </div>

          {/* Shift Summary */}
          <div className="bg-white rounded-2xl border border-gray-100 p-6">
            <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-4">Shift Summary</p>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-500">Clock In</span>
                <span className="text-sm font-semibold text-gray-700">{activeEntry ? fmtTime(activeEntry.clock_in) : '--:--'}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-500">Total Time</span>
                <span className="text-sm font-mono font-semibold text-gray-700">{activeEntry ? fmt(elapsed) : '00:00:00'}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-500">Break Time</span>
                <span className="text-sm font-mono font-semibold text-amber-500">{fmt(totalBreakSec * 1000)}</span>
              </div>
              <div className="pt-3 border-t border-gray-100 flex justify-between items-center">
                <span className="text-sm font-semibold text-gray-700">Net Working</span>
                <span className="text-sm font-mono font-bold text-emerald-600">{activeEntry ? fmt(Math.max(0, netWorkMs)) : '00:00:00'}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* ===== Activity Timeline ===== */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-100 p-6">
          <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-4">Activity Timeline</p>
          {activityLog.length === 0 && history.length === 0 ? (
            <p className="text-sm text-gray-300 text-center py-8">No activity yet. Check in to start your shift.</p>
          ) : (
            <div className="space-y-0">
              {activityLog.map((log) => (
                <div key={log.id} className="flex items-start gap-3 pb-4 relative">
                  <div className="flex flex-col items-center">
                    <div className={`w-3 h-3 rounded-full mt-0.5 flex-shrink-0 ${
                      log.action.includes('In') ? 'bg-emerald-500' :
                      log.action.includes('Out') ? 'bg-red-400' :
                      log.action.includes('Started') ? 'bg-amber-400' : 'bg-indigo-500'
                    }`} />
                    <div className="w-px flex-1 bg-gray-100 mt-1" />
                  </div>
                  <div className="flex-1 min-w-0 pb-1">
                    <p className="text-sm font-medium text-gray-700">{log.action}</p>
                    <p className="text-xs text-gray-400">{fmtTime(log.time)}</p>
                  </div>
                </div>
              ))}
              {history.map((e) => (
                <div key={e.id} className="flex items-start gap-3 pb-4">
                  <div className="flex flex-col items-center">
                    <div className="w-3 h-3 rounded-full mt-0.5 bg-gray-300 flex-shrink-0" />
                    <div className="w-px flex-1 bg-gray-100 mt-1" />
                  </div>
                  <div className="flex-1 min-w-0 pb-1">
                    <p className="text-sm text-gray-500">Shift completed &middot; {fmt((new Date(e.clock_out) - new Date(e.clock_in)))} total</p>
                    <p className="text-xs text-gray-400">{fmtDate(e.clock_in)} &middot; {fmtTime(e.clock_in)} - {fmtTime(e.clock_out)}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* ===== Quick Stats ===== */}
        <div className="space-y-5">
          <div className="bg-white rounded-2xl border border-gray-100 p-6">
            <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-4">Today's Overview</p>
            {[
              { label: 'Shifts Completed', value: history.filter(e => new Date(e.clock_in).toDateString() === new Date().toDateString()).length, icon: '&#9989;', color: 'text-emerald-500' },
              { label: 'Total Hours', value: fmt(history.filter(e => new Date(e.clock_in).toDateString() === new Date().toDateString()).reduce((s, e) => s + (new Date(e.clock_out) - new Date(e.clock_in)), 0) + (activeEntry ? elapsed : 0)).slice(0, 5), icon: '&#9201;', color: 'text-blue-500' },
              { label: 'Break Taken', value: `${Math.floor(totalBreakSec / 60)} min`, icon: '&#9749;', color: 'text-amber-500' },
            ].map((s, i) => (
              <div key={i} className="flex items-center justify-between py-2.5 border-b border-gray-50 last:border-0">
                <span className="text-sm text-gray-500 flex items-center gap-2">
                  <span dangerouslySetInnerHTML={{ __html: s.icon }} />
                  {s.label}
                </span>
                <span className={`text-sm font-bold ${s.color}`}>{s.value}</span>
              </div>
            ))}
          </div>

          <div className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl p-6 text-white">
            <p className="text-xs font-bold uppercase tracking-widest text-indigo-200 mb-3">Quick Tip</p>
            <p className="text-sm leading-relaxed text-indigo-100">
              Remember to start your break timer before leaving your post. All breaks are tracked and included in your attendance report.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CommandCenter;
