import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { supabase, isSupabaseConfigured } from '../lib/supabase';

function formatDuration(ms) {
  const totalSec = Math.floor(ms / 1000);
  const h = Math.floor(totalSec / 3600);
  const m = Math.floor((totalSec % 3600) / 60);
  const s = totalSec % 60;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

function formatTime(dateStr) {
  return new Date(dateStr).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
}

function formatDate(dateStr) {
  return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

function GuardDashboard() {
  const { user, profile } = useAuth();
  const [activeEntry, setActiveEntry] = useState(null);   // current open clock-in
  const [elapsed, setElapsed] = useState(0);               // live timer ms
  const [history, setHistory] = useState([]);               // past entries
  const [loading, setLoading] = useState(true);
  const [acting, setActing] = useState(false);              // button loading

  // Fetch active entry + history
  const fetchEntries = useCallback(async () => {
    if (!isSupabaseConfigured || !user) { setLoading(false); return; }
    try {
      // Get open entry (no clock_out)
      const { data: open } = await supabase
        .from('time_entries')
        .select('*')
        .eq('guard_id', user.id)
        .is('clock_out', null)
        .order('clock_in', { ascending: false })
        .limit(1);

      if (open && open.length > 0) {
        setActiveEntry(open[0]);
      } else {
        setActiveEntry(null);
      }

      // Get recent closed entries
      const { data: closed } = await supabase
        .from('time_entries')
        .select('*')
        .eq('guard_id', user.id)
        .not('clock_out', 'is', null)
        .order('clock_in', { ascending: false })
        .limit(7);

      if (closed) setHistory(closed);
    } catch (e) {
      console.error('Error fetching time entries:', e);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => { fetchEntries(); }, [fetchEntries]);

  // Live timer
  useEffect(() => {
    if (!activeEntry) { setElapsed(0); return; }
    const tick = () => setElapsed(Date.now() - new Date(activeEntry.clock_in).getTime());
    tick();
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, [activeEntry]);

  // Clock In
  async function handleClockIn() {
    if (!isSupabaseConfigured || !user) return;
    setActing(true);
    try {
      const { error } = await supabase.from('time_entries').insert({
        guard_id: user.id,
        clock_in: new Date().toISOString(),
      });
      if (error) throw error;
      await fetchEntries();
    } catch (e) {
      alert('Clock in failed: ' + e.message);
    } finally {
      setActing(false);
    }
  }

  // Clock Out
  async function handleClockOut() {
    if (!activeEntry) return;
    setActing(true);
    try {
      const { error } = await supabase
        .from('time_entries')
        .update({ clock_out: new Date().toISOString() })
        .eq('id', activeEntry.id);
      if (error) throw error;
      await fetchEntries();
    } catch (e) {
      alert('Clock out failed: ' + e.message);
    } finally {
      setActing(false);
    }
  }

  // Compute today's total hours from history
  const todayStr = new Date().toDateString();
  const todayHours = history
    .filter(e => new Date(e.clock_in).toDateString() === todayStr)
    .reduce((sum, e) => sum + (new Date(e.clock_out) - new Date(e.clock_in)), 0);
  const totalTodayMs = todayHours + (activeEntry ? elapsed : 0);

  const stats = [
    { label: "Today's Hours", value: formatDuration(totalTodayMs).slice(0, 5), icon: '&#128337;', bg: 'bg-blue-50 text-blue-500' },
    { label: 'Status', value: activeEntry ? 'On Duty' : 'Off Duty', icon: activeEntry ? '&#9989;' : '&#128308;', bg: activeEntry ? 'bg-emerald-50 text-emerald-500' : 'bg-red-50 text-red-500' },
    { label: 'This Week', value: `${history.length} shifts`, icon: '&#128197;', bg: 'bg-amber-50 text-amber-500' },
    { label: 'Attendance', value: '96%', icon: '&#11088;', bg: 'bg-purple-50 text-purple-500' },
  ];

  const today = [
    { shift: 'Morning Shift', time: '6:00 AM - 2:00 PM', zone: 'Main Gate', done: true },
    { shift: 'Evening Shift', time: '2:00 PM - 10:00 PM', zone: 'Zone A - Perimeter', done: false },
  ];

  const week = [
    { day: 'Saturday', shift: 'Morning', time: '6:00 AM - 2:00 PM', zone: 'Main Gate' },
    { day: 'Sunday', shift: 'Evening', time: '2:00 PM - 10:00 PM', zone: 'Zone A' },
    { day: 'Monday', shift: 'Morning', time: '6:00 AM - 2:00 PM', zone: 'Parking' },
    { day: 'Tuesday', shift: 'Night', time: '10:00 PM - 6:00 AM', zone: 'Lobby' },
    { day: 'Wednesday', shift: 'Off', time: '-', zone: '-' },
    { day: 'Thursday', shift: 'Morning', time: '6:00 AM - 2:00 PM', zone: 'Main Gate' },
    { day: 'Friday', shift: 'Off', time: '-', zone: '-' },
  ];

  const checkpoints = [
    { name: 'Gate A - Main Entrance', time: '2:15 PM', done: true },
    { name: 'Parking Level 1', time: '2:35 PM', done: true },
    { name: 'Building Lobby', time: '2:55 PM', done: true },
    { name: 'Fire Exit - North', time: '3:15 PM', done: false },
    { name: 'Rooftop Access', time: '3:35 PM', done: false },
    { name: 'Parking Level 2', time: '3:55 PM', done: false },
  ];

  const shiftBadge = { Morning: 'bg-amber-50 text-amber-600', Evening: 'bg-blue-50 text-blue-600', Night: 'bg-purple-50 text-purple-600', Off: 'bg-gray-100 text-gray-400' };

  return (
    <div className="animate-fade-in">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-bold text-gray-800">My Dashboard</h1>
        <span className="text-xs font-semibold bg-emerald-50 text-emerald-600 px-3 py-1 rounded-lg">{profile?.full_name || 'Guard'}</span>
      </div>

      {/* ========== Clock In/Out Card ========== */}
      <div className={`rounded-2xl p-6 mb-6 border-2 transition-colors ${activeEntry ? 'bg-emerald-50/60 border-emerald-200' : 'bg-white border-gray-100'}`}>
        <div className="flex flex-col sm:flex-row items-center gap-6">
          {/* Timer */}
          <div className="text-center sm:text-left flex-shrink-0">
            <p className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-1">
              {activeEntry ? 'Clocked In' : 'Ready to Clock In'}
            </p>
            <p className={`text-4xl sm:text-5xl font-bold font-mono tracking-tight ${activeEntry ? 'text-emerald-600' : 'text-gray-300'}`}>
              {activeEntry ? formatDuration(elapsed) : '00:00:00'}
            </p>
            {activeEntry && (
              <p className="text-sm text-gray-400 mt-2">
                Since {formatTime(activeEntry.clock_in)}
              </p>
            )}
          </div>

          {/* Divider */}
          <div className="hidden sm:block w-px h-20 bg-gray-200" />

          {/* Button + Info */}
          <div className="flex-1 flex flex-col items-center sm:items-start gap-3">
            {activeEntry ? (
              <button
                onClick={handleClockOut}
                disabled={acting}
                className="px-8 py-3 bg-red-500 hover:bg-red-600 text-white text-sm font-bold rounded-xl transition disabled:opacity-50 shadow-sm shadow-red-200 w-full sm:w-auto"
              >
                {acting ? 'Clocking Out...' : 'Clock Out'}
              </button>
            ) : (
              <button
                onClick={handleClockIn}
                disabled={acting || loading}
                className="px-8 py-3 bg-emerald-500 hover:bg-emerald-600 text-white text-sm font-bold rounded-xl transition disabled:opacity-50 shadow-sm shadow-emerald-200 w-full sm:w-auto"
              >
                {acting ? 'Clocking In...' : 'Clock In'}
              </button>
            )}
            <p className="text-xs text-gray-400">
              {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
            </p>
          </div>

          {/* Today summary */}
          <div className="flex gap-4 sm:gap-6 text-center flex-shrink-0">
            <div>
              <p className="text-xs text-gray-400 mb-1">Today</p>
              <p className="text-lg font-bold text-gray-700">{formatDuration(totalTodayMs).slice(0, 5)}</p>
            </div>
            <div>
              <p className="text-xs text-gray-400 mb-1">Entries</p>
              <p className="text-lg font-bold text-gray-700">
                {history.filter(e => new Date(e.clock_in).toDateString() === todayStr).length + (activeEntry ? 1 : 0)}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* ========== Recent Time Entries ========== */}
      {history.length > 0 && (
        <div className="bg-white rounded-xl p-6 border border-gray-100 mb-6">
          <h2 className="text-sm font-semibold text-gray-700 mb-4">Recent Time Entries</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs text-gray-400 uppercase border-b border-gray-100">
                  <th className="pb-3">Date</th>
                  <th className="pb-3">Clock In</th>
                  <th className="pb-3">Clock Out</th>
                  <th className="pb-3">Duration</th>
                </tr>
              </thead>
              <tbody>
                {history.map((e) => {
                  const dur = new Date(e.clock_out) - new Date(e.clock_in);
                  return (
                    <tr key={e.id} className="border-b border-gray-50 last:border-0">
                      <td className="py-2.5 font-medium text-gray-600">{formatDate(e.clock_in)}</td>
                      <td className="py-2.5">
                        <span className="inline-flex items-center gap-1.5 text-emerald-600">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                          {formatTime(e.clock_in)}
                        </span>
                      </td>
                      <td className="py-2.5">
                        <span className="inline-flex items-center gap-1.5 text-red-500">
                          <span className="w-1.5 h-1.5 rounded-full bg-red-400" />
                          {formatTime(e.clock_out)}
                        </span>
                      </td>
                      <td className="py-2.5 font-mono text-gray-500">{formatDuration(dur)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {stats.map((s, i) => (
          <div key={i} className="bg-white rounded-xl p-5 border border-gray-100 flex items-center gap-4">
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-xl ${s.bg}`} dangerouslySetInnerHTML={{ __html: s.icon }} />
            <div><p className="text-xl font-bold text-gray-800">{s.value}</p><p className="text-xs text-gray-400">{s.label}</p></div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">
        <div className="lg:col-span-3 space-y-5">
          {/* Today's Schedule */}
          <div className="bg-white rounded-xl p-6 border border-gray-100">
            <h2 className="text-sm font-semibold text-gray-700 mb-4">Today's Schedule</h2>
            <div className="space-y-3">
              {today.map((t, i) => (
                <div key={i} className={`p-4 rounded-lg border-l-4 ${t.done ? 'bg-gray-50 border-gray-300' : 'bg-emerald-50/50 border-emerald-500'}`}>
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-semibold text-sm text-gray-700">{t.shift}</span>
                    <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${t.done ? 'bg-gray-200 text-gray-500' : 'bg-emerald-100 text-emerald-600'}`}>{t.done ? 'Completed' : 'In Progress'}</span>
                  </div>
                  <p className="text-xs text-gray-400">{t.time} &middot; {t.zone}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Weekly */}
          <div className="bg-white rounded-xl p-6 border border-gray-100">
            <h2 className="text-sm font-semibold text-gray-700 mb-4">Weekly Schedule</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead><tr className="text-left text-xs text-gray-400 uppercase border-b border-gray-100">
                  <th className="pb-3">Day</th><th className="pb-3">Shift</th><th className="pb-3">Time</th><th className="pb-3">Zone</th>
                </tr></thead>
                <tbody>
                  {week.map((w, i) => (
                    <tr key={i} className={`border-b border-gray-50 last:border-0 ${w.shift === 'Off' ? 'opacity-40' : ''}`}>
                      <td className="py-2.5 font-medium text-gray-600">{w.day}</td>
                      <td className="py-2.5"><span className={`text-[11px] font-semibold px-2 py-0.5 rounded ${shiftBadge[w.shift]}`}>{w.shift}</span></td>
                      <td className="py-2.5 text-gray-500">{w.time}</td>
                      <td className="py-2.5 text-gray-500">{w.zone}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div className="lg:col-span-2 space-y-5">
          {/* Checkpoints */}
          <div className="bg-white rounded-xl p-6 border border-gray-100">
            <h2 className="text-sm font-semibold text-gray-700 mb-4">Patrol Checkpoints</h2>
            <div className="space-y-2">
              {checkpoints.map((c, i) => (
                <div key={i} className={`flex items-center gap-3 p-2.5 rounded-lg ${c.done ? 'bg-emerald-50' : 'bg-gray-50'}`}>
                  <span className="text-base" dangerouslySetInnerHTML={{ __html: c.done ? '&#9989;' : '&#9723;' }} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-600 font-medium">{c.name}</p>
                    <p className="text-xs text-gray-400">Due: {c.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default GuardDashboard;
