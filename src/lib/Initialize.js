import dbConnect from '@/lib/mongodb';
import ParkingLevel from '@/models/ParkingLevel';
import ParkingSpot from '@/models/ParkingSpot';
import { Level } from '@/lib/Level';
import ParkingSession from '@/models/ParkingSession';
import { Car} from '@/lib/Car'; 
import { Bus } from '@/lib/Bus'; 
import { Motorcycle } from '@/lib/Motorcycle'; 
import { ParkingSpot as ParkingSpotClass } from '@/lib/ParkingSpot';

function createVehicleFromSession(session) {
    const { licensePlate, vehicleType } = session;
    switch (vehicleType) {
      case 'car':
        return new Car(licensePlate);
      case 'bus':
        return new Bus(licensePlate);
      case 'motorcycle':
        return new Motorcycle(licensePlate);
      default:
        return null;
    }
  }
  

export async function initializeParkingLot(lot) {
  console.log("🚗 Initializing parking lot...");
  await dbConnect();

  lot.levels = new Array(lot.NUM_LEVELS); 

  const failedLevels = [];

  const levelPromises = Array.from({ length: lot.NUM_LEVELS }, (_, i) => (async () => {
    try {
      const levelDoc = await ParkingLevel.findOne({ _id: lot.level_ids[i] });
      if (!levelDoc) throw new Error(`Level ${i} not found in database`);

      const level = new Level(levelDoc);

      const spotDocs = await ParkingSpot.find({ level: levelDoc._id }).sort({ spotNumber: 1 });

      if (!spotDocs.length) {
        throw new Error(`No spots found for level ${i}`);
      }

      console.log(`🔍 Found ${spotDocs.length} spots for level ${i}`);

      level.spots = new Array(levelDoc.totalSpots + 1); // 1-based indexing

      for (const spot of spotDocs) {
        let vehicle = null;

        if (!spot.isAvailable && spot.currentVehicle) {
          const session = await ParkingSession.findOne({
            licensePlate: spot.currentVehicle,
            isActive: true,
          });

          if (session) {
            vehicle = createVehicleFromSession(session);
            console.log(`📌 Session found: ${spot.currentVehicle} in spot ${spot.spotNumber}`);
          } else {
            console.warn(`⚠️ No active session for ${spot.currentVehicle} in spot ${spot.spotNumber}`);
          }
        }

        level.spots[spot.spotNumber] = new ParkingSpotClass(
          level,
          spot,
          spot.row,
          spot.spotNumber,
          spot.spotSize,
          spot.isAvailable ? null : spot.currentVehicle,
          vehicle
        );

        console.log(`✅ Spot ${spot.spotNumber} initialized`);
      }

      level.availableSpots = spotDocs.filter(s => s.isAvailable).length;
      lot.levels[i] = level;

      console.log(`✅ Level ${i} initialized with ${level.availableSpots} available spots`);
    } catch (err) {
      console.error(`❌ Error initializing level ${i}:`, err.message);
      failedLevels.push({ level: i, error: err.message });
    }
  })());

  await Promise.all(levelPromises);

  if (failedLevels.length === 0) {
    lot.initialized = true;
    console.log("🎉 Parking lot fully initialized!");
  } else {
    lot.initialized = false;
    console.warn(`⚠️ Parking lot partially initialized. Failed levels:`, failedLevels);
  }

  return {
    success: failedLevels.length === 0,
    failedLevels,
  };
}
