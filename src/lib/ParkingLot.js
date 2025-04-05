import { Level } from './Level.js';


export class ParkingLot {
    constructor() {
      this.NUM_LEVELS = 3; // Assuming 3 levels for the parking lot
      this.levels = new Array(this.NUM_LEVELS);
      for (let i = 0; i < this.NUM_LEVELS; i++) {
        this.levels[i] = new Level(i, 30); // Assuming Level class is defined elsewhere
      }
    }
  
    /* Park the vehicle in a spot (or multiple spots). Return false if failed. */
    parkVehicle(vehicle) {
      for (let i = 0; i < this.levels.length; i++) {
        if (this.levels[i].parkVehicle(vehicle)) { // Assuming Level has parkVehicle method
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