const mongoose = require('mongoose');
const ParkingLevelSchema = new mongoose.Schema({
    floor: {
      type: Number,
      required: true,
      unique: true
    },
    totalSpots: {
      type: Number,
      required: true,
      min: 0
    },
    // This can be calculated but storing it makes queries faster
    availableSpots: {
      type: Number,
      required: true,
      min: 0
    }
  }, {
    timestamps: true
  });
  
  const ParkingLevel = mongoose.model('ParkingLevel', ParkingLevelSchema);
  module.exports = ParkingLevel;