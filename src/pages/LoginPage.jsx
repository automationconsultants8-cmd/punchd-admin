import { useState } from 'react';
import { authApi } from '../services/api';
import './LoginPage.css';

function LoginPage({ onLogin }) {
  const [mode, setMode] = useState('login'); // 'login', 'signup', 'forgot'
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Login form state
  const [loginData, setLoginData] = useState({ email: '', password: '' });

  // Signup form state
  const [signupData, setSignupData] = useState({
    companyName: '',
    ownerName: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
  });

  // Forgot password state
  const [forgotEmail, setForgotEmail] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await authApi.login(loginData.email, loginData.password);
      
      const token = response.data.accessToken;
      const user = response.data.user;

      localStorage.setItem('adminToken', token);
      localStorage.setItem('adminUser', JSON.stringify(user));
      
      onLogin(user);
      
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid email or password');
    } finally {
      setLoading(false);
    }
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    setError('');

    if (signupData.password !== signupData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (signupData.password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setLoading(true);

    try {
      const response = await authApi.signup({
        companyName: signupData.companyName,
        ownerName: signupData.ownerName,
        email: signupData.email,
        password: signupData.password,
        phone: signupData.phone,
      });
      
      const token = response.data.accessToken;
      const user = response.data.user;

      localStorage.setItem('adminToken', token);
      localStorage.setItem('adminUser', JSON.stringify(user));
      
      onLogin(user);
      
    } catch (err) {
      setError(err.response?.data?.message || 'Signup failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      await authApi.forgotPassword(forgotEmail);
      setSuccess('If an account exists with that email, a reset link has been sent. Check your inbox!');
      setForgotEmail('');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to send reset email. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const switchMode = (newMode) => {
    setMode(newMode);
    setError('');
    setSuccess('');
    setShowPassword(false);
  };

  return (
    <div className="login-container">
      <div className={`login-card ${mode === 'signup' ? 'signup-mode' : ''}`}>
        <div className="login-header">
          <h1>⏱️</h1>
          <h2>Punch'd</h2>
          <p>
            {mode === 'login' && 'Admin Dashboard'}
            {mode === 'signup' && 'Create Your Company Account'}
            {mode === 'forgot' && 'Reset Your Password'}
          </p>
        </div>

        {mode === 'login' && (
          <form onSubmit={handleLogin}>
            <div className="form-group">
              <label>Email</label>
              <input
                type="email"
                value={loginData.email}
                onChange={(e) => setLoginData({ ...loginData, email: e.target.value })}
                placeholder="admin@example.com"
                required
                autoFocus
              />
            </div>

            <div className="form-group">
              <label>Password</label>
              <div className="password-input-container">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={loginData.password}
                  onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
                  placeholder="••••••••"
                  required
                />
                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => setShowPassword(!showPassword)}
                  tabIndex={-1}
                >
                  {showPassword ? '🙈' : '👁️'}
                </button>
              </div>
            </div>

            {error && <div className="error">{error}</div>}

            <button type="submit" disabled={loading}>
              {loading ? 'Signing in...' : 'Sign In'}
            </button>

            <button type="button" className="link-button forgot-link" onClick={() => switchMode('forgot')}>
              Forgot password?
            </button>
          </form>
        )}

        {mode === 'signup' && (
          <form onSubmit={handleSignup}>
            <div className="form-group">
              <label>Company Name</label>
              <input
                type="text"
                value={signupData.companyName}
                onChange={(e) => setSignupData({ ...signupData, companyName: e.target.value })}
                placeholder="ACME Construction"
                required
                autoFocus
              />
            </div>

            <div className="form-group">
              <label>Your Name</label>
              <input
                type="text"
                value={signupData.ownerName}
                onChange={(e) => setSignupData({ ...signupData, ownerName: e.target.value })}
                placeholder="John Smith"
                required
              />
            </div>

            <div className="form-group">
              <label>Email</label>
              <input
                type="email"
                value={signupData.email}
                onChange={(e) => setSignupData({ ...signupData, email: e.target.value })}
                placeholder="john@acme.com"
                required
              />
            </div>

            <div className="form-group">
              <label>Phone Number</label>
              <input
                type="tel"
                value={signupData.phone}
                onChange={(e) => setSignupData({ ...signupData, phone: e.target.value })}
                placeholder="5551234567"
                required
              />
            </div>

            <div className="form-group">
              <label>Password</label>
              <div className="password-input-container">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={signupData.password}
                  onChange={(e) => setSignupData({ ...signupData, password: e.target.value })}
                  placeholder="••••••••"
                  required
                />
                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => setShowPassword(!showPassword)}
                  tabIndex={-1}
                >
                  {showPassword ? '🙈' : '👁️'}
                </button>
              </div>
            </div>

            <div className="form-group">
              <label>Confirm Password</label>
              <input
                type={showPassword ? 'text' : 'password'}
                value={signupData.confirmPassword}
                onChange={(e) => setSignupData({ ...signupData, confirmPassword: e.target.value })}
                placeholder="••••••••"
                required
              />
            </div>

            {error && <div className="error">{error}</div>}

            <button type="submit" disabled={loading}>
              {loading ? 'Creating Account...' : 'Create Company Account'}
            </button>
          </form>
        )}

        {mode === 'forgot' && (
          <form onSubmit={handleForgotPassword}>
            <div className="form-group">
              <label>Email Address</label>
              <input
                type="email"
                value={forgotEmail}
                onChange={(e) => setForgotEmail(e.target.value)}
                placeholder="admin@example.com"
                required
                autoFocus
              />
            </div>

            {error && <div className="error">{error}</div>}
            {success && <div className="success">{success}</div>}

            <button type="submit" disabled={loading}>
              {loading ? 'Sending...' : 'Send Reset Link'}
            </button>
          </form>
        )}

        <div className="login-footer">
          {mode === 'login' && (
            <>
              <p>Don't have an account?</p>
              <button type="button" className="link-button" onClick={() => switchMode('signup')}>
                Create Company Account
              </button>
            </>
          )}
          {mode === 'signup' && (
            <>
              <p>Already have an account?</p>
              <button type="button" className="link-button" onClick={() => switchMode('login')}>
                Sign In
              </button>
            </>
          )}
          {mode === 'forgot' && (
            <>
              <p>Remember your password?</p>
              <button type="button" className="link-button" onClick={() => switchMode('login')}>
                Back to Sign In
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default LoginPage;