import React from 'react';
import { useAuth } from '../context/AuthContext';

function Attendance() {
  const { profile } = useAuth();
  const records = [
    { date: 'Apr 1', cin: '5:55 AM', cout: '2:05 PM', hrs: '8h 10m', st: 'Present' },
    { date: 'Apr 2', cin: '5:50 AM', cout: '2:00 PM', hrs: '8h 10m', st: 'Present' },
    { date: 'Apr 3', cin: '1:58 PM', cout: '-', hrs: '-', st: 'On Duty' },
    { date: 'Mar 31', cin: '5:52 AM', cout: '2:02 PM', hrs: '8h 10m', st: 'Present' },
    { date: 'Mar 30', cin: '-', cout: '-', hrs: '-', st: 'Day Off' },
    { date: 'Mar 29', cin: '5:48 AM', cout: '2:08 PM', hrs: '8h 20m', st: 'Present' },
    { date: 'Mar 28', cin: '-', cout: '-', hrs: '-', st: 'Day Off' },
    { date: 'Mar 27', cin: '5:55 AM', cout: '2:00 PM', hrs: '8h 5m', st: 'Present' },
    { date: 'Mar 26', cin: '5:58 AM', cout: '2:10 PM', hrs: '8h 12m', st: 'Present' },
    { date: 'Mar 25', cin: '6:02 AM', cout: '2:05 PM', hrs: '8h 3m', st: 'Late' },
  ];

  const summary = [
    { label: 'Working Days', value: '26' }, { label: 'Present', value: '24' },
    { label: 'Absent', value: '0' }, { label: 'Late', value: '2' },
    { label: 'Overtime', value: '4h 30m' }, { label: 'Leave', value: '2 days' },
  ];

  const stColor = { Present: 'bg-emerald-50 text-emerald-600', 'On Duty': 'bg-blue-50 text-blue-600', Late: 'bg-amber-50 text-amber-600', 'Day Off': 'bg-gray-100 text-gray-400' };

  return (
    <div className="animate-fade-in">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-bold text-gray-800">My Attendance</h1>
        <span className="text-xs font-semibold bg-emerald-50 text-emerald-600 px-3 py-1 rounded-lg">{profile?.full_name || 'Guard'}</span>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 mb-6">
        {summary.map((s, i) => (
          <div key={i} className="bg-white rounded-xl p-4 border border-gray-100 text-center">
            <p className="text-lg font-bold text-gray-800">{s.value}</p>
            <p className="text-xs text-gray-400 mt-1">{s.label}</p>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-xl border border-gray-100 overflow-x-auto">
        <table className="w-full text-sm">
          <thead><tr className="text-left text-xs text-gray-400 uppercase tracking-wider">
            <th className="px-5 py-4">Date</th><th className="px-5 py-4">Check In</th><th className="px-5 py-4">Check Out</th><th className="px-5 py-4">Hours</th><th className="px-5 py-4">Status</th>
          </tr></thead>
          <tbody>
            {records.map((r, i) => (
              <tr key={i} className="border-t border-gray-50">
                <td className="px-5 py-3 font-medium text-gray-600">{r.date}</td>
                <td className="px-5 py-3 text-gray-500">{r.cin}</td>
                <td className="px-5 py-3 text-gray-500">{r.cout}</td>
                <td className="px-5 py-3 text-gray-500">{r.hrs}</td>
                <td className="px-5 py-3"><span className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-full ${stColor[r.st] || 'bg-gray-100 text-gray-500'}`}>{r.st}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default Attendance;
