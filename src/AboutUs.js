import React, { useState, useEffect } from 'react';
import { Leaf } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const styles = {
  page: {
    minHeight: '100vh',
    fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif',
    color: '#222',
    padding: 0,
    margin: 0,
    background: '#fff',
    overflowX: 'hidden',
  },
  header: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    padding: '2rem 3rem',
    zIndex: 100,
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    background: 'rgba(255,255,255,0.95)',
    backdropFilter: 'blur(10px)',
    borderBottom: '1px solid rgba(16,185,129,0.1)',
  },
  logo: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
  },
  logoIcon: {
    border: '2px solid #10b981',
    borderRadius: '50%',
    padding: '0.3rem',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoText: {
    fontSize: '1rem',
    fontWeight: 400,
    color: '#059669',
    letterSpacing: '3px',
    textTransform: 'uppercase',
  },
  nav: {
    display: 'flex',
    gap: '3rem',
    alignItems: 'center',
  },
  navLink: {
    color: '#374151',
    fontSize: '0.85rem',
    fontWeight: 400,
    textDecoration: 'none',
    letterSpacing: '1px',
    cursor: 'pointer',
    transition: 'color 0.3s',
    background: 'transparent',
    border: 'none',
    outline: 'none',
    padding: 0,
  },
  container: {
    maxWidth: '1400px',
    margin: '0 auto',
    padding: '8rem 2rem 4rem 2rem',
  },
  labelSection: {
    textAlign: 'center',
    marginBottom: '2rem',
  },
  label: {
    fontSize: '0.9rem',
    fontWeight: 400,
    color: '#9ca3af',
    letterSpacing: '4px',
    textTransform: 'uppercase',
  },
  titleSection: {
    textAlign: 'center',
    marginBottom: '1rem',
  },
  title: {
    fontSize: '3.5rem',
    fontWeight: 300,
    color: '#111',
    lineHeight: '1.2',
    marginBottom: '1rem',
    letterSpacing: '1px',
  },
  subtitle: {
    fontSize: '1.1rem',
    color: '#374151',
    fontWeight: 300,
    marginBottom: '5rem',
  },
  teamGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
    gap: '3rem',
    marginTop: '4rem',
  },
  teamCard: {
    position: 'relative',
    background: '#f9fafb',
    borderRadius: '1rem',
    overflow: 'hidden',
    transition: 'transform 0.3s, box-shadow 0.3s',
  },
  imageWrapper: {
    width: '100%',
    height: '400px',
    background: 'linear-gradient(135deg, #d1fae5 0%, #a7f3d0 100%)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    overflow: 'hidden',
  },
  placeholderImage: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
  },
  badge: {
    position: 'absolute',
    bottom: '1.5rem',
    right: '1.5rem',
    background: '#fff',
    padding: '0.5rem 1rem',
    borderRadius: '2rem',
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
  },
  badgeIcon: {
    width: '8px',
    height: '8px',
    background: '#10b981',
    borderRadius: '50%',
  },
  badgeName: {
    fontSize: '0.85rem',
    fontWeight: 500,
    color: '#374151',
  },
  cardContent: {
    padding: '2rem',
    background: '#f0fdf4',
  },
  cardNumber: {
    fontSize: '2rem',
    fontWeight: 300,
    color: '#10b981',
    marginBottom: '1rem',
  },
  cardTitle: {
    fontSize: '1.5rem',
    fontWeight: 500,
    color: '#111',
    marginBottom: '0.75rem',
  },
  cardDescription: {
    fontSize: '0.95rem',
    color: '#6b7280',
    lineHeight: '1.6',
    fontWeight: 300,
  },
};

export default function AboutUs({ onLogout }) {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    setTimeout(() => setLoading(false), 400);
  }, []);
    const [showDropdown, setShowDropdown] = useState(false);
    useEffect(() => {
      const handleClick = (e) => {
        if (!e.target.closest('.profileIcon')) setShowDropdown(false);
      };
      document.addEventListener('mousedown', handleClick);
      return () => document.removeEventListener('mousedown', handleClick);
    }, []);
  const teamMembers = [
    {
      id: 1,
      name: 'Hammad',
      role: 'Climate Modeling',
      description: 'Leads the climate risk prediction and modeling for FasalGuard, integrating weather data and forecasting to help farmers mitigate climate-related risks.',
      image: 'https://i.ibb.co/spyZ5Cpr/hammad.jpg',
    },
    {
      id: 2,
      name: 'Daniyal',
      role: 'Satellite Imagery & Analysis',
      description: 'Handles the satellite image processing and analysis, generating stress maps and actionable insights for precision agriculture in FasalGuard.',
      image: 'https://i.ibb.co/NdcFn8qF/dani2.png',
    },
    {
      id: 3,
      name: 'Iqrash',
      role: 'Soil Health & Analytics',
      description: 'Responsible for soil data analytics, monitoring soil health parameters, and developing models to optimize fertilizer and irrigation for FasalGuard.',
      image: 'https://i.ibb.co/F48fjvbW/iqrash.jpg',
    },
  ];

  return (
    <div style={{ ...styles.page, opacity: loading ? 0 : 1, transition: 'opacity 0.6s cubic-bezier(.4,0,.2,1)' }}>
      <style>{`
        body {
          margin: 0;
          padding: 0;
          overflow-x: hidden;
        }
        ::-webkit-scrollbar {
          width: 0px;
          background: transparent;
        }
        * {
          scrollbar-width: none;
          -ms-overflow-style: none;
        }
        .navLink:hover {
          color: #10b981;
        }
        .teamCard:hover {
          transform: translateY(-8px);
          box-shadow: 0 12px 24px rgba(16,185,129,0.15);
        }
      `}</style>

      <header style={styles.header}>
  <div style={{ ...styles.logo, cursor: 'pointer' }} onClick={() => navigate('/home')} role="button" tabIndex={0} aria-label="Go to homepage">
          <span style={styles.logoIcon}>
            <Leaf size={20} color="#10b981" />
          </span>
          <span style={styles.logoText}>FASALGUARD</span>
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
        </nav>
      </header>

      <div style={styles.container}>
        <div style={styles.labelSection}>
          <div style={styles.label}>ABOUT</div>
        </div>

        <div style={styles.titleSection}>
          <h1 style={styles.title}>
            The dream team of<br />precision agriculture.
          </h1>
          <p style={styles.subtitle}>
            Empowering Pakistan's Farmers with AI. Innovation. Impact.
          </p>
        </div>

        <div style={styles.teamGrid}>
          {teamMembers.map((member) => (
            <div key={member.id} style={styles.teamCard} className="teamCard">
              <div style={styles.imageWrapper}>
                <img 
                  src={member.image} 
                  alt={member.name}
                  style={styles.placeholderImage}
                />
                <div style={styles.badge}>
                  <div style={styles.badgeIcon}></div>
                  <span style={styles.badgeName}>{member.name}</span>
                </div>
              </div>
              <div style={styles.cardContent}>
                <div style={styles.cardNumber}>0{member.id}</div>
                <h3 style={styles.cardTitle}>{member.role}</h3>
                <p style={styles.cardDescription}>{member.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}