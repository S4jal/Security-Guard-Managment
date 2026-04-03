import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { supabase, isSupabaseConfigured } from '../lib/supabase';

const defaultSettings = {
  company_name: 'SecureGuard Pro',
  company_logo_url: '',
  primary_color: '#1a1a2e',
  secondary_color: '#16213e',
  accent_color: '#4fc3f7',
  button_color: '#302b63',
  smtp_host: '',
  smtp_port: 587,
  smtp_user: '',
  smtp_password: '',
  smtp_from_email: '',
  smtp_from_name: '',
  smtp_secure: true,
};

const SettingsContext = createContext({
  settings: defaultSettings,
  updateSettings: async () => {},
  loading: true,
});

export const useSettings = () => useContext(SettingsContext);

function applyTheme(settings) {
  const root = document.documentElement;
  root.style.setProperty('--primary-color', settings.primary_color);
  root.style.setProperty('--secondary-color', settings.secondary_color);
  root.style.setProperty('--accent-color', settings.accent_color);
  root.style.setProperty('--button-color', settings.button_color);
}

export function SettingsProvider({ children }) {
  const [settings, setSettings] = useState(defaultSettings);
  const [loading, setLoading] = useState(true);

  const fetchSettings = useCallback(async () => {
    if (!isSupabaseConfigured) {
      applyTheme(defaultSettings);
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('app_settings')
        .select('*')
        .eq('id', 1)
        .single();

      if (!error && data) {
        const merged = { ...defaultSettings, ...data };
        setSettings(merged);
        applyTheme(merged);
      } else {
        applyTheme(defaultSettings);
      }
    } catch (err) {
      console.error('Error fetching settings:', err);
      applyTheme(defaultSettings);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  async function updateSettings(newSettings) {
    const updated = { ...settings, ...newSettings, updated_at: new Date().toISOString() };

    const { error } = await supabase
      .from('app_settings')
      .upsert({ id: 1, ...updated });

    if (error) throw error;

    setSettings(updated);
    applyTheme(updated);
    return updated;
  }

  return (
    <SettingsContext.Provider value={{ settings, updateSettings, loading }}>
      {children}
    </SettingsContext.Provider>
  );
}
