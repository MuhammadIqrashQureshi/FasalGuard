import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Leaf, ChevronLeft, CloudRain, Thermometer, AlertTriangle, TrendingDown, TrendingUp, BarChart3, Loader, Droplets, Wind, Sun, Activity } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function PastTrends({ onLogout }) {
  const [selectedCrop, setSelectedCrop] = useState('wheat');
  const [isChartLoading, setIsChartLoading] = useState(false);
  const [loadedCharts, setLoadedCharts] = useState({});
  const [hoveredYear, setHoveredYear] = useState(null);
  const navigate = useNavigate();

  // Crop data with historical yearly data for interactive charts
  const cropData = {
    wheat: {
      name: 'Wheat',
      icon: '🌾',
      gradient: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
      yearlyData: [
        { year: 2013, yield: 2.54, production: 24.2, temp: 23.5, rainfall: 345 },
        { year: 2014, yield: 2.78, production: 26.1, temp: 24.1, rainfall: 298 },
        { year: 2015, yield: 2.91, production: 25.4, temp: 23.8, rainfall: 412 },
        { year: 2016, yield: 3.12, production: 27.5, temp: 24.5, rainfall: 321 },
        { year: 2017, yield: 2.85, production: 26.0, temp: 25.2, rainfall: 276 },
        { year: 2018, yield: 3.24, production: 28.3, temp: 23.2, rainfall: 389 },
        { year: 2019, yield: 3.45, production: 29.1, temp: 23.9, rainfall: 356 },
        { year: 2020, yield: 3.15, production: 27.8, temp: 24.8, rainfall: 298 },
        { year: 2021, yield: 3.38, production: 28.9, temp: 23.4, rainfall: 423 },
        { year: 2022, yield: 3.52, production: 30.2, temp: 24.2, rainfall: 367 },
        { year: 2023, yield: 3.68, production: 31.5, temp: 23.6, rainfall: 392 }
      ],
      yield: {
        mean: 2.98,
        std: 0.58,
        range: '1.54 - 3.94 tons/ha'
      },
      climateInsights: {
        temperature: {
          optimal: '35-50°C',
          impact: 'Higher temperatures (35-50°C) show better yields at 3.04 tons/ha',
          risk: 'Heat stress reduces yield by 3.6%'
        },
        rainfall: {
          optimal: '0-1mm range',
          impact: 'Light rainfall periods yield 3.00 tons/ha vs 2.78 tons/ha in heavy rainfall',
          risk: 'Drought reduces yield by 4.9%'
        },
        keyFactors: [
          'Maximum Temperature (T2M_MAX) - Most critical factor',
          'Heat Stress Days - Significant negative impact',
          'Dry Days - Major concern for yield reduction'
        ]
      },
      period: '2013-2023'
    },
    cotton: {
      name: 'Cotton',
      icon: '🌸',
      gradient: 'linear-gradient(135deg, #ec4899 0%, #db2777 100%)',
      yearlyData: [
        { year: 2013, yield: 2.31, production: 12.8, temp: 27.2, rainfall: 198 },
        { year: 2014, yield: 2.58, production: 14.2, temp: 27.8, rainfall: 245 },
        { year: 2015, yield: 2.95, production: 15.1, temp: 28.1, rainfall: 212 },
        { year: 2016, yield: 3.24, production: 16.5, temp: 27.5, rainfall: 189 },
        { year: 2017, yield: 2.87, production: 15.3, temp: 28.9, rainfall: 156 },
        { year: 2018, yield: 3.45, production: 17.2, temp: 27.3, rainfall: 234 },
        { year: 2019, yield: 3.68, production: 18.1, temp: 27.9, rainfall: 201 },
        { year: 2020, yield: 3.12, production: 16.8, temp: 28.5, rainfall: 178 },
        { year: 2021, yield: 3.52, production: 17.9, temp: 27.6, rainfall: 223 },
        { year: 2022, yield: 3.89, production: 19.4, temp: 28.2, rainfall: 195 },
        { year: 2023, yield: 4.15, production: 20.8, temp: 27.4, rainfall: 218 }
      ],
      yield: {
        mean: 3.12,
        std: 1.04,
        range: '1.31 - 4.60 tons/ha'
      },
      climateInsights: {
        temperature: {
          optimal: '35-50°C',
          impact: 'Warmer temperatures yield 3.16 tons/ha, ideal for cotton growth',
          risk: 'Heat stress reduces yield by 2.5%'
        },
        rainfall: {
          optimal: '0-1mm range',
          impact: 'Dry conditions preferred - 3.16 tons/ha vs 2.73 tons/ha in wet conditions',
          risk: 'Drought reduces yield by 10.2% (Most vulnerable)'
        },
        keyFactors: [
          'Dry Days - Most significant factor affecting yield',
          'Rainfall Patterns - Critical for cotton quality',
          'Temperature Consistency - Important for fiber development'
        ]
      },
      period: '2013-2023'
    },
    sugarcane: {
      name: 'Sugarcane',
      icon: '🎋',
      gradient: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
      yearlyData: [
        { year: 2013, yield: 48.5, production: 63.8, temp: 26.8, rainfall: 876 },
        { year: 2014, yield: 52.3, production: 67.2, temp: 27.2, rainfall: 912 },
        { year: 2015, yield: 55.8, production: 71.5, temp: 26.5, rainfall: 845 },
        { year: 2016, yield: 58.9, production: 74.3, temp: 27.5, rainfall: 923 },
        { year: 2017, yield: 54.2, production: 69.8, temp: 28.1, rainfall: 798 },
        { year: 2018, yield: 61.5, production: 78.2, temp: 26.9, rainfall: 889 },
        { year: 2019, yield: 64.8, production: 82.1, temp: 27.3, rainfall: 934 },
        { year: 2020, yield: 58.7, production: 75.6, temp: 27.8, rainfall: 812 },
        { year: 2021, yield: 63.2, production: 80.5, temp: 26.7, rainfall: 901 },
        { year: 2022, yield: 67.5, production: 85.8, temp: 27.4, rainfall: 867 },
        { year: 2023, yield: 71.2, production: 90.3, temp: 26.8, rainfall: 895 }
      ],
      yield: {
        mean: 57.68,
        std: 9.77,
        range: '40.65 - 77.50 tons/ha'
      },
      climateInsights: {
        temperature: {
          optimal: '35-50°C',
          impact: 'Higher temperatures yield 58.33 tons/ha, showing heat tolerance',
          risk: 'Heat stress reduces yield by 2.2%'
        },
        rainfall: {
          optimal: '0-1mm range',
          impact: 'Moderate dry conditions yield 57.90 tons/ha',
          risk: 'Drought reduces yield by 2.2%'
        },
        keyFactors: [
          'Heat Stress Accumulation - Primary growth factor',
          'Temperature Patterns - Crucial for sugar content',
          'Sunlight Availability - Key for photosynthesis'
        ]
      },
      period: '2013-2023'
    },
    rice: {
      name: 'Rice',
      icon: '🌾',
      gradient: 'linear-gradient(135deg, #eab308 0%, #ca8a04 100%)',
      yearlyData: [
        { year: 2013, yield: 1.74, production: 6.8, temp: 28.2, rainfall: 1245 },
        { year: 2014, yield: 1.82, production: 7.1, temp: 28.5, rainfall: 1312 },
        { year: 2015, yield: 1.89, production: 7.4, temp: 27.9, rainfall: 1189 },
        { year: 2016, yield: 1.96, production: 7.8, temp: 28.8, rainfall: 1267 },
        { year: 2017, yield: 1.85, production: 7.3, temp: 29.2, rainfall: 1098 },
        { year: 2018, yield: 2.02, production: 8.1, temp: 28.1, rainfall: 1334 },
        { year: 2019, yield: 2.11, production: 8.5, temp: 28.6, rainfall: 1289 },
        { year: 2020, yield: 1.93, production: 7.7, temp: 29.0, rainfall: 1156 },
        { year: 2021, yield: 2.08, production: 8.3, temp: 28.3, rainfall: 1301 },
        { year: 2022, yield: 2.18, production: 8.8, temp: 28.7, rainfall: 1245 },
        { year: 2023, yield: 2.26, production: 9.2, temp: 28.4, rainfall: 1278 }
      ],
      yield: {
        mean: 1.96,
        std: 0.21,
        range: '1.54 - 2.55 tons/ha'
      },
      climateInsights: {
        temperature: {
          optimal: '35-50°C',
          impact: 'Consistent yields across all temperature ranges (1.95-1.96 tons/ha)',
          risk: 'Heat stress reduces yield by only 0.4%'
        },
        rainfall: {
          optimal: 'Balanced conditions',
          impact: 'Shows resilience across rainfall variations',
          risk: 'Drought reduces yield by 0.5%'
        },
        keyFactors: [
          'Sunlight Availability - Most important factor',
          'Temperature Stability - Key for consistent yields',
          'Water Management - Critical for paddy fields'
        ]
      },
      period: '2013-2023'
    },
    maize: {
      name: 'Maize',
      icon: '🌽',
      gradient: 'linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)',
      yearlyData: [
        { year: 2013, yield: 4.12, production: 4.8, temp: 24.5, rainfall: 567 },
        { year: 2014, yield: 4.58, production: 5.3, temp: 24.9, rainfall: 612 },
        { year: 2015, yield: 5.02, production: 5.8, temp: 24.2, rainfall: 589 },
        { year: 2016, yield: 5.45, production: 6.3, temp: 25.1, rainfall: 534 },
        { year: 2017, yield: 4.89, production: 5.6, temp: 25.8, rainfall: 498 },
        { year: 2018, yield: 5.78, production: 6.7, temp: 24.3, rainfall: 623 },
        { year: 2019, yield: 6.23, production: 7.2, temp: 24.7, rainfall: 601 },
        { year: 2020, yield: 5.56, production: 6.4, temp: 25.4, rainfall: 545 },
        { year: 2021, yield: 6.12, production: 7.0, temp: 24.5, rainfall: 618 },
        { year: 2022, yield: 6.67, production: 7.7, temp: 24.9, rainfall: 578 },
        { year: 2023, yield: 7.08, production: 8.2, temp: 24.4, rainfall: 595 }
      ],
      yield: {
        mean: 5.77,
        std: 1.55,
        range: '2.59 - 8.40 tons/ha'
      },
      climateInsights: {
        temperature: {
          optimal: '15-25°C',
          impact: 'Moderate temperatures yield 5.78 tons/ha, showing heat sensitivity',
          risk: 'Heat stress reduces yield by 1.0%'
        },
        rainfall: {
          optimal: 'Moderate conditions',
          impact: 'Heavy rainfall (20-100mm) yields 5.82 tons/ha',
          risk: 'Drought reduces yield by 1.8%'
        },
        keyFactors: [
          'Sunlight Duration - Primary growth factor',
          'Heat Stress Management - Important for kernel development',
          'Water Availability - Critical during growth stages'
        ]
      },
      period: '2013-2023'
    }
  };

  const currentCrop = cropData[selectedCrop];

  // Handle crop selection with loading animation
  const handleCropSelect = (cropKey) => {
    if (selectedCrop === cropKey) return;
    
    setSelectedCrop(cropKey);
    setIsChartLoading(true);
    
    // Simulate data loading
    setTimeout(() => {
      setIsChartLoading(false);
      setLoadedCharts(prev => ({
        ...prev,
        [cropKey]: true
      }));
    }, 800);
  };

  // Calculate max values for chart scaling
  const getMaxYield = () => Math.max(...currentCrop.yearlyData.map(d => d.yield));
  const getMaxProduction = () => Math.max(...currentCrop.yearlyData.map(d => d.production));

  // Interactive Chart Component
  const InteractiveChart = ({ data, type = 'yield' }) => {
    const maxValue = type === 'yield' ? getMaxYield() : getMaxProduction();
    const chartHeight = 390;
    
    return (
      <div style={{ 
        width: '100%', 
        height: `${chartHeight}px`,
        position: 'relative',
        padding: '20px 0'
      }}>
        {/* Y-axis labels */}
        <div style={{
          position: 'absolute',
          left: 0,
          top: 20,
          bottom: 40,
          width: '40px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          fontSize: '0.75rem',
          color: '#64748b'
        }}>
          <span>{maxValue.toFixed(1)}</span>
          <span>{(maxValue * 0.75).toFixed(1)}</span>
          <span>{(maxValue * 0.5).toFixed(1)}</span>
          <span>{(maxValue * 0.25).toFixed(1)}</span>
          <span>0</span>
        </div>

        {/* Chart area */}
        <div style={{
          marginLeft: '50px',
          height: '100%',
          display: 'flex',
          alignItems: 'flex-end',
          gap: '8px',
          paddingBottom: '30px'
        }}>
          {data.map((item, index) => {
            const value = type === 'yield' ? item.yield : item.production;
            const heightPercent = (value / maxValue) * 100;
            const isHovered = hoveredYear === item.year;
            
            return (
              <motion.div
                key={item.year}
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: `${heightPercent}%`, opacity: 1 }}
                transition={{ delay: index * 0.05, duration: 0.5 }}
                onMouseEnter={() => setHoveredYear(item.year)}
                onMouseLeave={() => setHoveredYear(null)}
                style={{
                  flex: 1,
                  background: isHovered 
                    ? currentCrop.gradient 
                    : 'linear-gradient(180deg, rgba(34, 197, 94, 0.8) 0%, rgba(22, 163, 74, 0.6) 100%)',
                  borderRadius: '8px 8px 0 0',
                  position: 'relative',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  boxShadow: isHovered ? '0 -4px 20px rgba(34, 197, 94, 0.4)' : 'none',
                  transform: isHovered ? 'scaleY(1.05)' : 'scaleY(1)',
                  transformOrigin: 'bottom'
                }}
              >
                {isHovered && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    style={{
                      position: 'absolute',
                      bottom: '100%',
                      left: '50%',
                      transform: 'translateX(-50%)',
                      background: 'rgba(255, 255, 255, 0.95)',
                      backdropFilter: 'blur(8px)',
                      padding: '0.5rem 0.75rem',
                      borderRadius: '8px',
                      border: '1px solid rgba(34, 197, 94, 0.35)',
                      fontSize: '0.75rem',
                      fontWeight: '600',
                      color: '#1f513c',
                      whiteSpace: 'nowrap',
                      marginBottom: '8px',
                      boxShadow: '0 10px 20px rgba(15, 23, 42, 0.12)'
                    }}
                  >
                    {value.toFixed(2)} {type === 'yield' ? 't/ha' : 'M tons'}
                  </motion.div>
                )}
              </motion.div>
            );
          })}
        </div>

        {/* X-axis labels */}
        <div style={{
          marginLeft: '50px',
          display: 'flex',
          gap: '8px',
          marginTop: '8px'
        }}>
          {data.map((item) => (
            <div
              key={item.year}
              style={{
                flex: 1,
                textAlign: 'center',
                fontSize: '0.7rem',
                color: hoveredYear === item.year ? '#1f513c' : '#64748b',
                fontWeight: hoveredYear === item.year ? '600' : '400',
                transition: 'all 0.3s ease'
              }}
            >
              {item.year}
            </div>
          ))}
        </div>
      </div>
    );
  };

  // Reset loading when component mounts
  useEffect(() => {
    setIsChartLoading(false);
    // Load first crop's data
    setLoadedCharts({ [selectedCrop]: true });
  }, []);

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #f7fbf8 0%, #edf5f0 50%, #f7fbf8 100%)',
      color: '#1f2937',
      position: 'relative',
      overflow: 'hidden'
    }}>
      <style>{`
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }

        body {
          overflow-x: hidden;
        }

        /* Scrollbar Styling */
        ::-webkit-scrollbar {
          width: 12px;
          height: 12px;
        }

        ::-webkit-scrollbar-track {
          background: #e7efe9;
          border-radius: 10px;
        }

        ::-webkit-scrollbar-thumb {
          background: linear-gradient(180deg, #22c55e 0%, #16a34a 100%);
          border-radius: 10px;
          border: 2px solid #e7efe9;
        }

        ::-webkit-scrollbar-thumb:hover {
          background: linear-gradient(180deg, #16a34a 0%, #15803d 100%);
        }

        /* Animations */
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-20px); }
        }

        @keyframes pulse-glow {
          0%, 100% { box-shadow: 0 0 20px rgba(34, 197, 94, 0.3); }
          50% { box-shadow: 0 0 40px rgba(34, 197, 94, 0.6); }
        }

        @keyframes shimmer {
          0% { background-position: -1000px 0; }
          100% { background-position: 1000px 0; }
        }

        .glassmorphism {
          background: rgba(255, 255, 255, 0.86);
          backdrop-filter: blur(16px) saturate(160%);
          border: 1px solid rgba(34, 197, 94, 0.25);
        }

        .glassmorphism-light {
          background: rgba(255, 255, 255, 0.7);
          backdrop-filter: blur(12px) saturate(140%);
          border: 1px solid rgba(34, 197, 94, 0.18);
        }

        .glow-border {
          position: relative;
          overflow: hidden;
        }

        .glow-border::before {
          content: '';
          position: absolute;
          inset: -2px;
          background: linear-gradient(45deg, transparent 30%, rgba(34, 197, 94, 0.5) 50%, transparent 70%);
          background-size: 200% 200%;
          border-radius: inherit;
          opacity: 0;
          transition: opacity 0.3s ease;
          z-index: -1;
        }

        .glow-border:hover::before {
          opacity: 1;
          animation: shimmer 2s linear infinite;
        }

        .crop-button {
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .crop-button:hover {
          transform: translateX(8px) scale(1.02);
        }

        .crop-button-active {
          background: linear-gradient(135deg, rgba(34, 197, 94, 0.2) 0%, rgba(22, 163, 74, 0.3) 100%);
          border-color: #22c55e !important;
          box-shadow: 0 0 30px rgba(34, 197, 94, 0.3), inset 0 0 20px rgba(34, 197, 94, 0.1);
        }

        .stat-card:hover {
          transform: translateY(-5px);
          box-shadow: 0 10px 40px rgba(34, 197, 94, 0.3);
        }

        .insight-card:hover {
          transform: scale(1.02);
          border-color: rgba(34, 197, 94, 0.5);
        }
      `}</style>

      {/* Animated Background Elements */}
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        pointerEvents: 'none',
        overflow: 'hidden',
        zIndex: 0
      }}>
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            style={{
              position: 'absolute',
              width: Math.random() * 300 + 50 + 'px',
              height: Math.random() * 300 + 50 + 'px',
              borderRadius: '50%',
              background: `radial-gradient(circle, rgba(34, 197, 94, ${Math.random() * 0.1}) 0%, transparent 70%)`,
              left: Math.random() * 100 + '%',
              top: Math.random() * 100 + '%',
              animation: `float ${Math.random() * 10 + 10}s ease-in-out infinite`,
              animationDelay: `${Math.random() * 5}s`
            }}
          />
        ))}
      </div>

      {/* Header */}
      <motion.header
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6 }}
        style={{
          position: 'sticky',
          top: 0,
          left: 0,
          right: 0,
          zIndex: 100,
          padding: '1.5rem 3rem',
          background: 'rgba(255, 255, 255, 0.9)',
          backdropFilter: 'blur(16px)',
          borderBottom: '1px solid rgba(34, 197, 94, 0.2)',
          boxShadow: '0 8px 24px rgba(15, 23, 42, 0.08)'
        }}
      >
        <div style={{
          maxWidth: '1400px',
          margin: '0 auto',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <button
            onClick={() => navigate('/home')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '1rem',
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              padding: 0
            }}
          >
            <div style={{
              background: 'linear-gradient(135deg, rgba(34, 197, 94, 0.18) 0%, rgba(22, 163, 74, 0.1) 100%)',
              padding: '0.75rem',
              borderRadius: '50%',
              border: '2px solid rgba(34, 197, 94, 0.25)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <Leaf size={32} color="#22c55e" />
            </div>
            <div>
              <h1 style={{
                fontSize: '1.5rem',
                fontWeight: '700',
                color: '#1f513c',
                letterSpacing: '2px',
                margin: 0
              }}>
                FASALGUARD
              </h1>
              <p style={{
                fontSize: '0.75rem',
                color: '#6b7280',
                letterSpacing: '3px',
                textTransform: 'uppercase',
                margin: 0
              }}>
                Past Climate Trends
              </p>
            </div>
          </button>

          <nav style={{ display: 'flex', gap: '2rem', alignItems: 'center' }}>
            <button
              onClick={() => navigate('/crop-prediction')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                background: 'rgba(34, 197, 94, 0.12)',
                border: '1px solid rgba(34, 197, 94, 0.3)',
                color: '#1f513c',
                padding: '0.75rem 1.5rem',
                borderRadius: '12px',
                cursor: 'pointer',
                fontSize: '0.9rem',
                fontWeight: '600',
                transition: 'all 0.3s ease'
              }}
              onMouseEnter={(e) => {
                e.target.style.background = 'rgba(34, 197, 94, 0.18)';
                e.target.style.transform = 'translateY(-2px)';
              }}
              onMouseLeave={(e) => {
                e.target.style.background = 'rgba(34, 197, 94, 0.12)';
                e.target.style.transform = 'translateY(0)';
              }}
            >
              <ChevronLeft size={18} />
              Back to Predictions
            </button>
          </nav>
        </div>
      </motion.header>

      {/* Main Content */}
      <div style={{
        maxWidth: '1400px',
        margin: '0 auto',
        padding: '3rem 2rem',
        position: 'relative',
        zIndex: 1
      }}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          style={{ textAlign: 'center', marginBottom: '3rem' }}
        >
          <h2 style={{
            fontSize: '2.5rem',
            fontWeight: '700',
            background: 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            marginBottom: '0.5rem'
          }}>
            Historical Crop Analysis
          </h2>
          <p style={{
            fontSize: '1.1rem',
            color: '#64748b',
            fontWeight: '500'
          }}>
            Comprehensive climate impact data from 2013-2023
          </p>
        </motion.div>

        {/* Content Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '350px 1fr',
          gap: '2rem',
          alignItems: 'start'
        }}>
          {/* Left Sidebar - Crop Selection */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
          >
            <div className="glassmorphism glow-border" style={{
              padding: '2rem',
              borderRadius: '20px',
              position: 'sticky',
              top: '120px'
            }}>
              <h3 style={{
                color: '#22c55e',
                fontSize: '1.3rem',
                fontWeight: '700',
                marginBottom: '1.5rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}>
                <Activity size={24} />
                Select Crop
              </h3>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {Object.keys(cropData).map((cropKey, index) => (
                  <motion.button
                    key={cropKey}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.4 + index * 0.05 }}
                    onClick={() => handleCropSelect(cropKey)}
                    className={`crop-button ${selectedCrop === cropKey ? 'crop-button-active' : ''}`}
                    style={{
                      background: selectedCrop === cropKey
                        ? 'linear-gradient(135deg, rgba(34, 197, 94, 0.2) 0%, rgba(22, 163, 74, 0.3) 100%)'
                        : '#ffffff',
                      border: selectedCrop === cropKey
                        ? '2px solid #22c55e'
                        : '1px solid rgba(71, 85, 105, 0.5)',
                      color: selectedCrop === cropKey ? '#1f513c' : '#334155',
                      padding: '1rem 1.25rem',
                      borderRadius: '12px',
                      cursor: 'pointer',
                      fontSize: '1rem',
                      fontWeight: '600',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.75rem',
                      width: '100%',
                      textAlign: 'left',
                      backdropFilter: 'blur(10px)'
                    }}
                  >
                    <span style={{ fontSize: '1.5rem' }}>{cropData[cropKey].icon}</span>
                    {cropData[cropKey].name}
                  </motion.button>
                ))}
              </div>
            </div>
          </motion.div>

          {/* Right Content - Charts & Analysis */}
          <div>
            <AnimatePresence mode="wait">
              <motion.div
                key={selectedCrop}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
              >
                {/* Yield Stats Overview */}
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(3, 1fr)',
                  gap: '1.5rem',
                  marginBottom: '2rem'
                }}>
                  {[
                    { label: 'Average Yield', value: currentCrop.yield.mean, unit: 't/ha', icon: <BarChart3 size={20} /> },
                    { label: 'Std Deviation', value: `±${currentCrop.yield.std}`, unit: 't/ha', icon: <Activity size={20} /> },
                    { label: 'Data Period', value: currentCrop.period.split('-')[1], unit: 'years', icon: <Sun size={20} /> }
                  ].map((stat, index) => (
                    <motion.div
                      key={stat.label}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.1 * index }}
                      className="glassmorphism-light stat-card"
                      style={{
                        padding: '1.5rem',
                        borderRadius: '16px',
                        textAlign: 'center',
                        transition: 'all 0.3s ease'
                      }}
                    >
                      <div style={{
                        color: '#22c55e',
                        marginBottom: '0.75rem',
                        display: 'flex',
                        justifyContent: 'center'
                      }}>
                        {stat.icon}
                      </div>
                      <div style={{
                        fontSize: '1.75rem',
                        fontWeight: '700',
                        color: '#22c55e',
                        marginBottom: '0.25rem'
                      }}>
                        {stat.value}
                      </div>
                      <div style={{
                        fontSize: '0.75rem',
                        color: '#64748b',
                        textTransform: 'uppercase',
                        letterSpacing: '1px'
                      }}>
                        {stat.label}
                      </div>
                      <div style={{
                        fontSize: '0.7rem',
                        color: '#64748b',
                        marginTop: '0.25rem'
                      }}>
                        {stat.unit}
                      </div>
                    </motion.div>
                  ))}
                </div>

                {/* Interactive Yield Chart */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="glassmorphism glow-border"
                  style={{
                    padding: '2rem',
                    borderRadius: '20px',
                    marginBottom: '2rem'
                  }}
                >
                  <h3 style={{
                    color: '#22c55e',
                    fontSize: '1.3rem',
                    fontWeight: '700',
                    marginBottom: '1.5rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem'
                  }}>
                    <TrendingUp size={24} />
                    Yield Trends (2013-2023)
                  </h3>
                  
                  {isChartLoading ? (
                    <div style={{
                      height: '300px',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '1rem'
                    }}>
                      <Loader size={48} color="#22c55e" style={{
                        animation: 'spin 1s linear infinite'
                      }} />
                      <p style={{ color: '#64748b', fontSize: '1rem' }}>
                        Loading {currentCrop.name} data...
                      </p>
                    </div>
                  ) : (
                    <InteractiveChart data={currentCrop.yearlyData} type="yield" />
                  )}
                </motion.div>

                {/* Interactive Production Chart */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="glassmorphism glow-border"
                  style={{
                    padding: '2rem',
                    borderRadius: '20px',
                    marginBottom: '2rem'
                  }}
                >
                  <h3 style={{
                    color: '#22c55e',
                    fontSize: '1.3rem',
                    fontWeight: '700',
                    marginBottom: '1.5rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem'
                  }}>
                    <BarChart3 size={24} />
                    Production Trends (Million Tons)
                  </h3>
                  
                  {isChartLoading ? (
                    <div style={{
                      height: '300px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}>
                      <Loader size={48} color="#22c55e" style={{
                        animation: 'spin 1s linear infinite'
                      }} />
                    </div>
                  ) : (
                    <InteractiveChart data={currentCrop.yearlyData} type="production" />
                  )}
                </motion.div>

                {/* Climate Impact Cards */}
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(2, 1fr)',
                  gap: '1.5rem',
                  marginBottom: '2rem'
                }}>
                  {/* Temperature Impact */}
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.4 }}
                    className="glassmorphism-light insight-card"
                    style={{
                      padding: '1.5rem',
                      borderRadius: '16px',
                      transition: 'all 0.3s ease'
                    }}
                  >
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.75rem',
                      marginBottom: '1rem',
                      color: '#22c55e'
                    }}>
                      <Thermometer size={22} />
                      <h4 style={{ fontSize: '1.1rem', fontWeight: '600', margin: 0 }}>
                        Temperature Impact
                      </h4>
                    </div>
                    <p style={{
                      color: '#475569',
                      fontSize: '0.9rem',
                      lineHeight: '1.6',
                      marginBottom: '0.75rem'
                    }}>
                      <span style={{ color: '#22c55e', fontWeight: '600' }}>
                        Optimal: {currentCrop.climateInsights.temperature.optimal}
                      </span>
                    </p>
                    <p style={{
                      color: '#64748b',
                      fontSize: '0.85rem',
                      lineHeight: '1.5'
                    }}>
                      {currentCrop.climateInsights.temperature.impact}
                    </p>
                    <div style={{
                      marginTop: '1rem',
                      padding: '0.75rem',
                      background: 'rgba(239, 68, 68, 0.1)',
                      border: '1px solid rgba(239, 68, 68, 0.3)',
                      borderRadius: '8px'
                    }}>
                      <p style={{
                        color: '#fca5a5',
                        fontSize: '0.8rem',
                        margin: 0,
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem'
                      }}>
                        <AlertTriangle size={16} />
                        {currentCrop.climateInsights.temperature.risk}
                      </p>
                    </div>
                  </motion.div>

                  {/* Rainfall Impact */}
                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.5 }}
                    className="glassmorphism-light insight-card"
                    style={{
                      padding: '1.5rem',
                      borderRadius: '16px',
                      transition: 'all 0.3s ease'
                    }}
                  >
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.75rem',
                      marginBottom: '1rem',
                      color: '#22c55e'
                    }}>
                      <CloudRain size={22} />
                      <h4 style={{ fontSize: '1.1rem', fontWeight: '600', margin: 0 }}>
                        Rainfall Impact
                      </h4>
                    </div>
                    <p style={{
                      color: '#475569',
                      fontSize: '0.9rem',
                      lineHeight: '1.6',
                      marginBottom: '0.75rem'
                    }}>
                      <span style={{ color: '#22c55e', fontWeight: '600' }}>
                        Optimal: {currentCrop.climateInsights.rainfall.optimal}
                      </span>
                    </p>
                    <p style={{
                      color: '#64748b',
                      fontSize: '0.85rem',
                      lineHeight: '1.5'
                    }}>
                      {currentCrop.climateInsights.rainfall.impact}
                    </p>
                    <div style={{
                      marginTop: '1rem',
                      padding: '0.75rem',
                      background: 'rgba(239, 68, 68, 0.1)',
                      border: '1px solid rgba(239, 68, 68, 0.3)',
                      borderRadius: '8px'
                    }}>
                      <p style={{
                        color: '#fca5a5',
                        fontSize: '0.8rem',
                        margin: 0,
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem'
                      }}>
                        <Droplets size={16} />
                        {currentCrop.climateInsights.rainfall.risk}
                      </p>
                    </div>
                  </motion.div>
                </div>

                {/* Key Factors */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6 }}
                  className="glassmorphism glow-border"
                  style={{
                    padding: '2rem',
                    borderRadius: '20px',
                    marginBottom: '2rem'
                  }}
                >
                  <h3 style={{
                    color: '#22c55e',
                    fontSize: '1.3rem',
                    fontWeight: '700',
                    marginBottom: '1.5rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem'
                  }}>
                    <TrendingDown size={24} />
                    Key Climate Factors
                  </h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    {currentCrop.climateInsights.keyFactors.map((factor, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.7 + index * 0.1 }}
                        style={{
                          padding: '1rem 1.25rem',
                          background: '#ffffff',
                          border: '1px solid rgba(34, 197, 94, 0.2)',
                          borderRadius: '12px',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '1rem',
                          transition: 'all 0.3s ease'
                        }}
                        whileHover={{
                          x: 5,
                          borderColor: 'rgba(34, 197, 94, 0.5)'
                        }}
                      >
                        <div style={{
                          width: '8px',
                          height: '8px',
                          borderRadius: '50%',
                          background: currentCrop.gradient,
                          flexShrink: 0
                        }} />
                        <p style={{
                          color: '#475569',
                          fontSize: '0.95rem',
                          margin: 0,
                          lineHeight: '1.5'
                        }}>
                          {factor}
                        </p>
                      </motion.div>
                    ))}
                  </div>
                </motion.div>

                {/* Recommendations */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.8 }}
                  className="glassmorphism"
                  style={{
                    padding: '2rem',
                    borderRadius: '20px',
                    background: 'linear-gradient(135deg, rgba(34, 197, 94, 0.1) 0%, rgba(22, 163, 74, 0.05) 100%)',
                    border: '1px solid rgba(34, 197, 94, 0.3)'
                  }}
                >
                  <h3 style={{
                    color: '#22c55e',
                    fontSize: '1.3rem',
                    fontWeight: '700',
                    marginBottom: '1rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem'
                  }}>
                    💡 Recommendations for {currentCrop.name}
                  </h3>
                  <p style={{
                    color: '#475569',
                    fontSize: '1rem',
                    lineHeight: '1.7',
                    marginBottom: '1rem'
                  }}>
                    Based on {currentCrop.period} historical data, optimize your {currentCrop.name.toLowerCase()} cultivation 
                    by focusing on the optimal temperature range of <strong style={{ color: '#22c55e' }}>
                    {currentCrop.climateInsights.temperature.optimal}</strong> and maintaining appropriate moisture levels.
                  </p>
                  <p style={{
                    color: '#64748b',
                    fontSize: '0.95rem',
                    lineHeight: '1.6',
                    margin: 0
                  }}>
                    Monitor climate factors closely and implement adaptive strategies to mitigate risks from heat stress 
                    and drought conditions. Historical trends show consistent yield improvements with proper climate management.
                  </p>
                </motion.div>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
}