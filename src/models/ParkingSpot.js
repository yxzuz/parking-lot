const mongoose = require('mongoose');
const ParkingLevel = require('./ParkingLevel'); 

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
    enum: ['compact', 'large', 'motorcycle'],
    trim: true
  },
  isAvailable: {
    type: Boolean,
    default: true,
    required: true
  },
  currentVehicle: {
    type: String, // License plate of the vehicle currently parked here
    default: null
  }
});

// Compound index to ensure uniqueness of spotNumber within a specific level
ParkingSpotSchema.index({ spotNumber: 1, level: 1 }, { unique: true });


const ParkingSpot = mongoose.models.ParkingSpot || mongoose.model('ParkingSpot', ParkingSpotSchema);
module.exports = ParkingSpot;