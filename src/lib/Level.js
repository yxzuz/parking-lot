import { VehicleSize } from './VehicleSize.js';
import { ParkingSpot } from './ParkingSpot.js';

export class Level {
  constructor(flr, numberSpots) {
    this.floor = flr;
    this.spots = new Array(numberSpots);
    this.availableSpots = numberSpots; // number of free spots
    this.SPOTS_PER_ROW = 10;

    const largeSpots = Math.floor(numberSpots / 4);
    const bikeSpots = Math.floor(numberSpots / 4);
    const compactSpots = numberSpots - largeSpots - bikeSpots;

    for (let i = 0; i < numberSpots; i++) {
      let sz = VehicleSize.Motorcycle; 
      if (i < largeSpots) {
        sz = VehicleSize.Large;
      } else if (i < largeSpots + compactSpots) {
        sz = VehicleSize.Compact;
      }

      const row = Math.floor(i / this.SPOTS_PER_ROW);
      this.spots[i] = new ParkingSpot(this, row, i, sz); // Assuming ParkingSpot is defined elsewhere
      this.availableSpots = numberSpots
    }
  }

  getAvailableSpots() {
      return this.availableSpots;
    }

  /* Try to find a place to park this vehicle. Return false if failed. */
  parkVehicle(vehicle) {
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

    for (let i = 0; i < this.spots.length; i++) {
      const spot = this.spots[i];
      if (lastRow !== spot.getRow()) {
        spotsFound = 0;
        lastRow = spot.getRow();
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

    return -1;
  }

  print() {
  let lastRow = -1;
  for (let i = 0; i < this.spots.length; i++) {
    const spot = this.spots[i];
    if (spot.getRow() !== lastRow) {
      console.log(" "); // Print a space
      lastRow = spot.getRow();
    }
    spot.print();
  }
  }

  spotFreed() {
  this.availableSpots++;
  }





  }