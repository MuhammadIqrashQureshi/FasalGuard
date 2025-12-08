import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Leaf, ChevronLeft, CloudRain, Thermometer, AlertTriangle, TrendingDown, TrendingUp, Map, BarChart3 } from 'lucide-react';

export default function PastTrends({ onLogout }) {
  const [selectedCrop, setSelectedCrop] = useState('wheat');
  const navigate = useNavigate();

  // Crop data with all figures from your directory
  const cropData = {
    wheat: {
      name: 'Wheat',
      image: '/wheat.jpeg',
      climateFigure: '/analysis_figures/wheat_climate_impact.png',
      climateDetailedFigure: '/analysis_figures/wheat_climate_impact_detailed.png',
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
      image: '/cotton.jpg',
      climateFigure: '/analysis_figures/cotton_climate_impact.png',
      climateDetailedFigure: '/analysis_figures/cotton_climate_impact_detailed.png',
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
      image: '/sugarcane.jpeg',
      climateFigure: '/analysis_figures/sugarcane_climate_impact.png',
      climateDetailedFigure: '/analysis_figures/sugarcane_climate_impact_detailed.png',
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
      image: '/rice.jpeg',
      climateFigure: '/analysis_figures/rice_climate_impact.png',
      climateDetailedFigure: '/analysis_figures/rice_climate_impact_detailed.png',
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
      image: '/maize.jpeg',
      climateFigure: '/analysis_figures/maize_climate_impact.png',
      climateDetailedFigure: '/analysis_figures/maize_climate_impact_detailed.png',
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

  // General figures that apply to all crops
  const generalFigures = {
    yearlyProduction: '../crop_analysis_models/1_yearly_production_by_city.png',
    yearlyYield: '../crop_analysis_models/2_yearly_yield_by_city.png',
    bestCrops: '../crop_analysis_models/3_best_crops_by_city.png',
    climateImpact: '../crop_analysis_models/4_climate_impact_on_crops.png'
  };

  const styles = {
    page: {
      minHeight: '100vh',
      fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif',
      color: '#fff',
      padding: 0,
      margin: 0,
      position: 'relative',
      overflowX: 'hidden',
      background: 'linear-gradient(135deg, rgba(10,40,20,0.9) 0%, rgba(20,50,30,0.95) 100%)',
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
      background: 'rgba(5, 25, 15, 0.8)',
      backdropFilter: 'blur(10px)',
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
      transition: 'color 0.3s',
      cursor: 'pointer',
      fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif',
      background: 'transparent',
      border: 'none',
      outline: 'none',
      padding: 0,
    },
    backButton: {
      background: 'transparent',
      color: '#bbf7d0',
      border: '1px solid rgba(187,247,208,0.3)',
      borderRadius: '0',
      padding: '0.7rem 1.5rem',
      fontSize: '0.7rem',
      fontWeight: 400,
      cursor: 'pointer',
      letterSpacing: '2px',
      textTransform: 'uppercase',
      transition: 'all 0.3s',
      display: 'flex',
      alignItems: 'center',
      gap: '0.5rem',
      marginBottom: '2rem',
    },
    container: {
      maxWidth: '1400px',
      margin: '0 auto',
      padding: '8rem 2rem 4rem 2rem',
    },
    pageTitle: {
      fontSize: '3rem',
      fontWeight: 300,
      color: '#bbf7d0',
      textAlign: 'center',
      marginBottom: '1rem',
      letterSpacing: '4px',
      textTransform: 'uppercase',
    },
    pageSubtitle: {
      fontSize: '1.1rem',
      color: '#d1fae5',
      textAlign: 'center',
      marginBottom: '3rem',
      fontWeight: 300,
    },
    contentGrid: {
      display: 'grid',
      gridTemplateColumns: '1fr 2fr',
      gap: '3rem',
      alignItems: 'start',
    },
    cropSelector: {
      background: 'rgba(255,255,255,0.05)',
      borderRadius: '1rem',
      padding: '2rem',
      border: '1px solid rgba(187,247,208,0.1)',
    },
    cropOption: {
      background: 'transparent',
      border: '1px solid rgba(187,247,208,0.2)',
      color: '#fff',
      padding: '1rem 1.5rem',
      marginBottom: '1rem',
      width: '100%',
      textAlign: 'left',
      cursor: 'pointer',
      transition: 'all 0.3s',
      fontSize: '1rem',
      borderRadius: '0.5rem',
    },
    cropOptionActive: {
      background: 'linear-gradient(90deg, rgba(16,185,129,0.2) 0%, rgba(187,247,208,0.1) 100%)',
      border: '1px solid rgba(16,185,129,0.5)',
      color: '#bbf7d0',
    },
    cropImageContainer: {
      width: '100%',
      minHeight: '250px',
      borderRadius: '12px',
      marginBottom: '1.5rem',
      border: '2px solid rgba(187,247,208,0.3)',
      background: 'rgba(255,255,255,0.05)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      overflow: 'hidden',
    },
    cropImage: {
      width: '100%',
      height: '100%',
      objectFit: 'cover',
      minHeight: '250px',
    },
    analysisCard: {
      background: 'rgba(255,255,255,0.05)',
      borderRadius: '1rem',
      padding: '2.5rem',
      border: '1px solid rgba(187,247,208,0.1)',
      marginBottom: '2rem',
    },
    cardTitle: {
      fontSize: '1.5rem',
      fontWeight: 600,
      color: '#bbf7d0',
      marginBottom: '1.5rem',
      display: 'flex',
      alignItems: 'center',
      gap: '0.5rem',
    },
    yieldCard: {
      background: 'linear-gradient(135deg, rgba(16,185,129,0.1) 0%, rgba(187,247,208,0.05) 100%)',
      border: '1px solid rgba(16,185,129,0.2)',
    },
    yieldStats: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
      gap: '1.5rem',
      marginBottom: '2rem',
    },
    statItem: {
      textAlign: 'center',
      padding: '1.5rem',
      background: 'rgba(255,255,255,0.03)',
      borderRadius: '0.75rem',
      border: '1px solid rgba(187,247,208,0.1)',
    },
    statValue: {
      fontSize: '2rem',
      fontWeight: 300,
      color: '#10b981',
      marginBottom: '0.5rem',
    },
    statLabel: {
      fontSize: '0.9rem',
      color: '#d1fae5',
      textTransform: 'uppercase',
      letterSpacing: '1px',
    },
    insightGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
      gap: '1.5rem',
      marginBottom: '2rem',
    },
    insightCard: {
      background: 'rgba(255,255,255,0.03)',
      borderRadius: '0.75rem',
      padding: '1.5rem',
      border: '1px solid rgba(187,247,208,0.1)',
    },
    insightHeader: {
      display: 'flex',
      alignItems: 'center',
      gap: '0.5rem',
      marginBottom: '1rem',
      color: '#bbf7d0',
    },
    insightText: {
      color: '#e5e7eb',
      lineHeight: '1.6',
      marginBottom: '0.5rem',
    },
    positiveText: {
      color: '#10b981',
      fontWeight: 500,
    },
    negativeText: {
      color: '#ef4444',
      fontWeight: 500,
    },
    factorsList: {
      listStyle: 'none',
      padding: 0,
    },
    factorItem: {
      padding: '0.75rem 0',
      borderBottom: '1px solid rgba(187,247,208,0.1)',
      color: '#e5e7eb',
      display: 'flex',
      alignItems: 'center',
      gap: '0.5rem',
    },
    // New styles for figures
    figureCard: {
      background: 'rgba(255,255,255,0.05)',
      borderRadius: '1rem',
      padding: '1.5rem',
      border: '1px solid rgba(187,247,208,0.1)',
      marginBottom: '1.5rem',
    },
    figureTitle: {
      fontSize: '1.2rem',
      fontWeight: 600,
      color: '#bbf7d0',
      marginBottom: '1rem',
      display: 'flex',
      alignItems: 'center',
      gap: '0.5rem',
    },
    figureImage: {
      width: '100%',
      borderRadius: '8px',
      border: '1px solid rgba(187,247,208,0.2)',
      marginBottom: '1rem',
    },
    figuresGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
      gap: '1.5rem',
      marginBottom: '2rem',
    }
  };

  return (
    <div style={styles.page}>
      <style>{`
        body {
          margin: 0;
          padding: 0;
          overflow-x: hidden;
          background: #000;
        }
        .cropOption:hover {
          background: rgba(187,247,208,0.1);
          border-color: rgba(187,247,208,0.3);
        }
        .backButton:hover {
          background: rgba(187,247,208,0.1);
          transform: translateX(-5px);
        }
        .figureCard:hover {
          border-color: rgba(187,247,208,0.3);
          transform: translateY(-2px);
        }
      `}</style>

      <header style={styles.header}>
        <div style={styles.logoSection}>
          <span style={styles.logo}><Leaf size={32} color="#bbf7d0" /></span>
          <div style={styles.brandText}>
            <h1 style={styles.title}>FASALGUARD</h1>
            <div style={styles.subtitle}>Past Climate Trends</div>
          </div>
        </div>
        <nav style={styles.nav}>
          <button style={styles.navLink} onClick={() => navigate('/home')}>Home</button>
          <button style={styles.navLink} onClick={() => navigate('/about')}>About</button>
          <button style={styles.navLink} onClick={() => navigate('/contact')}>Contact</button>
        </nav>
      </header>

      <div style={styles.container}>
        <button 
          style={styles.backButton}
          onClick={() => navigate('/home')}
          className="backButton"
        >
          <ChevronLeft size={16} />
          Back to Home
        </button>

        <h2 style={styles.pageTitle}>Crop Climate Trends Analysis</h2>
        <p style={styles.pageSubtitle}>
          Historical climate impact analysis on major crops (2013-2023)
        </p>

        <div style={styles.contentGrid}>
          {/* Left Side - Crop Selection & Image */}
          <div>
            <div style={styles.cropSelector}>
              <h3 style={{color: '#bbf7d0', marginBottom: '1.5rem'}}>Select Crop</h3>
              {Object.keys(cropData).map(cropKey => (
                <button
                  key={cropKey}
                  style={{
                    ...styles.cropOption,
                    ...(selectedCrop === cropKey ? styles.cropOptionActive : {})
                  }}
                  onClick={() => setSelectedCrop(cropKey)}
                  className="cropOption"
                >
                  {cropData[cropKey].name}
                </button>
              ))}
            </div>
            
            <div style={styles.cropImageContainer}>
              <img 
                src={currentCrop.image} 
                alt={currentCrop.name}
                style={styles.cropImage}
                onError={(e) => {
                  e.target.style.display = 'none';
                  const placeholder = document.createElement('div');
                  placeholder.style.cssText = `
                    width: 100%; 
                    height: 250px; 
                    background: linear-gradient(135deg, rgba(16,185,129,0.1) 0%, rgba(187,247,208,0.05) 100%);
                    display: flex; 
                    align-items: center; 
                    justify-content: center; 
                    color: #bbf7d0; 
                    font-size: 1.2rem; 
                    border-radius: 12px;
                  `;
                  placeholder.textContent = `${currentCrop.name} Image`;
                  e.target.parentElement.appendChild(placeholder);
                }}
              />
            </div>
            
            <div style={{...styles.analysisCard, ...styles.yieldCard}}>
              <h3 style={styles.cardTitle}>📊 Yield Overview</h3>
              <div style={styles.yieldStats}>
                <div style={styles.statItem}>
                  <div style={styles.statValue}>{currentCrop.yield.mean}</div>
                  <div style={styles.statLabel}>Average Yield (tons/ha)</div>
                </div>
                <div style={styles.statItem}>
                  <div style={styles.statValue}>±{currentCrop.yield.std}</div>
                  <div style={styles.statLabel}>Standard Deviation</div>
                </div>
                <div style={styles.statItem}>
                  <div style={styles.statValue}>{currentCrop.yield.range}</div>
                  <div style={styles.statLabel}>Yield Range</div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Side - Climate Insights & Figures */}
          <div>
            {/* Crop-Specific Climate Figures */}
            <div style={styles.figuresGrid}>
              <div style={styles.figureCard} className="figureCard">
                <h3 style={styles.figureTitle}>
                  <Thermometer size={20} />
                  Climate Impact on {currentCrop.name}
                </h3>
                <img 
                  src={currentCrop.climateFigure} 
                  alt={`${currentCrop.name} climate impact`}
                  style={styles.figureImage}
                  onError={(e) => {
                    e.target.style.display = 'none';
                    const placeholder = document.createElement('div');
                    placeholder.style.cssText = `
                      width: 100%; 
                      height: 200px; 
                      background: linear-gradient(135deg, rgba(16,185,129,0.1) 0%, rgba(187,247,208,0.05) 100%);
                      display: flex; 
                      align-items: center; 
                      justify-content: center; 
                      color: #bbf7d0; 
                      font-size: 1rem; 
                      border-radius: 8px;
                    `;
                    placeholder.textContent = `Climate Impact Chart for ${currentCrop.name}`;
                    e.target.parentElement.appendChild(placeholder);
                  }}
                />
                <p style={styles.insightText}>
                  How temperature and rainfall patterns affect {currentCrop.name.toLowerCase()} yields over time.
                </p>
              </div>

              <div style={styles.figureCard} className="figureCard">
                <h3 style={styles.figureTitle}>
                  <BarChart3 size={20} />
                  Detailed Climate Analysis
                </h3>
                <img 
                  src={currentCrop.climateDetailedFigure} 
                  alt={`${currentCrop.name} detailed climate analysis`}
                  style={styles.figureImage}
                  onError={(e) => {
                    e.target.style.display = 'none';
                    const placeholder = document.createElement('div');
                    placeholder.style.cssText = `
                      width: 100%; 
                      height: 200px; 
                      background: linear-gradient(135deg, rgba(16,185,129,0.1) 0%, rgba(187,247,208,0.05) 100%);
                      display: flex; 
                      align-items: center; 
                      justify-content: center; 
                      color: #bbf7d0; 
                      font-size: 1rem; 
                      border-radius: 8px;
                    `;
                    placeholder.textContent = `Detailed Analysis for ${currentCrop.name}`;
                    e.target.parentElement.appendChild(placeholder);
                  }}
                />
                <p style={styles.insightText}>
                  In-depth analysis of climate factors and their impact on {currentCrop.name.toLowerCase()} productivity.
                </p>
              </div>
            </div>

            {/* General Figures */}
            <div style={styles.figureCard}>
              <h3 style={styles.figureTitle}>
                <Map size={20} />
                Regional Yield Comparison
              </h3>
              <img 
                src={generalFigures.yearlyYield} 
                alt="Yearly yield by city"
                style={styles.figureImage}
                onError={(e) => {
                  e.target.style.display = 'none';
                  const placeholder = document.createElement('div');
                  placeholder.style.cssText = `
                    width: 100%; 
                    height: 200px; 
                    background: linear-gradient(135deg, rgba(16,185,129,0.1) 0%, rgba(187,247,208,0.05) 100%);
                    display: flex; 
                    align-items: center; 
                    justify-content: center; 
                    color: #bbf7d0; 
                    font-size: 1rem; 
                    border-radius: 8px;
                  `;
                  placeholder.textContent = 'Regional Yield Comparison Chart';
                  e.target.parentElement.appendChild(placeholder);
                }}
              />
              <p style={styles.insightText}>
                Compare {currentCrop.name.toLowerCase()} yields across different cities in Punjab to identify best growing regions.
              </p>
            </div>

            {/* Existing Analysis Cards */}
            <div style={styles.analysisCard}>
              <h3 style={styles.cardTitle}>
                <Thermometer size={24} />
                Temperature Impact Analysis
              </h3>
              <div style={styles.insightGrid}>
                <div style={styles.insightCard}>
                  <div style={styles.insightHeader}>
                    <TrendingUp size={20} />
                    <strong>Optimal Range</strong>
                  </div>
                  <p style={styles.insightText}>
                    <span style={styles.positiveText}>{currentCrop.climateInsights.temperature.optimal}</span>
                  </p>
                  <p style={styles.insightText}>
                    {currentCrop.climateInsights.temperature.impact}
                  </p>
                </div>
                <div style={styles.insightCard}>
                  <div style={styles.insightHeader}>
                    <AlertTriangle size={20} />
                    <strong>Climate Risks</strong>
                  </div>
                  <p style={styles.insightText}>
                    <span style={styles.negativeText}>{currentCrop.climateInsights.temperature.risk}</span>
                  </p>
                </div>
              </div>
            </div>

            <div style={styles.analysisCard}>
              <h3 style={styles.cardTitle}>
                <CloudRain size={24} />
                Rainfall Impact Analysis
              </h3>
              <div style={styles.insightGrid}>
                <div style={styles.insightCard}>
                  <div style={styles.insightHeader}>
                    <TrendingUp size={20} />
                    <strong>Optimal Conditions</strong>
                  </div>
                  <p style={styles.insightText}>
                    <span style={styles.positiveText}>{currentCrop.climateInsights.rainfall.optimal}</span>
                  </p>
                  <p style={styles.insightText}>
                    {currentCrop.climateInsights.rainfall.impact}
                  </p>
                </div>
                <div style={styles.insightCard}>
                  <div style={styles.insightHeader}>
                    <TrendingDown size={20} />
                    <strong>Water Stress Impact</strong>
                  </div>
                  <p style={styles.insightText}>
                    <span style={styles.negativeText}>{currentCrop.climateInsights.rainfall.risk}</span>
                  </p>
                </div>
              </div>
            </div>

            <div style={styles.analysisCard}>
              <h3 style={styles.cardTitle}>🔑 Key Climate Factors</h3>
              <ul style={styles.factorsList}>
                {currentCrop.climateInsights.keyFactors.map((factor, index) => (
                  <li key={index} style={styles.factorItem}>
                    <span style={{color: '#10b981'}}>•</span> {factor}
                  </li>
                ))}
              </ul>
            </div>

            <div style={{...styles.analysisCard, background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.3)'}}>
              <h3 style={{...styles.cardTitle, color: '#bbf7d0'}}>💡 Farmer Recommendations</h3>
              <p style={styles.insightText}>
                Based on {currentCrop.period} data analysis, focus on managing {currentCrop.name.toLowerCase()} cultivation during optimal temperature and rainfall periods to maximize yields.
              </p>
              <p style={styles.insightText}>
                Monitor heat stress and drought conditions closely, as these are the primary climate risks affecting your crop productivity.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}