import React from 'react';

const HomePage = ({ user, onLogout }) => {
  const styles = {
    container: {
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: '#f8fafc',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif'
    },
    card: {
      backgroundColor: '#ffffff',
      padding: '2rem',
      borderRadius: '12px',
      boxShadow: '0 10px 25px -5px rgba(16, 185, 129, 0.15)',
      border: '1px solid #e2e8f0',
      textAlign: 'center',
      maxWidth: '520px',
      width: '100%'
    },
    title: {
      margin: 0,
      marginBottom: '0.5rem',
      fontSize: '1.75rem',
      fontWeight: '700',
      color: '#065f46'
    },
    subtitle: {
      margin: 0,
      color: '#4b5563'
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h1 style={styles.title}>FasalGuard</h1>
        <p style={styles.subtitle}>Welcome{user?.name ? `, ${user.name}` : ''}! You are logged in.</p>
        <div style={{ marginTop: '1rem', display: 'flex', gap: '0.5rem', justifyContent: 'center' }}>
          <button onClick={onLogout} style={{
            padding: '0.5rem 0.75rem',
            background: '#ef4444',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer'
          }}>Logout</button>
        </div>
      </div>
    </div>
  );
};

export default HomePage;


