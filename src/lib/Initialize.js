import dbConnect from '@/lib/mongodb';
import ParkingLevel from '@/models/ParkingLevel';
import ParkingSpot from '@/models/ParkingSpot';
import { Level } from '@/lib/Level';
import { ParkingSpot as ParkingSpotClass } from '@/lib/ParkingSpot';

export async function initializeParkingLot(lot) {
  console.log("🚗 Initializing parking lot...");
  await dbConnect();

  const levelPromises = Array(lot.NUM_LEVELS).fill(null).map(async (_, i) => {
    try {
      const levelDoc = await ParkingLevel.findOne({ _id: lot.level_ids[i] });
      if (!levelDoc) throw new Error(`Level ${i} not found in database`);

      const level = new Level(levelDoc);
      
      // Fetch all spots for this level
      const spotDocs = await ParkingSpot.find({ level: levelDoc._id }).sort({ spotNumber: 1 });

      for (const spot of spotDocs) {
        if (!spot) {
          console.warn(`Spot not found for level ${i}`);
          throw new Error(`Spot not found for level ${i}`);
        }
      }
        console.log(`Found spot ${spotDocs.spotNumber} ${spotDocs.currentVehicle} spots for level ${i}`);
            // Initialize spot array (1-based indexing)
      level.spots = new Array(levelDoc.totalSpots + 1);

      for (const spot of spotDocs) {
        const vehicle = spot.isAvailable ? null : spot.currentVehicle;

        level.spots[spot.spotNumber] = new ParkingSpotClass(
          level,
          spot,
          spot.row,
          spot.spotNumber,
          spot.spotSize,
          spot.isAvailable ? null : spot.currentVehicle,
          vehicle
        );
        console.log(`Initialized spot ${spot.spotNumber} - Row: ${spot.row}, Size: ${spot.spotSize}, Available: ${spot.isAvailable}`);
      }

      // Count available
      level.availableSpots = spotDocs.filter(s => s.isAvailable).length;

      lot.levels[i] = level;

      console.log(`✅ Level ${i} initialized with ${level.availableSpots} available spots`);
    } catch (err) {
      console.error(`❌ Failed to initialize level ${i}:`, err);
      throw err;
    }
  });

  await Promise.all(levelPromises);
  lot.initialized = true;

  console.log("🎉 Parking lot initialization complete!");
}
