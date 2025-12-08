import React, { useState, useEffect, useRef } from 'react';
import { Leaf, ChevronDown } from 'lucide-react';
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
    zIndex: 1000,
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    background: 'rgba(255,255,255,0.98)',
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
  heroSection: {
    height: '100vh',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    textAlign: 'center',
    padding: '0 2rem',
    background: 'linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)',
  },
  label: {
    fontSize: '0.9rem',
    fontWeight: 400,
    color: '#10b981',
    letterSpacing: '4px',
    textTransform: 'uppercase',
    marginBottom: '1rem',
  },
  title: {
    fontSize: '4rem',
    fontWeight: 300,
    color: '#111',
    lineHeight: '1.1',
    marginBottom: '1.5rem',
    letterSpacing: '-0.5px',
  },
  subtitle: {
    fontSize: '1.2rem',
    color: '#374151',
    fontWeight: 300,
    maxWidth: '600px',
    marginBottom: '3rem',
    lineHeight: '1.6',
  },
  scrollIndicator: {
    position: 'absolute',
    bottom: '3rem',
    left: '50%',
    transform: 'translateX(-50%)',
    animation: 'bounce 2s infinite',
  },
  teamMemberSection: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    padding: '8rem 2rem',
    maxWidth: '1400px',
    margin: '0 auto',
    opacity: 0,
    transform: 'translateY(50px)',
    transition: 'opacity 0.8s ease, transform 0.8s ease',
  },
  memberContent: {
    display: 'flex',
    alignItems: 'center',
    gap: '6rem',
    width: '100%',
  },
  memberImageWrapper: {
    flex: 1,
    position: 'relative',
  },
  memberImage: {
    width: '100%',
    maxWidth: '500px',
    height: '600px',
    objectFit: 'cover',
    borderRadius: '2rem',
    boxShadow: '0 20px 60px rgba(16,185,129,0.15)',
  },
  memberInfo: {
    flex: 1,
  },
  memberNumber: {
    fontSize: '1rem',
    fontWeight: 400,
    color: '#10b981',
    letterSpacing: '2px',
    textTransform: 'uppercase',
    marginBottom: '1rem',
  },
  memberName: {
    fontSize: '3rem',
    fontWeight: 500,
    color: '#111',
    marginBottom: '0.5rem',
    lineHeight: '1.1',
  },
  memberRole: {
    fontSize: '1.25rem',
    fontWeight: 400,
    color: '#374151',
    marginBottom: '2rem',
    paddingBottom: '1rem',
    borderBottom: '1px solid rgba(16,185,129,0.2)',
  },
  memberDescription: {
    fontSize: '1.1rem',
    color: '#6b7280',
    lineHeight: '1.7',
    marginBottom: '3rem',
    fontWeight: 300,
  },
  servicesList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1.5rem',
  },
  serviceItem: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '1rem',
  },
  serviceIcon: {
    width: '24px',
    height: '24px',
    background: '#10b981',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    marginTop: '0.25rem',
  },
  serviceContent: {
    flex: 1,
  },
  serviceTitle: {
    fontSize: '1.1rem',
    fontWeight: 500,
    color: '#111',
    marginBottom: '0.5rem',
  },
  serviceDescription: {
    fontSize: '0.95rem',
    color: '#6b7280',
    lineHeight: '1.6',
    fontWeight: 300,
  },
};

const TeamMember = ({ member, isVisible, reverse }) => {
  return (
    <div style={{
      ...styles.teamMemberSection,
      opacity: isVisible ? 1 : 0,
      transform: isVisible ? 'translateY(0)' : 'translateY(50px)',
    }}>
      <div style={{
        ...styles.memberContent,
        flexDirection: reverse ? 'row-reverse' : 'row'
      }}>
        <div style={styles.memberImageWrapper}>
          <img 
            src={member.image} 
            alt={member.name}
            style={styles.memberImage}
          />
        </div>
        
        <div style={styles.memberInfo}>
          <div style={styles.memberNumber}>0{member.id}</div>
          <h2 style={styles.memberName}>{member.name}</h2>
          <h3 style={styles.memberRole}>{member.role}</h3>
          <p style={styles.memberDescription}>{member.description}</p>
          
          <div style={styles.servicesList}>
            {member.services.map((service, index) => (
              <div key={index} style={styles.serviceItem}>
                <div style={styles.serviceIcon}>
                  <div style={{ width: '8px', height: '8px', background: '#fff', borderRadius: '50%' }} />
                </div>
                <div style={styles.serviceContent}>
                  <h4 style={styles.serviceTitle}>{service.title}</h4>
                  <p style={styles.serviceDescription}>{service.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default function AboutUs({ onLogout }) {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [visibleSections, setVisibleSections] = useState([false, false, false]);
  const sectionRefs = [useRef(null), useRef(null), useRef(null)];

  useEffect(() => {
    setTimeout(() => setLoading(false), 400);
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          const index = sectionRefs.findIndex(ref => ref.current === entry.target);
          if (index !== -1 && entry.isIntersecting) {
            setVisibleSections(prev => {
              const newVisible = [...prev];
              newVisible[index] = true;
              return newVisible;
            });
          }
        });
      },
      {
        threshold: 0.3,
        rootMargin: '50px',
      }
    );

    sectionRefs.forEach(ref => {
      if (ref.current) observer.observe(ref.current);
    });

    return () => observer.disconnect();
  }, []);

  const teamMembers = [
    {
      id: 1,
      name: 'Hammad',
      role: 'Climate Modeling Expert',
      description: 'Leads the climate risk prediction and modeling for FasalGuard, integrating weather data and forecasting to help farmers mitigate climate-related risks through advanced AI algorithms.',
      image: 'https://i.ibb.co/spyZ5Cpr/hammad.jpg',
      services: [
        {
          title: 'Climate Risk Prediction',
          description: 'Developing AI models to predict climate risks and provide early warnings to farmers'
        },
        {
          title: 'Weather Data & Backend Integration',
          description: 'Integrating real-time weather data with agricultural models for precision forecasting'
        },
        {
          title: 'Testing & Validation',
          description: 'Rigorous testing phase to ensure model accuracy and reliability across different regions'
        }
      ]
    },
    {
      id: 2,
      name: 'Daniyal',
      role: 'Satellite Imagery Specialist',
      description: 'Handles the satellite image processing and analysis, generating stress maps and actionable insights for precision agriculture in FasalGuard.',
      image: 'https://i.ibb.co/NdcFn8qF/dani2.png',
      services: [
        {
          title: 'Satellite Image Processing',
          description: 'Processing high-resolution satellite imagery to detect crop stress and growth patterns'
        },
        {
          title: 'Stress Map Generation',
          description: 'Creating detailed stress maps to identify areas needing attention in agricultural fields'
        },
        {
          title: 'App Development',
          description: 'Developing mobile applications to deliver insights directly to farmers\' devices'
        }
      ]
    },
    {
      id: 3,
      name: 'Iqrash',
      role: 'Soil Health Analyst',
      description: 'Responsible for soil data analytics, monitoring soil health parameters, and developing models to optimize fertilizer and irrigation for FasalGuard.',
      image: 'https://i.ibb.co/F48fjvbW/iqrash.jpg',
      services: [
        {
          title: 'Soil Data Analytics',
          description: 'Analyzing soil health parameters to optimize fertilizer and irrigation strategies'
        },
        {
          title: 'Health Monitoring',
          description: 'Continuous monitoring of soil conditions and providing actionable recommendations'
        },
        {
          title: 'Frontend Development',
          description: 'Building intuitive user interfaces to visualize soil data and insights effectively'
        }
      ]
    },
  ];

  return (
    <div style={{ ...styles.page, opacity: loading ? 0 : 1, transition: 'opacity 0.6s cubic-bezier(.4,0,.2,1)' }}>
      <style>{`
        @keyframes bounce {
          0%, 20%, 50%, 80%, 100% {
            transform: translateY(0) translateX(-50%);
          }
          40% {
            transform: translateY(-10px) translateX(-50%);
          }
          60% {
            transform: translateY(-5px) translateX(-50%);
          }
        }
        
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        body {
          margin: 0;
          padding: 0;
          overflow-x: hidden;
          scroll-behavior: smooth;
        }
        
        ::-webkit-scrollbar {
          width: 8px;
        }
        
        ::-webkit-scrollbar-track {
          background: #f1f1f1;
        }
        
        ::-webkit-scrollbar-thumb {
          background: #10b981;
          border-radius: 4px;
        }
        
        .navLink:hover {
          color: #10b981;
        }
        
        .fade-in {
          animation: fadeInUp 0.8s ease-out forwards;
        }
      `}</style>

      <header style={styles.header}>
        <div style={{ ...styles.logo, cursor: 'pointer' }} onClick={() => navigate('/home')}>
          <span style={styles.logoIcon}>
            <Leaf size={20} color="#10b981" />
          </span>
          <span style={styles.logoText}>FASALGUARD</span>
        </div>
        <nav style={styles.nav}>
          <button style={styles.navLink} onClick={() => navigate('/home')}>Home</button>
          <button style={styles.navLink} type="button" onClick={() => navigate('/services')}>Services</button> 
          <button style={styles.navLink} type="button" onClick={() => navigate('/contact')}>Contact Us</button>
          <button style={styles.navLink} type="button" onClick={() => navigate('/past-trends')}>Past Trends</button>  
           <button style={{...styles.navLink, background: 'linear-gradient(90deg, #10b981 0%, #059669 100%)', color: '#fff', padding: '0.7rem 1.5rem', borderRadius: '50px'}} onClick={() => navigate('/crop-prediction')}>
            🌱 Predict Crops
          </button>     </nav>
      </header>

      {/* Hero Section */}
      <section style={styles.heroSection}>
        <div style={styles.label}>MEET THE TEAM</div>
        <h1 style={styles.title}>
          Precision Agriculture<br />Powered by Innovation
        </h1>
        <p style={styles.subtitle}>
          A multidisciplinary team dedicated to revolutionizing farming in Pakistan through AI, 
          satellite technology, and climate intelligence. Scroll to meet our experts.
        </p>
        <div style={styles.scrollIndicator}>
          <ChevronDown size={32} color="#10b981" />
        </div>
      </section>

      {/* Team Members */}
      {teamMembers.map((member, index) => (
        <div key={member.id} ref={sectionRefs[index]}>
          <TeamMember 
            member={member} 
            isVisible={visibleSections[index]}
            reverse={index % 2 === 1}
          />
        </div>
      ))}
    </div>
  );
}