import React from 'react';
import './admin-ops.css';

const AdminOpsLayout = ({ title, subtitle, topLeftAction, topRightAction, children }) => {
  const pageVisuals = {
    'SLA & Response Tracker': '⏱️',
    'High-Risk Farmer Queue': '⚠️',
    'Query Resolution Graph': '📈',
    'Alert Effectiveness': '🎯',
    'User Engagement Health': '👥',
    'Geography Operations': '🗺️',
    'User Activity': '🧑‍🌾',
  };
  const headerVisual = pageVisuals[title] || '📊';

  return (
    <div className="admin-ops">
      <header className="admin-ops-header">
        <div className="admin-ops-hero-image" aria-hidden="true">{headerVisual}</div>
        <div>
          <h1 className="admin-ops-title">{title}</h1>
          {subtitle && <p className="admin-ops-subtitle">{subtitle}</p>}
        </div>
      </header>
      <main className="admin-ops-content">
        {(topLeftAction || topRightAction) && (
          <div className="ops-top-actions">
            <div className="ops-top-actions-left">{topLeftAction}</div>
            <div className="ops-top-actions-right">{topRightAction}</div>
          </div>
        )}
        {children}
      </main>
    </div>
  );
};

export default AdminOpsLayout;
