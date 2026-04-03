import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useSettings } from '../context/SettingsContext';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const { settings } = useSettings();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) { setError('Please fill in all fields'); return; }
    setIsLoading(true);
    setError('');
    try {
      await login(email, password);
    } catch (err) {
      setError(err.message.includes('Invalid login') ? 'Invalid email or password' : (err.message || 'Login failed.'));
    } finally {
      setIsLoading(false);
    }
  };

  const roles = [
    { badge: 'Developer', color: 'bg-pink-100 text-pink-600', email: 'developer@secureguard.com' },
    { badge: 'Company', color: 'bg-blue-100 text-blue-600', email: 'company@secureguard.com' },
    { badge: 'Client', color: 'bg-amber-100 text-amber-600', email: 'client@secureguard.com' },
    { badge: 'Guard', color: 'bg-emerald-100 text-emerald-600', email: 'guard@secureguard.com' },
  ];

  return (
    <div className="flex min-h-screen font-sans">
      {/* Left */}
      <div className="hidden lg:flex flex-1 flex-col justify-center items-center bg-gradient-to-br from-indigo-500 via-indigo-600 to-purple-700 text-white px-12">
        {settings.company_logo_url ? (
          <img src={settings.company_logo_url} alt="Logo" className="w-20 h-20 rounded-2xl object-contain mb-8" />
        ) : (
          <div className="text-6xl mb-8">&#128737;</div>
        )}
        <h1 className="text-3xl font-bold mb-3">{settings.company_name || 'SecureGuard Pro'}</h1>
        <p className="text-indigo-100 text-center max-w-sm leading-relaxed">
          Complete security guard management system. Track guards, manage schedules, and monitor operations.
        </p>
        <div className="grid grid-cols-2 gap-3 mt-10 max-w-sm w-full">
          {['Role-Based Access', 'Real-Time Analytics', 'Smart Scheduling', 'Enterprise Security'].map((f) => (
            <div key={f} className="flex items-center gap-2 px-4 py-3 bg-white/10 rounded-xl text-sm backdrop-blur-sm">
              <span className="text-indigo-200">&#10003;</span> {f}
            </div>
          ))}
        </div>
      </div>

      {/* Right */}
      <div className="flex-1 flex items-center justify-center bg-white px-6">
        <div className="w-full max-w-sm">
          <div className="lg:hidden text-center mb-8">
            <div className="text-4xl mb-3">&#128737;</div>
            <h1 className="text-xl font-bold text-gray-800">{settings.company_name || 'SecureGuard Pro'}</h1>
          </div>

          <h2 className="text-2xl font-bold text-gray-800 mb-1">Welcome back</h2>
          <p className="text-gray-400 text-sm mb-8">Sign in to your account</p>

          {error && <div className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg px-4 py-3 mb-5">{error}</div>}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1.5">Email</label>
              <input
                type="email" placeholder="Enter your email" value={email}
                onChange={(e) => setEmail(e.target.value)} disabled={isLoading}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent disabled:bg-gray-50 transition"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1.5">Password</label>
              <input
                type="password" placeholder="Enter your password" value={password}
                onChange={(e) => setPassword(e.target.value)} disabled={isLoading}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent disabled:bg-gray-50 transition"
              />
            </div>
            <button type="submit" disabled={isLoading}
              className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-semibold transition disabled:opacity-60 disabled:cursor-not-allowed">
              {isLoading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          <div className="mt-8 p-4 bg-gray-50 rounded-xl">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Demo Accounts</p>
            <div className="space-y-2">
              {roles.map((r) => (
                <div key={r.badge} className="flex items-center gap-2 text-xs">
                  <span className={`px-2 py-0.5 rounded font-semibold text-[10px] uppercase ${r.color}`}>{r.badge}</span>
                  <span className="text-gray-500">{r.email}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;
