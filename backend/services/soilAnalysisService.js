/**
 * Soil Analysis Service - Node.js Wrapper
 * Interfaces with Flask ML service for soil analysis
 */

const axios = require('axios');

class SoilAnalysisService {
    constructor() {
        this.mlServiceUrl = process.env.ML_SERVICE_URL || 'http://localhost:5001';
        this.districts = [
            'Lahore', 'Faisalabad', 'Multan', 'Sargodha', 'Gujrat', 'Bahawalpur'
        ];
    }

    async analyzeDistrict(districtName, currentCrop = null) {
        try {
            if (!this.districts.includes(districtName)) {
                throw new Error(`District '${districtName}' not supported`);
            }

            const response = await axios.post(`${this.mlServiceUrl}/soil/analyze/district`, {
                district: districtName,
                current_crop: currentCrop
            });

            return response.data;

        } catch (error) {
            console.error('District analysis error:', error.message);
            
            // Fallback to mock data if ML service is unavailable
            if (error.code === 'ECONNREFUSED' || error.response?.status >= 500) {
                return this.getMockDistrictAnalysis(districtName, currentCrop);
            }

            throw error;
        }
    }

    async analyzeManual(soilParams, district = 'Manual Input', currentCrop = null) {
        try {
            const response = await axios.post(`${this.mlServiceUrl}/soil/analyze/manual`, {
                soil_params: soilParams,
                district: district,
                current_crop: currentCrop
            });

            return response.data;

        } catch (error) {
            console.error('Manual analysis error:', error.message);
            
            // Fallback to mock data if ML service is unavailable
            if (error.code === 'ECONNREFUSED' || error.response?.status >= 500) {
                return this.getMockManualAnalysis(soilParams, district, currentCrop);
            }

            throw error;
        }
    }

    async getDistricts() {
        try {
            const response = await axios.get(`${this.mlServiceUrl}/soil/districts`);
            return response.data;
        } catch (error) {
            console.error('Get districts error:', error.message);
            
            // Fallback to hardcoded districts
            return {
                success: true,
                districts: this.districts.map(name => ({
                    name,
                    samples: 50,
                    overall_score: 60,
                    soil_health: 'Fair'
                })),
                count: this.districts.length
            };
        }
    }

    async getDistrictDetails(districtName) {
        try {
            const response = await axios.get(`${this.mlServiceUrl}/soil/district/${districtName}`);
            return response.data;
        } catch (error) {
            console.error('Get district details error:', error.message);
            
            // Fallback to mock data
            return {
                success: false,
                error: `District '${districtName}' not found`
            };
        }
    }

    async getModelInfo() {
        try {
            const response = await axios.get(`${this.mlServiceUrl}/soil/models`);
            return response.data;
        } catch (error) {
            console.error('Get model info error:', error.message);
            
            return {
                loaded: false,
                message: 'Unable to connect to ML service'
            };
        }
    }

    // Mock data for fallback
    getMockDistrictAnalysis(districtName, currentCrop) {
        const mockScores = {
            'Lahore': 73.4,
            'Faisalabad': 59.3,
            'Multan': 60.7,
            'Sargodha': 58.5,
            'Gujrat': 64.0,
            'Bahawalpur': 60.7
        };

        const mockHealth = {
            'Lahore': 'Good',
            'Faisalabad': 'Fair',
            'Multan': 'Good',
            'Sargodha': 'Fair',
            'Gujrat': 'Good',
            'Bahawalpur': 'Good'
        };

        const recommendedCrop = this.getMockCropRecommendation(districtName);
        
        return {
            success: true,
            fallback_used: true,
            location: {
                district: districtName,
                samples: 50,
                data_source: 'Mock data (ML service unavailable)'
            },
            analysis: {
                soil_health: mockHealth[districtName] || 'Fair',
                recommended_crop: recommendedCrop,
                limitations: ['pH Problem', 'Low Organic Matter'],
                parameter_scores: {
                    'pH': 65.5,
                    'Organic Carbon': 42.3,
                    'Nitrogen': 58.7,
                    'Salinity': 75.2,
                    'Clay Content': 68.9
                },
                overall_score: mockScores[districtName] || 60.0
            },
            recommendations: [
                {
                    type: 'Crop Selection',
                    action: `Plant ${recommendedCrop}`,
                    priority: 'High',
                    reason: 'Best suited for current soil conditions',
                    source: 'mock'
                },
                {
                    type: 'Soil Amendment',
                    action: 'Apply lime to adjust pH',
                    priority: 'High',
                    reason: 'Acidic soil detected',
                    source: 'mock'
                },
                {
                    type: 'Organic Matter',
                    action: 'Add compost or farmyard manure',
                    priority: 'High',
                    reason: 'Low organic matter content',
                    source: 'mock'
                }
            ],
            district_actual: {
                overall_score: mockScores[districtName] || 60.0,
                soil_health_class: mockHealth[districtName] || 'Fair',
                samples: 50
            },
            timestamp: new Date().toISOString()
        };
    }

    getMockManualAnalysis(soilParams, district, currentCrop) {
        const ph = soilParams.ph || 7.0;
        const orgc = soilParams.orgc || 1.0;
        
        // Simple scoring logic
        const phScore = ph >= 6.0 && ph <= 7.5 ? 100 : Math.max(0, 100 - Math.abs(ph - 7.0) * 20);
        const orgcScore = orgc >= 0.6 ? 100 : (orgc / 0.6) * 100;
        
        const overallScore = (phScore + orgcScore) / 2;
        const recommendedCrop = ph < 6.0 ? 'Rice' : 'Wheat';
        
        return {
            success: true,
            fallback_used: true,
            location: {
                district: district,
                data_source: 'Mock data (ML service unavailable)'
            },
            analysis: {
                soil_health: this.getHealthClass(overallScore),
                recommended_crop: recommendedCrop,
                limitations: ph < 6.0 ? ['pH Problem'] : [],
                parameter_scores: {
                    'pH': phScore,
                    'Organic Carbon': orgcScore,
                    'Nitrogen': 60.0,
                    'Salinity': 80.0,
                    'Clay Content': 70.0
                },
                overall_score: overallScore
            },
            recommendations: [
                {
                    type: 'Crop Selection',
                    action: `Plant ${recommendedCrop}`,
                    priority: 'High',
                    reason: 'Best suited for current soil conditions',
                    source: 'mock'
                }
            ],
            timestamp: new Date().toISOString()
        };
    }

    getMockCropRecommendation(districtName) {
        const recommendations = {
            'Lahore': 'Wheat',
            'Faisalabad': 'Cotton',
            'Multan': 'Cotton',
            'Sargodha': 'Wheat',
            'Gujrat': 'Rice',
            'Bahawalpur': 'Cotton'
        };
        return recommendations[districtName] || 'Wheat';
    }

    getHealthClass(score) {
        if (score >= 80) return 'Excellent';
        if (score >= 60) return 'Good';
        if (score >= 40) return 'Fair';
        if (score >= 20) return 'Poor';
        return 'Very Poor';
    }
}

module.exports = new SoilAnalysisService();