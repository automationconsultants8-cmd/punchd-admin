import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { companyApi, jobsApi, usersApi } from '../services/api';
import './OnboardingPage.css';

const TOTAL_STEPS = 6;

function OnboardingPage() {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  
  const [data, setData] = useState({
    // Step 1: Address
    address: '',
    city: '',
    state: '',
    zip: '',
    // Step 2: Job-based tracking
    jobBasedTracking: true,
    // Step 3: Shift scheduling
    shiftScheduling: false,
    // Step 4: Verification mode
    verificationMode: 'balanced',
    // Step 5: Pay rate
    defaultHourlyRate: '',
    // Step 6: First job or worker
    firstJobName: '',
    firstJobAddress: '',
    firstWorkerName: '',
    firstWorkerPhone: '',
  });

  const updateData = (field, value) => {
    setData(prev => ({ ...prev, [field]: value }));
    setError('');
  };

  const nextStep = () => {
    if (currentStep < TOTAL_STEPS) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const skipStep = () => {
    nextStep();
  };

  const handleComplete = async () => {
    setSaving(true);
    setError('');

    try {
      const facialRecognition = data.verificationMode === 'relaxed' ? 'off' : data.verificationMode === 'balanced' ? 'soft' : 'strict';
      const gpsGeofencing = data.verificationMode === 'relaxed' ? 'off' : data.verificationMode === 'balanced' ? 'soft' : 'strict';
      const isCA = data.state.toUpperCase() === 'CA';

      await companyApi.update({
        address: data.address,
        city: data.city,
        state: data.state,
        zip: data.zip,
        defaultHourlyRate: data.defaultHourlyRate ? parseFloat(data.defaultHourlyRate) : null,
        settings: {
          verificationMode: data.verificationMode,
          facialRecognition,
          gpsGeofencing,
          earlyClockInRestriction: data.shiftScheduling ? 'soft' : 'off',
          jobBasedTracking: data.jobBasedTracking,
          shiftScheduling: data.shiftScheduling,
          photoCapture: data.verificationMode !== 'relaxed',
          breakTracking: true,
          breakCompliancePenalties: isCA,
          overtimeCalculations: true,
          seventhDayOtRule: isCA,
          autoClockOut: true,
          leaveManagement: false,
          workerSelfServiceEdits: 'soft',
          buddyPunchAlerts: true,
          maxShiftHours: 16,
          earlyClockInMinutes: 15,
          onboardingCompletedAt: new Date().toISOString(),
          learningModeEndsAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        },
        breakComplianceSettings: {
          enabled: true,
          state: isCA ? 'CA' : 'OTHER',
          mealBreakThreshold: 300,
          mealBreakDuration: 30,
          penaltyRate: 1,
        },
      });

      if (data.jobBasedTracking && data.firstJobName) {
        try {
          await jobsApi.create({
            name: data.firstJobName,
            address: data.firstJobAddress || data.address,
            geofenceCenter: '37.3382,-121.8863',
            geofenceRadiusMeters: 100,
          });
        } catch (e) {
          console.error('Failed to create first job:', e);
        }
      }

      if (data.firstWorkerName && data.firstWorkerPhone) {
        try {
          await usersApi.create({
            name: data.firstWorkerName,
            phone: data.firstWorkerPhone,
            role: 'WORKER',
          });
        } catch (e) {
          console.error('Failed to create first worker:', e);
        }
      }

      navigate('/dashboard');
    } catch (err) {
      console.error('Onboarding error:', err);
      setError(err.response?.data?.message || 'Failed to save. Please try again.');
    }
    setSaving(false);
  };

  const handleSkipOnboarding = async () => {
    try {
      await companyApi.update({
        settings: {
          onboardingSkippedAt: new Date().toISOString(),
        },
      });
      navigate('/dashboard');
    } catch (err) {
      navigate('/dashboard');
    }
  };

  const canProceed = () => {
    return true;
  };

  return (
    <div className="onboarding-page">
      <div className="onboarding-container">
        {/* Header */}
        <div className="onboarding-header">
          <div className="onboarding-logo">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 2L3 7V12C3 17.5 7.5 22 12 22C16.5 22 21 17.5 21 12V7L12 2Z" fill="#C9A227"/>
              <circle cx="12" cy="12" r="5" stroke="white" strokeWidth="1.5" fill="none"/>
              <path d="M12 9V12L14 14" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <span>Punch'd</span>
          </div>
          <button className="skip-button" onClick={handleSkipOnboarding}>
            Skip for now
          </button>
        </div>

        {/* Progress */}
        <div className="onboarding-progress">
          <div className="progress-bar">
            <div 
              className="progress-fill" 
              style={{ width: `${(currentStep / TOTAL_STEPS) * 100}%` }}
            />
          </div>
          <span className="progress-text">Step {currentStep} of {TOTAL_STEPS}</span>
        </div>

        {/* Content */}
        <div className="onboarding-content">
          {error && (
            <div className="onboarding-error">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="12" cy="12" r="10" stroke="#dc3545" strokeWidth="2"/>
                <path d="M12 8V12M12 16H12.01" stroke="#dc3545" strokeWidth="2" strokeLinecap="round"/>
              </svg>
              {error}
            </div>
          )}

          {/* Step 1: Address */}
          {currentStep === 1 && (
            <div className="step-content">
              <div className="step-icon">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 13C13.6569 13 15 11.6569 15 10C15 8.34315 13.6569 7 12 7C10.3431 7 9 8.34315 9 10C9 11.6569 10.3431 13 12 13Z" stroke="#C9A227" strokeWidth="2"/>
                  <path d="M12 22C16 18 20 14.4183 20 10C20 5.58172 16.4183 2 12 2C7.58172 2 4 5.58172 4 10C4 14.4183 8 18 12 22Z" stroke="#C9A227" strokeWidth="2"/>
                </svg>
              </div>
              <h1>Welcome to Punch'd!</h1>
              <p>Let's get your account set up. First, where are you located? This helps us apply the right labor laws.</p>
              
              <div className="form-field">
                <label>Street Address</label>
                <input
                  type="text"
                  value={data.address}
                  onChange={(e) => updateData('address', e.target.value)}
                  placeholder="123 Main Street"
                  autoFocus
                />
              </div>
              
              <div className="form-row">
                <div className="form-field">
                  <label>City</label>
                  <input
                    type="text"
                    value={data.city}
                    onChange={(e) => updateData('city', e.target.value)}
                    placeholder="San Jose"
                  />
                </div>
                <div className="form-field small">
                  <label>State</label>
                  <input
                    type="text"
                    value={data.state}
                    onChange={(e) => updateData('state', e.target.value.toUpperCase())}
                    placeholder="CA"
                    maxLength="2"
                  />
                </div>
                <div className="form-field small">
                  <label>ZIP</label>
                  <input
                    type="text"
                    value={data.zip}
                    onChange={(e) => updateData('zip', e.target.value)}
                    placeholder="95123"
                    maxLength="10"
                  />
                </div>
              </div>

              {data.state.toUpperCase() === 'CA' && (
                <div className="info-callout">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <circle cx="12" cy="12" r="10" stroke="#C9A227" strokeWidth="2"/>
                    <path d="M12 16V12M12 8H12.01" stroke="#C9A227" strokeWidth="2" strokeLinecap="round"/>
                  </svg>
                  <span>California detected! We'll automatically enable CA-specific overtime and break rules.</span>
                </div>
              )}
            </div>
          )}

          {/* Step 2: Job-based tracking */}
          {currentStep === 2 && (
            <div className="step-content">
              <div className="step-icon">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M9 5H7C5.89543 5 5 5.89543 5 7V19C5 20.1046 5.89543 21 7 21H17C18.1046 21 19 20.1046 19 19V7C19 5.89543 18.1046 5 17 5H15" stroke="#C9A227" strokeWidth="2"/>
                  <path d="M9 5C9 3.89543 9.89543 3 11 3H13C14.1046 3 15 3.89543 15 5C15 6.10457 14.1046 7 13 7H11C9.89543 7 9 6.10457 9 5Z" stroke="#C9A227" strokeWidth="2"/>
                  <path d="M9 12H15M9 16H12" stroke="#C9A227" strokeWidth="2" strokeLinecap="round"/>
                </svg>
              </div>
              <h1>How do you track work?</h1>
              <p>Do your workers clock in to specific job sites or locations?</p>
              
              <div className="option-cards">
                <label className={`option-card ${data.jobBasedTracking ? 'selected' : ''}`}>
                  <input
                    type="radio"
                    name="jobTracking"
                    checked={data.jobBasedTracking}
                    onChange={() => updateData('jobBasedTracking', true)}
                  />
                  <div className="option-icon">
                    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M12 13C13.6569 13 15 11.6569 15 10C15 8.34315 13.6569 7 12 7C10.3431 7 9 8.34315 9 10C9 11.6569 10.3431 13 12 13Z" stroke="currentColor" strokeWidth="2"/>
                      <path d="M12 22C16 18 20 14.4183 20 10C20 5.58172 16.4183 2 12 2C7.58172 2 4 5.58172 4 10C4 14.4183 8 18 12 22Z" stroke="currentColor" strokeWidth="2"/>
                    </svg>
                  </div>
                  <div className="option-text">
                    <strong>Yes, by job site</strong>
                    <span>Workers clock in to specific locations with GPS verification</span>
                  </div>
                </label>

                <label className={`option-card ${!data.jobBasedTracking ? 'selected' : ''}`}>
                  <input
                    type="radio"
                    name="jobTracking"
                    checked={!data.jobBasedTracking}
                    onChange={() => updateData('jobBasedTracking', false)}
                  />
                  <div className="option-icon">
                    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/>
                      <path d="M12 6V12L16 14" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                    </svg>
                  </div>
                  <div className="option-text">
                    <strong>No, just track hours</strong>
                    <span>Workers clock in without job assignment</span>
                  </div>
                </label>
              </div>
            </div>
          )}

          {/* Step 3: Shift scheduling */}
          {currentStep === 3 && (
            <div className="step-content">
              <div className="step-icon">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <rect x="3" y="4" width="18" height="18" rx="2" stroke="#C9A227" strokeWidth="2"/>
                  <path d="M3 10H21" stroke="#C9A227" strokeWidth="2"/>
                  <path d="M8 2V6M16 2V6" stroke="#C9A227" strokeWidth="2" strokeLinecap="round"/>
                  <path d="M7 14H10M14 14H17M7 18H10" stroke="#C9A227" strokeWidth="2" strokeLinecap="round"/>
                </svg>
              </div>
              <h1>Do you schedule shifts?</h1>
              <p>Do you create schedules for workers ahead of time?</p>
              
              <div className="option-cards">
                <label className={`option-card ${data.shiftScheduling ? 'selected' : ''}`}>
                  <input
                    type="radio"
                    name="scheduling"
                    checked={data.shiftScheduling}
                    onChange={() => updateData('shiftScheduling', true)}
                  />
                  <div className="option-icon">
                    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <rect x="3" y="4" width="18" height="18" rx="2" stroke="currentColor" strokeWidth="2"/>
                      <path d="M3 10H21" stroke="currentColor" strokeWidth="2"/>
                      <path d="M9 16L11 18L15 14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </div>
                  <div className="option-text">
                    <strong>Yes, I create schedules</strong>
                    <span>Assign shifts, track attendance, prevent early clock-ins</span>
                  </div>
                </label>

                <label className={`option-card ${!data.shiftScheduling ? 'selected' : ''}`}>
                  <input
                    type="radio"
                    name="scheduling"
                    checked={!data.shiftScheduling}
                    onChange={() => updateData('shiftScheduling', false)}
                  />
                  <div className="option-icon">
                    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/>
                      <path d="M12 6V12L16 14" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                    </svg>
                  </div>
                  <div className="option-text">
                    <strong>No, workers clock in freely</strong>
                    <span>No schedule restrictions</span>
                  </div>
                </label>
              </div>
            </div>
          )}

          {/* Step 4: Verification mode */}
          {currentStep === 4 && (
            <div className="step-content">
              <div className="step-icon">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 22C12 22 20 18 20 12V5L12 2L4 5V12C4 18 12 22 12 22Z" stroke="#C9A227" strokeWidth="2"/>
                  <path d="M9 12L11 14L15 10" stroke="#C9A227" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <h1>How strict should verification be?</h1>
              <p>Control how the system handles GPS and facial recognition checks.</p>
              
              <div className="option-cards vertical">
                <label className={`option-card ${data.verificationMode === 'relaxed' ? 'selected' : ''}`}>
                  <input
                    type="radio"
                    name="verification"
                    checked={data.verificationMode === 'relaxed'}
                    onChange={() => updateData('verificationMode', 'relaxed')}
                  />
                  <div className="option-content-row">
                    <div className="option-badge relaxed">Relaxed</div>
                    <div className="option-text">
                      <strong>No verification</strong>
                      <span>Just track time, no GPS or photo requirements</span>
                    </div>
                  </div>
                </label>

                <label className={`option-card ${data.verificationMode === 'balanced' ? 'selected' : ''}`}>
                  <input
                    type="radio"
                    name="verification"
                    checked={data.verificationMode === 'balanced'}
                    onChange={() => updateData('verificationMode', 'balanced')}
                  />
                  <div className="option-content-row">
                    <div className="option-badge balanced">Balanced</div>
                    <div className="option-text">
                      <strong>Verify and flag issues</strong>
                      <span>Workers can clock in, but problems are flagged for review</span>
                    </div>
                  </div>
                  <div className="recommended-badge">Recommended</div>
                </label>

                <label className={`option-card ${data.verificationMode === 'strict' ? 'selected' : ''}`}>
                  <input
                    type="radio"
                    name="verification"
                    checked={data.verificationMode === 'strict'}
                    onChange={() => updateData('verificationMode', 'strict')}
                  />
                  <div className="option-content-row">
                    <div className="option-badge strict">Strict</div>
                    <div className="option-text">
                      <strong>Block if verification fails</strong>
                      <span>Workers cannot clock in if GPS or face check fails</span>
                    </div>
                  </div>
                </label>
              </div>
            </div>
          )}

          {/* Step 5: Pay rate */}
          {currentStep === 5 && (
            <div className="step-content">
              <div className="step-icon">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <circle cx="12" cy="12" r="10" stroke="#C9A227" strokeWidth="2"/>
                  <path d="M12 6V18M15 9.5C15 8.11929 13.6569 7 12 7C10.3431 7 9 8.11929 9 9.5C9 10.8807 10.3431 12 12 12C13.6569 12 15 13.1193 15 14.5C15 15.8807 13.6569 17 12 17C10.3431 17 9 15.8807 9 14.5" stroke="#C9A227" strokeWidth="2" strokeLinecap="round"/>
                </svg>
              </div>
              <h1>What's your default pay rate?</h1>
              <p>You can set different rates per worker or job later.</p>
              
              <div className="form-field">
                <label>Default Hourly Rate</label>
                <div className="input-with-prefix">
                  <span className="prefix">$</span>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={data.defaultHourlyRate}
                    onChange={(e) => updateData('defaultHourlyRate', e.target.value)}
                    placeholder="25.00"
                  />
                </div>
                <small>Leave blank to set per-worker rates only</small>
              </div>
            </div>
          )}

          {/* Step 6: First job or worker */}
          {currentStep === 6 && (
            <div className="step-content">
              <div className="step-icon">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 15C15.866 15 19 11.866 19 8C19 4.13401 15.866 1 12 1C8.13401 1 5 4.13401 5 8C5 11.866 8.13401 15 12 15Z" stroke="#C9A227" strokeWidth="2"/>
                  <path d="M8.21 13.89L7 23L12 20L17 23L15.79 13.88" stroke="#C9A227" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <h1>Almost done! Add your first {data.jobBasedTracking ? 'job site' : 'worker'}</h1>
              <p>You can skip this and add {data.jobBasedTracking ? 'jobs' : 'workers'} later from the dashboard.</p>
              
              {data.jobBasedTracking ? (
                <>
                  <div className="form-field">
                    <label>Job Site Name</label>
                    <input
                      type="text"
                      value={data.firstJobName}
                      onChange={(e) => updateData('firstJobName', e.target.value)}
                      placeholder="Downtown Office Building"
                    />
                  </div>
                  <div className="form-field">
                    <label>Job Site Address</label>
                    <input
                      type="text"
                      value={data.firstJobAddress}
                      onChange={(e) => updateData('firstJobAddress', e.target.value)}
                      placeholder="456 Work Street, San Jose, CA"
                    />
                    <small>Used for GPS verification when workers clock in</small>
                  </div>
                </>
              ) : (
                <>
                  <div className="form-field">
                    <label>Worker Name</label>
                    <input
                      type="text"
                      value={data.firstWorkerName}
                      onChange={(e) => updateData('firstWorkerName', e.target.value)}
                      placeholder="John Smith"
                    />
                  </div>
                  <div className="form-field">
                    <label>Phone Number</label>
                    <input
                      type="tel"
                      value={data.firstWorkerPhone}
                      onChange={(e) => updateData('firstWorkerPhone', e.target.value)}
                      placeholder="(555) 123-4567"
                    />
                    <small>Workers use their phone number to log in</small>
                  </div>
                </>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="onboarding-footer">
          {currentStep > 1 && (
            <button className="btn-back" onClick={prevStep}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M15 18L9 12L15 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              Back
            </button>
          )}
          
          <div className="footer-right">
            {[1, 5, 6].includes(currentStep) && (
              <button className="btn-skip" onClick={skipStep}>
                Skip
              </button>
            )}
            
            {currentStep < TOTAL_STEPS ? (
              <button 
                className="btn-next" 
                onClick={nextStep}
                disabled={!canProceed()}
              >
                Continue
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M9 18L15 12L9 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>
            ) : (
              <button 
                className="btn-finish" 
                onClick={handleComplete}
                disabled={saving}
              >
                {saving ? 'Setting up...' : 'Finish Setup'}
                {!saving && (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M5 12L10 17L20 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default OnboardingPage;