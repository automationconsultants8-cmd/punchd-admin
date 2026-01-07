import { useFeatures } from '../hooks/useFeatures';
import { useNavigate } from 'react-router-dom';
import './FeatureGate.css';

// Lock icon
const LockIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
    <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
  </svg>
);

// Wraps content - shows upgrade prompt if feature not allowed
export function FeatureGate({ feature, children, fallback }) {
  const { hasFeature, getRequiredTier, loading } = useFeatures();
  const navigate = useNavigate();

  if (loading) return null;

  if (hasFeature(feature)) {
    return children;
  }

  if (fallback) {
    return fallback;
  }

  const requiredTier = getRequiredTier(feature);
  const tierNames = {
    starter: 'Starter',
    professional: 'Professional',
    contractor: 'Contractor',
  };

  return (
    <div className="feature-gate-locked">
      <div className="feature-gate-icon">
        <LockIcon />
      </div>
      <h3>Feature Locked</h3>
      <p>This feature requires the <strong>{tierNames[requiredTier]}</strong> plan.</p>
      <button className="feature-gate-btn" onClick={() => navigate('/billing')}>
        Upgrade Now
      </button>
    </div>
  );
}

// HOC for entire pages
export function withFeatureGate(Component, feature) {
  return function WrappedComponent(props) {
    return (
      <FeatureGate feature={feature}>
        <Component {...props} />
      </FeatureGate>
    );
  };
}