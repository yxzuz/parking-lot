// pages/api/parking/status.js
import { ParkingLot } from '../../../lib/ParkingLot';

// Singleton instance of the parking lot
let parkingLot;

if (!parkingLot) {
  parkingLot = new ParkingLot();
}

export default function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ success: false, message: 'Method not allowed' });
  }

  try {
    const levelsData = [];
    
    for (let i = 0; i < parkingLot.levels.length; i++) {
      const level = parkingLot.levels[i];
      const levelData = {
        floor: level.floor,
        availableSpots: level.availableSpots,
        spots: level.spots.map(spot => ({
          id: spot.spotNumber,
          row: spot.row,
          size: spot.spotSize,
          available: spot.isAvailable(),
          vehicleLicense: spot.vehicle ? spot.vehicle.getLicensePlate() : null
        }))
      };
      levelsData.push(levelData);
    }
    
    return res.status(200).json({ 
      success: true, 
      data: levelsData 
    });
  } catch (error) {
    console.error('Error fetching parking status:', error);
    return res.status(500).json({ 
      success: false, 
      message: 'Internal server error' 
    });
  }
}