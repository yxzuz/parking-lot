import { Level } from './Level.js';
import dbConnect from './mongodb.js';
import ParkingLevel from '../models/ParkingLevel.js';

let instance = null;

export class ParkingLot {
  constructor() {
    this.NUM_LEVELS = 3;
    this.levels = new Array(this.NUM_LEVELS);
    this.level_ids = {
      0: "67f2a086b02803c2471eb834", 
      1: "67f2a086b02803c2471eb835", 
      2: "67f2a086b02803c2471eb836"
    };
    this.initialized = false;
  }
  
  // Get singleton instance with guaranteed initialization
  static async getInstance() {
    if (!instance) {
      instance = new ParkingLot();
    }
    
    // Ensure initialization happens only once
    if (!instance.initialized) {
      await instance.initialize();
    }
    
    return instance;
  }
  
  // async initialize() {
  //   // if (this.initialized) return; // Prevent multiple initializations
    
  //   console.log("Initializing parking lot...");
  //   await dbConnect();
    
  //   // Load all levels in parallel for efficiency
  //   const levelPromises = Array(this.NUM_LEVELS).fill().map(async (_, i) => {
  //     try {
  //       const level = await ParkingLevel.findOne({ _id: this.level_ids[i] });
  //       if (level) {
  //         this.levels[i] = new Level(level);
  //         await this.levels[i].initialize();
  //         console.log(`Level ${i} initialized with ${this.levels[i].availableSpots} available spots`);
  //       } else {
  //         console.error(`Level ${i} not found`);
  //         throw new Error(`Level ${i} not found in database`);
  //       }
  //     } catch (error) {
  //       console.error(`Failed to initialize level ${i}:`, error);
  //       throw error;
  //     }
  //   });
    
  //   await Promise.all(levelPromises);
  //   this.initialized = true;
  //   console.log("Parking lot initialization complete!");
  // }

  async parkVehicle(vehicle) {
      // if (!this.initialized) {
      //   throw new Error("Parking lot not initialized. Call initialize() first");
      // }
      
      for (let i = 0; i < this.levels.length; i++) {
        console.log(`Trying to park vehicle ${vehicle.getLicensePlate()} in level ${i}`);
        console.log(`Level ${i} has ${this.levels[i]} available spots`);
        const parked = await this.levels[i].parkVehicle(vehicle); // <-- WAIT for result
        if (parked) {
          console.log(`Successfully parked vehicle ${vehicle.getLicensePlate()} in level ${i}`);
          return true;
        }
      }
    
      console.log(`Failed to park vehicle ${vehicle.getLicensePlate()} in any level`);
      return false;
    }



  async unparkVehicle(vehicle_license_plate) {
    console.log(`Unparking vehicle ${vehicle_license_plate}`);
    if (!this.initialized) {
      throw new Error("Parking lot not initialized. Call initialize() first");
    }

    
    for (let i = 0; i < this.levels.length; i++) {
      console.log(`Trying to unpark vehicle ${vehicle_license_plate} in level ${i}`);
      const success = await this.levels[i].unparkVehicle(vehicle_license_plate);
      if (success){
        console.log(`Successfully unparked vehicle ${vehicle_license_plate} in level ${i}`);
        return true;
      }
    }
    
    console.log(`Failed to unpark vehicle ${vehicle_license_plate} in any level`);
    return false;
  }
}





// // Singleton implementation with proper async initialization
// let instance = null;

// export class ParkingLot {
//   constructor() {
//     this.NUM_LEVELS = 3;
//     this.levels = new Array(this.NUM_LEVELS);
//     this.level_ids = {
//       0: "67f2a086b02803c2471eb834", 
//       1: "67f2a086b02803c2471eb835", 
//       2: "67f2a086b02803c2471eb836"
//     };
//     this.initialized = false;
//   }
  
//   // Get singleton instance with guaranteed initialization
//   static async getInstance() {
//     if (!instance) {
//       instance = new ParkingLot();
//     }
    
//     // Ensure initialization happens only once
//     if (!instance.initialized) {
//       await instance.initialize();
//     }
    
//     return instance;
//   }
  
//   async initialize() {
//     if (this.initialized) return; // Prevent multiple initializations
    
//     console.log("Initializing parking lot...");
//     await dbConnect();
    
//     // Load all levels in parallel for efficiency
//     const levelPromises = Array(this.NUM_LEVELS).fill().map(async (_, i) => {
//       try {
//         const level = await ParkingLevel.findOne({ _id: this.level_ids[i] });
//         if (level) {
//           this.levels[i] = new Level(level);
//           await this.levels[i].initialize();
//           console.log(`Level ${i} initialized with ${this.levels[i].availableSpots} available spots`);
//         } else {
//           console.error(`Level ${i} not found`);
//           throw new Error(`Level ${i} not found in database`);
//         }
//       } catch (error) {
//         console.error(`Failed to initialize level ${i}:`, error);
//         throw error;
//       }
//     });
    
//     await Promise.all(levelPromises);
//     this.initialized = true;
//     console.log("Parking lot initialization complete!");
//   }

//   parkVehicle(vehicle) {
//     if (!this.initialized) {
//       throw new Error("Parking lot not initialized. Call initialize() first");
//     }
    
//     for (let i = 0; i < this.levels.length; i++) {
//       console.log(`Trying to park vehicle ${vehicle.getLicensePlate()} in level ${i}`);
//       if (this.levels[i].parkVehicle(vehicle)) {
//         console.log(`Successfully parked vehicle ${vehicle.getLicensePlate()} in level ${i}`);
//         return true;
//       }
//     }
    
//     console.log(`Failed to park vehicle ${vehicle.getLicensePlate()} in any level`);
//     return false;
//   }
// }
