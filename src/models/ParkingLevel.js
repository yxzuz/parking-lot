import mongoose from 'mongoose';

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
  availableSpots: {
    type: Number,
    required: true,
    min: 0
  }
});

const ParkingLevel = mongoose.models.ParkingLevel || mongoose.model('ParkingLevel', ParkingLevelSchema);
export default ParkingLevel;
