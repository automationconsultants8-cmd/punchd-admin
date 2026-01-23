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
  check: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12"/>
    </svg>
  ),
  clock: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
    </svg>
  ),
  x: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
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
  const [phoneError, setPhoneError] = useState('');
  const [showTrialModal, setShowTrialModal] = useState(false);
  const [signupResponse, setSignupResponse] = useState(null);

  // Phone validation - only allows digits, spaces, dashes, parentheses, plus, dots
  const validatePhone = (phone) => {
    const phoneRegex = /^[\d\s\-\(\)\+\.]+$/;
    return phoneRegex.test(phone) && phone.replace(/\D/g, '').length >= 10;
  };

  const formatPhone = (value) => {
    // Remove all non-digits
    const digits = value.replace(/\D/g, '');
    
    // Format as (XXX) XXX-XXXX
    if (digits.length <= 3) return digits;
    if (digits.length <= 6) return `(${digits.slice(0, 3)}) ${digits.slice(3)}`;
    return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6, 10)}`;
  };

  const handlePhoneChange = (e) => {
    const formatted = formatPhone(e.target.value);
    setFormData(prev => ({ ...prev, phone: formatted }));
    
    // Clear error when user starts typing valid numbers
    if (phoneError && formatted.replace(/\D/g, '').length > 0) {
      setPhoneError('');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setPhoneError('');

    // Validate phone
    if (!validatePhone(formData.phone)) {
      setPhoneError('Please enter a valid phone number (at least 10 digits)');
      return;
    }

    setLoading(true);

    try {
      const response = await authApi.signup(formData);
      // Store response and show trial modal
      setSignupResponse(response.data);
      setShowTrialModal(true);
    } catch (err) {
      console.error('Signup error:', err);
      setError(err.response?.data?.message || 'Error creating account. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleStartTrial = () => {
    // Auto-login and start trial
    localStorage.setItem('adminToken', signupResponse.accessToken);
    localStorage.setItem('adminUser', JSON.stringify(signupResponse.user));
    navigate('/');
  };

  const handleSkipToPaid = () => {
    // Auto-login and redirect to billing
    localStorage.setItem('adminToken', signupResponse.accessToken);
    localStorage.setItem('adminUser', JSON.stringify(signupResponse.user));
    navigate('/billing');
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
              <div className={`input-wrapper ${phoneError ? 'error' : ''}`}>
                <span className="input-icon">{Icons.phone}</span>
                <input 
                  type="tel" 
                  value={formData.phone} 
                  onChange={handlePhoneChange}
                  placeholder="(555) 123-4567" 
                  required 
                  maxLength={14}
                />
              </div>
              {phoneError && <span className="field-error">{phoneError}</span>}
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

      {/* Trial Modal */}
      {showTrialModal && (
        <div className="modal-overlay">
          <div className="trial-modal">
            <div className="trial-modal-icon">
              {Icons.clock}
            </div>
            <h2>Welcome to Punch'd! 🎉</h2>
            <p className="trial-modal-subtitle">Your account has been created successfully.</p>
            
            <div className="trial-info-box">
              <h3>Start Your 14-Day Free Trial</h3>
              <p>Get full access to all Professional features:</p>
              <ul className="trial-features">
                <li>{Icons.check} <span>Facial Recognition & GPS Verification</span></li>
                <li>{Icons.check} <span>Shift Scheduling & Templates</span></li>
                <li>{Icons.check} <span>Overtime & Break Compliance</span></li>
                <li>{Icons.check} <span>Leave Management & Time Off</span></li>
                <li>{Icons.check} <span>Cost Analytics & Reports</span></li>
              </ul>
              <p className="trial-note">No credit card required. Cancel anytime.</p>
            </div>

            <div className="trial-modal-actions">
              <button className="btn-primary-large" onClick={handleStartTrial}>
                {Icons.check} Start Free Trial
              </button>
              <button className="btn-text" onClick={handleSkipToPaid}>
                Skip to paid plans →
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        .field-error {
          color: #ef4444;
          font-size: 12px;
          margin-top: 4px;
          display: block;
        }
        .input-wrapper.error {
          border-color: #ef4444;
        }
        .input-wrapper.error:focus-within {
          box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.1);
        }
        
        /* Trial Modal Styles */
        .modal-overlay {
          position: fixed;
          inset: 0;
          background: rgba(0, 0, 0, 0.6);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
          padding: 20px;
        }
        .trial-modal {
          background: white;
          border-radius: 16px;
          padding: 32px;
          max-width: 440px;
          width: 100%;
          text-align: center;
          animation: modalSlideIn 0.3s ease;
        }
        @keyframes modalSlideIn {
          from {
            opacity: 0;
            transform: translateY(-20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .trial-modal-icon {
          width: 64px;
          height: 64px;
          background: linear-gradient(135deg, #C9A227, #E8D48A);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto 20px;
        }
        .trial-modal-icon svg {
          width: 32px;
          height: 32px;
          stroke: white;
        }
        .trial-modal h2 {
          font-size: 24px;
          font-weight: 700;
          color: #1a1a1a;
          margin: 0 0 8px;
        }
        .trial-modal-subtitle {
          color: #666;
          margin: 0 0 24px;
        }
        .trial-info-box {
          background: #f8f9fa;
          border-radius: 12px;
          padding: 20px;
          text-align: left;
          margin-bottom: 24px;
        }
        .trial-info-box h3 {
          font-size: 16px;
          font-weight: 600;
          color: #1a1a1a;
          margin: 0 0 8px;
        }
        .trial-info-box > p {
          color: #666;
          font-size: 14px;
          margin: 0 0 12px;
        }
        .trial-features {
          list-style: none;
          padding: 0;
          margin: 0 0 12px;
        }
        .trial-features li {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 6px 0;
          font-size: 14px;
          color: #333;
        }
        .trial-features li svg {
          width: 16px;
          height: 16px;
          stroke: #22c55e;
          flex-shrink: 0;
        }
        .trial-note {
          font-size: 12px;
          color: #888;
          margin: 0;
          font-style: italic;
        }
        .trial-modal-actions {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }
        .btn-primary-large {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          background: linear-gradient(135deg, #C9A227, #B8922A);
          color: white;
          border: none;
          padding: 14px 24px;
          border-radius: 10px;
          font-size: 16px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
        }
        .btn-primary-large:hover {
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(201, 162, 39, 0.3);
        }
        .btn-primary-large svg {
          width: 20px;
          height: 20px;
        }
        .btn-text {
          background: none;
          border: none;
          color: #666;
          font-size: 14px;
          cursor: pointer;
          padding: 8px;
        }
        .btn-text:hover {
          color: #C9A227;
        }
      `}</style>
    </div>
  );
}

export default SignupPage;