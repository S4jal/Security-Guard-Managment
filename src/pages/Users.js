import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

function Users() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUsers();
  }, []);

  async function fetchUsers() {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (!error && data) {
        setUsers(data);
      }
    } catch (err) {
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  }

  const getInitials = (name) => {
    if (!name) return '?';
    return name.split(' ').map((n) => n[0]).join('').toUpperCase();
  };

  const getRoleColor = (role) => {
    const colors = {
      developer: '#e91e63',
      company: '#2196f3',
      client: '#ff9800',
      guard: '#4caf50',
    };
    return colors[role] || '#999';
  };

  return (
    <div className="guards-page">
      <div className="page-header">
        <h1>All Users</h1>
        <button className="add-btn">+ Add User</button>
      </div>

      {loading ? (
        <div className="loading-state">Loading users...</div>
      ) : (
        <div className="guards-table">
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Role</th>
                <th>Phone</th>
                <th>Joined</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id}>
                  <td>
                    <div className="guard-name-cell">
                      <div
                        className="guard-avatar"
                        style={{ background: getRoleColor(user.role) }}
                      >
                        {getInitials(user.full_name)}
                      </div>
                      {user.full_name || 'Unnamed'}
                    </div>
                  </td>
                  <td>{user.email}</td>
                  <td>
                    <span
                      className="role-pill"
                      style={{ background: `${getRoleColor(user.role)}20`, color: getRoleColor(user.role) }}
                    >
                      {user.role}
                    </span>
                  </td>
                  <td>{user.phone || '-'}</td>
                  <td>{new Date(user.created_at).toLocaleDateString()}</td>
                </tr>
              ))}
              {users.length === 0 && (
                <tr>
                  <td colSpan="5" style={{ textAlign: 'center', padding: '40px', color: '#999' }}>
                    No users found. Create users in Supabase Auth dashboard.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default Users;
