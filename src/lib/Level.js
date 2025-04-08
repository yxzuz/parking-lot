import dbConnect from './mongodb.js';
import ParkingSpot from '@/models/ParkingSpot.js';
import { ParkingSpot as ParkingSpotClass } from './ParkingSpot.js';

export class Level {
  constructor(level) { //flr, numberSpots
    this.level = level; // mongo object
    this.floor = level.floor;
    this.spots = new Array(level.totalSpots);
    this.availableSpots = level.availableSpots; // number of free spots
    this.SPOTS_PER_ROW = 10;

    // const largeSpots = Math.floor(numberSpots / 4);
    // const bikeSpots = Math.floor(numberSpots / 4);
    // const compactSpots = numberSpots - largeSpots - bikeSpots;

    // for (let i = 0; i < numberSpots; i++) {
      // let sz = VehicleSize.Motorcycle; 
      // if (i < largeSpots) {
      //   sz = VehicleSize.Large;
      // } else if (i < largeSpots + compactSpots) {
      //   sz = VehicleSize.Compact;
      // }
      // const row = Math.floor(i / this.SPOTS_PER_ROW);

      // this.spots[i] = new ParkingSpot(this, row, i, sz); 
      // this.availableSpots = numberSpots
    }
  
    async initialize() {
      await dbConnect();
      for (let i = 1; i < this.level.totalSpots + 1; i++) {
        const spot = await ParkingSpot.findOne({ level: this.level._id, spotNumber: i });
    
        if (spot) { // Ensure spot is found
          this.spots[i] = new ParkingSpotClass(
            this,
            spot.row,
            spot.spotNumber,
            spot.spotSize,
            spot.currentVehicle
          );
    
          // console.log('spot4444', this.spots[i].row, this.spots[i].spotNumber, this.spots[i].spotSize, this.spots[i].currentVehicle);
        } else {
          console.warn(`Spot ${i} not found on level ${this.floor}`);
        }
      }
      this.availableSpots = this.level.totalSpots;
    }
    

  getAvailableSpots() {
      return this.availableSpots;
    }

  /* Try to find a place to park this vehicle. Return false if failed. */
  parkVehicle(vehicle) {
    // console.log("IDK", this.getAvailableSpots(), vehicle.getSpotsNeeded());
      if (this.getAvailableSpots() < vehicle.getSpotsNeeded()) {
      return false;
      }

      const spotNumber = this.findAvailableSpots(vehicle);

      if (spotNumber < 0) {
      return false;
      }

      return this.parkStartingAtSpot(spotNumber, vehicle);
  }
  /* Park a vehicle starting at the spot spotNumber, and continuing until vehicle.spotsNeeded. */
  parkStartingAtSpot(spotNumber, vehicle) {
    console.log("Park starting at spot", spotNumber, vehicle.getSpotsNeeded());
      vehicle.clearSpots();
      let success = true;

      for (let i = spotNumber; i < spotNumber + vehicle.getSpotsNeeded(); i++) {
      success = success && this.spots[i].park(vehicle);
      }

      this.availableSpots -= vehicle.getSpotsNeeded();
      console.log(`Vehicle parked in level ${this.floor}, starting at spot ${spotNumber}.`);
      console.log('Parked at spots:' + spotNumber + ' to ' + (spotNumber + vehicle.getSpotsNeeded() - 1));
      console.log(this.spots[spotNumber].vehicle);
      return success;
  }

    /* find a spot to park this vehicle. Return index of spot, or -1 on failure. */
  findAvailableSpots(vehicle) {
    const spotsNeeded = vehicle.getSpotsNeeded();
    let lastRow = -1;
    let spotsFound = 0;

    for (let i = 1; i < this.spots.length; i++) {
      const spot = this.spots[i];
      // console.log("SPOT", spot.spotNumber, spot.row,spot.spotSize, spot.vehicle);
      console.log("fit",spot.canFitVehicle(vehicle));
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
  }





  }