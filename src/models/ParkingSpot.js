const mongoose = require('mongoose');

const ParkingSpotSchema = new mongoose.Schema({
  spotNumber: {
    type: Number,
    required: true
  },
  row: {
    type: String,
    required: true,
    trim: true
  },
  level: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ParkingLevel',
    required: true
  },
  spotSize: {
    type: String,
    required: true,
    enum: ['small', 'medium', 'large'],
    trim: true
  },
  // For faster queries about availability
  isAvailable: {
    type: Boolean,
    default: true,
    required: true
  }
}, {
  timestamps: true
});

// Compound index to ensure uniqueness of spotNumber within a specific level
ParkingSpotSchema.index({ spotNumber: 1, level: 1 }, { unique: true });

const ParkingSpot = mongoose.model('ParkingSpot', ParkingSpotSchema);
module.exports = ParkingSpot;