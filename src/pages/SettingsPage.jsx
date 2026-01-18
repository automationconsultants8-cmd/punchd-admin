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
  
  // Feature toggles
  const [toggles, setToggles] = useState({
    verificationMode: 'balanced',
    facialRecognition: 'soft',
    gpsGeofencing: 'soft',
    earlyClockInRestriction: 'off',
    workerSelfServiceEdits: 'soft',
    photoCapture: true,
    breakTracking: true,
    breakCompliancePenalties: false,
    overtimeCalculations: true,
    seventhDayOtRule: false,
    autoClockOut: true,
    jobBasedTracking: true,
    shiftScheduling: false,
    leaveManagement: false,
    buddyPunchAlerts: true,
    maxShiftHours: 16,
    earlyClockInMinutes: 15,
  });

  const [overtimeSettings, setOvertimeSettings] = useState({
    dailyOtThreshold: 8,
    dailyDtThreshold: 12,
    weeklyOtThreshold: 40,
    otMultiplier: 1.5,
    dtMultiplier: 2.0,
  });

  const [breakSettings, setBreakSettings] = useState({
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
      
      // Load feature toggles from company.settings
      if (res.data.settings) {
        const s = res.data.settings;
        setToggles(prev => ({
          ...prev,
          verificationMode: s.verificationMode ?? 'balanced',
          facialRecognition: s.facialRecognition ?? 'soft',
          gpsGeofencing: s.gpsGeofencing ?? 'soft',
          earlyClockInRestriction: s.earlyClockInRestriction ?? 'off',
          workerSelfServiceEdits: s.workerSelfServiceEdits ?? 'soft',
          photoCapture: s.photoCapture ?? true,
          breakTracking: s.breakTracking ?? true,
          breakCompliancePenalties: s.breakCompliancePenalties ?? false,
          overtimeCalculations: s.overtimeCalculations ?? true,
          seventhDayOtRule: s.seventhDayOtRule ?? false,
          autoClockOut: s.autoClockOut ?? true,
          jobBasedTracking: s.jobBasedTracking ?? true,
          shiftScheduling: s.shiftScheduling ?? false,
          leaveManagement: s.leaveManagement ?? false,
          buddyPunchAlerts: s.buddyPunchAlerts ?? true,
          maxShiftHours: s.maxShiftHours ?? 16,
          earlyClockInMinutes: s.earlyClockInMinutes ?? 15,
        }));
      }
      
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
      
      if (res.data.breakComplianceSettings) {
        const bc = res.data.breakComplianceSettings;
        setBreakSettings({
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

  // Handle verification mode change - updates all 3 related toggles
  const handleVerificationModeChange = (mode) => {
    let facial, gps, earlyClock;
    
    if (mode === 'relaxed') {
      facial = 'off';
      gps = 'off';
      earlyClock = 'off';
    } else if (mode === 'balanced') {
      facial = 'soft';
      gps = 'soft';
      earlyClock = 'off';
    } else {
      facial = 'strict';
      gps = 'strict';
      earlyClock = 'strict';
    }
    
    setToggles(prev => ({
      ...prev,
      verificationMode: mode,
      facialRecognition: facial,
      gpsGeofencing: gps,
      earlyClockInRestriction: earlyClock,
    }));
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
          ...toggles,
          maxShiftHours: parseFloat(toggles.maxShiftHours) || 16,
          earlyClockInMinutes: parseInt(toggles.earlyClockInMinutes) || 15,
        },
        overtimeSettings: {
          dailyOtThreshold: parseFloat(overtimeSettings.dailyOtThreshold) * 60,
          dailyDtThreshold: parseFloat(overtimeSettings.dailyDtThreshold) * 60,
          weeklyOtThreshold: parseFloat(overtimeSettings.weeklyOtThreshold) * 60,
          otMultiplier: parseFloat(overtimeSettings.otMultiplier),
          dtMultiplier: parseFloat(overtimeSettings.dtMultiplier),
        },
        breakComplianceSettings: {
          enabled: toggles.breakTracking,
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

      {/* Verification Mode - Master Toggle */}
      <div className="settings-card verification-mode-card">
        <div className="card-header">
          <span className="card-icon">🛡️</span>
          <div>
            <h2>Verification Mode</h2>
            <p>Control how strictly the system verifies clock-ins</p>
          </div>
        </div>

        <div className="verification-options">
          <label className={`verification-option ${toggles.verificationMode === 'relaxed' ? 'selected' : ''}`}>
            <input
              type="radio"
              name="verificationMode"
              value="relaxed"
              checked={toggles.verificationMode === 'relaxed'}
              onChange={() => handleVerificationModeChange('relaxed')}
            />
            <div className="option-content">
              <strong>Relaxed</strong>
              <span>No verification - just track time</span>
            </div>
          </label>
          
          <label className={`verification-option ${toggles.verificationMode === 'balanced' ? 'selected' : ''}`}>
            <input
              type="radio"
              name="verificationMode"
              value="balanced"
              checked={toggles.verificationMode === 'balanced'}
              onChange={() => handleVerificationModeChange('balanced')}
            />
            <div className="option-content">
              <strong>Balanced</strong>
              <span>Verify and flag issues for review</span>
            </div>
          </label>
          
          <label className={`verification-option ${toggles.verificationMode === 'strict' ? 'selected' : ''}`}>
            <input
              type="radio"
              name="verificationMode"
              value="strict"
              checked={toggles.verificationMode === 'strict'}
              onChange={() => handleVerificationModeChange('strict')}
            />
            <div className="option-content">
              <strong>Strict</strong>
              <span>Block workers if verification fails</span>
            </div>
          </label>
        </div>

        <div className="info-box">
          <strong>Current mode:</strong> {toggles.verificationMode === 'relaxed' ? 'Workers can clock in without verification.' : toggles.verificationMode === 'balanced' ? 'Failed verifications are flagged but workers can still clock in.' : 'Workers are blocked if GPS or facial recognition fails.'}
        </div>
      </div>

      {/* Feature Toggles */}
      <div className="settings-card">
        <div className="card-header">
          <span className="card-icon">⚙️</span>
          <div>
            <h2>Feature Toggles</h2>
            <p>Enable or disable specific features</p>
          </div>
        </div>

        <div className="toggles-grid">
          <div className="toggle-row">
            <div className="toggle-info">
              <strong>Photo Capture</strong>
              <span>Require photo on clock-in/out</span>
            </div>
            <label className="switch">
              <input
                type="checkbox"
                checked={toggles.photoCapture}
                onChange={(e) => setToggles(prev => ({ ...prev, photoCapture: e.target.checked }))}
              />
              <span className="slider"></span>
            </label>
          </div>

          <div className="toggle-row">
            <div className="toggle-info">
              <strong>Facial Recognition</strong>
              <span>Verify worker identity with face match</span>
            </div>
            <select
              value={toggles.facialRecognition}
              onChange={(e) => setToggles(prev => ({ ...prev, facialRecognition: e.target.value }))}
              className="toggle-select"
            >
              <option value="off">Off</option>
              <option value="soft">Soft (flag only)</option>
              <option value="strict">Strict (block)</option>
            </select>
          </div>

          <div className="toggle-row">
            <div className="toggle-info">
              <strong>GPS Geofencing</strong>
              <span>Verify worker is at job site</span>
            </div>
            <select
              value={toggles.gpsGeofencing}
              onChange={(e) => setToggles(prev => ({ ...prev, gpsGeofencing: e.target.value }))}
              className="toggle-select"
            >
              <option value="off">Off</option>
              <option value="soft">Soft (flag only)</option>
              <option value="strict">Strict (block)</option>
            </select>
          </div>

          <div className="toggle-row">
            <div className="toggle-info">
              <strong>Job-Based Tracking</strong>
              <span>Assign time entries to specific jobs</span>
            </div>
            <label className="switch">
              <input
                type="checkbox"
                checked={toggles.jobBasedTracking}
                onChange={(e) => setToggles(prev => ({ ...prev, jobBasedTracking: e.target.checked }))}
              />
              <span className="slider"></span>
            </label>
          </div>

          <div className="toggle-row">
            <div className="toggle-info">
              <strong>Shift Scheduling</strong>
              <span>Create and manage worker schedules</span>
            </div>
            <label className="switch">
              <input
                type="checkbox"
                checked={toggles.shiftScheduling}
                onChange={(e) => setToggles(prev => ({ ...prev, shiftScheduling: e.target.checked }))}
              />
              <span className="slider"></span>
            </label>
          </div>

          <div className="toggle-row">
            <div className="toggle-info">
              <strong>Early Clock-In Restriction</strong>
              <span>Prevent clocking in too early before shift</span>
            </div>
            <select
              value={toggles.earlyClockInRestriction}
              onChange={(e) => setToggles(prev => ({ ...prev, earlyClockInRestriction: e.target.value }))}
              className="toggle-select"
              disabled={!toggles.shiftScheduling}
            >
              <option value="off">Off</option>
              <option value="soft">Soft (flag only)</option>
              <option value="strict">Strict (block)</option>
            </select>
          </div>

          <div className="toggle-row">
            <div className="toggle-info">
              <strong>Auto Clock-Out</strong>
              <span>Automatically clock out after max hours</span>
            </div>
            <label className="switch">
              <input
                type="checkbox"
                checked={toggles.autoClockOut}
                onChange={(e) => setToggles(prev => ({ ...prev, autoClockOut: e.target.checked }))}
              />
              <span className="slider"></span>
            </label>
          </div>

          <div className="toggle-row">
            <div className="toggle-info">
              <strong>Break Tracking</strong>
              <span>Track meal and rest breaks</span>
            </div>
            <label className="switch">
              <input
                type="checkbox"
                checked={toggles.breakTracking}
                onChange={(e) => setToggles(prev => ({ ...prev, breakTracking: e.target.checked }))}
              />
              <span className="slider"></span>
            </label>
          </div>

          <div className="toggle-row">
            <div className="toggle-info">
              <strong>Break Compliance Penalties</strong>
              <span>Calculate penalty pay for missed breaks</span>
            </div>
            <label className="switch">
              <input
                type="checkbox"
                checked={toggles.breakCompliancePenalties}
                onChange={(e) => setToggles(prev => ({ ...prev, breakCompliancePenalties: e.target.checked }))}
                disabled={!toggles.breakTracking}
              />
              <span className="slider"></span>
            </label>
          </div>

          <div className="toggle-row">
            <div className="toggle-info">
              <strong>Overtime Calculations</strong>
              <span>Auto-calculate OT and double time</span>
            </div>
            <label className="switch">
              <input
                type="checkbox"
                checked={toggles.overtimeCalculations}
                onChange={(e) => setToggles(prev => ({ ...prev, overtimeCalculations: e.target.checked }))}
              />
              <span className="slider"></span>
            </label>
          </div>

          <div className="toggle-row">
            <div className="toggle-info">
              <strong>7th Day OT Rule (CA)</strong>
              <span>Apply California 7th consecutive day rule</span>
            </div>
            <label className="switch">
              <input
                type="checkbox"
                checked={toggles.seventhDayOtRule}
                onChange={(e) => setToggles(prev => ({ ...prev, seventhDayOtRule: e.target.checked }))}
                disabled={!toggles.overtimeCalculations}
              />
              <span className="slider"></span>
            </label>
          </div>

          <div className="toggle-row">
            <div className="toggle-info">
              <strong>Leave Management</strong>
              <span>Track PTO, sick leave, and time off</span>
            </div>
            <label className="switch">
              <input
                type="checkbox"
                checked={toggles.leaveManagement}
                onChange={(e) => setToggles(prev => ({ ...prev, leaveManagement: e.target.checked }))}
              />
              <span className="slider"></span>
            </label>
          </div>

          <div className="toggle-row">
            <div className="toggle-info">
              <strong>Worker Self-Service Edits</strong>
              <span>Allow workers to request time edits</span>
            </div>
            <select
              value={toggles.workerSelfServiceEdits}
              onChange={(e) => setToggles(prev => ({ ...prev, workerSelfServiceEdits: e.target.value }))}
              className="toggle-select"
            >
              <option value="strict">Off (admin only)</option>
              <option value="soft">On (requires approval)</option>
            </select>
          </div>

          <div className="toggle-row">
            <div className="toggle-info">
              <strong>Buddy Punch Alerts</strong>
              <span>Email admins on failed face verification</span>
            </div>
            <label className="switch">
              <input
                type="checkbox"
                checked={toggles.buddyPunchAlerts}
                onChange={(e) => setToggles(prev => ({ ...prev, buddyPunchAlerts: e.target.checked }))}
              />
              <span className="slider"></span>
            </label>
          </div>
        </div>
      </div>

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
            <p>Default hourly rate for new workers</p>
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
          </div>
        </div>
      </div>

      {/* Time & Attendance Config */}
      <div className="settings-card">
        <div className="card-header">
          <span className="card-icon">⏱️</span>
          <div>
            <h2>Time & Attendance Config</h2>
            <p>Configure time tracking parameters</p>
          </div>
        </div>

        <div className="form-grid">
          <div className="form-group">
            <label>Max Shift Length (hours)</label>
            <input
              type="number"
              step="0.5"
              min="1"
              max="24"
              value={toggles.maxShiftHours}
              onChange={(e) => setToggles(prev => ({ ...prev, maxShiftHours: e.target.value }))}
            />
            <small>Auto clock-out after this many hours</small>
          </div>
          <div className="form-group">
            <label>Early Clock-In Window (minutes)</label>
            <input
              type="number"
              min="0"
              max="60"
              value={toggles.earlyClockInMinutes}
              onChange={(e) => setToggles(prev => ({ ...prev, earlyClockInMinutes: e.target.value }))}
            />
            <small>How early workers can clock in</small>
          </div>
        </div>
      </div>

      {/* Overtime Rules */}
      {toggles.overtimeCalculations && (
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
            </div>
            <div className="form-group">
              <label>Daily Double Time After (hours)</label>
              <input 
                type="number" 
                value={overtimeSettings.dailyDtThreshold}
                onChange={(e) => setOvertimeSettings(prev => ({ ...prev, dailyDtThreshold: e.target.value }))}
              />
            </div>
            <div className="form-group">
              <label>Weekly OT After (hours)</label>
              <input 
                type="number" 
                value={overtimeSettings.weeklyOtThreshold}
                onChange={(e) => setOvertimeSettings(prev => ({ ...prev, weeklyOtThreshold: e.target.value }))}
              />
            </div>
            <div className="form-group">
              <label>OT Multiplier</label>
              <input 
                type="number" 
                step="0.1" 
                value={overtimeSettings.otMultiplier}
                onChange={(e) => setOvertimeSettings(prev => ({ ...prev, otMultiplier: e.target.value }))}
              />
            </div>
            <div className="form-group">
              <label>DT Multiplier</label>
              <input 
                type="number" 
                step="0.1" 
                value={overtimeSettings.dtMultiplier}
                onChange={(e) => setOvertimeSettings(prev => ({ ...prev, dtMultiplier: e.target.value }))}
              />
            </div>
          </div>
        </div>
      )}

      {/* Break Compliance */}
      {toggles.breakTracking && (
        <div className="settings-card">
          <div className="card-header">
            <span className="card-icon">☕</span>
            <div>
              <h2>Break Compliance</h2>
              <p>Meal and rest break requirements</p>
            </div>
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
            {toggles.breakCompliancePenalties && (
              <div className="form-group">
                <label>Violation Penalty (hours pay)</label>
                <input 
                  type="number" 
                  step="0.5" 
                  value={breakSettings.penaltyRate}
                  onChange={(e) => setBreakSettings(prev => ({ ...prev, penaltyRate: e.target.value }))}
                />
              </div>
            )}
          </div>
        </div>
      )}

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