import React, { useState, useEffect } from 'react';
import FasalGuardAuth from './FasalGuardAuth';
import HomePage from './HomePage';
import ContactPage from './ContactPage';
import AboutUs from './AboutUs';
import Profile from './Profile';
import { Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import { CSSTransition, SwitchTransition } from 'react-transition-group';
import './App.css';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // Check if user is logged in
    const token = localStorage.getItem('token');
    if (token) {
      // Verify token with backend
      fetch('http://localhost:5000/api/auth/me', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })
      .then(response => response.json())
      .then(data => {
        if (data.success) {
          setUser(data.user);
          setIsAuthenticated(true);
        } else {
          localStorage.removeItem('token');
        }
      })
      .catch(error => {
        console.error('Token verification failed:', error);
        localStorage.removeItem('token');
      })
      .finally(() => {
        setLoading(false);
      });
    } else {
      setLoading(false);
    }
  }, []);

  const handleLogin = (userData, token) => {
    console.log('handleLogin called with:', { userData, token });
    localStorage.setItem('token', token);
    setUser(userData);
    setIsAuthenticated(true);
    // Navigate to the homepage after login/signup/verification
    navigate('/home');
  };

  // no logout on homepage currently
  const handleLogout = () => {
    // clear local auth state and token, then redirect to login
    localStorage.removeItem('token');
    setUser(null);
    setIsAuthenticated(false);
    navigate('/login');
  };

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        fontSize: '1.2rem',
        color: '#10b981'
      }}>
        Loading...
      </div>
    );
  }

  return (
    <div className="App" style={{ minHeight: '100vh' }}>
      <Routes location={location}>
        <Route path="/login" element={
          isAuthenticated ? <Navigate to="/home" replace /> : <FasalGuardAuth onLogin={handleLogin} initialView="login" />
        } />
        <Route path="/signup" element={
          isAuthenticated ? <Navigate to="/home" replace /> : <FasalGuardAuth onLogin={handleLogin} initialView="signup" />
        } />
        <Route path="/verify" element={
          isAuthenticated ? <Navigate to="/home" replace /> : <FasalGuardAuth onLogin={handleLogin} initialView="otp" />
        } />
        <Route path="/forgot-password" element={
          isAuthenticated ? <Navigate to="/home" replace /> : <FasalGuardAuth onLogin={handleLogin} initialView="forgot-password" />
        } />
        <Route path="/reset-password" element={
          isAuthenticated ? <Navigate to="/home" replace /> : <FasalGuardAuth onLogin={handleLogin} initialView="reset-password" />
        } />
        <Route path="/" element={<Navigate to="/home" replace />} />
        <Route path="/home" element={
          isAuthenticated ? <HomePage user={user} onLogout={handleLogout} /> : <Navigate to="/login" replace />
        } />
        <Route path="/contact" element={<ContactPage />} />
        <Route path="/about" element={<AboutUs onLogout={handleLogout} />} />
        <Route path="/profile" element={<Profile user={user} />} />
        <Route path="*" element={
          isAuthenticated ? <Navigate to="/home" replace /> : <Navigate to="/login" replace />
        } />
      </Routes>
    </div>
  );
}

export default App;
