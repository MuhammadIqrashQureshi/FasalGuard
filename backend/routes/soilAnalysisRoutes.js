/**
 * Soil Analysis Routes
 */

const express = require('express');
const router = express.Router();
const soilAnalysisController = require('../controllers/soilAnalysisController');

// Public routes
router.post('/district', soilAnalysisController.analyzeDistrict);
router.post('/manual', soilAnalysisController.analyzeManual);
router.get('/districts', soilAnalysisController.getDistricts);
router.get('/district/:district', soilAnalysisController.getDistrictDetails);
router.get('/health', soilAnalysisController.healthCheck);

module.exports = router;