const axios = require('axios');

class MLPredictionController {
  constructor() {
    this.pythonServiceUrl = process.env.PYTHON_ML_SERVICE_URL || 'http://localhost:5001';
    this.isServiceAvailable = false;
    this.checkServiceHealth();
  }

  async checkServiceHealth() {
    try {
      const response = await axios.get(`${this.pythonServiceUrl}/health`, { timeout: 5000 });
      this.isServiceAvailable = true;
      console.log('✅ ML Service is available:', response.data);
      return true;
    } catch (error) {
      this.isServiceAvailable = false;
      console.warn('⚠️ ML Service is unavailable:', error.message);
      return false;
    }
  }

 async predictWithML(crop, weatherData, modelType = 'gru') {
  if (!this.isServiceAvailable) {
    console.log(`🔄 ML service unavailable, using fallback for ${crop}`);
    return await this.fallbackPrediction(crop, weatherData);
  }

  try {
    // Convert weather data to ensure proper types for ML service
    const processedWeatherData = weatherData.map(day => {
      return {
        date: day.date,
        T2M: parseFloat(day.T2M),
        T2M_MAX: parseFloat(day.T2M_MAX),
        T2M_MIN: parseFloat(day.T2M_MIN || (day.T2M - 5 + (Math.random() - 0.5) * 4)),
        PRECTOTCORR: parseFloat(day.PRECTOTCORR),
        RH2M: parseInt(day.RH2M),
        WS2M: parseFloat(day.WS2M || 3.0),
        DAILY_GDD: parseFloat(day.DAILY_GDD || Math.max(0, (day.T2M_MAX + (day.T2M_MIN || day.T2M - 5)) / 2 - 10)),
        DRY_DAY: Boolean(day.PRECTOTCORR < 0.1),
      };
    });

    console.log(`📊 Sending ${processedWeatherData.length} days weather data for ${crop} to ML service`);

    // Important: ML models expect 365 days of data
    // Pad the weather data to 365 days
    const paddedWeatherData = this.padWeatherData(processedWeatherData, 365);

    const response = await axios.post(`${this.pythonServiceUrl}/predict`, {
      weather_data: paddedWeatherData,
      crop: crop,
      model_type: modelType
    }, { timeout: 15000 });

    console.log(`✅ ML prediction success for ${crop}:`, response.data);
    
    return {
      success: true,
      prediction: response.data,
      source: 'ml_model'
    };
  } catch (error) {
    console.error(`❌ ML prediction failed for ${crop}:`, error.message);
    if (error.response) {
      console.error(`📋 ML service response:`, error.response.data);
    }
    
    // Try fallback
    return await this.fallbackPrediction(crop, weatherData);
  }
}

padWeatherData(weatherData, targetDays = 365) {
  console.log(`📊 Padding ${weatherData.length} days to ${targetDays} days`);
  
  if (weatherData.length >= targetDays) {
    return weatherData.slice(0, targetDays);
  }
  
  const paddedData = [...weatherData];
  const daysToPad = targetDays - weatherData.length;
  
  // Get the last date from original data
  const lastDate = new Date(weatherData[weatherData.length - 1].date);
  
  // Pad with consecutive dates
  for (let i = 0; i < daysToPad; i++) {
    const date = new Date(lastDate);
    date.setDate(lastDate.getDate() + i + 1);
    
    // ✅ FIX: Format date in the format ML service expects
    const formattedDate = this.formatDateForML(date);
    
    // Use average of available data for weather values
    const avgT2M = weatherData.reduce((sum, day) => sum + day.T2M, 0) / weatherData.length;
    const avgRain = weatherData.reduce((sum, day) => sum + day.PRECTOTCORR, 0) / weatherData.length;
    const avgHumidity = weatherData.reduce((sum, day) => sum + day.RH2M, 0) / weatherData.length;
    
    const paddedDay = {
      date: formattedDate,  // ✅ Now in correct format
      T2M: avgT2M + (Math.random() - 0.5) * 2,
      T2M_MAX: avgT2M + 5 + (Math.random() - 0.5) * 3,
      T2M_MIN: avgT2M - 5 + (Math.random() - 0.5) * 3,
      PRECTOTCORR: Math.max(0, avgRain + (Math.random() - 0.5) * 1),
      RH2M: Math.max(30, Math.min(90, avgHumidity + (Math.random() - 0.5) * 10)),
      WS2M: 3.0 + (Math.random() - 0.5) * 2,
      DAILY_GDD: Math.max(0, (avgT2M - 10) + (Math.random() - 0.5) * 2),
      DRY_DAY: Math.random() > 0.3,
    };
    
    paddedData.push(paddedDay);
  }
  
  console.log(`✅ Padded to ${paddedData.length} days`);
  console.log(`📅 First date: ${paddedData[0].date}`);
  console.log(`📅 Last date: ${paddedData[paddedData.length - 1].date}`);
  
  return paddedData;
}

// ✅ ADD THIS METHOD: Format date for ML service
formatDateForML(date) {
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 
                  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  
  const dayName = days[date.getDay()];
  const monthName = months[date.getMonth()];
  const day = date.getDate();
  const year = date.getFullYear();
  
  return `${dayName} ${monthName} ${day} ${year}`;
  // Returns format like: "Sun Dec 07 2025"
}

createWeatherPattern(weatherData) {
  // Create a weekly pattern from available data
  const pattern = [];
  const weeklyAvg = {
    T2M: weatherData.reduce((sum, day) => sum + day.T2M, 0) / weatherData.length,
    T2M_MAX: weatherData.reduce((sum, day) => sum + day.T2M_MAX, 0) / weatherData.length,
    T2M_MIN: weatherData.reduce((sum, day) => sum + day.T2M_MIN, 0) / weatherData.length,
    PRECTOTCORR: weatherData.reduce((sum, day) => sum + day.PRECTOTCORR, 0) / weatherData.length,
    RH2M: weatherData.reduce((sum, day) => sum + day.RH2M, 0) / weatherData.length,
    WS2M: weatherData.reduce((sum, day) => sum + day.WS2M, 0) / weatherData.length,
    DAILY_GDD: weatherData.reduce((sum, day) => sum + day.DAILY_GDD, 0) / weatherData.length,
  };
  
  // Create 7-day pattern with variations
  for (let i = 0; i < 7; i++) {
    const variation = (Math.random() - 0.5) * 2;
    pattern.push({
      T2M: weeklyAvg.T2M + variation,
      T2M_MAX: weeklyAvg.T2M_MAX + variation + 2,
      T2M_MIN: weeklyAvg.T2M_MIN + variation - 2,
      PRECTOTCORR: Math.max(0, weeklyAvg.PRECTOTCORR * (0.5 + Math.random())),
      RH2M: Math.max(30, Math.min(90, weeklyAvg.RH2M + (Math.random() - 0.5) * 20)),
      WS2M: Math.max(0.5, weeklyAvg.WS2M + (Math.random() - 0.5) * 2),
      DAILY_GDD: Math.max(0, weeklyAvg.DAILY_GDD + (Math.random() - 0.5) * 3),
      DRY_DAY: Math.random() > 0.3,
    });
  }
  
  return pattern;
}
  async predictBatchWithML(weatherData, crops = ['cotton', 'wheat', 'maize', 'rice', 'sugarcane'], modelType = 'gru') {
    if (!this.isServiceAvailable) {
      console.log('🔄 ML service unavailable, using fallback for batch prediction');
      return await this.fallbackBatchPrediction(weatherData, crops);
    }

    try {
      const response = await axios.post(`${this.pythonServiceUrl}/predict-batch`, {
        weather_data: weatherData,
        crops: crops,
        model_type: modelType  // This one is correct
      }, { timeout: 15000 });

      return {
        success: true,
        predictions: response.data.predictions,
        source: 'ml_model_batch'
      };
    } catch (error) {
      console.error('❌ Batch ML prediction failed:', error.message);
      return await this.fallbackBatchPrediction(weatherData, crops);
    }
  }

  async fallbackPrediction(crop, weatherData) {
    // Smart fallback based on your training data patterns
    const baseYields = {
      cotton: 4.3, wheat: 3.2, maize: 5.1, rice: 2.8, sugarcane: 65.0
    };

    const weeklyAvgTemp = weatherData.reduce((sum, day) => sum + day.T2M, 0) / weatherData.length;
    const totalRainfall = weatherData.reduce((sum, day) => sum + day.PRECTOTCORR, 0);
    const heatStressDays = weatherData.filter(day => day.T2M_MAX > 35).length;
    const totalGDD = weatherData.reduce((sum, day) => sum + day.DAILY_GDD, 0);

    // Advanced adjustment based on multiple factors
    let adjustment = 1.0;
    
    // Temperature optimization (based on crop-specific optimal temps)
    const optimalTemps = { cotton: 25, wheat: 18, maize: 25, rice: 28, sugarcane: 27 };
    const tempDiff = Math.abs(weeklyAvgTemp - optimalTemps[crop]);
    adjustment -= tempDiff * 0.03;

    // Rainfall optimization
    const optimalWeeklyRain = {
      cotton: 11.5, wheat: 8.6, maize: 13.5, rice: 28.8, sugarcane: 38.5
    };
    const rainRatio = totalRainfall / optimalWeeklyRain[crop];
    if (rainRatio < 0.5) adjustment -= 0.25;
    else if (rainRatio > 2.0) adjustment -= 0.15;
    else if (rainRatio >= 0.8 && rainRatio <= 1.2) adjustment += 0.15;

    // Heat stress impact
    adjustment -= heatStressDays * 0.08;

    // GDD impact
    const optimalGDD = { cotton: 1200, wheat: 900, maize: 1100, rice: 1300, sugarcane: 1500 };
    const gddRatio = (totalGDD * 52) / optimalGDD[crop]; // Project annual GDD
    if (gddRatio < 0.7) adjustment -= 0.2;
    else if (gddRatio > 1.3) adjustment -= 0.1;

    const predictedYield = baseYields[crop] * Math.max(0.3, adjustment);

    return {
      success: true,
      prediction: {
        crop: crop,
        model_type: 'advanced_fallback',
        predicted_yield: predictedYield,
        confidence: 0.65,
        adjustment_factors: {
          temperature_impact: tempDiff,
          rainfall_ratio: rainRatio,
          heat_stress_days: heatStressDays,
          gdd_ratio: gddRatio,
          final_adjustment: adjustment
        },
        note: 'Using advanced rule-based estimation (ML service unavailable)'
      },
      source: 'fallback'
    };
  }

  async fallbackBatchPrediction(weatherData, crops) {
    const predictions = {};
    for (const crop of crops) {
      predictions[crop] = await this.fallbackPrediction(crop, weatherData);
    }
    return {
      success: true,
      predictions: predictions,
      source: 'fallback_batch'
    };
  }

  async getServiceHealth() {
    try {
      const response = await axios.get(`${this.pythonServiceUrl}/health`, { timeout: 5000 });
      return {
        healthy: true,
        models_loaded: response.data.models_loaded,
        scalers_loaded: response.data.scalers_loaded,
        models: response.data.models
      };
    } catch (error) {
      return {
        healthy: false,
        error: error.message
      };
    }
  }
}

module.exports = new MLPredictionController();