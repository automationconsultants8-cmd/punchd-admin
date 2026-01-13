import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authApi } from '../services/api';
import './LoginPage.css';

// SVG Icons
const Icons = {
  eye: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
      <circle cx="12" cy="12" r="3"/>
    </svg>
  ),
  eyeOff: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/>
      <line x1="1" y1="1" x2="23" y2="23"/>
    </svg>
  ),
  mail: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
      <polyline points="22,6 12,13 2,6"/>
    </svg>
  ),
  lock: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
      <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
    </svg>
  ),
};

// Punch'd Logo SVG - Clean clock without checkmark
const PunchdLogo = () => (
  <svg viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg" className="logo-svg">
    <circle cx="40" cy="40" r="36" stroke="#C9A227" strokeWidth="4" fill="#FFFFFF"/>
    <circle cx="40" cy="40" r="30" stroke="#E8D48A" strokeWidth="2" fill="none"/>
    <line x1="40" y1="10" x2="40" y2="16" stroke="#C9A227" strokeWidth="3" strokeLinecap="round"/>
    <line x1="40" y1="64" x2="40" y2="70" stroke="#C9A227" strokeWidth="3" strokeLinecap="round"/>
    <line x1="10" y1="40" x2="16" y2="40" stroke="#C9A227" strokeWidth="3" strokeLinecap="round"/>
    <line x1="64" y1="40" x2="70" y2="40" stroke="#C9A227" strokeWidth="3" strokeLinecap="round"/>
    <line x1="61" y1="19" x2="57" y2="23" stroke="#C9A227" strokeWidth="2" strokeLinecap="round"/>
    <line x1="61" y1="61" x2="57" y2="57" stroke="#C9A227" strokeWidth="2" strokeLinecap="round"/>
    <line x1="19" y1="19" x2="23" y2="23" stroke="#C9A227" strokeWidth="2" strokeLinecap="round"/>
    <line x1="19" y1="61" x2="23" y2="57" stroke="#C9A227" strokeWidth="2" strokeLinecap="round"/>
    <line x1="40" y1="40" x2="40" y2="24" stroke="#1A1A1A" strokeWidth="3" strokeLinecap="round"/>
    <line x1="40" y1="40" x2="54" y2="40" stroke="#1A1A1A" strokeWidth="2.5" strokeLinecap="round"/>
    <circle cx="40" cy="40" r="4" fill="#C9A227"/>
  </svg>
);

function LoginPage({ onLogin }) {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (loading) return;
    
    setError('');
    setLoading(true);

    try {
      // Use the new dashboard login endpoint
      const response = await authApi.loginDashboard(email, password);
      
      if (response.data?.accessToken) {
        // Store token and user data
        localStorage.setItem('adminToken', response.data.accessToken);
        localStorage.setItem('adminUser', JSON.stringify(response.data.user));
        
        // Store permissions for managers
        if (response.data.user.permissions) {
          localStorage.setItem('adminPermissions', JSON.stringify(response.data.user.permissions));
        }
        
        // Store assigned locations/workers for managers
        if (response.data.user.assignedLocationIds) {
          localStorage.setItem('assignedLocationIds', JSON.stringify(response.data.user.assignedLocationIds));
        }
        if (response.data.user.assignedWorkerIds) {
          localStorage.setItem('assignedWorkerIds', JSON.stringify(response.data.user.assignedWorkerIds));
        }
        
        if (onLogin) {
          onLogin(response.data.user);
        }
        
        navigate('/dashboard');
      }
    } catch (err) {
      console.error('Login error:', err);
      const message = err.response?.data?.message || 'Invalid email or password';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-container">
        <div className="login-card">
          {/* Logo */}
          <div className="login-logo">
            <PunchdLogo />
          </div>

          {/* Header */}
          <div className="login-header">
            <h1>Punch'd</h1>
            <p>Admin Dashboard</p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="error-message">
              {error}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>EMAIL</label>
              <div className="input-wrapper">
                <span className="input-icon">{Icons.mail}</span>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@company.com"
                  required
                  autoComplete="email"
                />
              </div>
            </div>

            <div className="form-group">
              <label>PASSWORD</label>
              <div className="input-wrapper">
                <span className="input-icon">{Icons.lock}</span>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => setShowPassword(!showPassword)}
                  tabIndex={-1}
                >
                  {showPassword ? Icons.eyeOff : Icons.eye}
                </button>
              </div>
            </div>

            <button type="submit" className="btn-submit" disabled={loading}>
              {loading ? (
                <span className="loading-spinner"></span>
              ) : (
                'Sign In'
              )}
            </button>
          </form>

          {/* Links - Now using React Router Link */}
          <div className="login-links">
            <Link to="/forgot-password" className="forgot-link">
              Forgot password?
            </Link>
          </div>

          <div className="login-footer">
            <p>Don't have an account?</p>
            <Link to="/signup" className="signup-link">
              Create Company Account
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default LoginPage;