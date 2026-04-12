// ServicesData.js
export const servicesData = [
  {
    id: 1,
    title: 'Weather Predictions',
    subtitle: 'AI-Powered Future Weather Forecasting',
    description: 'Get accurate 7-14 day weather forecasts specifically tailored for agricultural needs. Our AI models analyze historical patterns and current atmospheric data to provide reliable predictions.',
    features: [
      '7-14 day weather forecasts',
      'Rainfall probability analysis',
      'Temperature and humidity predictions',
      'Wind speed and direction forecasts',
      'Frost and heatwave alerts',
      'Growing degree day calculations'
    ],
    image: 'https://images.unsplash.com/photo-1592210454359-9043f067919b?w=1600&q=80',
    icon: '☁️',
    color: '#3b82f6',
    gradient: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
    animationDelay: '100ms'
  },
  {
    id: 2,
    title: 'Climate Analysis',
    subtitle: 'Comprehensive Climate Pattern Recognition',
    description: 'Long-term climate analysis and pattern recognition to help farmers plan their agricultural activities according to seasonal changes and climate trends.',
    features: [
      'Seasonal climate patterns',
      'Historical climate data analysis',
      'Climate change impact assessment',
      'Micro-climate zone identification',
      'Crop suitability analysis',
      'Climate risk assessment'
    ],
    image: 'https://images.unsplash.com/photo-1611273426858-450d8e3c9fce?w=1600&q=80',
    icon: '🌡️',
    color: '#ef4444',
    gradient: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
    animationDelay: '200ms'
  },
  {
    id: 3,
    title: 'Soil Analysis & Health',
    subtitle: 'Complete Soil Health Monitoring System',
    description: 'Comprehensive soil analysis including pH levels, nutrient content, moisture levels, and organic matter to optimize fertilization and irrigation strategies.',
    features: [
      'Soil pH and nutrient testing',
      'Moisture content monitoring',
      'Organic matter analysis',
      'Soil texture classification',
      'Fertilizer recommendations',
      'Irrigation scheduling'
    ],
    image: 'https://images.unsplash.com/photo-1560493676-04071c5f467b?w=1600&q=80',
    icon: '🌱',
    color: '#10b981',
    gradient: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
    animationDelay: '300ms'
  },
  {
    id: 4,
    title: 'Crop Health Heatmaps',
    subtitle: 'Visual Stress Detection & Monitoring',
    description: 'Generate detailed heatmaps using satellite imagery to identify crop stress zones, nutrient deficiencies, and pest infestations across your fields.',
    features: [
      'NDVI vegetation index mapping',
      'Stress zone identification',
      'Growth stage monitoring',
      'Yield potential mapping',
      'Pest infestation detection',
      'Disease spread tracking'
    ],
    image: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=800&q=80',
    icon: '🗺️',
    color: '#8b5cf6',
    gradient: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
    animationDelay: '400ms'
  },
  {
    id: 5,
    title: 'Satellite Field Analysis & Alert System',
    subtitle: 'Real-Time Notifications & Field Alerts',
    description: 'Receive instant alerts about critical conditions including weather warnings, pest outbreaks, irrigation needs, and harvesting time recommendations.',
    features: [
      'Weather alert notifications',
      'Pest outbreak warnings',
      'Irrigation reminders',
      'Harvest time predictions',
      'Fertilizer application alerts',
      'Market price updates'
    ],
    image: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=1600&q=80',
    icon: '🔔',
    color: '#f59e0b',
    gradient: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
    animationDelay: '500ms'
  },
  {
    id: 6,
    title: 'Past Trends Analytics',
    subtitle: 'Historical Performance & Yield Analysis',
    description: 'Analyze historical crop performance, yield patterns, and production trends to make informed decisions for future planting seasons.',
    features: [
      'Historical yield analysis',
      'Crop rotation optimization',
      'Price trend analysis',
      'Production cost tracking',
      'Profitability reports',
      'Seasonal performance comparison'
    ],
    image: 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=1600&q=80',
    icon: '📊',
    color: '#06b6d4',
    gradient: 'linear-gradient(135deg, #06b6d4 0%, #0891b2 100%)',
    animationDelay: '600ms'
  }
];

export const serviceStats = [
  { value: '95%', label: 'Prediction Accuracy', icon: '🎯' },
  { value: '50K+', label: 'Active Farmers', icon: '👨‍🌾' },
  { value: '2M+', label: 'Acres Monitored', icon: '🌾' },
  { value: '30%', label: 'Average Yield Increase', icon: '📈' },
  { value: '40%', label: 'Water Saved', icon: '💧' },
  { value: '24/7', label: 'Monitoring', icon: '🛰️' }
];

export const processSteps = [
  {
    step: 1,
    title: 'Data Collection',
    description: 'Collect satellite imagery, weather data, soil samples, and historical yield data',
    icon: '📡'
  },
  {
    step: 2,
    title: 'AI Analysis',
    description: 'Process data through our AI models for predictions and insights',
    icon: '🤖'
  },
  {
    step: 3,
    title: 'Insight Generation',
    description: 'Generate actionable insights and recommendations',
    icon: '💡'
  },
  {
    step: 4,
    title: 'Farmer Delivery',
    description: 'Deliver insights via mobile app, SMS, and dashboard',
    icon: '📱'
  }
];