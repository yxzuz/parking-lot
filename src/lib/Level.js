export class Level {
  constructor(level) {
    this.level = level;
    this.floor = level.floor;
    this.spots = new Array(level.totalSpots + 1); // 1-based indexing
    this.availableSpots = level.availableSpots;
    this.initialized = false;
  }

  getAvailableSpots() {
      return this.availableSpots;
    }

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
  
    this.availableSpots -= vehicle.getSpotsNeeded();
  
    // Update the available spots in the level document in MongoDB
    this.level.availableSpots -= vehicle.getSpotsNeeded();
  

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
    }
  }

  spotFreed() {
    this.availableSpots++;
    this.level.availableSpots++;
  }

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