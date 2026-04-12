/**
 * Soil Analysis Routes
 */

const express = require('express');
const router = express.Router();
const soilAnalysisController = require('../controllers/soilAnalysisController');
const { optionalProtect } = require('../middleware/auth');

// Public routes
router.post('/district', optionalProtect, soilAnalysisController.analyzeDistrict);
router.post('/manual', optionalProtect, soilAnalysisController.analyzeManual);
router.get('/districts', soilAnalysisController.getDistricts);
router.get('/district/:district', soilAnalysisController.getDistrictDetails);
router.get('/health', soilAnalysisController.healthCheck);

module.exports = router;