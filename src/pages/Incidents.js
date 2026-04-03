import React from 'react';

function Incidents() {
  const incidents = [
    {
      id: 'INC-041',
      title: 'Unauthorized Vehicle Entry Attempt',
      location: 'Main Gate - Gulshan Tower',
      date: 'Apr 2, 2026 - 11:45 PM',
      reportedBy: 'Rafiq Ahmed',
      priority: 'High',
      status: 'Resolved',
      description: 'Unknown vehicle attempted entry without authorization. Guard stopped the vehicle and verified ID. Vehicle turned away.',
    },
    {
      id: 'INC-040',
      title: 'Suspicious Person Near Back Gate',
      location: 'Back Gate - Banani Heights',
      date: 'Mar 30, 2026 - 3:20 AM',
      reportedBy: 'Alamgir Kabir',
      priority: 'Medium',
      status: 'Resolved',
      description: 'Unknown individual loitering near back gate for extended period. Guard approached and individual left the premises.',
    },
    {
      id: 'INC-039',
      title: 'Fire Alarm False Trigger',
      location: '3rd Floor - Dhaka Tower',
      date: 'Mar 28, 2026 - 2:10 PM',
      reportedBy: 'Sohel Rana',
      priority: 'Low',
      status: 'Resolved',
      description: 'Fire alarm triggered on 3rd floor due to cooking smoke. No actual fire. Reset alarm and notified management.',
    },
    {
      id: 'INC-038',
      title: 'CCTV Camera Offline - Zone B',
      location: 'Zone B - Mirpur Industrial',
      date: 'Mar 25, 2026 - 9:00 AM',
      reportedBy: 'Kamal Hossain',
      priority: 'Medium',
      status: 'Open',
      description: 'Camera #7 in Zone B went offline. Technician has been notified. Temporary manual patrol increased.',
    },
    {
      id: 'INC-037',
      title: 'Theft Attempt - Parking Area',
      location: 'Parking Level 2 - Gulshan Market',
      date: 'Mar 22, 2026 - 1:30 AM',
      reportedBy: 'Mizanur Rahman',
      priority: 'High',
      status: 'Resolved',
      description: 'Attempted vehicle break-in detected via CCTV. Guard intervened and suspect fled. Police report filed.',
    },
  ];

  const getPriorityClass = (priority) => {
    if (priority === 'High') return 'off-duty';
    if (priority === 'Medium') return 'on-leave';
    return 'on-duty';
  };

  return (
    <div className="guards-page">
      <div className="page-header">
        <h1>Incidents</h1>
        <button className="add-btn">+ Report Incident</button>
      </div>

      <div className="incident-cards">
        {incidents.map((incident) => (
          <div className="incident-card" key={incident.id}>
            <div className="incident-card-header">
              <div>
                <span className="incident-id">{incident.id}</span>
                <h3>{incident.title}</h3>
              </div>
              <div className="incident-badges">
                <span className={`status-badge ${getPriorityClass(incident.priority)}`}>
                  {incident.priority}
                </span>
                <span className={`status-badge ${incident.status === 'Resolved' ? 'on-duty' : 'on-leave'}`}>
                  {incident.status}
                </span>
              </div>
            </div>
            <p className="incident-desc">{incident.description}</p>
            <div className="incident-footer">
              <span>&#128205; {incident.location}</span>
              <span>&#128197; {incident.date}</span>
              <span>&#128100; {incident.reportedBy}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Incidents;
