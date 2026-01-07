import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { billingApi } from '../services/api';
import './BillingPage.css';

const PLANS = [
  {
    id: 'starter',
    name: 'Starter',
    pricePerUser: 8,
    yearlyPricePerUser: 6,
    minimumUsers: 5,
    minimumMonthly: 40,
    setupFee: 199,
    description: 'For small crews who need reliable time tracking',
    features: [
      'Clock in/out with GPS',
      'Mobile app (iOS & Android)',
      'Worker management',
      'Job site tracking',
      'Basic time reports',
      'CSV exports',
      'Email support',
    ],
    notIncluded: [
      'Face verification',
      'Geofencing alerts',
      'Break compliance',
      'Scheduling',
      'Certified Payroll',
    ],
    popular: false,
  },
  {
    id: 'professional',
    name: 'Professional',
    pricePerUser: 12,
    yearlyPricePerUser: 10,
    minimumUsers: 5,
    minimumMonthly: 60,
    setupFee: 299,
    description: 'Eliminate buddy punching & stay compliant',
    features: [
      'Everything in Starter, plus:',
      'Face verification (AI-powered)',
      'Photo capture on clock in/out',
      'Geofencing with alerts',
      'California break compliance',
      'Overtime tracking & alerts',
      'Schedule management',
      'Open shifts & claiming',
      'Shift requests & time off',
      'Team messaging',
      'Cost analytics',
      'Excel & PDF exports',
      'Priority support',
    ],
    notIncluded: [
      'Certified Payroll WH-347',
      'Audit logs',
    ],
    popular: true,
  },
  {
    id: 'contractor',
    name: 'Contractor',
    pricePerUser: 18,
    yearlyPricePerUser: 15,
    minimumUsers: 10,
    minimumMonthly: 180,
    setupFee: 0,
    description: 'For government jobs & prevailing wage projects',
    features: [
      'Everything in Professional, plus:',
      'Certified Payroll WH-347',
      'Prevailing wage tracking',
      'Complete audit trail',
      'Dedicated onboarding call',
      'Priority phone & email support',
    ],
    notIncluded: [],
    popular: false,
  },
];

const PLAN_COLORS = {
  starter: '#6b7280',
  professional: '#C9A227',
  contractor: '#1e3a5f',
};

function BillingPage() {
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [billingCycle, setBillingCycle] = useState('yearly');
  const [workerCount, setWorkerCount] = useState(10);

  const success = searchParams.get('success');
  const canceled = searchParams.get('canceled');

  useEffect(() => {
    loadStatus();
  }, []);

  const loadStatus = async () => {
    try {
      const response = await billingApi.getStatus();
      setStatus(response.data);
      if (response.data.workerCount) {
        setWorkerCount(Math.max(response.data.workerCount, 5));
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
    const effectiveUsers = Math.max(workerCount, plan.minimumUsers);
    const calculatedPrice = pricePerUser * effectiveUsers;
    return Math.max(calculatedPrice, plan.minimumMonthly);
  };

  const getAnnualSavings = (plan) => {
    const effectiveUsers = Math.max(workerCount, plan.minimumUsers);
    const monthlyTotal = plan.pricePerUser * effectiveUsers * 12;
    const yearlyTotal = plan.yearlyPricePerUser * effectiveUsers * 12;
    return monthlyTotal - yearlyTotal + plan.setupFee;
  };

  const getSavingsPercent = (plan) => {
    return Math.round((1 - plan.yearlyPricePerUser / plan.pricePerUser) * 100);
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
  const isPaidUser = ['starter', 'professional', 'contractor'].includes(currentTier.toLowerCase());

  return (
    <div className="billing-page">
      <div className="billing-header">
        <h1>Simple, Transparent Pricing</h1>
        <p>Stop buddy punching. Stay compliant. Save thousands.</p>

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
            <span>🎁 14-Day Free Trial</span>
            {status?.trialEndsAt && (
              <span className="trial-ends">
                Ends {new Date(status.trialEndsAt).toLocaleDateString()}
              </span>
            )}
          </div>
        )}

        {isPaidUser && (
          <div className="current-plan-banner active">
            <span>✓ Current Plan: {currentTier.charAt(0).toUpperCase() + currentTier.slice(1)}</span>
            <button className="manage-btn" onClick={handleManageBilling} disabled={actionLoading}>
              Manage Subscription
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
            <span className="save-badge">Save up to 25% + No Setup Fee</span>
          </button>
        </div>

        <div className="worker-slider">
          <label>Team size: <strong>{workerCount} workers</strong></label>
          <input
            type="range"
            min="5"
            max="100"
            value={workerCount}
            onChange={(e) => setWorkerCount(parseInt(e.target.value))}
          />
          <div className="slider-labels">
            <span>5</span>
            <span>50</span>
            <span>100+</span>
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
              <span className="period">/user/mo</span>
            </div>

            {billingCycle === 'yearly' && (
              <div className="price-savings">
                <span className="original-price">${plan.pricePerUser}/user</span>
                <span className="savings-badge">Save {getSavingsPercent(plan)}%</span>
              </div>
            )}

            <div className="price-estimate">
              <div className="estimate-row total">
                <span>Your monthly cost:</span>
                <strong>${getMonthlyPrice(plan)}/mo</strong>
              </div>
              
              {billingCycle === 'monthly' && plan.setupFee > 0 && (
                <div className="estimate-row setup">
                  <span>One-time setup:</span>
                  <strong>${plan.setupFee}</strong>
                </div>
              )}
              
              {billingCycle === 'yearly' && plan.setupFee > 0 && (
                <div className="estimate-row setup waived">
                  <span>Setup fee:</span>
                  <strong><s>${plan.setupFee}</s> FREE</strong>
                </div>
              )}
              
              {billingCycle === 'yearly' && (
                <div className="estimate-row savings">
                  <span>Annual savings:</span>
                  <strong className="green">${getAnnualSavings(plan)}</strong>
                </div>
              )}
            </div>

            <button
              className={`plan-button ${isCurrentPlan(plan.id) ? 'current' : ''}`}
              onClick={() => isCurrentPlan(plan.id) ? handleManageBilling() : handleSelectPlan(plan.id)}
              disabled={actionLoading}
            >
              {actionLoading ? 'Loading...' : 
                isCurrentPlan(plan.id) ? 'Manage Plan' :
                isPaidUser ? 'Switch Plan' : 
                status?.tier === 'trial' ? 'Start Plan' : 'Start 14-Day Free Trial'}
            </button>

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
          </div>
        ))}
      </div>

      <div className="value-props">
        <h2>Why construction companies choose Punch'd</h2>
        <div className="value-grid">
          <div className="value-item">
            <div className="value-icon">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#C9A227" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
              </svg>
            </div>
            <h4>Stop Buddy Punching</h4>
            <p>Face verification ensures only the right person clocks in. Save thousands in fraudulent hours.</p>
          </div>
          <div className="value-item">
            <div className="value-icon">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#C9A227" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                <polyline points="9 12 11 14 15 10"/>
              </svg>
            </div>
            <h4>Stay Compliant</h4>
            <p>Automatic California break tracking. Never worry about meal & rest period violations.</p>
          </div>
          <div className="value-item">
            <div className="value-icon">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#C9A227" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
                <circle cx="12" cy="10" r="3"/>
              </svg>
            </div>
            <h4>Know Where They Are</h4>
            <p>GPS + geofencing shows exactly where workers clock in. No more guessing.</p>
          </div>
          <div className="value-item">
            <div className="value-icon">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#C9A227" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                <polyline points="14 2 14 8 20 8"/>
                <line x1="16" y1="13" x2="8" y2="13"/>
                <line x1="16" y1="17" x2="8" y2="17"/>
                <polyline points="10 9 9 9 8 9"/>
              </svg>
            </div>
            <h4>Government Ready</h4>
            <p>Generate certified payroll WH-347 in minutes, not hours. Win more government contracts.</p>
          </div>
        </div>
      </div>

      <div className="billing-faq">
        <h2>Frequently Asked Questions</h2>
        <div className="faq-grid">
          <div className="faq-item">
            <h4>What's included in the free trial?</h4>
            <p>Full access to Professional features for 14 days. No credit card required to start.</p>
          </div>
          <div className="faq-item">
            <h4>Can I change plans later?</h4>
            <p>Yes! Upgrade instantly anytime. Downgrades take effect at your next billing cycle.</p>
          </div>
          <div className="faq-item">
            <h4>What's the setup fee for?</h4>
            <p>Covers your dedicated onboarding session & team training. Waived on annual plans.</p>
          </div>
          <div className="faq-item">
            <h4>Do you offer refunds?</h4>
            <p>Yes, 30-day money back guarantee if you're not satisfied. No questions asked.</p>
          </div>
          <div className="faq-item">
            <h4>How does face verification work?</h4>
            <p>Workers take a selfie when clocking in. Our AI matches it to their profile photo instantly.</p>
          </div>
          <div className="faq-item">
            <h4>What if I have more than 100 workers?</h4>
            <p>Contact us for custom enterprise pricing with volume discounts.</p>
          </div>
        </div>
      </div>

      <div className="cta-section">
        <h2>Ready to stop losing money to time theft?</h2>
        <p>Join construction companies saving thousands per month with Punch'd.</p>
        <button 
          className="cta-button"
          onClick={() => handleSelectPlan('professional')}
          disabled={actionLoading}
        >
          Start Your Free Trial
        </button>
        <span className="cta-note">No credit card required • Setup in 5 minutes</span>
      </div>
    </div>
  );
}

export default BillingPage;