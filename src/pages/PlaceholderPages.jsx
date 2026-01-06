// Placeholder pages - to be fully implemented

// PayrollPage.jsx
export function PayrollPage() {
  return (
    <div className="page-placeholder">
      <div className="placeholder-content">
        <div className="placeholder-icon">💰</div>
        <h1>Payroll</h1>
        <p>Process payroll, manage pay periods, and export to QuickBooks</p>
        <div className="coming-soon-badge">Coming Soon</div>
      </div>
    </div>
  );
}

// TimeOffPage.jsx
export function TimeOffPage() {
  return (
    <div className="page-placeholder">
      <div className="placeholder-content">
        <div className="placeholder-icon">🏖️</div>
        <h1>Time Off</h1>
        <p>Manage PTO requests, track balances, and set policies</p>
        <div className="coming-soon-badge">Coming Soon</div>
      </div>
    </div>
  );
}

// ReportsPage.jsx
export function ReportsPage() {
  return (
    <div className="page-placeholder">
      <div className="placeholder-content">
        <div className="placeholder-icon">📈</div>
        <h1>Reports</h1>
        <p>Generate timesheets, cost reports, and custom analytics</p>
        <div className="coming-soon-badge">Coming Soon</div>
      </div>
    </div>
  );
}

// SchedulePage.jsx (updated from previous)
export function SchedulePage() {
  return (
    <div className="page-placeholder">
      <div className="placeholder-content">
        <div className="placeholder-icon">📅</div>
        <h1>Schedule</h1>
        <p>Create shifts, manage schedules, and handle shift swaps</p>
        <div className="coming-soon-badge">Coming Soon</div>
      </div>
    </div>
  );
}

// SettingsPage.jsx
export function SettingsPage() {
  return (
    <div className="page-placeholder">
      <div className="placeholder-content">
        <div className="placeholder-icon">⚙️</div>
        <h1>Settings</h1>
        <p>Configure company settings, overtime rules, and integrations</p>
        <div className="coming-soon-badge">Coming Soon</div>
      </div>
    </div>
  );
}

// Add styles for placeholder pages
const style = document.createElement('style');
style.textContent = `
  .page-placeholder {
    display: flex;
    align-items: center;
    justify-content: center;
    min-height: 60vh;
  }
  
  .placeholder-content {
    text-align: center;
    max-width: 400px;
  }
  
  .placeholder-icon {
    font-size: 64px;
    margin-bottom: 24px;
  }
  
  .placeholder-content h1 {
    font-size: 32px;
    font-weight: 700;
    color: var(--text-primary);
    margin-bottom: 12px;
  }
  
  .placeholder-content p {
    font-size: 16px;
    color: var(--text-muted);
    margin-bottom: 24px;
    line-height: 1.6;
  }
  
  .coming-soon-badge {
    display: inline-block;
    padding: 8px 16px;
    background: rgba(168, 85, 247, 0.1);
    border: 1px solid rgba(168, 85, 247, 0.2);
    border-radius: 100px;
    font-size: 14px;
    font-weight: 500;
    color: var(--brand-primary);
  }
`;
document.head.appendChild(style);
