// models/Prediction.js
const mongoose = require('mongoose');

const predictionSchema = new mongoose.Schema({
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: false
  },
  session_id: {
    type: String,
    required: true
  },
  timestamp: {
    type: Date,
    default: Date.now,
    required: true
  },
  location: {
    city: String,
    latitude: Number,
    longitude: Number,
    country: String
  },
  crop: {
    type: String,
    enum: ['cotton', 'wheat', 'maize', 'rice', 'sugarcane'],
    required: true
  },
  prediction: {
    predicted_yield: Number,
    confidence: Number,
    model_used: String,
    recommendation: {
      primary_advice: String,
      status: String,
      weather_considerations: [String],
      yield_change: String
    },
    weather_summary: {
      avg_temperature: Number,
      total_rainfall: Number,
      max_temperature: Number,
      days_analyzed: Number
    }
  },
  weather_data: {
    forecast_days: Number,
    avg_temp: Number,
    total_rainfall: Number,
    max_temp: Number,
    min_temp: Number,
    humidity: Number
  },
  actual_yield: {
    type: Number,
    required: false
  },
  feedback: {
    rating: Number,
    comments: String,
    submitted_at: Date
  },
  status: {
    type: String,
    enum: ['pending', 'processing', 'completed', 'failed'],
    default: 'completed'
  },
  metadata: {
    ip_address: String,
    user_agent: String,
    api_version: String
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for performance
predictionSchema.index({ timestamp: -1 });
predictionSchema.index({ crop: 1, timestamp: -1 });
predictionSchema.index({ location: 1, timestamp: -1 });
predictionSchema.index({ 'prediction.model_used': 1 });

// Virtual for accuracy
predictionSchema.virtual('accuracy').get(function() {
  if (!this.actual_yield || !this.prediction?.predicted_yield) return null;
  
  const error = Math.abs(this.actual_yield - this.prediction.predicted_yield);
  const accuracy = Math.max(0, 100 - (error / this.actual_yield * 100));
  return Math.round(accuracy * 100) / 100;
});

const Prediction = mongoose.model('Prediction', predictionSchema);

module.exports = Prediction;