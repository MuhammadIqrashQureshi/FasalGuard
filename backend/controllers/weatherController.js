const axios = require('axios');
const NodeCache = require('node-cache');
const cache = new NodeCache({ stdTTL: 3600 }); // Cache for 1 hour
const { getWeatherDescription } = require('../utils/weatherHelpers');

// City coordinates and climate data for Pakistan regions
const CITY_DATA = {
  'Sargodha': { 
    lat: 32.0836, 
    lon: 72.6711,
    avgTemp: 26.5, 
    avgRain: 1.2, 
    elevation: 193,
    climate: 'semi-arid'
  },
  'Lahore': { 
    lat: 31.5497, 
    lon: 74.3436,
    avgTemp: 25.8, 
    avgRain: 1.5, 
    elevation: 217,
    climate: 'semi-arid'
  },
  'Multan': { 
    lat: 30.1575, 
    lon: 71.5249,
    avgTemp: 28.2, 
    avgRain: 0.8, 
    elevation: 122,
    climate: 'arid'
  },
  'Bahawalpur': { 
    lat: 29.3956, 
    lon: 71.6722,
    avgTemp: 29.1, 
    avgRain: 0.6, 
    elevation: 115,
    climate: 'arid'
  },
  'Faisalabad': { 
    lat: 31.4180, 
    lon: 73.0790,
    avgTemp: 26.8, 
    avgRain: 1.1, 
    elevation: 184,
    climate: 'semi-arid'
  },
  'Gujrat': { 
    lat: 32.5736, 
    lon: 74.0789,
    avgTemp: 25.3, 
    avgRain: 1.3, 
    elevation: 226,
    climate: 'semi-arid'
  }
};

class WeatherController {
  constructor() {
    this.apiKey = process.env.OPENWEATHER_API_KEY;
  }

  async fetchOpenWeatherForecast(lat, lon, cityLabel, days = 7) {
    if (!this.apiKey) {
      throw new Error('OPENWEATHER_API_KEY is missing; real weather forecast is unavailable');
    }

    const response = await axios.get(
      `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${this.apiKey}&units=metric`
    );

    return this.processWeatherData(response.data, cityLabel, days);
  }

  async getRealTimeWeather(city, days = 7) {
    const cacheKey = `weather_${city}_${days}`;
    const cached = cache.get(cacheKey);
    if (cached) return cached;

    try {
      const cityData = CITY_DATA[city];
      if (!cityData) throw new Error(`City data not found for ${city}`);

      const processedWeather = await this.fetchOpenWeatherForecast(
        cityData.lat,
        cityData.lon,
        city,
        days
      );
      cache.set(cacheKey, processedWeather);
      return processedWeather;

    } catch (error) {
      console.error('Weather API error:', error.message);
      throw new Error(`Unable to fetch real weather for ${city}: ${error.message}`);
    }
  }

  processWeatherData(weatherData, city, days) {
    const dailyData = {};
    
    // Process 3-hour intervals into daily data
    weatherData.list.forEach(forecast => {
      const date = new Date(forecast.dt * 1000);
      const dateKey = date.toDateString();
      
      if (!dailyData[dateKey]) {
        dailyData[dateKey] = {
          date: date,
          temps: [],
          tempsMax: [],
          tempsMin: [],
          humidity: [],
          pressure: [],
          windSpeed: [],
          precipitation: [],
          descriptions: [],
          cloudCover: []
        };
      }

      const day = dailyData[dateKey];
      day.temps.push(forecast.main.temp);
      day.tempsMax.push(forecast.main.temp_max);
      day.tempsMin.push(forecast.main.temp_min);
      day.humidity.push(forecast.main.humidity);
      day.pressure.push(forecast.main.pressure);
      day.windSpeed.push(forecast.wind.speed);
      day.precipitation.push(forecast.rain ? forecast.rain['3h'] || 0 : 0);
      day.descriptions.push(forecast.weather[0].description);
      day.cloudCover.push(forecast.clouds.all);
    });

    // Convert to daily averages and limit to requested days
    const predictions = Object.keys(dailyData)
      .slice(0, days)
      .map((dateKey, index) => {
        const day = dailyData[dateKey];
        const avgTemp = day.temps.reduce((a, b) => a + b, 0) / day.temps.length;
        const maxTemp = Math.max(...day.tempsMax);
        const minTemp = Math.min(...day.tempsMin);
        const totalPrecip = day.precipitation.reduce((a, b) => a + b, 0);
        const avgHumidity = day.humidity.reduce((a, b) => a + b, 0) / day.humidity.length;
        const avgWindSpeed = day.windSpeed.reduce((a, b) => a + b, 0) / day.windSpeed.length;

        return {
          date: dateKey,
          T2M: Number(avgTemp.toFixed(1)),
          T2M_MAX: Number(maxTemp.toFixed(1)),
          T2M_MIN: Number(minTemp.toFixed(1)),
          PRECTOTCORR: Number(totalPrecip.toFixed(1)),
          RH2M: Math.round(avgHumidity),
          WS2M: Number(avgWindSpeed.toFixed(1)),
          DAILY_GDD: Number((Math.max(0, (avgTemp + maxTemp) / 2 - 10)).toFixed(1)),
          DRY_DAY: totalPrecip < 0.1,
          weatherDescription: getWeatherDescription(avgTemp, totalPrecip)
        };
      });

    return {
      forecast: predictions,
      summary: {
        city,
        days: predictions.length,
        avgTemp: (predictions.reduce((sum, d) => sum + d.T2M, 0) / predictions.length).toFixed(1),
        totalRainfall: predictions.reduce((sum, d) => sum + d.PRECTOTCORR, 0).toFixed(1)
      }
    };
  }

  async getRealTimeWeatherByCoords(lat, lon, days = 7) {
    try {
      const closestCity = this.findClosestCity(lat, lon);

      return await this.fetchOpenWeatherForecast(
        lat,
        lon,
        closestCity || `Lat:${lat},Lon:${lon}`,
        days
      );
    } catch (error) {
      console.error('Weather API error:', error.message);
      throw new Error(`Unable to fetch real weather by coordinates: ${error.message}`);
    }
  }

  // Helper methods for city-specific weather
  findClosestCity(lat, lon) {
    let closestCity = null;
    let minDistance = Infinity;
    
    for (const [cityName, cityData] of Object.entries(CITY_DATA)) {
      const distance = this.calculateDistance(lat, lon, cityData.lat, cityData.lon);
      if (distance < minDistance) {
        minDistance = distance;
        closestCity = cityName;
      }
    }
    
    return closestCity;
  }

  calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 6371; // Earth's radius in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  }


  // Get list of supported cities
  getSupportedCities() {
    return Object.keys(CITY_DATA);
  }

  // Get city data
  getCityData(city) {
    return CITY_DATA[city] || null;
  }
}

module.exports = WeatherController;