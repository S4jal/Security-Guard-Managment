import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { supabase, isSupabaseConfigured } from '../lib/supabase';

const AuthContext = createContext({});

export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const resolved = useRef(false);

  function done() {
    if (!resolved.current) {
      resolved.current = true;
      setLoading(false);
    }
  }

  useEffect(() => {
    if (!isSupabaseConfigured) {
      done();
      return;
    }

    // Safety timeout - never stay loading more than 3 seconds
    const timeout = setTimeout(done, 3000);

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        if (session?.user) {
          setUser(session.user);
          try {
            const { data } = await supabase
              .from('profiles')
              .select('*')
              .eq('id', session.user.id)
              .single();
            if (data) setProfile(data);
          } catch (e) {}
        } else {
          setUser(null);
          setProfile(null);
        }
        done();
      }
    );

    return () => {
      subscription.unsubscribe();
      clearTimeout(timeout);
    };
  }, []);

  async function login(email, password) {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
    return data;
  }

  async function logout() {
    try {
      await supabase.auth.signOut();
    } catch (e) {
      console.error('Sign out error:', e);
    }
    setUser(null);
    setProfile(null);
  }

  return (
    <AuthContext.Provider value={{ user, profile, role: profile?.role || null, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
