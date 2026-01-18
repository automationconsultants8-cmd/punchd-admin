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
  const [settings, setSettings] = useState({
    maxShiftHours: 16,
    earlyClockInMinutes: 15,
    autoClockOutEnabled: true,
  });
  const [overtimeSettings, setOvertimeSettings] = useState({
    dailyOtThreshold: 8,
    dailyDtThreshold: 12,
    weeklyOtThreshold: 40,
    otMultiplier: 1.5,
    dtMultiplier: 2.0,
  });
  const [breakSettings, setBreakSettings] = useState({
    enabled: true,
    state: 'CA',
    mealBreakThreshold: 5,
    mealBreakDuration: 30,
    penaltyRate: 1,
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
      
      // Load settings from company.settings JSON
      if (res.data.settings) {
        const s = res.data.settings;
        setSettings({
          maxShiftHours: s.maxShiftHours ?? 16,
          earlyClockInMinutes: s.earlyClockInMinutes ?? 15,
          autoClockOutEnabled: s.autoClockOutEnabled ?? true,
        });
      }
      
      // Load overtime settings
      if (res.data.overtimeSettings) {
        const ot = res.data.overtimeSettings;
        setOvertimeSettings({
          dailyOtThreshold: (ot.dailyOtThreshold ?? 480) / 60,
          dailyDtThreshold: (ot.dailyDtThreshold ?? 720) / 60,
          weeklyOtThreshold: (ot.weeklyOtThreshold ?? 2400) / 60,
          otMultiplier: ot.otMultiplier ?? 1.5,
          dtMultiplier: ot.dtMultiplier ?? 2.0,
        });
      }
      
      // Load break compliance settings
      if (res.data.breakComplianceSettings) {
        const bc = res.data.breakComplianceSettings;
        setBreakSettings({
          enabled: bc.enabled ?? true,
          state: bc.state ?? 'CA',
          mealBreakThreshold: (bc.mealBreakThreshold ?? 300) / 60,
          mealBreakDuration: bc.mealBreakDuration ?? 30,
          penaltyRate: bc.penaltyRate ?? 1,
        });
      }
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
        settings: {
          maxShiftHours: parseFloat(settings.maxShiftHours) || 16,
          earlyClockInMinutes: parseInt(settings.earlyClockInMinutes) || 15,
          autoClockOutEnabled: settings.autoClockOutEnabled,
        },
        overtimeSettings: {
          dailyOtThreshold: parseFloat(overtimeSettings.dailyOtThreshold) * 60,
          dailyDtThreshold: parseFloat(overtimeSettings.dailyDtThreshold) * 60,
          weeklyOtThreshold: parseFloat(overtimeSettings.weeklyOtThreshold) * 60,
          otMultiplier: parseFloat(overtimeSettings.otMultiplier),
          dtMultiplier: parseFloat(overtimeSettings.dtMultiplier),
        },
        breakComplianceSettings: {
          enabled: breakSettings.enabled,
          state: breakSettings.state,
          mealBreakThreshold: parseFloat(breakSettings.mealBreakThreshold) * 60,
          mealBreakDuration: parseInt(breakSettings.mealBreakDuration),
          penaltyRate: parseFloat(breakSettings.penaltyRate),
        },
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

      {/* Time & Attendance Rules - NEW */}
      <div className="settings-card">
        <div className="card-header">
          <span className="card-icon">🛡️</span>
          <div>
            <h2>Time & Attendance Rules</h2>
            <p>Automatic clock-out and clock-in restrictions</p>
          </div>
        </div>

        <div className="checkbox-row">
          <input 
            type="checkbox" 
            id="autoClockOutEnabled" 
            checked={settings.autoClockOutEnabled}
            onChange={(e) => setSettings(prev => ({ ...prev, autoClockOutEnabled: e.target.checked }))}
          />
          <label htmlFor="autoClockOutEnabled">Enable automatic clock-out for forgotten punches</label>
        </div>

        <div className="form-grid">
          <div className="form-group">
            <label>Max Shift Length (hours)</label>
            <input
              type="number"
              step="0.5"
              min="1"
              max="24"
              value={settings.maxShiftHours}
              onChange={(e) => setSettings(prev => ({ ...prev, maxShiftHours: e.target.value }))}
            />
            <small>Auto clock-out workers after this many hours (flags entry for review)</small>
          </div>
          <div className="form-group">
            <label>Early Clock-In Window (minutes)</label>
            <input
              type="number"
              min="0"
              max="60"
              value={settings.earlyClockInMinutes}
              onChange={(e) => setSettings(prev => ({ ...prev, earlyClockInMinutes: e.target.value }))}
            />
            <small>How early workers can clock in before scheduled shift</small>
          </div>
        </div>

        <div className="info-box">
          <strong>How it works:</strong> If a worker forgets to clock out, the system will automatically clock them out after {settings.maxShiftHours} hours, flag the entry for your review, and add a note explaining the auto clock-out.
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
            <input 
              type="number" 
              value={overtimeSettings.dailyOtThreshold}
              onChange={(e) => setOvertimeSettings(prev => ({ ...prev, dailyOtThreshold: e.target.value }))}
            />
            <small>Hours before overtime kicks in daily</small>
          </div>
          <div className="form-group">
            <label>Daily Double Time After (hours)</label>
            <input 
              type="number" 
              value={overtimeSettings.dailyDtThreshold}
              onChange={(e) => setOvertimeSettings(prev => ({ ...prev, dailyDtThreshold: e.target.value }))}
            />
            <small>Hours before double time kicks in</small>
          </div>
          <div className="form-group">
            <label>Weekly OT After (hours)</label>
            <input 
              type="number" 
              value={overtimeSettings.weeklyOtThreshold}
              onChange={(e) => setOvertimeSettings(prev => ({ ...prev, weeklyOtThreshold: e.target.value }))}
            />
            <small>Weekly hours threshold for OT</small>
          </div>
          <div className="form-group">
            <label>OT Multiplier</label>
            <input 
              type="number" 
              step="0.1" 
              value={overtimeSettings.otMultiplier}
              onChange={(e) => setOvertimeSettings(prev => ({ ...prev, otMultiplier: e.target.value }))}
            />
            <small>e.g., 1.5 = time and a half</small>
          </div>
          <div className="form-group">
            <label>DT Multiplier</label>
            <input 
              type="number" 
              step="0.1" 
              value={overtimeSettings.dtMultiplier}
              onChange={(e) => setOvertimeSettings(prev => ({ ...prev, dtMultiplier: e.target.value }))}
            />
            <small>e.g., 2.0 = double time</small>
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
          <input 
            type="checkbox" 
            id="breakEnabled" 
            checked={breakSettings.enabled}
            onChange={(e) => setBreakSettings(prev => ({ ...prev, enabled: e.target.checked }))}
          />
          <label htmlFor="breakEnabled">Enable break compliance tracking</label>
        </div>

        <div className="form-grid">
          <div className="form-group">
            <label>State Regulations</label>
            <select 
              value={breakSettings.state}
              onChange={(e) => setBreakSettings(prev => ({ ...prev, state: e.target.value }))}
            >
              <option value="CA">California</option>
              <option value="WA">Washington</option>
              <option value="OR">Oregon</option>
              <option value="OTHER">Federal (Other States)</option>
            </select>
          </div>
          <div className="form-group">
            <label>Meal Break After (hours)</label>
            <input 
              type="number" 
              value={breakSettings.mealBreakThreshold}
              onChange={(e) => setBreakSettings(prev => ({ ...prev, mealBreakThreshold: e.target.value }))}
            />
          </div>
          <div className="form-group">
            <label>Meal Break Duration (min)</label>
            <input 
              type="number" 
              value={breakSettings.mealBreakDuration}
              onChange={(e) => setBreakSettings(prev => ({ ...prev, mealBreakDuration: e.target.value }))}
            />
          </div>
          <div className="form-group">
            <label>Violation Penalty (hours pay)</label>
            <input 
              type="number" 
              step="0.5" 
              value={breakSettings.penaltyRate}
              onChange={(e) => setBreakSettings(prev => ({ ...prev, penaltyRate: e.target.value }))}
            />
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