import { useState, useEffect } from 'react';
import { companyApi, usersApi } from '../services/api';
import './SettingsPage.css';

const Icons = {
  clock: (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><polyline points="12,6 12,12 16,14" /></svg>),
  briefcase: (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="7" width="20" height="14" rx="2" ry="2" /><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" /></svg>),
  clipboard: (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" /><rect x="8" y="2" width="8" height="4" rx="1" ry="1" /></svg>),
  handshake: (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20.42 4.58a5.4 5.4 0 0 0-7.65 0l-.77.78-.77-.78a5.4 5.4 0 0 0-7.65 0C1.46 6.7 1.33 10.28 4 13l8 8 8-8c2.67-2.72 2.54-6.3.42-8.42z"/></svg>),
  link: (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" /><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" /></svg>),
  users: (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></svg>),
  shield: (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /></svg>),
  settings: (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" /></svg>),
  building: (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="4" y="2" width="16" height="20" rx="2" ry="2" /><path d="M9 22v-4h6v4" /><path d="M8 6h.01" /><path d="M16 6h.01" /><path d="M12 6h.01" /><path d="M12 10h.01" /><path d="M12 14h.01" /><path d="M16 10h.01" /><path d="M16 14h.01" /><path d="M8 10h.01" /><path d="M8 14h.01" /></svg>),
  dollarSign: (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="1" x2="12" y2="23" /><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" /></svg>),
  timer: (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><polyline points="12,6 12,12 16,14" /></svg>),
  overtime: (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><polyline points="12,6 12,12 16,14" /><path d="M12 2v2" /><path d="M12 20v2" /></svg>),
  coffee: (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8h1a4 4 0 0 1 0 8h-1" /><path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z" /><line x1="6" y1="1" x2="6" y2="4" /><line x1="10" y1="1" x2="10" y2="4" /><line x1="14" y1="1" x2="14" y2="4" /></svg>),
  check: (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20,6 9,17 4,12" /></svg>),
  alertTriangle: (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" /><line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" /></svg>),
  scale: (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 3v18" /><path d="M5 6l7-3 7 3" /><path d="M5 6v6a7 7 0 0 0 7 7 7 7 0 0 0 7-7V6" /></svg>),
};

const WORKER_TYPES = [
  { id: 'hourly', name: 'Hourly Workers', icon: 'clock', description: 'Track time with overtime calculations', apiType: 'HOURLY' },
  { id: 'salaried', name: 'Salaried Workers', icon: 'briefcase', description: 'Fixed salary, no overtime tracking', apiType: 'SALARIED' },
  { id: 'contractors', name: 'Contractors', icon: 'clipboard', description: 'Independent contractors with portal access', apiType: 'CONTRACTOR' },
  { id: 'volunteers', name: 'Volunteers', icon: 'handshake', description: 'Volunteer shift tracking', apiType: 'VOLUNTEER' },
];

const US_TIMEZONES = [
  { id: 'America/Los_Angeles', name: 'Pacific Time (PT)', offset: 'UTC-8/UTC-7' },
  { id: 'America/Denver', name: 'Mountain Time (MT)', offset: 'UTC-7/UTC-6' },
  { id: 'America/Chicago', name: 'Central Time (CT)', offset: 'UTC-6/UTC-5' },
  { id: 'America/New_York', name: 'Eastern Time (ET)', offset: 'UTC-5/UTC-4' },
  { id: 'America/Anchorage', name: 'Alaska Time (AKT)', offset: 'UTC-9/UTC-8' },
  { id: 'Pacific/Honolulu', name: 'Hawaii Time (HT)', offset: 'UTC-10' },
];

const PORTAL_URLS = {
  contractor: 'https://portal.gopunchd.com',
  volunteer: 'https://volunteer.gopunchd.com',
};

const COMPLIANCE_MODES = [
  { id: 'california', name: 'California', description: 'Strictest rules: Daily OT (8hr), Daily DT (12hr), Weekly OT (40hr), 7th Day OT', settings: { dailyOtEnabled: true, dailyDtEnabled: true, weeklyOtEnabled: true, seventhDayOtRule: true, dailyOtThreshold: 8, dailyDtThreshold: 12, weeklyOtThreshold: 40 } },
  { id: 'federal', name: 'Federal Only', description: 'FLSA minimum: Weekly OT (40hr) only, no daily OT requirements', settings: { dailyOtEnabled: false, dailyDtEnabled: false, weeklyOtEnabled: true, seventhDayOtRule: false, dailyOtThreshold: 8, dailyDtThreshold: 12, weeklyOtThreshold: 40 } },
  { id: 'custom', name: 'Custom', description: 'Configure your own overtime rules', settings: null },
];

function SettingsPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [copiedUrl, setCopiedUrl] = useState(null);
  const [companyData, setCompanyData] = useState({ name: '', address: '', city: '', state: '', zip: '', defaultHourlyRate: '', timezone: 'America/Los_Angeles' });
  const [enabledWorkerTypes, setEnabledWorkerTypes] = useState(['hourly', 'salaried', 'contractors', 'volunteers']);
  const [workerCountsByType, setWorkerCountsByType] = useState({ hourly: 0, salaried: 0, contractors: 0, volunteers: 0 });
  const [complianceMode, setComplianceMode] = useState('california');
  const [toggles, setToggles] = useState({
    verificationMode: 'balanced', facialRecognition: 'soft', gpsGeofencing: 'soft', earlyClockInRestriction: 'off',
    workerSelfServiceEdits: 'soft', photoCapture: true, breakTracking: true, breakCompliancePenalties: false,
    overtimeCalculations: true, seventhDayOtRule: true, dailyOtEnabled: true, dailyDtEnabled: true, weeklyOtEnabled: true,
    autoClockOut: true, jobBasedTracking: true, shiftScheduling: false, leaveManagement: false, buddyPunchAlerts: true,
    maxShiftHours: 16, earlyClockInMinutes: 15,
  });
  const [overtimeSettings, setOvertimeSettings] = useState({ dailyOtThreshold: 8, dailyDtThreshold: 12, weeklyOtThreshold: 40, otMultiplier: 1.5, dtMultiplier: 2.0 });
  const [breakSettings, setBreakSettings] = useState({ state: 'CA', mealBreakThreshold: 5, mealBreakDuration: 30, penaltyRate: 1 });

  useEffect(() => { loadCompanyData(); loadWorkerCounts(); }, []);

  const loadWorkerCounts = async () => {
    try {
      const res = await usersApi.getAll();
      const users = res.data || [];
      const counts = { hourly: 0, salaried: 0, contractors: 0, volunteers: 0 };
      users.forEach(user => {
        const types = user.workerTypes || [];
        types.forEach(type => {
          const typeLower = type.toLowerCase();
          if (typeLower === 'hourly') counts.hourly++;
          else if (typeLower === 'salaried') counts.salaried++;
          else if (typeLower === 'contractor') counts.contractors++;
          else if (typeLower === 'volunteer') counts.volunteers++;
        });
      });
      setWorkerCountsByType(counts);
    } catch (err) { console.error('Failed to load worker counts:', err); }
  };

  const loadCompanyData = async () => {
    try {
      const res = await companyApi.get();
      setCompanyData({ name: res.data.name || '', address: res.data.address || '', city: res.data.city || '', state: res.data.state || '', zip: res.data.zip || '', defaultHourlyRate: res.data.defaultHourlyRate || '', timezone: res.data.timezone || 'America/Los_Angeles' });
      if (res.data.settings) {
        const s = res.data.settings;
        if (s.enabledWorkerTypes && Array.isArray(s.enabledWorkerTypes)) setEnabledWorkerTypes(s.enabledWorkerTypes);
        if (s.complianceMode) setComplianceMode(s.complianceMode);
        setToggles(prev => ({ ...prev, verificationMode: s.verificationMode ?? 'balanced', facialRecognition: s.facialRecognition ?? 'soft', gpsGeofencing: s.gpsGeofencing ?? 'soft', earlyClockInRestriction: s.earlyClockInRestriction ?? 'off', workerSelfServiceEdits: s.workerSelfServiceEdits ?? 'soft', photoCapture: s.photoCapture ?? true, breakTracking: s.breakTracking ?? true, breakCompliancePenalties: s.breakCompliancePenalties ?? false, overtimeCalculations: s.overtimeCalculations ?? true, seventhDayOtRule: s.seventhDayOtRule ?? true, dailyOtEnabled: s.dailyOtEnabled ?? true, dailyDtEnabled: s.dailyDtEnabled ?? true, weeklyOtEnabled: s.weeklyOtEnabled ?? true, autoClockOut: s.autoClockOut ?? true, jobBasedTracking: s.jobBasedTracking ?? true, shiftScheduling: s.shiftScheduling ?? false, leaveManagement: s.leaveManagement ?? false, buddyPunchAlerts: s.buddyPunchAlerts ?? true, maxShiftHours: s.maxShiftHours ?? 16, earlyClockInMinutes: s.earlyClockInMinutes ?? 15 }));
      }
      if (res.data.overtimeSettings) {
        const ot = res.data.overtimeSettings;
        setOvertimeSettings({ dailyOtThreshold: (ot.dailyOtThreshold ?? 480) / 60, dailyDtThreshold: (ot.dailyDtThreshold ?? 720) / 60, weeklyOtThreshold: (ot.weeklyOtThreshold ?? 2400) / 60, otMultiplier: ot.otMultiplier ?? 1.5, dtMultiplier: ot.dtMultiplier ?? 2.0 });
      }
      if (res.data.breakComplianceSettings) {
        const bc = res.data.breakComplianceSettings;
        setBreakSettings({ state: bc.state ?? 'CA', mealBreakThreshold: (bc.mealBreakThreshold ?? 300) / 60, mealBreakDuration: bc.mealBreakDuration ?? 30, penaltyRate: bc.penaltyRate ?? 1 });
      }
    } catch (err) { console.error('Failed to load company data:', err); }
    setLoading(false);
  };

  const handleComplianceModeChange = (mode) => {
    setComplianceMode(mode);
    const modeConfig = COMPLIANCE_MODES.find(m => m.id === mode);
    if (modeConfig && modeConfig.settings) {
      setToggles(prev => ({ ...prev, seventhDayOtRule: modeConfig.settings.seventhDayOtRule, dailyOtEnabled: modeConfig.settings.dailyOtEnabled, dailyDtEnabled: modeConfig.settings.dailyDtEnabled, weeklyOtEnabled: modeConfig.settings.weeklyOtEnabled }));
      setOvertimeSettings(prev => ({ ...prev, dailyOtThreshold: modeConfig.settings.dailyOtThreshold, dailyDtThreshold: modeConfig.settings.dailyDtThreshold, weeklyOtThreshold: modeConfig.settings.weeklyOtThreshold }));
    }
  };

  const handleVerificationModeChange = (mode) => {
    let facial, gps, earlyClock;
    if (mode === 'relaxed') { facial = 'off'; gps = 'off'; earlyClock = 'off'; }
    else if (mode === 'balanced') { facial = 'soft'; gps = 'soft'; earlyClock = 'off'; }
    else { facial = 'strict'; gps = 'strict'; earlyClock = 'strict'; }
    setToggles(prev => ({ ...prev, verificationMode: mode, facialRecognition: facial, gpsGeofencing: gps, earlyClockInRestriction: earlyClock }));
  };

  const canDisableWorkerType = (typeId) => workerCountsByType[typeId] === 0;

  const handleWorkerTypeToggle = (typeId) => {
    const isCurrentlyEnabled = enabledWorkerTypes.includes(typeId);
    if (isCurrentlyEnabled) {
      if (!canDisableWorkerType(typeId)) {
        const typeName = WORKER_TYPES.find(t => t.id === typeId)?.name || typeId;
        setMessage({ type: 'error', text: `Cannot disable ${typeName} - you have ${workerCountsByType[typeId]} active worker(s) of this type.` });
        setTimeout(() => setMessage({ type: '', text: '' }), 5000);
        return;
      }
      if (enabledWorkerTypes.length === 1) {
        setMessage({ type: 'error', text: 'You must have at least one worker type enabled' });
        setTimeout(() => setMessage({ type: '', text: '' }), 3000);
        return;
      }
      const remainingTypes = enabledWorkerTypes.filter(t => t !== typeId);
      if (remainingTypes.length === 1 && remainingTypes[0] === 'volunteers') {
        setMessage({ type: 'error', text: 'Volunteers cannot be your only worker type.' });
        setTimeout(() => setMessage({ type: '', text: '' }), 5000);
        return;
      }
      setEnabledWorkerTypes(prev => prev.filter(t => t !== typeId));
    } else {
      setEnabledWorkerTypes(prev => [...prev, typeId]);
    }
  };

  const copyToClipboard = async (url, key) => {
    try { await navigator.clipboard.writeText(url); setCopiedUrl(key); setTimeout(() => setCopiedUrl(null), 2000); }
    catch (err) { console.error('Failed to copy:', err); }
  };

  const handleSave = async () => {
    setSaving(true);
    setMessage({ type: '', text: '' });
    try {
      const dataToSave = {
        ...companyData,
        defaultHourlyRate: companyData.defaultHourlyRate ? parseFloat(companyData.defaultHourlyRate) : null,
        timezone: companyData.timezone,
        settings: { ...toggles, complianceMode, enabledWorkerTypes, maxShiftHours: parseFloat(toggles.maxShiftHours) || 16, earlyClockInMinutes: parseInt(toggles.earlyClockInMinutes) || 15 },
        overtimeSettings: { dailyOtThreshold: parseFloat(overtimeSettings.dailyOtThreshold) * 60, dailyDtThreshold: parseFloat(overtimeSettings.dailyDtThreshold) * 60, weeklyOtThreshold: parseFloat(overtimeSettings.weeklyOtThreshold) * 60, otMultiplier: parseFloat(overtimeSettings.otMultiplier), dtMultiplier: parseFloat(overtimeSettings.dtMultiplier) },
        breakComplianceSettings: { enabled: toggles.breakTracking, state: breakSettings.state, mealBreakThreshold: parseFloat(breakSettings.mealBreakThreshold) * 60, mealBreakDuration: parseInt(breakSettings.mealBreakDuration), penaltyRate: parseFloat(breakSettings.penaltyRate) },
      };
      await companyApi.update(dataToSave);
      setMessage({ type: 'success', text: 'Settings saved successfully!' });
      setTimeout(() => setMessage({ type: '', text: '' }), 5000);
    } catch (err) {
      console.error('Failed to save:', err);
      setMessage({ type: 'error', text: err.response?.data?.message || 'Failed to save settings' });
    }
    setSaving(false);
  };

  const handleChange = (field, value) => setCompanyData(prev => ({ ...prev, [field]: value }));
  const renderIcon = (iconName) => <span className="icon-wrapper">{Icons[iconName]}</span>;

  if (loading) return (<div className="settings-page"><div className="loading-state"><div className="spinner"></div><p>Loading settings...</p></div></div>);

  const showContractorPortal = enabledWorkerTypes.includes('contractors');
  const showVolunteerPortal = enabledWorkerTypes.includes('volunteers');
  const showPortalsSection = showContractorPortal || showVolunteerPortal;

  return (
    <div className="settings-page">
      <div className="page-header">
        <h1 className="page-title">Settings</h1>
        <p className="page-subtitle">Manage your company settings and preferences</p>
      </div>

      {message.text && (<div className={`message ${message.type}`}><span className="message-icon">{message.type === 'success' ? Icons.check : Icons.alertTriangle}</span>{message.text}</div>)}

      {showPortalsSection && (
        <div className="settings-card portal-urls-card">
          <div className="card-header">{renderIcon('link')}<div><h2>Portal URLs</h2><p>Share these links with your contractors and volunteers</p></div></div>
          <div className="portal-urls-grid">
            {showContractorPortal && (<div className="portal-url-item"><div className="portal-url-header">{renderIcon('clipboard')}<div><h4>Contractor Portal</h4><p>For independent contractors (1099)</p></div></div><div className="portal-url-input"><input type="text" value={PORTAL_URLS.contractor} readOnly onClick={(e) => e.target.select()} /><button className={`copy-btn ${copiedUrl === 'contractor' ? 'copied' : ''}`} onClick={() => copyToClipboard(PORTAL_URLS.contractor, 'contractor')}>{copiedUrl === 'contractor' ? 'Copied!' : 'Copy'}</button></div></div>)}
            {showVolunteerPortal && (<div className="portal-url-item"><div className="portal-url-header">{renderIcon('handshake')}<div><h4>Volunteer Portal</h4><p>For volunteer shift tracking</p></div></div><div className="portal-url-input"><input type="text" value={PORTAL_URLS.volunteer} readOnly onClick={(e) => e.target.select()} /><button className={`copy-btn ${copiedUrl === 'volunteer' ? 'copied' : ''}`} onClick={() => copyToClipboard(PORTAL_URLS.volunteer, 'volunteer')}>{copiedUrl === 'volunteer' ? 'Copied!' : 'Copy'}</button></div></div>)}
          </div>
        </div>
      )}

      <div className="settings-card worker-types-card">
        <div className="card-header">{renderIcon('users')}<div><h2>Worker Types</h2><p>Enable the types of workers your company manages</p></div></div>
        <div className="worker-types-grid">
          {WORKER_TYPES.map((type) => {
            const isEnabled = enabledWorkerTypes.includes(type.id);
            const hasWorkers = workerCountsByType[type.id] > 0;
            const canDisable = canDisableWorkerType(type.id);
            return (
              <div key={type.id} className={`worker-type-card ${isEnabled ? 'enabled' : 'disabled'} ${hasWorkers ? 'has-workers' : ''}`} onClick={() => handleWorkerTypeToggle(type.id)}>
                <div className="worker-type-header">{renderIcon(type.icon)}<label className="switch small"><input type="checkbox" checked={isEnabled} onChange={() => handleWorkerTypeToggle(type.id)} onClick={(e) => e.stopPropagation()} disabled={isEnabled && !canDisable} /><span className="slider"></span></label></div>
                <h4>{type.name}</h4><p>{type.description}</p>
                {hasWorkers && (<div className="worker-count-badge">{workerCountsByType[type.id]} worker{workerCountsByType[type.id] !== 1 ? 's' : ''}</div>)}
              </div>
            );
          })}
        </div>
        <div className="info-box"><strong>Note:</strong> You cannot disable a worker type that has active workers, and volunteers cannot be your only worker type.</div>
      </div>

      <div className="settings-card compliance-mode-card">
        <div className="card-header">{renderIcon('scale')}<div><h2>Compliance Mode</h2><p>Select overtime rules based on your state or customize your own</p></div></div>
        <div className="compliance-options">
          {COMPLIANCE_MODES.map((mode) => (<label key={mode.id} className={`compliance-option ${complianceMode === mode.id ? 'selected' : ''}`}><input type="radio" name="complianceMode" value={mode.id} checked={complianceMode === mode.id} onChange={() => handleComplianceModeChange(mode.id)} /><div className="option-content"><strong>{mode.name}</strong><span>{mode.description}</span></div></label>))}
        </div>
        <div className="compliance-summary">
          <h4>Active Rules:</h4>
          <div className="rules-grid">
            <div className={`rule-item ${toggles.dailyOtEnabled ? 'active' : 'inactive'}`}><span className="rule-status">{toggles.dailyOtEnabled ? Icons.check : '—'}</span><span>Daily OT ({overtimeSettings.dailyOtThreshold}hr)</span></div>
            <div className={`rule-item ${toggles.dailyDtEnabled ? 'active' : 'inactive'}`}><span className="rule-status">{toggles.dailyDtEnabled ? Icons.check : '—'}</span><span>Daily DT ({overtimeSettings.dailyDtThreshold}hr)</span></div>
            <div className={`rule-item ${toggles.weeklyOtEnabled ? 'active' : 'inactive'}`}><span className="rule-status">{toggles.weeklyOtEnabled ? Icons.check : '—'}</span><span>Weekly OT ({overtimeSettings.weeklyOtThreshold}hr)</span></div>
            <div className={`rule-item ${toggles.seventhDayOtRule ? 'active' : 'inactive'}`}><span className="rule-status">{toggles.seventhDayOtRule ? Icons.check : '—'}</span><span>7th Day OT</span></div>
          </div>
        </div>
      </div>

      <div className="settings-card verification-mode-card">
        <div className="card-header">{renderIcon('shield')}<div><h2>Verification Mode</h2><p>Control how strictly the system verifies clock-ins</p></div></div>
        <div className="verification-options">
          <label className={`verification-option ${toggles.verificationMode === 'relaxed' ? 'selected' : ''}`}><input type="radio" name="verificationMode" value="relaxed" checked={toggles.verificationMode === 'relaxed'} onChange={() => handleVerificationModeChange('relaxed')} /><div className="option-content"><strong>Relaxed</strong><span>No verification - just track time</span></div></label>
          <label className={`verification-option ${toggles.verificationMode === 'balanced' ? 'selected' : ''}`}><input type="radio" name="verificationMode" value="balanced" checked={toggles.verificationMode === 'balanced'} onChange={() => handleVerificationModeChange('balanced')} /><div className="option-content"><strong>Balanced</strong><span>Verify and flag issues for review</span></div></label>
          <label className={`verification-option ${toggles.verificationMode === 'strict' ? 'selected' : ''}`}><input type="radio" name="verificationMode" value="strict" checked={toggles.verificationMode === 'strict'} onChange={() => handleVerificationModeChange('strict')} /><div className="option-content"><strong>Strict</strong><span>Block workers if verification fails</span></div></label>
        </div>
        <div className="info-box"><strong>Current mode:</strong> {toggles.verificationMode === 'relaxed' ? 'Workers can clock in without verification.' : toggles.verificationMode === 'balanced' ? 'Failed verifications are flagged but workers can still clock in.' : 'Workers are blocked if GPS or facial recognition fails.'}</div>
      </div>

      <div className="settings-card">
        <div className="card-header">{renderIcon('settings')}<div><h2>Feature Toggles</h2><p>Enable or disable specific features</p></div></div>
        <div className="toggles-grid">
          <div className="toggle-row"><div className="toggle-info"><strong>Photo Capture</strong><span>Require photo on clock-in/out</span></div><label className="switch"><input type="checkbox" checked={toggles.photoCapture} onChange={(e) => setToggles(prev => ({ ...prev, photoCapture: e.target.checked }))} /><span className="slider"></span></label></div>
          <div className="toggle-row"><div className="toggle-info"><strong>Facial Recognition</strong><span>Verify worker identity with face match</span></div><select value={toggles.facialRecognition} onChange={(e) => setToggles(prev => ({ ...prev, facialRecognition: e.target.value }))} className="toggle-select"><option value="off">Off</option><option value="soft">Soft (flag only)</option><option value="strict">Strict (block)</option></select></div>
          <div className="toggle-row"><div className="toggle-info"><strong>GPS Geofencing</strong><span>Verify worker is at job site</span></div><select value={toggles.gpsGeofencing} onChange={(e) => setToggles(prev => ({ ...prev, gpsGeofencing: e.target.value }))} className="toggle-select"><option value="off">Off</option><option value="soft">Soft (flag only)</option><option value="strict">Strict (block)</option></select></div>
          <div className="toggle-row"><div className="toggle-info"><strong>Job-Based Tracking</strong><span>Assign time entries to specific jobs</span></div><label className="switch"><input type="checkbox" checked={toggles.jobBasedTracking} onChange={(e) => setToggles(prev => ({ ...prev, jobBasedTracking: e.target.checked }))} /><span className="slider"></span></label></div>
          <div className="toggle-row"><div className="toggle-info"><strong>Shift Scheduling</strong><span>Create and manage worker schedules</span></div><label className="switch"><input type="checkbox" checked={toggles.shiftScheduling} onChange={(e) => setToggles(prev => ({ ...prev, shiftScheduling: e.target.checked }))} /><span className="slider"></span></label></div>
          <div className="toggle-row"><div className="toggle-info"><strong>Early Clock-In Restriction</strong><span>Prevent clocking in too early</span></div><select value={toggles.earlyClockInRestriction} onChange={(e) => setToggles(prev => ({ ...prev, earlyClockInRestriction: e.target.value }))} className="toggle-select" disabled={!toggles.shiftScheduling}><option value="off">Off</option><option value="soft">Soft (flag only)</option><option value="strict">Strict (block)</option></select></div>
          <div className="toggle-row"><div className="toggle-info"><strong>Auto Clock-Out</strong><span>Automatically clock out after max hours</span></div><label className="switch"><input type="checkbox" checked={toggles.autoClockOut} onChange={(e) => setToggles(prev => ({ ...prev, autoClockOut: e.target.checked }))} /><span className="slider"></span></label></div>
          <div className="toggle-row"><div className="toggle-info"><strong>Break Tracking</strong><span>Track meal and rest breaks</span></div><label className="switch"><input type="checkbox" checked={toggles.breakTracking} onChange={(e) => setToggles(prev => ({ ...prev, breakTracking: e.target.checked }))} /><span className="slider"></span></label></div>
          <div className="toggle-row"><div className="toggle-info"><strong>Break Compliance Penalties</strong><span>Calculate penalty pay for missed breaks</span></div><label className="switch"><input type="checkbox" checked={toggles.breakCompliancePenalties} onChange={(e) => setToggles(prev => ({ ...prev, breakCompliancePenalties: e.target.checked }))} disabled={!toggles.breakTracking} /><span className="slider"></span></label></div>
          <div className="toggle-row"><div className="toggle-info"><strong>Overtime Calculations</strong><span>Auto-calculate OT and double time</span></div><label className="switch"><input type="checkbox" checked={toggles.overtimeCalculations} onChange={(e) => setToggles(prev => ({ ...prev, overtimeCalculations: e.target.checked }))} /><span className="slider"></span></label></div>
          <div className="toggle-row"><div className="toggle-info"><strong>Leave Management</strong><span>Track PTO, sick leave, and time off</span></div><label className="switch"><input type="checkbox" checked={toggles.leaveManagement} onChange={(e) => setToggles(prev => ({ ...prev, leaveManagement: e.target.checked }))} /><span className="slider"></span></label></div>
          <div className="toggle-row"><div className="toggle-info"><strong>Worker Self-Service Edits</strong><span>Allow workers to request time edits</span></div><select value={toggles.workerSelfServiceEdits} onChange={(e) => setToggles(prev => ({ ...prev, workerSelfServiceEdits: e.target.value }))} className="toggle-select"><option value="strict">Off (admin only)</option><option value="soft">On (requires approval)</option></select></div>
          <div className="toggle-row"><div className="toggle-info"><strong>Buddy Punch Alerts</strong><span>Email admins on failed face verification</span></div><label className="switch"><input type="checkbox" checked={toggles.buddyPunchAlerts} onChange={(e) => setToggles(prev => ({ ...prev, buddyPunchAlerts: e.target.checked }))} /><span className="slider"></span></label></div>
        </div>
      </div>

      <div className="settings-card">
        <div className="card-header">{renderIcon('building')}<div><h2>Company Information</h2><p>Basic company details used in reports and payroll</p></div></div>
        <div className="form-grid">
          <div className="form-group full-width"><label>Company Name</label><input type="text" value={companyData.name} onChange={(e) => handleChange('name', e.target.value)} placeholder="Your Company Name" /></div>
          <div className="form-group full-width"><label>Street Address</label><input type="text" value={companyData.address} onChange={(e) => handleChange('address', e.target.value)} placeholder="123 Main Street" /><small>Required for WH-347 certified payroll reports</small></div>
          <div className="form-group"><label>City</label><input type="text" value={companyData.city} onChange={(e) => handleChange('city', e.target.value)} placeholder="San Jose" /></div>
          <div className="form-group"><label>State</label><input type="text" value={companyData.state} onChange={(e) => handleChange('state', e.target.value.toUpperCase())} placeholder="CA" maxLength="2" /></div>
          <div className="form-group"><label>ZIP Code</label><input type="text" value={companyData.zip} onChange={(e) => handleChange('zip', e.target.value)} placeholder="95123" maxLength="10" /></div>
          <div className="form-group"><label>Timezone</label><select value={companyData.timezone} onChange={(e) => handleChange('timezone', e.target.value)}>{US_TIMEZONES.map(tz => (<option key={tz.id} value={tz.id}>{tz.name} ({tz.offset})</option>))}</select><small>All time entries will be displayed in this timezone</small></div>
        </div>
      </div>

      <div className="settings-card">
        <div className="card-header">{renderIcon('dollarSign')}<div><h2>Default Pay Rate</h2><p>Default hourly rate for new workers</p></div></div>
        <div className="form-grid"><div className="form-group"><label>Default Hourly Rate ($)</label><input type="number" step="0.01" min="0" value={companyData.defaultHourlyRate} onChange={(e) => handleChange('defaultHourlyRate', e.target.value)} placeholder="25.00" /></div></div>
      </div>

      <div className="settings-card">
        <div className="card-header">{renderIcon('timer')}<div><h2>Time & Attendance Config</h2><p>Configure time tracking parameters</p></div></div>
        <div className="form-grid">
          <div className="form-group"><label>Max Shift Length (hours)</label><input type="number" step="0.5" min="1" max="24" value={toggles.maxShiftHours} onChange={(e) => setToggles(prev => ({ ...prev, maxShiftHours: e.target.value }))} /><small>Auto clock-out after this many hours</small></div>
          <div className="form-group"><label>Early Clock-In Window (minutes)</label><input type="number" min="0" max="60" value={toggles.earlyClockInMinutes} onChange={(e) => setToggles(prev => ({ ...prev, earlyClockInMinutes: e.target.value }))} /><small>How early workers can clock in</small></div>
        </div>
      </div>

      {toggles.overtimeCalculations && complianceMode === 'custom' && (
        <div className="settings-card">
          <div className="card-header">{renderIcon('overtime')}<div><h2>Custom Overtime Rules</h2><p>Configure your custom overtime thresholds</p></div></div>
          <div className="form-grid">
            <div className="form-group"><label><input type="checkbox" checked={toggles.dailyOtEnabled} onChange={(e) => setToggles(prev => ({ ...prev, dailyOtEnabled: e.target.checked }))} style={{ marginRight: '8px' }} />Daily OT After (hours)</label><input type="number" value={overtimeSettings.dailyOtThreshold} onChange={(e) => setOvertimeSettings(prev => ({ ...prev, dailyOtThreshold: e.target.value }))} disabled={!toggles.dailyOtEnabled} /></div>
            <div className="form-group"><label><input type="checkbox" checked={toggles.dailyDtEnabled} onChange={(e) => setToggles(prev => ({ ...prev, dailyDtEnabled: e.target.checked }))} style={{ marginRight: '8px' }} />Daily Double Time After (hours)</label><input type="number" value={overtimeSettings.dailyDtThreshold} onChange={(e) => setOvertimeSettings(prev => ({ ...prev, dailyDtThreshold: e.target.value }))} disabled={!toggles.dailyDtEnabled} /></div>
            <div className="form-group"><label><input type="checkbox" checked={toggles.weeklyOtEnabled} onChange={(e) => setToggles(prev => ({ ...prev, weeklyOtEnabled: e.target.checked }))} style={{ marginRight: '8px' }} />Weekly OT After (hours)</label><input type="number" value={overtimeSettings.weeklyOtThreshold} onChange={(e) => setOvertimeSettings(prev => ({ ...prev, weeklyOtThreshold: e.target.value }))} disabled={!toggles.weeklyOtEnabled} /></div>
            <div className="form-group"><label><input type="checkbox" checked={toggles.seventhDayOtRule} onChange={(e) => setToggles(prev => ({ ...prev, seventhDayOtRule: e.target.checked }))} style={{ marginRight: '8px' }} />7th Consecutive Day OT</label><small>First 8 hours at 1.5x, over 8 at 2x</small></div>
            <div className="form-group"><label>OT Multiplier</label><input type="number" step="0.1" value={overtimeSettings.otMultiplier} onChange={(e) => setOvertimeSettings(prev => ({ ...prev, otMultiplier: e.target.value }))} /></div>
            <div className="form-group"><label>DT Multiplier</label><input type="number" step="0.1" value={overtimeSettings.dtMultiplier} onChange={(e) => setOvertimeSettings(prev => ({ ...prev, dtMultiplier: e.target.value }))} /></div>
          </div>
        </div>
      )}

      {toggles.breakTracking && (
        <div className="settings-card">
          <div className="card-header">{renderIcon('coffee')}<div><h2>Break Compliance</h2><p>Meal and rest break requirements</p></div></div>
          <div className="form-grid">
            <div className="form-group"><label>State Regulations</label><select value={breakSettings.state} onChange={(e) => setBreakSettings(prev => ({ ...prev, state: e.target.value }))}><option value="CA">California</option><option value="WA">Washington</option><option value="OR">Oregon</option><option value="OTHER">Federal (Other States)</option></select></div>
            <div className="form-group"><label>Meal Break After (hours)</label><input type="number" value={breakSettings.mealBreakThreshold} onChange={(e) => setBreakSettings(prev => ({ ...prev, mealBreakThreshold: e.target.value }))} /></div>
            <div className="form-group"><label>Meal Break Duration (min)</label><input type="number" value={breakSettings.mealBreakDuration} onChange={(e) => setBreakSettings(prev => ({ ...prev, mealBreakDuration: e.target.value }))} /></div>
            {toggles.breakCompliancePenalties && <div className="form-group"><label>Violation Penalty (hours pay)</label><input type="number" step="0.5" value={breakSettings.penaltyRate} onChange={(e) => setBreakSettings(prev => ({ ...prev, penaltyRate: e.target.value }))} /></div>}
          </div>
        </div>
      )}

      <button className="btn-save" onClick={handleSave} disabled={saving}>{saving ? 'Saving...' : 'Save Settings'}</button>
    </div>
  );
}

export default SettingsPage;