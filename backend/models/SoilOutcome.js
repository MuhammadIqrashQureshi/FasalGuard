const mongoose = require('mongoose');

const soilOutcomeSchema = new mongoose.Schema({
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: false
  },
  analysis_type: {
    type: String,
    enum: ['district', 'manual'],
    required: true
  },
  district: {
    type: String,
    default: null,
    trim: true
  },
  crop: {
    type: String,
    default: null,
    trim: true
  },
  soil_params: {
    type: mongoose.Schema.Types.Mixed,
    default: null
  },
  result: {
    type: mongoose.Schema.Types.Mixed,
    required: true
  }
}, {
  timestamps: true
});

soilOutcomeSchema.index({ user_id: 1, createdAt: -1 });
soilOutcomeSchema.index({ district: 1, createdAt: -1 });

module.exports = mongoose.model('SoilOutcome', soilOutcomeSchema);
