/**
 * Soil Analysis Controller
 * Handles API requests for soil analysis
 */

const soilAnalysisService = require('../services/soilAnalysisService');
const SoilOutcome = require('../models/SoilOutcome');

exports.analyzeDistrict = async (req, res) => {
    try {
        const { district, currentCrop } = req.body;
        
        if (!district) {
            return res.status(400).json({
                success: false,
                message: 'District name is required'
            });
        }

        const result = await soilAnalysisService.analyzeDistrict(district, currentCrop);
        
        if (result.success) {
            if (req.user?._id) {
                await SoilOutcome.create({
                    user_id: req.user._id,
                    analysis_type: 'district',
                    district,
                    crop: currentCrop || null,
                    soil_params: null,
                    result
                });
            }
            res.json(result);
        } else {
            res.status(400).json(result);
        }

    } catch (error) {
        console.error('District analysis error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error.message
        });
    }
};

exports.analyzeManual = async (req, res) => {
    try {
        const { soil_params, district, current_crop } = req.body;
        
        if (!soil_params || Object.keys(soil_params).length === 0) {
            return res.status(400).json({
                success: false,
                message: 'Soil parameters are required'
            });
        }

        const result = await soilAnalysisService.analyzeManual(
            soil_params, 
            district || 'Manual Input', 
            current_crop
        );
        
        if (result.success) {
            if (req.user?._id) {
                await SoilOutcome.create({
                    user_id: req.user._id,
                    analysis_type: 'manual',
                    district: district || 'Manual Input',
                    crop: current_crop || null,
                    soil_params,
                    result
                });
            }
            res.json(result);
        } else {
            res.status(400).json(result);
        }

    } catch (error) {
        console.error('Manual analysis error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error.message
        });
    }
};

exports.getDistricts = async (req, res) => {
    try {
        const result = await soilAnalysisService.getDistricts();
        
        if (result.success) {
            res.json(result);
        } else {
            res.status(400).json(result);
        }

    } catch (error) {
        console.error('Get districts error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error.message
        });
    }
};

exports.getDistrictDetails = async (req, res) => {
    try {
        const { district } = req.params;
        
        if (!district) {
            return res.status(400).json({
                success: false,
                message: 'District name is required'
            });
        }

        const result = await soilAnalysisService.getDistrictDetails(district);
        
        if (result.success) {
            res.json(result);
        } else {
            res.status(404).json(result);
        }

    } catch (error) {
        console.error('Get district details error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error.message
        });
    }
};

exports.healthCheck = async (req, res) => {
    try {
        const modelInfo = await soilAnalysisService.getModelInfo();
        
        res.json({
            success: true,
            message: 'Soil Analysis Service is running',
            timestamp: new Date().toISOString(),
            version: '1.0.0',
            ml_service_available: modelInfo.loaded || false,
            model_info: modelInfo
        });
    } catch (error) {
        res.json({
            success: true,
            message: 'Soil Analysis Service is running (ML service unavailable)',
            timestamp: new Date().toISOString(),
            version: '1.0.0',
            ml_service_available: false
        });
    }
};