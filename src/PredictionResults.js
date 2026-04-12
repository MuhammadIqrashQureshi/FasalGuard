import React, { useMemo, useState, useEffect } from 'react';
import { useLocation, useNavigate, Routes, Route } from 'react-router-dom';
import { 
  ArrowLeft, TrendingUp, AlertTriangle, CheckCircle, Cloud, 
  Thermometer, Droplets, Wind, Calendar, Sun, CloudRain,
  MapPin, Clock, Cpu, BarChart3, Sprout, Leaf, CpuIcon, Brain, Zap,
  Home, BarChart2, Droplets as DropletsIcon, FileText, Grid3x3,
  Menu, X, ChevronRight, Activity, LineChart, Shield, Database,
  Download, Printer, Share2, Filter, Target, BarChart
} from 'lucide-react';

// Import your components
import WeatherVisualizationsDark from './WeatherVisualizations';
import IrrigationCalculatorDark from './IrrigationCalculator';
import CropComparisonMatrixDark from './CropComparisonMatrix';
import ReportGeneratorDark from './ReportGenerator';
import { useLanguage } from './context/LanguageContext';

// Sidebar Component
const Sidebar = ({ isOpen, setIsOpen, activePage, setActivePage, navigate }) => {
  const { t } = useLanguage();
  const menuItems = [
    {
      id: 'dashboard',
      label: t('predictionDashboard', 'Prediction Dashboard'),
      icon: <Home size={20} />,
      path: '/prediction-results'
    },
    {
      id: 'weather',
      label: t('weatherVisualizations', 'Weather Visualizations'),
      icon: <Cloud size={20} />,
      path: '/prediction-results/weather'
    },
    {
      id: 'irrigation',
      label: t('smartIrrigation', 'Smart Irrigation'),
      icon: <DropletsIcon size={20} />,
      path: '/prediction-results/irrigation'
    },
    {
      id: 'matrix',
      label: t('cropMatrix', 'Crop Matrix'),
      icon: <Grid3x3 size={20} />,
      path: '/prediction-results/matrix'
    },
    {
      id: 'report',
      label: t('generateReport', 'Generate Report'),
      icon: <FileText size={20} />,
      path: '/prediction-results/report'
    }
  ];

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && window.innerWidth < 768 && (
        <div 
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0, 0, 0, 0.5)',
            zIndex: 999,
          }}
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div style={{
        position: 'fixed',
        left: 0,
        top: 0,
        bottom: 0,
        width: isOpen ? '280px' : '80px',
        background: '#ffffff',
        backdropFilter: 'blur(16px) saturate(160%)',
        borderRight: '1px solid rgba(34, 197, 94, 0.2)',
        padding: '1.5rem 0',
        zIndex: 1000,
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        overflowY: 'auto',
        boxShadow: '4px 0 18px rgba(15, 23, 42, 0.08)',
        display: window.innerWidth >= 768 ? 'block' : (isOpen ? 'block' : 'none')
      }}>
        {/* Logo & Toggle */}
        <div style={{
          padding: '0 1.5rem 2rem',
          borderBottom: '1px solid rgba(34, 197, 94, 0.1)',
          marginBottom: '1.5rem'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: isOpen ? 'space-between' : 'center',
            gap: '0.75rem'
          }}>
            {isOpen && (
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem'
              }}>
                <div style={{
                  background: 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)',
                  padding: '0.5rem',
                  borderRadius: '10px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <Leaf size={24} color="white" />
                </div>
                <span style={{
                  fontSize: '1.2rem',
                  fontWeight: '700',
                  background: 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text'
                }}>
                  FASALGUARD
                </span>
              </div>
            )}
            
            <button
              onClick={() => setIsOpen(!isOpen)}
              style={{
                background: 'rgba(34, 197, 94, 0.1)',
                border: '1px solid rgba(34, 197, 94, 0.3)',
                color: '#22c55e',
                padding: '0.5rem',
                borderRadius: '8px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'all 0.3s ease'
              }}
              onMouseEnter={(e) => {
                e.target.style.background = 'rgba(34, 197, 94, 0.2)';
                e.target.style.transform = 'scale(1.1)';
              }}
              onMouseLeave={(e) => {
                e.target.style.background = 'rgba(34, 197, 94, 0.1)';
                e.target.style.transform = 'scale(1)';
              }}
            >
              {isOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>

        {/* Menu Items */}
        <div style={{ padding: '0 1rem' }}>
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => {
                setActivePage(item.id);
                navigate(item.path);
                if (window.innerWidth < 768) setIsOpen(false);
              }}
              style={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                padding: '0.875rem 1rem',
                marginBottom: '0.5rem',
                background: activePage === item.id 
                  ? 'rgba(34, 197, 94, 0.2)' 
                  : 'transparent',
                border: activePage === item.id 
                  ? '1px solid rgba(34, 197, 94, 0.4)' 
                  : '1px solid transparent',
                borderRadius: '12px',
                color: activePage === item.id ? '#22c55e' : '#64748b',
                cursor: 'pointer',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                textAlign: 'left'
              }}
              onMouseEnter={(e) => {
                if (activePage !== item.id) {
                  e.target.style.background = 'rgba(34, 197, 94, 0.1)';
                  e.target.style.color = '#22c55e';
                  e.target.style.borderColor = 'rgba(34, 197, 94, 0.2)';
                }
              }}
              onMouseLeave={(e) => {
                if (activePage !== item.id) {
                  e.target.style.background = 'transparent';
                  e.target.style.color = '#64748b';
                  e.target.style.borderColor = 'transparent';
                }
              }}
            >
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0
              }}>
                {item.icon}
              </div>
              
              {isOpen && (
                <>
                  <span style={{
                    fontSize: '0.95rem',
                    fontWeight: '500',
                    flex: 1,
                    whiteSpace: 'nowrap'
                  }}>
                    {item.label}
                  </span>
                  
                  {activePage === item.id && (
                    <ChevronRight size={16} style={{ opacity: 0.7 }} />
                  )}
                </>
              )}
            </button>
          ))}
        </div>

        {/* AI Status Badge */}
        {isOpen && (
          <div style={{
            margin: '2rem 1rem 0',
            padding: '1rem',
            background: 'rgba(34, 197, 94, 0.1)',
            borderRadius: '12px',
            border: '1px solid rgba(34, 197, 94, 0.3)',
            textAlign: 'center'
          }}>
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center', 
              gap: '0.5rem',
              marginBottom: '0.5rem'
            }}>
              <Brain size={16} color="#22c55e" />
              <span style={{ 
                fontSize: '0.8rem', 
                color: '#22c55e', 
                fontWeight: '600' 
              }}>
                {t('aiActive', 'AI Active')}
              </span>
            </div>
            <div style={{ 
              fontSize: '0.75rem', 
              color: '#94a3b8',
              lineHeight: '1.4'
            }}>
              {t('realTimeAnalysis', 'Real-time analysis powered by ML')}
            </div>
          </div>
        )}
      </div>

      {/* Mobile Toggle Button */}
      {window.innerWidth < 768 && !isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          style={{
            position: 'fixed',
            top: '1.5rem',
            left: '1rem',
            background: 'rgba(34, 197, 94, 0.9)',
            color: 'white',
            border: 'none',
            padding: '0.75rem',
            borderRadius: '10px',
            cursor: 'pointer',
            zIndex: 999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 4px 12px rgba(34, 197, 94, 0.4)',
            transition: 'all 0.3s ease'
          }}
          onMouseEnter={(e) => {
            e.target.style.transform = 'scale(1.1)';
            e.target.style.boxShadow = '0 6px 16px rgba(34, 197, 94, 0.6)';
          }}
          onMouseLeave={(e) => {
            e.target.style.transform = 'scale(1)';
            e.target.style.boxShadow = '0 4px 12px rgba(34, 197, 94, 0.4)';
          }}
        >
          <Menu size={20} />
        </button>
      )}
    </>
  );
};

export default function PredictionResults() {
  const { t } = useLanguage();
  const location = useLocation();
  const navigate = useNavigate();
  const storedData = useMemo(() => {
    if (typeof window === 'undefined') return {};
    try {
      return {
        predictionData: JSON.parse(localStorage.getItem('predictionData') || 'null'),
        inputData: JSON.parse(localStorage.getItem('inputData') || 'null')
      };
    } catch (error) {
      console.warn('Could not read prediction data from localStorage', error);
      return {};
    }
  }, []);

  const { predictionData, inputData } = {
    predictionData: location.state?.predictionData || storedData.predictionData,
    inputData: location.state?.inputData || storedData.inputData
  };
  const [pageLoading, setPageLoading] = useState(true);
  const [showFullForecast, setShowFullForecast] = useState(false);
  const [mlPredictions, setMlPredictions] = useState({});
  const [sidebarOpen, setSidebarOpen] = useState(window.innerWidth >= 768);
  const [activePage, setActivePage] = useState('dashboard');

  // Get current path to set active page
  useEffect(() => {
    const path = location.pathname;
    if (path.includes('/weather')) setActivePage('weather');
    else if (path.includes('/irrigation')) setActivePage('irrigation');
    else if (path.includes('/matrix')) setActivePage('matrix');
    else if (path.includes('/report')) setActivePage('report');
    else setActivePage('dashboard');
  }, [location.pathname]);

  // Debug logs
  useEffect(() => {
    console.log('🎯 Full prediction data:', predictionData);
    console.log('🤖 ML Predictions:', predictionData?.predictions);
    console.log('📋 Recommendations:', predictionData?.recommendations);
    console.log('📍 Input Data:', inputData);
    
    if (predictionData?.predictions) {
      console.log('🔍 Parsed ML predictions by crop:');
      Object.keys(predictionData.predictions).forEach(crop => {
        console.log(`🌱 ${crop}:`, predictionData.predictions[crop]);
      });
      setMlPredictions(predictionData.predictions);
    }
  }, [predictionData, inputData]);

  useEffect(() => {
    const timer = setTimeout(() => setPageLoading(false), 1200);
    return () => clearTimeout(timer);
  }, []);

  if (!predictionData) {
    return (
      <div style={{ 
        padding: '2rem', 
        textAlign: 'center',
        background: 'linear-gradient(135deg, #f7fbf8 0%, #eef6f0 100%)',
        minHeight: '100vh',
        color: '#0f172a',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center'
      }}>
        <h2 style={{ color: '#ef4444', marginBottom: '1rem' }}>{t('noPredictionData', 'No prediction data found')}</h2>
        <p style={{ color: '#64748b', marginBottom: '2rem' }}>
          {t('noPredictionHint', 'Please go back and try again with valid location data.')}
        </p>
        <button 
          onClick={() => navigate('/')}
          style={{
            background: 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)',
            color: 'white',
            border: 'none',
            padding: '1rem 2rem',
            borderRadius: '12px',
            cursor: 'pointer',
            fontSize: '1rem',
            fontWeight: '600',
            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            boxShadow: '0 4px 14px rgba(34, 197, 94, 0.4)'
          }}
          onMouseEnter={(e) => {
            e.target.style.transform = 'translateY(-2px)';
            e.target.style.boxShadow = '0 6px 20px rgba(34, 197, 94, 0.5)';
          }}
          onMouseLeave={(e) => {
            e.target.style.transform = 'translateY(0)';
            e.target.style.boxShadow = '0 4px 14px rgba(34, 197, 94, 0.4)';
          }}
        >
          {t('goBackHome', 'Go Back to Home')}
        </button>
      </div>
    );
  }

  // Get ML prediction for specific crop
  const getMlPredictionForCrop = (cropKey) => {
    return mlPredictions[cropKey] || predictionData.predictions?.[cropKey];
  };

  // Get correct recommendation text based on ML prediction
  const getCorrectRecommendation = (crop, recommendationList = []) => {
    const mlPrediction = getMlPredictionForCrop(crop.cropKey);
    
    if (mlPrediction && mlPrediction.recommendation) {
      const mlRec = mlPrediction.recommendation;
      const recommendations = [];
      
      // Add primary advice from ML
      if (mlRec.primary_advice) {
        recommendations.push(mlRec.primary_advice);
      }
      
      // Add weather considerations from ML
      if (mlRec.weather_considerations && mlRec.weather_considerations.length > 0) {
        recommendations.push(...mlRec.weather_considerations.slice(0, 2));
      }
      
      // Add general recommendations if ML doesn't have enough
      if (recommendations.length < 2 && recommendationList.length > 0) {
        recommendations.push(...recommendationList.slice(0, 4 - recommendations.length));
      }
      
      // Add fallback recommendations if still empty
      if (recommendations.length === 0) {
        recommendations.push(
          'Schedule irrigation carefully',
          'Test soil nutrients before fertilization',
          'Monitor for pests and diseases',
          'Follow recommended planting dates'
        );
      }
      
      return recommendations;
    }
    
    return recommendationList || [];
  };

  // Get correct yield prediction
  const getCorrectYield = (crop) => {
    const mlPrediction = getMlPredictionForCrop(crop.cropKey);
    
    if (mlPrediction && mlPrediction.predicted_yield) {
      return {
        value: mlPrediction.predicted_yield,
        units: mlPrediction.units || 'tons/ha',
        isML: true
      };
    }
    
    return {
      value: crop.metrics?.ml_predicted_yield || 0,
      units: 'tons/ha',
      isML: false
    };
  };

  // Get correct confidence
  const getCorrectConfidence = (crop) => {
    const mlPrediction = getMlPredictionForCrop(crop.cropKey);
    
    if (mlPrediction && mlPrediction.confidence) {
      return mlPrediction.confidence;
    }
    
    return crop.metrics?.ml_confidence || 0.7;
  };

  const formatPkr = (value) => {
    if (value === null || value === undefined || Number.isNaN(Number(value))) return 'N/A';
    const numericValue = Number(value);
    const sign = numericValue > 0 ? '+' : '';
    return `${sign}PKR ${Math.round(numericValue).toLocaleString('en-PK')}`;
  };

  const getEconomicImpact = (crop) => {
    const fromRecommendation = crop.economicImpact;
    if (fromRecommendation) return fromRecommendation;

    const metrics = crop.metrics || {};
    if (metrics.impact_pkr_per_acre !== undefined) {
      return {
        expectedNetImpactPkrPerAcre: metrics.impact_pkr_per_acre,
        expectedRangePkrPerAcre: metrics.impact_range_pkr_per_acre,
        upsidePkrPerAcre: metrics.upside_pkr_per_acre,
        downsidePkrPerAcre: metrics.downside_pkr_per_acre
      };
    }

    return null;
  };

  // Get weather summary from ML
  const getMlWeatherSummary = (cropKey) => {
    const mlPrediction = getMlPredictionForCrop(cropKey);
    return mlPrediction?.weather_summary || null;
  };

  const getScoreColor = (score) => {
    if (score >= 80) return '#10b981';
    if (score >= 60) return '#f59e0b';
    return '#ef4444';
  };

  const getSuitabilityText = (score) => {
    if (score >= 80) return t('excellent', 'Excellent');
    if (score >= 60) return t('good', 'Good');
    if (score >= 40) return t('moderate', 'Moderate');
    return t('poor', 'Poor');
  };

  const getWeatherIcon = (day) => {
    const temp = day.T2M;
    const rain = day.PRECTOTCORR;
    
    if (rain > 5) return <CloudRain size={24} color="#60a5fa" />;
    if (rain > 0) return <CloudRain size={24} color="#06b6d4" />;
    if (temp > 35) return <Sun size={24} color="#ef4444" />;
    if (temp > 25) return <Sun size={24} color="#f59e0b" />;
    return <Cloud size={24} color="#94a3b8" />;
  };

  const getTempColor = (temp) => {
    if (temp > 35) return '#ef4444';
    if (temp > 25) return '#f59e0b';
    return '#06b6d4';
  };

  const formatDate = (dateString) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', { 
        weekday: 'short', 
        month: 'short', 
        day: 'numeric' 
      });
    } catch (error) {
      return dateString;
    }
  };

  const calculateWeatherStats = () => {
    if (!predictionData.forecast || predictionData.forecast.length === 0) return null;
    
    const forecast = predictionData.forecast;
    const temps = forecast.map(day => day.T2M);
    const maxTemps = forecast.map(day => day.T2M_MAX);
    const rainfall = forecast.map(day => day.PRECTOTCORR);
    
    return {
      avgTemp: (temps.reduce((sum, temp) => sum + temp, 0) / temps.length).toFixed(1),
      maxTemp: Math.max(...maxTemps).toFixed(1),
      totalRainfall: rainfall.reduce((sum, rain) => sum + rain, 0).toFixed(1),
      heatStressDays: forecast.filter(day => day.T2M_MAX > 35).length,
      dryDays: forecast.filter(day => day.PRECTOTCORR === 0).length
    };
  };

  const weatherStats = calculateWeatherStats();
  const displayedForecast = showFullForecast 
    ? predictionData.forecast 
    : (predictionData.forecast?.slice(0, 5) || []);

  // Crop planting windows (static for now, can be moved to config)
  const plantingWindows = {
    cotton: 'March - April',
    wheat: 'October - November',
    maize: 'June - July',
    rice: 'May - June',
    sugarcane: 'February - March or September - October'
  };

  // Crop water requirements
  const waterRequirements = {
    cotton: 'Moderate',
    wheat: 'Moderate',
    maize: 'Moderate to High',
    rice: 'High',
    sugarcane: 'High'
  };

  // Dashboard content component
  const DashboardContent = () => (
    <>
      {/* ML Service Status */}
      {predictionData.analysis && (
        <div style={{
          background: '#ffffff',
          backdropFilter: 'blur(16px) saturate(160%)',
          padding: '2rem',
          borderRadius: '20px',
          marginBottom: '2rem',
          border: '1px solid rgba(34, 197, 94, 0.25)',
          boxShadow: '0 18px 36px rgba(15, 23, 42, 0.08)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '1.5rem'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{
              background: 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)',
              padding: '1rem',
              borderRadius: '16px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 4px 12px rgba(34, 197, 94, 0.3), 0 0 0 1px rgba(34, 197, 94, 0.2) inset',
              animation: 'glow 2s ease-in-out infinite'
            }}>
              <CpuIcon size={28} color="white" />
            </div>
            <div>
              <div style={{ fontSize: '1.1rem', color: '#0f172a', fontWeight: '600' }}>
                AI Prediction Engine Status
              </div>
              <div style={{ fontSize: '0.95rem', color: '#64748b', marginTop: '0.25rem' }}>
                Using advanced ML models for accurate yield forecasting
              </div>
            </div>
          </div>
          <div style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap' }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '0.85rem', color: '#64748b', marginBottom: '0.25rem' }}>ML Coverage</div>
              <div style={{ fontSize: '1.5rem', fontWeight: '700', color: '#22c55e' }}>
                {((predictionData.analysis.ml_predictions / predictionData.analysis.total_crops) * 100).toFixed(1)}%
              </div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '0.85rem', color: '#64748b', marginBottom: '0.25rem' }}>Total Crops</div>
              <div style={{ fontSize: '1.5rem', fontWeight: '700', color: '#22c55e' }}>
                {predictionData.analysis.total_crops}
              </div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '0.85rem', color: '#64748b', marginBottom: '0.25rem' }}>Weather Days</div>
              <div style={{ fontSize: '1.5rem', fontWeight: '700', color: '#f59e0b' }}>
                {predictionData.analysis.weather_days}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Location & Analysis Info */}
      <div style={{
        background: '#ffffff',
        backdropFilter: 'blur(16px) saturate(160%)',
        padding: '2.5rem',
        borderRadius: '24px',
        marginBottom: '2rem',
        border: '1px solid rgba(34, 197, 94, 0.25)',
        boxShadow: '0 18px 36px rgba(15, 23, 42, 0.08)'
      }}>
        <h3 style={{ 
          margin: '0 0 2rem 0', 
          color: '#0f172a',
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem',
          fontSize: '1.5rem',
          fontWeight: '600'
        }}>
          <MapPin size={28} color="#22c55e" />
          Location Analysis
        </h3>
        
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', 
          gap: '1.5rem'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '1.5rem',
            padding: '1.5rem',
            background: 'rgba(34, 197, 94, 0.1)',
            borderRadius: '15px',
            border: '1px solid rgba(34, 197, 94, 0.3)',
            transition: 'all 0.3s ease'
          }}
          onMouseEnter={(e) => {
            e.target.style.transform = 'translateY(-5px)';
            e.target.style.boxShadow = '0 8px 25px rgba(34, 197, 94, 0.3)';
          }}
          onMouseLeave={(e) => {
            e.target.style.transform = 'translateY(0)';
            e.target.style.boxShadow = 'none';
          }}
          >
            <div style={{
              background: 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)',
              padding: '1rem',
              borderRadius: '12px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 4px 12px rgba(34, 197, 94, 0.4)'
            }}>
              <MapPin size={24} color="white" />
            </div>
            <div>
              <div style={{ fontSize: '0.9rem', color: '#64748b', fontWeight: '500' }}>Location</div>
              <div style={{ fontSize: '1.3rem', fontWeight: '700', color: '#22c55e' }}>
                {predictionData.location?.city || inputData?.city || 'Unknown Location'}
              </div>
            </div>
          </div>

          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '1.5rem',
            padding: '1.5rem',
            background: 'rgba(34, 197, 94, 0.1)',
            borderRadius: '15px',
            border: '1px solid rgba(34, 197, 94, 0.3)',
            transition: 'all 0.3s ease'
          }}
          onMouseEnter={(e) => {
            e.target.style.transform = 'translateY(-5px)';
            e.target.style.boxShadow = '0 8px 25px rgba(34, 197, 94, 0.3)';
          }}
          onMouseLeave={(e) => {
            e.target.style.transform = 'translateY(0)';
            e.target.style.boxShadow = 'none';
          }}
          >
            <div style={{
              background: 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)',
              padding: '1rem',
              borderRadius: '12px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 4px 12px rgba(34, 197, 94, 0.4)'
            }}>
              <Calendar size={24} color="white" />
            </div>
            <div>
              <div style={{ fontSize: '0.9rem', color: '#64748b', fontWeight: '500' }}>Forecast Period</div>
              <div style={{ fontSize: '1.3rem', fontWeight: '700', color: '#22c55e' }}>
                {inputData?.days || 7} Days
              </div>
            </div>
          </div>

          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '1.5rem',
            padding: '1.5rem',
            background: 'rgba(34, 197, 94, 0.1)',
            borderRadius: '15px',
            border: '1px solid rgba(34, 197, 94, 0.3)',
            transition: 'all 0.3s ease'
          }}
          onMouseEnter={(e) => {
            e.target.style.transform = 'translateY(-5px)';
            e.target.style.boxShadow = '0 8px 25px rgba(34, 197, 94, 0.3)';
          }}
          onMouseLeave={(e) => {
            e.target.style.transform = 'translateY(0)';
            e.target.style.boxShadow = 'none';
          }}
          >
            <div style={{
              background: 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)',
              padding: '1rem',
              borderRadius: '12px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 4px 12px rgba(34, 197, 94, 0.4)'
            }}>
              <Cpu size={24} color="white" />
            </div>
            <div>
              <div style={{ fontSize: '0.9rem', color: '#64748b', fontWeight: '500' }}>Analysis Engine</div>
              <div style={{ fontSize: '1.3rem', fontWeight: '700', color: '#22c55e' }}>
                Smart Prediction
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Weather Forecast Section */}
      {predictionData.forecast && predictionData.forecast.length > 0 && (
        <div style={{
          background: '#ffffff',
          backdropFilter: 'blur(16px) saturate(160%)',
          padding: '2.5rem',
          borderRadius: '24px',
          marginBottom: '2rem',
          border: '1px solid rgba(34, 197, 94, 0.3)',
          boxShadow: '0 18px 36px rgba(15, 23, 42, 0.08)'
        }}>
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center', 
            marginBottom: '2rem' 
          }}>
            <h3 style={{ 
              margin: 0, 
              color: '#0f172a', 
              display: 'flex', 
              alignItems: 'center', 
              gap: '0.75rem',
              fontSize: '1.5rem',
              fontWeight: '600'
            }}>
              <Cloud size={28} color="#22c55e" />
              {inputData?.days || 7}-Day Weather Forecast
            </h3>
            {predictionData.forecast.length > 5 && (
              <button
                onClick={() => setShowFullForecast(!showFullForecast)}
                style={{
                  background: 'rgba(34, 197, 94, 0.15)',
                  border: '1px solid rgba(34, 197, 94, 0.4)',
                  color: '#22c55e',
                  padding: '0.75rem 1.5rem',
                  borderRadius: '12px',
                  cursor: 'pointer',
                  fontSize: '0.9rem',
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  fontWeight: '600'
                }}
                onMouseEnter={(e) => {
                  e.target.style.background = 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)';
                  e.target.style.color = 'white';
                  e.target.style.transform = 'translateY(-2px)';
                  e.target.style.boxShadow = '0 4px 12px rgba(34, 197, 94, 0.4)';
                }}
                onMouseLeave={(e) => {
                  e.target.style.background = 'rgba(34, 197, 94, 0.15)';
                  e.target.style.color = '#22c55e';
                  e.target.style.transform = 'translateY(0)';
                  e.target.style.boxShadow = 'none';
                }}
              >
                {showFullForecast ? 'Show Less' : `Show All ${predictionData.forecast.length} Days`}
              </button>
            )}
          </div>

          {/* Weather Summary */}
          {weatherStats && (
            <div style={{
              padding: '1.5rem',
              background: 'rgba(34, 197, 94, 0.15)',
              borderRadius: '15px',
              border: '1px solid rgba(34, 197, 94, 0.3)',
              marginBottom: '2rem',
              backdropFilter: 'blur(10px)'
            }}>
              <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '0.75rem', 
                marginBottom: '1rem' 
              }}>
                <TrendingUp size={20} color="#22c55e" />
                <strong style={{ 
                  color: '#22c55e', 
                  fontSize: '1.2rem' 
                }}>
                  Weather Pattern Analysis
                </strong>
              </div>
              <div style={{ 
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                gap: '1rem',
                color: '#334155',
                fontSize: '1rem'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Thermometer size={18} color="#ef4444" />
                  Average Temperature: <strong style={{ color: '#ef4444' }}>{weatherStats.avgTemp}°C</strong>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Sun size={18} color="#f59e0b" />
                  Maximum Temperature: <strong style={{ color: '#f59e0b' }}>{weatherStats.maxTemp}°C</strong>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Droplets size={18} color="#06b6d4" />
                  Total Rainfall: <strong style={{ color: '#06b6d4' }}>{weatherStats.totalRainfall}mm</strong>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <AlertTriangle size={18} color="#ef4444" />
                  Heat Stress Days: <strong style={{ color: '#ef4444' }}>{weatherStats.heatStressDays}</strong>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Cloud size={18} color="#94a3b8" />
                  Dry Days: <strong style={{ color: '#64748b' }}>{weatherStats.dryDays}</strong>
                </div>
              </div>
            </div>
          )}

          {/* Forecast Grid */}
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', 
            gap: '1.5rem',
            marginBottom: '1.5rem'
          }}>
            {displayedForecast.map((day, index) => (
              <div key={index} style={{
                background: '#ffffff',
                padding: '1.5rem',
                borderRadius: '15px',
                border: '1px solid rgba(148, 163, 184, 0.2)',
                textAlign: 'center',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                cursor: 'pointer',
                backdropFilter: 'blur(10px)'
              }}
              onMouseEnter={(e) => {
                e.target.style.background = '#f8fafc';
                e.target.style.transform = 'translateY(-5px)';
                e.target.style.boxShadow = '0 10px 25px rgba(15, 23, 42, 0.12)';
              }}
              onMouseLeave={(e) => {
                e.target.style.background = '#ffffff';
                e.target.style.transform = 'translateY(0)';
                e.target.style.boxShadow = 'none';
              }}
              >
                <div style={{ 
                  fontSize: '1rem', 
                  color: '#64748b', 
                  marginBottom: '1rem',
                  fontWeight: '600'
                }}>
                  {formatDate(day.date)}
                </div>
                <div style={{ marginBottom: '1rem' }}>
                  {getWeatherIcon(day)}
                </div>
                <div style={{ 
                  fontSize: '1.5rem', 
                  fontWeight: 'bold', 
                  color: getTempColor(day.T2M),
                  marginBottom: '0.5rem'
                }}>
                  {Math.round(day.T2M)}°C
                </div>
                <div style={{ fontSize: '0.9rem', color: '#64748b', marginBottom: '0.75rem' }}>
                  H: {Math.round(day.T2M_MAX)}°C • L: {Math.round(day.T2M_MIN)}°C
                </div>
                <div style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center', 
                  gap: '0.5rem',
                  marginTop: '0.75rem',
                  fontSize: '0.9rem',
                  color: '#22c55e',
                  fontWeight: '500'
                }}>
                  <Droplets size={16} />
                  {day.PRECTOTCORR.toFixed(1)}mm rain
                </div>
                <div style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center', 
                  gap: '0.5rem',
                  marginTop: '0.5rem',
                  fontSize: '0.9rem',
                  color: '#64748b'
                }}>
                  <Wind size={16} />
                  {day.WS2M?.toFixed(1) || '0.0'} m/s
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Crop Recommendations with ML Data */}
      <div style={{ marginBottom: '2rem' }}>
        <h2 style={{ 
          color: '#0f172a', 
          marginBottom: '2rem', 
          display: 'flex', 
          alignItems: 'center', 
          gap: '0.75rem',
          fontSize: '1.8rem',
          fontWeight: '700'
        }}>
          <Sprout size={32} color="#22c55e" />
          <span style={{
            background: 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text'
          }}>
            AI-Powered Crop Recommendations
          </span>
          <span style={{
            background: 'rgba(34, 197, 94, 0.2)',
            color: '#22c55e',
            padding: '0.5rem 1rem',
            borderRadius: '20px',
            fontSize: '0.9rem',
            marginLeft: '1rem',
            fontWeight: '600',
            border: '1px solid rgba(34, 197, 94, 0.3)'
          }}>
            {predictionData.recommendations?.length || 0} crops analyzed
          </span>
        </h2>
        
        {predictionData.recommendations && predictionData.recommendations.length > 0 ? (
          <div style={{ display: 'grid', gap: '2rem' }}>
            {predictionData.recommendations.map((crop, index) => {
              const mlPrediction = getMlPredictionForCrop(crop.cropKey);
              const mlWeatherSummary = getMlWeatherSummary(crop.cropKey);
              const yieldData = getCorrectYield(crop);
              const confidence = getCorrectConfidence(crop);
              const recommendations = getCorrectRecommendation(crop, crop.recommendation);
              const economicImpact = getEconomicImpact(crop);
              
              return (
                <div key={crop.cropKey || index} style={{
                  background: '#ffffff',
                  backdropFilter: 'blur(16px) saturate(160%)',
                  padding: '2.5rem',
                  borderRadius: '24px',
                  border: `1px solid ${getScoreColor(crop.score)}`,
                  position: 'relative',
                  boxShadow: `0 18px 36px rgba(15, 23, 42, 0.08), 0 0 0 1px ${getScoreColor(crop.score)}20 inset`,
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
                }}
                onMouseEnter={(e) => {
                  e.target.style.transform = 'translateY(-8px)';
                  e.target.style.boxShadow = `0 24px 48px rgba(15, 23, 42, 0.12), 0 0 0 1px ${getScoreColor(crop.score)}40 inset`;
                }}
                onMouseLeave={(e) => {
                  e.target.style.transform = 'translateY(0)';
                  e.target.style.boxShadow = `0 18px 36px rgba(15, 23, 42, 0.08), 0 0 0 1px ${getScoreColor(crop.score)}20 inset`;
                }}
                >
                  {/* Best Match Badge */}
                  {index === 0 && crop.score >= 80 && (
                    <span style={{
                      position: 'absolute',
                      top: '-15px',
                      right: '2rem',
                      background: 'linear-gradient(90deg, #f59e0b 0%, #d97706 100%)',
                      color: 'white',
                      padding: '0.75rem 2rem',
                      borderRadius: '25px',
                      fontSize: '0.9rem',
                      fontWeight: 'bold',
                      boxShadow: '0 6px 20px rgba(245,158,11,0.4)',
                      animation: 'glow 2s ease-in-out infinite'
                    }}>
                      🏆 BEST MATCH
                    </span>
                  )}

                  {/* ML Model Badge */}
                  {mlPrediction && (
                    <span style={{
                      position: 'absolute',
                      top: '-15px',
                      left: '2rem',
                      background: 'linear-gradient(90deg, #22c55e 0%, #16a34a 100%)',
                      color: 'white',
                      padding: '0.75rem 1.5rem',
                      borderRadius: '25px',
                      fontSize: '0.8rem',
                      fontWeight: 'bold',
                      boxShadow: '0 6px 20px rgba(34, 197, 94, 0.4)',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      animation: 'glow 2s ease-in-out infinite'
                    }}>
                      <Brain size={14} />
                      AI Model: {mlPrediction.model_used || 'GRU'}
                    </span>
                  )}

                  <div style={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'flex-start', 
                    marginBottom: '2rem',
                    flexWrap: 'wrap',
                    gap: '1.5rem'
                  }}>
                    <div style={{ flex: 1 }}>
                      <h3 style={{ 
                        margin: '0 0 1rem 0', 
                        fontSize: '2rem', 
                        background: 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                        backgroundClip: 'text',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.75rem'
                      }}>
                        {crop.crop}
                        {index === 0 && crop.score >= 80 && (
                          <span style={{ fontSize: '1.2rem', color: '#f59e0b' }}>⭐</span>
                        )}
                      </h3>
                      <div style={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        gap: '1.5rem', 
                        flexWrap: 'wrap' 
                      }}>
                        <span style={{
                          background: getScoreColor(crop.score),
                          color: 'white',
                          padding: '0.75rem 1.5rem',
                          borderRadius: '25px',
                          fontSize: '1.1rem',
                          fontWeight: '700',
                          boxShadow: `0 6px 20px ${getScoreColor(crop.score)}40`,
                          animation: 'glow 2s ease-in-out infinite'
                        }}>
                          {getSuitabilityText(crop.score)} ({crop.score}%)
                        </span>
                        
                        {mlPrediction && mlPrediction.recommendation?.status && (
                          <span style={{
                            background: mlPrediction.recommendation.status.includes('EXCELLENT') ? '#10b981' : 
                                      mlPrediction.recommendation.status.includes('GOOD') ? '#f59e0b' :
                                      mlPrediction.recommendation.status.includes('MODERATE') ? '#f59e0b' :
                                      '#ef4444',
                            color: 'white',
                            padding: '0.75rem 1.5rem',
                            borderRadius: '25px',
                            fontSize: '0.9rem',
                            fontWeight: '600',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem',
                            boxShadow: `0 4px 12px ${mlPrediction.recommendation.status.includes('EXCELLENT') ? '#10b981' : 
                                      mlPrediction.recommendation.status.includes('GOOD') ? '#f59e0b' :
                                      mlPrediction.recommendation.status.includes('MODERATE') ? '#f59e0b' :
                                      '#ef4444'}40`
                          }}>
                            <Zap size={14} />
                            {mlPrediction.recommendation.status}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* ML Prediction Details */}
                  {mlPrediction && (
                    <div style={{
                      background: '#eef6f0',
                      borderRadius: '15px',
                      padding: '1.5rem',
                      marginBottom: '2rem',
                      border: '1px solid rgba(34, 197, 94, 0.3)',
                      backdropFilter: 'blur(10px)'
                    }}>
                      <div style={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        gap: '0.75rem', 
                        marginBottom: '1rem' 
                      }}>
                        <Brain size={20} color="#22c55e" />
                        <strong style={{ 
                          color: '#22c55e', 
                          fontSize: '1.1rem' 
                        }}>
                          🤖 AI Yield Prediction
                        </strong>
                      </div>
                      
                      <div style={{ 
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                        gap: '1rem',
                        marginBottom: '1rem'
                      }}>
                        <div>
                          <div style={{ fontSize: '0.9rem', color: '#64748b', marginBottom: '0.25rem' }}>
                            Predicted Yield
                          </div>
                          <div style={{ 
                            fontSize: '1.3rem', 
                            fontWeight: 'bold', 
                            color: '#22c55e',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem'
                          }}>
                            {yieldData.value.toFixed(1)} {yieldData.units}
                            {mlPrediction.recommendation?.yield_change && (
                              <span style={{
                                fontSize: '0.9rem',
                                color: mlPrediction.recommendation.yield_change.startsWith('+') ? '#10b981' : '#ef4444',
                                background: mlPrediction.recommendation.yield_change.startsWith('+') ? 'rgba(16, 185, 129, 0.2)' : 'rgba(239, 68, 68, 0.2)',
                                padding: '0.25rem 0.75rem',
                                borderRadius: '12px',
                                border: `1px solid ${mlPrediction.recommendation.yield_change.startsWith('+') ? 'rgba(16, 185, 129, 0.3)' : 'rgba(239, 68, 68, 0.3)'}`,
                              }}>
                                {mlPrediction.recommendation.yield_change}
                              </span>
                            )}
                          </div>
                        </div>
                        
                        <div>
                          <div style={{ fontSize: '0.9rem', color: '#64748b', marginBottom: '0.25rem' }}>
                            AI Confidence
                          </div>
                          <div style={{ 
                            fontSize: '1.3rem', 
                            fontWeight: 'bold', 
                            color: confidence >= 0.8 ? '#10b981' : 
                                   confidence >= 0.6 ? '#f59e0b' : '#ef4444'
                          }}>
                            {(confidence * 100).toFixed(0)}%
                          </div>
                        </div>
                        
                        {mlWeatherSummary && (
                          <div>
                            <div style={{ fontSize: '0.9rem', color: '#64748b', marginBottom: '0.25rem' }}>
                              ML Analysis Period
                            </div>
                            <div style={{ 
                              fontSize: '1rem', 
                              fontWeight: 'bold', 
                              color: '#334155'
                            }}>
                              {mlWeatherSummary.days_analyzed} days
                            </div>
                          </div>
                        )}

                        {economicImpact && (
                          <div>
                            <div style={{ fontSize: '0.9rem', color: '#64748b', marginBottom: '0.25rem' }}>
                              Expected Impact (PKR/acre)
                            </div>
                            <div style={{ 
                              fontSize: '1.2rem', 
                              fontWeight: 'bold',
                              color: (economicImpact.expectedNetImpactPkrPerAcre || 0) >= 0 ? '#10b981' : '#ef4444'
                            }}>
                              {formatPkr(economicImpact.expectedNetImpactPkrPerAcre)}
                            </div>
                            <div style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '0.25rem' }}>
                              Range: {formatPkr(economicImpact.expectedRangePkrPerAcre?.lower)} to {formatPkr(economicImpact.expectedRangePkrPerAcre?.upper)}
                            </div>
                          </div>
                        )}
                      </div>
                      
                      {/* ML Weather Summary */}
                      {mlWeatherSummary && (
                        <div style={{
                          padding: '1rem',
                          background: '#f8fafc',
                          borderRadius: '10px',
                          marginTop: '1rem',
                          border: '1px solid rgba(148, 163, 184, 0.2)',
                          backdropFilter: 'blur(10px)'
                        }}>
                          <div style={{ 
                            fontSize: '0.9rem', 
                            color: '#64748b', 
                            marginBottom: '0.5rem',
                            fontWeight: '600'
                          }}>
                            📊 ML Weather Analysis:
                          </div>
                          <div style={{ 
                            display: 'grid',
                            gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
                            gap: '0.75rem',
                            fontSize: '0.85rem'
                          }}>
                            <div>
                              <span style={{ color: '#64748b' }}>Avg Temp:</span>
                              <span style={{ marginLeft: '0.5rem', fontWeight: '600', color: '#334155' }}>
                                {mlWeatherSummary.avg_temperature}°C
                              </span>
                            </div>
                            <div>
                              <span style={{ color: '#64748b' }}>Max Temp:</span>
                              <span style={{ marginLeft: '0.5rem', fontWeight: '600', color: '#334155' }}>
                                {mlWeatherSummary.max_temperature}°C
                              </span>
                            </div>
                            <div>
                              <span style={{ color: '#64748b' }}>Total Rain:</span>
                              <span style={{ marginLeft: '0.5rem', fontWeight: '600', color: '#334155' }}>
                                {mlWeatherSummary.total_rainfall}mm
                              </span>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Advantages & Considerations */}
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
                    gap: '2rem',
                    marginBottom: '2rem'
                  }}>
                    {/* Advantages */}
                    {crop.advantages && crop.advantages.length > 0 && (
                      <div>
                        <h4 style={{ 
                          color: '#22c55e', 
                          marginBottom: '1rem', 
                          fontSize: '1.2rem',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.5rem',
                          fontWeight: '600'
                        }}>
                          ✅ Advantages
                        </h4>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem' }}>
                          {crop.advantages.slice(0, 4).map((adv, i) => (
                            <span key={i} style={{
                              background: 'rgba(34, 197, 94, 0.1)',
                              color: '#22c55e',
                              padding: '0.75rem 1rem',
                              borderRadius: '10px',
                              fontSize: '0.9rem',
                              border: '1px solid rgba(34, 197, 94, 0.3)',
                              fontWeight: '500',
                              transition: 'all 0.3s ease',
                              backdropFilter: 'blur(10px)'
                            }}
                            onMouseEnter={(e) => {
                              e.target.style.background = 'rgba(34, 197, 94, 0.2)';
                              e.target.style.transform = 'scale(1.02)';
                            }}
                            onMouseLeave={(e) => {
                              e.target.style.background = 'rgba(34, 197, 94, 0.1)';
                              e.target.style.transform = 'scale(1)';
                            }}
                            >
                              {adv}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Issues/Considerations */}
                    {crop.issues && crop.issues.length > 0 && (
                      <div>
                        <h4 style={{ 
                          color: '#ef4444', 
                          marginBottom: '1rem', 
                          fontSize: '1.2rem',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.5rem',
                          fontWeight: '600'
                        }}>
                          ⚠️ Considerations
                        </h4>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem' }}>
                          {crop.issues.slice(0, 4).map((issue, i) => (
                            <span key={i} style={{
                              background: 'rgba(239, 68, 68, 0.1)',
                              color: '#ef4444',
                              padding: '0.75rem 1rem',
                              borderRadius: '10px',
                              fontSize: '0.9rem',
                              border: '1px solid rgba(239, 68, 68, 0.3)',
                              fontWeight: '500',
                              transition: 'all 0.3s ease',
                              backdropFilter: 'blur(10px)'
                            }}
                            onMouseEnter={(e) => {
                              e.target.style.background = 'rgba(239, 68, 68, 0.2)';
                              e.target.style.transform = 'scale(1.02)';
                            }}
                            onMouseLeave={(e) => {
                              e.target.style.background = 'rgba(239, 68, 68, 0.1)';
                              e.target.style.transform = 'scale(1)';
                            }}
                            >
                              {issue}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Recommendations */}
                  {recommendations.length > 0 && (
                    <div style={{ marginBottom: '2rem' }}>
                      <h4 style={{ 
                        color: '#22c55e', 
                        marginBottom: '1rem', 
                        fontSize: '1.2rem',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        fontWeight: '600'
                      }}>
                        💡 Action Plan
                      </h4>
                      <div style={{ 
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                        gap: '0.75rem'
                      }}>
                        {recommendations.slice(0, 4).map((rec, i) => (
                          <div key={i} style={{
                            display: 'flex',
                            alignItems: 'flex-start',
                            gap: '0.75rem',
                            padding: '1rem',
                            background: '#f8fafc',
                            borderRadius: '10px',
                            border: '1px solid rgba(34, 197, 94, 0.3)',
                            backdropFilter: 'blur(10px)',
                            transition: 'all 0.3s ease'
                          }}
                          onMouseEnter={(e) => {
                            e.target.style.background = '#eef6f0';
                            e.target.style.transform = 'translateX(4px)';
                          }}
                          onMouseLeave={(e) => {
                            e.target.style.background = '#f8fafc';
                            e.target.style.transform = 'translateX(0)';
                          }}
                          >
                            <span style={{ color: '#22c55e', fontSize: '1rem', fontWeight: 'bold', marginTop: '0.25rem' }}>→</span>
                            <span style={{ fontSize: '0.95rem', lineHeight: '1.5', color: '#334155' }}>
                              {rec}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Metrics */}
                  <div style={{ 
                    display: 'grid', 
                    gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', 
                    gap: '1.5rem', 
                    marginTop: '2rem',
                    paddingTop: '2rem',
                    borderTop: '1px solid rgba(15, 23, 42, 0.08)'
                  }}>
                    <div style={{
                      textAlign: 'center',
                      padding: '1.5rem',
                      background: 'rgba(34, 197, 94, 0.1)',
                      borderRadius: '12px',
                      border: '1px solid rgba(34, 197, 94, 0.3)',
                      backdropFilter: 'blur(10px)',
                      transition: 'all 0.3s ease'
                    }}
                    onMouseEnter={(e) => {
                      e.target.style.transform = 'translateY(-5px)';
                      e.target.style.boxShadow = '0 8px 25px rgba(34, 197, 94, 0.3)';
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.transform = 'translateY(0)';
                      e.target.style.boxShadow = 'none';
                    }}
                    >
                      <div style={{ fontSize: '0.9rem', color: '#64748b', marginBottom: '0.75rem', fontWeight: '600' }}>
                        Predicted Yield
                      </div>
                      <div style={{ 
                        fontSize: '1.4rem', 
                        fontWeight: 'bold', 
                        color: '#22c55e',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '0.5rem'
                      }}>
                        {yieldData.value.toFixed(1)} {yieldData.units}
                      </div>
                    </div>
                    
                    <div style={{
                      textAlign: 'center',
                      padding: '1.5rem',
                      background: 'rgba(34, 197, 94, 0.1)',
                      borderRadius: '12px',
                      border: '1px solid rgba(34, 197, 94, 0.3)',
                      backdropFilter: 'blur(10px)',
                      transition: 'all 0.3s ease'
                    }}
                    onMouseEnter={(e) => {
                      e.target.style.transform = 'translateY(-5px)';
                      e.target.style.boxShadow = '0 8px 25px rgba(34, 197, 94, 0.3)';
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.transform = 'translateY(0)';
                      e.target.style.boxShadow = 'none';
                    }}
                    >
                      <div style={{ fontSize: '0.9rem', color: '#64748b', marginBottom: '0.75rem', fontWeight: '600' }}>
                        Confidence Score
                      </div>
                      <div style={{ 
                        fontSize: '1.4rem', 
                        fontWeight: 'bold', 
                        color: confidence >= 0.8 ? '#10b981' : 
                               confidence >= 0.6 ? '#f59e0b' : '#ef4444',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '0.5rem'
                      }}>
                        {(confidence * 100).toFixed(0)}%
                      </div>
                    </div>
                    
                    <div style={{
                      textAlign: 'center',
                      padding: '1.5rem',
                      background: 'rgba(34, 197, 94, 0.1)',
                      borderRadius: '12px',
                      border: '1px solid rgba(34, 197, 94, 0.3)',
                      backdropFilter: 'blur(10px)',
                      transition: 'all 0.3s ease'
                    }}
                    onMouseEnter={(e) => {
                      e.target.style.transform = 'translateY(-5px)';
                      e.target.style.boxShadow = '0 8px 25px rgba(34, 197, 94, 0.3)';
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.transform = 'translateY(0)';
                      e.target.style.boxShadow = 'none';
                    }}
                    >
                      <div style={{ fontSize: '0.9rem', color: '#64748b', marginBottom: '0.75rem', fontWeight: '600' }}>
                        Planting Window
                      </div>
                      <div style={{ 
                        fontSize: '1.2rem', 
                        fontWeight: 'bold',
                        color: '#f59e0b'
                      }}>
                        {plantingWindows[crop.cropKey] || crop.plantingWindow || 'Flexible'}
                      </div>
                    </div>
                    
                    <div style={{
                      textAlign: 'center',
                      padding: '1.5rem',
                      background: 'rgba(34, 197, 94, 0.1)',
                      borderRadius: '12px',
                      border: '1px solid rgba(34, 197, 94, 0.3)',
                      backdropFilter: 'blur(10px)',
                      transition: 'all 0.3s ease'
                    }}
                    onMouseEnter={(e) => {
                      e.target.style.transform = 'translateY(-5px)';
                      e.target.style.boxShadow = '0 8px 25px rgba(34, 197, 94, 0.3)';
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.transform = 'translateY(0)';
                      e.target.style.boxShadow = 'none';
                    }}
                    >
                      <div style={{ fontSize: '0.9rem', color: '#64748b', marginBottom: '0.75rem', fontWeight: '600' }}>
                        Water Needs
                      </div>
                      <div style={{ 
                        fontSize: '1.2rem', 
                        fontWeight: 'bold',
                        color: '#22c55e',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '0.5rem'
                      }}>
                        <Droplets size={18} color="#22c55e" />
                        {waterRequirements[crop.cropKey] || crop.waterRequirements || 'Moderate'}
                      </div>
                    </div>

                    {economicImpact && (
                      <div style={{
                        textAlign: 'center',
                        padding: '1.5rem',
                        background: 'rgba(34, 197, 94, 0.1)',
                        borderRadius: '12px',
                        border: '1px solid rgba(34, 197, 94, 0.3)',
                        backdropFilter: 'blur(10px)',
                        transition: 'all 0.3s ease'
                      }}
                      onMouseEnter={(e) => {
                        e.target.style.transform = 'translateY(-5px)';
                        e.target.style.boxShadow = '0 8px 25px rgba(34, 197, 94, 0.3)';
                      }}
                      onMouseLeave={(e) => {
                        e.target.style.transform = 'translateY(0)';
                        e.target.style.boxShadow = 'none';
                      }}
                      >
                        <div style={{ fontSize: '0.9rem', color: '#64748b', marginBottom: '0.75rem', fontWeight: '600' }}>
                          Upside / Downside
                        </div>
                        <div style={{ fontSize: '1rem', fontWeight: 'bold', color: '#10b981' }}>
                          Upside: {formatPkr(economicImpact.upsidePkrPerAcre)}
                        </div>
                        <div style={{ fontSize: '0.95rem', fontWeight: 'bold', color: '#ef4444', marginTop: '0.5rem' }}>
                          Downside: PKR {Math.round(economicImpact.downsidePkrPerAcre || 0).toLocaleString('en-PK')}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div style={{
            background: 'rgba(239, 68, 68, 0.1)',
            padding: '3rem',
            borderRadius: '20px',
            textAlign: 'center',
            border: '1px solid rgba(239, 68, 68, 0.3)',
            boxShadow: '0 8px 32px rgba(239, 68, 68, 0.2)',
            backdropFilter: 'blur(10px)'
          }}>
            <AlertTriangle size={48} color="#ef4444" style={{ marginBottom: '1.5rem' }} />
            <h3 style={{ color: '#ef4444', marginBottom: '1rem', fontSize: '1.5rem' }}>
              No Crop Recommendations Available
            </h3>
            <p style={{ color: '#94a3b8', fontSize: '1.1rem' }}>
              We couldn't generate crop recommendations for the specified location and weather conditions.
              Please try with different parameters.
            </p>
          </div>
        )}
      </div>

      {/* Important Notes */}
      <div style={{
        background: 'rgba(245, 158, 11, 0.1)',
        padding: '2.5rem',
        borderRadius: '20px',
        border: '1px solid rgba(245, 158, 11, 0.3)',
        marginBottom: '2rem',
        boxShadow: '0 8px 32px rgba(245, 158, 11, 0.2)',
        backdropFilter: 'blur(10px)'
      }}>
        <h3 style={{ 
          margin: '0 0 1.5rem 0', 
          color: '#f59e0b', 
          display: 'flex', 
          alignItems: 'center', 
          gap: '0.75rem',
          fontSize: '1.5rem',
          fontWeight: '600'
        }}>
          <AlertTriangle size={28} color="#f59e0b" />
          Important Considerations
        </h3>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: '1rem',
          color: '#475569'
        }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
            <span style={{ fontSize: '1.2rem', color: '#f59e0b' }}>•</span>
            <span style={{ color: '#475569' }}>These recommendations are based on {inputData?.days || 7}-day weather forecast and analysis</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
            <span style={{ fontSize: '1.2rem', color: '#f59e0b' }}>•</span>
            <span style={{ color: '#475569' }}>Weather forecasts may change - monitor updates regularly</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
            <span style={{ fontSize: '1.2rem', color: '#f59e0b' }}>•</span>
            <span style={{ color: '#475569' }}>Always verify soil conditions and local agricultural practices</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
            <span style={{ fontSize: '1.2rem', color: '#f59e0b' }}>•</span>
            <span style={{ color: '#475569' }}>Consult with local agricultural experts for final decisions</span>
          </div>
        </div>
      </div>

      {/* Footer Action */}
      <div style={{
        textAlign: 'center',
        marginTop: '3rem',
        padding: '3rem',
        borderTop: '1px solid rgba(15, 23, 42, 0.08)'
      }}>
        <button
          onClick={() => navigate('/crop-prediction')}
          style={{
            background: 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)',
            color: 'white',
            border: 'none',
            padding: '1.25rem 2.5rem',
            borderRadius: '15px',
            cursor: 'pointer',
            fontSize: '1.1rem',
            fontWeight: '700',
            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            boxShadow: '0 8px 25px rgba(34, 197, 94, 0.3)',
            animation: 'glow 2s ease-in-out infinite'
          }}
          onMouseEnter={(e) => {
            e.target.style.transform = 'translateY(-3px)';
            e.target.style.boxShadow = '0 12px 30px rgba(34, 197, 94, 0.4)';
          }}
          onMouseLeave={(e) => {
            e.target.style.transform = 'translateY(0)';
            e.target.style.boxShadow = '0 8px 25px rgba(34, 197, 94, 0.3)';
          }}
        >
          🔄 Make Another Prediction
        </button>
        <p style={{ 
          color: '#64748b', 
          marginTop: '1.5rem',
          fontSize: '1rem'
        }}>
          Need help? Contact our agricultural experts for personalized advice.
        </p>
      </div>
    </>
  );

  return (
    <div style={{
      background: 'linear-gradient(135deg, #f7fbf8 0%, #eef6f0 50%, #f7fbf8 100%)',
      minHeight: '100vh',
      color: '#0f172a',
      fontFamily: '"SF Pro Display", -apple-system, BlinkMacSystemFont, sans-serif',
    }}>
      {pageLoading && (
        <div className="pr-loading-overlay" aria-live="polite" aria-busy="true">
          <div className="pr-loading-sky">
            <div className="pr-loading-sun" />
            <div className="pr-loading-cloud" />
            <div className="pr-loading-rain">
              {Array.from({ length: 9 }).map((_, idx) => (
                <span key={`pr-drop-${idx}`} className="pr-loading-drop" />
              ))}
            </div>
          </div>
          <div className="pr-loading-label">Loading climate insights...</div>
        </div>
      )}
      <style>{`
        @keyframes glow {
          0%, 100% { box-shadow: 0 0 5px rgba(34, 197, 94, 0.5); }
          50% { box-shadow: 0 0 20px rgba(34, 197, 94, 0.8); }
        }
        @keyframes prCloudFloat {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-6px); }
        }
        @keyframes prRainFall {
          0% { transform: translateY(-8px); opacity: 0.2; }
          50% { opacity: 0.8; }
          100% { transform: translateY(10px); opacity: 0.2; }
        }
        .pr-loading-overlay {
          position: fixed;
          inset: 0;
          background: rgba(247, 251, 248, 0.92);
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 1rem;
          z-index: 2000;
          backdrop-filter: blur(4px);
        }
        .pr-loading-sky {
          position: relative;
          width: 220px;
          height: 140px;
        }
        .pr-loading-sun {
          position: absolute;
          width: 34px;
          height: 34px;
          border-radius: 50%;
          border: 2px solid #f59e0b;
          top: 12px;
          right: 36px;
          box-shadow: 0 0 10px rgba(245, 158, 11, 0.35);
        }
        .pr-loading-cloud {
          position: absolute;
          width: 120px;
          height: 38px;
          border-radius: 999px;
          border: 2px solid #f59e0b;
          top: 40px;
          left: 30px;
          background: rgba(255, 255, 255, 0.6);
          animation: prCloudFloat 3.6s ease-in-out infinite;
        }
        .pr-loading-cloud::before,
        .pr-loading-cloud::after {
          content: "";
          position: absolute;
          border: 2px solid #f59e0b;
          border-radius: 999px;
          background: rgba(255, 255, 255, 0.6);
        }
        .pr-loading-cloud::before {
          width: 44px;
          height: 44px;
          top: -24px;
          left: 18px;
        }
        .pr-loading-cloud::after {
          width: 54px;
          height: 54px;
          top: -30px;
          left: 52px;
        }
        .pr-loading-rain {
          position: absolute;
          left: 0;
          right: 0;
          bottom: 12px;
          height: 50px;
          display: grid;
          grid-template-columns: repeat(5, 1fr);
          gap: 8px;
          padding: 0 40px;
        }
        .pr-loading-drop {
          width: 4px;
          height: 16px;
          background: #cbd5e1;
          border-radius: 999px;
          animation: prRainFall 1.1s ease-in-out infinite;
        }
        .pr-loading-drop:nth-child(2n) { animation-delay: -0.3s; }
        .pr-loading-drop:nth-child(3n) { animation-delay: -0.6s; }
        .pr-loading-label {
          color: #1b4332;
          font-weight: 700;
          font-size: 0.95rem;
        }
        /* Green scrollbar styles */
        ::-webkit-scrollbar {
          width: 12px;
          height: 12px;
        }
        ::-webkit-scrollbar-track {
          background: rgba(15, 23, 42, 0.08);
          border-radius: 10px;
        }
        ::-webkit-scrollbar-thumb {
          background: linear-gradient(135deg, #22c55e 0%, #16a34a 100%);
          border-radius: 10px;
          border: 2px solid rgba(15, 23, 42, 0.08);
        }
        ::-webkit-scrollbar-thumb:hover {
          background: linear-gradient(135deg, #16a34a 0%, #15803d 100%);
        }
        /* Firefox scrollbar */
        * {
          scrollbar-width: thin;
          scrollbar-color: #22c55e rgba(15, 23, 42, 0.08);
        }
      `}</style>

      {/* Sidebar */}
      <Sidebar 
        isOpen={sidebarOpen}
        setIsOpen={setSidebarOpen}
        activePage={activePage}
        setActivePage={setActivePage}
        navigate={navigate}
      />

      {/* Main Content */}
      <div style={{
        marginLeft: window.innerWidth >= 768 ? (sidebarOpen ? '280px' : '80px') : '0',
        padding: '0 1rem',
        transition: 'margin-left 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
      }}>
        <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
          {/* Header */}
          <header style={{
            background: 'rgba(255, 255, 255, 0.92)',
            backdropFilter: 'blur(16px) saturate(160%)',
            borderBottom: '1px solid rgba(34, 197, 94, 0.2)',
            padding: '1.25rem 2rem',
            position: 'sticky',
            top: 0,
            zIndex: 100,
            boxShadow: '0 8px 24px rgba(15, 23, 42, 0.08)',
            marginLeft: '-1rem',
            marginRight: '-1rem',
            marginBottom: '2rem',
            borderRadius: '0 0 20px 20px'
          }}>
            <nav style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              maxWidth: '1400px',
              margin: '0 auto',
            }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '1rem'
              }}>
                <div style={{
                  display: window.innerWidth >= 768 ? 'flex' : 'none',
                  alignItems: 'center',
                  gap: '0.75rem'
                }}>
                  <Leaf size={32} color="#22c55e" />
                  <span style={{
                    fontSize: '1.5rem',
                    fontWeight: '700',
                    background: 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text'
                  }}>
                    FASALGUARD
                  </span>
                </div>
                
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  background: 'rgba(34, 197, 94, 0.12)',
                  padding: '0.75rem 1.5rem',
                  borderRadius: '14px',
                  border: '1px solid rgba(34, 197, 94, 0.3)',
                  animation: 'glow 2s ease-in-out infinite'
                }}>
                  <Brain size={20} color="#22c55e" />
                  <span style={{ color: '#22c55e', fontWeight: '600' }}>
                    {activePage === 'dashboard' && 'AI Prediction Results'}
                    {activePage === 'weather' && 'Weather Analytics'}
                    {activePage === 'irrigation' && 'Smart Irrigation'}
                    {activePage === 'matrix' && 'Crop Comparison Matrix'}
                    {activePage === 'report' && 'Report Generator'}
                  </span>
                </div>
              </div>
              
              <div style={{ 
                display: 'flex',
                alignItems: 'center',
                gap: '1rem',
              }}>
                <button
                  onClick={() => navigate('/past-trends')}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.625rem',
                    background: 'rgba(34, 197, 94, 0.12)',
                    border: '1px solid rgba(34, 197, 94, 0.3)',
                    color: '#22c55e',
                    padding: '0.875rem 1.75rem',
                    borderRadius: '14px',
                    cursor: 'pointer',
                    fontSize: '1rem',
                    fontWeight: '600',
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                    boxShadow: '0 2px 8px rgba(34, 197, 94, 0.15)',
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.background = 'rgba(34, 197, 94, 0.2)';
                    e.target.style.transform = 'scale(1.05)';
                    e.target.style.boxShadow = '0 4px 16px rgba(34, 197, 94, 0.25)';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.background = 'rgba(34, 197, 94, 0.12)';
                    e.target.style.transform = 'scale(1)';
                    e.target.style.boxShadow = '0 2px 8px rgba(34, 197, 94, 0.15)';
                  }}
                >
                  <BarChart3 size={20} />
                  Past Trends
                </button>
                
                <button
                  onClick={() => navigate('/crop-prediction')}
                  style={{
                    background: 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)',
                    color: 'white',
                    border: 'none',
                    padding: '0.875rem 1.75rem',
                    borderRadius: '14px',
                    cursor: 'pointer',
                    fontSize: '1rem',
                    fontWeight: '600',
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                    boxShadow: '0 2px 8px rgba(34, 197, 94, 0.15)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.625rem'
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.transform = 'scale(1.05)';
                    e.target.style.boxShadow = '0 4px 16px rgba(34, 197, 94, 0.4)';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.transform = 'scale(1)';
                    e.target.style.boxShadow = '0 2px 8px rgba(34, 197, 94, 0.15)';
                  }}
                >
                  <ArrowLeft size={20} />
                  New Prediction
                </button>
              </div>
            </nav>
          </header>

          {/* Render Content Based on Route */}
          <Routes>
            <Route path="/" element={<DashboardContent />} />
            <Route path="/weather" element={
              <WeatherVisualizationsDark forecast={predictionData.forecast} />
            } />
            <Route path="/irrigation" element={
              <IrrigationCalculatorDark 
                predictionData={predictionData}
                city={predictionData.location?.city || inputData?.city}
              />
            } />
            <Route path="/matrix" element={
              <CropComparisonMatrixDark 
                predictionData={predictionData}
                city={predictionData.location?.city || inputData?.city}
              />
            } />
            <Route path="/report" element={
              <ReportGeneratorDark 
                predictionData={predictionData}
                city={predictionData.location?.city || inputData?.city}
              />
            } />
          </Routes>
        </div>
      </div>
    </div>
  );
};