import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { billingApi } from '../services/api';
import './BillingPage.css';

const PLANS = [
  {
    id: 'starter',
    name: 'Starter',
    pricePerUser: 4,
    yearlyPricePerUser: 3,
    minimumUsers: 10,
    minimumMonthly: 40,
    setupFee: 99,
    description: 'For small crews getting started',
    features: [
      'Up to 25 workers',
      'Clock in/out with GPS',
      'Basic timesheets',
      'Mobile app (iOS & Android)',
      'Job site management',
      'Email support',
    ],
    notIncluded: [
      'Face verification',
      'Photo capture',
      'Geofencing alerts',
      'Cost analytics',
      'Excel/PDF exports',
      'Shift scheduling',
    ],
    popular: false,
  },
  {
    id: 'professional',
    name: 'Professional',
    pricePerUser: 6,
    yearlyPricePerUser: 5,
    minimumUsers: 10,
    minimumMonthly: 60,
    setupFee: 199,
    description: 'Most popular for growing teams',
    features: [
      'Up to 100 workers',
      'Everything in Starter, plus:',
      'Face verification (AI-powered)',
      'Photo capture on clock in/out',
      'Geofencing & location alerts',
      'Cost analytics dashboard',
      'Excel & PDF exports',
      'Shift scheduling',
      'Priority email & chat support',
    ],
    notIncluded: [
      'Audit logs',
      'API access',
      'Custom integrations',
      'Dedicated account manager',
    ],
    popular: true,
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    pricePerUser: 9,
    yearlyPricePerUser: 7,
    minimumUsers: 25,
    minimumMonthly: 225,
    setupFee: 0,
    description: 'For large operations',
    features: [
      'Unlimited workers',
      'Everything in Professional, plus:',
      'Complete audit trail',
      'API access',
      'Custom integrations',
      'Dedicated account manager',
      'Custom onboarding & training',
      'SSO / SAML authentication',
      'SLA guarantee (99.9% uptime)',
      'Phone support',
    ],
    notIncluded: [],
    popular: false,
  },
];

const PLAN_COLORS = {
  starter: '#3b82f6',
  professional: '#a855f7',
  enterprise: '#f59e0b',
};

function BillingPage() {
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [billingCycle, setBillingCycle] = useState('yearly');
  const [workerCount, setWorkerCount] = useState(25);

  const success = searchParams.get('success');
  const canceled = searchParams.get('canceled');

  useEffect(() => {
    loadStatus();
  }, []);

  const loadStatus = async () => {
    try {
      const response = await billingApi.getStatus();
      setStatus(response.data);
      // Set initial worker count from actual count if available
      if (response.data.workerCount) {
        setWorkerCount(Math.max(response.data.workerCount, 10));
      }
    } catch (err) {
      console.error('Failed to load billing status:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectPlan = async (planId) => {
    setActionLoading(true);
    try {
      const response = await billingApi.createCheckoutSession(planId, billingCycle, workerCount);
      window.location.href = response.data.url;
    } catch (err) {
      console.error('Failed to create checkout session:', err);
      alert('Failed to start checkout. Please try again.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleManageBilling = async () => {
    setActionLoading(true);
    try {
      const response = await billingApi.createPortalSession();
      window.location.href = response.data.url;
    } catch (err) {
      console.error('Failed to create portal session:', err);
      alert('Failed to open billing portal. Please try again.');
    } finally {
      setActionLoading(false);
    }
  };

  const getMonthlyPrice = (plan) => {
    const pricePerUser = billingCycle === 'monthly' ? plan.pricePerUser : plan.yearlyPricePerUser;
    const calculatedPrice = pricePerUser * workerCount;
    return Math.max(calculatedPrice, plan.minimumMonthly);
  };

  const getAnnualSavings = (plan) => {
    const monthlyTotal = plan.pricePerUser * Math.max(workerCount, plan.minimumUsers) * 12;
    const yearlyTotal = plan.yearlyPricePerUser * Math.max(workerCount, plan.minimumUsers) * 12;
    return monthlyTotal - yearlyTotal + plan.setupFee;
  };

  if (loading) {
    return (
      <div className="billing-page">
        <div className="loading">Loading billing information...</div>
      </div>
    );
  }

  const currentTier = status?.tier || 'trial';
  const isCurrentPlan = (planId) => currentTier.toLowerCase() === planId.toLowerCase();
  const isPaidUser = ['starter', 'professional', 'enterprise'].includes(currentTier.toLowerCase());

  return (
    <div className="billing-page">
      <div className="billing-header">
        <h1>Simple, Transparent Pricing</h1>
        <p>No hidden fees. No surprises. Cancel anytime.</p>

        {success && (
          <div className="alert success">
            🎉 Payment successful! Your subscription is now active.
          </div>
        )}

        {canceled && (
          <div className="alert warning">
            Payment was canceled. You can try again when ready.
          </div>
        )}

        {status?.tier === 'trial' && (
          <div className="current-plan-banner trial">
            <span>🎁 14-Day Free Trial - Full Access to Professional Features</span>
            {status?.trialEndsAt && (
              <span className="trial-ends">
                Trial ends {new Date(status.trialEndsAt).toLocaleDateString()}
              </span>
            )}
          </div>
        )}

        {isPaidUser && (
          <div className="current-plan-banner active">
            <span>✓ Current Plan: {currentTier.charAt(0).toUpperCase() + currentTier.slice(1)}</span>
            <button className="manage-btn" onClick={handleManageBilling} disabled={actionLoading}>
              ⚙️ Manage Subscription
            </button>
          </div>
        )}
      </div>

      <div className="pricing-controls">
        <div className="billing-toggle">
          <button
            className={billingCycle === 'monthly' ? 'active' : ''}
            onClick={() => setBillingCycle('monthly')}
          >
            Monthly
          </button>
          <button
            className={billingCycle === 'yearly' ? 'active' : ''}
            onClick={() => setBillingCycle('yearly')}
          >
            Annual
            <span className="save-badge">Save 20% + No Setup Fee</span>
          </button>
        </div>

        <div className="worker-slider">
          <label>How many workers? <strong>{workerCount}</strong></label>
          <input
            type="range"
            min="5"
            max="150"
            value={workerCount}
            onChange={(e) => setWorkerCount(parseInt(e.target.value))}
          />
          <div className="slider-labels">
            <span>5</span>
            <span>75</span>
            <span>150+</span>
          </div>
        </div>
      </div>

      <div className="plans-grid">
        {PLANS.map((plan) => (
          <div
            key={plan.id}
            className={`plan-card ${plan.popular ? 'popular' : ''} ${isCurrentPlan(plan.id) ? 'current' : ''}`}
            style={{ '--plan-color': PLAN_COLORS[plan.id] }}
          >
            {plan.popular && <div className="popular-badge">Most Popular</div>}
            {isCurrentPlan(plan.id) && <div className="current-badge">Current Plan</div>}

            <div className="plan-header">
              <h3>{plan.name}</h3>
              <p className="plan-description">{plan.description}</p>
            </div>

            <div className="plan-price">
              <span className="currency">$</span>
              <span className="amount">
                {billingCycle === 'monthly' ? plan.pricePerUser : plan.yearlyPricePerUser}
              </span>
              <span className="period">/user/month</span>
            </div>

            <div className="price-minimum">
              Minimum {plan.minimumUsers} users (${plan.minimumMonthly}/mo)
            </div>

            <div className="price-estimate">
              <div className="estimate-row">
                <span>Your price ({workerCount} users):</span>
                <strong>${getMonthlyPrice(plan).toFixed(0)}/mo</strong>
              </div>
              
              {billingCycle === 'monthly' && plan.setupFee > 0 && (
                <div className="estimate-row setup">
                  <span>One-time setup fee:</span>
                  <strong>${plan.setupFee}</strong>
                </div>
              )}
              
              {billingCycle === 'yearly' && (
                <div className="estimate-row savings">
                  <span>You save annually:</span>
                  <strong className="green">${getAnnualSavings(plan).toFixed(0)}</strong>
                </div>
              )}
            </div>

            <ul className="plan-features">
              {plan.features.map((feature, index) => (
                <li key={index} className="included">
                  <span className="icon">✓</span>
                  {feature}
                </li>
              ))}
              {plan.notIncluded.map((feature, index) => (
                <li key={index} className="not-included">
                  <span className="icon">—</span>
                  {feature}
                </li>
              ))}
            </ul>

            <button
              className={`plan-button ${isCurrentPlan(plan.id) ? 'current' : ''}`}
              onClick={() => isCurrentPlan(plan.id) ? handleManageBilling() : handleSelectPlan(plan.id)}
              disabled={actionLoading}
            >
              {actionLoading ? 'Loading...' : 
                isCurrentPlan(plan.id) ? 'Manage Plan' :
                isPaidUser ? 'Switch Plan' : 
                status?.tier === 'trial' ? 'Upgrade Now' : 'Start 14-Day Free Trial'}
            </button>

            {!isPaidUser && !isCurrentPlan(plan.id) && (
              <p className="no-card-required">No credit card required for trial</p>
            )}
          </div>
        ))}
      </div>

      <div className="billing-faq">
        <h2>Frequently Asked Questions</h2>
        <div className="faq-grid">
          <div className="faq-item">
            <h4>How does per-user pricing work?</h4>
            <p>You pay based on active workers. Each plan has a minimum for great value.</p>
          </div>
          <div className="faq-item">
            <h4>What's in the free trial?</h4>
            <p>Full Professional features for 14 days. No credit card required.</p>
          </div>
          <div className="faq-item">
            <h4>Why is there a setup fee?</h4>
            <p>Covers onboarding and training. Waived on annual plans.</p>
          </div>
          <div className="faq-item">
            <h4>Can I change plans?</h4>
            <p>Yes! Upgrade instantly, downgrade at next billing cycle.</p>
          </div>
        </div>
      </div>

      <div className="cta-section">
        <h2>Ready to eliminate time theft?</h2>
        <p>Start your free 14-day trial. No credit card required.</p>
        <button 
          className="cta-button"
          onClick={() => handleSelectPlan('professional')}
          disabled={actionLoading}
        >
          Start Free Trial
        </button>
      </div>
    </div>
  );
}

export default BillingPage;