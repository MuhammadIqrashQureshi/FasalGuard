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

// Historical yield data based on your training data
const HISTORICAL_YIELDS = {
  'Sargodha': { cotton: 4.1, wheat: 3.8, maize: 5.2, rice: 2.9, sugarcane: 68.0 },
  'Lahore': { cotton: 3.9, wheat: 4.1, maize: 5.5, rice: 3.2, sugarcane: 72.0 },
  'Multan': { cotton: 4.3, wheat: 3.5, maize: 4.8, rice: 2.7, sugarcane: 65.0 },
  'Bahawalpur': { cotton: 4.2, wheat: 3.3, maize: 4.6, rice: 2.5, sugarcane: 63.0 },
  'Faisalabad': { cotton: 4.0, wheat: 3.9, maize: 5.3, rice: 3.0, sugarcane: 70.0 },
  'Gujrat': { cotton: 3.8, wheat: 4.0, maize: 5.4, rice: 3.1, sugarcane: 71.0 }
};

class CropRecommendationController {
  
  // Existing method for non-ML recommendations
  analyzeCropSuitability(city, weatherData, historicalTrends) {
    const recommendations = [];
    const crops = Object.keys(CROP_THRESHOLDS);
    
    for (const crop of crops) {
      const threshold = CROP_THRESHOLDS[crop];
      let score = 100;
      let issues = [];
      let advantages = [];
      let alerts = [];
      
      // Analyze current weather conditions
      const currentAnalysis = this.analyzeCurrentConditions(weatherData, threshold, crop);
      score -= currentAnalysis.scoreReduction;
      issues.push(...currentAnalysis.issues);
      advantages.push(...currentAnalysis.advantages);
      alerts.push(...currentAnalysis.alerts);

      // Compare with historical trends
      const trendAnalysis = this.analyzeHistoricalTrends(city, crop, weatherData, historicalTrends);
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
      const metrics = this.calculateCropMetrics(weatherData, threshold);

      recommendations.push({
        crop: threshold.name,
        cropKey: crop,
        score: Math.max(0, Math.min(100, score)),
        suitability: this.getSuitabilityLevel(score),
        issues,
        advantages,
        alerts,
        metrics,
        recommendation: this.generateActionableRecommendation(crop, weatherData, issues, advantages),
        plantingWindow: threshold.plantingSeason,
        riskFactors: this.assessRisks(weatherData, threshold),
        historicalYield: HISTORICAL_YIELDS[city]?.[crop] || 'N/A'
      });
    }

    return recommendations.sort((a, b) => b.score - a.score);
  }

  // NEW METHOD: Enhanced analysis with ML predictions
  async analyzeCropSuitabilityWithML(city, weatherData, historicalTrends) {
    const recommendations = [];
    const crops = Object.keys(CROP_THRESHOLDS);
    
    console.log(`🤖 Starting ML-enhanced analysis for ${city} with ${weatherData.length} days data`);
    
    // Get batch predictions from ML models
    const mlPredictions = await mlPredictionController.predictBatchWithML(weatherData, crops);
    
    for (const crop of crops) {
      const threshold = CROP_THRESHOLDS[crop];
      let score = 100;
      let issues = [];
      let advantages = [];
      let alerts = [];
      
      // Get ML prediction for this crop
      const mlPrediction = mlPredictions.predictions[crop];
      const mlSuccess = mlPrediction && mlPrediction.success;
      const mlResult = mlSuccess ? mlPrediction.prediction : null;
      
      console.log(`🌱 ${crop} - ML Success: ${mlSuccess}, Source: ${mlPrediction?.source}`);
      
      // Analyze current conditions
      const currentAnalysis = this.analyzeCurrentConditions(weatherData, threshold, crop);
      score -= currentAnalysis.scoreReduction;
      issues.push(...currentAnalysis.issues);
      advantages.push(...currentAnalysis.advantages);
      alerts.push(...currentAnalysis.alerts);

      // Enhance with ML predictions
      if (mlSuccess && mlResult && mlResult.predicted_yield) {
        const predictedYield = mlResult.predicted_yield;
        const historicalYield = HISTORICAL_YIELDS[city]?.[crop] || this.getBaseYield(crop);
        
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
        issues.push(`🤖 AI prediction unavailable for ${crop}`);
      }

      // Historical trend analysis
      const trendAnalysis = this.analyzeHistoricalTrends(city, crop, weatherData, historicalTrends);
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
      const metrics = this.calculateCropMetrics(weatherData, threshold);

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
          ml_predicted_yield: mlSuccess ? mlResult.predicted_yield : null,
          ml_confidence: mlSuccess ? mlResult.confidence : null,
          ml_model_used: mlSuccess ? mlResult.model_type : 'Not available'
        },
        recommendation: this.generateMLActionableRecommendation(crop, weatherData, issues, advantages, mlResult),
        plantingWindow: threshold.plantingSeason,
        riskFactors: this.assessRisks(weatherData, threshold),
        historicalYield: HISTORICAL_YIELDS[city]?.[crop] || 'N/A',
        mlModelUsed: mlSuccess ? mlResult.model_type : 'fallback',
        predictionSource: mlSuccess ? 'AI Model' : 'Rule-based',
        mlSuccess: mlSuccess
      });
    }

    return recommendations.sort((a, b) => b.score - a.score);
  }

  // Helper method for base yields
  getBaseYield(crop) {
    const baseYields = {
      cotton: 4.3, wheat: 3.2, maize: 5.1, rice: 2.8, sugarcane: 65.0
    };
    return baseYields[crop] || 3.0;
  }

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

  // Existing analysis methods (keep all your existing methods below)

  analyzeCurrentConditions(weatherData, threshold, crop) {
    let scoreReduction = 0;
    const issues = [];
    const advantages = [];
    const alerts = [];

    const weeklyAvgTemp = weatherData.reduce((sum, day) => sum + day.T2M, 0) / weatherData.length;
    const weeklyMaxTemp = Math.max(...weatherData.map(day => day.T2M_MAX));
    const totalRainfall = weatherData.reduce((sum, day) => sum + day.PRECTOTCORR, 0);
    const heatStressDays = weatherData.filter(day => day.T2M_MAX > threshold.heatStressThreshold).length;
    const dryDays = weatherData.filter(day => day.DRY_DAY).length;
    const avgHumidity = weatherData.reduce((sum, day) => sum + day.RH2M, 0) / weatherData.length;

    // Temperature analysis (40% weight)
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

    // Rainfall analysis (30% weight)
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

    return { scoreReduction, issues, advantages, alerts };
  }

  analyzeHistoricalTrends(city, crop, weatherData, historicalTrends) {
    const issues = [];
    const advantages = [];
    let scoreAdjustment = 0;

    const historicalYield = HISTORICAL_YIELDS[city]?.[crop];
    const currentWeeklyRain = weatherData.reduce((sum, day) => sum + day.PRECTOTCORR, 0);
    const historicalWeeklyRain = 450 / 52; // Average annual rainfall 450mm

    if (historicalYield) {
      // Compare with historical patterns
      if (currentWeeklyRain < historicalWeeklyRain * 0.6) {
        issues.push(`Rainfall significantly below historical average for ${city}`);
        scoreAdjustment -= 8;
      } else if (currentWeeklyRain > historicalWeeklyRain * 1.4) {
        issues.push(`Rainfall significantly above historical average`);
        scoreAdjustment -= 5;
      } else {
        advantages.push(`Rainfall patterns align with historical trends`);
        scoreAdjustment += 5;
      }

      // Check if crop historically performs well in this city
      const cityYields = Object.values(HISTORICAL_YIELDS[city] || {});
      const avgYield = cityYields.reduce((a, b) => a + b, 0) / cityYields.length;
      
      if (historicalYield >= avgYield * 1.1) {
        advantages.push(`Historically high-yielding crop in ${city}`);
        scoreAdjustment += 10;
      } else if (historicalYield <= avgYield * 0.9) {
        issues.push(`Historically lower yields in ${city} compared to other crops`);
        scoreAdjustment -= 5;
      }
    }

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
    const weeklyAvgTemp = weatherData.reduce((sum, day) => sum + day.T2M, 0) / weatherData.length;
    const weeklyMaxTemp = Math.max(...weatherData.map(day => day.T2M_MAX));
    const totalRainfall = weatherData.reduce((sum, day) => sum + day.PRECTOTCORR, 0);
    const heatStressDays = weatherData.filter(day => day.T2M_MAX > threshold.heatStressThreshold).length;
    const totalGDD = weatherData.reduce((sum, day) => sum + day.DAILY_GDD, 0);
    const dryDays = weatherData.filter(day => day.DRY_DAY).length;
    const avgHumidity = weatherData.reduce((sum, day) => sum + day.RH2M, 0) / weatherData.length;

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
    const risks = [];
    
    // Heavy rainfall risk
    const heavyRainDays = weatherData.filter(day => day.PRECTOTCORR > 20).length;
    if (heavyRainDays > 0) {
      risks.push({ 
        type: 'high', 
        factor: 'Heavy rainfall', 
        impact: 'Waterlogging and nutrient leaching',
        mitigation: 'Improve drainage and delay fertilizer application'
      });
    }
    
    // Extreme heat risk
    const extremeHeatDays = weatherData.filter(day => day.T2M_MAX > 40).length;
    if (extremeHeatDays > 0) {
      risks.push({ 
        type: 'high', 
        factor: 'Extreme heat', 
        impact: 'Crop stress and reduced yield',
        mitigation: 'Increase irrigation frequency and use shade protection'
      });
    }
    
    // Extended dry spell risk
    const drySpell = weatherData.filter(day => day.DRY_DAY).length;
    if (drySpell > 5) {
      risks.push({ 
        type: 'medium', 
        factor: 'Extended dry spell', 
        impact: 'Moisture deficit and stress',
        mitigation: 'Implement water conservation measures and schedule irrigation'
      });
    }

    // Low humidity risk
    const avgHumidity = weatherData.reduce((sum, day) => sum + day.RH2M, 0) / weatherData.length;
    if (avgHumidity < 40) {
      risks.push({ 
        type: 'medium', 
        factor: 'Low humidity', 
        impact: 'Increased evaporation and water requirement',
        mitigation: 'Increase irrigation frequency and use windbreaks'
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
}

module.exports = new CropRecommendationController();