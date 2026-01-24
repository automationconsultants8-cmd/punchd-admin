import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { billingApi, usersApi } from '../services/api';
import './BillingPage.css';

const PLANS = [
  {
    id: 'starter',
    name: 'Starter',
    pricePerUser: 8,
    yearlyPricePerUser: 6,
    volunteerPricePerUser: 3,
    yearlyVolunteerPricePerUser: 2,
    minimumUsers: 5,
    minimumMonthly: 40,
    setupFee: 199,
    description: 'Essential time tracking for growing teams',
    features: [
      'Clock in/out with GPS',
      'Mobile app (iOS & Android)',
      'Worker management',
      'Job site tracking',
      'Basic time reports',
      'CSV exports',
      'Email support',
    ],
    notIncluded: ['Face verification', 'Geofencing alerts', 'Break compliance', 'Scheduling', 'Certified Payroll'],
    popular: false,
  },
  {
    id: 'professional',
    name: 'Professional',
    pricePerUser: 12,
    yearlyPricePerUser: 10,
    volunteerPricePerUser: 4,
    yearlyVolunteerPricePerUser: 3,
    minimumUsers: 5,
    minimumMonthly: 60,
    setupFee: 299,
    description: 'Advanced verification & compliance tools',
    features: [
      'Everything in Starter, plus:',
      'Face verification (AI-powered)',
      'Photo capture on clock in/out',
      'Geofencing with alerts',
      'California break compliance',
      'Overtime tracking & alerts',
      'Schedule management',
      'Shift templates',
      'Open shifts & claiming',
      'Shift requests & time off',
      'Leave management (PTO, sick)',
      'Manual time entry',
      'Pay period management',
      'Team messaging',
      'Cost analytics',
      'Excel & PDF exports',
      'Priority support',
    ],
    notIncluded: ['Certified Payroll WH-347', 'Audit logs', 'Role management'],
    popular: true,
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    pricePerUser: 18,
    yearlyPricePerUser: 15,
    volunteerPricePerUser: 5,
    yearlyVolunteerPricePerUser: 4,
    minimumUsers: 10,
    minimumMonthly: 180,
    setupFee: 0,
    description: 'Full platform with premium support',
    features: [
      'Everything in Professional, plus:',
      'Certified Payroll WH-347',
      'Prevailing wage tracking',
      'Complete audit trail',
      'Role management',
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
  enterprise: '#1e3a5f',
};

function BillingPage() {
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [billingCycle, setBillingCycle] = useState('yearly');
  
  const [workerCounts, setWorkerCounts] = useState({
    hourly: 0,
    salaried: 0,
    contractors: 0,
    volunteers: 0,
    total: 0,
  });

  const success = searchParams.get('success');
  const canceled = searchParams.get('canceled');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const statusRes = await billingApi.getStatus();
      setStatus(statusRes.data);
      
      // Load real worker counts
      try {
        const workersRes = await usersApi.getAll();
        const users = workersRes.data || [];
        
        // Debug log
        console.log('All users from API:', users);
        
        const counts = {
          hourly: 0,
          salaried: 0,
          contractors: 0,
          volunteers: 0,
          total: 0,
        };
        
        // Count all users that have workerTypes (these are workers)
        users.forEach(user => {
          const types = user.workerTypes || [];
          
          // If user has any workerTypes, they're a worker
          if (types.length > 0) {
            counts.total++;
            
            types.forEach(type => {
              const typeLower = type.toLowerCase();
              if (typeLower === 'hourly') counts.hourly++;
              else if (typeLower === 'salaried') counts.salaried++;
              else if (typeLower === 'contractor') counts.contractors++;
              else if (typeLower === 'volunteer') counts.volunteers++;
            });
          }
        });
        
        console.log('Worker counts:', counts);
        setWorkerCounts(counts);
      } catch (err) {
        console.error('Failed to load worker counts:', err);
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
      const response = await billingApi.createCheckoutSession(planId, billingCycle, workerCounts.total);
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
    const regularPrice = billingCycle === 'monthly' ? plan.pricePerUser : plan.yearlyPricePerUser;
    const volunteerPrice = billingCycle === 'monthly' ? plan.volunteerPricePerUser : plan.yearlyVolunteerPricePerUser;
    
    const regularWorkers = workerCounts.hourly + workerCounts.salaried + workerCounts.contractors;
    const volunteerWorkers = workerCounts.volunteers;
    
    const effectiveRegular = Math.max(regularWorkers, plan.minimumUsers);
    const calculatedPrice = (regularPrice * effectiveRegular) + (volunteerPrice * volunteerWorkers);
    
    return Math.max(calculatedPrice, plan.minimumMonthly);
  };

  const getAnnualSavings = (plan) => {
    const regularWorkers = workerCounts.hourly + workerCounts.salaried + workerCounts.contractors;
    const effectiveRegular = Math.max(regularWorkers, plan.minimumUsers);
    
    const monthlyTotal = (plan.pricePerUser * effectiveRegular * 12) + (plan.volunteerPricePerUser * workerCounts.volunteers * 12);
    const yearlyTotal = (plan.yearlyPricePerUser * effectiveRegular * 12) + (plan.yearlyVolunteerPricePerUser * workerCounts.volunteers * 12);
    
    return monthlyTotal - yearlyTotal + plan.setupFee;
  };

  const getSavingsPercent = (plan) => {
    return Math.round((1 - plan.yearlyPricePerUser / plan.pricePerUser) * 100);
  };

  // Calculate days remaining in trial
  const getTrialDaysRemaining = () => {
    if (!status?.trialEndsAt) return null;
    const now = new Date();
    const trialEnd = new Date(status.trialEndsAt);
    const diffTime = trialEnd.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return Math.max(0, diffDays);
  };

  if (loading) {
    return (
      <div className="billing-page">
        <div className="loading">Loading billing information...</div>
      </div>
    );
  }

  const currentTier = status?.tier || 'trial';
  const subscriptionStatus = status?.status || 'trial';
  const isCurrentPlan = (planId) => currentTier.toLowerCase() === planId.toLowerCase();
  const isPaidUser = ['starter', 'professional', 'enterprise'].includes(currentTier.toLowerCase()) && subscriptionStatus !== 'trial';
  const isOnTrial = subscriptionStatus === 'trial';
  const trialDaysRemaining = getTrialDaysRemaining(); // <-- THIS WAS MISSING

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

        {isOnTrial && (
          <div className="current-plan-banner trial">
            <span>🎁 14-Day Free Trial</span>
            <span className="trial-ends">
              {trialDaysRemaining !== null && trialDaysRemaining > 0 ? (
                <>
                  <strong>{trialDaysRemaining} day{trialDaysRemaining !== 1 ? 's' : ''} remaining</strong>
                  {status?.trialEndsAt && (
                    <span className="trial-end-date"> (ends {new Date(status.trialEndsAt).toLocaleDateString()})</span>
                  )}
                </>
              ) : trialDaysRemaining === 0 ? (
                <strong className="trial-ending-today">Trial ends today!</strong>
              ) : (
                status?.trialEndsAt && `Ends ${new Date(status.trialEndsAt).toLocaleDateString()}`
              )}
            </span>
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

      {/* Worker Count Summary */}
      <div className="worker-count-summary">
        <h3>Your Team</h3>
        <div className="worker-counts">
          {workerCounts.hourly > 0 && (
            <div className="count-item">
              <span className="count-icon">⏰</span>
              <span className="count-number">{workerCounts.hourly}</span>
              <span className="count-label">Hourly</span>
            </div>
          )}
          {workerCounts.salaried > 0 && (
            <div className="count-item">
              <span className="count-icon">💼</span>
              <span className="count-number">{workerCounts.salaried}</span>
              <span className="count-label">Salaried</span>
            </div>
          )}
          {workerCounts.contractors > 0 && (
            <div className="count-item">
              <span className="count-icon">📋</span>
              <span className="count-number">{workerCounts.contractors}</span>
              <span className="count-label">Contractors</span>
            </div>
          )}
          {workerCounts.volunteers > 0 && (
            <div className="count-item volunteer">
              <span className="count-icon">🤝</span>
              <span className="count-number">{workerCounts.volunteers}</span>
              <span className="count-label">Volunteers</span>
              <span className="discount-badge">Discounted</span>
            </div>
          )}
          <div className="count-item total">
            <span className="count-number">{workerCounts.total}</span>
            <span className="count-label">Total Workers</span>
          </div>
        </div>
        <p className="count-note">Pricing is calculated automatically based on your active workers</p>
      </div>

      <div className="pricing-controls">
        <div className="billing-toggle">
          <button className={billingCycle === 'monthly' ? 'active' : ''} onClick={() => setBillingCycle('monthly')}>
            Monthly
          </button>
          <button className={billingCycle === 'yearly' ? 'active' : ''} onClick={() => setBillingCycle('yearly')}>
            Annual
            <span className="save-badge">Save up to 25% + No Setup Fee</span>
          </button>
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
              <span className="amount">{billingCycle === 'monthly' ? plan.pricePerUser : plan.yearlyPricePerUser}</span>
              <span className="period">/user/mo</span>
            </div>

            {billingCycle === 'yearly' && (
              <div className="price-savings">
                <span className="original-price">${plan.pricePerUser}/user</span>
                <span className="savings-badge">Save {getSavingsPercent(plan)}%</span>
              </div>
            )}

            <div className="volunteer-pricing-note">
              <span>🤝 Volunteers: ${billingCycle === 'monthly' ? plan.volunteerPricePerUser : plan.yearlyVolunteerPricePerUser}/user/mo</span>
            </div>

            <div className="price-estimate">
              {(workerCounts.hourly + workerCounts.salaried + workerCounts.contractors) > 0 && (
                <div className="estimate-row">
                  <span>{workerCounts.hourly + workerCounts.salaried + workerCounts.contractors} regular workers</span>
                  <span>${(billingCycle === 'monthly' ? plan.pricePerUser : plan.yearlyPricePerUser) * Math.max(workerCounts.hourly + workerCounts.salaried + workerCounts.contractors, plan.minimumUsers)}</span>
                </div>
              )}
              {workerCounts.volunteers > 0 && (
                <div className="estimate-row volunteer-row">
                  <span>{workerCounts.volunteers} volunteers</span>
                  <span>${(billingCycle === 'monthly' ? plan.volunteerPricePerUser : plan.yearlyVolunteerPricePerUser) * workerCounts.volunteers}</span>
                </div>
              )}
              
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
                isOnTrial ? 'Select Plan' : 'Start 14-Day Free Trial'}
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
        <h2>Why staffing agencies choose Punch'd</h2>
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
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                <circle cx="9" cy="7" r="4"/>
                <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
                <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
              </svg>
            </div>
            <h4>Multi-Site Management</h4>
            <p>Manage workers across multiple client sites. Track time by location automatically.</p>
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
            <h4>How is billing calculated?</h4>
            <p>We automatically count your active workers each billing cycle. Your bill adjusts as your team grows or shrinks.</p>
          </div>
          <div className="faq-item">
            <h4>Why are volunteers cheaper?</h4>
            <p>Volunteer organizations have different needs. We offer reduced rates to support community service.</p>
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
        </div>
      </div>

      {/* Only show CTA if NOT on trial and NOT a paid user */}
      {!isOnTrial && !isPaidUser && (
        <div className="cta-section">
          <h2>Ready to stop losing money to time theft?</h2>
          <p>Join staffing agencies saving thousands per month with Punch'd.</p>
          <button className="cta-button" onClick={() => handleSelectPlan('professional')} disabled={actionLoading}>
            Start Your Free Trial
          </button>
          <span className="cta-note">No credit card required • Setup in 5 minutes</span>
        </div>
      )}

      {/* Show different CTA for trial users */}
      {isOnTrial && (
        <div className="cta-section trial-cta">
          <h2>Enjoying your trial?</h2>
          <p>
            {trialDaysRemaining !== null && trialDaysRemaining > 0
              ? `You have ${trialDaysRemaining} day${trialDaysRemaining !== 1 ? 's' : ''} left to explore all features.`
              : 'Your trial ends today. Select a plan to continue using Punch\'d.'}
          </p>
          <button className="cta-button" onClick={() => handleSelectPlan('professional')} disabled={actionLoading}>
            {trialDaysRemaining !== null && trialDaysRemaining <= 3 ? 'Select a Plan Now' : 'Select a Plan'}
          </button>
          <span className="cta-note">Keep all your data • Seamless transition</span>
        </div>
      )}
    </div>
  );
}

export default BillingPage;