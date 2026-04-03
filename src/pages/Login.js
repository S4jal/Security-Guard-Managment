import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please fill in all fields');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      await login(email, password);
    } catch (err) {
      if (err.message.includes('Invalid login')) {
        setError('Invalid email or password');
      } else {
        setError(err.message || 'Login failed. Please try again.');
      }
    } finally {
      setIsLoading(false);
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
        <div className="login-features">
          <div className="login-feature-item">
            <span className="feature-icon">&#128100;</span>
            <span>Role-Based Access Control</span>
          </div>
          <div className="login-feature-item">
            <span className="feature-icon">&#128202;</span>
            <span>Real-Time Analytics</span>
          </div>
          <div className="login-feature-item">
            <span className="feature-icon">&#128197;</span>
            <span>Smart Scheduling</span>
          </div>
          <div className="login-feature-item">
            <span className="feature-icon">&#128274;</span>
            <span>Enterprise Security</span>
          </div>
        </div>
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
                disabled={isLoading}
              />
            </div>
            <div className="form-group">
              <label>Password</label>
              <input
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isLoading}
              />
            </div>
            <button type="submit" className="login-btn" disabled={isLoading}>
              {isLoading ? 'Signing In...' : 'Sign In'}
            </button>
          </form>

          <div className="demo-credentials">
            <strong>Demo Accounts:</strong>
            <div className="demo-roles">
              <div className="demo-role">
                <span className="demo-role-badge developer">Developer</span>
                <span>developer@secureguard.com</span>
              </div>
              <div className="demo-role">
                <span className="demo-role-badge company">Company</span>
                <span>company@secureguard.com</span>
              </div>
              <div className="demo-role">
                <span className="demo-role-badge client">Client</span>
                <span>client@secureguard.com</span>
              </div>
              <div className="demo-role">
                <span className="demo-role-badge guard">Guard</span>
                <span>guard@secureguard.com</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;
