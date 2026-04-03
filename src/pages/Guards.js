import React from 'react';

function Guards() {
  const guards = [
    { id: 'SG-001', name: 'Rafiq Ahmed', phone: '01711-234567', zone: 'Gate A', status: 'on-duty', joinDate: '2023-01-15' },
    { id: 'SG-002', name: 'Kamal Hossain', phone: '01812-345678', zone: 'Zone C', status: 'on-duty', joinDate: '2023-03-20' },
    { id: 'SG-003', name: 'Jahangir Alam', phone: '01913-456789', zone: 'Zone B', status: 'off-duty', joinDate: '2022-11-10' },
    { id: 'SG-004', name: 'Nasir Uddin', phone: '01614-567890', zone: 'Gate B', status: 'on-leave', joinDate: '2023-06-01' },
    { id: 'SG-005', name: 'Sohel Rana', phone: '01515-678901', zone: 'Zone A', status: 'on-duty', joinDate: '2022-08-15' },
    { id: 'SG-006', name: 'Mizanur Rahman', phone: '01716-789012', zone: 'Parking', status: 'on-duty', joinDate: '2023-02-28' },
    { id: 'SG-007', name: 'Farid Hasan', phone: '01817-890123', zone: 'Zone D', status: 'off-duty', joinDate: '2023-09-12' },
    { id: 'SG-008', name: 'Alamgir Kabir', phone: '01918-901234', zone: 'Gate C', status: 'on-duty', joinDate: '2022-05-20' },
  ];

  const getInitials = (name) => {
    return name.split(' ').map(n => n[0]).join('');
  };

  return (
    <div className="guards-page">
      <div className="page-header">
        <h1>Security Guards</h1>
        <button className="add-btn">+ Add New Guard</button>
      </div>

      <div className="guards-table">
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Name</th>
              <th>Phone</th>
              <th>Assigned Zone</th>
              <th>Status</th>
              <th>Join Date</th>
            </tr>
          </thead>
          <tbody>
            {guards.map((guard) => (
              <tr key={guard.id}>
                <td>{guard.id}</td>
                <td>
                  <div className="guard-name-cell">
                    <div className="guard-avatar">{getInitials(guard.name)}</div>
                    {guard.name}
                  </div>
                </td>
                <td>{guard.phone}</td>
                <td>{guard.zone}</td>
                <td>
                  <span className={`status-badge ${guard.status}`}>
                    {guard.status.replace('-', ' ')}
                  </span>
                </td>
                <td>{guard.joinDate}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default Guards;
