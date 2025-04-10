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
    
    const { licensePlate} = req.body;

    if (!licensePlate) {
      return res.status(400).json({ 
        success: false, 
        message: 'License plate is required' 
      });
    }

    // Check if vehicle is already parked
    const existingSession = await ParkingSession.findOne({ 
      licensePlate, 
      isActive: true
    });
    
    if (!existingSession) {
      return res.status(400).json({ 
        success: false, 
        message: 'Vehicle is not parked' 
      });
    }
    
    const mySpots = await ParkingSpot.find({ currentVehicle: licensePlate });
    if (mySpots.length === 0) {
      return res.status(400).json({ 
        success: false, 
        message: 'Vehicle not found in parking spots' 
      });
    }
    const vehicleType = existingSession.vehicleType;
    let spotsNeeded;
    switch (vehicleType) {
      case 'car':
        spotsNeeded = 1;
        break;
      case 'bus':
        spotsNeeded = 5;
        break;
      case 'motorcycle':
        spotsNeeded = 1;
        break;
      default:
        return res.status(400).json({ 
          success: false, 
          message: 'Invalid vehicle type. Must be car, bus, or motorcycle' 
        });
    }

    const myLevel = await ParkingLevel.findById(mySpots[0].level);

    for (const spot of mySpots) {
      spot.isAvailable = true;
      spot.currentVehicle = null;
      await spot.save();
    }


    // Update the parking session to mark it as inactive
    existingSession.isActive = false;
    existingSession.exitTime = new Date();
    existingSession.isActive = false;
    await existingSession.save();

    // Update the parking level to mark it as available
    myLevel.availableSpots += spotsNeeded;
    await myLevel.save();


    

    return res.status(200).json({
        success: true,
        message: `Vehicle with license plate ${licensePlate} was unparked successfully`,
        level: {
            floor: myLevel.floor,
            availableSpots: myLevel.availableSpots,
            totalSpots: myLevel.totalSpots
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