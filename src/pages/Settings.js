import React, { useState } from 'react';
import { useSettings } from '../context/SettingsContext';
import { supabase } from '../lib/supabase';

function Settings() {
  const { settings, updateSettings } = useSettings();
  const [activeTab, setActiveTab] = useState('company');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState('');
  const [uploading, setUploading] = useState(false);

  // Local form states
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

  async function handleSaveCompany() {
    setSaving(true);
    try {
      await updateSettings({ company_name: companyName, company_logo_url: logoUrl });
      showSaved('Company info saved!');
    } catch (err) {
      alert('Error saving: ' + err.message);
    } finally {
      setSaving(false);
    }
  }

  async function handleSaveTheme() {
    setSaving(true);
    try {
      await updateSettings({
        primary_color: primaryColor,
        secondary_color: secondaryColor,
        accent_color: accentColor,
        button_color: buttonColor,
      });
      showSaved('Theme saved!');
    } catch (err) {
      alert('Error saving: ' + err.message);
    } finally {
      setSaving(false);
    }
  }

  async function handleSaveSmtp() {
    setSaving(true);
    try {
      await updateSettings({
        smtp_host: smtpHost,
        smtp_port: smtpPort,
        smtp_user: smtpUser,
        smtp_password: smtpPassword,
        smtp_from_email: smtpFromEmail,
        smtp_from_name: smtpFromName,
        smtp_secure: smtpSecure,
      });
      showSaved('SMTP settings saved!');
    } catch (err) {
      alert('Error saving: ' + err.message);
    } finally {
      setSaving(false);
    }
  }

  function showSaved(msg) {
    setSaved(msg);
    setTimeout(() => setSaved(''), 3000);
  }

  function handleResetTheme() {
    setPrimaryColor('#1a1a2e');
    setSecondaryColor('#16213e');
    setAccentColor('#4fc3f7');
    setButtonColor('#302b63');
  }

  async function handleLogoUpload(e) {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Please select an image file');
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      alert('File size must be under 2MB');
      return;
    }

    setUploading(true);
    try {
      const ext = file.name.split('.').pop();
      const fileName = `company-logo-${Date.now()}.${ext}`;

      const { error: uploadError } = await supabase.storage
        .from('logos')
        .upload(fileName, file, { upsert: true });

      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage
        .from('logos')
        .getPublicUrl(fileName);

      setLogoUrl(urlData.publicUrl);
    } catch (err) {
      alert('Upload failed: ' + err.message + '\n\nMake sure you have created a "logos" storage bucket in Supabase with public access.');
    } finally {
      setUploading(false);
    }
  }

  const tabs = [
    { id: 'company', label: 'Company Info', icon: '&#127970;' },
    { id: 'theme', label: 'Theme & Colors', icon: '&#127912;' },
    { id: 'smtp', label: 'SMTP / Email', icon: '&#128231;' },
  ];

  return (
    <div className="settings-page">
      <div className="page-header">
        <h1>System Settings</h1>
        {saved && <span className="save-toast">{saved}</span>}
      </div>

      <div className="settings-tabs">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            className={`settings-tab ${activeTab === tab.id ? 'active' : ''}`}
            onClick={() => setActiveTab(tab.id)}
          >
            <span dangerouslySetInnerHTML={{ __html: tab.icon }} />
            {tab.label}
          </button>
        ))}
      </div>

      <div className="settings-content">
        {/* ==================== Company Info Tab ==================== */}
        {activeTab === 'company' && (
          <div className="settings-section">
            <div className="settings-card">
              <h2>Company Information</h2>
              <p className="settings-desc">
                Configure your company name and logo. These will appear across the entire application — login page, sidebar, and navbar.
              </p>

              <div className="settings-form">
                <div className="settings-field">
                  <label>Company Name</label>
                  <input
                    type="text"
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    placeholder="Enter company name"
                  />
                </div>

                <div className="settings-field">
                  <label>Company Logo</label>
                  <div className="logo-upload-area">
                    {logoUrl ? (
                      <div className="logo-preview">
                        <img src={logoUrl} alt="Company Logo" />
                        <button
                          className="logo-remove-btn"
                          onClick={() => setLogoUrl('')}
                        >
                          Remove
                        </button>
                      </div>
                    ) : (
                      <div className="logo-placeholder">
                        <span>&#128247;</span>
                        <p>No logo uploaded</p>
                      </div>
                    )}
                    <div className="logo-actions">
                      <label className="upload-btn">
                        {uploading ? 'Uploading...' : 'Upload Logo'}
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleLogoUpload}
                          disabled={uploading}
                          hidden
                        />
                      </label>
                      <span className="upload-hint">or</span>
                      <input
                        type="url"
                        value={logoUrl}
                        onChange={(e) => setLogoUrl(e.target.value)}
                        placeholder="Paste image URL"
                        className="logo-url-input"
                      />
                    </div>
                  </div>
                </div>

                <button
                  className="save-btn"
                  onClick={handleSaveCompany}
                  disabled={saving}
                >
                  {saving ? 'Saving...' : 'Save Company Info'}
                </button>
              </div>
            </div>

            <div className="settings-card preview-card">
              <h2>Preview</h2>
              <div className="company-preview">
                <div className="preview-sidebar">
                  <div className="preview-sidebar-header">
                    {logoUrl ? (
                      <img src={logoUrl} alt="Logo" className="preview-logo" />
                    ) : (
                      <span className="preview-shield">&#128737;</span>
                    )}
                    <span className="preview-name">{companyName || 'Company Name'}</span>
                  </div>
                  <div className="preview-nav-items">
                    <div className="preview-nav-item active">Dashboard</div>
                    <div className="preview-nav-item">Guards</div>
                    <div className="preview-nav-item">Schedule</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ==================== Theme Tab ==================== */}
        {activeTab === 'theme' && (
          <div className="settings-section">
            <div className="settings-card">
              <h2>Theme & Appearance</h2>
              <p className="settings-desc">
                Customize the color scheme. Changes apply to sidebar, buttons, login page, and accent highlights.
              </p>

              <div className="settings-form">
                <div className="color-grid">
                  <div className="color-field">
                    <label>Sidebar Primary</label>
                    <div className="color-input-wrapper">
                      <input
                        type="color"
                        value={primaryColor}
                        onChange={(e) => setPrimaryColor(e.target.value)}
                      />
                      <input
                        type="text"
                        value={primaryColor}
                        onChange={(e) => setPrimaryColor(e.target.value)}
                        className="color-text"
                      />
                    </div>
                    <span className="color-hint">Sidebar top, main background</span>
                  </div>

                  <div className="color-field">
                    <label>Sidebar Secondary</label>
                    <div className="color-input-wrapper">
                      <input
                        type="color"
                        value={secondaryColor}
                        onChange={(e) => setSecondaryColor(e.target.value)}
                      />
                      <input
                        type="text"
                        value={secondaryColor}
                        onChange={(e) => setSecondaryColor(e.target.value)}
                        className="color-text"
                      />
                    </div>
                    <span className="color-hint">Sidebar bottom gradient</span>
                  </div>

                  <div className="color-field">
                    <label>Accent Color</label>
                    <div className="color-input-wrapper">
                      <input
                        type="color"
                        value={accentColor}
                        onChange={(e) => setAccentColor(e.target.value)}
                      />
                      <input
                        type="text"
                        value={accentColor}
                        onChange={(e) => setAccentColor(e.target.value)}
                        className="color-text"
                      />
                    </div>
                    <span className="color-hint">Active nav item highlight</span>
                  </div>

                  <div className="color-field">
                    <label>Button Color</label>
                    <div className="color-input-wrapper">
                      <input
                        type="color"
                        value={buttonColor}
                        onChange={(e) => setButtonColor(e.target.value)}
                      />
                      <input
                        type="text"
                        value={buttonColor}
                        onChange={(e) => setButtonColor(e.target.value)}
                        className="color-text"
                      />
                    </div>
                    <span className="color-hint">Buttons, login gradient</span>
                  </div>
                </div>

                <div className="theme-actions">
                  <button
                    className="save-btn"
                    onClick={handleSaveTheme}
                    disabled={saving}
                  >
                    {saving ? 'Saving...' : 'Save Theme'}
                  </button>
                  <button className="reset-btn" onClick={handleResetTheme}>
                    Reset to Default
                  </button>
                </div>
              </div>
            </div>

            <div className="settings-card preview-card">
              <h2>Live Preview</h2>
              <div className="theme-preview">
                <div
                  className="preview-sidebar"
                  style={{
                    background: `linear-gradient(180deg, ${primaryColor} 0%, ${secondaryColor} 100%)`,
                  }}
                >
                  <div className="preview-sidebar-header">
                    <span className="preview-shield">&#128737;</span>
                    <span className="preview-name">{settings.company_name}</span>
                  </div>
                  <div className="preview-nav-items">
                    <div
                      className="preview-nav-item active"
                      style={{ borderLeftColor: accentColor }}
                    >
                      Dashboard
                    </div>
                    <div className="preview-nav-item">Guards</div>
                    <div className="preview-nav-item">Schedule</div>
                  </div>
                </div>
                <div className="preview-main">
                  <button
                    className="preview-button"
                    style={{ background: buttonColor }}
                  >
                    Sample Button
                  </button>
                  <div
                    className="preview-accent-bar"
                    style={{ background: accentColor }}
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ==================== SMTP Tab ==================== */}
        {activeTab === 'smtp' && (
          <div className="settings-section smtp-section">
            <div className="settings-card full-width">
              <h2>SMTP / Email Configuration</h2>
              <p className="settings-desc">
                Configure email server settings for sending notifications, alerts, and reports.
                Supports Gmail, SendGrid, Mailgun, Amazon SES, and any custom SMTP server.
              </p>

              <div className="settings-form">
                <div className="smtp-grid">
                  <div className="settings-field">
                    <label>SMTP Host</label>
                    <input
                      type="text"
                      value={smtpHost}
                      onChange={(e) => setSmtpHost(e.target.value)}
                      placeholder="smtp.gmail.com"
                    />
                  </div>
                  <div className="settings-field">
                    <label>SMTP Port</label>
                    <input
                      type="number"
                      value={smtpPort}
                      onChange={(e) => setSmtpPort(parseInt(e.target.value) || 587)}
                      placeholder="587"
                    />
                  </div>
                  <div className="settings-field">
                    <label>Username / Email</label>
                    <input
                      type="text"
                      value={smtpUser}
                      onChange={(e) => setSmtpUser(e.target.value)}
                      placeholder="your-email@gmail.com"
                    />
                  </div>
                  <div className="settings-field">
                    <label>Password / App Key</label>
                    <input
                      type="password"
                      value={smtpPassword}
                      onChange={(e) => setSmtpPassword(e.target.value)}
                      placeholder="App-specific password"
                    />
                  </div>
                  <div className="settings-field">
                    <label>From Email</label>
                    <input
                      type="email"
                      value={smtpFromEmail}
                      onChange={(e) => setSmtpFromEmail(e.target.value)}
                      placeholder="noreply@yourcompany.com"
                    />
                  </div>
                  <div className="settings-field">
                    <label>From Name</label>
                    <input
                      type="text"
                      value={smtpFromName}
                      onChange={(e) => setSmtpFromName(e.target.value)}
                      placeholder="SecureGuard Notifications"
                    />
                  </div>
                </div>

                <div className="settings-field toggle-field">
                  <label className="toggle-label">
                    <span>Use TLS/SSL (Secure Connection)</span>
                    <div
                      className={`toggle ${smtpSecure ? 'on' : ''}`}
                      onClick={() => setSmtpSecure(!smtpSecure)}
                    >
                      <div className="toggle-knob" />
                    </div>
                  </label>
                </div>

                <div className="smtp-presets">
                  <span className="presets-label">Quick Presets:</span>
                  <button
                    className="preset-btn"
                    onClick={() => { setSmtpHost('smtp.gmail.com'); setSmtpPort(587); setSmtpSecure(true); }}
                  >
                    Gmail
                  </button>
                  <button
                    className="preset-btn"
                    onClick={() => { setSmtpHost('smtp.sendgrid.net'); setSmtpPort(587); setSmtpSecure(true); setSmtpUser('apikey'); }}
                  >
                    SendGrid
                  </button>
                  <button
                    className="preset-btn"
                    onClick={() => { setSmtpHost('smtp.mailgun.org'); setSmtpPort(587); setSmtpSecure(true); }}
                  >
                    Mailgun
                  </button>
                  <button
                    className="preset-btn"
                    onClick={() => { setSmtpHost('email-smtp.us-east-1.amazonaws.com'); setSmtpPort(587); setSmtpSecure(true); }}
                  >
                    Amazon SES
                  </button>
                </div>

                <button
                  className="save-btn"
                  onClick={handleSaveSmtp}
                  disabled={saving}
                >
                  {saving ? 'Saving...' : 'Save SMTP Settings'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default Settings;
