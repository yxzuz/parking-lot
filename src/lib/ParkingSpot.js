import { VehicleSize } from "./VehicleSize.js";


export class ParkingSpot {
    constructor(level,spotMongo, row,  spotNumber, spotSize, vehicle= null) {
      this.level = level; // level object
      this.spotMongo = spotMongo; // MongoDB object
      this.row = row;
      this.spotNumber = spotNumber;
      this.spotSize = spotSize;
      this.vehicle = vehicle; // Initially no vehicle parked
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


  async park(vehicle) {
        if (!this.canFitVehicle(vehicle)) { // Check if the vehicle fits
        return false; // Vehicle doesn't fit, parking failed
        }
        vehicle.park(this); // Notify the vehicle it's parked
        this.vehicle = vehicle; // Park the vehicle
        console.log("🚗 Vehicle parked in spot:",this.vehicle);
        this.spotMongo.currentVehicle = vehicle.getLicensePlate(); // Update the MongoDB object
        this.spotMongo.isAvailable = false; // Mark the spot as occupied
        try {
            await this.spotMongo.save(); // Save the updated MongoDB object
            if (vehicle.getParkingSpots()){
                for (let i = 0; i < vehicle.getParkingSpots().length; i++){
                    console.log("🚗 Vehicle parked in spot:",vehicle.getParkingSpots()[i].getSpotNumber());
                }
              console.log("Parking spot saved successfully {");
            }
            

        }
        catch (error) {
            console.error("Error saving parking spot:", error);
            return false; // Save failed, parking failed
        }
        
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

  async removeVehicle() {
        this.level.spotFreed(); // Free the spot from the level
        this.vehicle = null; // Remove the vehicle from the spot
        this.spotMongo.currentVehicle = null; // Update the MongoDB object
        this.spotMongo.isAvailable = true; // Mark the spot as available
        try {
            this.spotMongo.save(); // Save the updated MongoDB object
        }
        catch (error) {
            console.error("Error saving parking spot:", error);
            return false; // Save failed, removal failed
        }
        return true; // Removal successful
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