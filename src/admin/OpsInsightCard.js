import React from 'react';

const OpsInsightCard = ({ title, text, highlights }) => {
  const titleKey = String(title || '').toLowerCase();

  const renderVisual = () => {
    if (titleKey.includes('query')) {
      return (
        <svg width="160" height="120" viewBox="0 0 160 120" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect x="18" y="16" width="124" height="88" rx="16" fill="#fff7d6" />
          <rect x="30" y="30" width="56" height="10" rx="5" fill="#f4c430" />
          <rect x="30" y="48" width="98" height="8" rx="4" fill="#dbeadf" />
          <rect x="30" y="62" width="78" height="8" rx="4" fill="#dbeadf" />
          <path d="M38 88H122" stroke="#1f7a4d" strokeWidth="6" strokeLinecap="round" />
          <path d="M52 88V74" stroke="#1f7a4d" strokeWidth="6" strokeLinecap="round" />
          <path d="M80 88V66" stroke="#1f7a4d" strokeWidth="6" strokeLinecap="round" />
          <path d="M108 88V58" stroke="#1f7a4d" strokeWidth="6" strokeLinecap="round" />
        </svg>
      );
    }

    if (titleKey.includes('engagement') || titleKey.includes('user')) {
      return (
        <svg width="160" height="120" viewBox="0 0 160 120" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="50" cy="46" r="16" fill="#fff4c7" stroke="#f4c430" strokeWidth="4" />
          <circle cx="94" cy="42" r="14" fill="#e9f7ef" stroke="#1f7a4d" strokeWidth="4" />
          <circle cx="118" cy="62" r="12" fill="#ffe8df" stroke="#ff8f5e" strokeWidth="4" />
          <rect x="28" y="70" width="96" height="24" rx="12" fill="#eef6f0" />
          <path d="M38 82H113" stroke="#1f7a4d" strokeWidth="5" strokeLinecap="round" />
        </svg>
      );
    }

    if (titleKey.includes('geograph')) {
      return (
        <svg width="160" height="120" viewBox="0 0 160 120" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect x="22" y="18" width="116" height="84" rx="18" fill="#eef6f0" />
          <path d="M42 86L60 46L82 66L101 38L120 74" stroke="#1f7a4d" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" />
          <circle cx="60" cy="46" r="6" fill="#f4c430" />
          <circle cx="101" cy="38" r="6" fill="#ff8f5e" />
          <circle cx="82" cy="66" r="6" fill="#f4c430" />
        </svg>
      );
    }

    if (titleKey.includes('risk')) {
      return (
        <svg width="160" height="120" viewBox="0 0 160 120" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M80 18L130 40V70C130 86 118 101 80 108C42 101 30 86 30 70V40L80 18Z" fill="#fff4c7" stroke="#f4c430" strokeWidth="4" />
          <path d="M80 46V72" stroke="#c2410c" strokeWidth="7" strokeLinecap="round" />
          <circle cx="80" cy="84" r="5" fill="#c2410c" />
        </svg>
      );
    }

    return (
      <svg width="160" height="120" viewBox="0 0 160 120" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect x="16" y="20" width="60" height="80" rx="16" fill="#fff4c7" />
        <rect x="90" y="12" width="54" height="96" rx="18" fill="#e9f7ef" />
        <circle cx="46" cy="60" r="18" stroke="#f4c430" strokeWidth="6" />
        <circle cx="117" cy="58" r="16" stroke="#1f7a4d" strokeWidth="6" />
        <path d="M30 94C52 74 78 70 110 46" stroke="#ff8f5e" strokeWidth="6" strokeLinecap="round" />
      </svg>
    );
  };

  return (
    <div className="ops-card ops-insight">
      <div className="ops-insight-body">
        <div className="ops-insight-strip">Operations Lens</div>
        <h3>{title}</h3>
        <p className="ops-muted">{text}</p>
        {highlights && highlights.length > 0 && (
          <div className="ops-insight-highlights">
            {highlights.map((item) => (
              <span key={item} className="ops-highlight">
                {item}
              </span>
            ))}
          </div>
        )}
      </div>
      <div className="ops-insight-visual" aria-hidden="true">
        {renderVisual()}
      </div>
    </div>
  );
};

export default OpsInsightCard;
