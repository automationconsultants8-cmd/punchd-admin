// ============================================
// FILE: src/components/TrialExpiredPaywall.jsx (ADMIN DASHBOARD)
// ACTION: CREATE NEW FILE
// ============================================

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { billingApi } from '../services/api';
import './TrialExpiredPaywall.css';

function TrialExpiredPaywall({ onLogout }) {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const handleUpgrade = async (planId) => {
    setLoading(true);
    try {
      const response = await billingApi.createCheckoutSession(planId, 'yearly', 10);
      window.location.href = response.data.url;
    } catch (err) {
      console.error('Failed to create checkout:', err);
      alert('Failed to start checkout. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoToBilling = () => {
    navigate('/billing');
  };

  return (
    <div className="trial-expired-paywall">
      <div className="paywall-container">
        <div className="paywall-icon">⏰</div>
        <h1>Your Free Trial Has Ended</h1>
        <p className="paywall-subtitle">
          Your 14-day trial is over. Upgrade now to continue tracking time, managing workers, and staying compliant.
        </p>

        <div className="paywall-plans">
          <div className="paywall-plan">
            <h3>Starter</h3>
            <div className="paywall-price">
              <span className="amount">$6</span>
              <span className="period">/user/mo</span>
            </div>
            <p>GPS tracking, basic reports</p>
            <button 
              className="paywall-btn secondary"
              onClick={() => handleUpgrade('starter')}
              disabled={loading}
            >
              Choose Starter
            </button>
          </div>

          <div className="paywall-plan popular">
            <div className="popular-badge">Most Popular</div>
            <h3>Professional</h3>
            <div className="paywall-price">
              <span className="amount">$10</span>
              <span className="period">/user/mo</span>
            </div>
            <p>Face verification, scheduling, compliance</p>
            <button 
              className="paywall-btn primary"
              onClick={() => handleUpgrade('professional')}
              disabled={loading}
            >
              {loading ? 'Loading...' : 'Choose Professional'}
            </button>
          </div>

          <div className="paywall-plan">
            <h3>Contractor</h3>
            <div className="paywall-price">
              <span className="amount">$15</span>
              <span className="period">/user/mo</span>
            </div>
            <p>Certified payroll WH-347, audit logs</p>
            <button 
              className="paywall-btn secondary"
              onClick={() => handleUpgrade('contractor')}
              disabled={loading}
            >
              Choose Contractor
            </button>
          </div>
        </div>

        <button className="paywall-see-all" onClick={handleGoToBilling}>
          Compare all plans →
        </button>

        <div className="paywall-footer">
          <p>Questions? Contact us at <a href="mailto:krynovo@gmail.com">krynovo@gmail.com</a></p>
          <button className="paywall-logout" onClick={onLogout}>
            Log out
          </button>
        </div>
      </div>
    </div>
  );
}

export default TrialExpiredPaywall;