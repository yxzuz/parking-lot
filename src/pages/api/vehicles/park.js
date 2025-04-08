// pages/api/vehicles/park.js 
import { ParkingLot } from '../../../lib/ParkingLot';
import { Car } from '../../../lib/Car';
import { Bus } from '../../../lib/Bus';
import { Motorcycle } from '../../../lib/Motorcycle';
import dbConnect from '../../../lib/mongodb';
import ParkingSession from '../../../models/ParkingSession';

// Singleton 
let parkingLot;

if (!parkingLot) {
  parkingLot = new ParkingLot();
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, message: 'Method not allowed' });
  }

  try {
    // Connect to MongoDB
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
      isActive: true // Check if the session is active
    });
    
    if (existingSession) {
      return res.status(400).json({ 
        success: false, 
        message: 'Vehicle is already parked' 
      })
    }
    // Create a new vehicle instance based on the type
    let vehicle;
    switch (vehicleType) {
      case 'car':
        vehicle = new Car(licensePlate);
        break;
      case 'bus':
        vehicle = new Bus(licensePlate);
        break;
      case 'motorcycle':
        vehicle = new Motorcycle(licensePlate);
        break;
      default:
        return res.status(400).json({ 
          success: false, 
          message: 'Invalid vehicle type. Must be car, bus, or motorcycle' 
        });

    }

    await parkingLot.initialize()

    const success = parkingLot.parkVehicle(vehicle);
    if (!success) {
      return res.status(400).json({ 
        success: false, 
        message: 'No available parking spots for this vehicle type' 
      });
    }
    //Get the spot information from the vehicle
    const spot = vehicle.getParkingSpots(); 
    console.log('Spot:', spot);
    // const session = new ParkingSession({
    //   licensePlate,
    //   vehicleType,
    //   spotId: spot.spotNumber,
    //   row: spot.row,
    //   floor: spot.level.floor,
    //   entryTime: new Date()
    // });

    // await session.save();
    const msg = success ? `${vehicle.getSize()} with license plate ${vehicle.getLicensePlate()} was parked in spot` : `Bus with license plate ${vehicle.getLicensePlate()} was not parked`;

    res.status(200).json({
      message: msg,
      spotneeded: vehicle.getSpotsNeeded(),
      size: vehicle.getSize(),
      status: success,
      park: vehicle.getParkingSpots().map(spot => ({
        floor: spot.level.floor,
        spotNumber: spot.spotNumber,
        size: spot.spotSize
      })),
      levels: parkingLot.levels.map(level => ({
        floor: level.floor,
        availableSpots: level.availableSpots,
        totalSpots: level.availableSpots
      }))
    });

    // return res.status(200).json({ 
    //   success: true, 
    //   message: `Successfully parked ${vehicleType} with license plate ${licensePlate}` 
    // });


  } catch (error) {
    return res.status(500).json({ 
      success: false, 
      message: 'Error checking vehicle status', 
      error: error.message 
    });
  }
}