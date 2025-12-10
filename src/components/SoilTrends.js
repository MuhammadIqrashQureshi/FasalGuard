import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const SoilTrends = () => {
    const navigate = useNavigate();
    const [selectedDistrict, setSelectedDistrict] = useState('Faisalabad');
    const [parameterAnalysis, setParameterAnalysis] = useState([]);
    
    // District soil data (averages only)
    const districtData = [
        {
            district: 'Sargodha',
            pH: 5.55,
            orgc: 5.275,
            nitrogen: 0.650,
            clay: 36.2,
            ec: 0.80,
            color: '#22c55e',
            image: 'Sargodha.png'
        },
        {
            district: 'Faisalabad',
            pH: 7.76,
            orgc: 2.484,
            nitrogen: 0.569,
            clay: 14.6,
            ec: 2.35,
            color: '#22c55e',
            image: 'Faisalabad.png'
        },
        {
            district: 'Gujrat',
            pH: 7.5,
            orgc: 2.663,
            nitrogen: 0.700,
            clay: 25.6,
            ec: 0.88,
            color: '#22c55e',
            image: 'Gujrat.png'
        },
        {
            district: 'Lahore',
            pH: 7.2,
            orgc: 2.738,
            nitrogen: 0.443,
            clay: 20.6,
            ec: 1.08,
            color: '#22c55e',
            image: 'Lahore.png'
        },
        {
            district: 'Multan',
            pH: 7.4,
            orgc: 4.100,
            nitrogen: 0.450,
            clay: 12.5,
            ec: 0.80,
            color: '#22c55e',
            image: 'Multan.png'
        },
        {
            district: 'Bahawalpur',
            pH: 5.45,
            orgc: 4.100,
            nitrogen: 0.450,
            clay: 13.0,
            ec: 0.70,
            color: '#22c55e',
            image: 'Bahwalpur.png'
        }
    ];

    const districts = [
        'Sargodha', 'Faisalabad', 'Gujrat', 'Lahore', 'Multan', 'Bahawalpur'
    ];

    // Parameter descriptions with matching theme colors
    const parameterInfo = {
        'pH': {
            description: 'Soil Acidity/Alkalinity',
            optimal: '6.0-7.5',
            impact: 'Affects nutrient availability and microbial activity',
            color: '#22c55e',
            unit: 'pH',
            optimalMin: 6.0,
            optimalMax: 7.5
        },
        'orgc': {
            description: 'Organic Carbon',
            optimal: '2.0-5.0%',
            impact: 'Improves soil structure and fertility',
            color: '#22c55e',
            unit: '%',
            optimalMin: 2.0,
            optimalMax: 5.0
        },
        'nitrogen': {
            description: 'Total Nitrogen',
            optimal: '0.4-0.7%',
            impact: 'Essential for plant growth and protein synthesis',
            color: '#22c55e',
            unit: '%',
            optimalMin: 0.4,
            optimalMax: 0.7
        },
        'clay': {
            description: 'Clay Content',
            optimal: '15-35%',
            impact: 'Affects water retention and nutrient holding capacity',
            color: '#22c55e',
            unit: '%',
            optimalMin: 15,
            optimalMax: 35
        },
        'ec': {
            description: 'Salinity (EC)',
            optimal: '0-2.0 dS/m',
            impact: 'High salinity reduces plant water uptake',
            color: '#22c55e',
            unit: 'dS/m',
            optimalMin: 0,
            optimalMax: 2.0
        }
    };

    // Get parameter analysis for selected district
    const getParameterAnalysis = (districtName) => {
        const district = districtData.find(d => d.district === districtName);
        return Object.entries(parameterInfo).map(([key, info]) => {
            const value = district[key];
            let status = 'Optimal';
            let score = 0;
            let effect = '';
            
            // Calculate status based on optimal ranges
            if (key === 'pH') {
                if (value >= 6.0 && value <= 7.5) {
                    status = 'Optimal';
                    effect = 'Ideal for most crops';
                } else if (value < 6.0) {
                    status = 'Acidic';
                    effect = 'May require lime application';
                } else {
                    status = 'Alkaline';
                    effect = 'May limit nutrient availability';
                }
                score = value >= 6.0 && value <= 7.5 ? 95 : value < 6.0 ? 60 : 70;
            } else if (key === 'orgc') {
                if (value >= 2.0 && value <= 5.0) {
                    status = 'Optimal';
                    effect = 'Good soil fertility';
                } else if (value < 2.0) {
                    status = 'Low';
                    effect = 'May need organic amendments';
                } else {
                    status = 'High';
                    effect = 'Excellent soil health';
                }
                score = value >= 2.0 && value <= 5.0 ? 90 : value < 2.0 ? 65 : 95;
            } else if (key === 'nitrogen') {
                if (value >= 0.4 && value <= 0.7) {
                    status = 'Optimal';
                    effect = 'Adequate for crop growth';
                } else if (value < 0.4) {
                    status = 'Low';
                    effect = 'May need nitrogen fertilization';
                } else {
                    status = 'High';
                    effect = 'Risk of environmental loss';
                }
                score = value >= 0.4 && value <= 0.7 ? 92 : value < 0.4 ? 58 : 85;
            } else if (key === 'clay') {
                if (value >= 15 && value <= 35) {
                    status = 'Optimal';
                    effect = 'Good water retention';
                } else if (value < 15) {
                    status = 'Low';
                    effect = 'Poor water holding capacity';
                } else {
                    status = 'High';
                    effect = 'May have drainage issues';
                }
                score = value >= 15 && value <= 35 ? 88 : value < 15 ? 62 : 82;
            } else if (key === 'ec') {
                if (value <= 2.0) {
                    status = 'Optimal';
                    effect = 'No salinity stress';
                } else if (value <= 4.0) {
                    status = 'Moderate';
                    effect = 'Some salt-sensitive crops affected';
                } else {
                    status = 'High';
                    effect = 'Severe salinity stress';
                }
                score = value <= 2.0 ? 96 : value <= 4.0 ? 70 : 45;
            }
            
            return {
                parameter: info.description,
                value: value,
                optimal: info.optimal,
                status: status,
                score: score,
                effect: effect,
                unit: info.unit,
                color: info.color,
                optimalMin: info.optimalMin,
                optimalMax: info.optimalMax,
                key: key
            };
        });
    };

    // Prepare data for selected district
    useEffect(() => {
        const analysis = getParameterAnalysis(selectedDistrict);
        setParameterAnalysis(analysis);
    }, [selectedDistrict]);

    const currentDistrict = districtData.find(d => d.district === selectedDistrict);

    const getStatusColor = (status) => {
        switch(status.toLowerCase()) {
            case 'optimal': return '#22c55e';
            case 'good': return '#22c55e';
            case 'moderate': return '#f59e0b';
            case 'acidic': return '#ef4444';
            case 'alkaline': return '#f59e0b';
            case 'low': return '#f59e0b';
            case 'high': return '#22c55e';
            case 'deficient': return '#ef4444';
            case 'excessive': return '#f59e0b';
            case 'sandy': return '#f59e0b';
            case 'clayey': return '#22c55e';
            default: return '#94a3b8';
        }
    };

    // Get district image path
    const getDistrictImage = () => {
        return `/${currentDistrict.image || 'default.png'}`;
    };

    return (
        <div style={styles.container}>
            {/* Header */}
            <header style={styles.header}>
                <nav style={styles.nav}>
                    <div style={styles.logoContainer}>
                        <span style={styles.logoIcon}>🌱</span>
                        <span style={styles.logoText}>FASALGUARD</span>
                    </div>
                    <button 
                        style={styles.backButton} 
                        onClick={() => navigate('/soil-analysis')}
                    >
                        ← Back to Soil Analysis
                    </button>
                </nav>
            </header>

            <main style={styles.main}>
                {/* Title Section */}
                <div style={styles.titleSection}>
                    <h1 style={styles.pageTitle}>FASAL SOIL TRENDS</h1>
                </div>

                <div style={styles.contentWrapper}>
                    {/* District Selection - Left Sidebar */}
                    <div style={styles.districtSidebar}>
                        <div style={styles.sidebarHeader}>
                            <span style={styles.sidebarTitle}>SELECT DISTRICT</span>
                        </div>
                        <div style={styles.districtList}>
                            {districts.map(district => {
                                const districtInfo = districtData.find(d => d.district === district);
                                return (
                                    <button
                                        key={district}
                                        style={{
                                            ...styles.districtButton,
                                            ...(selectedDistrict === district ? styles.activeDistrictButton : {})
                                        }}
                                        onClick={() => setSelectedDistrict(district)}
                                    >
                                        <span style={styles.districtButtonText}>{district}</span>
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {/* Main Content Area */}
                    <div style={styles.mainContent}>
                        {/* Chart Section - Now displays district image */}
                        <div style={styles.chartSection}>
                            <h2 style={styles.chartTitle}>
                                SOIL PARAMETERS ANALYSIS - {selectedDistrict.toUpperCase()}
                            </h2>
                            <div style={styles.imageContainer}>
                                <img 
                                    src={getDistrictImage()} 
                                    alt={`${selectedDistrict} Soil Analysis`}
                                    style={styles.districtImage}
                                    onError={(e) => {
                                        e.target.onerror = null;
                                        e.target.src = '/default.png';
                                    }}
                                />
                                <div style={styles.imageOverlay}>
                                    <span style={styles.imageLabel}>Soil Parameter Trends for {selectedDistrict}</span>
                                </div>
                            </div>
                        </div>

                        {/* Stats Section */}
                        <div style={styles.statsSection}>
                            <h2 style={styles.sectionTitle}>DETAILED PARAMETER ANALYSIS</h2>
                            <div style={styles.statsGrid}>
                                {parameterAnalysis.map((param, index) => (
                                    <div 
                                        key={index} 
                                        style={styles.statCard}
                                    >
                                        <div style={styles.statHeader}>
                                            <div style={styles.statName}>{param.parameter}</div>
                                            <div style={{
                                                ...styles.statusBadge,
                                                backgroundColor: getStatusColor(param.status) + '20',
                                                color: getStatusColor(param.status)
                                            }}>
                                                {param.status}
                                            </div>
                                        </div>
                                        <div style={styles.statValueContainer}>
                                            <span style={styles.statValue}>{param.value.toFixed(2)}</span>
                                            <span style={styles.statUnit}>{param.unit}</span>
                                        </div>
                                        <div style={styles.optimalRange}>
                                            <span style={styles.optimalLabel}>Optimal Range:</span>
                                            <span style={styles.optimalValue}>{param.optimal}</span>
                                        </div>
                                        <div style={styles.effectContainer}>
                                            <span style={styles.effectLabel}>Effect on Soil Health:</span>
                                            <span style={styles.effectText}>{param.effect}</span>
                                        </div>
                                        <div style={styles.scoreContainer}>
                                            <div style={styles.scoreLabel}>Health Score</div>
                                            <div style={styles.scoreBar}>
                                                <div 
                                                    style={{
                                                        ...styles.scoreFill,
                                                        width: `${param.score}%`,
                                                        backgroundColor: getStatusColor(param.status)
                                                    }}
                                                />
                                            </div>
                                            <div style={styles.scoreValue}>{param.score}/100</div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

const styles = {
    container: {
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 30%, #334155 70%, #475569 100%)',
        fontFamily: '"SF Pro Display", -apple-system, BlinkMacSystemFont, sans-serif',
        color: '#f1f5f9',
        padding: 0,
        margin: 0,
        position: 'relative',
        overflowX: 'hidden'
    },
    header: {
        background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.98) 0%, rgba(30, 41, 59, 0.98) 100%)',
        backdropFilter: 'blur(20px) saturate(180%)',
        borderBottom: '1px solid rgba(34, 197, 94, 0.2)',
        padding: '1.25rem 2rem',
        position: 'sticky',
        top: 0,
        zIndex: 100,
        boxShadow: '0 4px 24px rgba(0, 0, 0, 0.1), 0 1px 0 rgba(34, 197, 94, 0.1) inset'
    },
    nav: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        maxWidth: '100%',
        margin: '0 auto'
    },
    logoContainer: {
        display: 'flex',
        alignItems: 'center',
        gap: '0.75rem'
    },
    logoIcon: {
        fontSize: '2rem',
        color: '#22c55e'
    },
    logoText: {
        fontSize: '1.75rem',
        fontWeight: '800',
        color: '#22c55e',
        letterSpacing: '1px'
    },
    backButton: {
        padding: '0.875rem 1.75rem',
        background: 'rgba(34, 197, 94, 0.12)',
        border: '1px solid rgba(34, 197, 94, 0.3)',
        color: '#22c55e',
        borderRadius: '14px',
        cursor: 'pointer',
        fontSize: '1rem',
        fontWeight: '600',
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        display: 'flex',
        alignItems: 'center',
        gap: '0.625rem',
        boxShadow: '0 2px 8px rgba(34, 197, 94, 0.15)',
        ':hover': {
            background: 'rgba(34, 197, 94, 0.2)',
            boxShadow: '0 4px 16px rgba(34, 197, 94, 0.25)',
            transform: 'translateY(-1px)'
        }
    },
    main: {
        maxWidth: '100%',
        margin: '0 auto',
        padding: '2rem',
        position: 'relative'
    },
    titleSection: {
        marginBottom: '2rem',
        textAlign: 'center',
        width: '100%'
    },
    pageTitle: {
        fontSize: '3rem',
        fontWeight: '300',
        color: '#f1f5f9',
        marginBottom: '0.5rem',
        background: 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)',
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
        backgroundClip: 'text',
        textTransform: 'uppercase'
    },
    contentWrapper: {
        display: 'flex',
        gap: '2rem',
        minHeight: 'calc(100vh - 200px)'
    },
    districtSidebar: {
        width: '220px',
        background: 'rgba(15, 23, 42, 0.95)',
        backdropFilter: 'blur(30px) saturate(150%)',
        borderRadius: '28px',
        padding: '1.5rem',
        border: '1px solid rgba(34, 197, 94, 0.25)',
        height: 'fit-content',
        position: 'sticky',
        top: '8rem',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.3), 0 0 0 1px rgba(34, 197, 94, 0.1) inset'
    },
    sidebarHeader: {
        marginBottom: '1.5rem',
        paddingBottom: '1rem',
        borderBottom: '1px solid rgba(34, 197, 94, 0.2)'
    },
    sidebarTitle: {
        fontSize: '1.125rem',
        fontWeight: '700',
        color: '#22c55e',
        textTransform: 'uppercase',
        letterSpacing: '1px'
    },
    districtList: {
        display: 'flex',
        flexDirection: 'column',
        gap: '0.5rem'
    },
    districtButton: {
        padding: '1rem',
        border: '2px solid transparent',
        borderRadius: '14px',
        cursor: 'pointer',
        fontSize: '1rem',
        fontWeight: '600',
        color: '#e2e8f0',
        background: 'rgba(255, 255, 255, 0.05)',
        backdropFilter: 'blur(10px)',
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        textAlign: 'left',
        display: 'flex',
        alignItems: 'center',
        ':hover': {
            background: 'rgba(34, 197, 94, 0.15)',
            transform: 'translateX(5px)',
            borderColor: 'rgba(34, 197, 94, 0.4)'
        }
    },
    activeDistrictButton: {
        background: 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)',
        transform: 'translateX(10px)',
        color: '#fff',
        borderColor: '#22c55e',
        boxShadow: '0 8px 25px rgba(34, 197, 94, 0.3)'
    },
    districtButtonText: {
        fontSize: '1rem',
        fontWeight: '600'
    },
    mainContent: {
        flex: 1,
        background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.95) 0%, rgba(30, 41, 59, 0.9) 100%)',
        backdropFilter: 'blur(30px) saturate(150%)',
        borderRadius: '28px',
        padding: '3rem',
        border: '1px solid rgba(34, 197, 94, 0.25)',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.3), 0 0 0 1px rgba(34, 197, 94, 0.1) inset'
    },
    chartSection: {
        marginBottom: '2rem'
    },
    chartTitle: {
        fontSize: '1.5rem',
        fontWeight: '600',
        color: '#f1f5f9',
        marginBottom: '1.5rem',
        textTransform: 'uppercase',
        letterSpacing: '1px',
        textAlign: 'center',
        position: 'relative'
    },
    imageContainer: {
        position: 'relative',
        width: '100%',
        height: '70vh',
        borderRadius: '20px',
        overflow: 'hidden',
        border: '2px solid rgba(34, 197, 94, 0.3)',
        boxShadow: '0 20px 40px rgba(0, 0, 0, 0.3)',
        backgroundColor: '#0f172a',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
    },
    districtImage: {
        width: '100%',
        height: '100%',
        objectFit: 'contain', // Changed from 'cover' to 'contain' to show full image
        backgroundColor: '#0f172a',
        padding: '1rem', // Added padding to ensure full visibility
        transform: 'scale(0.9)' // Zoomed out to show entire graph
    },
    imageOverlay: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        background: 'linear-gradient(transparent, rgba(15, 23, 42, 0.9))',
        padding: '1.5rem',
        textAlign: 'center'
    },
    imageLabel: {
        color: '#22c55e',
        fontSize: '1.2rem',
        fontWeight: '600',
        textShadow: '0 2px 4px rgba(0, 0, 0, 0.5)'
    },
    statsSection: {
        marginTop: '2rem'
    },
    sectionTitle: {
        fontSize: '1.75rem',
        fontWeight: '600',
        color: '#f1f5f9',
        marginBottom: '1.5rem',
        textAlign: 'center',
        textTransform: 'uppercase',
        letterSpacing: '1px'
    },
    statsGrid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
        gap: '1.5rem'
    },
    statCard: {
        background: 'rgba(255, 255, 255, 0.05)',
        backdropFilter: 'blur(10px)',
        borderRadius: '20px',
        padding: '1.75rem',
        border: '1px solid rgba(34, 197, 94, 0.15)',
        transition: 'all 0.3s ease',
        ':hover': {
            transform: 'translateY(-5px)',
            borderColor: 'rgba(34, 197, 94, 0.4)',
            boxShadow: '0 15px 35px rgba(34, 197, 94, 0.15)'
        }
    },
    statHeader: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '1rem'
    },
    statName: {
        fontSize: '1.125rem',
        fontWeight: '700',
        color: '#22c55e'
    },
    statusBadge: {
        padding: '0.375rem 0.75rem',
        borderRadius: '9999px',
        fontSize: '0.75rem',
        fontWeight: '700',
        textTransform: 'uppercase',
        letterSpacing: '0.5px'
    },
    statValueContainer: {
        display: 'flex',
        alignItems: 'baseline',
        gap: '0.5rem',
        marginBottom: '1rem'
    },
    statValue: {
        fontSize: '2.5rem',
        fontWeight: '800',
        color: '#22c55e'
    },
    statUnit: {
        fontSize: '1.2rem',
        color: '#94a3b8',
        fontWeight: '600'
    },
    optimalRange: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '1rem',
        padding: '0.5rem 0',
        borderBottom: '1px solid rgba(34, 197, 94, 0.2)'
    },
    optimalLabel: {
        fontSize: '0.875rem',
        color: '#94a3b8',
        fontWeight: '600'
    },
    optimalValue: {
        fontSize: '0.875rem',
        color: '#22c55e',
        fontWeight: '700'
    },
    effectContainer: {
        marginBottom: '1rem',
        minHeight: '3rem'
    },
    effectLabel: {
        fontSize: '0.875rem',
        color: '#94a3b8',
        fontWeight: '600',
        marginBottom: '0.25rem',
        display: 'block'
    },
    effectText: {
        fontSize: '0.875rem',
        color: '#f1f5f9',
        fontWeight: '500',
        lineHeight: '1.4'
    },
    scoreContainer: {
        marginTop: '1rem'
    },
    scoreLabel: {
        fontSize: '0.875rem',
        color: '#94a3b8',
        fontWeight: '600',
        marginBottom: '0.5rem'
    },
    scoreBar: {
        height: '10px',
        backgroundColor: 'rgba(34, 197, 94, 0.2)',
        borderRadius: '5px',
        overflow: 'hidden',
        marginBottom: '0.5rem'
    },
    scoreFill: {
        height: '100%',
        borderRadius: '5px',
        transition: 'width 0.5s ease'
    },
    scoreValue: {
        fontSize: '0.875rem',
        fontWeight: '700',
        color: '#22c55e',
        textAlign: 'right'
    }
};

export default SoilTrends;