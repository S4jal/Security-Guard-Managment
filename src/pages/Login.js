import React, { useState } from 'react';

function Login({ onLogin }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please fill in all fields');
      return;
    }
    const success = onLogin(email, password);
    if (!success) {
      setError('Invalid email or password');
    }
  };

  return (
    <div className="login-container">
      <div className="login-left">
        <div className="shield-icon">&#128737;</div>
        <h1>SecureGuard Pro</h1>
        <p>
          Complete security guard management system. Track guards, manage schedules,
          and monitor operations from a single dashboard.
        </p>
      </div>
      <div className="login-right">
        <div className="login-form-container">
          <h2>Welcome Back</h2>
          <p className="subtitle">Sign in to your account</p>

          {error && <div className="error-message">{error}</div>}

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Email Address</label>
              <input
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div className="form-group">
              <label>Password</label>
              <input
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            <button type="submit" className="login-btn">
              Sign In
            </button>
          </form>

          <div className="demo-credentials">
            <strong>Demo Credentials:</strong><br />
            Email: admin@securityguard.com<br />
            Password: admin123
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;
