// pages/api/vehicles/park.js
import dbConnect from '../../../lib/mongodb';
import ParkingSession from '../../../models/ParkingSession';
import ParkingSpot from '../../../models/ParkingSpot';
import ParkingLevel from '../../../models/ParkingLevel';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, message: 'Method not allowed' });
  }
 
  try {
    await dbConnect();
    
    const { licensePlate, vehicleType } = req.body;

    if (!licensePlate || !vehicleType) {
      return res.status(400).json({ 
        success: false, 
        message: 'License plate and vehicle type are required' 
      });
    }

    // Check if vehicle is already parked
    const existingSession = await ParkingSession.findOne({ 
      licensePlate, 
      isActive: true
    });
    
    if (existingSession) {
      return res.status(400).json({ 
        success: false, 
        message: 'Vehicle is already parked' 
      });
    }
    
    // Determine vehicle characteristics
    let vehicleSize, spotsNeeded, allowedSizes;
    switch (vehicleType) {
      case 'car':
        vehicleSize = 'compact';
        spotsNeeded = 1;
        allowedSizes = ['compact', 'large'];
        break;
      case 'bus':
        vehicleSize = 'large';
        spotsNeeded = 5;
        allowedSizes = ['large'];
        break;
      case 'motorcycle':
        vehicleSize = 'motorcycle';
        spotsNeeded = 1;
        allowedSizes = ['motorcycle', 'compact', 'large'];
        break;
      default:
        return res.status(400).json({ 
          success: false, 
          message: 'Invalid vehicle type. Must be car, bus, or motorcycle' 
        });
    }
    
    // Find an available level with enough spots
    const levels = await ParkingLevel.find().sort({ floor: 1 });
    
    let selectedLevel = null;
    let selectedSpots = [];
    
    // Search each level for available spots
    for (const level of levels) {
      if (level.availableSpots < spotsNeeded) {
        continue; // Not enough spots to park
      }
      
      // Find available spots on this level
      const spots = await ParkingSpot.find({ 
        level: level._id, 
        isAvailable: true,
        spotSize: { $in: allowedSizes }
      }).sort({ row: 1, spotNumber: 1 });
      
      if (spotsNeeded === 1) {
        if (spots.length > 0) {
          selectedLevel = level;
          selectedSpots = [spots[0]];
          break;
        }
      } else {
        // for bus (5 spots)
        let consecutiveSpots = [];
        let lastRow = -1;
        let lastSpotNumber = -1;
        
        for (const spot of spots) {
          if (lastRow !== spot.row) {
            // Reset when changing rows
            consecutiveSpots = [spot];
            lastRow = spot.row;
            lastSpotNumber = spot.spotNumber;
          } else if (spot.spotNumber === lastSpotNumber + 1) {
            // Add to consecutive spots if they're adjacent
            consecutiveSpots.push(spot);
            lastSpotNumber = spot.spotNumber;
          } else {
            // Not consecutive, start over in this row
            consecutiveSpots = [spot];
            lastSpotNumber = spot.spotNumber;
          }
          
          // Check if we have enough consecutive spots
          if (consecutiveSpots.length === spotsNeeded) {
            selectedLevel = level;
            selectedSpots = consecutiveSpots;
            break;
          }
        }
        
        if (selectedSpots.length === spotsNeeded) {
          break; // Found enough spots on this level
        }
      }
    }
    
    // Cannot find spots
    if (!selectedLevel || selectedSpots.length !== spotsNeeded) {
      return res.status(400).json({ 
        success: false, 
        message: 'No available parking spots for this vehicle type' 
      });
    }
    
    for (const spot of selectedSpots) {
      spot.isAvailable = false;
      spot.currentVehicle = licensePlate;
      await spot.save();
    }
    
    // Update level available spots count
    selectedLevel.availableSpots -= spotsNeeded;
    await selectedLevel.save();
    
    // Create a new parking session
    const session = new ParkingSession({
      licensePlate,
      vehicleType,
      spotId: selectedSpots[0].spotNumber,
      row: selectedSpots[0].row,
      floor: selectedLevel.floor,
      entryTime: new Date(),
      isActive: true
    });
    await session.save();
    

    return res.status(200).json({
      success: true,
      message: `${vehicleType} with license plate ${licensePlate} was parked successfully`,
      spotneeded: spotsNeeded,
      size: vehicleSize,
      spots: selectedSpots.map(spot => ({
        floor: selectedLevel.floor,
        spotNumber: spot.spotNumber,
        size: spot.spotSize
      })),
      level: {
        floor: selectedLevel.floor,
        availableSpots: selectedLevel.availableSpots,
        totalSpots: selectedLevel.totalSpots
      }
    });
    
  } catch (error) {
    console.error("Parking error:", error);
    return res.status(500).json({ 
      success: false, 
      message: 'Error parking vehicle', 
      error: error.message 
    });
  }
}