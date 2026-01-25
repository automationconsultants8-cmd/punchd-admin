import { useState, useEffect } from 'react';
import { companyApi, usersApi } from '../services/api';
import './SettingsPage.css';

// SVG Icons - all 20x20
const Icons = {
  clock: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>,
  briefcase: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="7" width="20" height="14" rx="2" ry="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></svg>,
  clipboard: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/><rect x="8" y="2" width="8" height="4" rx="1" ry="1"/></svg>,
  heart: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>,
  link: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>,
  users: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>,
  check: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>,
  scale: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 16l3-8 3 8c-.87.65-1.92 1-3 1s-2.13-.35-3-1z"/><path d="M2 16l3-8 3 8c-.87.65-1.92 1-3 1s-2.13-.35-3-1z"/><path d="M7 21h10"/><path d="M12 3v18"/><path d="M3 7h2c2 0 5-1 7-2 2 1 5 2 7 2h2"/></svg>,
  shield: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>,
  sliders: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="4" y1="21" x2="4" y2="14"/><line x1="4" y1="10" x2="4" y2="3"/><line x1="12" y1="21" x2="12" y2="12"/><line x1="12" y1="8" x2="12" y2="3"/><line x1="20" y1="21" x2="20" y2="16"/><line x1="20" y1="12" x2="20" y2="3"/><line x1="1" y1="14" x2="7" y2="14"/><line x1="9" y1="8" x2="15" y2="8"/><line x1="17" y1="16" x2="23" y2="16"/></svg>,
  building: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 22V4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v18Z"/><path d="M6 12H4a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h2"/><path d="M18 9h2a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2h-2"/><path d="M10 6h4"/><path d="M10 10h4"/><path d="M10 14h4"/><path d="M10 18h4"/></svg>,
  dollar: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>,
  timer: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>,
  coffee: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8h1a4 4 0 0 1 0 8h-1"/><path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z"/><line x1="6" y1="1" x2="6" y2="4"/><line x1="10" y1="1" x2="10" y2="4"/><line x1="14" y1="1" x2="14" y2="4"/></svg>,
  settings: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>,
  save: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></svg>,
  camera: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/></svg>,
  mapPin: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>,
  calendar: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>,
  alert: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>,
  seven: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M7 4h10l-6 16"/></svg>,
};

const IconWrapper = ({ children }) => (
  <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '20px', height: '20px', flexShrink: 0 }}>
    {children}
  </span>
);

const WORKER_TYPES = [
  { id: 'hourly', name: 'Hourly Workers', icon: 'clock', description: 'Track time with overtime calculations', apiType: 'HOURLY' },
  { id: 'salaried', name: 'Salaried Workers', icon: 'briefcase', description: 'Fixed salary, no overtime tracking', apiType: 'SALARIED' },
  { id: 'contractors', name: 'Contractors', icon: 'clipboard', description: 'Independent contractors with portal access', apiType: 'CONTRACTOR' },
  { id: 'volunteers', name: 'Volunteers', icon: 'heart', description: 'Volunteer shift tracking', apiType: 'VOLUNTEER' },
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
  const [autoApproveSettings, setAutoApproveSettings] = useState({
    hourly: true,
    salaried: true,
    contractor: false,
    volunteer: false,
  });
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
        if (s.autoApprove) {
          setAutoApproveSettings({
            hourly: s.autoApprove.hourly !== false,
            salaried: s.autoApprove.salaried !== false,
            contractor: s.autoApprove.contractor === true,
            volunteer: s.autoApprove.volunteer === true,
          });
        }
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
        settings: { 
          ...toggles, 
          complianceMode, 
          enabledWorkerTypes, 
          autoApprove: autoApproveSettings,
          maxShiftHours: parseFloat(toggles.maxShiftHours) || 16, 
          earlyClockInMinutes: parseInt(toggles.earlyClockInMinutes) || 15 
        },
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

  if (loading) return (<div className="settings-page"><div className="loading-state"><div className="spinner"></div><p>Loading settings...</p></div></div>);

  const showContractorPortal = enabledWorkerTypes.includes('contractors');
  const showVolunteerPortal = enabledWorkerTypes.includes('volunteers');
  const showPortalsSection = showContractorPortal || showVolunteerPortal;

  // Styled pill for active rules
  const RulePill = ({ enabled, label }) => (
    <span style={{ 
      display: 'inline-flex', 
      alignItems: 'center', 
      gap: '6px', 
      padding: '6px 12px', 
      borderRadius: '20px', 
      fontSize: '13px', 
      fontWeight: '500', 
      background: enabled ? '#e8f5e9' : '#ffebee', 
      color: enabled ? '#2e7d32' : '#c62828', 
      border: enabled ? '1px solid #a5d6a7' : '1px solid #ef9a9a' 
    }}>
      {enabled ? '✓' : '✗'} {label}
    </span>
  );

  // Toggle card for custom mode
  const CustomRuleToggle = ({ icon, label, sublabel, enabled, onChange }) => (
    <div style={{ 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'space-between', 
      padding: '12px 16px', 
      background: enabled ? '#e8f5e9' : '#f5f5f5', 
      borderRadius: '8px', 
      border: enabled ? '1px solid #4caf50' : '1px solid #e0e0e0' 
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        <IconWrapper>{icon}</IconWrapper>
        <div>
          <div style={{ fontWeight: '500', fontSize: '13px', color: '#333' }}>{label}</div>
          <div style={{ fontSize: '11px', color: '#666' }}>{sublabel}</div>
        </div>
      </div>
      <label className="switch small">
        <input type="checkbox" checked={enabled} onChange={onChange} />
        <span className="slider"></span>
      </label>
    </div>
  );

  return (
    <div className="settings-page">
      <div className="page-header">
        <h1 className="page-title"><IconWrapper>{Icons.settings}</IconWrapper> Settings</h1>
        <p className="page-subtitle">Manage your company settings and preferences</p>
      </div>

      {message.text && (<div className={`message ${message.type}`}><span className="message-icon">{message.type === 'success' ? <IconWrapper>{Icons.check}</IconWrapper> : <IconWrapper>{Icons.alert}</IconWrapper>}</span>{message.text}</div>)}

      {showPortalsSection && (
        <div className="settings-card portal-urls-card">
          <div className="card-header"><span className="card-icon"><IconWrapper>{Icons.link}</IconWrapper></span><div><h2>Portal URLs</h2><p>Share these links with your contractors and volunteers</p></div></div>
          <div className="portal-urls-grid">
            {showContractorPortal && (<div className="portal-url-item"><div className="portal-url-header"><span className="portal-icon"><IconWrapper>{Icons.clipboard}</IconWrapper></span><div><h4>Contractor Portal</h4><p>For independent contractors (1099)</p></div></div><div className="portal-url-input"><input type="text" value={PORTAL_URLS.contractor} readOnly onClick={(e) => e.target.select()} /><button className={`copy-btn ${copiedUrl === 'contractor' ? 'copied' : ''}`} onClick={() => copyToClipboard(PORTAL_URLS.contractor, 'contractor')}>{copiedUrl === 'contractor' ? 'Copied!' : 'Copy'}</button></div></div>)}
            {showVolunteerPortal && (<div className="portal-url-item"><div className="portal-url-header"><span className="portal-icon"><IconWrapper>{Icons.heart}</IconWrapper></span><div><h4>Volunteer Portal</h4><p>For volunteer shift tracking</p></div></div><div className="portal-url-input"><input type="text" value={PORTAL_URLS.volunteer} readOnly onClick={(e) => e.target.select()} /><button className={`copy-btn ${copiedUrl === 'volunteer' ? 'copied' : ''}`} onClick={() => copyToClipboard(PORTAL_URLS.volunteer, 'volunteer')}>{copiedUrl === 'volunteer' ? 'Copied!' : 'Copy'}</button></div></div>)}
          </div>
        </div>
      )}

      <div className="settings-card worker-types-card">
        <div className="card-header"><span className="card-icon"><IconWrapper>{Icons.users}</IconWrapper></span><div><h2>Worker Types</h2><p>Enable the types of workers your company manages</p></div></div>
        <div className="worker-types-grid">
          {WORKER_TYPES.map((type) => {
            const isEnabled = enabledWorkerTypes.includes(type.id);
            const hasWorkers = workerCountsByType[type.id] > 0;
            const canDisable = canDisableWorkerType(type.id);
            return (
              <div key={type.id} className={`worker-type-card ${isEnabled ? 'enabled' : 'disabled'} ${hasWorkers ? 'has-workers' : ''}`} onClick={() => handleWorkerTypeToggle(type.id)}>
                <div className="worker-type-header"><span className="worker-type-icon"><IconWrapper>{Icons[type.icon]}</IconWrapper></span><label className="switch small"><input type="checkbox" checked={isEnabled} onChange={() => handleWorkerTypeToggle(type.id)} onClick={(e) => e.stopPropagation()} disabled={isEnabled && !canDisable} /><span className="slider"></span></label></div>
                <h4>{type.name}</h4><p>{type.description}</p>
                {hasWorkers && (<div className="worker-count-badge">{workerCountsByType[type.id]} worker{workerCountsByType[type.id] !== 1 ? 's' : ''}</div>)}
              </div>
            );
          })}
        </div>
        <div className="info-box"><strong>Note:</strong> You cannot disable a worker type that has active workers, and volunteers cannot be your only worker type.</div>
      </div>

      <div className="settings-card">
        <div className="card-header"><span className="card-icon"><IconWrapper>{Icons.check}</IconWrapper></span><div><h2>Auto-Approve Settings</h2><p>Configure which worker types get automatic time entry approval</p></div></div>
        <div className="worker-types-grid">
          <div className={`worker-type-card ${autoApproveSettings.hourly ? 'enabled' : 'disabled'}`}>
            <div className="worker-type-header">
              <span className="worker-type-icon"><IconWrapper>{Icons.clock}</IconWrapper></span>
              <label className="switch small">
                <input type="checkbox" checked={autoApproveSettings.hourly} onChange={(e) => setAutoApproveSettings(prev => ({ ...prev, hourly: e.target.checked }))} />
                <span className="slider"></span>
              </label>
            </div>
            <h4>Hourly Workers</h4>
            <p>{autoApproveSettings.hourly ? 'Auto-approved' : 'Requires approval'}</p>
          </div>
          <div className={`worker-type-card ${autoApproveSettings.salaried ? 'enabled' : 'disabled'}`}>
            <div className="worker-type-header">
              <span className="worker-type-icon"><IconWrapper>{Icons.briefcase}</IconWrapper></span>
              <label className="switch small">
                <input type="checkbox" checked={autoApproveSettings.salaried} onChange={(e) => setAutoApproveSettings(prev => ({ ...prev, salaried: e.target.checked }))} />
                <span className="slider"></span>
              </label>
            </div>
            <h4>Salaried Workers</h4>
            <p>{autoApproveSettings.salaried ? 'Auto-approved' : 'Requires approval'}</p>
          </div>
          <div className={`worker-type-card ${autoApproveSettings.contractor ? 'enabled' : 'disabled'}`}>
            <div className="worker-type-header">
              <span className="worker-type-icon"><IconWrapper>{Icons.clipboard}</IconWrapper></span>
              <label className="switch small">
                <input type="checkbox" checked={autoApproveSettings.contractor} onChange={(e) => setAutoApproveSettings(prev => ({ ...prev, contractor: e.target.checked }))} />
                <span className="slider"></span>
              </label>
            </div>
            <h4>Contractors</h4>
            <p>{autoApproveSettings.contractor ? 'Auto-approved' : 'Requires approval'}</p>
          </div>
          <div className={`worker-type-card ${autoApproveSettings.volunteer ? 'enabled' : 'disabled'}`}>
            <div className="worker-type-header">
              <span className="worker-type-icon"><IconWrapper>{Icons.heart}</IconWrapper></span>
              <label className="switch small">
                <input type="checkbox" checked={autoApproveSettings.volunteer} onChange={(e) => setAutoApproveSettings(prev => ({ ...prev, volunteer: e.target.checked }))} />
                <span className="slider"></span>
              </label>
            </div>
            <h4>Volunteers</h4>
            <p>{autoApproveSettings.volunteer ? 'Auto-approved' : 'Requires approval'}</p>
          </div>
        </div>
        <div className="info-box"><strong>Tip:</strong> Contractors and volunteers typically require approval for compliance and audit purposes.</div>
      </div>

      <div className="settings-card compliance-mode-card">
        <div className="card-header"><span className="card-icon"><IconWrapper>{Icons.scale}</IconWrapper></span><div><h2>Compliance Mode</h2><p>Select overtime rules based on your state or customize your own</p></div></div>
        <div className="compliance-options">
          {COMPLIANCE_MODES.map((mode) => (<label key={mode.id} className={`compliance-option ${complianceMode === mode.id ? 'selected' : ''}`}><input type="radio" name="complianceMode" value={mode.id} checked={complianceMode === mode.id} onChange={() => handleComplianceModeChange(mode.id)} /><div className="option-content"><strong>{mode.name}</strong><span>{mode.description}</span></div></label>))}
        </div>
        
        {complianceMode === 'custom' ? (
          <div style={{ marginTop: '20px', padding: '16px', background: '#f8f9fa', borderRadius: '8px' }}>
            <h4 style={{ margin: '0 0 12px', color: '#333', fontSize: '14px', fontWeight: '600' }}>Configure Your Rules:</h4>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px' }}>
              <CustomRuleToggle 
                icon={Icons.clock} 
                label="Daily OT" 
                sublabel={`After ${overtimeSettings.dailyOtThreshold} hours`}
                enabled={toggles.dailyOtEnabled} 
                onChange={(e) => setToggles(prev => ({ ...prev, dailyOtEnabled: e.target.checked }))} 
              />
              <CustomRuleToggle 
                icon={Icons.timer} 
                label="Daily Double Time" 
                sublabel={`After ${overtimeSettings.dailyDtThreshold} hours`}
                enabled={toggles.dailyDtEnabled} 
                onChange={(e) => setToggles(prev => ({ ...prev, dailyDtEnabled: e.target.checked }))} 
              />
              <CustomRuleToggle 
                icon={Icons.calendar} 
                label="Weekly OT" 
                sublabel={`After ${overtimeSettings.weeklyOtThreshold} hours`}
                enabled={toggles.weeklyOtEnabled} 
                onChange={(e) => setToggles(prev => ({ ...prev, weeklyOtEnabled: e.target.checked }))} 
              />
              <CustomRuleToggle 
                icon={Icons.seven} 
                label="7th Day OT" 
                sublabel="Consecutive day rule"
                enabled={toggles.seventhDayOtRule} 
                onChange={(e) => setToggles(prev => ({ ...prev, seventhDayOtRule: e.target.checked }))} 
              />
            </div>
          </div>
        ) : (
          <div style={{ marginTop: '20px', padding: '16px', background: '#f8f9fa', borderRadius: '8px' }}>
            <h4 style={{ margin: '0 0 12px', color: '#333', fontSize: '14px', fontWeight: '600' }}>Active Rules:</h4>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
              <RulePill enabled={toggles.dailyOtEnabled} label={`Daily OT (${overtimeSettings.dailyOtThreshold}hr)`} />
              <RulePill enabled={toggles.dailyDtEnabled} label={`Daily DT (${overtimeSettings.dailyDtThreshold}hr)`} />
              <RulePill enabled={toggles.weeklyOtEnabled} label={`Weekly OT (${overtimeSettings.weeklyOtThreshold}hr)`} />
              <RulePill enabled={toggles.seventhDayOtRule} label="7th Day OT" />
            </div>
          </div>
        )}
      </div>

      <div className="settings-card verification-mode-card">
        <div className="card-header"><span className="card-icon"><IconWrapper>{Icons.shield}</IconWrapper></span><div><h2>Verification Mode</h2><p>Control how strictly the system verifies clock-ins</p></div></div>
        <div className="verification-options">
          <label className={`verification-option ${toggles.verificationMode === 'relaxed' ? 'selected' : ''}`}><input type="radio" name="verificationMode" value="relaxed" checked={toggles.verificationMode === 'relaxed'} onChange={() => handleVerificationModeChange('relaxed')} /><div className="option-content"><strong>Relaxed</strong><span>No verification - just track time</span></div></label>
          <label className={`verification-option ${toggles.verificationMode === 'balanced' ? 'selected' : ''}`}><input type="radio" name="verificationMode" value="balanced" checked={toggles.verificationMode === 'balanced'} onChange={() => handleVerificationModeChange('balanced')} /><div className="option-content"><strong>Balanced</strong><span>Verify and flag issues for review</span></div></label>
          <label className={`verification-option ${toggles.verificationMode === 'strict' ? 'selected' : ''}`}><input type="radio" name="verificationMode" value="strict" checked={toggles.verificationMode === 'strict'} onChange={() => handleVerificationModeChange('strict')} /><div className="option-content"><strong>Strict</strong><span>Block workers if verification fails</span></div></label>
        </div>
        <div className="info-box"><strong>Current mode:</strong> {toggles.verificationMode === 'relaxed' ? 'Workers can clock in without verification.' : toggles.verificationMode === 'balanced' ? 'Failed verifications are flagged but workers can still clock in.' : 'Workers are blocked if GPS or facial recognition fails.'}</div>
      </div>

      <div className="settings-card">
        <div className="card-header"><span className="card-icon"><IconWrapper>{Icons.sliders}</IconWrapper></span><div><h2>Feature Toggles</h2><p>Enable or disable specific features</p></div></div>
        <div className="toggles-grid">
          <div className="toggle-row"><div className="toggle-info"><strong><IconWrapper>{Icons.camera}</IconWrapper> Photo Capture</strong><span>Require photo on clock-in/out</span></div><label className="switch"><input type="checkbox" checked={toggles.photoCapture} onChange={(e) => setToggles(prev => ({ ...prev, photoCapture: e.target.checked }))} /><span className="slider"></span></label></div>
          <div className="toggle-row"><div className="toggle-info"><strong><IconWrapper>{Icons.users}</IconWrapper> Facial Recognition</strong><span>Verify worker identity with face match</span></div><select value={toggles.facialRecognition} onChange={(e) => setToggles(prev => ({ ...prev, facialRecognition: e.target.value }))} className="toggle-select"><option value="off">Off</option><option value="soft">Soft (flag only)</option><option value="strict">Strict (block)</option></select></div>
          <div className="toggle-row"><div className="toggle-info"><strong><IconWrapper>{Icons.mapPin}</IconWrapper> GPS Geofencing</strong><span>Verify worker is at job site</span></div><select value={toggles.gpsGeofencing} onChange={(e) => setToggles(prev => ({ ...prev, gpsGeofencing: e.target.value }))} className="toggle-select"><option value="off">Off</option><option value="soft">Soft (flag only)</option><option value="strict">Strict (block)</option></select></div>
          <div className="toggle-row"><div className="toggle-info"><strong><IconWrapper>{Icons.building}</IconWrapper> Job-Based Tracking</strong><span>Assign time entries to specific jobs</span></div><label className="switch"><input type="checkbox" checked={toggles.jobBasedTracking} onChange={(e) => setToggles(prev => ({ ...prev, jobBasedTracking: e.target.checked }))} /><span className="slider"></span></label></div>
          <div className="toggle-row"><div className="toggle-info"><strong><IconWrapper>{Icons.calendar}</IconWrapper> Shift Scheduling</strong><span>Create and manage worker schedules</span></div><label className="switch"><input type="checkbox" checked={toggles.shiftScheduling} onChange={(e) => setToggles(prev => ({ ...prev, shiftScheduling: e.target.checked }))} /><span className="slider"></span></label></div>
          <div className="toggle-row"><div className="toggle-info"><strong><IconWrapper>{Icons.clock}</IconWrapper> Early Clock-In Restriction</strong><span>Prevent clocking in too early</span></div><select value={toggles.earlyClockInRestriction} onChange={(e) => setToggles(prev => ({ ...prev, earlyClockInRestriction: e.target.value }))} className="toggle-select" disabled={!toggles.shiftScheduling}><option value="off">Off</option><option value="soft">Soft (flag only)</option><option value="strict">Strict (block)</option></select></div>
          <div className="toggle-row"><div className="toggle-info"><strong><IconWrapper>{Icons.timer}</IconWrapper> Auto Clock-Out</strong><span>Automatically clock out after max hours</span></div><label className="switch"><input type="checkbox" checked={toggles.autoClockOut} onChange={(e) => setToggles(prev => ({ ...prev, autoClockOut: e.target.checked }))} /><span className="slider"></span></label></div>
          <div className="toggle-row"><div className="toggle-info"><strong><IconWrapper>{Icons.coffee}</IconWrapper> Break Tracking</strong><span>Track meal and rest breaks</span></div><label className="switch"><input type="checkbox" checked={toggles.breakTracking} onChange={(e) => setToggles(prev => ({ ...prev, breakTracking: e.target.checked }))} /><span className="slider"></span></label></div>
          <div className="toggle-row"><div className="toggle-info"><strong><IconWrapper>{Icons.dollar}</IconWrapper> Break Compliance Penalties</strong><span>Calculate penalty pay for missed breaks</span></div><label className="switch"><input type="checkbox" checked={toggles.breakCompliancePenalties} onChange={(e) => setToggles(prev => ({ ...prev, breakCompliancePenalties: e.target.checked }))} disabled={!toggles.breakTracking} /><span className="slider"></span></label></div>
          <div className="toggle-row"><div className="toggle-info"><strong><IconWrapper>{Icons.timer}</IconWrapper> Overtime Calculations</strong><span>Auto-calculate OT and double time</span></div><label className="switch"><input type="checkbox" checked={toggles.overtimeCalculations} onChange={(e) => setToggles(prev => ({ ...prev, overtimeCalculations: e.target.checked }))} /><span className="slider"></span></label></div>
          <div className="toggle-row"><div className="toggle-info"><strong><IconWrapper>{Icons.calendar}</IconWrapper> Leave Management</strong><span>Track PTO, sick leave, and time off</span></div><label className="switch"><input type="checkbox" checked={toggles.leaveManagement} onChange={(e) => setToggles(prev => ({ ...prev, leaveManagement: e.target.checked }))} /><span className="slider"></span></label></div>
          <div className="toggle-row"><div className="toggle-info"><strong><IconWrapper>{Icons.users}</IconWrapper> Worker Self-Service Edits</strong><span>Allow workers to request time edits</span></div><select value={toggles.workerSelfServiceEdits} onChange={(e) => setToggles(prev => ({ ...prev, workerSelfServiceEdits: e.target.value }))} className="toggle-select"><option value="strict">Off (admin only)</option><option value="soft">On (requires approval)</option></select></div>
          <div className="toggle-row"><div className="toggle-info"><strong><IconWrapper>{Icons.alert}</IconWrapper> Buddy Punch Alerts</strong><span>Email admins on failed face verification</span></div><label className="switch"><input type="checkbox" checked={toggles.buddyPunchAlerts} onChange={(e) => setToggles(prev => ({ ...prev, buddyPunchAlerts: e.target.checked }))} /><span className="slider"></span></label></div>
        </div>
      </div>

      <div className="settings-card">
        <div className="card-header"><span className="card-icon"><IconWrapper>{Icons.building}</IconWrapper></span><div><h2>Company Information</h2><p>Basic company details used in reports and payroll</p></div></div>
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
        <div className="card-header"><span className="card-icon"><IconWrapper>{Icons.dollar}</IconWrapper></span><div><h2>Default Pay Rate</h2><p>Default hourly rate for new workers</p></div></div>
        <div className="form-grid"><div className="form-group"><label>Default Hourly Rate ($)</label><input type="number" step="0.01" min="0" value={companyData.defaultHourlyRate} onChange={(e) => handleChange('defaultHourlyRate', e.target.value)} placeholder="25.00" /></div></div>
      </div>

      <div className="settings-card">
        <div className="card-header"><span className="card-icon"><IconWrapper>{Icons.timer}</IconWrapper></span><div><h2>Time & Attendance Config</h2><p>Configure time tracking parameters</p></div></div>
        <div className="form-grid">
          <div className="form-group"><label>Max Shift Length (hours)</label><input type="number" step="0.5" min="1" max="24" value={toggles.maxShiftHours} onChange={(e) => setToggles(prev => ({ ...prev, maxShiftHours: e.target.value }))} /><small>Auto clock-out after this many hours</small></div>
          <div className="form-group"><label>Early Clock-In Window (minutes)</label><input type="number" min="0" max="60" value={toggles.earlyClockInMinutes} onChange={(e) => setToggles(prev => ({ ...prev, earlyClockInMinutes: e.target.value }))} /><small>How early workers can clock in</small></div>
        </div>
      </div>

      {toggles.overtimeCalculations && complianceMode === 'custom' && (
        <div className="settings-card">
          <div className="card-header"><span className="card-icon"><IconWrapper>{Icons.clock}</IconWrapper></span><div><h2>Custom Overtime Rules</h2><p>Configure your custom overtime thresholds</p></div></div>
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
          <div className="card-header"><span className="card-icon"><IconWrapper>{Icons.coffee}</IconWrapper></span><div><h2>Break Compliance</h2><p>Meal and rest break requirements</p></div></div>
          <div className="form-grid">
            <div className="form-group"><label>State Regulations</label><select value={breakSettings.state} onChange={(e) => setBreakSettings(prev => ({ ...prev, state: e.target.value }))}><option value="CA">California</option><option value="WA">Washington</option><option value="OR">Oregon</option><option value="OTHER">Federal (Other States)</option></select></div>
            <div className="form-group"><label>Meal Break After (hours)</label><input type="number" value={breakSettings.mealBreakThreshold} onChange={(e) => setBreakSettings(prev => ({ ...prev, mealBreakThreshold: e.target.value }))} /></div>
            <div className="form-group"><label>Meal Break Duration (min)</label><input type="number" value={breakSettings.mealBreakDuration} onChange={(e) => setBreakSettings(prev => ({ ...prev, mealBreakDuration: e.target.value }))} /></div>
            {toggles.breakCompliancePenalties && <div className="form-group"><label>Violation Penalty (hours pay)</label><input type="number" step="0.5" value={breakSettings.penaltyRate} onChange={(e) => setBreakSettings(prev => ({ ...prev, penaltyRate: e.target.value }))} /></div>}
          </div>
        </div>
      )}

      <button className="btn-save" onClick={handleSave} disabled={saving}><IconWrapper>{Icons.save}</IconWrapper> {saving ? 'Saving...' : 'Save Settings'}</button>
    </div>
  );
}

export default SettingsPage;