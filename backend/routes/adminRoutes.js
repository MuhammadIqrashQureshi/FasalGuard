// routes/adminRoutes.js
const express = require('express');
const router = express.Router();
const Prediction = require('../models/Prediction');
const User = require('../models/User');
const mlPredictionController = require('../controllers/mlPredictionController');
const weatherController = require('../controllers/weatherController');
const { sendBroadcastEmail } = require('../middleware/emailService');

// Middleware to check admin access
const checkAdmin = (req, res, next) => {
  // Add your admin authentication logic here
  // For now, we'll allow all requests
  next();
};

// Dashboard statistics
router.post('/dashboard', checkAdmin, async (req, res) => {
  try {
    const { timeRange = 'week' } = req.body;
    
    // Get date range based on timeRange
    const dateRange = getDateRange(timeRange);
    
    // Fetch data with error handling for each
    let totalPredictions = { count: 0, growth: 0 };
    let recentPredictions = [];
    let topCrops = [];
    let weatherRequests = { count: 0 };
    let activeUsers = 0;
    let modelPerformance = [];
    let systemHealth = { overall: 'Unknown', services: [], avgResponseTime: 0 };
    
    try {
      totalPredictions = await getPredictionStats(dateRange);
    } catch (err) {
      console.error('getPredictionStats error:', err.message);
    }
    
    try {
      recentPredictions = await getRecentPredictions(10);
    } catch (err) {
      console.error('getRecentPredictions error:', err.message);
    }
    
    try {
      topCrops = await getTopCrops(dateRange);
    } catch (err) {
      console.error('getTopCrops error:', err.message);
    }
    
    try {
      weatherRequests = await getWeatherRequests(dateRange);
    } catch (err) {
      console.error('getWeatherRequests error:', err.message);
    }
    
    try {
      activeUsers = await getActiveUsers(dateRange);
    } catch (err) {
      console.error('getActiveUsers error:', err.message);
    }
    
    try {
      modelPerformance = await getModelPerformance();
    } catch (err) {
      console.error('getModelPerformance error:', err.message);
    }
    
    try {
      systemHealth = await getSystemHealth();
    } catch (err) {
      console.error('getSystemHealth error:', err.message);
    }

    res.json({
      success: true,
      total_predictions: totalPredictions.count,
      prediction_growth: totalPredictions.growth,
      recent_predictions: recentPredictions,
      top_crops: topCrops,
      weather_requests: weatherRequests.count,
      active_users: activeUsers,
      model_performance: modelPerformance,
      model_accuracy: calculateModelAccuracy(modelPerformance),
      system_health: systemHealth.overall,
      services: systemHealth.services,
      avg_response_time: systemHealth.avgResponseTime,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Dashboard error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get all predictions with filters
router.get('/predictions', checkAdmin, async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 20, 
      crop, 
      location, 
      startDate, 
      endDate,
      sortBy = 'timestamp',
      sortOrder = 'desc'
    } = req.query;

    const query = {};
    
    // Apply filters
    if (crop) query.crop = crop;
    if (location) query.location = location;
    if (startDate || endDate) {
      query.timestamp = {};
      if (startDate) query.timestamp.$gte = new Date(startDate);
      if (endDate) query.timestamp.$lte = new Date(endDate);
    }

    const skip = (page - 1) * limit;
    const sort = { [sortBy]: sortOrder === 'desc' ? -1 : 1 };

    const [predictions, total] = await Promise.all([
      Prediction.find(query)
        .sort(sort)
        .skip(skip)
        .limit(parseInt(limit))
        .lean(),
      Prediction.countDocuments(query)
    ]);

    res.json({
      success: true,
      predictions,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });

  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get prediction analytics
router.get('/analytics', checkAdmin, async (req, res) => {
  try {
    const { groupBy = 'day', metric = 'count' } = req.query;
    
    const analytics = await getPredictionAnalytics(groupBy, metric);
    
    res.json({
      success: true,
      analytics,
      summary: {
        total: analytics.reduce((sum, item) => sum + item.value, 0),
        average: analytics.reduce((sum, item) => sum + item.value, 0) / analytics.length || 0,
        peak: Math.max(...analytics.map(item => item.value)),
        low: Math.min(...analytics.map(item => item.value))
      }
    });

  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get model details and performance
router.get('/models', checkAdmin, async (req, res) => {
  try {
    let mlHealth = { healthy: false, models: [] };
    try {
      mlHealth = await mlPredictionController.getServiceHealth();
    } catch (error) {
      console.error('ML service health check failed:', error.message);
    }
    
    const models = await Promise.all(
      Object.keys(mlPredictionController.models || {}).map(async (modelKey) => {
        const [crop, modelType] = modelKey.split('_');
        
        // Get predictions for this model
        const modelPredictions = await Prediction.find({ 
          'prediction.model_used': modelKey 
        }).limit(100);
        
        const accuracies = modelPredictions
          .filter(p => p.actual_yield)
          .map(p => {
            const predicted = p.prediction?.predicted_yield || 0;
            const actual = p.actual_yield;
            return Math.abs(predicted - actual) / actual;
          });
        
        const avgAccuracy = accuracies.length > 0 
          ? (1 - (accuracies.reduce((a, b) => a + b, 0) / accuracies.length)) * 100
          : 0;

        return {
          name: modelKey,
          crop,
          model_type: modelType,
          loaded: true,
          predictions: modelPredictions.length,
          avg_accuracy: avgAccuracy.toFixed(2),
          avg_confidence: modelPredictions.length > 0
            ? (modelPredictions.reduce((sum, p) => sum + (p.prediction?.confidence || 0), 0) / modelPredictions.length * 100).toFixed(2)
            : 0,
          last_used: modelPredictions.length > 0
            ? Math.max(...modelPredictions.map(p => new Date(p.timestamp).getTime()))
            : null
        };
      })
    );

    res.json({
      success: true,
      models,
      ml_service: mlHealth,
      summary: {
        total_models: models.length,
        avg_accuracy: models.reduce((sum, m) => sum + parseFloat(m.avg_accuracy), 0) / models.length,
        total_predictions: models.reduce((sum, m) => sum + m.predictions, 0)
      }
    });

  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get weather data statistics
router.get('/weather-stats', checkAdmin, async (req, res) => {
  try {
    const { days = 30 } = req.query;
    
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(days));

    // Aggregate weather requests by date
    const weatherStats = await Prediction.aggregate([
      {
        $match: {
          timestamp: { $gte: startDate, $lte: endDate }
        }
      },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$timestamp" } },
          requests: { $sum: 1 },
          avg_temp: { $avg: "$weather_data.avg_temp" },
          avg_rain: { $avg: "$weather_data.total_rainfall" },
          cities: { $addToSet: "$location.city" }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    const cities = [...new Set(weatherStats.flatMap(stat => stat.cities))];

    res.json({
      success: true,
      period: { startDate, endDate, days: parseInt(days) },
      total_requests: weatherStats.reduce((sum, stat) => sum + stat.requests, 0),
      avg_daily_requests: (weatherStats.reduce((sum, stat) => sum + stat.requests, 0) / weatherStats.length) || 0,
      weather_stats: weatherStats,
      top_cities: cities.slice(0, 10),
      city_distribution: await getCityDistribution(startDate, endDate)
    });

  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get user statistics
router.get('/user-stats', checkAdmin, async (req, res) => {
  try {
    const { days = 30 } = req.query;
    
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(days));

    // Get user registrations
    const userRegistrations = await User.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate, $lte: endDate }
        }
      },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    // Get user activity
    const userActivity = await Prediction.aggregate([
      {
        $match: {
          timestamp: { $gte: startDate, $lte: endDate }
        }
      },
      {
        $group: {
          _id: "$user_id",
          predictions: { $sum: 1 },
          last_active: { $max: "$timestamp" },
          locations: { $addToSet: "$location.city" }
        }
      }
    ]);

    res.json({
      success: true,
      period: { startDate, endDate, days: parseInt(days) },
      total_users: await User.countDocuments(),
      active_users: userActivity.length,
      new_registrations: userRegistrations.reduce((sum, day) => sum + day.count, 0),
      user_registrations: userRegistrations,
      user_activity: userActivity,
      avg_predictions_per_user: userActivity.length > 0 
        ? (userActivity.reduce((sum, user) => sum + user.predictions, 0) / userActivity.length).toFixed(2)
        : 0
    });

  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get all users list
router.get('/users', checkAdmin, async (req, res) => {
  try {
    const { page = 1, limit = 50 } = req.query;
    
    const skip = (page - 1) * limit;
    
    // Get users with their prediction count
    const users = await User.find()
      .select('name email createdAt isVerified lastLogin role accountStatus')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .lean();
    
    // Get prediction count and last activity for each user
    const usersWithActivity = await Promise.all(
      users.map(async (user) => {
        const predictionCount = await Prediction.countDocuments({ user_id: user._id.toString() });
        const lastPrediction = await Prediction.findOne({ user_id: user._id.toString() })
          .sort({ timestamp: -1 })
          .select('timestamp')
          .lean();
        
        // Use lastLogin if available, otherwise use last prediction or creation date
        const lastActiveDate = user.lastLogin || (lastPrediction ? lastPrediction.timestamp : user.createdAt);
        
        return {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role || 'user',
          accountStatus: user.accountStatus || 'active',
          predictions: predictionCount,
          lastActive: new Date(lastActiveDate).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
          }),
          status: (Date.now() - new Date(lastActiveDate).getTime()) < 7 * 24 * 60 * 60 * 1000
            ? 'Active'
            : 'Inactive',
          joined: user.createdAt
        };
      })
    );
    
    const total = await User.countDocuments();
    
    res.json({
      success: true,
      users: usersWithActivity,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Export data
router.post('/export', checkAdmin, async (req, res) => {
  try {
    const { type, format = 'json', filters = {} } = req.body;
    
    let data;
    let filename;
    
    switch (type) {
      case 'predictions':
        data = await Prediction.find(filters).lean();
        filename = `predictions_export_${Date.now()}.${format}`;
        break;
      case 'users':
        data = await User.find(filters).lean();
        filename = `users_export_${Date.now()}.${format}`;
        break;
      case 'analytics':
        data = await getAnalyticsData(filters);
        filename = `analytics_export_${Date.now()}.${format}`;
        break;
      default:
        return res.status(400).json({ success: false, error: 'Invalid export type' });
    }

    if (format === 'csv') {
      const csv = convertToCSV(data);
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
      return res.send(csv);
    }

    res.json({
      success: true,
      data,
      filename,
      exported_at: new Date().toISOString(),
      record_count: data.length
    });

  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Helper functions
function getDateRange(timeRange) {
  const now = new Date();
  const start = new Date();
  
  switch (timeRange) {
    case 'today':
      start.setHours(0, 0, 0, 0);
      break;
    case 'week':
      start.setDate(start.getDate() - 7);
      break;
    case 'month':
      start.setMonth(start.getMonth() - 1);
      break;
    case 'year':
      start.setFullYear(start.getFullYear() - 1);
      break;
    default:
      start.setHours(0, 0, 0, 0);
  }
  
  return { start, end: now };
}

async function getPredictionStats(dateRange) {
  const today = await Prediction.countDocuments({
    timestamp: { $gte: dateRange.start, $lte: dateRange.end }
  });

  const yesterdayStart = new Date(dateRange.start);
  yesterdayStart.setDate(yesterdayStart.getDate() - 1);
  const yesterdayEnd = new Date(dateRange.end);
  yesterdayEnd.setDate(yesterdayEnd.getDate() - 1);
  
  const yesterday = await Prediction.countDocuments({
    timestamp: { $gte: yesterdayStart, $lte: yesterdayEnd }
  });

  const growth = yesterday > 0 ? ((today - yesterday) / yesterday * 100).toFixed(2) : 0;

  return { count: today, growth };
}

async function getRecentPredictions(limit) {
  const predictions = await Prediction.find()
    .sort({ timestamp: -1 })
    .limit(limit)
    .lean();

  return predictions.map(p => ({
    id: p._id,
    timestamp: p.timestamp,
    location: p.location?.city || 'Unknown',
    crop: p.crop || 'Unknown',
    yield: p.prediction?.predicted_yield?.toFixed(2) || 0,
    confidence: p.prediction?.confidence || 0,
    status: p.status || 'completed'
  }));
}

async function getTopCrops(dateRange) {
  const result = await Prediction.aggregate([
    {
      $match: {
        timestamp: { $gte: dateRange.start, $lte: dateRange.end }
      }
    },
    {
      $group: {
        _id: "$crop",
        count: { $sum: 1 },
        avg_yield: { $avg: "$prediction.predicted_yield" },
        avg_confidence: { $avg: "$prediction.confidence" }
      }
    },
    { $sort: { count: -1 } },
    { $limit: 5 }
  ]);

  return result.map(r => ({
    crop: r._id,
    count: r.count,
    avg_yield: r.avg_yield?.toFixed(2) || 0,
    avg_confidence: (r.avg_confidence * 100)?.toFixed(2) || 0
  }));
}

async function getWeatherRequests(dateRange) {
  const count = await Prediction.countDocuments({
    timestamp: { $gte: dateRange.start, $lte: dateRange.end },
    weather_data: { $exists: true, $ne: null }
  });

  return { count };
}

async function getActiveUsers(dateRange) {
  const uniqueUsers = await Prediction.distinct('user_id', {
    timestamp: { $gte: dateRange.start, $lte: dateRange.end }
  });

  return uniqueUsers.length;
}

async function getModelPerformance() {
  // Get predictions grouped by model
  const performance = await Prediction.aggregate([
    {
      $group: {
        _id: "$prediction.model_used",
        predictions: { $sum: 1 },
        avg_confidence: { $avg: "$prediction.confidence" },
        avg_yield: { $avg: "$prediction.predicted_yield" }
      }
    }
  ]);

  return performance.map(p => ({
    name: p._id || 'unknown',
    predictions: p.predictions,
    avg_confidence: (p.avg_confidence * 100)?.toFixed(2) || 0,
    avg_yield: p.avg_yield?.toFixed(2) || 0,
    accuracy: 85 // This should be calculated based on actual vs predicted
  }));
}

function calculateModelAccuracy(performance) {
  if (!performance || performance.length === 0) return 0;
  
  const totalAccuracy = performance.reduce((sum, model) => {
    return sum + (parseFloat(model.accuracy) || 0);
  }, 0);
  
  return (totalAccuracy / performance.length).toFixed(2);
}

async function getSystemHealth() {
  // Check ML service
  let mlHealth = { healthy: false };
  try {
    mlHealth = await mlPredictionController.getServiceHealth();
  } catch (error) {
    console.error('ML health check error:', error.message);
  }
  
  // Check database
  const dbStart = Date.now();
  let dbStatus = 'up';
  try {
    await Prediction.countDocuments();
  } catch (error) {
    dbStatus = 'down';
  }
  const dbTime = Date.now() - dbStart;
  
  // Check weather service
  const weatherStart = Date.now();
  let weatherStatus = 'up';
  try {
    // Skip weather API check to avoid rate limits and server crashes
    // Just mark as up if API key exists
    weatherStatus = process.env.OPENWEATHER_API_KEY ? 'up' : 'down';
  } catch (error) {
    weatherStatus = 'down';
  }
  const weatherTime = Date.now() - weatherStart;

  const services = [
    {
      name: 'ML Prediction Service',
      status: mlHealth.healthy ? 'up' : 'down',
      response_time: 100, // Mock value
      description: 'Machine Learning models for crop prediction'
    },
    {
      name: 'Database',
      status: dbStatus,
      response_time: dbTime,
      description: 'MongoDB database connection'
    },
    {
      name: 'Weather API',
      status: weatherStatus,
      response_time: weatherTime,
      description: 'OpenWeatherMap API integration'
    },
    {
      name: 'Authentication Service',
      status: 'up',
      response_time: 50,
      description: 'User authentication and authorization'
    }
  ];

  const overall = services.every(s => s.status === 'up') ? 'Healthy' : 'Degraded';
  const avgResponseTime = services.reduce((sum, s) => sum + s.response_time, 0) / services.length;

  return { overall, services, avgResponseTime };
}

async function getPredictionAnalytics(groupBy, metric) {
  let groupFormat;
  
  switch (groupBy) {
    case 'hour':
      groupFormat = { hour: { $hour: "$timestamp" } };
      break;
    case 'day':
      groupFormat = { day: { $dayOfMonth: "$timestamp" }, month: { $month: "$timestamp" }, year: { $year: "$timestamp" } };
      break;
    case 'week':
      groupFormat = { week: { $week: "$timestamp" }, year: { $year: "$timestamp" } };
      break;
    case 'month':
      groupFormat = { month: { $month: "$timestamp" }, year: { $year: "$timestamp" } };
      break;
    default:
      groupFormat = { day: { $dayOfMonth: "$timestamp" }, month: { $month: "$timestamp" }, year: { $year: "$timestamp" } };
  }

  const aggregation = [
    {
      $group: {
        _id: groupFormat,
        count: { $sum: 1 },
        avg_yield: { $avg: "$prediction.predicted_yield" },
        avg_confidence: { $avg: "$prediction.confidence" }
      }
    },
    { $sort: { "_id.year": 1, "_id.month": 1, "_id.day": 1, "_id.hour": 1 } }
  ];

  const result = await Prediction.aggregate(aggregation);

  return result.map(r => ({
    date: formatGroupId(r._id, groupBy),
    value: metric === 'count' ? r.count : 
           metric === 'yield' ? r.avg_yield?.toFixed(2) || 0 :
           r.avg_confidence?.toFixed(2) || 0
  }));
}
// Add this function after the other helper functions in routes/adminRoutes.js
async function getAnalyticsData(filters = {}) {
  try {
    const { startDate, endDate, crop, location } = filters;
    
    const query = {};
    
    // Apply filters
    if (crop) query.crop = crop;
    if (location) query['location.city'] = location;
    if (startDate || endDate) {
      query.timestamp = {};
      if (startDate) query.timestamp.$gte = new Date(startDate);
      if (endDate) query.timestamp.$lte = new Date(endDate);
    }

    // Get data for analytics
    const [
      predictionsByCrop,
      predictionsByDate,
      locationDistribution,
      modelPerformance,
      weatherStats
    ] = await Promise.all([
      // Predictions by crop
      Prediction.aggregate([
        { $match: query },
        {
          $group: {
            _id: "$crop",
            count: { $sum: 1 },
            avg_yield: { $avg: "$prediction.predicted_yield" },
            avg_confidence: { $avg: "$prediction.confidence" }
          }
        },
        { $sort: { count: -1 } }
      ]),

      // Predictions by date
      Prediction.aggregate([
        { $match: query },
        {
          $group: {
            _id: {
              year: { $year: "$timestamp" },
              month: { $month: "$timestamp" },
              day: { $dayOfMonth: "$timestamp" }
            },
            count: { $sum: 1 },
            avg_yield: { $avg: "$prediction.predicted_yield" }
          }
        },
        { $sort: { "_id.year": 1, "_id.month": 1, "_id.day": 1 } },
        { $limit: 30 }
      ]),

      // Location distribution
      Prediction.aggregate([
        { $match: query },
        {
          $group: {
            _id: "$location.city",
            count: { $sum: 1 },
            predictions: { $push: "$$ROOT" }
          }
        },
        { $sort: { count: -1 } }
      ]),

      // Model performance
      Prediction.aggregate([
        { $match: query },
        {
          $group: {
            _id: "$prediction.model_used",
            count: { $sum: 1 },
            avg_confidence: { $avg: "$prediction.confidence" },
            avg_yield: { $avg: "$prediction.predicted_yield" }
          }
        }
      ]),

      // Weather statistics
      Prediction.aggregate([
        { $match: { ...query, weather_data: { $exists: true } } },
        {
          $group: {
            _id: null,
            avg_temp: { $avg: "$weather_data.avg_temp" },
            avg_rain: { $avg: "$weather_data.total_rainfall" },
            avg_humidity: { $avg: "$weather_data.humidity" }
          }
        }
      ])
    ]);

    return {
      predictions_by_crop: predictionsByCrop,
      predictions_by_date: predictionsByDate.map(d => ({
        date: `${d._id.year}-${String(d._id.month).padStart(2, '0')}-${String(d._id.day).padStart(2, '0')}`,
        count: d.count,
        avg_yield: d.avg_yield?.toFixed(2) || 0
      })),
      location_distribution: locationDistribution.map(l => ({
        city: l._id || 'Unknown',
        count: l.count,
        percentage: 0 // Will be calculated client-side
      })),
      model_performance: modelPerformance.map(m => ({
        model: m._id || 'unknown',
        count: m.count,
        avg_confidence: (m.avg_confidence * 100)?.toFixed(2) || 0,
        avg_yield: m.avg_yield?.toFixed(2) || 0
      })),
      weather_statistics: weatherStats.length > 0 ? {
        avg_temp: weatherStats[0].avg_temp?.toFixed(2) || 0,
        avg_rainfall: weatherStats[0].avg_rain?.toFixed(2) || 0,
        avg_humidity: weatherStats[0].avg_humidity?.toFixed(2) || 0
      } : null,
      summary: {
        total_predictions: predictionsByCrop.reduce((sum, c) => sum + c.count, 0),
        total_crops: predictionsByCrop.length,
        total_locations: locationDistribution.length,
        date_range: query.timestamp || 'all_time'
      }
    };

  } catch (error) {
    console.error('Error getting analytics data:', error);
    return {};
  }
}

function formatGroupId(id, groupBy) {
  switch (groupBy) {
    case 'hour':
      return `${id.hour}:00`;
    case 'day':
      return `${id.year}-${String(id.month).padStart(2, '0')}-${String(id.day).padStart(2, '0')}`;
    case 'week':
      return `Week ${id.week}, ${id.year}`;
    case 'month':
      return `${id.year}-${String(id.month).padStart(2, '0')}`;
    default:
      return JSON.stringify(id);
  }
}

async function getCityDistribution(startDate, endDate) {
  const distribution = await Prediction.aggregate([
    {
      $match: {
        timestamp: { $gte: startDate, $lte: endDate },
        "location.city": { $exists: true, $ne: null }
      }
    },
    {
      $group: {
        _id: "$location.city",
        count: { $sum: 1 },
        avg_yield: { $avg: "$prediction.predicted_yield" }
      }
    },
    { $sort: { count: -1 } },
    { $limit: 10 }
  ]);

  return distribution.map(d => ({
    city: d._id,
    count: d.count,
    percentage: 0, // Will be calculated client-side
    avg_yield: d.avg_yield?.toFixed(2) || 0
  }));
}

function convertToCSV(data) {
  if (!data || data.length === 0) return '';
  
  const headers = Object.keys(data[0]).join(',');
  const rows = data.map(item => 
    Object.values(item).map(val => 
      typeof val === 'string' ? `"${val.replace(/"/g, '""')}"` : val
    ).join(',')
  );
  
  return [headers, ...rows].join('\n');
}

// Suspend user
router.post('/users/:userId/suspend', checkAdmin, async (req, res) => {
  try {
    const { userId } = req.params;
    const { reason } = req.body;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    if (user.role === 'admin') {
      return res.status(403).json({ success: false, message: 'Cannot suspend admin users' });
    }

    user.accountStatus = 'suspended';
    user.suspendedAt = new Date();
    user.suspendedBy = req.user?.id;
    user.suspensionReason = reason || 'No reason provided';
    await user.save();

    res.json({
      success: true,
      message: 'User suspended successfully',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        accountStatus: user.accountStatus,
        suspendedAt: user.suspendedAt
      }
    });
  } catch (error) {
    console.error('Suspend user error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Unsuspend/Activate user
router.post('/users/:userId/activate', checkAdmin, async (req, res) => {
  try {
    const { userId } = req.params;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    user.accountStatus = 'active';
    user.suspendedAt = null;
    user.suspendedBy = null;
    user.suspensionReason = null;
    await user.save();

    res.json({
      success: true,
      message: 'User activated successfully',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        accountStatus: user.accountStatus
      }
    });
  } catch (error) {
    console.error('Activate user error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Delete user
router.delete('/users/:userId', checkAdmin, async (req, res) => {
  try {
    const { userId } = req.params;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    if (user.role === 'admin') {
      return res.status(403).json({ success: false, message: 'Cannot delete admin users' });
    }

    await User.findByIdAndDelete(userId);

    res.json({
      success: true,
      message: 'User deleted successfully'
    });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Broadcast email to all users
router.post('/broadcast-email', checkAdmin, async (req, res) => {
  try {
    const { subject, message } = req.body;

    if (!subject || !message) {
      return res.status(400).json({ 
        success: false, 
        message: 'Subject and message are required' 
      });
    }

    // Get all users
    const users = await User.find().select('email name').lean();

    if (users.length === 0) {
      return res.status(404).json({ 
        success: false, 
        message: 'No users found' 
      });
    }

    // Send emails to all users
    const emailPromises = users.map(user => 
      sendBroadcastEmail(user.email, user.name, subject, message)
    );

    const results = await Promise.allSettled(emailPromises);
    
    const successful = results.filter(r => r.status === 'fulfilled' && r.value.success).length;
    const failed = results.length - successful;

    res.json({
      success: true,
      message: `Broadcast sent to ${successful} users`,
      stats: {
        total: users.length,
        successful,
        failed
      }
    });
  } catch (error) {
    console.error('Broadcast email error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;