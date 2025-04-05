const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const ParkingSessionSchema = new Schema({
  licensePlate: {
    type: String,
    required: true,
    trim: true,
    uppercase: true
  },
  vehicleType: {
    type: String,
    enum: ['car', 'bus', 'motorcycle'],
    required: true
  },
  spotId: {
    type: String,
    required: true
  },
  row: {
    type: Number,
    required: true
  },
  floor: {
    type: Number,
    required: true
  },
  entryTime: {
    type: Date,
    default: Date.now
  },
  exitTime: {
    type: Date,
    default: null
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, { timestamps: true });

export default mongoose.models.ParkingSession || mongoose.model('ParkingSession', ParkingSessionSchema);
