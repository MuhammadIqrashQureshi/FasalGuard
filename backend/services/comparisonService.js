const mlPredictionController = require('../controllers/mlPredictionController');

class ComparisonService {
  constructor() {
    this.cropAttributes = {
      cotton: {
        water_requirement: 'Moderate',
        growth_duration: 180,
        market_price: 5500, // PKR per maund
        input_cost: 120000, // PKR per hectare
        labor_intensity: 'High',
        disease_risk: 'Medium',
        climate_resilience: 'Medium'
      },
      wheat: {
        water_requirement: 'Low-Moderate',
        growth_duration: 120,
        market_price: 3200,
        input_cost: 80000,
        labor_intensity: 'Medium',
        disease_risk: 'Low',
        climate_resilience: 'High'
      },
      maize: {
        water_requirement: 'High',
        growth_duration: 90,
        market_price: 2000,
        input_cost: 90000,
        labor_intensity: 'Medium',
        disease_risk: 'Medium',
        climate_resilience: 'Medium'
      },
      rice: {
        water_requirement: 'Very High',
        growth_duration: 120,
        market_price: 3800,
        input_cost: 110000,
        labor_intensity: 'High',
        disease_risk: 'High',
        climate_resilience: 'Low'
      },
      sugarcane: {
        water_requirement: 'Very High',
        growth_duration: 365,
        market_price: 180, // PKR per 40kg
        input_cost: 180000,
        labor_intensity: 'Very High',
        disease_risk: 'Medium',
        climate_resilience: 'High'
      }
    };
  }

async generateComparisonMatrix(city, weatherData) {
  try {
    console.log('📊 Generating comparison matrix for:', city);
    
    // Extract forecast array properly
    let forecastArray;
    if (Array.isArray(weatherData)) {
      forecastArray = weatherData;
    } else if (weatherData && weatherData.forecast && Array.isArray(weatherData.forecast)) {
      forecastArray = weatherData.forecast;
      console.log(`✅ Extracted forecast array from weather data: ${forecastArray.length} days`);
    } else if (weatherData && weatherData.days && Array.isArray(weatherData.days)) {
      forecastArray = weatherData.days;
    } else {
      console.warn('⚠️ Invalid weather data format, using fallback');
      return this.generateMockComparisonData(city);
    }
    
    if (!forecastArray || forecastArray.length === 0) {
      console.warn('⚠️ Empty weather data, using fallback');
      return this.generateMockComparisonData(city);
    }
    
    console.log(`📈 Analyzing ${forecastArray.length} days of weather data`);
    
    // Calculate statistics from weather data
    const stats = this.calculateWeatherStats(forecastArray);
    
    // Generate crop data
    const cropData = this.generateCropData(city, stats, forecastArray);
    
    return {
      success: true,
      city: city,
      comparison_matrix: cropData,
      visualization_data: this.generateVisualizationData(cropData),
      weather_stats: stats,
      generated_at: new Date().toISOString()
    };
    
  } catch (error) {
    console.error('❌ Error generating comparison matrix:', error);
    return this.generateMockComparisonData(city);
  }
}

// Add this new method
generateCropData(city, stats, forecastArray) {
  const crops = ['cotton', 'wheat', 'maize', 'rice', 'sugarcane'];
  const cropData = [];
  
  for (const crop of crops) {
    const attributes = this.cropAttributes[crop];
    const predictedYield = this.calculatePredictedYield(crop, stats, forecastArray);
    const profit = this.calculateProfit(predictedYield, crop);
    
    cropData.push({
      crop: crop.charAt(0).toUpperCase() + crop.slice(1),
      cropKey: crop,
      predicted_yield: predictedYield,
      profit_per_ha: profit.total_profit,
      roi: profit.roi_percentage,
      water_efficiency: this.calculateWaterEfficiency(crop, forecastArray),
      growth_duration: attributes.growth_duration,
      composite_score: this.calculateCompositeScore(crop, predictedYield, profit, stats),
      normalized_score: this.calculateNormalizedScore(crop, predictedYield, profit, stats),
      suitability_level: this.getSuitabilityLevel(this.calculateCompositeScore(crop, predictedYield, profit, stats)),
      market_price: attributes.market_price,
      input_cost: attributes.input_cost,
      water_requirement: attributes.water_requirement
    });
  }
  
  return cropData.sort((a, b) => b.composite_score - a.composite_score);
}

calculatePredictedYield(crop, stats, forecastArray) {
  const baseYields = {
    cotton: 4.3, wheat: 3.2, maize: 5.1, rice: 2.8, sugarcane: 65.0
  };
  
  const baseYield = baseYields[crop] || 3.0;
  
  // Adjust based on temperature
  let tempAdjustment = 1.0;
  const optimalTemps = {
    cotton: 25, wheat: 18, maize: 25, rice: 28, sugarcane: 27
  };
  
  const optimalTemp = optimalTemps[crop] || 25;
  const tempDiff = Math.abs(stats.avgTemperature - optimalTemp);
  
  if (tempDiff <= 3) tempAdjustment = 1.1;
  else if (tempDiff <= 5) tempAdjustment = 1.0;
  else if (tempDiff <= 8) tempAdjustment = 0.9;
  else tempAdjustment = 0.8;
  
  // Adjust based on rainfall
  let rainAdjustment = 1.0;
  const dailyRain = stats.totalRainfall / Math.max(stats.daysAnalyzed, 1);
  
  if (dailyRain >= 1 && dailyRain <= 3) rainAdjustment = 1.1;
  else if (dailyRain < 0.5) rainAdjustment = 0.9;
  else if (dailyRain > 5) rainAdjustment = 0.85;
  
  return parseFloat((baseYield * tempAdjustment * rainAdjustment).toFixed(2));
}

  calculateWeatherStats(weatherData) {
    if (!Array.isArray(weatherData) || weatherData.length === 0) {
      return {
        avgTemperature: 28,
        totalRainfall: 0,
        avgHumidity: 65,
        avgWindSpeed: 2.5,
        daysAnalyzed: 0
      };
    }
    
    const avgTemp = weatherData.reduce((sum, day) => sum + (day.T2M || 0), 0) / weatherData.length;
    const totalRain = weatherData.reduce((sum, day) => sum + (day.PRECTOTCORR || 0), 0);
    const avgHumidity = weatherData.reduce((sum, day) => sum + (day.RH2M || 0), 0) / weatherData.length;
    const avgWindSpeed = weatherData.reduce((sum, day) => sum + (day.WS2M || 0), 0) / weatherData.length;
    
    return {
      avgTemperature: parseFloat(avgTemp.toFixed(1)),
      totalRainfall: parseFloat(totalRain.toFixed(1)),
      avgHumidity: parseFloat(avgHumidity.toFixed(1)),
      avgWindSpeed: parseFloat(avgWindSpeed.toFixed(1)),
      daysAnalyzed: weatherData.length
    };
  }
  
  // Update the generateFallbackCropData method to handle the array properly
  generateFallbackCropData(city, weatherData) {
    try {
      // Ensure weatherData is an array
      if (!Array.isArray(weatherData)) {
        // Try to extract array from object
        if (weatherData && weatherData.forecast && Array.isArray(weatherData.forecast)) {
          weatherData = weatherData.forecast;
        } else {
          weatherData = [];
        }
      }
      
      const crops = ['cotton', 'wheat', 'maize', 'rice', 'sugarcane'];
      const cropData = [];
      
      for (const crop of crops) {
        const cropInfo = this.calculateCropMetrics(crop, weatherData);
        cropData.push({
          crop: crop.charAt(0).toUpperCase() + crop.slice(1),
          cropKey: crop,
          predicted_yield: cropInfo.yield,
          profit_per_ha: cropInfo.profit,
          roi: cropInfo.roi,
          water_efficiency: cropInfo.waterEff,
          growth_duration: cropInfo.duration,
          composite_score: cropInfo.score,
          ml_confidence: 0.7 + Math.random() * 0.2,
          normalized_score: cropInfo.normalizedScore,
          suitability_level: this.getSuitabilityLevel(cropInfo.score)
        });
      }
      
      return cropData.sort((a, b) => b.composite_score - a.composite_score);
      
    } catch (error) {
      console.error('❌ Error in generateFallbackCropData:', error);
      // Return minimum viable data
      return this.getMinimumCropData();
    }
  }
  
  calculateCropMetrics(crop, weatherData) {
    // Simplified calculation based on weather data
    const avgTemp = weatherData.length > 0 ? 
      weatherData.reduce((sum, day) => sum + (day.T2M || 0), 0) / weatherData.length : 28;
    
    const totalRain = weatherData.reduce((sum, day) => sum + (day.PRECTOTCORR || 0), 0);
    
    // Base metrics by crop
    const baseMetrics = {
      cotton: { yield: 4.3, profit: 85000, roi: 42, waterEff: 'Moderate', duration: 180 },
      wheat: { yield: 3.2, profit: 60000, roi: 35, waterEff: 'Good', duration: 120 },
      maize: { yield: 5.1, profit: 75000, roi: 45, waterEff: 'Moderate', duration: 90 },
      rice: { yield: 2.8, profit: 65000, roi: 38, waterEff: 'Poor', duration: 120 },
      sugarcane: { yield: 65.0, profit: 120000, roi: 50, waterEff: 'Good', duration: 365 }
    };
    
    const base = baseMetrics[crop] || { yield: 3.0, profit: 50000, roi: 30, waterEff: 'Moderate', duration: 100 };
    
    // Adjust based on temperature
    let tempScore = 70;
    if (avgTemp >= 20 && avgTemp <= 30) tempScore = 85;
    if (avgTemp < 15 || avgTemp > 35) tempScore = 60;
    
    // Adjust based on rainfall
    let rainScore = 70;
    const rainPerDay = totalRain / Math.max(weatherData.length, 1);
    if (rainPerDay > 2) rainScore = 80;
    if (rainPerDay < 0.5) rainScore = 60;
    
    const score = Math.round((tempScore + rainScore) / 2);
    
    return {
      ...base,
      score: score,
      normalizedScore: score
    };
  }

  calculateWaterEfficiencyScore(crop, weatherData) {
    const waterRequirements = {
      cotton: 600,
      wheat: 450,
      maize: 700,
      rice: 1500,
      sugarcane: 2000
    };
    
    const req = waterRequirements[crop] || 500;
    const totalRain = weatherData.reduce((sum, day) => sum + day.PRECTOTCORR, 0) || 0;
    
    // Calculate water efficiency based on rainfall
    const efficiencyRatio = (totalRain / req) * 100;
    
    if (efficiencyRatio >= 80 && efficiencyRatio <= 120) return 100;
    if (efficiencyRatio >= 60 && efficiencyRatio <= 140) return 80;
    if (efficiencyRatio >= 40 && efficiencyRatio <= 160) return 60;
    return 40;
  }

  calculateCompositeScore(crop, predictedYield, profit, stats) {
  const yieldScore = this.calculateYieldScore(predictedYield, crop);
  const profitScore = this.calculateProfitScore(predictedYield, crop);
  const waterScore = this.calculateWaterEfficiencyScore(crop, [stats]);
  
  // Weighted average
  return Math.round((yieldScore * 0.4) + (profitScore * 0.4) + (waterScore * 0.2));
}

calculateNormalizedScore(crop, predictedYield, profit, stats) {
  const compositeScore = this.calculateCompositeScore(crop, predictedYield, profit, stats);
  return Math.min(100, Math.max(0, compositeScore));
}

getSuitabilityLevel(score) {
  if (score >= 85) return 'Excellent';
  if (score >= 70) return 'Good';
  if (score >= 55) return 'Moderate';
  if (score >= 40) return 'Marginal';
  return 'Poor';
}

// Update calculateWaterEfficiency to handle array
calculateWaterEfficiency(crop, weatherData) {
  const score = this.calculateWaterEfficiencyScore(crop, weatherData);
  
  if (score >= 80) return 'Excellent';
  if (score >= 60) return 'Good';
  if (score >= 40) return 'Moderate';
  return 'Poor';
}

  calculateYieldScore(predictedYield, crop) {
    const benchmarkYields = {
      cotton: 4.3,
      wheat: 3.2,
      maize: 5.1,
      rice: 2.8,
      sugarcane: 65.0
    };
    
    const benchmark = benchmarkYields[crop] || 3.0;
    const ratio = predictedYield / benchmark;
    
    if (ratio >= 1.2) return 100;
    if (ratio >= 1.0) return 80;
    if (ratio >= 0.8) return 60;
    if (ratio >= 0.6) return 40;
    return 20;
  }

  calculateProfitScore(predictedYield, crop) {
    const profit = this.calculateProfit(predictedYield, crop);
    const roi = profit.roi_percentage;
    
    if (roi >= 100) return 100;
    if (roi >= 75) return 85;
    if (roi >= 50) return 70;
    if (roi >= 25) return 55;
    if (roi >= 0) return 40;
    return 20;
  }

  calculateProfit(predictedYield, crop) {
    const attributes = this.cropAttributes[crop];
    const yieldInMaund = crop === 'sugarcane' ? predictedYield * 25 : predictedYield * 22.046; // Convert tons to maund
    
    let revenue;
    if (crop === 'sugarcane') {
      revenue = (yieldInMaund / 40) * attributes.market_price; // sugarcane price per 40kg
    } else {
      revenue = yieldInMaund * attributes.market_price;
    }
    
    const totalCost = attributes.input_cost;
    const profit = revenue - totalCost;
    const roiPercentage = totalCost > 0 ? (profit / totalCost) * 100 : 0;
    
    return {
      revenue: parseFloat(revenue.toFixed(0)),
      total_cost: totalCost,
      total_profit: parseFloat(profit.toFixed(0)),
      roi_percentage: parseFloat(roiPercentage.toFixed(1))
    };
  }

  generateMockComparisonData(location) {
    console.log('Generating mock comparison data for:', location);
    
    const crops = ['cotton', 'wheat', 'maize', 'rice', 'sugarcane'];
    const mockData = [];
    
    crops.forEach((crop, index) => {
      const attributes = this.cropAttributes[crop];
      const baseYield = [4.5, 3.2, 5.1, 2.8, 65.0][index];
      const variation = Math.random() * 0.5 + 0.75; // 75-125% variation
      const predictedYield = baseYield * variation;
      
      const profit = this.calculateProfit(predictedYield, crop);
      
      mockData.push({
        crop: crop.charAt(0).toUpperCase() + crop.slice(1),
        cropKey: crop,
        predicted_yield: parseFloat(predictedYield.toFixed(2)),
        confidence: 0.7 + Math.random() * 0.2,
        composite_score: 60 + Math.random() * 30,
        profit_per_ha: profit.total_profit,
        roi: profit.roi_percentage,
        water_efficiency: ['Excellent', 'Good', 'Moderate', 'Poor'][index % 4],
        growth_duration: attributes.growth_duration,
        market_price: attributes.market_price,
        input_cost: attributes.input_cost,
        water_requirement: attributes.water_requirement,
        labor_intensity: attributes.labor_intensity,
        disease_risk: attributes.disease_risk,
        climate_resilience: attributes.climate_resilience,
        ml_confidence: 0.7 + Math.random() * 0.2,
        recommendation_status: ['HIGH', 'MODERATE', 'LOW'][index % 3],
        yield_change: `${(Math.random() > 0.5 ? '+' : '-')}${(Math.random() * 15 + 5).toFixed(0)}%`,
        normalized_score: 70 + Math.random() * 20
      });
    });
    
    return mockData.sort((a, b) => b.normalized_score - a.normalized_score);
  }

  calculateRiskScore(crop, weatherData) {
    let score = 70; // Base score
    
    // Temperature risk
    const avgTemp = weatherData.reduce((sum, day) => sum + day.T2M, 0) / weatherData.length;
    
    const optimalTempRanges = {
      cotton: [20, 35],
      wheat: [10, 25],
      maize: [18, 32],
      rice: [22, 35],
      sugarcane: [20, 35]
    };
    
    const range = optimalTempRanges[crop] || [15, 30];
    if (avgTemp < range[0] || avgTemp > range[1]) score -= 20;
    
    // Rainfall risk
    const totalRain = weatherData.reduce((sum, day) => sum + day.PRECTOTCORR, 0);
    if (totalRain < 10) score -= 15; // Drought risk
    if (totalRain > 50) score -= 10; // Flood risk
    
    // Heat stress risk
    const heatStressDays = weatherData.filter(day => day.T2M_MAX > 35).length;
    score -= heatStressDays * 5;
    
    return Math.max(0, score);
  }

  calculateSuitabilityScore(crop, location, weatherData) {
    // Historical performance in location
    const historicalPerformance = {
      'Multan': { cotton: 90, wheat: 70, maize: 85, rice: 60, sugarcane: 95 },
      'Lahore': { cotton: 80, wheat: 85, maize: 90, rice: 75, sugarcane: 80 },
      'Faisalabad': { cotton: 85, wheat: 90, maize: 85, rice: 70, sugarcane: 85 },
      'Sargodha': { cotton: 75, wheat: 95, maize: 90, rice: 65, sugarcane: 75 },
      'Bahawalpur': { cotton: 95, wheat: 65, maize: 80, rice: 55, sugarcane: 90 },
      'Gujrat': { cotton: 70, wheat: 85, maize: 80, rice: 70, sugarcane: 70 }
    };
    
    const historicalScore = historicalPerformance[location]?.[crop] || 70;
    
    // Adjust based on current weather
    const weatherScore = this.calculateRiskScore(crop, weatherData);
    
    return (historicalScore * 0.6 + weatherScore * 0.4);
  }

  generateVisualizationData(comparisonData) {
    if (!comparisonData || comparisonData.length === 0) {
      console.error('No comparison data available for visualization');
      return {
        categories: [],
        datasets: [],
        radarData: []
      };
    }
    
    const categories = comparisonData.map(item => item.crop);
    
    const datasets = [
      {
        name: 'Yield Score',
        data: comparisonData.map(item => item.normalized_score || item.composite_score),
        color: '#16a34a'
      },
      {
        name: 'Profit Potential',
        data: comparisonData.map(item => Math.min(100, item.roi)),
        color: '#3b82f6'
      },
      {
        name: 'Water Efficiency',
        data: comparisonData.map(item => {
          // Convert water efficiency to numeric score
          const efficiencyMap = {
            'Excellent': 100,
            'Good': 75,
            'Moderate': 50,
            'Poor': 25
          };
          return efficiencyMap[item.water_efficiency] || 50;
        }),
        color: '#1d4ed8'
      },
      {
        name: 'Risk Level',
        data: comparisonData.map(item => {
          // Convert risk to score (higher number = higher risk)
          const riskScore = 100 - (item.normalized_score || item.composite_score);
          return Math.max(0, Math.min(100, riskScore));
        }),
        color: '#dc2626'
      }
    ];
    
    return {
      categories,
      datasets,
      radarData: this.generateRadarChartData(comparisonData)
    };
  }

  generateRadarChartData(comparisonData) {
    return comparisonData.map(crop => ({
      crop: crop.crop,
      data: [
        crop.normalized_score || crop.composite_score, // Yield potential
        Math.min(100, crop.roi), // Profitability
        (() => {
          const efficiencyMap = {
            'Excellent': 100,
            'Good': 75,
            'Moderate': 50,
            'Poor': 25
          };
          return efficiencyMap[crop.water_efficiency] || 50;
        })(), // Water efficiency
        100 - (crop.normalized_score || crop.composite_score) * 0.8, // Risk
        (crop.ml_confidence || 0.7) * 100, // ML confidence
        crop.growth_duration / 3.65 // Growth duration (normalized)
      ],
      labels: ['Yield', 'Profit', 'Water Eff.', 'Risk', 'ML Conf.', 'Duration']
    }));
  }
}

module.exports = new ComparisonService();

  
