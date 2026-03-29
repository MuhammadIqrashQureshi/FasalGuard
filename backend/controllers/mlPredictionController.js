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

  // Single-crop fallback wrapper — used when ML service is unavailable
  async fallbackPrediction(crop, weatherData) {
    try {
      // Use the existing rule-based generator for a single crop
      const result = this.generateRuleBasedPrediction(crop, weatherData);
      return result;
    } catch (error) {
      console.error('Fallback prediction error:', error);
      // As a last resort, return a minimal fallback shape
      return {
        success: true,
        prediction: {
          predicted_yield: 3.5,
          confidence: 0.5,
          model_type: 'fallback',
          note: 'Minimal fallback due to internal error'
        },
        source: 'fallback'
      };
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
  let lastDate;
  try {
    // Try to parse the last date
    const lastWeatherDay = weatherData[weatherData.length - 1];
    if (lastWeatherDay.date) {
      // If date is in string format, parse it
      if (typeof lastWeatherDay.date === 'string') {
        lastDate = new Date(lastWeatherDay.date);
      } else if (lastWeatherDay.date instanceof Date) {
        lastDate = lastWeatherDay.date;
      } else {
        // Use current date as fallback
        lastDate = new Date();
      }
    } else {
      lastDate = new Date();
    }
  } catch (error) {
    console.warn('⚠️ Error parsing last date, using current date:', error);
    lastDate = new Date();
  }
  
  // Pad with consecutive dates
  for (let i = 0; i < daysToPad; i++) {
    const date = new Date(lastDate);
    date.setDate(lastDate.getDate() + i + 1);
    
    // Format date for ML service
    const formattedDate = date.toISOString().split('T')[0]; // YYYY-MM-DD format
    
    // Use average of available data for weather values
    const avgT2M = weatherData.reduce((sum, day) => sum + day.T2M, 0) / weatherData.length;
    const avgRain = weatherData.reduce((sum, day) => sum + day.PRECTOTCORR, 0) / weatherData.length;
    const avgHumidity = weatherData.reduce((sum, day) => sum + day.RH2M, 0) / weatherData.length;
    
    const paddedDay = {
      date: formattedDate,
      T2M: parseFloat((avgT2M + (Math.random() - 0.5) * 2).toFixed(2)),
      T2M_MAX: parseFloat((avgT2M + 5 + (Math.random() - 0.5) * 3).toFixed(2)),
      T2M_MIN: parseFloat((avgT2M - 5 + (Math.random() - 0.5) * 3).toFixed(2)),
      PRECTOTCORR: parseFloat(Math.max(0, avgRain + (Math.random() - 0.5) * 1).toFixed(2)),
      RH2M: parseInt(Math.max(30, Math.min(90, avgHumidity + (Math.random() - 0.5) * 10))),
      WS2M: parseFloat((3.0 + (Math.random() - 0.5) * 2).toFixed(2)),
      DAILY_GDD: parseFloat(Math.max(0, (avgT2M - 10) + (Math.random() - 0.5) * 2).toFixed(2)),
      DRY_DAY: Math.random() > 0.3,
    };
    
    paddedData.push(paddedDay);
  }
  
  console.log(`✅ Padded to ${paddedData.length} days`);
  console.log(`📅 First date: ${paddedData[0].date}`);
  console.log(`📅 Last date: ${paddedData[paddedData.length - 1].date}`);
  
  return paddedData;
}
/*
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
*/
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
  prepareFeaturesForML(weatherData) {
    try {
      console.log('🔍 Preparing features for ML from weather data:', weatherData.length, 'days');
      
      // Ensure weatherData is an array
      if (!Array.isArray(weatherData) || weatherData.length === 0) {
        console.warn('No valid weather data for ML features');
        return null;
      }
      
      // Extract required features for ML models
      const features = weatherData.map(day => {
        return {
          // Temperature features
          T2M: day.T2M || day.temperature || 28,
          T2M_MAX: day.T2M_MAX || day.max_temp || 32,
          T2M_MIN: day.T2M_MIN || day.min_temp || 22,
          
          // Precipitation features
          PRECTOTCORR: day.PRECTOTCORR || day.precipitation || 0,
          
          // Humidity features
          RH2M: day.RH2M || day.humidity || 65,
          
          // Wind features
          WS2M: day.WS2M || day.wind_speed || 2.5,
          
          // Derived features (calculate if missing)
          DAILY_GDD: day.DAILY_GDD || this.calculateGDD(
            day.T2M_MAX || 32, 
            day.T2M_MIN || 22
          ),
          
          // Soil moisture index (simplified)
          SOIL_MOISTURE: this.calculateSoilMoisture(
            day.PRECTOTCORR || 0,
            day.DRY_DAY || false
          ),
          
          // Evapotranspiration (simplified)
          ET0: this.calculateET0(
            day.T2M_MAX || 32,
            day.T2M_MIN || 22,
            day.RH2M || 65,
            day.WS2M || 2.5
          )
        };
      });
      
      console.log('✅ Features prepared successfully');
      return features;
      
    } catch (error) {
      console.error('❌ Error preparing ML features:', error);
      return null;
    }
  }
  
  calculateGDD(maxTemp, minTemp, baseTemp = 10) {
    const avgTemp = (maxTemp + minTemp) / 2;
    return Math.max(0, avgTemp - baseTemp);
  }
  
  calculateSoilMoisture(precipitation, isDryDay) {
    // Simplified soil moisture calculation
    const baseMoisture = Math.min(100, precipitation * 4);
    return isDryDay ? baseMoisture * 0.9 : baseMoisture;
  }
  
  calculateET0(maxTemp, minTemp, humidity, windSpeed) {
    // Simplified ET0 calculation (Hargreaves)
    const tmean = (maxTemp + minTemp) / 2;
    const trange = maxTemp - minTemp;
    return 0.0023 * (tmean + 17.8) * Math.sqrt(trange) * 15;
  }

  // Update the predictBatchWithML method
  async predictBatchWithML(weatherData, crops) {
    try {
      console.log('🤖 Starting batch ML predictions for crops:', crops);
      
      const features = this.prepareFeaturesForML(weatherData);
      if (!features) {
        console.warn('⚠️ Using fallback predictions due to feature preparation failure');
        return this.generateFallbackPredictions(crops, weatherData);
      }
      
      const predictions = {};
      
      for (const crop of crops) {
        try {
          // Try to get actual ML prediction
          const mlPrediction = await this.predictWithML(crop, features);
          
          if (mlPrediction && mlPrediction.success) {
            predictions[crop] = {
              success: true,
              prediction: mlPrediction,
              source: 'ml_model'
            };
          } else {
            // Fallback to rule-based prediction
            predictions[crop] = this.generateRuleBasedPrediction(crop, weatherData);
          }
        } catch (cropError) {
          console.warn(`⚠️ ML prediction failed for ${crop}:`, cropError.message);
          predictions[crop] = this.generateRuleBasedPrediction(crop, weatherData);
        }
      }
      
      return {
        success: true,
        predictions: predictions,
        source: 'mixed' // Can be 'ml_model', 'rule_based', or 'mixed'
      };
      
    } catch (error) {
      console.error('❌ Batch ML prediction error:', error);
      return this.generateFallbackPredictions(crops, weatherData);
    }
  }
  
  generateRuleBasedPrediction(crop, weatherData) {
    // Rule-based yield prediction based on weather conditions
    const avgTemp = weatherData.reduce((sum, day) => sum + (day.T2M || 0), 0) / weatherData.length;
    const totalRain = weatherData.reduce((sum, day) => sum + (day.PRECTOTCORR || 0), 0);
    const dryDays = weatherData.filter(day => day.DRY_DAY || day.PRECTOTCORR === 0).length;
    
    // Base yields by crop
    const baseYields = {
      cotton: 4.3, wheat: 3.2, maize: 5.1, rice: 2.8, sugarcane: 65.0
    };
    
    const baseYield = baseYields[crop] || 3.0;
    
    // Adjust based on conditions
    let adjustment = 1.0;
    
    // Temperature adjustment
    const optimalTemp = {
      cotton: 25, wheat: 18, maize: 25, rice: 28, sugarcane: 27
    }[crop] || 25;
    
    const tempDiff = Math.abs(avgTemp - optimalTemp);
    if (tempDiff > 5) adjustment *= 0.9;
    if (tempDiff > 10) adjustment *= 0.8;
    
    // Rainfall adjustment
    const optimalRain = {
      cotton: 1.15, wheat: 0.87, maize: 1.35, rice: 2.88, sugarcane: 3.85
    }[crop] || 1.0; // mm per day
    
    const rainRatio = totalRain / (optimalRain * weatherData.length);
    if (rainRatio < 0.5) adjustment *= 0.8;
    if (rainRatio > 2.0) adjustment *= 0.9;
    
    // Dry days adjustment
    const dryDayPercent = dryDays / weatherData.length;
    if (dryDayPercent > 0.8) adjustment *= 0.85;
    
    const predictedYield = baseYield * adjustment;
    
    return {
      success: true,
      prediction: {
        predicted_yield: parseFloat(predictedYield.toFixed(1)),
        confidence: 0.65, // Lower confidence for rule-based
        model_type: 'rule_based',
        factors_considered: ['temperature', 'rainfall', 'dry_days'],
        base_yield: baseYield,
        adjustment_factor: adjustment
      },
      source: 'rule_based'
    };
  }
  
  generateFallbackPredictions(crops, weatherData) {
    const predictions = {};
    const fallbackYields = {
      cotton: 4.0, wheat: 3.5, maize: 4.8, rice: 3.0, sugarcane: 68.0
    };
    
    for (const crop of crops) {
      predictions[crop] = {
        success: true,
        prediction: {
          predicted_yield: fallbackYields[crop] || 3.5,
          confidence: 0.5,
          model_type: 'fallback',
          factors_considered: ['historical_average'],
          note: 'Using fallback prediction due to ML model unavailability'
        },
        source: 'fallback'
      };
    }
    
    return {
      success: true,
      predictions: predictions,
      source: 'fallback'
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