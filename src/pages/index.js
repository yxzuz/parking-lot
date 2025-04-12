// pages/index.js
import { useState, useEffect } from 'react';
import Head from 'next/head';
import styles from '../styles/Home.module.css';

export default function Home() {
  const [licensePlate, setLicensePlate] = useState('');
  const [vehicleType, setVehicleType] = useState('car');
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('info'); // 'success', 'error', 'info'
  const [levels, setLevels] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [removeLicensePlate, setRemoveLicensePlate] = useState('');



  // Fetch parking lot status
  const fetchParkingStatus = async () => {
    try {
      const response = await fetch('/api/parkinglot');
      const data = await response.json();
      console.log('Fetched parking status:', data);
      if (data.success) {
        setLevels(data.data);
      } else {
        console.error('Error fetching parking status:', data.message);
        setMessage('Failed to load parking status. Please try again.');
        setMessageType('error');
      }
    } catch (error) {
      console.error('Error fetching parking status:', error);
      setMessage('Failed to load parking status. Please try again.');
      setMessageType('error');
    }
  };

  // Initial load
  useEffect(() => {
    fetchParkingStatus();
    
    const intervalId = setInterval(fetchParkingStatus, 5000);
    
    return () => clearInterval(intervalId);
  }, []);

  const parkVehicle = async () => {
    if (!licensePlate.trim()) {
      setMessage('Please enter a valid license plate.');
      setMessageType('error');
      return;
    }

    setIsLoading(true);
    
    try {
      const response = await fetch('/api/vehicles/park', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          licensePlate,
          vehicleType
        }),
      });

      const data = await response.json();
      
      setMessage(data.message);
      setMessageType(data.success ? 'success' : 'error');
      
      if (data.success) {
        setLicensePlate('');
        fetchParkingStatus();
      }
    } catch (error) {
      console.error('Error parking vehicle:', error);
      setMessage('Failed to park vehicle. Please try again.');
      setMessageType('error');
    } finally {
      setIsLoading(false);
    }
  };

  const removeVehicle = async () => {
    if (!removeLicensePlate.trim()) {
      setMessage('Please enter a valid license plate to remove.');
      setMessageType('error');
      return;
    }

    setIsLoading(true);
    
    try {
      const response = await fetch('/api/vehicles/unpark', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          licensePlate: removeLicensePlate
        }),
      });

      const data = await response.json();
      
      setMessage(data.message);
      setMessageType(data.success ? 'success' : 'error');
      
      if (data.success) {
        setRemoveLicensePlate('');
        fetchParkingStatus();
      }
    } catch (error) {
      console.error('Error removing vehicle:', error);
      setMessage('Failed to remove vehicle. Please try again.');
      setMessageType('error');
    } finally {
      setIsLoading(false);
    }
  };

  const getSizeLabel = (size) => {
    switch (size) {
      case "motorcycle": return 'M';
      case "compact": return 'C';
      case "large": return 'L';
      default: return '?';
    }
  };

  const getSpotColor = (spot) => {
    if (!spot.isAvailable) {
      return vehicleTypeColors.occupied;
    }
    
    switch (spot.spotSize) {
      case "motorcycle": return vehicleTypeColors.motorcycle;
      case "compact": return vehicleTypeColors.car;
      case "large": return vehicleTypeColors.bus;
      default: return '#ccc';
    }
  };

  const vehicleTypeColors = {
    car: '#90EE90', // Light green
    bus: '#ADD8E6', // Light blue
    motorcycle: '#FFFACD', // Light yellow
    occupied: '#FF6347', // Tomato red
  };

  const getMessageClass = () => {
    switch (messageType) {
      case 'success': return styles.successMessage;
      case 'error': return styles.errorMessage;
      default: return styles.infoMessage;
    }
  };

  return (
    <div className={styles.container}>
      <Head>
        <title>Parking Lot Management</title>
        <meta name="description" content="Parking Lot Management System" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className={styles.main}>
        <h1 className={styles.title}>
          Parking Lot Management System
        </h1>

        {message && (
          <div className={getMessageClass()}>
            {message}
            <button 
              onClick={() => setMessage('')} 
              className={styles.closeButton}
            >
              ×
            </button>
          </div>
        )}

        <div className={styles.actionCards}>
          <div className={styles.parkingForm}>
            <h2>Park a Vehicle</h2>
            <div className={styles.formGroup}>
              <label>License Plate:</label>
              <input
                type="text"
                value={licensePlate}
                onChange={(e) => setLicensePlate(e.target.value)}
                placeholder="Enter license plate"
                disabled={isLoading}
              />
            </div>
            
            <div className={styles.formGroup}>
              <label>Vehicle Type:</label>
              <select 
                value={vehicleType} 
                onChange={(e) => setVehicleType(e.target.value)}
                disabled={isLoading}
              >
                <option value="car">car</option>
                <option value="bus">bus</option>
                <option value="motorcycle">motorcycle</option>
              </select>
            </div>
            
            <button 
              onClick={parkVehicle} 
              className={styles.button}
              disabled={isLoading}
            >
              {isLoading ? 'Processing...' : 'Park Vehicle'}
            </button>
          </div>

          <div className={styles.parkingForm}>
            <h2>Remove a Vehicle</h2>
            <div className={styles.formGroup}>
              <label>License Plate:</label>
              <input
                type="text"
                value={removeLicensePlate}
                onChange={(e) => setRemoveLicensePlate(e.target.value)}
                placeholder="Enter license plate to remove"
                disabled={isLoading}
              />
            </div>
            
            <button 
              onClick={removeVehicle} 
              className={`${styles.button} ${styles.removeButton}`}
              disabled={isLoading}
            >
              {isLoading ? 'Processing...' : 'Remove Vehicle'}
            </button>
          </div>
        </div>

        <div className={styles.parkingLotDisplay}>
          <h2>Parking Lot Status</h2>
          
          <div className={styles.legend}>
            <div className={styles.legendItem}>
              <div className={styles.colorBox} style={{ backgroundColor: vehicleTypeColors.car }}></div>
              <span>Compact Spot (Car)</span>
            </div>
            <div className={styles.legendItem}>
              <div className={styles.colorBox} style={{ backgroundColor: vehicleTypeColors.bus }}></div>
              <span>Large Spot (Bus)</span>
            </div>
            <div className={styles.legendItem}>
              <div className={styles.colorBox} style={{ backgroundColor: vehicleTypeColors.motorcycle }}></div>
              <span>Motorcycle Spot</span>
            </div>
            <div className={styles.legendItem}>
              <div className={styles.colorBox} style={{ backgroundColor: vehicleTypeColors.occupied }}></div>
              <span>Occupied</span>
            </div>
          </div>
          
         {levels.map((level) => (
            <div key={level.floor} className={styles.level}>
              <h3>Level {level.floor} - Available Spots: {level.availableSpots}</h3>
              <div className={styles.parkingGrid}>
                {level.spots.map((spot) => (
                  <div
                    key={spot.spotNumber}
                    className={styles.parkingSpot}
                    style={{ backgroundColor: getSpotColor(spot) }}
                    title={spot.isAvailable ? `Spot ${spot.spotNumber} - ${getSizeLabel(spot.spotSize)}` : `Occupied by ${spot.currentVehicle}`}
                  >
                    <span>{spot.id}</span>
                    <small>{getSizeLabel(spot.spotSize)}</small>
                    {!spot.isAvailable && (
                      <div className={styles.licensePlate}>
                        {spot.currentVehicle}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
} 