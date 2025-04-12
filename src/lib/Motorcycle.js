import { Vehicle } from './Vehicle';
import { VehicleSize } from './VehicleSize';
import { ParkingSpot } from './ParkingSpot';

export class Motorcycle extends Vehicle {
  constructor(licensePlate) {
    super(licensePlate, 1); 
    this.size = VehicleSize.Motorcycle
  }

  canFitInSpot(spot) {
    return true; // A motorcycle can fit in any spot
  }

  print() {
    console.log(`Motorcycle with license plate: ${this.getLicensePlate()}`);
  }
}
