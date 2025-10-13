import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Leaf, ChevronDown, BarChart, Map, Sun, AlertCircle, CloudRain } from 'lucide-react';

export default function HomePage({ onLogout }) {
  // Splash animation removed
  const [isDarkMode, setIsDarkMode] = useState(false);
  const navigate = useNavigate();
  const [currentBg, setCurrentBg] = useState(0);
  const [activeSection, setActiveSection] = useState(0);
  const [loading, setLoading] = useState(true);
  const [showDropdown, setShowDropdown] = useState(false);

  const backgroundImages = [
    'https://images.unsplash.com/photo-1574943320219-553eb213f72d?w=1920&q=85',
    'https://images.unsplash.com/photo-1560493676-04071c5f467b?w=1920&q=85',
    'https://images.unsplash.com/photo-1625246333195-78d9c38ad449?w=1920&q=85',
    'https://images.unsplash.com/photo-1464226184884-fa280b87c399?w=1920&q=85',
    'https://images.unsplash.com/photo-1558818498-28c1e002b655?w=1920&q=85',
  ];

  // Splash animation removed

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentBg((prev) => (prev + 1) % backgroundImages.length);
    }, 7000);
    return () => clearInterval(interval);
  }, [backgroundImages.length]);

  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY;
      const windowHeight = window.innerHeight;
      const section = Math.round(scrollPosition / windowHeight);
      setActiveSection(section);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setTimeout(() => setLoading(false), 400);
  }, []);

  useEffect(() => {
    if (!showDropdown) return;
    const handleClick = (e) => {
      const profileIcon = document.querySelector('.profileIcon');
      const dropdown = document.querySelector('[tabindex="-1"]');
      if (profileIcon && dropdown && !profileIcon.contains(e.target) && !dropdown.contains(e.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [showDropdown]);

  const getLetterStyle = (letter) => ({
    position: 'absolute',
    fontSize: 'clamp(2rem, 8vw, 5rem)',
    fontWeight: 'bold',
    color: isDarkMode ? '#10b981' : '#059669',
    textShadow: isDarkMode
      ? '0 0 30px rgba(16, 185, 129, 0.6)'
      : '0 0 20px rgba(5, 150, 105, 0.4)',
    transition: 'all 2s cubic-bezier(0.68, -0.55, 0.265, 1.55)',
    willChange: 'transform',
    letterSpacing: '0.1em',
    left: `${letter.x}%`,
    top: `${letter.y}%`,
    transform: `translate(-50%, -50%) rotate(${letter.rotation}deg) scale(${letter.scale})`,
  });

  const styles = {
    page: {
      minHeight: '100vh',
      fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif',
      color: '#fff',
      padding: 0,
      margin: 0,
      position: 'relative',
      overflowX: 'hidden',
      width: '100%',
    },
    bgImage: {
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100%',
      height: '100%',
      objectFit: 'cover',
      zIndex: -2,
      filter: 'brightness(0.65)',
      transition: 'opacity 1.5s ease-in-out',
    },
    bgOverlay: {
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100%',
      height: '100%',
      background: 'linear-gradient(135deg, rgba(10,40,20,0.4) 0%, rgba(20,50,30,0.5) 100%)',
      zIndex: -1,
    },
    header: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '1.5rem 3rem',
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      zIndex: 100,
      background: 'transparent',
      backdropFilter: 'none',
    },
    logoSection: {
      display: 'flex',
      alignItems: 'center',
      gap: '1rem',
    },
    logo: {
      border: '3px solid rgba(187,247,208,0.3)',
      borderRadius: '50%',
      padding: '0.5rem',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    },
    brandText: {
      display: 'flex',
      flexDirection: 'column',
    },
    title: {
      fontSize: '1.2rem',
      fontWeight: 400,
      color: '#fff',
      margin: 0,
      letterSpacing: '4px',
      fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif',
    },
    subtitle: {
      fontSize: '0.55rem',
      color: '#bbf7d0',
      margin: 0,
      fontWeight: 300,
      letterSpacing: '4px',
      textTransform: 'uppercase',
      fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif',
    },
    nav: {
      display: 'flex',
      gap: '2.5rem',
      alignItems: 'center',
    },
    navLink: {
      color: '#fff',
      fontSize: '0.7rem',
      fontWeight: 400,
      textDecoration: 'none',
      letterSpacing: '2px',
      textTransform: 'uppercase',
      transition: 'color 0.3s, background 0.3s',
      cursor: 'pointer',
      fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif',
      background: 'transparent',
      border: 'none',
      outline: 'none',
      padding: 0,
    },
    section: {
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      position: 'relative',
      padding: '0 2rem',
      scrollSnapAlign: 'start',
    },
    heroContent: {
      textAlign: 'center',
      maxWidth: '900px',
      zIndex: 10,
    },
    heroLabel: {
      fontSize: '0.7rem',
      fontWeight: 300,
      color: '#bbf7d0',
      marginBottom: '1.5rem',
      letterSpacing: '3px',
      textTransform: 'uppercase',
      fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif',
    },
    heroText: {
      fontSize: '2.5rem',
      fontWeight: 300,
      color: '#fff',
      lineHeight: '1.5',
      marginBottom: '2.5rem',
      textTransform: 'uppercase',
      letterSpacing: '3px',
      fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif',
    },
    exploreBtn: {
      background: 'transparent',
      color: '#fff',
      border: '1px solid rgba(255,255,255,0.5)',
      borderRadius: '0',
      padding: '0.9rem 2.5rem',
      fontSize: '0.75rem',
      fontWeight: 400,
      cursor: 'pointer',
      letterSpacing: '3px',
      textTransform: 'uppercase',
      transition: 'all 0.3s',
      fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif',
    },
    sideNav: {
      position: 'fixed',
      left: '2.5rem',
      top: '35%',
      display: 'flex',
      flexDirection: 'column',
      gap: '0.5rem',
      zIndex: 100,
      alignItems: 'center',
    },
    sideNavItem: {
      color: '#fff',
      fontSize: '0.9rem',
      fontWeight: 300,
      cursor: 'pointer',
      opacity: 0.5,
      transition: 'opacity 0.3s',
      fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif',
      width: '30px',
      height: '30px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      border: '1px solid rgba(255,255,255,0.3)',
      borderRadius: '50%',
    },
    sideNavItemActive: {
      color: '#fff',
      fontSize: '0.9rem',
      fontWeight: 300,
      cursor: 'pointer',
      opacity: 1,
      fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif',
      width: '30px',
      height: '30px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      border: '1px solid rgba(255,255,255,0.8)',
      borderRadius: '50%',
      background: 'rgba(255,255,255,0.1)',
    },
    sideScroll: {
      position: 'fixed',
      left: '2.5rem',
      bottom: '3rem',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: '1rem',
      color: '#fff',
      fontSize: '0.7rem',
      letterSpacing: '3px',
      opacity: 0.6,
      zIndex: 100,
    },
    scrollText: {
      transform: 'rotate(-90deg)',
      whiteSpace: 'nowrap',
    },
    scrollArrow: {
      animation: 'bounce 2s infinite',
    },
    decorativeIcon: {
      position: 'fixed',
      right: '3rem',
      top: '50%',
      transform: 'translateY(-50%)',
      opacity: 0.1,
      zIndex: 1,
    },
    aboutSection: {
      background: 'rgba(255,255,255,0.98)',
      minHeight: '100vh',
      padding: '6rem 2rem 4rem 2rem',
      color: '#222',
    },
    aboutContainer: {
      maxWidth: '1400px',
      margin: '0 auto',
    },
    sectionTitle: {
      fontSize: '3rem',
      fontWeight: 300,
      color: '#059669',
      textAlign: 'center',
      marginBottom: '1rem',
      letterSpacing: '4px',
      textTransform: 'uppercase',
    },
    sectionSubtitle: {
      fontSize: '1.1rem',
      color: '#374151',
      textAlign: 'center',
      marginBottom: '4rem',
      fontWeight: 300,
    },
    statsGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
      gap: '3rem',
      marginBottom: '5rem',
    },
    statCard: {
      textAlign: 'center',
      padding: '2rem',
    },
    statNumber: {
      fontSize: '4rem',
      fontWeight: 300,
      color: '#10b981',
      marginBottom: '0.5rem',
    },
    statLabel: {
      fontSize: '1rem',
      color: '#374151',
      textTransform: 'uppercase',
      letterSpacing: '2px',
    },
    features: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
      gap: '2rem',
      marginTop: '4rem',
    },
    card: {
      background: '#fff',
      borderRadius: '1.2rem',
      boxShadow: '0 2px 12px rgba(16,185,129,0.08)',
      padding: '2rem 1.5rem',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'flex-start',
      gap: '1rem',
      minHeight: '220px',
      transition: 'all 0.3s',
      border: '1px solid rgba(16,185,129,0.1)',
    },
    cardIcon: {
      background: 'linear-gradient(90deg, #10b981 0%, #99f6e4 100%)',
      borderRadius: '0.75rem',
      padding: '0.5rem',
    },
    cardTitle: {
      fontSize: '1.2rem',
      fontWeight: 600,
      color: '#059669',
      margin: 0,
    },
    cardDesc: {
      fontSize: '1rem',
      color: '#374151',
      margin: 0,
      fontWeight: 400,
      lineHeight: '1.6',
    },
    cta: {
      display: 'flex',
      gap: '1.5rem',
      margin: '4rem 0 2rem 0',
      justifyContent: 'center',
    },
    ctaBtn: {
      background: 'linear-gradient(90deg, #10b981 0%, #059669 100%)',
      color: '#fff',
      border: 'none',
      borderRadius: '8px',
      padding: '1rem 2rem',
      fontSize: '0.9rem',
      fontWeight: 500,
      cursor: 'pointer',
      letterSpacing: '1px',
      textTransform: 'uppercase',
      transition: 'all 0.3s',
    },
    footer: {
      textAlign: 'center',
      marginTop: '4rem',
      color: '#666',
      fontSize: '0.75rem',
      letterSpacing: '1px',
      opacity: 0.6,
    },
  };

  // Splash animation removed

  return (
    <div style={{ ...styles.page, opacity: loading ? 0 : 1, transition: 'opacity 0.6s cubic-bezier(.4,0,.2,1)' }}>
      <style>{`
        body {
          margin: 0;
          padding: 0;
          overflow-x: hidden;
          scroll-behavior: smooth;
        }
        ::-webkit-scrollbar {
          width: 0px;
          background: transparent;
        }
        * {
          scrollbar-width: none;
          -ms-overflow-style: none;
        }
        @keyframes bounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(10px); }
        }
        .card:hover {
          transform: translateY(-5px);
          box-shadow: 0 8px 24px rgba(16,185,129,0.15);
        }
        .exploreBtn {
          transition: background 0.3s, color 0.3s, box-shadow 0.3s, transform 0.2s;
        }
        .exploreBtn:hover {
          background: #fff !important;
          color: #222 !important;
          border-color: #fff;
          box-shadow: 0 4px 16px rgba(16,185,129,0.18);
          transform: translateY(-2px) scale(1.04);
        }
        .ctaBtn:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 16px rgba(16,185,129,0.3);
        }
      `}</style>
      
      {backgroundImages.map((img, index) => (
        <img
          key={index}
          src={img}
          alt="Background"
          style={{
            ...styles.bgImage,
            opacity: currentBg === index ? 1 : 0,
            pointerEvents: 'none',
          }}
          loading={index === 0 ? "eager" : "lazy"}
        />
      ))}

      <div style={styles.bgOverlay}></div>

      <header style={styles.header}>
        <div style={styles.logoSection}>
          <span style={styles.logo}><Leaf size={32} color="#bbf7d0" /></span>
          <div style={styles.brandText}>
            <h1 style={styles.title}>FASALGUARD</h1>
            <div style={styles.subtitle}>Join The Green Revolution</div>
          </div>
        </div>
        <nav style={styles.nav}>
          <button style={styles.navLink} type="button" onClick={() => navigate('/about')}>About Us</button>
          <a
            style={styles.navLink}
            onClick={e => {
              e.preventDefault();
              document.body.style.scrollBehavior = 'auto';
              navigate('/contact');
              setTimeout(() => {
                document.body.style.scrollBehavior = 'smooth';
              }, 500);
            }}
            href="/contact"
          >Contact Us</a>
          <div style={{ position: 'relative', marginLeft: '1.5rem' }}>
            <span
              style={{ color: '#fff', fontSize: '1.5rem', cursor: 'pointer', transition: 'color 0.3s' }}
              onClick={() => setShowDropdown((prev) => !prev)}
              title="Profile"
              className="profileIcon"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24"><circle cx="12" cy="8" r="4" stroke="currentColor" strokeWidth="2"/><path stroke="currentColor" strokeWidth="2" d="M4 20c0-2.21 3.58-4 8-4s8 1.79 8 4"/></svg>
            </span>
            {showDropdown && (
              <div
                style={{
                  position: 'absolute',
                  top: 'calc(100% + 8px)',
                  right: 0,
                  background: '#222',
                  color: '#fff',
                  borderRadius: '10px',
                  boxShadow: '0 4px 24px rgba(16,185,129,0.18)',
                  minWidth: '140px',
                  zIndex: 999,
                  padding: '0.5rem 0',
                  fontSize: '1rem',
                  border: '1px solid #059669',
                  animation: 'fadeIn 0.2s',
                }}
                tabIndex={-1}
              >
                <button
                  style={{
                    background: 'none',
                    border: 'none',
                    color: '#fff',
                    width: '100%',
                    textAlign: 'left',
                    padding: '0.75rem 1.5rem',
                    cursor: 'pointer',
                    fontSize: '1rem',
                    transition: 'background 0.2s',
                  }}
                  onClick={() => { setShowDropdown(false); navigate('/profile'); }}
                  onMouseDown={e => e.preventDefault()}
                >Account</button>
                <button
                  style={{
                    background: 'none',
                    border: 'none',
                    color: '#fff',
                    width: '100%',
                    textAlign: 'left',
                    padding: '0.75rem 1.5rem',
                    cursor: 'pointer',
                    fontSize: '1rem',
                    transition: 'background 0.2s',
                  }}
                  onClick={() => {
                    setShowDropdown(false);
                    if (typeof onLogout === 'function') {
                      onLogout();
                    } else {
                      navigate('/login');
                    }
                  }}
                  onMouseDown={e => e.preventDefault()}
                >Logout</button>
              </div>
            )}
          </div>
        </nav>
      </header>

      <div style={styles.sideNav}>
        {backgroundImages.map((img, idx) => (
          <div
            key={idx}
            style={currentBg === idx ? styles.sideNavItemActive : styles.sideNavItem}
            aria-label={`Background ${idx + 1}`}
          >
            {String(idx + 1).padStart(2, '0')}
          </div>
        ))}
      </div>

      <div style={styles.sideScroll}>
        <div style={styles.scrollText}>SCROLL</div>
        <div style={styles.scrollArrow}>
          <ChevronDown size={20} />
        </div>
      </div>

      <div style={styles.decorativeIcon}>
        <svg width="200" height="400" viewBox="0 0 200 400" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M100 50 L100 150 M50 100 L150 100 M100 150 L50 200 M100 150 L150 200 M50 200 L50 250 M150 200 L150 250 M50 250 L100 300 M150 250 L100 300 M100 300 L100 350" 
            stroke="#bbf7d0" strokeWidth="3" strokeLinecap="round"/>
        </svg>
      </div>

      <section style={styles.section}>
        <div style={styles.heroContent}>
          <div style={styles.heroLabel}>Pakistani Proverb</div>
          <h2 style={styles.heroText}>
            "Knowledge is like a garden; if it is not cultivated, it cannot be harvested."
          </h2>
          <button style={styles.exploreBtn} className="exploreBtn">Explore Now</button>
        </div>
      </section>

      <section style={styles.aboutSection}>
        <div style={styles.aboutContainer}>
          <h2 style={styles.sectionTitle}>Empowering Pakistan's Agriculture</h2>
          <p style={styles.sectionSubtitle}>
            Leveraging AI and satellite technology to transform farming across Punjab
          </p>

          <div style={styles.statsGrid}>
            <div style={styles.statCard}>
              <div style={styles.statNumber}>50K+</div>
              <div style={styles.statLabel}>Farmers Served</div>
            </div>
            <div style={styles.statCard}>
              <div style={styles.statNumber}>95%</div>
              <div style={styles.statLabel}>Accuracy Rate</div>
            </div>
            <div style={styles.statCard}>
              <div style={styles.statNumber}>2M+</div>
              <div style={styles.statLabel}>Acres Monitored</div>
            </div>
            <div style={styles.statCard}>
              <div style={styles.statNumber}>30%</div>
              <div style={styles.statLabel}>Yield Increase</div>
            </div>
          </div>

          <div style={styles.features}>
            <div style={styles.card} className="card">
              <span style={styles.cardIcon}><BarChart size={28} /></span>
              <div style={styles.cardTitle}>Yield Forecasting</div>
              <div style={styles.cardDesc}>Combines LSTM, Random Forest, and CNN models to predict crop yields using climate, soil, and satellite data.</div>
            </div>
            <div style={styles.card} className="card">
              <span style={styles.cardIcon}><Map size={28} /></span>
              <div style={styles.cardTitle}>Hyperlocal Stress Mapping</div>
              <div style={styles.cardDesc}>Generates intuitive heatmaps to identify crop stress and yield risk zones at the field level.</div>
            </div>
            <div style={styles.card} className="card">
              <span style={styles.cardIcon}><Sun size={28} /></span>
              <div style={styles.cardTitle}>Soil Health Analysis</div>
              <div style={styles.cardDesc}>Monitors pH, Nitrogen, moisture, and organic matter to optimize fertilizer and irrigation schedules.</div>
            </div>
            <div style={styles.card} className="card">
              <span style={styles.cardIcon}><AlertCircle size={28} /></span>
              <div style={styles.cardTitle}>Real-Time Alerts & Dashboard</div>
              <div style={styles.cardDesc}>Provides SMS alerts and an interactive dashboard for immediate action and decision-making.</div>
            </div>
            <div style={styles.card} className="card">
              <span style={styles.cardIcon}><CloudRain size={28} /></span>
              <div style={styles.cardTitle}>Climate Risk Prediction</div>
              <div style={styles.cardDesc}>Integrates flood and drought forecasting to proactively mitigate losses and strengthen resilience.</div>
            </div>
          </div>

          <div style={styles.cta}>
            <button style={styles.ctaBtn} className="ctaBtn">View Dashboard</button>
            <button style={styles.ctaBtn} className="ctaBtn">Get SMS Alerts</button>
            <button style={styles.ctaBtn} className="ctaBtn">Analyze My Field</button>
          </div>

          <div style={styles.footer}>
            © 2025 THE FASALGUARD. TRADEMARKS AND BRANDS ARE THE PROPERTY OF THEIR RESPECTIVE OWNERS.
          </div>
        </div>
      </section>
    </div>
  );
}