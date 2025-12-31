import { useState } from 'react';
import { authApi } from '../services/api';
import './LoginPage.css';

function SignupPage({ onSignup, onSwitchToLogin }) {
  const [formData, setFormData] = useState({
    companyName: '',
    ownerName: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setLoading(true);

    try {
      const response = await authApi.signup({
        companyName: formData.companyName,
        ownerName: formData.ownerName,
        email: formData.email,
        password: formData.password,
        phone: formData.phone,
      });
      
      const token = response.data.accessToken;
      const user = response.data.user;

      localStorage.setItem('adminToken', token);
      localStorage.setItem('adminUser', JSON.stringify(user));
      
      onSignup(user);
      
    } catch (err) {
      setError(err.response?.data?.message || 'Signup failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-card signup-card">
        <div className="login-header">
          <h1>⏱️</h1>
          <h2>Punch'd</h2>
          <p>Create Your Company Account</p>
        </div>

        <form onSubmit={handleSignup}>
          <div className="form-group">
            <label>Company Name</label>
            <input
              type="text"
              name="companyName"
              value={formData.companyName}
              onChange={handleChange}
              placeholder="ACME Construction"
              required
            />
          </div>

          <div className="form-group">
            <label>Your Name</label>
            <input
              type="text"
              name="ownerName"
              value={formData.ownerName}
              onChange={handleChange}
              placeholder="John Smith"
              required
            />
          </div>

          <div className="form-group">
            <label>Email</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="john@acme.com"
              required
            />
          </div>

          <div className="form-group">
            <label>Phone Number</label>
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              placeholder="5551234567"
              required
            />
          </div>

          <div className="form-group">
            <label>Password</label>
            <div className="password-input-container">
              <input
                type={showPassword ? 'text' : 'password'}
                name="password"
                value={formData.password}
                onChange={handleChange}
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
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              placeholder="••••••••"
              required
            />
          </div>

          {error && <div className="error">{error}</div>}

          <button type="submit" disabled={loading}>
            {loading ? 'Creating Account...' : 'Create Company Account'}
          </button>
        </form>

        <div className="login-footer">
          <p>Already have an account?</p>
          <button type="button" className="link-button" onClick={onSwitchToLogin}>
            Sign In
          </button>
        </div>
      </div>
    </div>
  );
}

export default SignupPage;