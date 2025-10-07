import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Leaf, Moon, Sun, ArrowRight, User, Mail, Lock, Eye, EyeOff } from 'lucide-react';
import { GoogleLogin, useGoogleLogin } from '@react-oauth/google';

const FasalGuardAuth = ({ onLogin, initialView = 'login' }) => {
  const navigate = useNavigate();
  const [currentView, setCurrentView] = useState(initialView || 'login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [showPassword, setShowPassword] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [letters, setLetters] = useState([]);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [showSplash, setShowSplash] = useState(true);
  const [splashPhase, setSplashPhase] = useState('animation'); // 'animation' -> 'complete' -> 'transitioning'
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [newPassword1, setNewPassword1] = useState('');
  const [newPassword2, setNewPassword2] = useState('');

  useEffect(() => {
    const text = 'FASALGUARD';
    const initialLetters = text.split('').map((letter, index) => ({
      char: letter,
      id: index,
      x: Math.random() * 90 + 5,
      y: Math.random() * 90 + 5,
      rotation: Math.random() * 720 - 360,
      scale: Math.random() * 0.5 + 0.5,
    }));
    setLetters(initialLetters);

    // First animation - letters come together with proper spacing
    const timer = setTimeout(() => {
      setLetters(prev => prev.map((letter, index) => ({
        ...letter,
        x: 50 - (text.length * 2.5) + (index * 5), // Increased spacing from 2.4 to 5
        y: 15,
        rotation: 0,
        scale: 1,
      })));
    }, 500);

    // Show complete splash with image
    const completeTimer = setTimeout(() => {
      setSplashPhase('complete');
    }, 3000);

    // Start transition animation
    const transitionTimer = setTimeout(() => {
      setSplashPhase('transitioning');
    }, 4000);

    // Final transition to login
    const finalTimer = setTimeout(() => {
      setShowSplash(false);
    }, 5000);

    return () => {
      clearTimeout(timer);
      clearTimeout(completeTimer);
      clearTimeout(transitionTimer);
      clearTimeout(finalTimer);
    };
  }, []);

  const handleTransition = (view) => {
    clearMessages();
    setIsTransitioning(true);
    setTimeout(() => {
      setCurrentView(view);
      // update URL to match view
      if (view === 'login') navigate('/login', { replace: true });
      if (view === 'signup') navigate('/signup', { replace: true });
      if (view === 'otp') navigate('/verify', { replace: true });
      setIsTransitioning(false);
    }, 600);
  };

  // keep URL in sync when initialView changes
  useEffect(() => {
    if (currentView === 'login') navigate('/login', { replace: true });
    if (currentView === 'signup') navigate('/signup', { replace: true });
    if (currentView === 'otp') navigate('/verify', { replace: true });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
  };

  const handleOtpChange = (index, value) => {
    if (value.length <= 1 && /^\d*$/.test(value)) {
      const newOtp = [...otp];
      newOtp[index] = value;
      setOtp(newOtp);
      
      if (value && index < 5) {
        const nextInput = document.getElementById(`otp-${index + 1}`);
        if (nextInput) nextInput.focus();
      }
    }
  };

  const handleOtpKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      const prevInput = document.getElementById(`otp-${index - 1}`);
      if (prevInput) prevInput.focus();
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const response = await fetch('http://localhost:5000/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();
      console.log('Login response:', data); // Debug log

      if (data.success && data.user && data.token) {
        setSuccess('Login successful!');
        // Small delay to show success message, then redirect
        setTimeout(() => {
          onLogin(data.user, data.token);
        }, 500);
      } else {
        setError(data.message || 'Login failed');
      }
    } catch (error) {
      console.error('Login error:', error);
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleCredential = async (credentialResponse) => {
    try {
      const idToken = credentialResponse?.credential;
      const accessToken = credentialResponse?.access_token || credentialResponse?.accessToken;
      if (!idToken && !accessToken) {
        setError('Google sign-in failed to return a token');
        return;
      }

      setLoading(true);
      const body = idToken ? { idToken } : { accessToken };
      const res = await fetch('http://localhost:5000/api/auth/google', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });
      const data = await res.json();
      if (data.success && data.token && data.user) {
        onLogin(data.user, data.token);
      } else {
        setError(data.message || 'Google sign-in failed');
      }
    } catch (err) {
      console.error('Google sign-in error:', err);
      setError('Google sign-in error');
    } finally {
      setLoading(false);
    }
  };

  // hooks for custom buttons so we can control text
  const loginWithGoogleSignIn = useGoogleLogin({
    onSuccess: handleGoogleCredential,
    onError: () => setError('Google sign-in failed')
  });

  const loginWithGoogleSignUp = useGoogleLogin({
    onSuccess: handleGoogleCredential,
    onError: () => setError('Google sign-in failed')
  });

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const response = await fetch('http://localhost:5000/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name, email, password }),
      });

      const data = await response.json();
      console.log('Register response:', data); // Debug log

      if (data.success && data.pending) {
        setSuccess('OTP sent to your email. Please verify to continue.');
        setTimeout(() => {
          handleTransition('otp');
        }, 400);
      } else {
        setError(data.message || 'Registration failed');
      }
    } catch (error) {
      console.error('Registration error:', error);
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async () => {
    const code = otp.join('');
    if (code.length !== 6) {
      setError('Please enter the 6-digit code');
      return;
    }
    setLoading(true);
    setError('');
    setSuccess('');
    try {
      const response = await fetch('http://localhost:5000/api/auth/verify-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, code })
      });
      const data = await response.json();
      if (data.success && data.user) {
        // After verification, auto-login
        try {
          const loginRes = await fetch('http://localhost:5000/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
          });
          const loginData = await loginRes.json();
          if (loginData.success && loginData.token && loginData.user) {
            onLogin(loginData.user, loginData.token);
            return;
          }
        } catch(e) {}
        setSuccess('Email verified! Please log in.');
        setTimeout(() => handleTransition('login'), 700);
      } else {
        setError(data.message || 'Verification failed');
      }
    } catch (err) {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setLoading(true);
    setError('');
    setSuccess('');
    try {
      const response = await fetch('http://localhost:5000/api/auth/resend-verification', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });
      const data = await response.json();
      if (data.success) {
        setSuccess('Verification code resent. Check your email.');
      } else {
        setError(data.message || 'Failed to resend code');
      }
    } catch (err) {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const clearMessages = () => {
    setError('');
    setSuccess('');
  };

  const styles = {
    splashContainer: {
      minHeight: '100vh',
      width: '100%',
      background: isDarkMode 
        ? 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)'
        : 'linear-gradient(135deg, #d1fae5 0%, #a7f3d0 50%, #99f6e4 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      position: 'relative',
      overflow: 'hidden',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
      transition: 'background 0.6s ease',
    },
    splashContent: {
      position: 'relative',
      width: '100%',
      maxWidth: '1400px',
      padding: '2rem',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      transform: splashPhase === 'transitioning' ? 'translateX(-120%)' : 'translateX(0)', // Moved further left
      transition: 'transform 1s cubic-bezier(0.4, 0, 0.2, 1)',
    },
    logoAnimationContainer: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      pointerEvents: 'none',
      zIndex: 10,
    },
    animatedLetter: {
      position: 'absolute',
      fontSize: 'clamp(2rem, 8vw, 5rem)',
      fontWeight: 'bold',
      color: isDarkMode ? '#10b981' : '#059669',
      textShadow: isDarkMode 
        ? '0 0 30px rgba(16, 185, 129, 0.6)' 
        : '0 0 20px rgba(5, 150, 105, 0.4)',
      transition: 'all 2s cubic-bezier(0.68, -0.55, 0.265, 1.55)',
      willChange: 'transform',
      letterSpacing: '0.1em', // Added letter spacing for better readability
    },
    heroImageContainer: {
      position: 'relative',
      width: '100%',
      maxWidth: '800px',
      marginTop: '8rem',
      opacity: splashPhase === 'animation' ? 0 : 1,
      transform: splashPhase === 'animation' ? 'translateY(30px)' : 'translateY(0)',
      transition: 'all 1s ease-out',
    },
    heroImage: {
      width: '100%',
      height: '400px',
      objectFit: 'cover',
      borderRadius: '24px',
      boxShadow: isDarkMode 
        ? '0 30px 60px -12px rgba(0, 0, 0, 0.8)' 
        : '0 30px 60px -12px rgba(0, 0, 0, 0.3)',
      transition: 'box-shadow 0.3s ease',
    },
    mainContainer: {
      minHeight: '100vh',
      display: 'flex',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
      position: 'relative',
      backgroundColor: isDarkMode ? '#0f172a' : '#ffffff',
      transition: 'background-color 0.3s ease',
      opacity: isTransitioning ? 0 : 1,
      transform: isTransitioning ? 'scale(1.05)' : 'scale(1)',
    },
    leftSection: {
      flex: 1,
      position: 'relative',
      background: isDarkMode 
        ? 'linear-gradient(135deg, #1e293b 0%, #334155 50%, #475569 100%)'
        : 'linear-gradient(135deg, #f0fdf4 0%, #dcfce7 30%, #bbf7d0 60%, #86efac 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '2rem',
      transform: showSplash ? 'translateX(-100%)' : 'translateX(0)',
      transition: 'transform 1s cubic-bezier(0.4, 0, 0.2, 1)',
      transitionDelay: showSplash ? '0s' : '0.2s', // Delay entrance for smoother effect
    },
    imageBox: {
      position: 'relative',
      width: '100%',
      maxWidth: '500px',
    },
    leftHeroImage: {
      width: '100%',
      height: '400px',
      objectFit: 'cover',
      borderRadius: '20px',
      boxShadow: isDarkMode 
        ? '0 25px 50px -12px rgba(0, 0, 0, 0.6)' 
        : '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
    },
    leftLogoText: {
      position: 'absolute',
      top: '-70px',
      left: '50%',
      transform: 'translateX(-50%)',
      fontSize: 'clamp(1.75rem, 4vw, 3rem)',
      fontWeight: 'bold',
      color: isDarkMode ? '#ffffff' : '#065f46',
      letterSpacing: '0.15em',
      textShadow: isDarkMode 
        ? '0 4px 20px rgba(16, 185, 129, 0.5)' 
        : '0 4px 20px rgba(16, 185, 129, 0.3)',
      whiteSpace: 'nowrap',
    },
    rightSection: {
      flex: 1,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '2rem',
      backgroundColor: isDarkMode ? '#0f172a' : '#ffffff',
      position: 'relative',
      transform: showSplash ? 'translateX(100%)' : 'translateX(0)',
      transition: 'transform 1s cubic-bezier(0.4, 0, 0.2, 1)',
      transitionDelay: showSplash ? '0s' : '0.4s', // Delayed entrance for staggered effect
    },
    darkModeToggle: {
      position: 'absolute',
      top: '2rem',
      right: '2rem',
      width: '50px',
      height: '50px',
      borderRadius: '50%',
      border: isDarkMode ? '2px solid #334155' : '2px solid #e5e7eb',
      backgroundColor: isDarkMode ? '#1e293b' : '#f9fafb',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      cursor: 'pointer',
      transition: 'all 0.3s ease',
      boxShadow: isDarkMode 
        ? '0 4px 12px rgba(0, 0, 0, 0.4)' 
        : '0 4px 12px rgba(0, 0, 0, 0.1)',
      zIndex: 10,
    },
    formCard: {
      width: '100%',
      maxWidth: '480px',
      padding: '2.5rem',
    },
    header: {
      display: 'flex',
      alignItems: 'center',
      gap: '1rem',
      marginBottom: '2rem',
    },
    logoIcon: {
      width: '60px',
      height: '60px',
      borderRadius: '12px',
      background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      boxShadow: '0 10px 25px -5px rgba(16, 185, 129, 0.5)',
      flexShrink: 0,
    },
    headerText: {
      flex: 1,
      textAlign: 'left',
    },
    title: {
      fontSize: 'clamp(1.5rem, 4vw, 1.875rem)',
      fontWeight: 'bold',
      color: isDarkMode ? '#ffffff' : '#1f2937',
      margin: 0,
      marginBottom: '0.25rem',
      textAlign: 'left',
    },
    subtitle: {
      color: isDarkMode ? '#94a3b8' : '#6b7280',
      margin: 0,
      fontSize: '0.875rem',
      textAlign: 'left',
    },
    formGroup: {
      marginBottom: '1.5rem',
      position: 'relative',
    },
    label: {
      display: 'block',
      fontSize: '0.875rem',
      fontWeight: '500',
      color: isDarkMode ? '#cbd5e1' : '#374151',
      marginBottom: '0.5rem',
      textAlign: 'left',
    },
    inputWrapper: {
      position: 'relative',
    },
    inputIcon: {
      position: 'absolute',
      left: '1rem',
      top: '50%',
      transform: 'translateY(-50%)',
      color: '#10b981',
      pointerEvents: 'none',
    },
    input: {
      width: '100%',
      padding: '0.875rem 1rem 0.875rem 3rem',
      fontSize: '1rem',
      borderRadius: '8px',
      border: isDarkMode ? '2px solid #334155' : '2px solid #e5e7eb',
      backgroundColor: isDarkMode ? '#1e293b' : '#ffffff',
      color: isDarkMode ? '#ffffff' : '#1f2937',
      outline: 'none',
      transition: 'all 0.3s ease',
      boxSizing: 'border-box',
    },
    eyeIcon: {
      position: 'absolute',
      right: '1rem',
      top: '50%',
      transform: 'translateY(-50%)',
      cursor: 'pointer',
      color: isDarkMode ? '#64748b' : '#9ca3af',
    },
    button: {
      width: '100%',
      padding: '1rem',
      fontSize: '1rem',
      fontWeight: '600',
      color: '#ffffff',
      background: 'linear-gradient(90deg, #10b981 0%, #059669 100%)',
      border: 'none',
      borderRadius: '8px',
      cursor: 'pointer',
      transition: 'all 0.3s ease',
      marginBottom: '1.5rem',
      boxShadow: '0 10px 25px -5px rgba(16, 185, 129, 0.4)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '0.5rem',
    },
    linkButton: {
      background: 'none',
      border: 'none',
      color: '#10b981',
      fontWeight: '600',
      cursor: 'pointer',
      textDecoration: 'none',
      fontSize: 'inherit',
      padding: 0,
      transition: 'color 0.3s ease',
    },
    footer: {
      textAlign: 'center',
      fontSize: '0.875rem',
      color: isDarkMode ? '#94a3b8' : '#6b7280',
      marginTop: '1.5rem',
    },
    backButton: {
      display: 'flex',
      alignItems: 'center',
      gap: '0.5rem',
      color: isDarkMode ? '#94a3b8' : '#6b7280',
      background: 'none',
      border: 'none',
      cursor: 'pointer',
      fontSize: '0.875rem',
      marginBottom: '1.5rem',
      padding: 0,
      transition: 'color 0.3s ease',
    },
    otpContainer: {
      display: 'flex',
      gap: '1rem',
      justifyContent: 'center',
      marginBottom: '2rem',
    },
    otpInput: {
      width: '50px',
      height: '50px',
      fontSize: '1.5rem',
      fontWeight: 'bold',
      textAlign: 'center',
      borderRadius: '8px',
      border: isDarkMode ? '2px solid #334155' : '2px solid #e5e7eb',
      backgroundColor: isDarkMode ? '#1e293b' : '#ffffff',
      color: isDarkMode ? '#ffffff' : '#1f2937',
      outline: 'none',
      transition: 'all 0.3s ease',
    },
    resendText: {
      textAlign: 'center',
      fontSize: '0.875rem',
      color: isDarkMode ? '#94a3b8' : '#6b7280',
      marginBottom: '1rem',
    },
  };

  const getLetterStyle = (letter) => ({
    ...styles.animatedLetter,
    left: `${letter.x}%`,
    top: `${letter.y}%`,
    transform: `translate(-50%, -50%) rotate(${letter.rotation}deg) scale(${letter.scale})`,
  });

  if (showSplash) {
    return (
      <div style={styles.splashContainer}>
        <style>{`
          @keyframes fadeInUp {
            from { opacity: 0; transform: translateY(30px); }
            to { opacity: 1; transform: translateY(0); }
          }
          @keyframes fadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
          }
          @media (max-width: 768px) {
            .hero-image-container {
              margin-top: 6rem;
            }
          }
        `}</style>
        <button 
          style={styles.darkModeToggle}
          onClick={toggleDarkMode}
          className="dark-mode-toggle"
        >
          {isDarkMode ? <Sun size={24} color="#10b981" /> : <Moon size={24} color="#6b7280" />}
        </button>
        <div style={styles.splashContent}>
          <div style={styles.logoAnimationContainer}>
            {letters.map((letter) => (
              <span key={letter.id} style={getLetterStyle(letter)}>
                {letter.char}
              </span>
            ))}
          </div>
          <div style={styles.heroImageContainer} className="hero-image-container">
            <img src="/hero.webp" alt="Farm field" style={styles.heroImage} />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.mainContainer}>
      <style>{`
        input:focus {
          border-color: #10b981 !important;
          box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.1);
        }
        button:hover {
          transform: translateY(-2px);
        }
        .dark-mode-toggle:hover {
          transform: scale(1.1);
        }
        .link-button:hover {
          color: #059669;
        }
        .back-button:hover {
          color: #10b981;
        }
        .otp-input:focus {
          border-color: #10b981 !important;
          box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.1);
        }
        @media (max-width: 1024px) {
          .left-section {
            display: none !important;
          }
        }
        @media (max-width: 640px) {
          .otp-container {
            gap: 0.5rem;
          }
          .otp-input {
            width: 40px;
            height: 40px;
            font-size: 1.25rem;
          }
        }
      `}</style>
      <div style={styles.leftSection} className="left-section">
        <div style={styles.imageBox}>
          <div style={styles.leftLogoText}>FASALGUARD</div>
          <img src="/hero.webp" alt="Farm field" style={styles.leftHeroImage} />
        </div>
      </div>
      <div style={styles.rightSection}>
        <button 
          style={styles.darkModeToggle}
          onClick={toggleDarkMode}
          className="dark-mode-toggle"
        >
          {isDarkMode ? <Sun size={24} color="#10b981" /> : <Moon size={24} color="#6b7280" />}
        </button>
        <div style={styles.formCard}>
          {currentView === 'login' && (
            <>
              <div style={styles.header}>
                <div style={styles.logoIcon}>
                  <Leaf color="white" size={32} />
                </div>
                <div style={{...styles.headerText, textAlign: 'left'}}>
                  <h1 style={{...styles.title, textAlign: 'left'}}>Welcome to FasalGuard</h1>
                  <p style={{...styles.subtitle, textAlign: 'left'}}>Sign in to continue</p>
                </div>
              </div>
              <div>
                <div style={styles.formGroup}>
                  <label style={styles.label}>Email</label>
                  <div style={styles.inputWrapper}>
                    <div style={styles.inputIcon}>
                      <Mail size={20} />
                    </div>
                    <input
                      type="email"
                      placeholder="you@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      style={styles.input}
                    />
                  </div>
                </div>
                <div style={styles.formGroup}>
                  <label style={styles.label}>Password</label>
                  <div style={styles.inputWrapper}>
                    <div style={styles.inputIcon}>
                      <Lock size={20} />
                    </div>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      style={styles.input}
                    />
                    <div 
                      style={styles.eyeIcon}
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                    </div>
                  </div>
                </div>
                <form onSubmit={handleLogin}>
                  {error && (
                    <div style={{
                      backgroundColor: '#fef2f2',
                      color: '#dc2626',
                      padding: '0.75rem',
                      borderRadius: '6px',
                      marginBottom: '1rem',
                      fontSize: '0.875rem',
                      border: '1px solid #fecaca'
                    }}>
                      {error}
                    </div>
                  )}
                  {success && (
                    <div style={{
                      backgroundColor: '#f0fdf4',
                      color: '#16a34a',
                      padding: '0.75rem',
                      borderRadius: '6px',
                      marginBottom: '1rem',
                      fontSize: '0.875rem',
                      border: '1px solid #bbf7d0'
                    }}>
                      {success}
                    </div>
                  )}
                  <button 
                    type="submit"
                    style={{
                      ...styles.button,
                      opacity: loading ? 0.7 : 1,
                      cursor: loading ? 'not-allowed' : 'pointer'
                    }}
                    disabled={loading}
                  >
                    {loading ? 'Signing in...' : 'Continue'} <ArrowRight size={20} />
                  </button>
                </form>
                <div style={{ display: 'flex', justifyContent: 'center', margin: '0.75rem 0' }}>
                  <div style={{ width: '85%', height: '1px', background: '#e5e7eb', alignSelf: 'center' }} />
                </div>
                <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1rem' }}>
                  <button
                    onClick={() => loginWithGoogleSignIn()}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      padding: '0.5rem 1rem',
                      borderRadius: '8px',
                      border: '1px solid #e5e7eb',
                      background: '#ffffff',
                      cursor: 'pointer'
                    }}
                  >
                    <img src="google.png" alt="Google" style={{ width: 18, height: 18 }} />
                    <span style={{ color: '#111827', fontWeight: 600 }}>Sign in with Google</span>
                  </button>
                </div>
                <div style={{ textAlign: 'center', marginBottom: '1rem' }}>
                  <button 
                    style={styles.linkButton} 
                    className="link-button"
                    onClick={() => handleTransition('signup')}
                  >
                    Create an account
                  </button>
                </div>
                <div style={styles.footer}>
                  By continuing, you agree to our{' '}
                  <button style={styles.linkButton} className="link-button">Terms</button>.
                </div>
              </div>
            </>
          )}
          
          {currentView === 'signup' && (
            <>
              <div style={styles.header}>
                <div style={styles.logoIcon}>
                  <Leaf color="white" size={32} />
                </div>
                <div style={{...styles.headerText, textAlign: 'left'}}>
                  <h1 style={{...styles.title, textAlign: 'left'}}>Create Account</h1>
                  <p style={{...styles.subtitle, textAlign: 'left'}}>Join FasalGuard today</p>
                </div>
              </div>
              <div>
                <div style={styles.formGroup}>
                  <label style={styles.label}>Full Name</label>
                  <div style={styles.inputWrapper}>
                    <div style={styles.inputIcon}>
                      <User size={20} />
                    </div>
                    <input
                      type="text"
                      placeholder="John Doe"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      style={styles.input}
                    />
                  </div>
                </div>
                <div style={styles.formGroup}>
                  <label style={styles.label}>Email</label>
                  <div style={styles.inputWrapper}>
                    <div style={styles.inputIcon}>
                      <Mail size={20} />
                    </div>
                    <input
                      type="email"
                      placeholder="you@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      style={styles.input}
                    />
                  </div>
                </div>
                <div style={styles.formGroup}>
                  <label style={styles.label}>Password</label>
                  <div style={styles.inputWrapper}>
                    <div style={styles.inputIcon}>
                      <Lock size={20} />
                    </div>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      style={styles.input}
                    />
                    <div 
                      style={styles.eyeIcon}
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                    </div>
                  </div>
                </div>
                <form onSubmit={handleRegister}>
                  {error && (
                    <div style={{
                      backgroundColor: '#fef2f2',
                      color: '#dc2626',
                      padding: '0.75rem',
                      borderRadius: '6px',
                      marginBottom: '1rem',
                      fontSize: '0.875rem',
                      border: '1px solid #fecaca'
                    }}>
                      {error}
                    </div>
                  )}
                  {success && (
                    <div style={{
                      backgroundColor: '#f0fdf4',
                      color: '#16a34a',
                      padding: '0.75rem',
                      borderRadius: '6px',
                      marginBottom: '1rem',
                      fontSize: '0.875rem',
                      border: '1px solid #bbf7d0'
                    }}>
                      {success}
                    </div>
                  )}
                  <button 
                    type="submit"
                    style={{
                      ...styles.button,
                      opacity: loading ? 0.7 : 1,
                      cursor: loading ? 'not-allowed' : 'pointer'
                    }}
                    disabled={loading}
                  >
                    {loading ? 'Creating Account...' : 'Create Account'} <ArrowRight size={20} />
                  </button>
                </form>
                <div style={{ textAlign: 'center', marginBottom: '1rem' }}>
                  <button 
                    style={styles.linkButton} 
                    className="link-button"
                    onClick={() => handleTransition('login')}
                  >
                    Already have an account? Sign in
                  </button>
                </div>
                <div style={{ display: 'flex', justifyContent: 'center', margin: '0.75rem 0' }}>
                  <div style={{ width: '85%', height: '1px', background: '#e5e7eb', alignSelf: 'center' }} />
                </div>
                <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1rem' }}>
                  <button
                    onClick={() => loginWithGoogleSignUp()}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      padding: '0.5rem 1rem',
                      borderRadius: '8px',
                      border: '1px solid #e5e7eb',
                      background: '#ffffff',
                      cursor: 'pointer'
                    }}
                  >
                    <img src="google.png" alt="Google" style={{ width: 18, height: 18 }} />
                    <span style={{ color: '#111827', fontWeight: 600 }}>Sign up with Google</span>
                  </button>
                </div>
                <div style={styles.footer}>
                  By creating an account, you agree to our{' '}
                  <button style={styles.linkButton} className="link-button">Terms</button>.
                </div>
              </div>
              <button 
                style={styles.backButton}
                className="back-button"
                onClick={() => handleTransition('login')}
              >
                ← Back
              </button>
            </>
          )}

          {currentView === 'otp' && (
            <>
              <div style={styles.header}>
                <div style={styles.logoIcon}>
                  <Leaf color="white" size={32} />
                </div>
                <div style={styles.headerText}>
                  <h1 style={styles.title}>Verify Your Email</h1>
                  <p style={styles.subtitle}>Enter the 6-digit code sent to {email}</p>
                </div>
              </div>
              <div>
                <div style={styles.formGroup}>
                  <label style={styles.label}>Verification Code</label>
                  <div style={styles.otpContainer} className="otp-container">
                    {otp.map((digit, index) => (
                      <input
                        key={index}
                        id={`otp-${index}`}
                        type="text"
                        maxLength="1"
                        value={digit}
                        onChange={(e) => handleOtpChange(index, e.target.value)}
                        onKeyDown={(e) => handleOtpKeyDown(index, e)}
                        style={styles.otpInput}
                        className="otp-input"
                      />
                    ))}
                  </div>
                </div>
                <button style={{...styles.button, opacity: loading ? 0.7 : 1, cursor: loading ? 'not-allowed' : 'pointer'}} onClick={handleVerify} disabled={loading}>
                  {loading ? 'Verifying...' : 'Verify & Continue'} <ArrowRight size={20} />
                </button>
                <div style={styles.resendText}>
                  Didn't receive the code?{' '}
                  <button style={styles.linkButton} className="link-button" onClick={handleResend}>
                    Resend
                  </button>
                </div>
                <div style={styles.footer}>
                  Check your spam folder if you don't see the email.
                </div>
              </div>
              <button 
                style={styles.backButton}
                className="back-button"
                onClick={() => handleTransition('login')}
              >
                ← Back to Login
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default FasalGuardAuth;
