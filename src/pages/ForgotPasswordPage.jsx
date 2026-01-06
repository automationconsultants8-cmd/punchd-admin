import { useState } from 'react';
import { Link } from 'react-router-dom';
import { authApi } from '../services/api';
import './LoginPage.css';

const Icons = {
  mail: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/>
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

function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (loading) return;
    
    setError('');
    setLoading(true);

    try {
      const response = await authApi.forgotPassword(email);
      if (response.data?.success) {
        setSent(true);
      }
    } catch (err) {
      console.error('Forgot password error:', err);
      setError(err.response?.data?.message || 'Error sending reset email. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-container">
        <div className="login-card">
          <div className="login-logo"><PunchdLogo /></div>

          <div className="login-header">
            <h1>Punch'd</h1>
            <p>Reset Password</p>
          </div>

          {sent ? (
            <div className="success-state">
              <div className="success-icon">{Icons.check}</div>
              <h3>Check your email</h3>
              <p>We've sent a password reset link to <strong>{email}</strong></p>
              <Link to="/login" className="btn-back">
                ← Back to Sign In
              </Link>
            </div>
          ) : (
            <>
              {error && <div className="error-message">{error}</div>}
              
              <p className="form-description">
                Enter your email address and we'll send you a link to reset your password.
              </p>

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
                    />
                  </div>
                </div>

                <button type="submit" className="btn-submit" disabled={loading}>
                  {loading ? <span className="loading-spinner"></span> : 'Send Reset Link'}
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

export default ForgotPasswordPage;
