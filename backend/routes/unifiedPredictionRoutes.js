const express = require('express');
const router = express.Router();
const predictionService = require('../services/predictionService');

// Unified prediction endpoint
router.post('/unified-prediction', async (req, res) => {
  try {
    const { city, days = 7 } = req.body;
    
    if (!city) {
      return res.status(400).json({
        success: false,
        error: 'City is required'
      });
    }
    
    console.log(`🌍 Starting unified prediction for ${city}...`);
    
    const result = await predictionService.getUnifiedPredictions(city, days);
    
    res.json({
      ...result,
      recommendation_engine: 'AI-Enhanced Prediction System',
      ml_usage: {
        ml_coverage: `${((result.analysis.ml_predictions / result.analysis.total_crops) * 100).toFixed(1)}%`,
        models_used: ['GRU', 'LSTM'],
        predictions_received: result.analysis.ml_predictions
      }
    });
    
  } catch (error) {
    console.error('Unified prediction error:', error);
    res.status(500).json({
      success: false,
      error: error.message,
      note: 'Please try again or use a different city'
    });
  }
});

// Get ML service health
router.get('/ml-status', async (req, res) => {
  try {
    const mlHealth = await require('../controllers/mlPredictionController').getServiceHealth();
    
    res.json({
      success: true,
      ml_service: mlHealth,
      models_loaded: mlHealth.models_loaded || 0,
      service_healthy: mlHealth.healthy || false,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

module.exports = router;