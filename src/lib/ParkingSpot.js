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
      this.available = status; 
    }

    isAvailable() {
      return this.vehicle === null;
    }
  
    canFitVehicle(vehicle) {
      return this.isAvailable() && vehicle.canFitInSpot(this);
    }

  async park(vehicle) {
        if (!this.canFitVehicle(vehicle)) { 
        return false; // Vehicle doesn't fit, parking failed
        }
        vehicle.park(this); // Notify the vehicle it's parked
        this.vehicle = vehicle; // Park the vehicle
        console.log("🚗 Vehicle parked in spot:",this.vehicle);
        // update mongoDB object
        this.spotMongo.currentVehicle = vehicle.getLicensePlate(); 
        this.spotMongo.isAvailable = false; 
        try {
            await this.spotMongo.save(); 
            if (vehicle.getParkingSpots()){
                for (let i = 0; i < vehicle.getParkingSpots().length; i++){
                    console.log("🚗 Vehicle parked in spot:",vehicle.getParkingSpots()[i].getSpotNumber());
                }
              console.log("Parking spot saved successfully {");
            }
            
        }
        catch (error) {
            console.error("Error saving parking spot:", error);
            return false;
        }
        
        return true; // Parking successful
    }
    
    getRow() {
        return this.row; 
    }
    
    getSpotNumber() {
        return this.spotNumber; 
    }
    
    getSize() {
        return this.spotSize; 
    }

  async removeVehicle() {
        this.level.spotFreed(); // Free the spot from the level
        this.vehicle = null; 
        // Update the MongoDB object
        this.spotMongo.currentVehicle = null; 
        this.spotMongo.isAvailable = true; 
        try {
            this.spotMongo.save(); 
        }
        catch (error) {
            console.error("Error saving parking spot:", error);
            return false; 
        }
        return true; 
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
          this.vehicle.print(); 
        }
      }
}