
import { useState, useEffect } from 'react';
import { companyApi } from '../services/api';
import './SettingsPage.css';

function SettingsPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [companyData, setCompanyData] = useState({
    name: '',
    address: '',
    city: '',
    state: '',
    zip: '',
    defaultHourlyRate: '',
  });

  useEffect(() => {
    loadCompanyData();
  }, []);

  const loadCompanyData = async () => {
    try {
      const res = await companyApi.get();
      setCompanyData({
        name: res.data.name || '',
        address: res.data.address || '',
        city: res.data.city || '',
        state: res.data.state || '',
        zip: res.data.zip || '',
        defaultHourlyRate: res.data.defaultHourlyRate || '',
      });
    } catch (err) {
      console.error('Failed to load company data:', err);
    }
    setLoading(false);
  };

  const handleSave = async () => {
    setSaving(true);
    setMessage({ type: '', text: '' });

    try {
      const dataToSave = {
        ...companyData,
        defaultHourlyRate: companyData.defaultHourlyRate 
          ? parseFloat(companyData.defaultHourlyRate) 
          : null,
      };
      await companyApi.update(dataToSave);
      setMessage({ type: 'success', text: 'Settings saved successfully!' });
      setTimeout(() => setMessage({ type: '', text: '' }), 3000);
    } catch (err) {
      console.error('Failed to save:', err);
      setMessage({ type: 'error', text: err.response?.data?.message || 'Failed to save settings' });
    }
    setSaving(false);
  };

  const handleChange = (field, value) => {
    setCompanyData(prev => ({ ...prev, [field]: value }));
  };

  if (loading) {
    return (
      <div className="settings-page">
        <div className="loading-state">
          <div className="spinner"></div>
          <p>Loading settings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="settings-page">
      <div className="page-header">
        <h1 className="page-title">Settings</h1>
        <p className="page-subtitle">Manage your company settings and preferences</p>
      </div>

      {message.text && (
        <div className={`message ${message.type}`}>
          {message.type === 'success' ? '✓' : '⚠️'} {message.text}
        </div>
      )}

      {/* Company Information */}
      <div className="settings-card">
        <div className="card-header">
          <span className="card-icon">🏢</span>
          <div>
            <h2>Company Information</h2>
            <p>Basic company details used in reports and payroll</p>
          </div>
        </div>

        <div className="form-grid">
          <div className="form-group full-width">
            <label>Company Name</label>
            <input
              type="text"
              value={companyData.name}
              onChange={(e) => handleChange('name', e.target.value)}
              placeholder="Your Company Name"
            />
          </div>

          <div className="form-group full-width">
            <label>Street Address</label>
            <input
              type="text"
              value={companyData.address}
              onChange={(e) => handleChange('address', e.target.value)}
              placeholder="123 Main Street"
            />
            <small>Required for WH-347 certified payroll reports</small>
          </div>

          <div className="form-group">
            <label>City</label>
            <input
              type="text"
              value={companyData.city}
              onChange={(e) => handleChange('city', e.target.value)}
              placeholder="San Jose"
            />
          </div>

          <div className="form-group">
            <label>State</label>
            <input
              type="text"
              value={companyData.state}
              onChange={(e) => handleChange('state', e.target.value.toUpperCase())}
              placeholder="CA"
              maxLength="2"
            />
          </div>

          <div className="form-group">
            <label>ZIP Code</label>
            <input
              type="text"
              value={companyData.zip}
              onChange={(e) => handleChange('zip', e.target.value)}
              placeholder="95123"
              maxLength="10"
            />
          </div>
        </div>
      </div>

      {/* Pay Rates */}
      <div className="settings-card">
        <div className="card-header">
          <span className="card-icon">💰</span>
          <div>
            <h2>Default Pay Rate</h2>
            <p>Default hourly rate for new workers (can be overridden per worker or job)</p>
          </div>
        </div>

        <div className="form-grid">
          <div className="form-group">
            <label>Default Hourly Rate ($)</label>
            <input
              type="number"
              step="0.01"
              min="0"
              value={companyData.defaultHourlyRate}
              onChange={(e) => handleChange('defaultHourlyRate', e.target.value)}
              placeholder="25.00"
            />
            <small>Applied to workers without a specific rate set</small>
          </div>
        </div>
      </div>

      {/* Overtime Rules */}
      <div className="settings-card">
        <div className="card-header">
          <span className="card-icon">⏰</span>
          <div>
            <h2>Overtime Rules</h2>
            <p>Configure overtime calculation thresholds</p>
          </div>
        </div>

        <div className="form-grid">
          <div className="form-group">
            <label>Daily OT After (hours)</label>
            <input type="number" defaultValue="8" />
            <small>Hours before overtime kicks in daily</small>
          </div>
          <div className="form-group">
            <label>Daily Double Time After (hours)</label>
            <input type="number" defaultValue="12" />
            <small>Hours before double time kicks in</small>
          </div>
          <div className="form-group">
            <label>Weekly OT After (hours)</label>
            <input type="number" defaultValue="40" />
            <small>Weekly hours threshold for OT</small>
          </div>
          <div className="form-group">
            <label>OT Multiplier</label>
            <input type="number" step="0.1" defaultValue="1.5" />
            <small>e.g., 1.5 = time and a half</small>
          </div>
        </div>
      </div>

      {/* Break Compliance */}
      <div className="settings-card">
        <div className="card-header">
          <span className="card-icon">☕</span>
          <div>
            <h2>Break Compliance</h2>
            <p>Meal and rest break requirements</p>
          </div>
        </div>

        <div className="checkbox-row">
          <input type="checkbox" id="breakEnabled" defaultChecked />
          <label htmlFor="breakEnabled">Enable break compliance tracking</label>
        </div>

        <div className="form-grid">
          <div className="form-group">
            <label>State Regulations</label>
            <select defaultValue="CA">
              <option value="CA">California</option>
              <option value="WA">Washington</option>
              <option value="OR">Oregon</option>
              <option value="OTHER">Federal (Other States)</option>
            </select>
          </div>
          <div className="form-group">
            <label>Meal Break After (hours)</label>
            <input type="number" defaultValue="5" />
          </div>
          <div className="form-group">
            <label>Meal Break Duration (min)</label>
            <input type="number" defaultValue="30" />
          </div>
          <div className="form-group">
            <label>Violation Penalty (hours pay)</label>
            <input type="number" step="0.5" defaultValue="1" />
          </div>
        </div>
      </div>

      {/* Save Button */}
      <button 
        className="btn-save"
        onClick={handleSave}
        disabled={saving}
      >
        {saving ? 'Saving...' : 'Save Settings'}
      </button>
    </div>
  );
}

export default SettingsPage;