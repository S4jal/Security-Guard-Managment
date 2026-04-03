import React from 'react';

function Clients() {
  const clients = [
    { id: 'CL-001', name: 'Dhaka Tower Corp', contact: 'Mr. Rahman', phone: '01711-111111', sites: 3, guards: 8, status: 'Active' },
    { id: 'CL-002', name: 'Banani Heights', contact: 'Ms. Fatema', phone: '01812-222222', sites: 1, guards: 5, status: 'Active' },
    { id: 'CL-003', name: 'Gulshan Market Ltd', contact: 'Mr. Karim', phone: '01913-333333', sites: 4, guards: 12, status: 'Active' },
    { id: 'CL-004', name: 'Uttara Residence', contact: 'Mr. Islam', phone: '01614-444444', sites: 2, guards: 4, status: 'Pending' },
    { id: 'CL-005', name: 'Mirpur Industrial', contact: 'Mr. Haque', phone: '01515-555555', sites: 2, guards: 6, status: 'Active' },
    { id: 'CL-006', name: 'Motijheel Complex', contact: 'Ms. Akter', phone: '01716-666666', sites: 1, guards: 3, status: 'Active' },
  ];

  return (
    <div className="guards-page">
      <div className="page-header">
        <h1>Clients</h1>
        <button className="add-btn">+ Add Client</button>
      </div>

      <div className="guards-table">
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Company Name</th>
              <th>Contact Person</th>
              <th>Phone</th>
              <th>Sites</th>
              <th>Guards</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {clients.map((client) => (
              <tr key={client.id}>
                <td>{client.id}</td>
                <td style={{ fontWeight: 500 }}>{client.name}</td>
                <td>{client.contact}</td>
                <td>{client.phone}</td>
                <td>{client.sites}</td>
                <td>{client.guards}</td>
                <td>
                  <span className={`status-badge ${client.status === 'Active' ? 'on-duty' : 'on-leave'}`}>
                    {client.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default Clients;
