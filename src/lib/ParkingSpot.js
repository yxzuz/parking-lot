import { VehicleSize } from "./VehicleSize.js";


export class ParkingSpot {
    constructor(level, row, spotNumber, spotSize) {
      this.level = level;
      this.row = row;
      this.spotNumber = spotNumber;
      this.spotSize = spotSize;
      this.vehicle = null; // Initially no vehicle parked
    }
  
    setAvailable(status){
      this.available = status; // Set the availability of the spot
    }
    isAvailable() {
      return this.vehicle === null;
    }
  
    canFitVehicle(vehicle) {
      return this.isAvailable() && vehicle.canFitInSpot(this);
    }
    /* Park vehicle in this spot. */
    park(vehicle) {
        if (!this.canFitVehicle(vehicle)) { // Check if the vehicle fits
        return false; // Vehicle doesn't fit, parking failed
        }
        vehicle.park(this); // Notify the vehicle it's parked
        this.vehicle = vehicle; // Park the vehicle
        return true; // Parking successful
    }
    
    getRow() {
        return this.row; // Return the row number
    }
    
    getSpotNumber() {
        return this.spotNumber; // Return the spot number
    }
    
    getSize() {
        return this.spotSize; // Return the size of the spot
    }

    removeVehicle() {
        this.level.spotFreed(); // Free the spot from the level
        this.vehicle = null; // Remove the vehicle from the spot
    }

    print() {
        if (this.vehicle === null) {
          if (this.spotSize === VehicleSize.Compact) {
            console.log("c");
          } else if (this.spotSize === VehicleSize.Large) {
            console.log("l");
          } else if (this.spotSize === VehicleSize.Motorcycle) {
            console.log("m");
          }
        } else {
          this.vehicle.print(); // Assuming vehicle has a print() method
        }
      }
}