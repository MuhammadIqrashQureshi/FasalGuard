// utils/weatherHelpers.js

const getWeatherDescription = (temp, rainfall) => {
  if (rainfall > 10) return 'Heavy Rain';
  if (rainfall > 5) return 'Moderate Rain';
  if (rainfall > 1) return 'Light Rain';
  if (rainfall > 0) return 'Drizzle';
  if (temp > 35) return 'Hot and Sunny';
  if (temp > 30) return 'Warm and Clear';
  if (temp > 25) return 'Pleasant and Sunny';
  if (temp > 20) return 'Mild and Clear';
  if (temp > 15) return 'Cool and Clear';
  if (temp > 10) return 'Chilly';
  return 'Cold';
};

// Generic weather generation (fallback)
const generateRealisticWeather = (lat, lon, days) => {
  const weatherData = [];
  const baseDate = new Date();
  
  for (let i = 0; i < days; i++) {
    const date = new Date(baseDate);
    date.setDate(baseDate.getDate() + i);
    
    const month = date.getMonth();
    const baseTemp = 25 + (Math.random() - 0.5) * 10;
    const temp = baseTemp + (Math.random() - 0.5) * 8;
    const maxTemp = temp + 3 + Math.random() * 4;
    const minTemp = temp - 3 - Math.random() * 4;
    
    const rainChance = 0.2;
    const rainfall = Math.random() < rainChance ? (Math.random() * 5).toFixed(1) : 0;
    
    weatherData.push({
      date: date.toISOString().split('T')[0],
      T2M: Number(temp.toFixed(1)),
      T2M_MAX: Number(maxTemp.toFixed(1)),
      T2M_MIN: Number(minTemp.toFixed(1)),
      PRECTOTCORR: Number(rainfall),
      RH2M: Math.floor(40 + Math.random() * 40),
      WS2M: Number((2 + Math.random() * 4).toFixed(1)),
      DAILY_GDD: Number((temp - 10).toFixed(1)),
      DRY_DAY: rainfall === 0,
      weatherDescription: getWeatherDescription(temp, rainfall)
    });
  }
  
  return weatherData;
};

module.exports = {
  getWeatherDescription,
  generateRealisticWeather
};