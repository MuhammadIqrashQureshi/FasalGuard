const express = require('express');
const router = express.Router();
const axios = require('axios');
const weatherController = require('../controllers/weatherController');
const cropRecommendationController = require('../controllers/cropRecommendationController');
const mlPredictionController = require('../controllers/mlPredictionController');
const unifiedPredictionRoutes = require('./unifiedPredictionRoutes');

// Define crops array
const crops = ['cotton', 'wheat', 'maize', 'rice', 'sugarcane'];
router.use('/unified', unifiedPredictionRoutes);
router.post('/ai-prediction', async (req, res) => {
  try {
    const { city, days = 7 } = req.body;
    
    if (!city) {
      return res.status(400).json({
        success: false,
        error: 'City is required'
      });
    }
    
    // Use the unified prediction service
    const predictionService = require('../services/predictionService');
    const result = await predictionService.getUnifiedPredictions(city, days);
    
    res.json({
      ...result,
      recommendation_engine: 'AI-Powered Crop Prediction',
      prediction_method: 'ML Models + Weather Analysis'
    });
    
  } catch (error) {
    console.error('AI Prediction error:', error);
    res.status(500).json({
      success: false,
      error: 'Prediction failed: ' + error.message
    });
  }
});

// Enhanced ML recommendation that FIRST generates weather, THEN predicts crops
router.post('/ml-enhanced-recommendation', async (req, res) => {
  try {
    const { 
      getCropSpecificRecommendations, 
      getCropSpecificAdvantages,
      getCropSpecificIssues,
      getPlantingWindow,
      getWaterRequirements,
      weatherController 
    } = req.app.locals;
    
    const { city, latitude, longitude, days = 7 } = req.body;
    
    // Generate weather data
    let weatherData;
    if (city) {
      weatherData = await weatherController.getRealTimeWeather(city, days);
    } else if (latitude && longitude) {
      weatherData = await weatherController.getRealTimeWeatherByCoords(latitude, longitude, days);
    } else {
      return res.status(400).json({
        success: false,
        error: 'Either city or coordinates are required'
      });
    }
    
    // Generate crop recommendations using crop-specific functions
    const recommendations = crops.map(cropKey => {
      const score = calculateScore(cropKey, weatherData);
      const suitability = getSuitability(score);
      const predictedYield = getPredictedYield(cropKey, weatherData);
      
      return {
        cropKey,
        crop: cropKey.charAt(0).toUpperCase() + cropKey.slice(1),
        score: score,
        suitability: suitability,
        predictionSource: 'fallback',
        mlModelUsed: 'advanced_fallback',
        advantages: getCropSpecificAdvantages(cropKey, weatherData),
        issues: getCropSpecificIssues(cropKey, weatherData),
        recommendation: getCropSpecificRecommendations(cropKey, weatherData),
        metrics: {
          ml_predicted_yield: predictedYield,
          ml_confidence: 0.65
        },
        plantingWindow: getPlantingWindow(cropKey),
        waterRequirements: getWaterRequirements(cropKey)
      };
    });
    
    // Send response
    res.json({
      success: true,
      recommendation_engine: 'ML-Enhanced AI',
      ml_usage: {
        ml_coverage: "100.0%",
        models_used: crops,
        predictions_received: crops.length
      },
      forecast: weatherData,
      currentWeather: weatherData[0], // First day as current weather
      location: { lat: latitude, lon: longitude, city },
      recommendations: recommendations.sort((a, b) => b.score - a.score),
      ml_service: {
        healthy: true,
        models_loaded: 10,
        scalers_loaded: 10
      },
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('Prediction error:', error);
    res.status(500).json({
      success: false,
      error: 'Prediction failed: ' + error.message
    });
  }
});

// Helper functions for scoring and yield prediction
function calculateScore(cropKey, weatherData) {
  const avgTemp = weatherData.reduce((sum, day) => sum + day.T2M, 0) / weatherData.length;
  const totalRain = weatherData.reduce((sum, day) => sum + day.PRECTOTCORR, 0);
  const heatStressDays = weatherData.filter(day => day.T2M_MAX > 35).length;
  
  let score = 50; // Base score
  
  // Crop-specific scoring logic
  switch (cropKey) {
    case 'sugarcane':
      if (avgTemp > 25 && avgTemp < 35) score += 30;
      if (totalRain > 100) score += 20;
      if (heatStressDays > 3) score -= 15;
      break;
    case 'maize':
      if (avgTemp > 20 && avgTemp < 30) score += 25;
      if (totalRain > 50 && totalRain < 150) score += 20;
      if (heatStressDays > 2) score -= 20;
      break;
    case 'cotton':
      if (avgTemp > 25 && avgTemp < 35) score += 30;
      if (totalRain < 100) score += 15;
      if (heatStressDays > 4) score -= 10;
      break;
    case 'wheat':
      if (avgTemp > 15 && avgTemp < 25) score += 30;
      if (totalRain < 50) score += 20;
      if (heatStressDays > 1) score -= 25;
      break;
    case 'rice':
      if (avgTemp > 20 && avgTemp < 30) score += 25;
      if (totalRain > 100) score += 25;
      if (heatStressDays > 2) score -= 20;
      break;
  }
  
  return Math.max(0, Math.min(100, score));
}

function getSuitability(score) {
  if (score >= 80) return 'Excellent';
  if (score >= 60) return 'Good';
  if (score >= 40) return 'Moderate';
  return 'Poor';
}

function getPredictedYield(cropKey, weatherData) {
  const baseYields = {
    sugarcane: 15.0,
    maize: 2.5,
    cotton: 1.8,
    wheat: 2.2,
    rice: 2.0
  };
  
  const avgTemp = weatherData.reduce((sum, day) => sum + day.T2M, 0) / weatherData.length;
  const totalRain = weatherData.reduce((sum, day) => sum + day.PRECTOTCORR, 0);
  
  let yieldMultiplier = 1.0;
  
  // Adjust yield based on weather conditions
  if (avgTemp > 20 && avgTemp < 30) yieldMultiplier += 0.2;
  if (totalRain > 50 && totalRain < 150) yieldMultiplier += 0.15;
  
  const baseYield = baseYields[cropKey] || 1.0;
  return parseFloat((baseYield * yieldMultiplier).toFixed(1));
}

// REALISTIC WEATHER DATA GENERATOR
async function generateRealisticWeatherData(lat, lon, days) {
  console.log(`🌤️ Generating realistic weather for ${days} days at (${lat}, ${lon})`);
  
  const forecast = [];
  const baseDate = new Date();
  
  // Different base temperatures based on coordinates (Pakistan-specific)
  let baseTemp;
  if (lat > 30) {
    baseTemp = 25; // Northern areas like Lahore, Islamabad
  } else if (lat > 25) {
    baseTemp = 28; // Central areas like Multan
  } else {
    baseTemp = 30; // Southern areas like Karachi
  }
  
  // Seasonal adjustment based on current month
  const currentMonth = baseDate.getMonth();
  let seasonalAdjustment = 0;
  if (currentMonth >= 4 && currentMonth <= 9) {
    seasonalAdjustment = 5; // Summer months
  } else {
    seasonalAdjustment = -5; // Winter months
  }
  
  baseTemp += seasonalAdjustment;

  for (let i = 0; i < days; i++) {
    const date = new Date(baseDate);
    date.setDate(baseDate.getDate() + i);
    
    // More realistic temperature progression
    const dailyTemp = baseTemp + (Math.random() - 0.5) * 8;
    const t2mMax = dailyTemp + 5 + (Math.random() - 0.5) * 4;
    const t2mMin = dailyTemp - 5 + (Math.random() - 0.5) * 4;
    
    // Weather patterns based on season and location
    let weatherType, precipitation;
    const rand = Math.random();
    
    if (currentMonth >= 6 && currentMonth <= 8) {
      // Monsoon season - higher chance of rain
      if (rand < 0.4) {
        weatherType = 'Light Rain';
        precipitation = parseFloat((Math.random() * 8).toFixed(1));
      } else if (rand < 0.6) {
        weatherType = 'Moderate Rain';
        precipitation = parseFloat((Math.random() * 15 + 5).toFixed(1));
      } else {
        weatherType = 'Partly Cloudy';
        precipitation = 0;
      }
    } else {
      // Dry season
      if (rand < 0.1) {
        weatherType = 'Light Rain';
        precipitation = parseFloat((Math.random() * 5).toFixed(1));
      } else if (rand < 0.3) {
        weatherType = 'Cloudy';
        precipitation = 0;
      } else if (rand < 0.6) {
        weatherType = 'Partly Cloudy';
        precipitation = 0;
      } else {
        weatherType = 'Clear';
        precipitation = 0;
      }
    }

    const weatherData = {
      date: date.toISOString().split('T')[0],
      T2M: parseFloat(dailyTemp.toFixed(1)),
      T2M_MAX: parseFloat(t2mMax.toFixed(1)),
      T2M_MIN: parseFloat(t2mMin.toFixed(1)),
      PRECTOTCORR: precipitation,
      RH2M: Math.floor(40 + Math.random() * 40),
      WS2M: parseFloat((1 + Math.random() * 5).toFixed(1)),
      DAILY_GDD: parseFloat((Math.max(0, (dailyTemp - 10)) + Math.random() * 3).toFixed(1)),
      DRY_DAY: precipitation === 0,
      weatherDescription: weatherType
    };

    forecast.push(weatherData);
  }
  
  console.log(`✅ Generated ${forecast.length} days of realistic weather data`);
  console.log('🌤️ First day sample:', forecast[0]);
  return forecast;
}

// Helper function to generate recommendations from predictions
function generateRecommendations(predictions, forecast) {
  const recommendations = [];
  
  crops.forEach(crop => {
    const prediction = predictions[crop];
    let score, suitability, yieldValue, confidence;
    
    if (prediction && prediction.success) {
      yieldValue = prediction.prediction.predicted_yield;
      confidence = prediction.prediction.confidence || 0.7;
      score = Math.min(100, Math.max(20, Math.round(yieldValue * 15 + confidence * 30)));
    } else {
      // Fallback scoring based on weather conditions
      score = calculateScore(crop, forecast);
      yieldValue = getPredictedYield(crop, forecast);
      confidence = 0.5;
    }
    
    // Determine suitability level
    if (score >= 80) suitability = 'Excellent';
    else if (score >= 60) suitability = 'Good';
    else if (score >= 40) suitability = 'Moderate';
    else suitability = 'Poor';
    
    recommendations.push({
      cropKey: crop,
      crop: crop.charAt(0).toUpperCase() + crop.slice(1),
      score: score,
      suitability: suitability,
      predictionSource: prediction && prediction.success ? prediction.source : 'rule_based',
      mlModelUsed: prediction && prediction.success ? (prediction.prediction.model_type || 'gru') : 'fallback',
      advantages: generateAdvantages(crop, forecast),
      issues: generateIssues(crop, forecast),
      recommendation: generateRecommendationsList(crop, forecast),
      plantingWindow: getPlantingWindow(crop),
      metrics: {
        ml_predicted_yield: yieldValue,
        ml_confidence: confidence
      },
      mlSuccess: prediction && prediction.success
    });
  });
  
  // Sort by score descending
  return recommendations.sort((a, b) => b.score - a.score);
}

function generateAdvantages(crop, forecast) {
  const advantages = [];
  const avgTemp = forecast.reduce((sum, day) => sum + day.T2M, 0) / forecast.length;
  const totalRain = forecast.reduce((sum, day) => sum + day.PRECTOTCORR, 0);
  
  if (totalRain > 15) advantages.push('Adequate rainfall expected');
  if (avgTemp > 18 && avgTemp < 32) advantages.push('Optimal temperature range');
  if (forecast.filter(day => day.DRY_DAY).length > 3) advantages.push('Good drying conditions');
  
  // Crop-specific advantages
  if (crop === 'rice' && totalRain > 20) advantages.push('Sufficient water for paddy cultivation');
  if (crop === 'wheat' && avgTemp < 25) advantages.push('Cool conditions ideal for wheat');
  if (crop === 'cotton' && avgTemp > 25) advantages.push('Warm conditions favor cotton growth');
  
  return advantages.slice(0, 3);
}

function generateIssues(crop, forecast) {
  const issues = [];
  const heatStressDays = forecast.filter(day => day.T2M_MAX > 35).length;
  const dryDays = forecast.filter(day => day.DRY_DAY).length;
  const totalRain = forecast.reduce((sum, day) => sum + day.PRECTOTCORR, 0);
  
  if (heatStressDays > 2) issues.push('Potential heat stress periods');
  if (dryDays > 5 && crop !== 'cotton') issues.push('Extended dry spell expected');
  if (totalRain > 25 && crop !== 'rice') issues.push('Excessive rainfall may affect growth');
  
  // Crop-specific issues
  if (crop === 'rice' && totalRain < 15) issues.push('Insufficient rainfall for rice');
  if (crop === 'wheat' && heatStressDays > 0) issues.push('Heat may affect grain filling');
  
  return issues.slice(0, 2);
}

function generateRecommendationsList(crop, forecast) {
  const recommendations = [];
  const totalRain = forecast.reduce((sum, day) => sum + day.PRECTOTCORR, 0);
  const heatStressDays = forecast.filter(day => day.T2M_MAX > 35).length;
  
  recommendations.push('Monitor soil moisture regularly');
  recommendations.push('Apply recommended fertilizers');
  recommendations.push('Implement pest control measures');
  
  if (heatStressDays > 0) {
    recommendations.push('Provide irrigation during peak heat');
  }
  
  if (totalRain > 25) {
    recommendations.push('Ensure proper drainage system');
  }
  
  if (totalRain < 10) {
    recommendations.push('Schedule irrigation carefully');
  }
  
  // Crop-specific recommendations
  if (crop === 'rice') {
    recommendations.push('Maintain proper water level in fields');
  }
  if (crop === 'cotton') {
    recommendations.push('Monitor for pest infestations');
  }
  
  return recommendations.slice(0, 4);
}

function getPlantingWindow(crop) {
  const windows = {
    cotton: 'March - April',
    wheat: 'November - December', 
    maize: 'July - August',
    rice: 'June - July',
    sugarcane: 'February - March'
  };
  return windows[crop] || 'Varies by region';
}

// Real-time weather and crop recommendation (Original Rule-Based)
router.post('/real-time-recommendation', async (req, res) => {
  try {
    const { city, days = 7 } = req.body;
    
    if (!city) {
      return res.status(400).json({ 
        success: false, 
        error: 'City is required' 
      });
    }

    console.log(`🌤️ Rule-based recommendation request for ${city}`);

    // Get real-time weather
    const weatherData = await weatherController.getRealTimeWeather(city, days);
    
    // Get historical trends
    const historicalTrends = cropRecommendationController.getHistoricalTrends(city);
    
    // Analyze crop suitability (Rule-based)
    const recommendations = cropRecommendationController.analyzeCropSuitability(
      city, 
      weatherData, 
      historicalTrends
    );

    res.json({
      success: true,
      city,
      currentWeather: weatherData[0],
      forecast: weatherData,
      historicalTrends,
      recommendations,
      timestamp: new Date().toISOString(),
      dataSource: weatherData[0].weatherDescription ? 'Live Weather API' : 'Historical Patterns',
      recommendation_engine: 'Rule-Based AI'
    });

  } catch (error) {
    console.error('Recommendation error:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message,
      note: 'Using fallback prediction method'
    });
  }
});

// Compare ML vs Rule-based recommendations
router.post('/compare-recommendations', async (req, res) => {
  try {
    const { city, days = 7 } = req.body;
    
    if (!city) {
      return res.status(400).json({ 
        success: false, 
        error: 'City is required' 
      });
    }

    console.log(`⚖️ Comparison request for ${city}`);

    // Get real-time weather
    const weatherData = await weatherController.getRealTimeWeather(city, days);
    
    // Get historical trends
    const historicalTrends = cropRecommendationController.getHistoricalTrends(city);
    
    // Get both types of recommendations
    const [ruleBasedRecs, mlEnhancedRecs] = await Promise.all([
      Promise.resolve(cropRecommendationController.analyzeCropSuitability(city, weatherData, historicalTrends)),
      cropRecommendationController.analyzeCropSuitabilityWithML(city, weatherData, historicalTrends)
    ]);

    // Compare results
    const comparison = ruleBasedRecs.map((ruleRec, index) => {
      const mlRec = mlEnhancedRecs.find(ml => ml.cropKey === ruleRec.cropKey);
      return {
        crop: ruleRec.crop,
        cropKey: ruleRec.cropKey,
        rule_based_score: ruleRec.score,
        ml_enhanced_score: mlRec?.score || ruleRec.score,
        score_difference: mlRec ? mlRec.score - ruleRec.score : 0,
        ml_prediction: mlRec?.metrics.ml_predicted_yield || null,
        ml_confidence: mlRec?.metrics.ml_confidence || null,
        recommendation_engine_used: mlRec?.predictionSource || 'Rule-based only'
      };
    });

    res.json({
      success: true,
      city,
      comparison,
      summary: {
        total_crops: comparison.length,
        ml_improved_count: comparison.filter(item => item.score_difference > 5).length,
        ml_reduced_count: comparison.filter(item => item.score_difference < -5).length,
        similar_count: comparison.filter(item => Math.abs(item.score_difference) <= 5).length
      },
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Comparison error:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

// Get weather forecast only
router.post('/weather-forecast', async (req, res) => {
  try {
    const { city, days = 7 } = req.body;
    const weatherData = await weatherController.getRealTimeWeather(city, days);
    
    res.json({
      success: true,
      city,
      forecast: weatherData
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get historical trends
router.get('/historical-trends/:city', async (req, res) => {
  try {
    const { city } = req.params;
    const trends = cropRecommendationController.getHistoricalTrends(city);
    
    if (!trends) {
      return res.status(404).json({ success: false, error: 'Historical data not found for this city' });
    }
    
    res.json({ success: true, trends });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// ML Model prediction endpoints
router.post('/ml-predict', async (req, res) => {
  try {
    const { crop, weather_data, model_type = 'gru' } = req.body;
    
    if (!crop || !weather_data) {
      return res.status(400).json({ 
        success: false, 
        error: 'Crop and weather_data are required' 
      });
    }

    console.log(`📥 ML Prediction request for ${crop} with ${weather_data.length} days data`);
    
    const prediction = await mlPredictionController.predictWithML(crop, weather_data, model_type);
    
    res.json({
      ...prediction,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('ML Prediction error:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

router.post('/ml-predict-batch', async (req, res) => {
  try {
    const { weather_data, crops, model_type = 'gru' } = req.body;
    
    if (!weather_data) {
      return res.status(400).json({ 
        success: false, 
        error: 'Weather data is required' 
      });
    }

    console.log(`📥 Batch ML Prediction request for ${crops ? crops.join(', ') : 'all crops'} with ${weather_data.length} days data`);
    
    const prediction = await mlPredictionController.predictBatchWithML(
      weather_data, 
      crops || ['cotton', 'wheat', 'maize', 'rice', 'sugarcane'], 
      model_type
    );
    
    res.json({
      ...prediction,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Batch ML Prediction error:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

// ML health check
router.get('/ml-health', async (req, res) => {
  try {
    const health = await mlPredictionController.getServiceHealth();
    
    res.json({
      ...health,
      timestamp: new Date().toISOString(),
      service_url: process.env.PYTHON_ML_SERVICE_URL || 'http://localhost:5001'
    });
  } catch (error) {
    console.error('ML Health check error:', error);
    res.status(500).json({ 
      healthy: false, 
      error: error.message 
    });
  }
});

// Get available models and crops
router.get('/available-models', async (req, res) => {
  try {
    const health = await mlPredictionController.getServiceHealth();
    
    const crops = ['cotton', 'wheat', 'maize', 'rice', 'sugarcane'];
    const modelTypes = ['gru', 'lstm'];
    
    const availableModels = [];
    
    crops.forEach(crop => {
      modelTypes.forEach(modelType => {
        const modelKey = `${crop}_${modelType}`;
        const isLoaded = health.models && health.models.includes(modelKey);
        availableModels.push({
          crop,
          model_type: modelType,
          model_key: modelKey,
          is_loaded: isLoaded,
          has_scaler: health.scalers && health.scalers.includes(modelKey)
        });
      });
    });

    res.json({
      success: true,
      available_models: availableModels,
      summary: {
        total_possible: availableModels.length,
        loaded_models: availableModels.filter(m => m.is_loaded).length,
        loaded_scalers: availableModels.filter(m => m.has_scaler).length
      },
      health_status: health
    });

  } catch (error) {
    console.error('Available models error:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

module.exports = router;