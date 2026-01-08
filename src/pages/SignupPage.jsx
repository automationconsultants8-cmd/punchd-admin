import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authApi } from '../services/api';
import './LoginPage.css';

const Icons = {
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
  mail: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/>
    </svg>
  ),
  lock: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
    </svg>
  ),
  user: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
    </svg>
  ),
  building: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M6 22V4a1 1 0 0 1 1-1h10a1 1 0 0 1 1 1v18"/>
      <path d="M6 12H4a1 1 0 0 0-1 1v9"/><path d="M18 9h2a1 1 0 0 1 1 1v12"/>
      <path d="M10 6h4"/><path d="M10 10h4"/><path d="M10 14h4"/><path d="M10 18h4"/>
    </svg>
  ),
  phone: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>
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

function SignupPage() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    ownerName: '',
    email: '',
    password: '',
    companyName: '',
    phone: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await authApi.signup(formData);
      // Auto-login after signup
      localStorage.setItem('adminToken', response.data.accessToken);
      localStorage.setItem('adminUser', JSON.stringify(response.data.user));
      navigate('/');
    } catch (err) {
      console.error('Signup error:', err);
      setError(err.response?.data?.message || 'Error creating account. Please try again.');
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
            <p>Create Company Account</p>
          </div>

          {error && <div className="error-message">{error}</div>}

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>YOUR NAME</label>
              <div className="input-wrapper">
                <span className="input-icon">{Icons.user}</span>
                <input 
                  type="text" 
                  value={formData.ownerName} 
                  onChange={(e) => setFormData(prev => ({ ...prev, ownerName: e.target.value }))} 
                  placeholder="John Smith" 
                  required 
                />
              </div>
            </div>

            <div className="form-group">
              <label>COMPANY NAME</label>
              <div className="input-wrapper">
                <span className="input-icon">{Icons.building}</span>
                <input 
                  type="text" 
                  value={formData.companyName} 
                  onChange={(e) => setFormData(prev => ({ ...prev, companyName: e.target.value }))} 
                  placeholder="Acme Construction" 
                  required 
                />
              </div>
            </div>

            <div className="form-group">
              <label>EMAIL</label>
              <div className="input-wrapper">
                <span className="input-icon">{Icons.mail}</span>
                <input 
                  type="email" 
                  value={formData.email} 
                  onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))} 
                  placeholder="john@company.com" 
                  required 
                />
              </div>
            </div>

            <div className="form-group">
              <label>PHONE</label>
              <div className="input-wrapper">
                <span className="input-icon">{Icons.phone}</span>
                <input 
                  type="tel" 
                  value={formData.phone} 
                  onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))} 
                  placeholder="(555) 123-4567" 
                  required 
                />
              </div>
            </div>

            <div className="form-group">
              <label>PASSWORD</label>
              <div className="input-wrapper">
                <span className="input-icon">{Icons.lock}</span>
                <input 
                  type={showPassword ? 'text' : 'password'} 
                  value={formData.password} 
                  onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))} 
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

            <button type="submit" className="btn-submit" disabled={loading}>
              {loading ? <span className="loading-spinner"></span> : 'Create Account'}
            </button>
          </form>

          <div className="login-footer">
            <p>Already have an account?</p>
            <Link to="/login" className="signup-link">Sign In</Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default SignupPage;