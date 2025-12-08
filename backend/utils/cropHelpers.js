// utils/cropHelpers.js

// Crop-specific data for fallback recommendations
const getCropSpecificRecommendations = (cropKey, weatherData) => {
  const recommendations = {
    sugarcane: [
      "Ensure adequate irrigation during dry spells - sugarcane needs 1500-2500mm water",
      "Apply nitrogen-rich fertilizers in split doses (120-150 kg/ha)",
      "Monitor for red rot and smut diseases regularly",
      "Harvest when sucrose content peaks (12-16 months maturity)"
    ],
    maize: [
      "Plant in well-drained soil with good organic matter",
      "Apply balanced NPK fertilizer (120:60:40 kg/ha) at sowing",
      "Control stem borer with carbaryl or monocrotophos",
      "Harvest when kernels are hard and moisture content is 20-25%"
    ],
    cotton: [
      "Ensure proper spacing (45-60 cm between plants, 75-90 cm between rows)",
      "Apply phosphorus-rich fertilizers for better boll formation",
      "Monitor for bollworm and whitefly infestations weekly",
      "Pick cotton when bolls fully open and fibers are mature"
    ],
    wheat: [
      "Sow at proper time (Nov-Dec for Punjab region)",
      "Apply nitrogen in split doses: 1/3 basal, 1/3 tillering, 1/3 flowering",
      "Control rust diseases with propiconazole or tebuconazole",
      "Harvest when grains are hard and moisture content below 20%"
    ],
    rice: [
      "Maintain 5-7 cm water depth in fields throughout growth",
      "Apply nitrogen in three split doses: basal, tillering, panicle initiation",
      "Control blast and bacterial leaf blight with tricyclazole",
      "Harvest when 80% grains turn yellow and moisture is 20-25%"
    ]
  };

  return recommendations[cropKey] || [
    "Monitor soil moisture regularly",
    "Apply recommended fertilizers based on soil test",
    "Implement integrated pest management",
    "Provide irrigation during peak heat periods"
  ];
};

const getCropSpecificAdvantages = (cropKey, weatherData) => {
  const advantages = {
    sugarcane: ["High temperature tolerance (25-35°C ideal)", "Long growing season suitable", "Good for sugar production and ethanol"],
    maize: ["Fast growing crop (90-100 days)", "Versatile usage (food, feed, industry)", "Good market demand in Pakistan"],
    cotton: ["High market value for lint", "Suitable for textile industry", "Export potential to international markets"],
    wheat: ["Staple food crop with guaranteed demand", "Short growing season (120-140 days)", "Government support and procurement"],
    rice: ["Staple food with high domestic consumption", "High yield potential with proper management", "Basmati varieties have export value"]
  };

  return advantages[cropKey] || ["Optimal temperature range", "Good drying conditions"];
};

const getCropSpecificIssues = (cropKey, weatherData) => {
  const issues = {
    sugarcane: ["High water requirement (1500-2500mm)", "Long maturation period (12-16 months)", "Labor intensive harvesting"],
    maize: ["Susceptible to drought stress", "Pest prone (stem borer, armyworm)", "Requires fertile soil with good drainage"],
    cotton: ["Pesticide intensive for pest control", "Climate sensitive (needs warm conditions)", "Quality affected by weather during boll opening"],
    wheat: ["Temperature sensitive during grain filling", "Disease prone (rust, smut, karnal bunt)", "Quality affected by terminal heat stress"],
    rice: ["High water consumption (3000-5000 liters/kg)", "Labor intensive for transplanting", "Climate sensitive during flowering"]
  };

  return issues[cropKey] || ["Potential heat stress periods", "Extended dry spell expected"];
};

const getPlantingWindow = (cropKey) => {
  const windows = {
    sugarcane: 'February - March',
    maize: 'July - August', 
    cotton: 'March - April',
    wheat: 'November - December',
    rice: 'June - July'
  };
  return windows[cropKey] || 'Flexible';
};

const getWaterRequirements = (cropKey) => {
  const requirements = {
    sugarcane: 'High',
    maize: 'Moderate',
    cotton: 'Moderate', 
    wheat: 'Low to Moderate',
    rice: 'Very High'
  };
  return requirements[cropKey] || 'Moderate';
};

module.exports = {
  getCropSpecificRecommendations,
  getCropSpecificAdvantages,
  getCropSpecificIssues,
  getPlantingWindow,
  getWaterRequirements
};