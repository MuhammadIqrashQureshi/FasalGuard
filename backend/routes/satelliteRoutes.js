const express = require('express');
const router = express.Router();
const axios = require('axios');
const jwt = require('jsonwebtoken');
const SatelliteOutcome = require('../models/SatelliteOutcome');
const User = require('../models/User');
const { protect } = require('../middleware/auth');
const { sendSatelliteAlertEmail } = require('../middleware/emailService');
const {
  resolveRequestLanguage,
  localizeSatellitePayloadToUrdu,
} = require('../utils/satelliteUrduTranslator');

const ML_SERVICE_URL = process.env.PYTHON_ML_SERVICE_URL || 'http://localhost:5001';

const optionalAuth = async (req, _res, next) => {
  try {
    const authHeader = req.headers.authorization || '';
    if (!authHeader.startsWith('Bearer ')) return next();

    const token = authHeader.split(' ')[1];
    if (!token) return next();

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (!decoded?.id) return next();

    const user = await User.findById(decoded.id).select('_id role accountStatus');
    if (user && user.accountStatus === 'active') {
      req.user = user;
    }
  } catch (_err) {
    // Optional auth should never block the request.
  }
  return next();
};

const clampCoord = (value) => {
  const num = Number(value);
  if (!Number.isFinite(num)) return null;
  return Number(num.toFixed(6));
};

const normalizePolygon = (polygon) => {
  if (!Array.isArray(polygon) || polygon.length < 3) return [];
  return polygon
    .map((pt) => ({
      lat: clampCoord(pt?.lat),
      lon: clampCoord(pt?.lon),
    }))
    .filter((pt) => Number.isFinite(pt.lat) && Number.isFinite(pt.lon));
};

const buildFieldSignature = ({ crop, city, latitude, longitude, fieldPolygon, savedLocationId }) => {
  if (savedLocationId) {
    return `saved:${String(savedLocationId).trim()}`;
  }

  const cropPart = String(crop || 'wheat').toLowerCase();
  const cityPart = String(city || 'unknown').trim().toLowerCase();
  const normalizedPolygon = normalizePolygon(fieldPolygon);

  if (normalizedPolygon.length >= 3) {
    const polyPart = normalizedPolygon.map((pt) => `${pt.lat},${pt.lon}`).join('|');
    return `${cropPart}:${cityPart}:poly:${polyPart}`;
  }

  const lat = clampCoord(latitude);
  const lon = clampCoord(longitude);
  return `${cropPart}:${cityPart}:point:${lat ?? 'na'},${lon ?? 'na'}`;
};

const parseMetricNumber = (value) => {
  const num = Number(value);
  return Number.isFinite(num) ? num : null;
};

const extractOutcomeMetrics = (analysisResult) => ({
  stress_probability: parseMetricNumber(analysisResult?.prediction?.stress_probability),
  health_score: parseMetricNumber(analysisResult?.prediction?.health_score),
  potential_loss_maunds: parseMetricNumber(
    analysisResult?.field_report?.estimated_yield?.potential_loss_maunds
      ?? analysisResult?.yield_estimate?.potential_loss_if_untreated_maunds,
  ),
  expected_loss_pkr_per_acre: parseMetricNumber(
    analysisResult?.field_report?.economic_impact?.expected_loss_pkr_per_acre,
  ),
  risk_level: analysisResult?.field_report?.risk_level || null,
  days_to_critical: parseMetricNumber(analysisResult?.diagnosis?.days_to_critical),
});

const dateDiffDays = (fromDate, toDate) => {
  if (!fromDate || !toDate) return null;
  const from = new Date(fromDate);
  const to = new Date(toDate);
  if (Number.isNaN(from.getTime()) || Number.isNaN(to.getTime())) return null;
  return Math.round((to.getTime() - from.getTime()) / (1000 * 60 * 60 * 24));
};

const parseAnalysisDate = (value) => {
  if (!value) return null;
  const parsed = new Date(`${String(value).slice(0, 10)}T00:00:00Z`);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
};

const formatDateLabel = (value) => {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return date.toLocaleDateString('en-GB', { day: '2-digit', month: 'short' });
};

const buildTrendFromHistory = (historyDocs) => {
  if (!Array.isArray(historyDocs) || historyDocs.length < 2) return null;

  const latest = historyDocs[0];
  const baseline = historyDocs.slice(1).find((item) => item.action_status === 'done') || historyDocs[1];
  if (!latest || !baseline) return null;

  const latestStress = parseMetricNumber(latest.metrics?.stress_probability);
  const baselineStress = parseMetricNumber(baseline.metrics?.stress_probability);
  const latestLoss = parseMetricNumber(latest.metrics?.expected_loss_pkr_per_acre);
  const baselineLoss = parseMetricNumber(baseline.metrics?.expected_loss_pkr_per_acre);

  const stressChange = (Number.isFinite(latestStress) && Number.isFinite(baselineStress))
    ? latestStress - baselineStress
    : null;
  const lossChange = (Number.isFinite(latestLoss) && Number.isFinite(baselineLoss))
    ? latestLoss - baselineLoss
    : null;

  let trendLabel = 'Stable';
  if (Number.isFinite(stressChange) || Number.isFinite(lossChange)) {
    const improved = (Number.isFinite(stressChange) ? stressChange < 0 : false)
      && (Number.isFinite(lossChange) ? lossChange < 0 : true);
    const worsened = (Number.isFinite(stressChange) ? stressChange > 0 : false)
      && (Number.isFinite(lossChange) ? lossChange > 0 : true);
    trendLabel = improved ? 'Improving' : (worsened ? 'Worsening' : 'Mixed');
  }

  const baselineAnalysisDate = parseAnalysisDate(baseline.analysis_date);
  const latestAnalysisDate = parseAnalysisDate(latest.analysis_date);
  const useAnalysisDates = baselineAnalysisDate && latestAnalysisDate;

  const daysElapsed = useAnalysisDates
    ? dateDiffDays(baselineAnalysisDate, latestAnalysisDate)
    : dateDiffDays(baseline.createdAt, latest.createdAt);

  return {
    baseline: {
      id: baseline._id,
      created_at: baseline.createdAt,
      analysis_date: baseline.analysis_date,
      metrics: baseline.metrics,
      action_status: baseline.action_status,
      action_done_at: baseline.action_done_at,
    },
    latest: {
      id: latest._id,
      created_at: latest.createdAt,
      analysis_date: latest.analysis_date,
      metrics: latest.metrics,
      action_status: latest.action_status,
      action_done_at: latest.action_done_at,
    },
    change: {
      stress_probability: Number.isFinite(stressChange) ? Number(stressChange.toFixed(3)) : null,
      expected_loss_pkr_per_acre: Number.isFinite(lossChange) ? Math.round(lossChange) : null,
      days_elapsed: daysElapsed,
      time_basis: useAnalysisDates ? 'analysis_date' : 'saved_timestamp',
      trend: trendLabel,
    },
  };
};

const historyDateKey = (doc) => {
  if (doc?.analysis_date) return String(doc.analysis_date).slice(0, 10);
  const created = doc?.createdAt ? new Date(doc.createdAt) : null;
  if (!created || Number.isNaN(created.getTime())) return null;
  return created.toISOString().slice(0, 10);
};

const buildComparableSnapshot = (doc) => ({
  stress: parseMetricNumber(doc?.metrics?.stress_probability),
  loss: parseMetricNumber(doc?.metrics?.expected_loss_pkr_per_acre),
  risk: String(doc?.metrics?.risk_level || ''),
  polygon: normalizePolygon(doc?.field_polygon || []),
  latitude: clampCoord(doc?.location?.latitude),
  longitude: clampCoord(doc?.location?.longitude),
  costCount: Array.isArray(doc?.cost_tracker) ? doc.cost_tracker.length : 0,
  costTotal: Array.isArray(doc?.cost_tracker)
    ? doc.cost_tracker.reduce((sum, item) => {
        const amount = Number(item?.amount ?? item?.cost ?? 0);
        return sum + (Number.isFinite(amount) ? amount : 0);
      }, 0)
    : 0,
});

const hasMeaningfulChange = (aDoc, bDoc) => {
  const a = buildComparableSnapshot(aDoc);
  const b = buildComparableSnapshot(bDoc);

  if (a.risk !== b.risk) return true;
  if (Math.abs((a.stress ?? 0) - (b.stress ?? 0)) >= 0.01) return true;
  if (Math.abs((a.loss ?? 0) - (b.loss ?? 0)) >= 150) return true;

  const aPoly = JSON.stringify(a.polygon || []);
  const bPoly = JSON.stringify(b.polygon || []);
  if (aPoly !== bPoly) return true;

  if (a.latitude !== b.latitude || a.longitude !== b.longitude) return true;
  if (a.costCount !== b.costCount) return true;
  if (Math.abs((a.costTotal ?? 0) - (b.costTotal ?? 0)) >= 1) return true;

  return false;
};

const normalizeCostTracker = (value) => {
  if (!Array.isArray(value)) return undefined;
  return value
    .map((item) => {
      const amountNum = Number(item?.amount ?? item?.cost ?? 0);
      const amount = Number.isFinite(amountNum) ? amountNum : 0;
      return {
        id: item?.id ?? `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        item: String(item?.item || item?.name || '').trim(),
        category: String(item?.category || '').trim() || 'Other',
        amount,
        date: item?.date ? String(item.date).slice(0, 10) : null,
        notes: String(item?.notes || item?.note || '').trim() || null,
      };
    })
    .filter((row) => row.item && row.amount > 0);
};

const dedupeHistoryByDate = (docs) => {
  const unique = [];
  const seenByDay = new Map();

  for (const doc of docs || []) {
    const key = historyDateKey(doc) || String(doc._id);
    if (!seenByDay.has(key)) {
      seenByDay.set(key, [doc]);
      unique.push(doc);
      continue;
    }

    const sameDayDocs = seenByDay.get(key);
    const changedVsExisting = sameDayDocs.every((existing) => hasMeaningfulChange(existing, doc));
    if (changedVsExisting) {
      sameDayDocs.push(doc);
      unique.push(doc);
    }
  }
  return unique;
};

const mapOutcomeDocToHistoryEntry = (doc) => ({
  id: doc._id,
  session_id: doc.session_id,
  field_signature: doc.field_signature,
  saved_location_id: doc.saved_location_id || null,
  crop: doc.crop,
  city: doc.city,
  analysis_date: doc.analysis_date,
  created_at: doc.createdAt,
  action_status: doc.action_status,
  action_done_at: doc.action_done_at,
  action_note: doc.action_note,
  metrics: doc.metrics,
  location: doc.location,
  field_polygon: doc.field_polygon,
  diagnosis: doc?.raw_result?.diagnosis || null,
  field_report: doc?.raw_result?.field_report || null,
  recommendations: Array.isArray(doc?.raw_result?.recommendations)
    ? doc.raw_result.recommendations
    : [],
  stage_checklist: doc?.raw_result?.stage_checklist || null,
  full_report: doc?.raw_result || null,
  cost_tracker: doc?.cost_tracker || null,
  heatmap: {
    fetched: !!doc?.raw_result?.heatmap?.fetched,
    type: doc?.raw_result?.heatmap?.type || null,
    tile_url: doc?.raw_result?.heatmap?.tile_url || null,
    opacity: doc?.raw_result?.heatmap?.opacity ?? null,
    legend: doc?.raw_result?.heatmap?.legend || null,
  },
});

const mapOutcomeDocToFieldSummary = (doc, totalRuns) => ({
  saved_location_id: doc.saved_location_id || null,
  field_signature: doc.field_signature,
  crop: doc.crop,
  city: doc.city,
  total_runs: totalRuns,
  latest_analysis_date: doc.analysis_date,
  latest_saved_at: doc.createdAt,
  latest_action_status: doc.action_status,
  latest_metrics: doc.metrics,
  location: doc.location,
  field_polygon: doc.field_polygon,
  latest_heatmap_available: !!doc?.raw_result?.heatmap?.tile_url,
});

// POST /api/satellite/analyze
// Body: { crop, city, latitude, longitude } or legacy { lat, lon, crop, city, month?, analysis_date? }
router.post('/analyze', async (req, res) => {
  try {
    const responseLanguage = resolveRequestLanguage(req);
    const { lat, lon, latitude, longitude, crop, city, month, analysis_date, field_polygon } = req.body;
    const finalLatitude = latitude ?? lat;
    const finalLongitude = longitude ?? lon;

    if (finalLatitude === undefined || finalLatitude === null || finalLongitude === undefined || finalLongitude === null) {
      return res.status(400).json({ status: 'error', error: 'latitude and longitude are required' });
    }

    const payload = {
      latitude: parseFloat(finalLatitude),
      longitude: parseFloat(finalLongitude),
      crop: (crop || 'wheat').toLowerCase(),
      ...(city ? { city } : {}),
      ...(month !== undefined && month !== null && { month: parseInt(month) }),
      ...(analysis_date ? { analysis_date } : {}),
      ...(Array.isArray(field_polygon) && field_polygon.length >= 3 ? { field_polygon } : {}),
    };

    if (req.app?.locals?.weatherController) {
      try {
        let weatherData = null;

        if (city) {
          weatherData = await req.app.locals.weatherController.getRealTimeWeather(city, 7);
        }

        // Coordinates-only analyses should still get weather enrichment.
        if ((!Array.isArray(weatherData?.forecast) || weatherData.forecast.length === 0)
          && Number.isFinite(payload.latitude)
          && Number.isFinite(payload.longitude)
          && typeof req.app.locals.weatherController.getRealTimeWeatherByCoords === 'function') {
          weatherData = await req.app.locals.weatherController.getRealTimeWeatherByCoords(
            payload.latitude,
            payload.longitude,
            7,
          );
        }

        if (Array.isArray(weatherData?.forecast) && weatherData.forecast.length > 0) {
          payload.weather_data = weatherData.forecast;
        }
      } catch (weatherError) {
        console.warn(
          `Weather enrichment skipped for satellite analysis (${city || `${payload.latitude},${payload.longitude}`}):`,
          weatherError.message,
        );
      }
    }

    console.log(`🛰️  Satellite analysis request: (${payload.latitude}, ${payload.longitude}) crop=${payload.crop}`);

    const response = await axios.post(`${ML_SERVICE_URL}/satellite/analyze`, payload, {
      timeout: 90000,
    });

    const result = response.data;

    // Backfill economic impact if an older ML service payload omits it.
    if (result?.field_report && !result.field_report.economic_impact) {
      const cropKey = String(payload.crop || 'wheat').toLowerCase();
      const pricePerMaund = {
        wheat: 3900,
        maize: 2800,
        rice: 5200,
        cotton: 8500,
        sugarcane: 450,
      }[cropKey] || 3900;

      const estMaunds = Number(
        result?.field_report?.estimated_yield?.maunds_per_acre
        ?? result?.yield_estimate?.estimated_maunds_per_acre
      );
      const lossMaunds = Number(
        result?.field_report?.estimated_yield?.potential_loss_maunds
        ?? result?.yield_estimate?.potential_loss_if_untreated_maunds
      );

      const expectedRevenue = Number.isFinite(estMaunds) ? estMaunds * pricePerMaund : null;
      const expectedLoss = Number.isFinite(lossMaunds) ? lossMaunds * pricePerMaund : null;
      const lower = Number.isFinite(expectedLoss) ? Math.max(0, expectedLoss * 0.8 - 1200) : null;
      const upper = Number.isFinite(expectedLoss) ? Math.max(0, expectedLoss * 1.2 + 1200) : null;

      result.field_report.economic_impact = {
        expected_revenue_pkr_per_acre: Number.isFinite(expectedRevenue) ? Math.round(expectedRevenue) : null,
        expected_loss_pkr_per_acre: Number.isFinite(expectedLoss) ? Math.round(expectedLoss) : null,
        expected_savings_range_pkr_per_acre: {
          lower: Number.isFinite(lower) ? Math.round(lower) : null,
          upper: Number.isFinite(upper) ? Math.round(upper) : null,
        },
        upside_pkr_per_acre: Number.isFinite(upper) ? Math.round(upper) : null,
        downside_pkr_per_acre: Number.isFinite(lower) ? Math.round(lower) : null,
        pricing_assumptions: {
          crop: cropKey,
          price_per_maund_pkr: pricePerMaund,
          source: 'node_fallback',
        },
      };
    }

    const districtName = city || result?.soil_context?.district || null;
    const cropLabel = payload.crop.charAt(0).toUpperCase() + payload.crop.slice(1);

    if (districtName && req.app?.locals?.buildDistrictSoilTrendSummary) {
      result.soil_trends = req.app.locals.buildDistrictSoilTrendSummary(districtName);
    }

    if (districtName && req.app?.locals?.soilAnalysisService && result?.is_field === true) {
      try {
        const soilAnalysis = await req.app.locals.soilAnalysisService.analyzeDistrict(districtName, cropLabel);
        if (soilAnalysis?.success) {
          result.soil_analysis = soilAnalysis;
        } else {
          result.soil_analysis_unavailable = {
            district: districtName,
            reason: soilAnalysis?.error || soilAnalysis?.message || 'Soil analysis unavailable for this district',
          };
        }
      } catch (soilError) {
        console.warn(`Soil enrichment skipped for satellite analysis (${districtName}):`, soilError.message);
        result.soil_analysis_unavailable = {
          district: districtName,
          reason: soilError.message,
        };
      }
    }

    const localizedResult = responseLanguage === 'ur'
      ? localizeSatellitePayloadToUrdu(result)
      : result;

    res.json(localizedResult);
  } catch (error) {
    console.error('Satellite analysis error:', error.message);
    const status = error.response?.status || 500;
    const message = error.response?.data?.error || error.message;
    res.status(status).json({ status: 'error', error: message });
  }
});

// GET /api/satellite/health
router.get('/health', async (req, res) => {
  try {
    const response = await axios.get(`${ML_SERVICE_URL}/satellite/health`, { timeout: 5000 });
    res.json(response.data);
  } catch {
    res.json({ success: true, model_loaded: false, gee_initialized: false });
  }
});

// POST /api/satellite/alerts/email
router.post('/alerts/email', protect, async (req, res) => {
  try {
    const { payload } = req.body || {};
    if (!payload) {
      return res.status(400).json({ success: false, error: 'payload is required' });
    }

    const city = payload.city || payload.location || 'Unknown City';
    const severity = payload.severity || 'Alert';
    const dateLabel = payload.dateLabel || formatDateLabel(payload.analysisDate) || formatDateLabel(new Date());
    const subject = payload.subject || `${severity} Alert - ${city} - ${dateLabel || 'Today'}`;

    const alertPayload = {
      ...payload,
      city,
      subject,
      date: dateLabel || payload.date || 'Today',
      generatedAt: payload.generatedAt || new Date().toLocaleString('en-GB'),
      reason: payload.reason || 'Based on your latest satellite analysis',
    };

    const email = req.user?.email;
    if (!email) {
      return res.status(400).json({ success: false, error: 'User email not found' });
    }

    const response = await sendSatelliteAlertEmail(email, alertPayload);
    if (!response.success) {
      return res.status(500).json({ success: false, error: response.error || 'Failed to send alert' });
    }

    return res.status(200).json({ success: true, messageId: response.messageId });
  } catch (error) {
    console.error('Satellite alert email error:', error.message);
    return res.status(500).json({ success: false, error: error.message });
  }
});

// POST /api/satellite/outcomes
router.post('/outcomes', optionalAuth, async (req, res) => {
  try {
    const {
      session_id,
      user_id,
      saved_location_id,
      crop,
      city,
      latitude,
      longitude,
      field_polygon,
      analysis_date,
      cost_tracker,
      result,
    } = req.body || {};

    if (!session_id || !result || !crop) {
      return res.status(400).json({
        success: false,
        error: 'session_id, crop, and result are required',
      });
    }

    const normalizedSavedLocationId = saved_location_id ? String(saved_location_id) : null;

    const fieldSignature = buildFieldSignature({
      crop,
      city,
      latitude,
      longitude,
      fieldPolygon: field_polygon,
      savedLocationId: normalizedSavedLocationId,
    });

    const legacyFieldSignature = buildFieldSignature({
      crop,
      city,
      latitude,
      longitude,
      fieldPolygon: field_polygon,
    });

    const metrics = extractOutcomeMetrics(result);
    const normalizedCostTracker = normalizeCostTracker(cost_tracker);

    const normalizedAnalysisDate = analysis_date ? String(analysis_date).slice(0, 10) : null;

    const resolvedUserId = user_id || req.user?._id || undefined;
    let outcome;
    if (normalizedAnalysisDate) {
      const existing = await SatelliteOutcome.findOne({
        session_id,
        field_signature: fieldSignature,
        analysis_date: normalizedAnalysisDate,
      }).lean();

      const costTrackerForSave = normalizedCostTracker !== undefined
        ? (normalizedCostTracker.length > 0 ? normalizedCostTracker : null)
        : (Array.isArray(existing?.cost_tracker) ? existing.cost_tracker : null);

      outcome = await SatelliteOutcome.findOneAndUpdate(
        {
          session_id,
          field_signature: fieldSignature,
          analysis_date: normalizedAnalysisDate,
        },
        {
          $set: {
            user_id: resolvedUserId,
            saved_location_id: normalizedSavedLocationId,
            crop: String(crop || '').toLowerCase(),
            city: city || null,
            location: {
              latitude: clampCoord(latitude),
              longitude: clampCoord(longitude),
            },
            field_polygon: normalizePolygon(field_polygon),
            analysis_date: normalizedAnalysisDate,
            metrics,
            cost_tracker: costTrackerForSave,
            raw_result: result,
          },
        },
        { new: true, upsert: true, setDefaultsOnInsert: true },
      );
    } else {
       const existing = await SatelliteOutcome.findOne({
         session_id,
         field_signature: fieldSignature,
         analysis_date: null,
       }).lean();
     
       const costTrackerForSave = normalizedCostTracker !== undefined
         ? (normalizedCostTracker.length > 0 ? normalizedCostTracker : null)
         : (Array.isArray(existing?.cost_tracker) ? existing.cost_tracker : null);

       outcome = await SatelliteOutcome.findOneAndUpdate(
         {
           session_id,
           field_signature: fieldSignature,
           analysis_date: null,
         },
         {
           $set: {
             user_id: resolvedUserId,
             saved_location_id: normalizedSavedLocationId,
             crop: String(crop || '').toLowerCase(),
             city: city || null,
             location: {
               latitude: clampCoord(latitude),
               longitude: clampCoord(longitude),
             },
             field_polygon: normalizePolygon(field_polygon),
             analysis_date: null,
             metrics,
             cost_tracker: costTrackerForSave,
             raw_result: result,
           },
         },
         { new: true, upsert: true, setDefaultsOnInsert: true },
       );
    }

    if (normalizedSavedLocationId) {
      const backfillOrClauses = [{ field_signature: legacyFieldSignature }];
      const normalizedLat = clampCoord(latitude);
      const normalizedLon = clampCoord(longitude);
      if (Number.isFinite(normalizedLat) && Number.isFinite(normalizedLon)) {
        backfillOrClauses.push({
          crop: String(crop || '').toLowerCase(),
          'location.latitude': normalizedLat,
          'location.longitude': normalizedLon,
        });
      }

      const backfillQuery = {
        session_id: String(session_id),
        saved_location_id: null,
        $or: backfillOrClauses,
      };

      await SatelliteOutcome.updateMany(backfillQuery, {
        $set: {
          saved_location_id: normalizedSavedLocationId,
          field_signature: fieldSignature,
        },
      });
    }

    // Backfill missing user links for this session so admin analytics can map activity.
    if (resolvedUserId) {
      await SatelliteOutcome.updateMany(
        {
          session_id: String(session_id),
          $or: [{ user_id: null }, { user_id: { $exists: false } }],
        },
        {
          $set: {
            user_id: resolvedUserId,
          },
        },
      );
    }

    return res.status(201).json({
      success: true,
      outcome: {
        id: outcome._id,
        session_id: outcome.session_id,
        field_signature: outcome.field_signature,
        saved_location_id: outcome.saved_location_id || null,
        action_status: outcome.action_status,
        created_at: outcome.createdAt,
        metrics: outcome.metrics,
      },
    });
  } catch (error) {
    console.error('Satellite outcome save error:', error.message);
    return res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

// GET /api/satellite/outcomes/history?session_id=...&field_signature=...&limit=50
router.get('/outcomes/history', async (req, res) => {
  try {
    const responseLanguage = resolveRequestLanguage(req);
    const { session_id, field_signature, saved_location_id, crop, city, latitude, longitude, limit = 50, all_fields } = req.query;

    if (!session_id) {
      return res.status(400).json({ success: false, error: 'session_id is required' });
    }

    const query = { session_id: String(session_id) };
    const includeAllFields = String(all_fields || '').toLowerCase() === 'true';

    if (includeAllFields) {
      // No field filter; return multi-field history for farmer dashboard.
    } else if (saved_location_id) {
      query.saved_location_id = String(saved_location_id);
    } else if (field_signature) {
      query.field_signature = String(field_signature);
    } else if (crop) {
      query.field_signature = buildFieldSignature({
        crop,
        city,
        latitude,
        longitude,
      });
    } else {
      return res.status(400).json({
        success: false,
        error: 'saved_location_id, field_signature, or crop+location must be provided',
      });
    }

    const cappedLimit = Math.min(Math.max(parseInt(limit, 10) || 50, 2), includeAllFields ? 300 : 120);

    const docsRaw = await SatelliteOutcome.find(query)
      .sort({ createdAt: -1 })
      .limit(cappedLimit)
      .lean();

    if (includeAllFields) {
      const grouped = new Map();

      for (const doc of docsRaw) {
        const groupKey = String(doc.saved_location_id || doc.field_signature || 'unknown');
        if (!grouped.has(groupKey)) {
          grouped.set(groupKey, []);
        }
        grouped.get(groupKey).push(doc);
      }

      const field_summaries = [];
      const history = [];
      for (const docs of grouped.values()) {
        const uniqueDocs = dedupeHistoryByDate(docs);
        if (uniqueDocs.length === 0) continue;

        const fieldSummary = mapOutcomeDocToFieldSummary(uniqueDocs[0], uniqueDocs.length);
        field_summaries.push(
          responseLanguage === 'ur'
            ? localizeSatellitePayloadToUrdu(fieldSummary)
            : fieldSummary,
        );
        uniqueDocs.forEach((doc) => {
          const historyEntry = mapOutcomeDocToHistoryEntry(doc);
          history.push(
            responseLanguage === 'ur'
              ? localizeSatellitePayloadToUrdu(historyEntry)
              : historyEntry,
          );
        });
      }

      return res.json({
        success: true,
        all_fields: true,
        field_summaries,
        history,
      });
    }

    const docs = dedupeHistoryByDate(docsRaw);

    const mappedHistory = docs.map((doc) => {
      const historyEntry = mapOutcomeDocToHistoryEntry(doc);
      return responseLanguage === 'ur'
        ? localizeSatellitePayloadToUrdu(historyEntry)
        : historyEntry;
    });

    const trend = buildTrendFromHistory(docs);
    const localizedTrend = responseLanguage === 'ur'
      ? localizeSatellitePayloadToUrdu(trend)
      : trend;

    return res.json({
      success: true,
      field_signature: query.field_signature,
      saved_location_id: query.saved_location_id || null,
      history: mappedHistory,
      trend: localizedTrend,
    });
  } catch (error) {
    console.error('Satellite outcome history error:', error.message);
    return res.status(500).json({ success: false, error: error.message });
  }
});

// PATCH /api/satellite/outcomes/:id/action
router.patch('/outcomes/:id/action', async (req, res) => {
  try {
    const { id } = req.params;
    const { action_status, action_note } = req.body || {};

    if (!['pending', 'done'].includes(action_status)) {
      return res.status(400).json({ success: false, error: 'action_status must be pending or done' });
    }

    const updates = {
      action_status,
      action_note: String(action_note || '').trim(),
      action_done_at: action_status === 'done' ? new Date() : null,
    };

    const updated = await SatelliteOutcome.findByIdAndUpdate(id, updates, { new: true }).lean();
    if (!updated) {
      return res.status(404).json({ success: false, error: 'Outcome record not found' });
    }

    return res.json({
      success: true,
      outcome: {
        id: updated._id,
        action_status: updated.action_status,
        action_done_at: updated.action_done_at,
        action_note: updated.action_note,
        field_signature: updated.field_signature,
      },
    });
  } catch (error) {
    console.error('Satellite outcome action update error:', error.message);
    return res.status(500).json({ success: false, error: error.message });
  }
});

// ── Farm Location Management Routes ──────────────────────────────────────────

// POST /api/satellite/location - Save a new farm location
router.post('/location', protect, async (req, res) => {
  try {
    const { name, description, latitude, longitude, polygon, city, crop } = req.body;
    const userId = req.user.id;

    // Validate required fields
    if (!name || latitude === undefined || longitude === undefined) {
      return res.status(400).json({
        success: false,
        error: 'name, latitude, and longitude are required'
      });
    }

    // Find user and add location
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    // Normalize polygon if provided
    const normalizedPolygon = Array.isArray(polygon) && polygon.length >= 3
      ? polygon.map(pt => ({
          lat: clampCoord(pt?.lat),
          lon: clampCoord(pt?.lon)
        })).filter(pt => Number.isFinite(pt.lat) && Number.isFinite(pt.lon))
      : [];

    const newLocation = {
      name: String(name).trim(),
      description: description ? String(description).trim() : '',
      latitude: clampCoord(latitude),
      longitude: clampCoord(longitude),
      polygon: normalizedPolygon,
      city: city ? String(city).trim() : '',
      crop: crop ? String(crop).toLowerCase() : ''
    };

    const nameKey = String(newLocation.name || '').trim().toLowerCase();
    const duplicateName = (user.farmLocations || []).some((loc) =>
      String(loc?.name || '').trim().toLowerCase() === nameKey
    );
    if (duplicateName) {
      return res.status(409).json({
        success: false,
        error: 'A field with this name already exists. Please choose a different name.',
      });
    }

    const COORD_TOLERANCE = 0.00005;
    const duplicateCoords = (user.farmLocations || []).some((loc) => {
      const lat = Number(loc?.latitude);
      const lon = Number(loc?.longitude);
      return Number.isFinite(lat)
        && Number.isFinite(lon)
        && Math.abs(lat - Number(newLocation.latitude)) <= COORD_TOLERANCE
        && Math.abs(lon - Number(newLocation.longitude)) <= COORD_TOLERANCE;
    });
    if (duplicateCoords) {
      return res.status(409).json({
        success: false,
        error: 'A field at these coordinates is already saved.',
      });
    }

    // Add to user's farmLocations array
    user.farmLocations.push(newLocation);
    await user.save();

    const savedLocation = user.farmLocations[user.farmLocations.length - 1];

    return res.status(201).json({
      success: true,
      location: {
        id: savedLocation._id,
        name: savedLocation.name,
        description: savedLocation.description,
        latitude: savedLocation.latitude,
        longitude: savedLocation.longitude,
        polygon: savedLocation.polygon,
        city: savedLocation.city,
        crop: savedLocation.crop,
        createdAt: savedLocation.createdAt
      }
    });
  } catch (error) {
    console.error('Save farm location error:', error.message);
    return res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// GET /api/satellite/locations - Fetch all farmer's saved locations
router.get('/locations', protect, async (req, res) => {
  try {
    const userId = req.user.id;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    const locations = (user.farmLocations || []).map(loc => ({
      id: loc._id,
      name: loc.name,
      description: loc.description,
      latitude: loc.latitude,
      longitude: loc.longitude,
      polygon: loc.polygon,
      city: loc.city,
      crop: loc.crop,
      createdAt: loc.createdAt
    }));

    return res.status(200).json({
      success: true,
      locations
    });
  } catch (error) {
    console.error('Fetch farm locations error:', error.message);
    return res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// GET /api/satellite/location/:locationId - Fetch a specific farm location
router.get('/location/:locationId', protect, async (req, res) => {
  try {
    const userId = req.user.id;
    const { locationId } = req.params;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    const location = user.farmLocations.find(loc => String(loc._id) === String(locationId));
    if (!location) {
      return res.status(404).json({
        success: false,
        error: 'Location not found'
      });
    }

    return res.status(200).json({
      success: true,
      location: {
        id: location._id,
        name: location.name,
        description: location.description,
        latitude: location.latitude,
        longitude: location.longitude,
        polygon: location.polygon,
        city: location.city,
        crop: location.crop,
        createdAt: location.createdAt
      }
    });
  } catch (error) {
    console.error('Fetch farm location error:', error.message);
    return res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// PUT /api/satellite/location/:locationId - Update a farm location
router.put('/location/:locationId', protect, async (req, res) => {
  try {
    const userId = req.user.id;
    const { locationId } = req.params;
    const { name, description, latitude, longitude, polygon, city, crop } = req.body;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    const locationIndex = user.farmLocations.findIndex(loc => String(loc._id) === String(locationId));
    if (locationIndex === -1) {
      return res.status(404).json({
        success: false,
        error: 'Location not found'
      });
    }

    const currentLocation = user.farmLocations[locationIndex];
    const nextName = name ? String(name).trim() : String(currentLocation?.name || '').trim();
    const nextLatitude = latitude !== undefined ? clampCoord(latitude) : currentLocation?.latitude;
    const nextLongitude = longitude !== undefined ? clampCoord(longitude) : currentLocation?.longitude;

    const nextNameKey = String(nextName || '').trim().toLowerCase();
    const duplicateName = (user.farmLocations || []).some((loc, idx) => {
      if (idx === locationIndex) return false;
      return String(loc?.name || '').trim().toLowerCase() === nextNameKey;
    });
    if (duplicateName) {
      return res.status(409).json({
        success: false,
        error: 'A field with this name already exists. Please choose a different name.',
      });
    }

    const COORD_TOLERANCE = 0.00005;
    const duplicateCoords = (user.farmLocations || []).some((loc, idx) => {
      if (idx === locationIndex) return false;
      const lat = Number(loc?.latitude);
      const lon = Number(loc?.longitude);
      return Number.isFinite(lat)
        && Number.isFinite(lon)
        && Math.abs(lat - Number(nextLatitude)) <= COORD_TOLERANCE
        && Math.abs(lon - Number(nextLongitude)) <= COORD_TOLERANCE;
    });
    if (duplicateCoords) {
      return res.status(409).json({
        success: false,
        error: 'A field at these coordinates is already saved.',
      });
    }

    // Update fields
    if (name) user.farmLocations[locationIndex].name = String(name).trim();
    if (description !== undefined) user.farmLocations[locationIndex].description = String(description).trim();
    if (latitude !== undefined) user.farmLocations[locationIndex].latitude = clampCoord(latitude);
    if (longitude !== undefined) user.farmLocations[locationIndex].longitude = clampCoord(longitude);
    if (Array.isArray(polygon) && polygon.length >= 3) {
      user.farmLocations[locationIndex].polygon = polygon.map(pt => ({
        lat: clampCoord(pt?.lat),
        lon: clampCoord(pt?.lon)
      })).filter(pt => Number.isFinite(pt.lat) && Number.isFinite(pt.lon));
    }
    if (city) user.farmLocations[locationIndex].city = String(city).trim();
    if (crop) user.farmLocations[locationIndex].crop = String(crop).toLowerCase();

    await user.save();

    const updated = user.farmLocations[locationIndex];
    return res.status(200).json({
      success: true,
      location: {
        id: updated._id,
        name: updated.name,
        description: updated.description,
        latitude: updated.latitude,
        longitude: updated.longitude,
        polygon: updated.polygon,
        city: updated.city,
        crop: updated.crop,
        createdAt: updated.createdAt
      }
    });
  } catch (error) {
    console.error('Update farm location error:', error.message);
    return res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// DELETE /api/satellite/location/:locationId - Delete a farm location
router.delete('/location/:locationId', protect, async (req, res) => {
  try {
    const userId = req.user.id;
    const { locationId } = req.params;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    const locationIndex = user.farmLocations.findIndex(loc => String(loc._id) === String(locationId));
    if (locationIndex === -1) {
      return res.status(404).json({
        success: false,
        error: 'Location not found'
      });
    }

    // Remove the location and keep a copy to identify related outcomes
    const [removedLocation] = user.farmLocations.splice(locationIndex, 1);
    await user.save();

    // Attempt to delete any SatelliteOutcome docs that reference this saved location
    try {
      const savedFieldSignature = buildFieldSignature({ savedLocationId: locationId });
      const signature = buildFieldSignature({
        crop: removedLocation?.crop,
        city: removedLocation?.city,
        latitude: removedLocation?.latitude,
        longitude: removedLocation?.longitude,
        fieldPolygon: removedLocation?.polygon,
      });

      const deleteClauses = [{ saved_location_id: String(locationId) }];
      if (savedFieldSignature) {
        deleteClauses.push({ field_signature: savedFieldSignature });
      }
      if (signature) {
        deleteClauses.push({
          field_signature: signature,
          $or: [
            { user_id: userId },
            { user_id: null },
            { user_id: { $exists: false } },
          ],
        });
      }

      await SatelliteOutcome.deleteMany({ $or: deleteClauses });
    } catch (delErr) {
      console.warn('Failed to remove related satellite outcomes for deleted location', locationId, delErr.message);
    }

    return res.status(200).json({
      success: true,
      message: 'Location deleted successfully'
    });
  } catch (error) {
    console.error('Delete farm location error:', error.message);
    return res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

module.exports = router;
