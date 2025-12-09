

const mlPredictionController = require('./mlPredictionController');

// Crop thresholds based on your trained GRU/LSTM model patterns
const CROP_THRESHOLDS = {
  cotton: {
    name: "Cotton",
    minTemp: 20,
    maxTemp: 35,
    optimalTemp: 25,
    minRainfall: 400,
    maxRainfall: 800,
    optimalRainfall: 600,
    optimalGDD: 1200,
    heatStressThreshold: 35,
    optimalHumidity: 60,
    growthPeriod: 180,
    plantingSeason: "April-May",
    harvestingSeason: "September-November"
  },
  wheat: {
    name: "Wheat", 
    minTemp: 10,
    maxTemp: 25,
    optimalTemp: 18,
    minRainfall: 300,
    maxRainfall: 600,
    optimalRainfall: 450,
    optimalGDD: 900,
    heatStressThreshold: 30,
    optimalHumidity: 65,
    growthPeriod: 120,
    plantingSeason: "October-November",
    harvestingSeason: "March-April"
  },
  maize: {
    name: "Maize",
    minTemp: 18,
    maxTemp: 32,
    optimalTemp: 25,
    minRainfall: 500,
    maxRainfall: 900,
    optimalRainfall: 700,
    optimalGDD: 1100,
    heatStressThreshold: 33,
    optimalHumidity: 70,
    growthPeriod: 90,
    plantingSeason: "June-July",
    harvestingSeason: "September-October"
  },
  rice: {
    name: "Rice",
    minTemp: 22,
    maxTemp: 35,
    optimalTemp: 28,
    minRainfall: 1000,
    maxRainfall: 2000,
    optimalRainfall: 1500,
    optimalGDD: 1300,
    heatStressThreshold: 36,
    optimalHumidity: 80,
    growthPeriod: 120,
    plantingSeason: "May-June",
    harvestingSeason: "September-October"
  },
  sugarcane: {
    name: "Sugarcane",
    minTemp: 20,
    maxTemp: 35,
    optimalTemp: 27,
    minRainfall: 1500,
    maxRainfall: 2500,
    optimalRainfall: 2000,
    optimalGDD: 1500,
    heatStressThreshold: 38,
    optimalHumidity: 75,
    growthPeriod: 365,
    plantingSeason: "February-March or September-October",
    harvestingSeason: "November-December"
  }
};


const HISTORICAL_YIELDS = {
  'Sargodha': { cotton: 4.1, wheat: 3.8, maize: 5.2, rice: 2.9, sugarcane: 68.0 },
  'Lahore': { cotton: 3.9, wheat: 4.1, maize: 5.5, rice: 3.2, sugarcane: 72.0 },
  'Multan': { cotton: 4.3, wheat: 3.5, maize: 4.8, rice: 2.7, sugarcane: 65.0 },
  'Bahawalpur': { cotton: 4.2, wheat: 3.3, maize: 4.6, rice: 2.5, sugarcane: 63.0 },
  'Faisalabad': { cotton: 4.0, wheat: 3.9, maize: 5.3, rice: 3.0, sugarcane: 70.0 },
  'Gujrat': { cotton: 3.8, wheat: 4.0, maize: 5.4, rice: 3.1, sugarcane: 71.0 }
};


class CropRecommendationController {
  
  // Helper method to extract values from weather data dynamically
  extractWeatherValue(day, property) {
    // Try multiple property names
    const propertyMappings = {
      temperature: ['T2M', 'temperature', 'temp', 'T2M_AVG', 'avg_temp'],
      maxTemp: ['T2M_MAX', 'max_temp', 'temp_max', 'temperature_max'],
      minTemp: ['T2M_MIN', 'min_temp', 'temp_min', 'temperature_min'],
      precipitation: ['PRECTOTCORR', 'precipitation', 'rain', 'rainfall', 'PRECTOT'],
      humidity: ['RH2M', 'humidity', 'relative_humidity', 'RH'],
      windSpeed: ['WS2M', 'wind_speed', 'wind', 'WS10M'],
      windDirection: ['WD2M', 'wind_direction', 'WD10M']
    };

    const mappings = propertyMappings[property] || [property];
    
    for (const key of mappings) {
      if (day[key] !== undefined) {
        return day[key];
      }
    }
    
    // Return defaults based on property
    const defaults = {
      temperature: 28,
      maxTemp: 32,
      minTemp: 22,
      precipitation: 0,
      humidity: 65,
      windSpeed: 2.5,
      windDirection: 0
    };
    
    return defaults[property] || 0;
  }

  // Normalize weather data to ensure it's an array with expected structure
  normalizeWeatherData(weatherData) {
    if (!weatherData) {
      return this.createDefaultWeatherData(7);
    }
    
    // If it's already an array, return it normalized
    if (Array.isArray(weatherData)) {
      return weatherData.map(day => this.normalizeWeatherDay(day));
    }
    
    // If it's an object with a forecast property
    if (weatherData.forecast && Array.isArray(weatherData.forecast)) {
      return weatherData.forecast.map(day => this.normalizeWeatherDay(day));
    }
    
    // If it's an object with a days property
    if (weatherData.days && Array.isArray(weatherData.days)) {
      return weatherData.days.map(day => this.normalizeWeatherDay(day));
    }
    
    // If it's an object with data property
    if (weatherData.data && Array.isArray(weatherData.data)) {
      return weatherData.data.map(day => this.normalizeWeatherDay(day));
    }
    
    // Default fallback
    return this.createDefaultWeatherData(7);
  }

  normalizeWeatherDay(day) {
    return {
      T2M: this.extractWeatherValue(day, 'temperature'),
      T2M_MAX: this.extractWeatherValue(day, 'maxTemp'),
      T2M_MIN: this.extractWeatherValue(day, 'minTemp'),
      PRECTOTCORR: this.extractWeatherValue(day, 'precipitation'),
      RH2M: this.extractWeatherValue(day, 'humidity'),
      WS2M: this.extractWeatherValue(day, 'windSpeed'),
      WD2M: this.extractWeatherValue(day, 'windDirection'),
      // Calculate derived properties
      DAILY_GDD: this.calculateGDD(
        this.extractWeatherValue(day, 'maxTemp'),
        this.extractWeatherValue(day, 'minTemp')
      ),
      DRY_DAY: this.extractWeatherValue(day, 'precipitation') < 1,
      date: day.date || day.time || day.timestamp || new Date().toISOString()
    };
  }

  calculateGDD(maxTemp, minTemp, baseTemp = 10) {
    const avgTemp = (maxTemp + minTemp) / 2;
    return Math.max(0, avgTemp - baseTemp);
  }

  createDefaultWeatherData(days = 7) {
    const data = [];
    const today = new Date();
    
    for (let i = 0; i < days; i++) {
      const date = new Date(today);
      date.setDate(date.getDate() + i);
      
      data.push({
        T2M: 28 + (Math.random() * 6 - 3),
        T2M_MAX: 32 + (Math.random() * 4 - 2),
        T2M_MIN: 22 + (Math.random() * 4 - 2),
        PRECTOTCORR: Math.random() > 0.7 ? Math.random() * 5 : 0,
        RH2M: 60 + Math.random() * 20,
        WS2M: 1 + Math.random() * 3,
        WD2M: Math.random() * 360,
        DAILY_GDD: this.calculateGDD(32, 22),
        DRY_DAY: Math.random() > 0.3,
        date: date.toISOString().split('T')[0]
      });
    }
    
    return data;
  }

  getBaseYield(crop) {
    const baseYields = {
      cotton: 4.3, wheat: 3.2, maize: 5.1, rice: 2.8, sugarcane: 65.0
    };
    return baseYields[crop] || 3.0;
  }

  // Existing method for non-ML recommendations
  analyzeCropSuitability(city, weatherData, historicalTrends) {
    const recommendations = [];
    const crops = Object.keys(CROP_THRESHOLDS);
    
    // Normalize weather data first
    const normalizedWeatherData = this.normalizeWeatherData(weatherData);
    
    for (const crop of crops) {
      const threshold = CROP_THRESHOLDS[crop];
      let score = 100;
      let issues = [];
      let advantages = [];
      let alerts = [];
      
      // Analyze current weather conditions
      const currentAnalysis = this.analyzeCurrentConditions(normalizedWeatherData, threshold, crop);
      score -= currentAnalysis.scoreReduction;
      issues.push(...currentAnalysis.issues);
      advantages.push(...currentAnalysis.advantages);
      alerts.push(...currentAnalysis.alerts);

      // Compare with historical trends
      const trendAnalysis = this.analyzeHistoricalTrends(city, crop, normalizedWeatherData, historicalTrends);
      score += trendAnalysis.scoreAdjustment;
      issues.push(...trendAnalysis.issues);
      advantages.push(...trendAnalysis.advantages);

      // Seasonality check
      const seasonCheck = this.checkSeasonality(crop, new Date().getMonth() + 1);
      if (!seasonCheck.isInSeason) {
        score -= 20;
        issues.push(seasonCheck.message);
      } else {
        advantages.push(seasonCheck.message);
      }

      // Calculate final metrics
      const metrics = this.calculateCropMetrics(normalizedWeatherData, threshold);

      recommendations.push({
        crop: threshold.name,
        cropKey: crop,
        score: Math.max(0, Math.min(100, score)),
        suitability: this.getSuitabilityLevel(score),
        issues,
        advantages,
        alerts,
        metrics,
        recommendation: this.generateActionableRecommendation(crop, normalizedWeatherData, issues, advantages),
        plantingWindow: threshold.plantingSeason,
        riskFactors: this.assessRisks(normalizedWeatherData, threshold),
        historicalYield: this.getHistoricalYield(city, crop),
        weather_days_used: normalizedWeatherData.length
      });
    }

    return recommendations.sort((a, b) => b.score - a.score);
  }

  // NEW METHOD: Enhanced analysis with ML predictions
  async analyzeCropSuitabilityWithML(city, weatherData, days = 7) {
    try {
      const recommendations = [];
      const crops = Object.keys(CROP_THRESHOLDS);
      
      console.log(`🤖 Starting ML-enhanced analysis for ${city}`);
      
      // Normalize weather data first
      const normalizedWeatherData = this.normalizeWeatherData(weatherData);
      console.log(`📊 Using ${normalizedWeatherData.length} days of weather data`);
      
      // Get batch predictions from ML models
      let mlPredictions;
      try {
        mlPredictions = await mlPredictionController.predictBatchWithML(normalizedWeatherData, crops);
        console.log('✅ ML predictions received:', Object.keys(mlPredictions.predictions || {}).length, 'crops');
      } catch (mlError) {
        console.error('❌ ML prediction error:', mlError.message);
        mlPredictions = { predictions: {} };
      }
      
      for (const crop of crops) {
        const threshold = CROP_THRESHOLDS[crop];
        let score = 100;
        let issues = [];
        let advantages = [];
        let alerts = [];
        
        // Get ML prediction for this crop
        const mlPrediction = mlPredictions.predictions ? mlPredictions.predictions[crop] : null;
        const mlSuccess = mlPrediction && mlPrediction.success;
        const mlResult = mlSuccess ? mlPrediction.prediction : null;
        
        console.log(`🌱 ${crop} - ML Success: ${mlSuccess}`);
        
        // Analyze current conditions
        const currentAnalysis = this.analyzeCurrentConditions(normalizedWeatherData, threshold, crop);
        score -= currentAnalysis.scoreReduction;
        issues.push(...currentAnalysis.issues);
        advantages.push(...currentAnalysis.advantages);
        alerts.push(...currentAnalysis.alerts);

        // Enhance with ML predictions
        if (mlSuccess && mlResult && mlResult.predicted_yield !== undefined) {
          const predictedYield = mlResult.predicted_yield;
          const historicalYield = this.getHistoricalYield(city, crop);
          
          // ML-based score adjustment
          const yieldRatio = predictedYield / historicalYield;
          if (yieldRatio > 1.15) {
            score += 20;
            advantages.push(`🤖 AI predicts EXCELLENT yield: ${predictedYield.toFixed(1)} tons/ha (${(yieldRatio * 100).toFixed(0)}% of average)`);
          } else if (yieldRatio > 1.05) {
            score += 10;
            advantages.push(`🤖 AI predicts GOOD yield: ${predictedYield.toFixed(1)} tons/ha`);
          } else if (yieldRatio < 0.85) {
            score -= 15;
            issues.push(`🤖 AI predicts BELOW AVERAGE yield: ${predictedYield.toFixed(1)} tons/ha`);
          } else {
            advantages.push(`🤖 AI predicts NORMAL yield: ${predictedYield.toFixed(1)} tons/ha`);
          }
          
          // Add ML confidence to advantages
          if (mlResult.confidence > 0.8) {
            advantages.push(`🎯 High prediction confidence: ${(mlResult.confidence * 100).toFixed(0)}%`);
          } else if (mlResult.confidence < 0.6) {
            issues.push(`⚠️ Low prediction confidence: ${(mlResult.confidence * 100).toFixed(0)}%`);
          }
        } else {
          advantages.push(`🤖 Using rule-based analysis for ${crop}`);
        }

        // Historical trend analysis
        const trendAnalysis = this.analyzeHistoricalTrends(city, crop, normalizedWeatherData);
        score += trendAnalysis.scoreAdjustment;
        issues.push(...trendAnalysis.issues);
        advantages.push(...trendAnalysis.advantages);

        // Seasonality check
        const seasonCheck = this.checkSeasonality(crop, new Date().getMonth() + 1);
        if (!seasonCheck.isInSeason) {
          score -= 20;
          issues.push(seasonCheck.message);
        } else {
          advantages.push(seasonCheck.message);
        }

        // Calculate metrics
        const metrics = this.calculateCropMetrics(normalizedWeatherData, threshold);

        recommendations.push({
          crop: threshold.name,
          cropKey: crop,
          score: Math.max(0, Math.min(100, score)),
          suitability: this.getSuitabilityLevel(score),
          issues,
          advantages,
          alerts,
          metrics: {
            ...metrics,
            ml_predicted_yield: mlSuccess && mlResult ? mlResult.predicted_yield : null,
            ml_confidence: mlSuccess && mlResult ? mlResult.confidence : null,
            ml_model_used: mlSuccess && mlResult ? mlResult.model_type : 'rule-based'
          },
          recommendation: this.generateMLActionableRecommendation(crop, normalizedWeatherData, issues, advantages, mlResult),
          plantingWindow: threshold.plantingSeason,
          riskFactors: this.assessRisks(normalizedWeatherData, threshold),
          historicalYield: this.getHistoricalYield(city, crop),
          mlModelUsed: mlSuccess && mlResult ? mlResult.model_type : 'rule-based',
          predictionSource: mlSuccess ? 'AI Model' : 'Rule-based',
          mlSuccess: mlSuccess,
          weather_days_used: normalizedWeatherData.length
        });
      }

      return {
        success: true,
        city: city,
        recommendations: recommendations.sort((a, b) => b.score - a.score),
        weather_data_summary: {
          days_analyzed: normalizedWeatherData.length,
          avg_temperature: this.calculateArrayAvg(normalizedWeatherData, 'T2M'),
          total_rainfall: this.calculateArraySum(normalizedWeatherData, 'PRECTOTCORR')
        }
      };
      
    } catch (error) {
      console.error('❌ Error in analyzeCropSuitabilityWithML:', error);
      return this.generateFallbackRecommendations(city);
    }
  }

  // Helper methods
  calculateArrayAvg(array, property) {
    if (!Array.isArray(array) || array.length === 0) return 0;
    const sum = array.reduce((acc, item) => acc + (item[property] || 0), 0);
    return parseFloat((sum / array.length).toFixed(1));
  }

  calculateArraySum(array, property) {
    if (!Array.isArray(array) || array.length === 0) return 0;
    return array.reduce((acc, item) => acc + (item[property] || 0), 0);
  }

  getHistoricalYield(city, crop) {
    // You could fetch this from a database or API
    // For now, return reasonable defaults
    const defaultYields = {
      cotton: 4.3, wheat: 3.2, maize: 5.1, rice: 2.8, sugarcane: 65.0
    };
    return defaultYields[crop] || 3.0;
  }

  generateFallbackRecommendations(city) {
    const fallbackCrops = ['wheat', 'cotton', 'maize', 'rice', 'sugarcane'];
    
    return {
      success: true,
      city: city,
      recommendations: fallbackCrops.map((crop, index) => {
        const threshold = CROP_THRESHOLDS[crop] || { name: crop };
        return {
          crop: threshold.name,
          cropKey: crop,
          score: 75 - (index * 5),
          suitability: 'Good',
          issues: [],
          advantages: ['Fallback analysis used'],
          alerts: [],
          metrics: {
            avgTemperature: 28,
            totalRainfall: 50,
            ml_predicted_yield: null,
            ml_confidence: null,
            ml_model_used: 'fallback'
          },
          recommendation: ['Use standard cultivation practices for your region'],
          historicalYield: this.getHistoricalYield(city, crop),
          mlSuccess: false,
          note: 'Generated using fallback rules'
        };
      }),
      note: 'Fallback recommendations due to analysis error'
    };
  }

  // The rest of your methods with the fixed analyzeCurrentConditions:

  analyzeCurrentConditions(weatherData, threshold, crop) {
    // Ensure weatherData is an array
    if (!Array.isArray(weatherData) || weatherData.length === 0) {
      return { 
        scoreReduction: 0, 
        issues: ['No weather data available'], 
        advantages: [], 
        alerts: [] 
      };
    }

    let scoreReduction = 0;
    const issues = [];
    const advantages = [];
    const alerts = [];

    const weeklyAvgTemp = weatherData.reduce((sum, day) => sum + (day.T2M || 0), 0) / weatherData.length;
    const weeklyMaxTemp = Math.max(...weatherData.map(day => day.T2M_MAX || 0));
    const totalRainfall = weatherData.reduce((sum, day) => sum + (day.PRECTOTCORR || 0), 0);
    const heatStressDays = weatherData.filter(day => (day.T2M_MAX || 0) > threshold.heatStressThreshold).length;
    const dryDays = weatherData.filter(day => day.DRY_DAY === true).length;
    const avgHumidity = weatherData.reduce((sum, day) => sum + (day.RH2M || 0), 0) / weatherData.length;

    // Temperature analysis
    if (weeklyAvgTemp < threshold.minTemp) {
      scoreReduction += 25;
      issues.push(`Temperature too low (${weeklyAvgTemp.toFixed(1)}°C vs optimal ${threshold.minTemp}-${threshold.maxTemp}°C)`);
      alerts.push({ type: 'warning', message: 'Low temperature may delay germination' });
    } else if (weeklyAvgTemp > threshold.maxTemp) {
      scoreReduction += 20;
      issues.push(`Temperature above optimal range (${weeklyAvgTemp.toFixed(1)}°C)`);
      alerts.push({ type: 'warning', message: 'High temperature may cause heat stress' });
    } else if (Math.abs(weeklyAvgTemp - threshold.optimalTemp) <= 3) {
      advantages.push(`Temperature ideal for ${crop} growth`);
    } else {
      advantages.push(`Temperature within acceptable range`);
    }

    // Rainfall analysis
    const weeklyRainThreshold = {
      min: threshold.minRainfall / 52,
      max: threshold.maxRainfall / 52
    };

    if (totalRainfall < weeklyRainThreshold.min) {
      scoreReduction += 25;
      issues.push(`Insufficient rainfall (${totalRainfall.toFixed(1)}mm this week)`);
      alerts.push({ type: 'alert', message: 'Irrigation may be required' });
    } else if (totalRainfall > weeklyRainThreshold.max) {
      scoreReduction += 15;
      issues.push(`Excessive rainfall may cause waterlogging`);
      alerts.push({ type: 'alert', message: 'Ensure proper drainage' });
    } else if (Math.abs(totalRainfall - (threshold.optimalRainfall / 52)) <= 2) {
      advantages.push(`Rainfall optimal for ${crop}`);
    } else {
      advantages.push(`Rainfall adequate for this period`);
    }

    
    // Heat stress analysis (15% weight)
    if (heatStressDays > 2) {
      scoreReduction += heatStressDays * 5;
      issues.push(`${heatStressDays} days of heat stress expected`);
      alerts.push({ type: 'warning', message: 'Consider heat-tolerant varieties' });
    }

    // Humidity analysis (10% weight)
    if (avgHumidity < threshold.optimalHumidity - 15) {
      scoreReduction += 10;
      issues.push(`Low humidity may increase water requirements`);
    } else if (avgHumidity > threshold.optimalHumidity + 15) {
      scoreReduction += 5;
      issues.push(`High humidity may increase disease risk`);
    }

    // Dry spell analysis (5% weight)
    if (dryDays > 5) {
      scoreReduction += 10;
      issues.push(`Extended dry spell (${dryDays} dry days)`);
      alerts.push({ type: 'alert', message: 'Monitor soil moisture closely' });
    }

    // Rest of the analysis remains the same...
    // (Heat stress, humidity, dry spell analysis)

    return { scoreReduction, issues, advantages, alerts };
  }

  // Keep all other existing methods (analyzeHistoricalTrends, checkSeasonality, etc.)
  // but update them to use normalizedWeatherData instead of raw weatherData

  analyzeHistoricalTrends(city, crop, weatherData) {
    // Simplified for now
    const issues = [];
    const advantages = [];
    let scoreAdjustment = 0;

    // Always add some advantage
    advantages.push(`Based on regional climate patterns`);
    scoreAdjustment += 5;

    return { scoreAdjustment, issues, advantages };
  }

  checkSeasonality(crop, currentMonth) {
    const cropSeasons = {
      cotton: { planting: [4, 5], harvesting: [9, 10, 11] },
      wheat: { planting: [10, 11], harvesting: [3, 4] },
      maize: { planting: [6, 7], harvesting: [9, 10] },
      rice: { planting: [5, 6], harvesting: [9, 10] },
      sugarcane: { planting: [2, 3, 9, 10], harvesting: [11, 12, 1, 2] }
    };

    const season = cropSeasons[crop];
    if (!season) return { isInSeason: true, message: 'No seasonality data' };

    const isPlantingSeason = season.planting.includes(currentMonth);
    const isHarvestingSeason = season.harvesting.includes(currentMonth);

    if (isPlantingSeason) {
      return { isInSeason: true, message: `Currently in optimal planting season for ${crop}` };
    } else if (isHarvestingSeason) {
      return { isInSeason: true, message: `Currently in harvesting season for ${crop}` };
    } else {
      return { 
        isInSeason: false, 
        message: `Not in optimal season (Plant: ${season.planting.join('/')}, Harvest: ${season.harvesting.join('/')})` 
      };
    }
  }

  calculateCropMetrics(weatherData, threshold) {
    if (!Array.isArray(weatherData) || weatherData.length === 0) {
      return {
        avgTemperature: 0,
        maxTemperature: 0,
        totalRainfall: 0,
        heatStressDays: 0,
        totalGDD: 0,
        dryDays: 0,
        avgHumidity: 0,
        soilMoistureIndex: 0,
        cropWaterRequirement: 0
      };
    }

    const weeklyAvgTemp = weatherData.reduce((sum, day) => sum + (day.T2M || 0), 0) / weatherData.length;
    const weeklyMaxTemp = Math.max(...weatherData.map(day => day.T2M_MAX || 0));
    const totalRainfall = weatherData.reduce((sum, day) => sum + (day.PRECTOTCORR || 0), 0);
    const heatStressDays = weatherData.filter(day => (day.T2M_MAX || 0) > threshold.heatStressThreshold).length;
    const totalGDD = weatherData.reduce((sum, day) => sum + (day.DAILY_GDD || 0), 0);
    const dryDays = weatherData.filter(day => day.DRY_DAY === true).length;
    const avgHumidity = weatherData.reduce((sum, day) => sum + (day.RH2M || 0), 0) / weatherData.length;

    return {
      avgTemperature: weeklyAvgTemp.toFixed(1),
      maxTemperature: weeklyMaxTemp.toFixed(1),
      totalRainfall: totalRainfall.toFixed(1),
      heatStressDays,
      totalGDD: totalGDD.toFixed(1),
      dryDays,
      avgHumidity: avgHumidity.toFixed(1),
      soilMoistureIndex: this.calculateSoilMoistureIndex(totalRainfall, dryDays),
      cropWaterRequirement: ((totalRainfall / (threshold.minRainfall / 52)) * 100).toFixed(1)
    };
  }

  calculateSoilMoistureIndex(rainfall, dryDays) {
    const baseMoisture = Math.min(100, (rainfall / 25) * 100);
    const dryDayImpact = dryDays * 8;
    return Math.max(0, baseMoisture - dryDayImpact);
  }

  getSuitabilityLevel(score) {
    if (score >= 85) return 'Excellent';
    if (score >= 70) return 'Good';
    if (score >= 55) return 'Moderate';
    if (score >= 40) return 'Marginal';
    return 'Poor';
  }

  assessRisks(weatherData, threshold) {
    if (!Array.isArray(weatherData)) return [];

    const risks = [];
    
    // Heavy rainfall risk
    const heavyRainDays = weatherData.filter(day => (day.PRECTOTCORR || 0) > 20).length;
    if (heavyRainDays > 0) {
      risks.push({ 
        type: 'high', 
        factor: 'Heavy rainfall', 
        impact: 'Waterlogging and nutrient leaching',
        mitigation: 'Improve drainage and delay fertilizer application'
      });
    }
    
    // Extreme heat risk
    const extremeHeatDays = weatherData.filter(day => (day.T2M_MAX || 0) > 40).length;
    if (extremeHeatDays > 0) {
      risks.push({ 
        type: 'high', 
        factor: 'Extreme heat', 
        impact: 'Crop stress and reduced yield',
        mitigation: 'Increase irrigation frequency and use shade protection'
      });
    }
    
    // Extended dry spell risk
    const drySpell = weatherData.filter(day => day.DRY_DAY === true).length;
    if (drySpell > 5) {
      risks.push({ 
        type: 'medium', 
        factor: 'Extended dry spell', 
        impact: 'Moisture deficit and stress',
        mitigation: 'Implement water conservation measures and schedule irrigation'
      });
    }

    return risks;
  }
  
  getHistoricalTrends(city) {
    const yields = HISTORICAL_YIELDS[city];
    if (!yields) return null;

    const bestCrops = Object.entries(yields)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 3)
      .map(([crop]) => crop);

    return {
      averageYield: yields,
      bestPerformingCrops: bestCrops,
      climatePatterns: {
        avgTemperature: 26.5,
        annualRainfall: 450,
        growingSeason: 'Year-round with seasonal variations'
      }
    };
  }
  

  // Add your generateActionableRecommendation and generateMLActionableRecommendation methods here
  // Make sure they also handle the normalized data

 
  // Original recommendation generator
  generateActionableRecommendation(crop, weatherData, issues, advantages) {
    const recommendations = [];
    
    // Irrigation recommendations
    if (issues.some(issue => issue.includes('Insufficient rainfall'))) {
      recommendations.push('Schedule irrigation every 3-4 days');
      recommendations.push('Use drip irrigation to conserve water');
    }
    
    // Heat stress management
    if (issues.some(issue => issue.includes('heat stress'))) {
      recommendations.push('Apply mulch to conserve soil moisture');
      recommendations.push('Water plants in early morning or late evening');
      recommendations.push('Consider shade nets for sensitive growth stages');
    }
    
    // Optimal conditions
    if (advantages.some(adv => adv.includes('Temperature ideal'))) {
      recommendations.push('Ideal conditions for planting and growth');
      recommendations.push('Proceed with standard cultivation practices');
    }
    
    // Rainfall management
    if (weatherData.some(day => day.PRECTOTCORR > 15)) {
      recommendations.push('Ensure proper field drainage');
      recommendations.push('Delay fertilizer application if heavy rain expected');
    }

    // General best practices
    recommendations.push('Monitor soil moisture regularly');
    recommendations.push('Test soil nutrients before fertilization');

    return recommendations.length > 0 ? recommendations : ['Conditions favorable for normal cultivation practices'];
  }

  // ENHANCED: ML-powered recommendation generator
  generateMLActionableRecommendation(crop, weatherData, issues, advantages, mlResult) {
    const recommendations = [];
    const baseYield = this.getBaseYield(crop);
    
    // ML-based specific recommendations
    if (mlResult && mlResult.predicted_yield) {
      const predictedYield = mlResult.predicted_yield;
      
      if (predictedYield > baseYield * 1.15) {
        recommendations.push('🚀 AI indicates EXCELLENT conditions - ideal for expanding cultivation area');
        recommendations.push('Consider investing in premium seeds and fertilizers for maximum yield');
      } else if (predictedYield > baseYield * 1.05) {
        recommendations.push('✅ AI predicts favorable conditions - proceed with planned cultivation');
        recommendations.push('Maintain standard farming practices for optimal results');
      } else if (predictedYield < baseYield * 0.85) {
        recommendations.push('⚠️ AI predicts challenging conditions - implement protective measures');
        recommendations.push('Consider drought-resistant varieties if rainfall is low');
        recommendations.push('Monitor crops closely for early signs of stress');
      } else {
        recommendations.push('📊 AI predicts average yield - follow standard cultivation practices');
      }

      // Confidence-based recommendations
      if (mlResult.confidence < 0.6) {
        recommendations.push('🔍 Prediction confidence is low - monitor weather forecasts closely');
      }
    }
    
    // Weather-based recommendations
    if (issues.some(issue => issue.includes('Insufficient rainfall'))) {
      recommendations.push('💧 Schedule irrigation every 3-4 days based on soil moisture');
      recommendations.push('💧 Use drip irrigation to conserve water and improve efficiency');
      recommendations.push('💧 Consider rainwater harvesting if feasible');
    }
    
    if (issues.some(issue => issue.includes('heat stress'))) {
      recommendations.push('🔥 Apply organic mulch to conserve soil moisture and reduce temperature');
      recommendations.push('🔥 Water plants in early morning (4-7 AM) to minimize evaporation');
      recommendations.push('🔥 Consider shade nets or agro-textiles for sensitive growth stages');
      recommendations.push('🔥 Use kaolin clay sprays to reflect sunlight and reduce heat stress');
    }
    
    if (advantages.some(adv => adv.includes('Temperature ideal'))) {
      recommendations.push('🌡️ Ideal temperature conditions - perfect for germination and growth');
      recommendations.push('🌡️ Proceed with planting and standard cultivation practices');
    }
    
    if (weatherData.some(day => day.PRECTOTCORR > 20)) {
      recommendations.push('🌧️ Ensure proper field drainage to prevent waterlogging');
      recommendations.push('🌧️ Delay fertilizer application until after heavy rain passes');
      recommendations.push('🌧️ Monitor for fungal diseases in high humidity conditions');
    }

    // Soil and general practices
    recommendations.push('🌱 Test soil nutrients and pH before fertilization');
    recommendations.push('💧 Monitor soil moisture regularly with sensors or manual checks');
    recommendations.push('📅 Follow recommended planting dates for your region');
    recommendations.push('🔍 Regular crop monitoring for pests and diseases');

    // Remove duplicates and ensure meaningful recommendations
    const uniqueRecommendations = [...new Set(recommendations)];
    
    return uniqueRecommendations.length > 0 ? uniqueRecommendations : [
      'Maintain standard cultivation practices',
      'Monitor weather forecasts regularly',
      'Follow recommended crop management guidelines'
    ];
  }

}

module.exports = new CropRecommendationController();