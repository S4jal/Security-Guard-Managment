import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { supabase, isSupabaseConfigured } from '../lib/supabase';

const POSTS = [
  { id: 'gate-a', name: 'Gate A - Main Entrance', zone: 'Zone A', addr: 'Building 1, Main Road, Dhaka' },
  { id: 'gate-b', name: 'Gate B - Back Entrance', zone: 'Zone B', addr: 'Building 1, Service Road, Dhaka' },
  { id: 'parking', name: 'Parking Area', zone: 'Zone A', addr: 'Basement Level 1-2, Tower Complex' },
  { id: 'lobby', name: 'Building Lobby', zone: 'Zone C', addr: 'Ground Floor, Tower 1, Gulshan' },
  { id: 'perimeter', name: 'Perimeter Patrol', zone: 'Zone D', addr: 'Outer Boundary, Main Campus' },
  { id: 'rooftop', name: 'Rooftop Access', zone: 'Zone C', addr: 'Floor 15, Tower 1, Gulshan' },
];

function CommandCenter() {
  const { user } = useAuth();
  const [entry, setEntry] = useState(null);
  const [post, setPost] = useState('');
  const [busy, setBusy] = useState(false);
  const [ready, setReady] = useState(false);
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
      navigator.geolocation.getCurrentPosition(
        p => res({ lat: p.coords.latitude, lng: p.coords.longitude }),
        () => res(null),
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

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

      {/* POST OPERATIONS */}
      <div style={{
        background: '#fff',
        borderRadius: 18,
        padding: '32px 36px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        boxShadow: '0 1px 4px rgba(0,0,0,0.03)',
      }}>
        <div>
          <h1 style={{ fontSize: 28, fontWeight: 800, color: '#111', margin: 0, letterSpacing: '-0.5px' }}>Post Operations</h1>
          <p style={{ fontSize: 14, color: '#999', marginTop: 6 }}>
            Status: <span style={{ fontWeight: 600, color: entry ? (onBreak ? '#d97706' : '#111') : '#999' }}>
              {entry ? (onBreak ? 'On Break' : 'Active On-Site') : 'Off Duty'}
            </span>
          </p>
        </div>
        <div style={{
          display: 'flex', alignItems: 'center', gap: 8,
          background: entry ? '#f59e0b' : '#e5e7eb',
          color: entry ? '#fff' : '#888',
          padding: '10px 24px',
          borderRadius: 50,
          fontSize: 13,
          fontWeight: 800,
          letterSpacing: '0.1em',
          textTransform: 'uppercase',
        }}>
          <span style={{
            width: 7, height: 7, borderRadius: '50%',
            background: entry ? '#fff' : '#aaa',
          }} />
          {entry ? (onBreak ? 'On Break' : 'On Duty') : 'Off Duty'}
        </div>
      </div>

      {/* MAIN ROW */}
      <div style={{ display: 'grid', gridTemplateColumns: '3fr 2fr', gap: 20 }}>

        {/* PERSONNEL ACTION */}
        <div style={{
          background: '#0d1b2a',
          borderRadius: 18,
          padding: 32,
        }}>
          <p style={{ fontSize: 11, fontWeight: 800, letterSpacing: '0.2em', textTransform: 'uppercase', color: '#f59e0b', marginBottom: 24 }}>
            Personnel Action
          </p>

          <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase', color: '#8899aa', marginBottom: 10 }}>
            Select Assigned Post (Required for Check In)
          </p>

          <div style={{ position: 'relative', marginBottom: 10 }}>
            <select
              value={entry?.post || post}
              onChange={e => setPost(e.target.value)}
              disabled={!!entry}
              style={{
                width: '100%',
                background: '#162535',
                border: '1px solid #253545',
                color: '#ccc',
                borderRadius: 12,
                padding: '14px 44px 14px 16px',
                fontSize: 14,
                outline: 'none',
                appearance: 'none',
                cursor: entry ? 'default' : 'pointer',
                opacity: entry ? 0.5 : 1,
              }}
            >
              <option value="">-- Select --</option>
              {POSTS.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
            <svg style={{ position: 'absolute', right: 16, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }}
              width="16" height="16" fill="none" stroke="#667" strokeWidth="2" viewBox="0 0 24 24"><path d="M6 9l6 6 6-6"/></svg>
          </div>

          <p style={{ fontSize: 12, color: '#b8860b', fontStyle: 'italic', marginBottom: 28 }}>
            Tip: If company has no areas, pick the company-only option.
          </p>

          {/* 2x2 Buttons */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
            <button onClick={doCheckIn} disabled={busy || !post || !ready || !!entry}
              style={{
                height: 52, border: 'none', borderRadius: 12, cursor: (!post || !!entry) ? 'default' : 'pointer',
                fontSize: 13, fontWeight: 800, letterSpacing: '0.12em', textTransform: 'uppercase',
                background: !entry ? '#f59e0b' : 'rgba(245,158,11,0.15)',
                color: !entry ? '#fff' : 'rgba(245,158,11,0.4)',
                transition: 'all 0.15s',
                opacity: (!post && !entry) ? 0.4 : 1,
              }}>
              Check In
            </button>
            <button onClick={doCheckOut} disabled={busy || !entry}
              style={{
                height: 52, borderRadius: 12, cursor: entry ? 'pointer' : 'default',
                fontSize: 13, fontWeight: 800, letterSpacing: '0.12em', textTransform: 'uppercase',
                background: '#162535', border: '1px solid #253545', color: '#ccc',
                opacity: entry ? 1 : 0.3, transition: 'all 0.15s',
              }}>
              Check Out
            </button>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 24 }}>
            <button onClick={doBrkStart} disabled={busy || !entry || onBreak}
              style={{
                height: 52, borderRadius: 12, cursor: (entry && !onBreak) ? 'pointer' : 'default',
                fontSize: 13, fontWeight: 800, letterSpacing: '0.12em', textTransform: 'uppercase',
                background: '#162535', border: '1px solid #253545', color: '#ccc',
                opacity: (entry && !onBreak) ? 1 : 0.3, transition: 'all 0.15s',
              }}>
              Break Start
            </button>
            <button onClick={doBrkEnd} disabled={busy || !onBreak}
              style={{
                height: 52, borderRadius: 12, cursor: onBreak ? 'pointer' : 'default',
                fontSize: 13, fontWeight: 800, letterSpacing: '0.12em', textTransform: 'uppercase',
                background: '#162535', border: '1px solid #253545', color: '#ccc',
                opacity: onBreak ? 1 : 0.3, transition: 'all 0.15s',
              }}>
              Break End
            </button>
          </div>

          {/* Break Status */}
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12 }}>
            <span style={{ color: '#667' }}>
              Break Status: {' '}
              <span style={{ fontWeight: 700, color: onBreak ? '#f59e0b' : '#10b981' }}>
                {onBreak ? 'ON BREAK' : 'NOT ON BREAK'}
              </span>
            </span>
            <span style={{ color: '#556' }}>(Total: {Math.floor(brkTotal / 60)} min)</span>
          </div>
        </div>

        {/* ASSIGNED DETAILS */}
        <div style={{
          background: '#fff',
          borderRadius: 18,
          padding: 32,
          boxShadow: '0 1px 4px rgba(0,0,0,0.03)',
          display: 'flex',
          flexDirection: 'column',
        }}>
          <p style={{ fontSize: 11, fontWeight: 800, letterSpacing: '0.2em', textTransform: 'uppercase', color: '#999', marginBottom: 20 }}>
            Assigned Details
          </p>

          {pInfo ? (
            <div style={{ flex: 1 }}>
              <h2 style={{ fontSize: 22, fontWeight: 800, color: '#111', margin: 0, lineHeight: 1.3 }}>{pInfo.name}</h2>
              <p style={{ fontSize: 14, color: '#555', marginTop: 10 }}>Area: <span style={{ color: '#999' }}>{pInfo.zone}</span></p>
              <p style={{ fontSize: 14, color: '#999', marginTop: 2 }}>{pInfo.addr}</p>
            </div>
          ) : (
            <div style={{ flex: 1 }}>
              <h2 style={{ fontSize: 18, fontWeight: 600, color: '#ccc', margin: 0 }}>No post selected</h2>
              <p style={{ fontSize: 13, color: '#bbb', marginTop: 6 }}>Select a post from the left panel</p>
            </div>
          )}

          <div style={{ borderTop: '1px solid #eee', paddingTop: 16, marginTop: 20, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: 11, fontWeight: 800, letterSpacing: '0.2em', textTransform: 'uppercase', color: '#999' }}>Tracking</span>
            <span style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, fontWeight: 700, color: entry ? '#10b981' : '#999' }}>
              <span style={{ width: 8, height: 8, borderRadius: '50%', background: entry ? '#10b981' : '#ccc' }} />
              {entry ? 'ACTIVE' : 'INACTIVE'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CommandCenter;
