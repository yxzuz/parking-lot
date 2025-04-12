import dbConnect from './mongodb.js';
import ParkingSpot from '@/models/ParkingSpot.js';
import { ParkingSpot as ParkingSpotClass } from './ParkingSpot.js';


export class Level {
  constructor(level) {
    this.level = level;
    this.floor = level.floor;
    this.spots = new Array(level.totalSpots + 1); // 1-based indexing
    this.availableSpots = level.availableSpots;
    this.initialized = false;
  }
      
  // async initialize() {
  //   if (this.initialized) return; // Prevent multiple initializations
    
  //   await dbConnect();
  //   console.log(`Initializing level ${this.floor}...`);
    
  //   // Get all spots for this level in one query for efficiency
  //   const allSpots = await ParkingSpot.find({ level: this.level._id }).sort({ spotNumber: 1 });
    
  //   if (allSpots.length === 0) {
  //     console.warn(`No parking spots found for level ${this.floor}`);
  //     throw new Error(`No parking spots found for level ${this.floor}`);
  //   }
    
  //   console.log(`Found ${allSpots.length} spots for level ${this.floor}`);
    

  //   // Map spots to their position in the array
  //   allSpots.forEach(spot => {
  //     this.spots[spot.spotNumber] = new ParkingSpotClass(
  //       this,
  //       await ParkingSpot.findOne({ level: this.level._id, spotNumber: spot.spotNumber }),
  //       spot.row,
  //       spot.spotNumber,
  //       spot.spotSize,
  //       spot.isAvailable ? null : spot.currentVehicle
  //     );
      
  //     console.log(`Initialized spot ${spot.spotNumber} - Row: ${spot.row}, Size: ${spot.spotSize}, Available: ${spot.isAvailable}`);
  //   });
    
  //   // Count actual available spots
  //   let availableCount = 0;
  //   for (let i = 1; i < this.spots.length; i++) {
  //     if (this.spots[i] && this.spots[i].isAvailable()) {
  //       availableCount++;
  //     }
  //   }
    
  //   // Update the available spots count to match reality
  //   this.availableSpots = availableCount;
  //   console.log(`Level ${this.floor} has ${this.availableSpots} available spots`);
  //   this.initialized = true;
  // }
  

    

  async initialize() {
    await dbConnect();
    console.log(`Initializing level ${this.floor}...`);
    // Create an array with the correct size and indexing
    this.spots = new Array(this.level.totalSpots + 1); // +1 because we'll use 1-based indexing
    
    for (let i = 1; i <= this.level.totalSpots; i++) {
      const spot = await ParkingSpot.findOne({ level: this.level._id, spotNumber: i });

      if (spot) {
        this.spots[i] = new ParkingSpotClass(
          this,
          spot, // Pass the spot document
          spot.row,
          spot.spotNumber,
          spot.spotSize,
          spot.isAvailable ? null : spot.currentVehicle // Only set vehicle if spot is not available
        );

        // console.log('spot4444', this.spots[i].row, this.spots[i].spotNumber, this.spots[i].spotSize, this.spots[i].vehicle);
      } else {
        console.warn(`Spot ${i} not found on level ${this.floor}`);
      }
    }
    // Update the available spots count correctly
    this.availableSpots = this.level.availableSpots;
  }
    

  getAvailableSpots() {
      return this.availableSpots;
    }

  /* Try to find a place to park this vehicle. Return false if failed. */
  async parkVehicle(vehicle) {
    if (this.getAvailableSpots() < vehicle.getSpotsNeeded()) {
      return false;
    }
  
    const spotNumber = this.findAvailableSpots(vehicle);
  
    if (spotNumber < 0) {
      return false;
    }
  
    return await this.parkStartingAtSpot(spotNumber, vehicle);
  }
  

  async parkStartingAtSpot(spotNumber, vehicle) {
    vehicle.clearSpots();
    let success = true;
  
    for (let i = spotNumber; i < spotNumber + vehicle.getSpotsNeeded(); i++) {
      const park_spot_status = await this.spots[i].park(vehicle);
      success = success && park_spot_status;
    }
  
    // Update the available spots count in the in-memory object
    this.availableSpots -= vehicle.getSpotsNeeded();
  
    // Update the available spots in the level document in MongoDB
    this.level.availableSpots -= vehicle.getSpotsNeeded();
  
    // Save the updated level to the database
    try {
      await this.level.save();
      console.log(`Level ${this.level.floor} updated: ${this.level.availableSpots} spots remaining.`);
    } catch (error) {
      console.error('Error saving updated level:', error);
    }
  
    return success;
  }
  

  findAvailableSpots(vehicle) {
    const spotsNeeded = vehicle.getSpotsNeeded();
    let lastRow = -1;
    let spotsFound = 0;
  
    for (let i = 1; i < this.spots.length; i++) {
      const spot = this.spots[i];
      if (!spot) continue; // Skip if spot is undefined
      
      if (lastRow !== spot.row) {
        spotsFound = 0;
        lastRow = spot.row;
      }
      
      if (spot.canFitVehicle(vehicle)) {
        spotsFound++;
      } else {
        spotsFound = 0;
      }
      
      if (spotsFound === spotsNeeded) {
        return i - (spotsNeeded - 1);
      }
    }
    
    console.log("NO SPOTS FOUND");
    return -1;
  }


  print() {
  let lastRow = -1;
  for (let i = 0; i < this.spots.length; i++) {
    const spot = this.spots[i];
    if (spot.row !== lastRow) {
      console.log(" "); // Print a space
      lastRow = spot.row;
    }
    // spot.print();
  }
  }

  spotFreed() {
  this.availableSpots++;
  this.level.availableSpots++;
  // this.level.save();
  }

  // async unparkVehicle(vehicle_license_plate) {
  //   for (let i = 1; i < this.spots.length; i++) {
  //     const spot = this.spots[i];
  //     console.log("type", typeof spot.vehicle, spot.vehicle);
  //     if (spot && spot.vehicle && spot.vehicle === vehicle_license_plate) {
  //       const success = await spot.removeVehicle();
  //       if (success) {
  //         console.log(`Vehicle ${vehicle_license_plate} unparked from level ${this.floor}, spot ${i}`);
  //         return true;
  //       } else {
  //         console.log(`Failed to unpark vehicle ${vehicle_license_plate} from level ${this.floor}, spot ${i}`);
  //         return false;
  //       }

        
  //     }
  //   }
  //   return false;
  // }
  async unparkVehicle(vehicle_license_plate) {
    let anySpotFreed = false;
    let spotsFreed = 0;
    
    for (let i = 1; i < this.spots.length; i++) {
      const spot = this.spots[i];
      
      if (spot && spot.vehicle && spot.vehicle === vehicle_license_plate) {
        const success = await spot.removeVehicle();
        
        if (success) {
          console.log(`Vehicle ${vehicle_license_plate} unparked from level ${this.floor}, spot ${i}`);
          anySpotFreed = true;
          spotsFreed++;
        } else {
          console.log(`Failed to unpark vehicle ${vehicle_license_plate} from level ${this.floor}, spot ${i}`);
        }
      }
    }
    
    // Save the level document only once after all spots are freed
    if (anySpotFreed) {
      try {
        await this.level.save();
        console.log(`Level ${this.floor} updated after freeing ${spotsFreed} spots`);
      } catch (error) {
        console.error('Error saving level after unparking:', error);
      }
    }
    
    return anySpotFreed;
  }
}