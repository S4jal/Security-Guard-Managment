import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useSettings } from '../context/SettingsContext';

const roleDot = {
  developer: 'bg-pink-500',
  company: 'bg-blue-500',
  client: 'bg-amber-500',
  guard: 'bg-emerald-500',
};

function Navbar({ onToggleSidebar }) {
  const { profile, role, logout } = useAuth();
  const { settings } = useSettings();
  const userName = profile?.full_name || 'User';

  return (
    <div className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-gray-100 px-6 py-3 flex items-center justify-between">
      <div className="flex items-center gap-4">
        <button onClick={onToggleSidebar} className="text-gray-400 hover:text-gray-600 transition p-1">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
        <span className="text-sm text-gray-400 hidden sm:block">{settings.company_name || 'Security Guard Management'}</span>
      </div>

      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center text-xs font-bold">
            {userName.charAt(0).toUpperCase()}
          </div>
          <div className="hidden sm:flex flex-col">
            <span className="text-sm font-medium text-gray-700">{userName}</span>
            <div className="flex items-center gap-1.5">
              <span className={`w-1.5 h-1.5 rounded-full ${roleDot[role] || 'bg-gray-400'}`} />
              <span className="text-[11px] text-gray-400 capitalize">{role}</span>
            </div>
          </div>
        </div>
        <button onClick={logout}
          className="text-sm text-gray-400 hover:text-red-500 transition px-3 py-1.5 rounded-lg hover:bg-red-50">
          Logout
        </button>
      </div>
    </div>
  );
}

export default Navbar;
