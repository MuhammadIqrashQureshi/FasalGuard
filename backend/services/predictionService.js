const weatherController = require('../controllers/weatherController');
const mlPredictionController = require('../controllers/mlPredictionController');

class PredictionService {
  constructor() {
    this.weather = new weatherController();
  }

  async getUnifiedPredictions(city, days = 7) {
    try {
      console.log(`🌤️ Fetching weather data for ${city}...`);
      
      // 1. Get weather forecast
      const weatherData = await this.weather.getRealTimeWeather(city, days);
      
      // 2. Get ML predictions for all crops
      const crops = ['cotton', 'wheat', 'maize', 'rice', 'sugarcane'];
      const predictions = {};
      
      console.log(`🤖 Getting ML predictions for ${crops.length} crops...`);
      
      for (const crop of crops) {
        try {
          const mlResult = await mlPredictionController.predictWithML(crop, weatherData, 'gru');
          
          if (mlResult.success && mlResult.prediction && !mlResult.prediction.error) {
            predictions[crop] = {
              predicted_yield: mlResult.prediction.predicted_yield,
              confidence: mlResult.prediction.confidence,
              recommendation: mlResult.prediction.recommendation,
              weather_summary: mlResult.prediction.weather_summary,
              model_used: mlResult.prediction.model_used
            };
          } else {
            predictions[crop] = this.getFallbackPrediction(crop, weatherData);
          }
        } catch (error) {
          console.error(`Error predicting for ${crop}:`, error.message);
          predictions[crop] = this.getFallbackPrediction(crop, weatherData);
        }
      }
      
      // 3. Process results into recommendations
      const recommendations = this.processPredictions(predictions, weatherData, city);
      
      return {
        success: true,
        location: {
          city: city,
          coordinates: this.weather.getCityData(city)
        },
        forecast: weatherData,
        predictions: predictions,
        recommendations: recommendations,
        timestamp: new Date().toISOString(),
        analysis: {
          total_crops: crops.length,
          ml_predictions: Object.values(predictions).filter(p => p.model_used && !p.model_used.includes('fallback')).length,
          weather_days: weatherData.length
        }
      };
      
    } catch (error) {
      console.error('Unified prediction error:', error);
      throw error;
    }
  }

  getFallbackPrediction(crop, weatherData) {
    const baseYields = {
      cotton: 4.3, wheat: 3.2, maize: 5.1, rice: 2.8, sugarcane: 65.0
    };
    
    const avgTemp = weatherData.reduce((sum, day) => sum + day.T2M, 0) / weatherData.length;
    const totalRain = weatherData.reduce((sum, day) => sum + day.PRECTOTCORR, 0);
    
    let adjustment = 1.0;
    
    // Simple adjustment based on weather
    if (avgTemp > 25 && avgTemp < 35) adjustment *= 1.1;
    if (totalRain > 20 && totalRain < 100) adjustment *= 1.05;
    
    return {
      predicted_yield: baseYields[crop] * adjustment,
      confidence: 0.65,
      model_used: 'fallback_model',
      note: 'Using rule-based estimation'
    };
  }

processPredictions(predictions, weatherData, city) {
  const recommendations = [];
  
  for (const [crop, prediction] of Object.entries(predictions)) {
    // ✅ FIX: Check if prediction exists
    let currentPrediction = prediction;
    
    if (!currentPrediction || !currentPrediction.predicted_yield) {
      console.warn(`⚠️ No prediction available for ${crop}, using fallback`);
      currentPrediction = this.getFallbackPrediction(crop, weatherData);
      predictions[crop] = currentPrediction; // Update the predictions object
    }
    
    // ✅ FIX: Check if prediction has required properties
    const score = this.calculateCropScore(crop, currentPrediction, weatherData);
    
    // ✅ FIX: Safely check model_used property
    let predictionSource = 'Rule-based';
    let mlModelUsed = 'fallback_model';
    
    if (currentPrediction.model_used) {
      if (typeof currentPrediction.model_used === 'string') {
        mlModelUsed = currentPrediction.model_used;
        predictionSource = currentPrediction.model_used.includes('fallback') 
          ? 'Rule-based' 
          : 'AI Model';
      }
    }
    
    recommendations.push({
      cropKey: crop,
      crop: this.getCropName(crop),
      score: score,
      suitability: this.getSuitabilityLevel(score),
      predictionSource: predictionSource,
      mlModelUsed: mlModelUsed,
      advantages: this.getAdvantages(crop, weatherData),
      issues: this.getIssues(crop, weatherData),
      recommendation: this.generateRecommendations(crop, currentPrediction, weatherData),
      metrics: {
        ml_predicted_yield: currentPrediction.predicted_yield || 0,
        ml_confidence: currentPrediction.confidence || 0.65,
        predicted_yield_units: 'tons/ha'
      },
      plantingWindow: this.getPlantingWindow(crop),
      riskFactors: this.assessRisks(crop, weatherData),
      historicalYield: this.getHistoricalYield(city, crop),
      mlSuccess: currentPrediction.model_used && !currentPrediction.model_used.includes('fallback')
    });
  }
  
  return recommendations.sort((a, b) => b.score - a.score);
}

  calculateCropScore(crop, prediction, weatherData) {
    let score = 70; // Base score
    
    // ✅ FIX: Check if prediction exists and has required properties
    if (!prediction) {
        return 50; // Default score if no prediction
    }
    
    // Adjust based on ML prediction confidence
    if (prediction.confidence && prediction.confidence > 0.8) {
        score += 15;
    } else if (prediction.confidence && prediction.confidence > 0.6) {
        score += 5;
    } else if (prediction.confidence && prediction.confidence < 0.4) {
        score -= 10;
    }
    
    // Adjust based on predicted yield vs historical
    const historicalAvg = this.getHistoricalAverage(crop);
    const yieldValue = prediction.predicted_yield || historicalAvg;
    const yieldRatio = yieldValue / historicalAvg;
    
    if (yieldRatio > 1.2) {
        score += 15;
    } else if (yieldRatio > 1.1) {
        score += 10;
    } else if (yieldRatio < 0.8) {
        score -= 15;
    } else if (yieldRatio < 0.9) {
        score -= 10;
    }
    
    // Weather-based adjustments
    if (weatherData && weatherData.length > 0) {
        const avgTemp = weatherData.reduce((sum, day) => sum + day.T2M, 0) / weatherData.length;
        const tempRanges = {
        cotton: [20, 35],
        wheat: [10, 25],
        maize: [18, 32],
        rice: [22, 35],
        sugarcane: [20, 35]
        };
        
        const [minTemp, maxTemp] = tempRanges[crop] || [15, 30];
        
        if (avgTemp >= minTemp && avgTemp <= maxTemp) {
        score += 10;
        } else {
        score -= Math.abs(avgTemp - (minTemp + maxTemp) / 2) * 2;
        }
    }
    
    return Math.max(0, Math.min(100, score));
    }

  getCropName(key) {
    const names = {
      cotton: 'Cotton',
      wheat: 'Wheat',
      maize: 'Maize',
      rice: 'Rice',
      sugarcane: 'Sugarcane'
    };
    return names[key] || key.charAt(0).toUpperCase() + key.slice(1);
  }

  getSuitabilityLevel(score) {
    if (score >= 85) return 'Excellent';
    if (score >= 70) return 'Good';
    if (score >= 55) return 'Moderate';
    if (score >= 40) return 'Marginal';
    return 'Poor';
  }

  getHistoricalAverage(crop) {
    const averages = {
      cotton: 4.3,
      wheat: 3.2,
      maize: 5.1,
      rice: 2.8,
      sugarcane: 65.0
    };
    return averages[crop] || 3.0;
  }

  getHistoricalYield(city, crop) {
    const cityYields = {
      'Sargodha': { cotton: 4.1, wheat: 3.8, maize: 5.2, rice: 2.9, sugarcane: 68.0 },
      'Lahore': { cotton: 3.9, wheat: 4.1, maize: 5.5, rice: 3.2, sugarcane: 72.0 },
      'Multan': { cotton: 4.3, wheat: 3.5, maize: 4.8, rice: 2.7, sugarcane: 65.0 },
      'Bahawalpur': { cotton: 4.2, wheat: 3.3, maize: 4.6, rice: 2.5, sugarcane: 63.0 },
      'Faisalabad': { cotton: 4.0, wheat: 3.9, maize: 5.3, rice: 3.0, sugarcane: 70.0 },
      'Gujrat': { cotton: 3.8, wheat: 4.0, maize: 5.4, rice: 3.1, sugarcane: 71.0 }
    };
    
    return cityYields[city]?.[crop] || this.getHistoricalAverage(crop);
  }

  getPlantingWindow(crop) {
    const windows = {
      cotton: 'March - April',
      wheat: 'October - November',
      maize: 'June - July',
      rice: 'May - June',
      sugarcane: 'February - March or September - October'
    };
    return windows[crop] || 'Varies by region';
  }

  getAdvantages(crop, weatherData) {
    const advantages = [];
    const avgTemp = weatherData.reduce((sum, day) => sum + day.T2M, 0) / weatherData.length;
    const totalRain = weatherData.reduce((sum, day) => sum + day.PRECTOTCORR, 0);
    
    if (totalRain > 15) advantages.push('Adequate rainfall expected');
    if (avgTemp > 20 && avgTemp < 30) advantages.push('Optimal temperature range');
    
    // Crop-specific advantages
    if (crop === 'rice' && totalRain > 20) advantages.push('Sufficient water for paddy cultivation');
    if (crop === 'wheat' && avgTemp < 25) advantages.push('Cool conditions ideal for wheat');
    if (crop === 'cotton' && avgTemp > 25) advantages.push('Warm conditions favor cotton growth');
    
    return advantages.slice(0, 3);
  }

  getIssues(crop, weatherData) {
    const issues = [];
    const heatStressDays = weatherData.filter(day => day.T2M_MAX > 35).length;
    const dryDays = weatherData.filter(day => day.PRECTOTCORR < 0.1).length;
    const totalRain = weatherData.reduce((sum, day) => sum + day.PRECTOTCORR, 0);
    
    if (heatStressDays > 2) issues.push('Potential heat stress periods');
    if (dryDays > 5 && crop !== 'cotton') issues.push('Extended dry spell expected');
    if (totalRain > 25 && crop !== 'rice') issues.push('Excessive rainfall may affect growth');
    
    return issues.slice(0, 2);
  }

  generateRecommendations(crop, prediction, weatherData) {
    const recommendations = [];
    
    // ✅ FIX: Check if prediction exists
    if (prediction && prediction.recommendation) {
        if (prediction.recommendation.primary_advice) {
        recommendations.push(prediction.recommendation.primary_advice);
        }
        if (prediction.recommendation.weather_considerations) {
        recommendations.push(...prediction.recommendation.weather_considerations.slice(0, 2));
        }
    }
    
    // Weather-based recommendations (only if we have weather data)
    if (weatherData && weatherData.length > 0) {
        const totalRain = weatherData.reduce((sum, day) => sum + day.PRECTOTCORR, 0);
        const heatStressDays = weatherData.filter(day => day.T2M_MAX > 35).length;
        
        if (heatStressDays > 0) {
        recommendations.push('Provide irrigation during peak heat hours');
        }
        
        if (totalRain > 25) {
        recommendations.push('Ensure proper drainage system');
        }
        
        if (totalRain < 10) {
        recommendations.push('Schedule irrigation carefully');
        }
    }
    
    // Crop-specific recommendations
    if (crop === 'rice') {
        recommendations.push('Maintain proper water level in fields');
    }
    if (crop === 'cotton') {
        recommendations.push('Monitor for pest infestations regularly');
    }
    
    // General recommendations
    recommendations.push('Test soil nutrients before fertilization');
    recommendations.push('Follow recommended planting dates for your region');
    
    return recommendations.slice(0, 4);
    }

  assessRisks(crop, weatherData) {
    const risks = [];
    const avgTemp = weatherData.reduce((sum, day) => sum + day.T2M, 0) / weatherData.length;
    const totalRain = weatherData.reduce((sum, day) => sum + day.PRECTOTCORR, 0);
    
    if (totalRain > 50) {
      risks.push('Waterlogging risk - ensure drainage');
    }
    
    if (avgTemp > 35) {
      risks.push('Heat stress risk - provide shade/irrigation');
    }
    
    if (totalRain < 10 && crop !== 'cotton') {
      risks.push('Drought risk - plan irrigation');
    }
    
    return risks;
  }
}

module.exports = new PredictionService();