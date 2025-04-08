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

  getParkingSpots() {
    return this._parkingSpots;
  }

  getSize() {
    return this.size; 
  }

  park(spot) {
    console.log('spot', spot.vehicle);
    console.log('Parking vehicle in spot:', spot.getSize(),spot.isAvailable(),spot.getSize() >= this.getSize());
    if (spot.isAvailable() && spot.getSize() >= this.getSize()) {
      this._parkingSpots.push(spot);
      spot.setAvailable(false); // Mark the spot as occupied
      console.log("Current parking spots:", this._parkingSpots);
      console.log(`Vehicle parked in spot: ${spot.getSpotNumber()}`);
    } else {
      console.log('No suitable spot available.');
    }
  }

  clearSpots() {
    if (this._parkingSpots.length === 0) {
      console.log('No spots to clear.');
      return;
    }

    for (let i = 0; i < this._parkingSpots.length; i++) {
      this._parkingSpots[i].removeVehicle(); // Calling removeVehicle to make the spot available
    }
    // Clear the list of parked spots for the vehicle
    this._parkingSpots = [];
    console.log(`All spots cleared for vehicle with license plate: ${this._licensePlate}`);
  }

  getLicensePlate() {
    return this._licensePlate;
  }

  getSpotsNeeded() {
    return this._spotNeeded;
  }
  print() {
    console.log('Vehicle details:');
  }

}
