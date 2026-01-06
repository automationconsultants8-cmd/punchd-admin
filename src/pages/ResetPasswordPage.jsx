import { useState } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import { authApi } from '../services/api';
import './LoginPage.css';

const Icons = {
  lock: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
    </svg>
  ),
  eye: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>
    </svg>
  ),
  eyeOff: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/>
      <line x1="1" y1="1" x2="23" y2="23"/>
    </svg>
  ),
  check: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/>
    </svg>
  ),
};

const PunchdLogo = () => (
  <svg viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg" className="logo-svg">
    <circle cx="40" cy="40" r="36" stroke="#C9A227" strokeWidth="4" fill="#FFFFFF"/>
    <circle cx="40" cy="40" r="30" stroke="#E8D48A" strokeWidth="2" fill="none"/>
    <line x1="40" y1="10" x2="40" y2="16" stroke="#C9A227" strokeWidth="3" strokeLinecap="round"/>
    <line x1="40" y1="64" x2="40" y2="70" stroke="#C9A227" strokeWidth="3" strokeLinecap="round"/>
    <line x1="10" y1="40" x2="16" y2="40" stroke="#C9A227" strokeWidth="3" strokeLinecap="round"/>
    <line x1="64" y1="40" x2="70" y2="40" stroke="#C9A227" strokeWidth="3" strokeLinecap="round"/>
    <line x1="40" y1="40" x2="40" y2="24" stroke="#1A1A1A" strokeWidth="3" strokeLinecap="round"/>
    <line x1="40" y1="40" x2="54" y2="40" stroke="#1A1A1A" strokeWidth="2.5" strokeLinecap="round"/>
    <circle cx="40" cy="40" r="4" fill="#C9A227"/>
  </svg>
);

function ResetPasswordPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get('token');
  
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (loading) return;
    
    setError('');

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setLoading(true);

    try {
      await authApi.resetPassword({ token, password });
      setSuccess(true);
      setTimeout(() => navigate('/login'), 3000);
    } catch (err) {
      console.error('Reset password error:', err);
      setError(err.response?.data?.message || 'Failed to reset password. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!token) {
    return (
      <div className="login-page">
        <div className="login-container">
          <div className="login-card">
            <div className="login-logo"><PunchdLogo /></div>
            <div className="login-header">
              <h1>Punch'd</h1>
              <p>Invalid Reset Link</p>
            </div>
            <div className="error-message">
              This password reset link is invalid or has expired.
            </div>
            <div className="login-links">
              <Link to="/forgot-password" className="forgot-link">
                Request a new reset link
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="login-page">
      <div className="login-container">
        <div className="login-card">
          <div className="login-logo"><PunchdLogo /></div>

          <div className="login-header">
            <h1>Punch'd</h1>
            <p>Set New Password</p>
          </div>

          {success ? (
            <div className="success-state">
              <div className="success-icon">{Icons.check}</div>
              <h3>Password Reset!</h3>
              <p>Your password has been reset successfully. Redirecting to login...</p>
              <Link to="/login" className="btn-back">
                Go to Sign In
              </Link>
            </div>
          ) : (
            <>
              {error && <div className="error-message">{error}</div>}

              <form onSubmit={handleSubmit}>
                <div className="form-group">
                  <label>NEW PASSWORD</label>
                  <div className="input-wrapper">
                    <span className="input-icon">{Icons.lock}</span>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      required
                      minLength={6}
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

                <div className="form-group">
                  <label>CONFIRM NEW PASSWORD</label>
                  <div className="input-wrapper">
                    <span className="input-icon">{Icons.lock}</span>
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="••••••••"
                      required
                      minLength={6}
                    />
                    <button
                      type="button"
                      className="password-toggle"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      tabIndex={-1}
                    >
                      {showConfirmPassword ? Icons.eyeOff : Icons.eye}
                    </button>
                  </div>
                </div>

                <button type="submit" className="btn-submit" disabled={loading}>
                  {loading ? <span className="loading-spinner"></span> : 'Reset Password'}
                </button>
              </form>

              <div className="login-links">
                <Link to="/login" className="forgot-link">
                  ← Back to Sign In
                </Link>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default ResetPasswordPage;