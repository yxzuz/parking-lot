
import { Vehicle } from './Vehicle';
import { VehicleSize } from './VehicleSize';
import { ParkingSpot } from './ParkingSpot';

export class Bus extends Vehicle {
  constructor(licensePlate) {
    super(licensePlate, 5); 
    this.size = VehicleSize.Large
  }

  // Implement the canFitInSpot method for the bus
  canFitInSpot(spot) { //parking spot
    return spot.getSize() == VehicleSize.Large; // A bus fits only in spots of size 2 or more
  }

  // Optionally override the print method to include specific bus details
  print() {
    console.log(`Bus with license plate: ${this.getLicensePlate()}`);
  }
}
