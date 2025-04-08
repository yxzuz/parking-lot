import { Level } from './Level.js';
import dbConnect from './mongodb.js';
import ParkingLevel from '../models/ParkingLevel.js';


// export class ParkingLot {
//     constructor() {
//       this.NUM_LEVELS = 3; // 3 levels for the parking lot
//       this.levels = new Array(this.NUM_LEVELS);
//       this.level_ids = {0: "67f2a086b02803c2471eb834", 1:"67f2a086b02803c2471eb835", 2:"67f2a086b02803c2471eb836"};
//       this.initialize();
//       for (let i = 0; i < this.NUM_LEVELS; i++) {
//         console.log(`Level afterrrrrrrnds ${i} ${this.levels[i]}`);
//       }
//     }

//     async initialize() {
//       // Connect to the database before fetching levels
//       await dbConnect();  // Assuming dbConnect sets up the MongoDB connection

//       // Fetch levels from the database using their IDs
//       for (let i = 0; i < this.NUM_LEVELS; i++) {
//           const level = await ParkingLevel.findOne({ _id: this.level_ids[i] });
//           if (level) {
//               this.levels[i] = new Level(level); 
//           } else {
//               console.error(`Level ${i} not found`);
//           }
//       }
//       console.log("Levels after initialization:", this.levels);
//   }
export class ParkingLot {
  constructor() {
    this.NUM_LEVELS = 3;
    this.levels = new Array(this.NUM_LEVELS);
    this.level_ids = {0: "67f2a086b02803c2471eb834", 1:"67f2a086b02803c2471eb835", 2:"67f2a086b02803c2471eb836"};
  }

  async initialize() {
    await dbConnect();
    for (let i = 0; i < this.NUM_LEVELS; i++) {
        const level = await ParkingLevel.findOne({ _id: this.level_ids[i] });
        if (level) {
            this.levels[i] = new Level(level);
            console.log("Levels after initialization:", this.levels[i].availableSpots);
            await this.levels[i].initialize(); // Initialize each level
        } else {
            console.error(`Level ${i} not found`);
        }
    }
  }

  // static async create() { // ⬅ Factory method
  //     const parkingLot = new ParkingLot();
  //     await parkingLot.initialize();
  //     return parkingLot;
  // }


    /* Park the vehicle in a spot (or multiple spots). Return false if failed. */
    parkVehicle(vehicle) {
      // console.log(777,this.levels[1]);
      for (let i = 0; i < this.levels.length; i++) {
        if (this.levels[i].parkVehicle(vehicle)) { 
          console.log(`Parked vehicle in level ${i}`);
          return true;
        }
      }
      return false;
    }

    print(){
      console.log("Parking Lot:");
      for (let i = 0; i < this.levels.length; i++) {
        console.log(`Level ${i}:`);
        this.levels[i].print(); // Assuming Level has a print method
      }
    }
  }