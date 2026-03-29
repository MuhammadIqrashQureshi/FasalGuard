const DISTRICT_SOIL_HISTORY = {
  Sargodha: {
    pH: 5.55,
    orgc: 5.275,
    nitrogen: 0.650,
    clay: 36.2,
    ec: 0.80,
  },
  Faisalabad: {
    pH: 7.76,
    orgc: 2.484,
    nitrogen: 0.569,
    clay: 14.6,
    ec: 2.35,
  },
  Gujrat: {
    pH: 7.5,
    orgc: 2.663,
    nitrogen: 0.700,
    clay: 25.6,
    ec: 0.88,
  },
  Lahore: {
    pH: 7.2,
    orgc: 2.738,
    nitrogen: 0.443,
    clay: 20.6,
    ec: 1.08,
  },
  Multan: {
    pH: 7.4,
    orgc: 4.1,
    nitrogen: 0.45,
    clay: 12.5,
    ec: 0.8,
  },
  Bahawalpur: {
    pH: 5.45,
    orgc: 4.1,
    nitrogen: 0.45,
    clay: 13.0,
    ec: 0.7,
  },
};

const PARAMETER_META = {
  pH: {
    label: 'Soil pH',
    unit: 'pH',
    optimal: '6.0-7.5',
    optimalMin: 6.0,
    optimalMax: 7.5,
  },
  orgc: {
    label: 'Organic Carbon',
    unit: '%',
    optimal: '2.0-5.0%',
    optimalMin: 2.0,
    optimalMax: 5.0,
  },
  nitrogen: {
    label: 'Total Nitrogen',
    unit: '%',
    optimal: '0.4-0.7%',
    optimalMin: 0.4,
    optimalMax: 0.7,
  },
  clay: {
    label: 'Clay Content',
    unit: '%',
    optimal: '15-35%',
    optimalMin: 15,
    optimalMax: 35,
  },
  ec: {
    label: 'Salinity (EC)',
    unit: 'dS/m',
    optimal: '0-2.0 dS/m',
    optimalMin: 0,
    optimalMax: 2.0,
  },
};

function normalizeDistrictName(value) {
  const raw = String(value || '').trim().toLowerCase();
  if (!raw) return null;

  return Object.keys(DISTRICT_SOIL_HISTORY).find((district) => district.toLowerCase() === raw)
    || Object.keys(DISTRICT_SOIL_HISTORY).find((district) => raw.includes(district.toLowerCase()) || district.toLowerCase().includes(raw))
    || null;
}

function classifyParameter(key, value) {
  if (key === 'pH') {
    if (value >= 6.0 && value <= 7.5) return { status: 'Optimal', score: 95, effect: 'Ideal for most crops' };
    if (value < 6.0) return { status: 'Acidic', score: 60, effect: 'May require lime application' };
    return { status: 'Alkaline', score: 70, effect: 'May limit nutrient availability' };
  }

  if (key === 'orgc') {
    if (value >= 2.0 && value <= 5.0) return { status: 'Optimal', score: 90, effect: 'Good soil fertility' };
    if (value < 2.0) return { status: 'Low', score: 65, effect: 'May need organic amendments' };
    return { status: 'High', score: 95, effect: 'Excellent soil health' };
  }

  if (key === 'nitrogen') {
    if (value >= 0.4 && value <= 0.7) return { status: 'Optimal', score: 92, effect: 'Adequate for crop growth' };
    if (value < 0.4) return { status: 'Low', score: 58, effect: 'May need nitrogen fertilization' };
    return { status: 'High', score: 85, effect: 'Risk of environmental loss' };
  }

  if (key === 'clay') {
    if (value >= 15 && value <= 35) return { status: 'Optimal', score: 88, effect: 'Good water retention' };
    if (value < 15) return { status: 'Low', score: 62, effect: 'Poor water holding capacity' };
    return { status: 'High', score: 82, effect: 'May have drainage issues' };
  }

  if (key === 'ec') {
    if (value <= 2.0) return { status: 'Optimal', score: 96, effect: 'No salinity stress' };
    if (value <= 4.0) return { status: 'Moderate', score: 70, effect: 'Some salt-sensitive crops affected' };
    return { status: 'High', score: 45, effect: 'Severe salinity stress' };
  }

  return { status: 'Unknown', score: 50, effect: 'No interpretation available' };
}

function buildDistrictSoilTrendSummary(districtName) {
  const normalized = normalizeDistrictName(districtName);
  if (!normalized) return null;

  const district = DISTRICT_SOIL_HISTORY[normalized];
  const parameters = Object.entries(PARAMETER_META).map(([key, meta]) => {
    const value = Number(district[key]);
    const classification = classifyParameter(key, value);
    return {
      key,
      label: meta.label,
      value,
      unit: meta.unit,
      optimal: meta.optimal,
      optimalMin: meta.optimalMin,
      optimalMax: meta.optimalMax,
      status: classification.status,
      score: classification.score,
      effect: classification.effect,
    };
  });

  const overallScore = Math.round(
    parameters.reduce((sum, item) => sum + item.score, 0) / Math.max(parameters.length, 1),
  );
  const flagged = parameters
    .filter((item) => item.status !== 'Optimal')
    .sort((a, b) => a.score - b.score)
    .slice(0, 2)
    .map((item) => `${item.label}: ${item.status.toLowerCase()}`);

  return {
    district: normalized,
    overall_score: overallScore,
    headline: flagged.length > 0
      ? `Historical district soil signal points to ${flagged.join(' and ')}.`
      : 'Historical district soil signal is broadly within the optimal band.',
    key_flags: flagged,
    parameters,
  };
}

module.exports = {
  buildDistrictSoilTrendSummary,
  normalizeDistrictName,
};