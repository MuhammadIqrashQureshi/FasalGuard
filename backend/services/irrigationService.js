class IrrigationService {
  constructor() {
    // Crop-specific water coefficients (mm/day)
    this.cropWaterCoefficients = {
      cotton: { kc_initial: 0.35, kc_mid: 1.15, kc_end: 0.55, root_depth: 1.2 },
      wheat: { kc_initial: 0.3, kc_mid: 1.1, kc_end: 0.25, root_depth: 1.0 },
      maize: { kc_initial: 0.3, kc_mid: 1.2, kc_end: 0.35, root_depth: 0.9 },
      rice: { kc_initial: 1.05, kc_mid: 1.2, kc_end: 0.9, root_depth: 0.3 },
      sugarcane: { kc_initial: 0.4, kc_mid: 1.25, kc_end: 0.75, root_depth: 1.5 }
    };

    // Soil types and properties (mm/m)
    this.soilTypes = {
      sandy: { available_water: 80, infiltration_rate: 25, depletion_factor: 0.5 },
      loamy: { available_water: 140, infiltration_rate: 15, depletion_factor: 0.5 },
      clay: { available_water: 180, infiltration_rate: 10, depletion_factor: 0.45 },
      silty: { available_water: 160, infiltration_rate: 12, depletion_factor: 0.5 }
    };
  }

  // Calculate daily crop water requirement using FAO Penman-Monteith
  calculateCropWaterRequirement(crop, weatherData, growthStage = 'mid') {
    const kc = this.cropWaterCoefficients[crop];
    if (!kc) throw new Error(`Water coefficients not available for ${crop}`);

    let kc_value;
    switch (growthStage) {
      case 'initial': kc_value = kc.kc_initial; break;
      case 'mid': kc_value = kc.kc_mid; break;
      case 'end': kc_value = kc.kc_end; break;
      default: kc_value = kc.kc_mid;
    }

    // Calculate reference evapotranspiration (ET0) using simplified Hargreaves
    const et0 = this.calculateET0(weatherData);
    
    // Crop evapotranspiration (ETc) = Kc × ET0
    const etc = kc_value * et0;
    
    return {
      daily_water_mm: parseFloat(etc.toFixed(2)),
      daily_water_m3_per_ha: parseFloat((etc * 10).toFixed(2)), // 1 mm = 10 m³/ha
      et0: parseFloat(et0.toFixed(2)),
      kc_value: kc_value,
      crop_stage: growthStage
    };
  }

  calculateET0(weatherData) {
    // Handle case where weatherData is not an array or is empty
    if (!weatherData || !Array.isArray(weatherData) || weatherData.length === 0) {
      console.warn('No weather data available, using default ET0');
      return 5.0; // Default ET0 for Pakistan region
    }
    
    const day = weatherData[0];
    
    // Ensure day object has required properties with defaults
    const tmax = day.T2M_MAX || day.max_temp || day.T2M || 32;
    const tmin = day.T2M_MIN || day.min_temp || day.T2M || 22;
    
    const tmean = (tmax + tmin) / 2;
    const trange = tmax - tmin;
    
    // Hargreaves equation (simplified for Pakistan conditions)
    const et0 = 0.0023 * 0.408 * (tmean + 17.8) * Math.sqrt(trange) * 15;
    
    return Math.max(3.0, Math.min(8.0, parseFloat(et0.toFixed(2))));
  }

  calculateIrrigationSchedule(crop, weatherData, soilType = 'loamy', area_ha = 1) {
    try {
      // 1. Validate and normalize weatherData
      let normalizedWeatherData = this.normalizeWeatherData(weatherData);
      
      // 2. Calculate water requirement with validated data
      const waterReq = this.calculateCropWaterRequirement(crop, normalizedWeatherData, 'mid');
      const soil = this.soilTypes[soilType] || this.soilTypes.loamy;
      const kc = this.cropWaterCoefficients[crop];
      
      if (!kc) {
        console.warn(`No coefficients for ${crop}, using wheat as default`);
        return this.calculateIrrigationSchedule('wheat', normalizedWeatherData, soilType, area_ha);
      }
      
      // 3. Calculate irrigation interval - FIXED THIS PART
      const dailyWaterUse_mm = waterReq.daily_water_mm;
      
      // Maximum allowable depletion (MAD) - fraction of available water that can be used
      const mad = soil.depletion_factor || 0.5;
      
      // Total available water in root zone (mm)
      const totalAvailableWater_mm = soil.available_water * kc.root_depth;
      
      // Readily available water (RAW) - water that can be used without stress
      const raw_mm = totalAvailableWater_mm * mad;
      
      // Irrigation interval based on daily water use
      let irrigationInterval = Math.floor(raw_mm / dailyWaterUse_mm);
      
      // Ensure minimum and maximum intervals
      irrigationInterval = Math.max(3, Math.min(14, irrigationInterval));
      
      // 4. Calculate irrigation depth - should refill the RAW
      let irrigationDepth_mm = Math.min(raw_mm, soil.infiltration_rate);
      
      // Adjust for crop type
      if (crop === 'rice') {
        irrigationDepth_mm = Math.min(50, irrigationDepth_mm); // Rice needs more water
      }
      
      // 5. Volume for specified area
      const irrigationVolume_m3 = irrigationDepth_mm * 10 * area_ha;
      
      // 6. Calculate forecast rain
      let forecastRain = 0;
      if (Array.isArray(normalizedWeatherData) && normalizedWeatherData.length > 0) {
        forecastRain = normalizedWeatherData.reduce((sum, day) => {
          const rain = day.PRECTOTCORR || day.precipitation || day.rain || 0;
          return sum + rain;
        }, 0);
      }
      
      const effectiveRain = forecastRain * 0.7;
      
      // 7. Calculate days until next irrigation - adjust based on forecast rain
      let daysUntilIrrigation = irrigationInterval;
      
      // If significant rain is forecast, delay irrigation
      if (effectiveRain > 10) {
        const rainDelayDays = Math.floor(effectiveRain / 5);
        daysUntilIrrigation = Math.max(2, irrigationInterval + rainDelayDays);
      }
      // If no rain and high temperatures, irrigate sooner
      else if (effectiveRain < 2 && waterReq.et0 > 6) {
        daysUntilIrrigation = Math.max(2, Math.floor(irrigationInterval * 0.7));
      }
      
      // Ensure daysUntilIrrigation is reasonable
      daysUntilIrrigation = Math.max(2, Math.min(21, daysUntilIrrigation));
      
      // 8. Set next irrigation date
      const nextIrrigation = new Date();
      nextIrrigation.setDate(nextIrrigation.getDate() + daysUntilIrrigation);
      
      // 9. Return the schedule with crop-specific adjustments
      const result = {
        crop: crop,
        soil_type: soilType,
        area_ha: area_ha,
        current_daily_water_req_mm: waterReq.daily_water_mm,
        irrigation_depth_mm: parseFloat(irrigationDepth_mm.toFixed(1)),
        irrigation_volume_m3: parseFloat(irrigationVolume_m3.toFixed(1)),
        irrigation_interval_days: irrigationInterval,
        next_irrigation_date: nextIrrigation.toISOString().split('T')[0],
        days_until_next_irrigation: daysUntilIrrigation,
        water_savings_tips: this.getWaterSavingsTips(crop, soilType),
        irrigation_method: this.recommendIrrigationMethod(crop, soilType),
        weather_data_days_used: Array.isArray(normalizedWeatherData) ? normalizedWeatherData.length : 0,
        total_available_water_mm: parseFloat(totalAvailableWater_mm.toFixed(1)),
        raw_mm: parseFloat(raw_mm.toFixed(1)),
        et0: waterReq.et0,
        kc_value: waterReq.kc_value
      };
      
      console.log(`Irrigation calculation for ${crop}:`, {
        dailyWaterUse_mm,
        totalAvailableWater_mm,
        raw_mm,
        irrigationInterval,
        daysUntilIrrigation,
        irrigationDepth_mm
      });
      
      return result;
      
    } catch (error) {
      console.error('Error in calculateIrrigationSchedule:', error);
      // Return a safe default schedule
      return this.getDefaultIrrigationSchedule(crop, soilType, area_ha);
    }
  }

  // Add this helper method to normalize weather data
  normalizeWeatherData(weatherData) {
    if (!weatherData) {
      return this.createDefaultWeatherData();
    }
    
    // If it's already an array, return it
    if (Array.isArray(weatherData)) {
      return weatherData.map(day => ({
        T2M_MAX: day.T2M_MAX || day.max_temp || day.temperature_max || 35,
        T2M_MIN: day.T2M_MIN || day.min_temp || day.temperature_min || 25,
        PRECTOTCORR: day.PRECTOTCORR || day.precipitation || day.rain || 0,
        RH2M: day.RH2M || day.humidity || 60,
        WS2M: day.WS2M || day.wind_speed || 2.5,
        date: day.date || day.time || new Date().toISOString()
      }));
    }
    
    // If it's an object with a forecast property
    if (weatherData.forecast && Array.isArray(weatherData.forecast)) {
      return weatherData.forecast;
    }
    
    // If it's an object with a days property
    if (weatherData.days && Array.isArray(weatherData.days)) {
      return weatherData.days;
    }
    
    // Default fallback
    return this.createDefaultWeatherData();
  }

  // Add this method for default schedule
  getDefaultIrrigationSchedule(crop, soilType, area_ha) {
    // Crop-specific default values
    const cropDefaults = {
      cotton: { interval: 7, depth: 40, waterReq: 7.5 },
      wheat: { interval: 10, depth: 50, waterReq: 6.5 },
      maize: { interval: 6, depth: 35, waterReq: 8.0 },
      rice: { interval: 3, depth: 60, waterReq: 12.0 },
      sugarcane: { interval: 8, depth: 45, waterReq: 9.0 }
    };
    
    const defaults = cropDefaults[crop] || { interval: 7, depth: 40, waterReq: 8.0 };
    
    const defaultData = {
      crop: crop,
      soil_type: soilType,
      area_ha: area_ha,
      current_daily_water_req_mm: defaults.waterReq,
      irrigation_depth_mm: defaults.depth,
      irrigation_volume_m3: area_ha * defaults.depth * 10,
      irrigation_interval_days: defaults.interval,
      next_irrigation_date: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      days_until_next_irrigation: 3,
      water_savings_tips: this.getWaterSavingsTips(crop, soilType),
      irrigation_method: this.recommendIrrigationMethod(crop, soilType),
      weather_data_days_used: 0,
      note: 'Using default values due to weather data issues'
    };
    
    return defaultData;
  }

  // Add this method to create default weather data
  createDefaultWeatherData(days = 7) {
    const data = [];
    const today = new Date();
    
    for (let i = 0; i < days; i++) {
      const date = new Date(today);
      date.setDate(date.getDate() + i);
      
      // Pakistan climate defaults
      data.push({
        T2M_MAX: 35,
        T2M_MIN: 25,
        PRECTOTCORR: 0,
        RH2M: 60,
        WS2M: 2.5,
        date: date.toISOString().split('T')[0]
      });
    }
    
    return data;
  }

  getWaterSavingsTips(crop, soilType) {
    const tips = [
      "Water in early morning (4-7 AM) to reduce evaporation",
      "Use mulch to conserve soil moisture",
      "Regularly check soil moisture before irrigating",
      "Fix leaks in irrigation system immediately"
    ];
    
    if (soilType === 'sandy') {
      tips.push("Frequent shallow irrigation for sandy soils");
      tips.push("Add organic matter to improve water retention");
    } else if (soilType === 'clay') {
      tips.push("Deep, infrequent irrigation for clay soils");
      tips.push("Aerate soil to improve water infiltration");
    }
    
    if (crop === 'rice') {
      tips.push("Maintain shallow water depth (5-7 cm) in rice fields");
      tips.push("Use alternate wetting and drying (AWD) method");
    } else if (crop === 'cotton') {
      tips.push("Use drip irrigation for cotton to save 30-40% water");
      tips.push("Monitor soil moisture at 30-60 cm depth");
    } else if (crop === 'wheat') {
      tips.push("Avoid irrigation during flowering stage");
      tips.push("Schedule last irrigation 2 weeks before harvest");
    }
    
    return tips;
  }

  recommendIrrigationMethod(crop, soilType) {
    const methods = {
      cotton: { recommended: "Drip Irrigation", efficiency: 90, cost: "Medium" },
      wheat: { recommended: "Sprinkler Irrigation", efficiency: 85, cost: "Low" },
      maize: { recommended: "Drip Irrigation", efficiency: 88, cost: "Medium" },
      rice: { recommended: "Basin Irrigation", efficiency: 70, cost: "Low" },
      sugarcane: { recommended: "Furrow Irrigation", efficiency: 75, cost: "Low" }
    };
    
    const method = methods[crop] || { recommended: "Sprinkler", efficiency: 80, cost: "Medium" };
    
    if (soilType === 'sandy') {
      method.recommended = "Drip Irrigation";
      method.efficiency = 95;
    } else if (soilType === 'clay') {
      method.recommended = "Furrow Irrigation";
      method.efficiency = 75;
    }
    
    return method;
  }

  // Calculate water requirement for multiple crops
  calculateMultiCropWaterRequirements(crops, weatherData, area_ha = 1) {
    const results = {};
    
    crops.forEach(crop => {
      try {
        const waterReq = this.calculateCropWaterRequirement(crop, weatherData);
        const schedule = this.calculateIrrigationSchedule(crop, weatherData, 'loamy', area_ha);
        
        results[crop] = {
          ...waterReq,
          ...schedule,
          seasonal_water_requirement_m3: parseFloat((waterReq.daily_water_m3_per_ha * 120).toFixed(1)) // 120-day season
        };
      } catch (error) {
        console.error(`Error calculating for ${crop}:`, error.message);
      }
    });
    
    return results;
  }
}

module.exports = new IrrigationService();