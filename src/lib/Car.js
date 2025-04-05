import { Vehicle } from './Vehicle';
import { VehicleSize } from './VehicleSize';
import { ParkingSpot } from './ParkingSpot';

export class Car extends Vehicle {
  constructor(licensePlate) {
    super(licensePlate, 1); 
    this.size = VehicleSize.Compact
  }

  canFitInSpot(spot) {
    return spot.getSize() == VehicleSize.Large || spot.getSize() == VehicleSize.Compact; 
  }

  print() {
    console.log(`Car with license plate: ${this.getLicensePlate()}`);
    // super.print(); // Call the parent class's print method
  }
}
