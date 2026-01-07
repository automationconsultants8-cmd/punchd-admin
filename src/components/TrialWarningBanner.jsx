// ============================================
// FILE: src/components/TrialWarningBanner.jsx (ADMIN DASHBOARD)
// ACTION: CREATE NEW FILE
// ============================================

import { useNavigate } from 'react-router-dom';
import './TrialWarningBanner.css';

function TrialWarningBanner({ daysRemaining }) {
  const navigate = useNavigate();

  if (daysRemaining === null || daysRemaining > 2) {
    return null;
  }

  const message = daysRemaining === 0 
    ? "Your trial expires today!"
    : daysRemaining === 1 
      ? "Your trial expires tomorrow!"
      : `Your trial expires in ${daysRemaining} days`;

  return (
    <div className="trial-warning-banner">
      <div className="trial-warning-content">
        <span className="trial-warning-icon">⚠️</span>
        <span className="trial-warning-text">
          {message} Upgrade now to keep access to all features.
        </span>
        <button 
          className="trial-warning-btn"
          onClick={() => navigate('/billing')}
        >
          Upgrade Now
        </button>
      </div>
    </div>
  );
}

export default TrialWarningBanner;