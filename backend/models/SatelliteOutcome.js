const mongoose = require('mongoose');

const satelliteOutcomeSchema = new mongoose.Schema({
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: false,
  },
  session_id: {
    type: String,
    required: true,
    trim: true,
    index: true,
  },
  field_signature: {
    type: String,
    required: true,
    trim: true,
    index: true,
  },
  saved_location_id: {
    type: String,
    default: null,
    index: true,
  },
  crop: {
    type: String,
    required: true,
    lowercase: true,
    trim: true,
  },
  city: {
    type: String,
    default: null,
  },
  location: {
    latitude: Number,
    longitude: Number,
  },
  field_polygon: [
    {
      lat: Number,
      lon: Number,
    },
  ],
  analysis_date: {
    type: String,
    default: null,
  },
  metrics: {
    stress_probability: Number,
    health_score: Number,
    potential_loss_maunds: Number,
    expected_loss_pkr_per_acre: Number,
    risk_level: String,
    days_to_critical: Number,
  },
  action_status: {
    type: String,
    enum: ['pending', 'done'],
    default: 'pending',
    index: true,
  },
  action_done_at: {
    type: Date,
    default: null,
  },
  action_note: {
    type: String,
    default: '',
    trim: true,
  },
  raw_result: {
    type: mongoose.Schema.Types.Mixed,
    required: true,
  },
  cost_tracker: {
    type: mongoose.Schema.Types.Mixed,
    default: null,
  },
}, {
  timestamps: true,
});

satelliteOutcomeSchema.index({
  session_id: 1,
  field_signature: 1,
  createdAt: -1,
});

// Keep one saved analysis per field per analysis date while allowing null dates.
satelliteOutcomeSchema.index(
  { session_id: 1, field_signature: 1, analysis_date: 1 },
  {
    unique: true,
    partialFilterExpression: { analysis_date: { $type: 'string' } },
  },
);

module.exports = mongoose.model('SatelliteOutcome', satelliteOutcomeSchema);
