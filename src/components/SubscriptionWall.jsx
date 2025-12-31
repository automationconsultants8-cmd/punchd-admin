import { useState } from 'react';
import { billingApi } from '../services/api';
import './SubscriptionWall.css';

function SubscriptionWall({ daysLeft, onSubscribe }) {
  const [loading, setLoading] = useState(false);

  const handleSubscribe = async (plan) => {
    setLoading(true);
    try {
      const response = await billingApi.createCheckoutSession(plan, 'monthly', 10);
      window.location.href = response.data.url;
    } catch (err) {
      alert('Failed to start checkout. Please try again.');
      setLoading(false);
    }
  };

  return (
    <div className="subscription-wall">
      <div className="subscription-card">
        <div className="subscription-icon">⏰</div>
        <h1>Your Trial Has Expired</h1>
        <p>Your 14-day free trial has ended. Subscribe to continue using Punch'd.</p>
        
        <div className="plans">
          <div className="plan">
            <h3>Starter</h3>
            <div className="price">$3<span>/user/mo</span></div>
            <ul>
              <li>Up to 25 workers</li>
              <li>GPS clock in/out</li>
              <li>Basic timesheets</li>
            </ul>
            <button onClick={() => handleSubscribe('starter')} disabled={loading}>
              {loading ? 'Loading...' : 'Choose Starter'}
            </button>
          </div>
          
          <div className="plan popular">
            <div className="badge">Most Popular</div>
            <h3>Professional</h3>
            <div className="price">$5<span>/user/mo</span></div>
            <ul>
              <li>Up to 100 workers</li>
              <li>AI face verification</li>
              <li>Geofencing & alerts</li>
              <li>Cost analytics</li>
            </ul>
            <button onClick={() => handleSubscribe('professional')} disabled={loading}>
              {loading ? 'Loading...' : 'Choose Professional'}
            </button>
          </div>
          
          <div className="plan">
            <h3>Enterprise</h3>
            <div className="price">$7<span>/user/mo</span></div>
            <ul>
              <li>Unlimited workers</li>
              <li>API access</li>
              <li>Custom integrations</li>
              <li>Dedicated support</li>
            </ul>
            <button onClick={() => handleSubscribe('enterprise')} disabled={loading}>
              {loading ? 'Loading...' : 'Choose Enterprise'}
            </button>
          </div>
        </div>
        
        <p className="contact">Questions? Email <a href="mailto:hello@krynovo.com">hello@krynovo.com</a></p>
      </div>
    </div>
  );
}

export default SubscriptionWall;
