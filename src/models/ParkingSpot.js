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

// ParkingSpotSchema.methods.canFitVehicle = function(vehicleSize) {
//   if (vehicleSize === 'motorcycle') {
//     return this.isAvailable; // A motorcycle can fit in any available spot
//   }
//   return this.isAvailable && this.spotSize == vehicleSize;
// };


// ParkingSpotSchema.methods.park = async function(vehicle) {
//   if (!this.canFitVehicle(vehicle.size)) { // Check if the vehicle fits
//     return false; // Vehicle doesn't fit, parking failed
//   }
//   vehicle.park(this); // Notify the vehicle it's parked
//   this.currentVehicle = vehicle.licensePlate;
//   this.isAvailable = false; // Mark the spot as occupied
//   const spotNeeded = vehicle.getSpotsNeeded();
//   await this.save();

//   const Level = mongoose.model('ParkingLevel');
//   await Level.findByIdAndUpdate(this.level, { $inc: { availableSpots: -spotNeeded } });
  

//   return true; // Parking successful
// }


// ParkingSpotSchema.methods.removeVehicle = async function() {
//   if (!this.currentVehicle) {
//     return false;
//   }
//   const Level = mongoose.model('ParkingLevel');

//   await Level.findByIdAndUpdate(this.level, { $inc: { availableSpots: +1 } });

//   this.currentVehicle = null; // Remove the vehicle from the spot
//   this.isAvailable = true; 
//   await this.save();


//   return true;
// }

const ParkingSpot = mongoose.models.ParkingSpot || mongoose.model('ParkingSpot', ParkingSpotSchema);
module.exports = ParkingSpot;