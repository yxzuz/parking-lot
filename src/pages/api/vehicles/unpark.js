import dbConnect from '../../../lib/mongodb';
import ParkingSession from '../../../models/ParkingSession';
import ParkingSpot from '../../../models/ParkingSpot';
import ParkingLevel from '../../../models/ParkingLevel';
import { ParkingLot } from '../../../lib/ParkingLot';
import { initializeParkingLot } from '@/lib/Initialize';

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

    // let parkingLot;
    
    // if (!parkingLot) {
    //   parkingLot = new ParkingLot();
    // }
    
    const parkingLot = await ParkingLot.getInstance();
    await initializeParkingLot(parkingLot);

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
    const status = await parkingLot.unparkVehicle(licensePlate);

    if (!status) {
      return res.status(400).json({ 
        success: false, 
        message: 'Failed to unpark vehicle' 
      });
    }
    else if (status) {
      console.log(`Vehicle ${licensePlate} unparked successfully`);
      //Update the parking session to mark it as inactive
      existingSession.isActive = false;
      existingSession.exitTime = new Date();
      existingSession.isActive = false;
      await existingSession.save();

    }

    return res.status(200).json({
        success: true,
        message: `Vehicle with license plate ${licensePlate} was unparked successfully`,
        level: {
            floor: existingSession.floor,
            availableSpots: existingSession.availableSpots,
            totalSpots: existingSession.totalSpots
        }
        });
    
    
  } catch (error) {
    console.error("Parking error:", error);
    return res.status(500).json({ 
      success: false, 
      message: 'Error unparking vehicle', 
      error: error.message 
    });
  }
}