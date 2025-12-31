import { useNavigate } from 'react-router-dom';
import './UpgradePrompt.css';

function UpgradePrompt({ feature, requiredPlan = 'Professional' }) {
  const navigate = useNavigate();

  const featureInfo = {
    FACE_VERIFICATION: {
      name: 'Face Verification',
      description: 'Eliminate buddy punching with AI-powered face matching.',
      icon: '🔐',
    },
    PHOTO_CAPTURE: {
      name: 'Photo Capture',
      description: 'Capture photos on clock in/out for visual verification.',
      icon: '📸',
    },
    GEOFENCING: {
      name: 'Geofencing',
      description: 'Ensure workers can only clock in at designated job sites.',
      icon: '📍',
    },
    COST_ANALYTICS: {
      name: 'Cost Analytics',
      description: 'Track labor costs by job site in real-time.',
      icon: '📊',
    },
    EXPORTS: {
      name: 'Excel & PDF Exports',
      description: 'Export timesheets and reports for payroll processing.',
      icon: '📥',
    },
    SHIFT_SCHEDULING: {
      name: 'Shift Scheduling',
      description: 'Create and assign shifts to your workers.',
      icon: '📅',
    },
    AUDIT_LOGS: {
      name: 'Audit Logs',
      description: 'Track all admin actions and changes for compliance.',
      icon: '🔍',
    },
    API_ACCESS: {
      name: 'API Access',
      description: 'Integrate ApexChronos with your existing tools.',
      icon: '⚡',
    },
  };

  const info = featureInfo[feature] || { 
    name: feature, 
    description: 'This feature requires an upgrade.',
    icon: '🔒'
  };

  return (
    <div className="upgrade-prompt">
      <div className="upgrade-icon">{info.icon}</div>
      <h2>{info.name}</h2>
      <p className="upgrade-description">{info.description}</p>
      <div className="upgrade-badge">
        Requires <strong>{requiredPlan}</strong> Plan
      </div>
      <button className="upgrade-button" onClick={() => navigate('/billing')}>
        🚀 Upgrade Now
      </button>
      <p className="upgrade-note">
        Unlock this feature and boost your team's productivity
      </p>
    </div>
  );
}

export default UpgradePrompt;