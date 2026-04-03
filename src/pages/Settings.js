import React, { useState } from 'react';
import { useSettings } from '../context/SettingsContext';
import { supabase } from '../lib/supabase';

function Settings() {
  const { settings, updateSettings } = useSettings();
  const [tab, setTab] = useState('company');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState('');
  const [uploading, setUploading] = useState(false);

  const [companyName, setCompanyName] = useState(settings.company_name);
  const [logoUrl, setLogoUrl] = useState(settings.company_logo_url);
  const [primaryColor, setPrimaryColor] = useState(settings.primary_color);
  const [secondaryColor, setSecondaryColor] = useState(settings.secondary_color);
  const [accentColor, setAccentColor] = useState(settings.accent_color);
  const [buttonColor, setButtonColor] = useState(settings.button_color);
  const [smtpHost, setSmtpHost] = useState(settings.smtp_host);
  const [smtpPort, setSmtpPort] = useState(settings.smtp_port);
  const [smtpUser, setSmtpUser] = useState(settings.smtp_user);
  const [smtpPassword, setSmtpPassword] = useState(settings.smtp_password);
  const [smtpFromEmail, setSmtpFromEmail] = useState(settings.smtp_from_email);
  const [smtpFromName, setSmtpFromName] = useState(settings.smtp_from_name);
  const [smtpSecure, setSmtpSecure] = useState(settings.smtp_secure);

  const flash = (msg) => { setSaved(msg); setTimeout(() => setSaved(''), 3000); };

  const save = async (data) => {
    setSaving(true);
    try { await updateSettings(data); flash('Saved!'); } catch (e) { alert('Error: ' + e.message); } finally { setSaving(false); }
  };

  const handleLogoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (!file.type.startsWith('image/') || file.size > 2 * 1024 * 1024) { alert('Image under 2MB only'); return; }
    setUploading(true);
    try {
      const name = `logo-${Date.now()}.${file.name.split('.').pop()}`;
      const { error } = await supabase.storage.from('logos').upload(name, file, { upsert: true });
      if (error) throw error;
      const { data } = supabase.storage.from('logos').getPublicUrl(name);
      setLogoUrl(data.publicUrl);
    } catch (e) { alert('Upload failed: ' + e.message); } finally { setUploading(false); }
  };

  const tabs = [
    { id: 'company', label: 'Company Info', icon: '&#127970;' },
    { id: 'theme', label: 'Theme', icon: '&#127912;' },
    { id: 'smtp', label: 'SMTP', icon: '&#128231;' },
  ];

  const ColorField = ({ label, hint, value, onChange }) => (
    <div>
      <label className="block text-sm font-medium text-gray-600 mb-1.5">{label}</label>
      <div className="flex items-center gap-2">
        <input type="color" value={value} onChange={e => onChange(e.target.value)} className="w-10 h-10 rounded-lg border border-gray-200 cursor-pointer p-0.5" />
        <input type="text" value={value} onChange={e => onChange(e.target.value)} className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-sm font-mono" />
      </div>
      <p className="text-xs text-gray-400 mt-1">{hint}</p>
    </div>
  );

  return (
    <div className="animate-fade-in">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-bold text-gray-800">System Settings</h1>
        {saved && <span className="text-sm font-medium text-emerald-600 bg-emerald-50 px-3 py-1 rounded-lg">{saved}</span>}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-white rounded-xl p-1 border border-gray-100 mb-6 w-fit">
        {tabs.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition ${tab === t.id ? 'bg-indigo-600 text-white' : 'text-gray-500 hover:bg-gray-50'}`}>
            <span dangerouslySetInnerHTML={{ __html: t.icon }} />{t.label}
          </button>
        ))}
      </div>

      {/* Company */}
      {tab === 'company' && (
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          <div className="lg:col-span-3 bg-white rounded-xl p-6 border border-gray-100">
            <h2 className="font-semibold text-gray-800 mb-1">Company Information</h2>
            <p className="text-sm text-gray-400 mb-6">Appears on login page, sidebar, and navbar.</p>
            <div className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1.5">Company Name</label>
                <input type="text" value={companyName} onChange={e => setCompanyName(e.target.value)} className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1.5">Logo</label>
                {logoUrl && <div className="flex items-center gap-3 mb-3"><img src={logoUrl} alt="Logo" className="w-16 h-16 rounded-xl border border-gray-200 object-contain p-1" /><button onClick={() => setLogoUrl('')} className="text-xs text-red-500 hover:text-red-600">Remove</button></div>}
                <div className="flex items-center gap-3">
                  <label className="px-4 py-2 bg-indigo-600 text-white text-sm rounded-lg cursor-pointer hover:bg-indigo-700 transition">{uploading ? 'Uploading...' : 'Upload'}<input type="file" accept="image/*" onChange={handleLogoUpload} hidden disabled={uploading} /></label>
                  <span className="text-xs text-gray-400">or</span>
                  <input type="url" value={logoUrl} onChange={e => setLogoUrl(e.target.value)} placeholder="Paste URL" className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-sm" />
                </div>
              </div>
              <button onClick={() => save({ company_name: companyName, company_logo_url: logoUrl })} disabled={saving} className="px-5 py-2.5 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 disabled:opacity-50 transition">{saving ? 'Saving...' : 'Save'}</button>
            </div>
          </div>
          <div className="lg:col-span-2 bg-white rounded-xl p-6 border border-gray-100 self-start">
            <h2 className="font-semibold text-gray-800 mb-4">Preview</h2>
            <div className="border border-gray-200 rounded-xl overflow-hidden">
              <div className="bg-gray-50 p-4 border-b border-gray-200">
                <div className="flex items-center gap-2 mb-3 pb-3 border-b border-gray-100">
                  {logoUrl ? <img src={logoUrl} alt="" className="w-6 h-6 rounded" /> : <span>&#128737;</span>}
                  <span className="text-sm font-semibold text-gray-700">{companyName || 'Company'}</span>
                </div>
                <div className="space-y-1">
                  {['Dashboard', 'Guards', 'Schedule'].map((n, i) => (
                    <div key={n} className={`text-xs px-3 py-1.5 rounded ${i === 0 ? 'bg-indigo-100 text-indigo-600 font-medium' : 'text-gray-400'}`}>{n}</div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Theme */}
      {tab === 'theme' && (
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          <div className="lg:col-span-3 bg-white rounded-xl p-6 border border-gray-100">
            <h2 className="font-semibold text-gray-800 mb-1">Theme & Appearance</h2>
            <p className="text-sm text-gray-400 mb-6">Customize sidebar, buttons, and accents.</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mb-6">
              <ColorField label="Sidebar Primary" hint="Top gradient" value={primaryColor} onChange={setPrimaryColor} />
              <ColorField label="Sidebar Secondary" hint="Bottom gradient" value={secondaryColor} onChange={setSecondaryColor} />
              <ColorField label="Accent Color" hint="Active highlights" value={accentColor} onChange={setAccentColor} />
              <ColorField label="Button Color" hint="Buttons, login" value={buttonColor} onChange={setButtonColor} />
            </div>
            <div className="flex gap-3">
              <button onClick={() => save({ primary_color: primaryColor, secondary_color: secondaryColor, accent_color: accentColor, button_color: buttonColor })} disabled={saving} className="px-5 py-2.5 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 disabled:opacity-50 transition">{saving ? 'Saving...' : 'Save Theme'}</button>
              <button onClick={() => { setPrimaryColor('#1a1a2e'); setSecondaryColor('#16213e'); setAccentColor('#4fc3f7'); setButtonColor('#302b63'); }} className="px-5 py-2.5 bg-gray-100 text-gray-600 text-sm font-medium rounded-lg hover:bg-gray-200 transition">Reset</button>
            </div>
          </div>
          <div className="lg:col-span-2 bg-white rounded-xl p-6 border border-gray-100 self-start">
            <h2 className="font-semibold text-gray-800 mb-4">Live Preview</h2>
            <div className="border border-gray-200 rounded-xl overflow-hidden">
              <div className="p-4" style={{ background: `linear-gradient(180deg, ${primaryColor}, ${secondaryColor})` }}>
                <div className="flex items-center gap-2 mb-3 pb-3 border-b border-white/10">
                  <span className="text-white">&#128737;</span>
                  <span className="text-sm font-semibold text-white">{settings.company_name}</span>
                </div>
                <div className="space-y-1">
                  <div className="text-xs px-3 py-1.5 rounded bg-white/10 text-white border-l-2" style={{ borderLeftColor: accentColor }}>Dashboard</div>
                  <div className="text-xs px-3 py-1.5 text-white/50">Guards</div>
                </div>
              </div>
              <div className="p-4 bg-gray-50 flex items-center gap-3">
                <button className="text-xs px-4 py-1.5 text-white rounded" style={{ background: buttonColor }}>Button</button>
                <div className="flex-1 h-1.5 rounded-full" style={{ background: accentColor }} />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SMTP */}
      {tab === 'smtp' && (
        <div className="bg-white rounded-xl p-6 border border-gray-100 max-w-3xl">
          <h2 className="font-semibold text-gray-800 mb-1">SMTP / Email Configuration</h2>
          <p className="text-sm text-gray-400 mb-6">Configure email for notifications and alerts.</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mb-5">
            {[
              { label: 'SMTP Host', value: smtpHost, set: setSmtpHost, ph: 'smtp.gmail.com' },
              { label: 'Port', value: smtpPort, set: (v) => setSmtpPort(parseInt(v) || 587), ph: '587', type: 'number' },
              { label: 'Username', value: smtpUser, set: setSmtpUser, ph: 'your-email@gmail.com' },
              { label: 'Password', value: smtpPassword, set: setSmtpPassword, ph: 'App password', type: 'password' },
              { label: 'From Email', value: smtpFromEmail, set: setSmtpFromEmail, ph: 'noreply@company.com' },
              { label: 'From Name', value: smtpFromName, set: setSmtpFromName, ph: 'SecureGuard' },
            ].map((f, i) => (
              <div key={i}>
                <label className="block text-sm font-medium text-gray-600 mb-1.5">{f.label}</label>
                <input type={f.type || 'text'} value={f.value} onChange={e => f.set(e.target.value)} placeholder={f.ph} className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
              </div>
            ))}
          </div>

          <div className="flex items-center justify-between mb-5 py-3">
            <span className="text-sm text-gray-600">Use TLS/SSL</span>
            <button onClick={() => setSmtpSecure(!smtpSecure)} className={`w-11 h-6 rounded-full relative transition ${smtpSecure ? 'bg-emerald-500' : 'bg-gray-300'}`}>
              <div className={`w-5 h-5 bg-white rounded-full shadow absolute top-0.5 transition-transform ${smtpSecure ? 'translate-x-5' : 'translate-x-0.5'}`} />
            </button>
          </div>

          <div className="flex items-center gap-3 mb-5 flex-wrap">
            <span className="text-sm text-gray-400">Presets:</span>
            {[
              { label: 'Gmail', host: 'smtp.gmail.com', port: 587 },
              { label: 'SendGrid', host: 'smtp.sendgrid.net', port: 587, user: 'apikey' },
              { label: 'Mailgun', host: 'smtp.mailgun.org', port: 587 },
              { label: 'SES', host: 'email-smtp.us-east-1.amazonaws.com', port: 587 },
            ].map(p => (
              <button key={p.label} onClick={() => { setSmtpHost(p.host); setSmtpPort(p.port); setSmtpSecure(true); if (p.user) setSmtpUser(p.user); }}
                className="px-3 py-1.5 bg-gray-100 text-gray-600 text-xs font-medium rounded-lg hover:bg-gray-200 transition">{p.label}</button>
            ))}
          </div>

          <button onClick={() => save({ smtp_host: smtpHost, smtp_port: smtpPort, smtp_user: smtpUser, smtp_password: smtpPassword, smtp_from_email: smtpFromEmail, smtp_from_name: smtpFromName, smtp_secure: smtpSecure })} disabled={saving}
            className="px-5 py-2.5 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 disabled:opacity-50 transition">{saving ? 'Saving...' : 'Save SMTP'}</button>
        </div>
      )}
    </div>
  );
}

export default Settings;
