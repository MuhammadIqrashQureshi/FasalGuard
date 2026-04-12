import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Leaf, ChevronDown, BarChart, Cloud, Thermometer, Droplets, Map, Bell, TrendingUp, ArrowRight, CheckCircle, Globe, Cpu, Database, Smartphone, Zap, Users, Target, Shield, Award, Clock, PieChart, Calendar, Droplet, Wind, Sun } from 'lucide-react';
import { servicesData, serviceStats, processSteps } from './ServicesData';

const Services = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState(1);
  const [scrolled, setScrolled] = useState(false);
  const [visibleServices, setVisibleServices] = useState([]);
  const [openFaq, setOpenFaq] = useState(null);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 100);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const serviceId = parseInt(entry.target.dataset.serviceId);
            setVisibleServices(prev => [...new Set([...prev, serviceId])]);
          }
        });
      },
      { threshold: 0.2, rootMargin: '50px' }
    );

    document.querySelectorAll('.service-card').forEach(card => {
      observer.observe(card);
    });

    return () => observer.disconnect();
  }, []);

  const resolveServiceRoute = (title) => {
    const key = String(title || '').toLowerCase();
    if (key.includes('weather') || key.includes('climate')) return '/crop-prediction';
    if (key.includes('soil')) return '/soil-analysis';
    if (key.includes('heatmap')) return '/satellite-analysis';
    if (key.includes('satellite')) return '/satellite-analysis';
    if (key.includes('past')) return '/past-trends';
    return '/services';
  };

  const styles = {
    page: {
      minHeight: '100vh',
      fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif',
      color: '#222',
      padding: 0,
      margin: 0,
      position: 'relative',
      overflowX: 'hidden',
      background: '#fff',
    },
    header: {
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      padding: scrolled ? '1rem 3rem' : '1.5rem 3rem',
      zIndex: 1000,
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      background: scrolled ? 'rgba(255,255,255,0.98)' : 'rgba(255,255,255,0.95)',
      backdropFilter: 'blur(10px)',
      borderBottom: '1px solid rgba(16,185,129,0.1)',
      transition: 'all 0.3s ease',
    },
    logoSection: {
      display: 'flex',
      alignItems: 'center',
      gap: '1rem',
      cursor: 'pointer',
    },
    logo: {
      border: '2px solid #10b981',
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
      color: '#059669',
      margin: 0,
      letterSpacing: '4px',
    },
    subtitle: {
      fontSize: '0.55rem',
      color: '#059669',
      margin: 0,
      fontWeight: 300,
      letterSpacing: '4px',
      textTransform: 'uppercase',
    },
    nav: {
      display: 'flex',
      gap: '2.5rem',
      alignItems: 'center',
    },
    navLink: {
      color: '#374151',
      fontSize: '0.7rem',
      fontWeight: 400,
      textDecoration: 'none',
      letterSpacing: '2px',
      textTransform: 'uppercase',
      transition: 'color 0.3s',
      cursor: 'pointer',
      background: 'transparent',
      border: 'none',
      outline: 'none',
      padding: 0,
    },
    
    // Hero Section
    heroSection: {
      background: 'linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)',
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      padding: '8rem 3rem 4rem',
      position: 'relative',
      overflow: 'hidden',
    },
    heroContainer: {
      maxWidth: '1400px',
      margin: '0 auto',
      width: '100%',
      textAlign: 'center',
      position: 'relative',
      zIndex: 2,
    },
    heroLabel: {
      fontSize: '0.9rem',
      fontWeight: 400,
      color: '#10b981',
      letterSpacing: '4px',
      textTransform: 'uppercase',
      marginBottom: '1.5rem',
      display: 'block',
    },
    heroTitle: {
      fontSize: '4.5rem',
      fontWeight: 300,
      color: '#111',
      lineHeight: '1.1',
      marginBottom: '2rem',
      maxWidth: '900px',
      marginLeft: 'auto',
      marginRight: 'auto',
    },
    heroSubtitle: {
      fontSize: '1.3rem',
      color: '#374151',
      lineHeight: '1.6',
      fontWeight: 300,
      marginBottom: '3rem',
      maxWidth: '700px',
      marginLeft: 'auto',
      marginRight: 'auto',
    },
    
    // Stats Section
    statsSection: {
      background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
      padding: '6rem 2rem',
      color: '#fff',
    },
    statsContainer: {
      maxWidth: '1400px',
      margin: '0 auto',
      width: '100%',
    },
    statsGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
      gap: '3rem',
    },
    statCard: {
      textAlign: 'center',
      padding: '2rem',
    },
    statIcon: {
      fontSize: '2.5rem',
      marginBottom: '1rem',
    },
    statNumber: {
      fontSize: '3.5rem',
      fontWeight: 300,
      color: '#fff',
      marginBottom: '0.5rem',
      lineHeight: 1,
    },
    statLabel: {
      fontSize: '1.1rem',
      color: 'rgba(255,255,255,0.9)',
      textTransform: 'uppercase',
      letterSpacing: '2px',
    },
    
    // Services Section
    servicesSection: {
      padding: '8rem 2rem',
      background: '#fff',
    },
    servicesContainer: {
      maxWidth: '1400px',
      margin: '0 auto',
      width: '100%',
    },
    servicesHeader: {
      textAlign: 'center',
      marginBottom: '5rem',
    },
    sectionTitle: {
      fontSize: '3.5rem',
      fontWeight: 300,
      color: '#111',
      marginBottom: '1.5rem',
      lineHeight: '1.2',
    },
    sectionSubtitle: {
      fontSize: '1.2rem',
      color: '#6b7280',
      maxWidth: '700px',
      margin: '0 auto',
      lineHeight: '1.6',
    },
    
    // Service Tabs
    serviceTabs: {
      display: 'flex',
      justifyContent: 'center',
      gap: '1rem',
      marginBottom: '4rem',
      flexWrap: 'wrap',
    },
    tab: {
      padding: '1rem 2rem',
      background: '#f9fafb',
      border: 'none',
      borderRadius: '50px',
      fontSize: '1rem',
      fontWeight: 500,
      color: '#6b7280',
      cursor: 'pointer',
      transition: 'all 0.3s ease',
      display: 'flex',
      alignItems: 'center',
      gap: '0.75rem',
    },
    activeTab: {
      background: 'linear-gradient(135deg, #10b981 0%, #34d399 100%)',
      color: '#fff',
      boxShadow: '0 4px 20px rgba(16,185,129,0.3)',
    },
    
    // Service Grid
    serviceGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))',
      gap: '3rem',
      marginBottom: '6rem',
    },
    serviceCard: {
      background: '#fff',
      borderRadius: '1.5rem',
      overflow: 'hidden',
      boxShadow: '0 4px 24px rgba(0,0,0,0.08)',
      border: '1px solid rgba(16,185,129,0.1)',
      transition: 'all 0.5s ease',
      opacity: 0,
      transform: 'translateY(30px)',
    },
    serviceImage: {
      width: '100%',
      height: '250px',
      objectFit: 'cover',
      transition: 'transform 0.5s ease',
    },
    serviceContent: {
      padding: '2.5rem',
    },
    serviceIcon: {
      fontSize: '2.5rem',
      marginBottom: '1.5rem',
    },
    serviceTitle: {
      fontSize: '1.8rem',
      fontWeight: 600,
      color: '#111',
      marginBottom: '0.5rem',
    },
    serviceSubtitle: {
      fontSize: '1rem',
      color: '#10b981',
      marginBottom: '1rem',
      fontWeight: 500,
    },
    serviceDescription: {
      fontSize: '1rem',
      color: '#6b7280',
      lineHeight: '1.6',
      marginBottom: '2rem',
    },
    featuresList: {
      listStyle: 'none',
      padding: 0,
      margin: 0,
    },
    featureItem: {
      display: 'flex',
      alignItems: 'flex-start',
      gap: '0.75rem',
      marginBottom: '0.75rem',
      fontSize: '0.95rem',
      color: '#6b7280',
    },
    featureIcon: {
      color: '#10b981',
      flexShrink: 0,
      marginTop: '0.25rem',
    },
    
    // Process Section
    processSection: {
      background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)',
      padding: '8rem 2rem',
    },
    faqSection: {
      padding: '7rem 2rem',
      background: '#ffffff',
    },
    faqContainer: {
      maxWidth: '1100px',
      margin: '0 auto',
      width: '100%',
      textAlign: 'center',
    },
    faqGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
      gap: '1.5rem',
      marginTop: '3rem',
      textAlign: 'left',
    },
    faqCard: {
      background: '#f8fafc',
      borderRadius: '16px',
      padding: '1.5rem',
      border: '1px solid rgba(16,185,129,0.15)',
      boxShadow: '0 10px 24px rgba(15, 23, 42, 0.06)',
      transition: 'transform 0.3s ease, box-shadow 0.3s ease',
    },
    faqHeader: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: '1rem',
      cursor: 'pointer',
      background: 'transparent',
      border: 'none',
      padding: 0,
      width: '100%',
      textAlign: 'left',
    },
    faqQuestion: {
      fontSize: '1.05rem',
      fontWeight: 600,
      color: '#111',
      marginBottom: 0,
    },
    faqAnswer: {
      fontSize: '0.95rem',
      color: '#6b7280',
      lineHeight: '1.6',
    },
    faqIcon: {
      width: '28px',
      height: '28px',
      borderRadius: '50%',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'rgba(16,185,129,0.12)',
      color: '#10b981',
      fontWeight: 700,
      flexShrink: 0,
    },
    processContainer: {
      maxWidth: '1400px',
      margin: '0 auto',
      width: '100%',
      textAlign: 'center',
    },
    processSteps: {
      display: 'flex',
      justifyContent: 'space-between',
      position: 'relative',
      marginTop: '5rem',
      flexWrap: 'wrap',
      gap: '2rem',
    },
    processStep: {
      flex: 1,
      minWidth: '250px',
      position: 'relative',
      zIndex: 2,
    },
    stepNumber: {
      width: '60px',
      height: '60px',
      background: 'linear-gradient(135deg, #10b981 0%, #34d399 100%)',
      borderRadius: '50%',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      color: '#fff',
      fontSize: '1.5rem',
      fontWeight: 600,
      margin: '0 auto 2rem',
    },
    stepIcon: {
      fontSize: '2rem',
      marginBottom: '1.5rem',
    },
    stepTitle: {
      fontSize: '1.5rem',
      fontWeight: 600,
      color: '#111',
      marginBottom: '1rem',
    },
    stepDescription: {
      fontSize: '1rem',
      color: '#6b7280',
      lineHeight: '1.6',
    },
    
    // CTA Section
    ctaSection: {
      padding: '8rem 2rem',
      background: '#fff',
      textAlign: 'center',
    },
    ctaContainer: {
      maxWidth: '800px',
      margin: '0 auto',
    },
    ctaTitle: {
      fontSize: '3.5rem',
      fontWeight: 300,
      color: '#111',
      marginBottom: '2rem',
      lineHeight: '1.2',
    },
    ctaButtons: {
      display: 'flex',
      gap: '1.5rem',
      justifyContent: 'center',
      flexWrap: 'wrap',
      marginTop: '3rem',
    },
    ctaBtn: {
      background: 'linear-gradient(90deg, #10b981 0%, #059669 100%)',
      color: '#fff',
      border: 'none',
      borderRadius: '50px',
      padding: '1.25rem 2.5rem',
      fontSize: '1rem',
      fontWeight: 500,
      cursor: 'pointer',
      letterSpacing: '1px',
      textTransform: 'uppercase',
      transition: 'all 0.3s',
      minWidth: '240px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '0.75rem',
    },
    
    // Footer
    footer: {
      background: '#111',
      color: '#fff',
      padding: '4rem 3rem',
    },
    footerContent: {
      maxWidth: '1400px',
      margin: '0 auto',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'flex-start',
      gap: '3rem',
    },
    footerTop: {
      display: 'flex',
      alignItems: 'flex-start',
      gap: '4rem',
      width: '100%',
      flexWrap: 'wrap',
    },
    footerLogoSection: {
      flex: 1,
      minWidth: '300px',
    },
    footerLinks: {
      display: 'flex',
      gap: '4rem',
      flexWrap: 'wrap',
      flex: 2,
    },
    linkColumn: {
      display: 'flex',
      flexDirection: 'column',
      gap: '1rem',
      textAlign: 'left',
    },
    linkTitle: {
      fontSize: '1rem',
      fontWeight: 500,
      color: '#10b981',
      marginBottom: '0.5rem',
      letterSpacing: '1px',
    },
    footerLink: {
      color: 'rgba(255,255,255,0.7)',
      fontSize: '0.9rem',
      textDecoration: 'none',
      cursor: 'pointer',
      background: 'none',
      border: 'none',
      padding: 0,
      textAlign: 'left',
      transition: 'color 0.3s',
    },
    footerBottom: {
      width: '100%',
      paddingTop: '3rem',
      borderTop: '1px solid rgba(255,255,255,0.1)',
    },
    footerText: {
      fontSize: '0.9rem',
      color: 'rgba(255,255,255,0.5)',
      letterSpacing: '1px',
    },
  };

  return (
    <div style={styles.page}>
      <style>{`
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
        
        @keyframes float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }
        
        .service-card.visible {
          animation: fadeInUp 0.8s ease forwards;
        }
        
        .service-card:hover .service-image {
          transform: scale(1.05);
        }
        
        .tab:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(0,0,0,0.1);
        }

        .service-cta:hover {
          transform: translateY(-4px);
          box-shadow: 0 10px 28px rgba(16,185,129,0.25);
        }

        .faq-card:hover {
          transform: translateY(-6px);
          box-shadow: 0 16px 30px rgba(15, 23, 42, 0.12);
        }
        
        .stat-card:hover .stat-icon {
          animation: float 2s ease-in-out infinite;
        }
        
        .cta-btn:hover {
          transform: translateY(-4px);
          box-shadow: 0 8px 24px rgba(16,185,129,0.3);
        }
        
        .footer-link:hover {
          color: #10b981 !important;
        }
        
        .process-steps::before {
          content: '';
          position: absolute;
          top: 30px;
          left: 12.5%;
          right: 12.5%;
          height: 2px;
          background: rgba(16,185,129,0.2);
          z-index: 1;
        }
        
        @media (max-width: 768px) {
          .process-steps::before {
            display: none;
          }
        }
      `}</style>

      {/* Header */}
      <header style={styles.header}>
        <div style={styles.logoSection} onClick={() => navigate('/home')}>
          <span style={styles.logo}><Leaf size={32} color="#10b981" /></span>
          <div style={styles.brandText}>
            <h1 style={styles.title}>FASALGUARD</h1>
            <div style={styles.subtitle}>Precision Agriculture</div>
          </div>
        </div>
        <nav style={styles.nav}>
          <button style={styles.navLink} onClick={() => navigate('/home')}>Home</button>
          <button style={styles.navLink} onClick={() => navigate('/about')}>About</button>
          <button style={{...styles.navLink, color: '#10b981', fontWeight: 500}} onClick={() => navigate('/services')}>Services</button>
          <button style={styles.navLink} onClick={() => navigate('/past-trends')}>Past Trends</button>
          <button style={styles.navLink} onClick={() => navigate('/contact')}>Contact</button>
          <button style={{...styles.navLink, background: 'linear-gradient(90deg, #10b981 0%, #059669 100%)', color: '#fff', padding: '0.7rem 1.5rem', borderRadius: '50px'}} onClick={() => navigate('/crop-prediction')}>
            🌱 Predict Crops
          </button>
        </nav>
      </header>

      {/* Hero Section */}
      <section style={styles.heroSection}>
        <div style={styles.heroContainer}>
          <span style={styles.heroLabel}>OUR SERVICES</span>
          <h1 style={styles.heroTitle}>
            Comprehensive Agricultural Intelligence Solutions
          </h1>
          <p style={styles.heroSubtitle}>
            From weather prediction to yield analysis, we provide farmers with the tools and insights needed to maximize productivity, reduce risks, and build sustainable farming practices.
          </p>
          <div style={{display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap'}}>
            <button style={{...styles.ctaBtn, background: 'linear-gradient(90deg, #3b82f6 0%, #1d4ed8 100%)'}} onClick={() => navigate('/crop-prediction')}>
              <Zap size={20} />
              Start Free Trial
            </button>
            <button style={{...styles.ctaBtn, background: 'linear-gradient(90deg, #8b5cf6 0%, #7c3aed 100%)'}} onClick={() => navigate('/contact')}>
              <Users size={20} />
              Contact
            </button>
          </div>
        </div>
        {/* Animated Background Elements */}
        <div style={{position: 'absolute', top: '10%', right: '10%', opacity: 0.1, animation: 'float 6s ease-in-out infinite'}}>
          <Cloud size={120} color="#137e5bff" />
        </div>
        <div style={{position: 'absolute', bottom: '20%', left: '10%', opacity: 0.1, animation: 'float 8s ease-in-out infinite', animationDelay: '1s'}}>
          <Sun size={100} color="#f59e0b" />
        </div>
      </section>

      {/* Stats Section */}
      <section style={styles.statsSection}>
        <div style={styles.statsContainer}>
          <div style={styles.statsGrid}>
            {serviceStats.map((stat, index) => (
              <div key={index} style={styles.statCard} className="stat-card">
                <div style={styles.statIcon}>{stat.icon}</div>
                <div style={styles.statNumber}>{stat.value}</div>
                <div style={styles.statLabel}>{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section style={styles.servicesSection}>
        <div style={styles.servicesContainer}>
          <div style={styles.servicesHeader}>
            <h2 style={styles.sectionTitle}>Our Core Services</h2>
            <p style={styles.sectionSubtitle}>
              Discover how our AI-powered platform transforms traditional farming into data-driven precision agriculture
            </p>
          </div>

          {/* Service Tabs */}
          <div style={styles.serviceTabs}>
            {servicesData.map(service => (
              <button
                key={service.id}
                style={{
                  ...styles.tab,
                  ...(activeTab === service.id ? styles.activeTab : {})
                }}
                onClick={() => setActiveTab(service.id)}
                className="tab"
              >
                <span>{service.icon}</span>
                {service.title}
              </button>
            ))}
          </div>

          {/* Services Grid */}
          <div style={styles.serviceGrid}>
            {servicesData.map(service => (
              <div
                key={service.id}
                style={{
                  ...styles.serviceCard,
                  opacity: visibleServices.includes(service.id) ? 1 : 0,
                  transform: visibleServices.includes(service.id) ? 'translateY(0)' : 'translateY(30px)',
                  animationDelay: service.animationDelay,
                }}
                className="service-card"
                data-service-id={service.id}
              >
                <div style={{overflow: 'hidden'}}>
                  <img 
                    src={service.image} 
                    alt={service.title}
                    style={styles.serviceImage}
                    className="service-image"
                  />
                </div>
                <div style={styles.serviceContent}>
                  <div style={styles.serviceIcon}>{service.icon}</div>
                  <h3 style={styles.serviceTitle}>{service.title}</h3>
                  <div style={styles.serviceSubtitle}>{service.subtitle}</div>
                  <p style={styles.serviceDescription}>{service.description}</p>
                  <ul style={styles.featuresList}>
                    {service.features.map((feature, idx) => (
                      <li key={idx} style={styles.featureItem}>
                        <CheckCircle size={18} style={styles.featureIcon} />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                  <button
                    style={{
                      ...styles.tab,
                      background: service.gradient,
                      color: '#fff',
                      marginTop: '1.5rem',
                    }}
                    onClick={() => navigate(resolveServiceRoute(service.title))}
                    className="service-cta"
                  >
                    Try {service.title}
                    <ArrowRight size={18} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section style={styles.faqSection}>
        <div style={styles.faqContainer}>
          <span style={styles.heroLabel}>FAQ</span>
          <h2 style={styles.sectionTitle}>Common Questions</h2>
          <p style={styles.sectionSubtitle}>
            Quick answers to the most asked questions about our services.
          </p>
          <div style={styles.faqGrid}>
            {[
              {
                q: 'How do I get weather predictions?',
                a: 'Open Crop Prediction to see weather-driven recommendations and forecasts.'
              },
              {
                q: 'Where can I see soil health details?',
                a: 'Use the Soil Analysis page for pH, nutrients, and soil score.'
              },
              {
                q: 'How do heatmaps help farmers?',
                a: 'Heatmaps show stress zones so you can act on the right areas.'
              },
              {
                q: 'What is Satellite Field Analysis & Alert System?',
                a: 'It combines satellite data with alerts for timely field actions.'
              },
              {
                q: 'Where can I view past trends?',
                a: 'Open Past Trends for historical performance and yield insights.'
              }
            ].map((item, idx) => (
              <div key={idx} style={styles.faqCard} className="faq-card">
                <button
                  type="button"
                  style={styles.faqHeader}
                  onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                  aria-expanded={openFaq === idx}
                  aria-controls={`faq-answer-${idx}`}
                >
                  <span style={styles.faqQuestion}>{item.q}</span>
                  <span style={styles.faqIcon}>{openFaq === idx ? '-' : '+'}</span>
                </button>
                {openFaq === idx && (
                  <div id={`faq-answer-${idx}`} style={styles.faqAnswer}>{item.a}</div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Process Section */}
      <section style={styles.processSection}>
        <div style={styles.processContainer}>
          <span style={styles.heroLabel}>HOW IT WORKS</span>
          <h2 style={styles.sectionTitle}>Our 4-Step Process</h2>
          <p style={styles.sectionSubtitle}>
            From data collection to actionable insights, our systematic approach ensures accurate and reliable agricultural intelligence
          </p>
          
          <div style={styles.processSteps} className="process-steps">
            {processSteps.map(step => (
              <div key={step.step} style={styles.processStep}>
                <div style={styles.stepNumber}>{step.step}</div>
                <div style={styles.stepIcon}>{step.icon}</div>
                <h3 style={styles.stepTitle}>{step.title}</h3>
                <p style={styles.stepDescription}>{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section style={styles.ctaSection}>
        <div style={styles.ctaContainer}>
          <h2 style={styles.ctaTitle}>Ready to Transform Your Farming?</h2>
          <p style={styles.sectionSubtitle}>
            Join thousands of farmers who are already increasing yields, reducing costs, and farming smarter with FasalGuard
          </p>
          
          <div style={styles.ctaButtons}>
            <button 
              style={styles.ctaBtn} 
              className="cta-btn"
              onClick={() => navigate('/crop-prediction')}
            >
              <Zap size={20} />
              Start Free Trial
            </button>
            <button 
              style={{...styles.ctaBtn, background: 'linear-gradient(90deg, #3b82f6 0%, #1d4ed8 100%)'}} 
              className="cta-btn"
              onClick={() => navigate('/contact')}
            >
              <Users size={20} />
              Schedule Demo
            </button>
            <button 
              style={{...styles.ctaBtn, background: 'linear-gradient(90deg, #8b5cf6 0%, #7c3aed 100%)'}} 
              className="cta-btn"
              onClick={() => navigate('/services')}
            >
              <BarChart size={20} />
              View All Services
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer style={styles.footer}>
        <div style={styles.footerContent}>
          <div style={styles.footerTop}>
            <div style={styles.footerLogoSection}>
              <div style={{...styles.logoSection, alignItems: 'flex-start'}} onClick={() => navigate('/home')}>
                <span style={{...styles.logo, border: '2px solid #179e71ff'}}><Leaf size={32} color="#10b981" /></span>
                <div style={styles.brandText}>
                  <h1 style={{...styles.title, color: '#fff', textAlign: 'left'}}>FASALGUARD</h1>
                  <div style={{...styles.subtitle, color: '#10b981', textAlign: 'left'}}>Precision Agriculture Platform</div>
                </div>
              </div>
              <p style={{color: 'rgba(255,255,255,0.7)', fontSize: '0.95rem', marginTop: '1.5rem', lineHeight: '1.6', maxWidth: '400px'}}>
                Transforming Pakistan's agriculture through AI, satellite intelligence, and climate-smart solutions for sustainable farming.
              </p>
            </div>
            
            <div style={styles.footerLinks}>
              <div style={styles.linkColumn}>
                <div style={styles.linkTitle}>Services</div>
                <button style={styles.footerLink} onClick={() => navigate('/crop-prediction')}>Weather Predictions</button>
                <button style={styles.footerLink} onClick={() => navigate('/crop-prediction')}>Climate Analysis</button>
                <button style={styles.footerLink} onClick={() => navigate('/soil-analysis')}>Soil Analysis & Health</button>
                <button style={styles.footerLink} onClick={() => navigate('/satellite-analysis')}>Crop Health Heatmaps</button>
                <button style={styles.footerLink} onClick={() => navigate('/satellite-analysis')}>Satellite Field Analysis & Alert System</button>
                <button style={styles.footerLink} onClick={() => navigate('/past-trends')}>Past Trend Analysis</button>
              </div>
              
              <div style={styles.linkColumn}>
                <div style={styles.linkTitle}>Platform</div>
                <button style={styles.footerLink} onClick={() => navigate('/crop-prediction')}>Crop Prediction</button>
                <button style={styles.footerLink} onClick={() => navigate('/past-trends')}>Past Trends</button>
                <button style={styles.footerLink} onClick={() => navigate('/prediction-results')}>Dashboard</button>
                <button style={styles.footerLink}>Mobile App</button>
              </div>
              
              <div style={styles.linkColumn}>
                <div style={styles.linkTitle}>Company</div>
                <button style={styles.footerLink} onClick={() => navigate('/about')}>About Us</button>
                <button style={styles.footerLink} onClick={() => navigate('/contact')}>Contact</button>
                <button style={styles.footerLink}>Careers</button>
                <button style={styles.footerLink}>Blog</button>
                <button style={styles.footerLink} onClick={() => window.dispatchEvent(new Event('open-help-chat'))}>Help</button>
              </div>
            </div>
          </div>
          
          <div style={styles.footerBottom}>
            <div style={styles.footerText}>
              © 2025 THE FASALGUARD. TRANSFORMING PAKISTAN'S AGRICULTURE WITH AI & INNOVATION.
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Services;