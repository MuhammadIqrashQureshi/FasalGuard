import React, { useState } from 'react';
import { Leaf, User, Mail, Calendar, LogOut, Settings, Shield, BarChart3 } from 'lucide-react';

const Dashboard = ({ user, onLogout }) => {
  const [isDarkMode, setIsDarkMode] = useState(false);

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
  };

  const handleLogout = async () => {
    try {
      const token = localStorage.getItem('token');
      await fetch('http://localhost:5000/api/auth/logout', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      onLogout();
    }
  };

  const styles = {
    container: {
      minHeight: '100vh',
      backgroundColor: isDarkMode ? '#0f172a' : '#f8fafc',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
      transition: 'background-color 0.3s ease',
    },
    header: {
      backgroundColor: isDarkMode ? '#1e293b' : '#ffffff',
      borderBottom: isDarkMode ? '1px solid #334155' : '1px solid #e2e8f0',
      padding: '1rem 2rem',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      boxShadow: isDarkMode ? '0 1px 3px rgba(0, 0, 0, 0.3)' : '0 1px 3px rgba(0, 0, 0, 0.1)',
    },
    logo: {
      display: 'flex',
      alignItems: 'center',
      gap: '0.75rem',
    },
    logoIcon: {
      width: '40px',
      height: '40px',
      borderRadius: '8px',
      background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    },
    logoText: {
      fontSize: '1.5rem',
      fontWeight: 'bold',
      color: isDarkMode ? '#ffffff' : '#1f2937',
    },
    headerRight: {
      display: 'flex',
      alignItems: 'center',
      gap: '1rem',
    },
    darkModeToggle: {
      width: '40px',
      height: '40px',
      borderRadius: '50%',
      border: isDarkMode ? '2px solid #334155' : '2px solid #e5e7eb',
      backgroundColor: isDarkMode ? '#1e293b' : '#f9fafb',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      cursor: 'pointer',
      transition: 'all 0.3s ease',
    },
    userInfo: {
      display: 'flex',
      alignItems: 'center',
      gap: '0.75rem',
      padding: '0.5rem 1rem',
      backgroundColor: isDarkMode ? '#334155' : '#f1f5f9',
      borderRadius: '8px',
    },
    userAvatar: {
      width: '32px',
      height: '32px',
      borderRadius: '50%',
      backgroundColor: '#10b981',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      color: 'white',
      fontWeight: 'bold',
    },
    userName: {
      color: isDarkMode ? '#ffffff' : '#1f2937',
      fontWeight: '600',
      fontSize: '0.875rem',
    },
    logoutButton: {
      padding: '0.5rem 1rem',
      backgroundColor: '#ef4444',
      color: 'white',
      border: 'none',
      borderRadius: '6px',
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      gap: '0.5rem',
      fontSize: '0.875rem',
      fontWeight: '500',
      transition: 'all 0.3s ease',
    },
    main: {
      padding: '2rem',
      maxWidth: '1200px',
      margin: '0 auto',
    },
    welcomeCard: {
      backgroundColor: isDarkMode ? '#1e293b' : '#ffffff',
      borderRadius: '12px',
      padding: '2rem',
      marginBottom: '2rem',
      boxShadow: isDarkMode ? '0 4px 6px rgba(0, 0, 0, 0.1)' : '0 4px 6px rgba(0, 0, 0, 0.05)',
      border: isDarkMode ? '1px solid #334155' : '1px solid #e2e8f0',
    },
    welcomeTitle: {
      fontSize: '2rem',
      fontWeight: 'bold',
      color: isDarkMode ? '#ffffff' : '#1f2937',
      marginBottom: '0.5rem',
    },
    welcomeSubtitle: {
      color: isDarkMode ? '#94a3b8' : '#6b7280',
      fontSize: '1.125rem',
    },
    statsGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
      gap: '1.5rem',
      marginBottom: '2rem',
    },
    statCard: {
      backgroundColor: isDarkMode ? '#1e293b' : '#ffffff',
      borderRadius: '12px',
      padding: '1.5rem',
      boxShadow: isDarkMode ? '0 4px 6px rgba(0, 0, 0, 0.1)' : '0 4px 6px rgba(0, 0, 0, 0.05)',
      border: isDarkMode ? '1px solid #334155' : '1px solid #e2e8f0',
      display: 'flex',
      alignItems: 'center',
      gap: '1rem',
    },
    statIcon: {
      width: '48px',
      height: '48px',
      borderRadius: '8px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    },
    statContent: {
      flex: 1,
    },
    statTitle: {
      fontSize: '0.875rem',
      color: isDarkMode ? '#94a3b8' : '#6b7280',
      marginBottom: '0.25rem',
    },
    statValue: {
      fontSize: '1.5rem',
      fontWeight: 'bold',
      color: isDarkMode ? '#ffffff' : '#1f2937',
    },
    userDetailsCard: {
      backgroundColor: isDarkMode ? '#1e293b' : '#ffffff',
      borderRadius: '12px',
      padding: '2rem',
      boxShadow: isDarkMode ? '0 4px 6px rgba(0, 0, 0, 0.1)' : '0 4px 6px rgba(0, 0, 0, 0.05)',
      border: isDarkMode ? '1px solid #334155' : '1px solid #e2e8f0',
    },
    cardTitle: {
      fontSize: '1.25rem',
      fontWeight: 'bold',
      color: isDarkMode ? '#ffffff' : '#1f2937',
      marginBottom: '1.5rem',
      display: 'flex',
      alignItems: 'center',
      gap: '0.5rem',
    },
    detailRow: {
      display: 'flex',
      alignItems: 'center',
      gap: '1rem',
      padding: '0.75rem 0',
      borderBottom: isDarkMode ? '1px solid #334155' : '1px solid #e2e8f0',
    },
    detailIcon: {
      color: '#10b981',
      width: '20px',
    },
    detailLabel: {
      color: isDarkMode ? '#94a3b8' : '#6b7280',
      fontSize: '0.875rem',
      minWidth: '100px',
    },
    detailValue: {
      color: isDarkMode ? '#ffffff' : '#1f2937',
      fontSize: '0.875rem',
      fontWeight: '500',
    },
  };

  return (
    <div style={styles.container}>
      <style>{`
        button:hover {
          transform: translateY(-1px);
        }
        .dark-mode-toggle:hover {
          transform: scale(1.05);
        }
        .logout-button:hover {
          background-color: #dc2626;
        }
      `}</style>
      
      <header style={styles.header}>
        <div style={styles.logo}>
          <div style={styles.logoIcon}>
            <Leaf color="white" size={24} />
          </div>
          <div style={styles.logoText}>FasalGuard</div>
        </div>
        
        <div style={styles.headerRight}>
          <button 
            style={styles.darkModeToggle}
            onClick={toggleDarkMode}
            className="dark-mode-toggle"
          >
            {isDarkMode ? <Sun size={20} color="#10b981" /> : <Moon size={20} color="#6b7280" />}
          </button>
          
          <div style={styles.userInfo}>
            <div style={styles.userAvatar}>
              {user?.name?.charAt(0)?.toUpperCase() || 'U'}
            </div>
            <div style={styles.userName}>{user?.name || 'User'}</div>
          </div>
          
          <button 
            style={styles.logoutButton}
            onClick={handleLogout}
            className="logout-button"
          >
            <LogOut size={16} />
            Logout
          </button>
        </div>
      </header>

      <main style={styles.main}>
        <div style={styles.welcomeCard}>
          <h1 style={styles.welcomeTitle}>
            Welcome back, {user?.name || 'User'}! 👋
          </h1>
          <p style={styles.welcomeSubtitle}>
            Your agricultural monitoring dashboard is ready.
          </p>
        </div>

        <div style={styles.statsGrid}>
          <div style={styles.statCard}>
            <div style={{...styles.statIcon, backgroundColor: '#dbeafe'}}>
              <BarChart3 color="#3b82f6" size={24} />
            </div>
            <div style={styles.statContent}>
              <div style={styles.statTitle}>Active Fields</div>
              <div style={styles.statValue}>12</div>
            </div>
          </div>
          
          <div style={styles.statCard}>
            <div style={{...styles.statIcon, backgroundColor: '#dcfce7'}}>
              <Shield color="#10b981" size={24} />
            </div>
            <div style={styles.statContent}>
              <div style={styles.statTitle}>Protected Crops</div>
              <div style={styles.statValue}>8</div>
            </div>
          </div>
          
          <div style={styles.statCard}>
            <div style={{...styles.statIcon, backgroundColor: '#fef3c7'}}>
              <Calendar color="#f59e0b" size={24} />
            </div>
            <div style={styles.statContent}>
              <div style={styles.statTitle}>Alerts Today</div>
              <div style={styles.statValue}>3</div>
            </div>
          </div>
        </div>

        <div style={styles.userDetailsCard}>
          <h2 style={styles.cardTitle}>
            <User size={20} />
            Account Information
          </h2>
          
          <div style={styles.detailRow}>
            <Mail style={styles.detailIcon} />
            <div style={styles.detailLabel}>Email:</div>
            <div style={styles.detailValue}>{user?.email || 'N/A'}</div>
          </div>
          
          <div style={styles.detailRow}>
            <User style={styles.detailIcon} />
            <div style={styles.detailLabel}>Name:</div>
            <div style={styles.detailValue}>{user?.name || 'N/A'}</div>
          </div>
          
          <div style={styles.detailRow}>
            <Shield style={styles.detailIcon} />
            <div style={styles.detailLabel}>Role:</div>
            <div style={styles.detailValue}>{user?.role || 'user'}</div>
          </div>
          
          <div style={styles.detailRow}>
            <Calendar style={styles.detailIcon} />
            <div style={styles.detailLabel}>Member Since:</div>
            <div style={styles.detailValue}>
              {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}
            </div>
          </div>
          
          {user?.lastLogin && (
            <div style={styles.detailRow}>
              <Calendar style={styles.detailIcon} />
              <div style={styles.detailLabel}>Last Login:</div>
              <div style={styles.detailValue}>
                {new Date(user.lastLogin).toLocaleString()}
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
