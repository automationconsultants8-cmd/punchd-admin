import { createContext, useContext, useState, useEffect } from 'react';
import { featuresApi } from '../services/api';

const FeatureContext = createContext();

export function FeatureProvider({ children }) {
  const [features, setFeatures] = useState({});
  const [tier, setTier] = useState('trial');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadFeatures();
  }, []);

  const loadFeatures = async () => {
    try {
      const token = localStorage.getItem('adminToken');
      if (!token) {
        setLoading(false);
        return;
      }
      
      const response = await featuresApi.getFeatures();
      setFeatures(response.data.featureFlags || {});
      setTier(response.data.tier || 'trial');
    } catch (err) {
      console.error('Failed to load features:', err);
    } finally {
      setLoading(false);
    }
  };

  const hasFeature = (feature) => {
    return features[feature] === true;
  };

  const requiresUpgrade = (feature) => {
    return features[feature] === false;
  };

  return (
    <FeatureContext.Provider value={{ 
      features, 
      tier, 
      loading, 
      hasFeature, 
      requiresUpgrade,
      refreshFeatures: loadFeatures 
    }}>
      {children}
    </FeatureContext.Provider>
  );
}

export function useFeatures() {
  const context = useContext(FeatureContext);
  if (!context) {
    return { 
      features: {}, 
      tier: 'trial', 
      loading: false, 
      hasFeature: () => true, 
      requiresUpgrade: () => false,
      refreshFeatures: () => {}
    };
  }
  return context;
}