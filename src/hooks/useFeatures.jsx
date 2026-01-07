import { useState, useEffect, createContext, useContext } from 'react';
import { featuresApi } from '../services/api';

const FeaturesContext = createContext(null);

export function FeaturesProvider({ children }) {
  const [features, setFeatures] = useState(null);
  const [loading, setLoading] = useState(true);
  const [tier, setTier] = useState('trial');

  useEffect(() => {
    loadFeatures();
  }, []);

  const loadFeatures = async () => {
    try {
      const response = await featuresApi.getFeatures();
      setFeatures(response.data.features);
      setTier(response.data.currentTier);
    } catch (err) {
      console.error('Failed to load features:', err);
    } finally {
      setLoading(false);
    }
  };

  const hasFeature = (feature) => {
    if (!features) return false;
    return features[feature]?.allowed || false;
  };

  const getRequiredTier = (feature) => {
    if (!features) return 'professional';
    return features[feature]?.requiredTier || 'professional';
  };

  return (
    <FeaturesContext.Provider value={{ features, tier, loading, hasFeature, getRequiredTier, reload: loadFeatures }}>
      {children}
    </FeaturesContext.Provider>
  );
}

export function useFeatures() {
  const context = useContext(FeaturesContext);
  if (!context) {
    throw new Error('useFeatures must be used within FeaturesProvider');
  }
  return context;
}