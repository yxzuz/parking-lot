// src/models/Vehicle.js
import { ParkingSpot } from './ParkingSpot';
import { VehicleSize } from './VehicleSize';

export class Vehicle {
  constructor(licensePlate, spotNeeded) {
    this._licensePlate = licensePlate;
    this._spotNeeded = spotNeeded;
    this._parkingSpots = [];
    this.size = VehicleSize.Compact
  }

  clearSpots() {
    for (let i = 0; i < this._parkingSpots.length; i++) {
      this._parkingSpots[i].removeVehicle();
    }                            
    this._parkingSpots = [];
  }

  park(parkingSpot) {
    this._parkingSpots.push(parkingSpot);
  }

  getParkingSpots() {
    return this._parkingSpots;
  }

  getSize() {
    return this.size; 
  }

  getLicensePlate() {
    return this._licensePlate;
  }

  getSpotsNeeded() {
    return this._spotNeeded;
  }

}
