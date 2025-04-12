import { ObjectId } from 'mongodb';
import dbConnect from '../../lib/mongodb';
import ParkingSpot from '@/models/ParkingSpot';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, message: 'Method not allowed' });
  }

  try {
    // Connect to MongoDB
    await dbConnect();
    const ids = ["67f2a086b02803c2471eb834", "67f2a086b02803c2471eb835", "67f2a086b02803c2471eb836"]
    const levelId = new ObjectId("67f2a086b02803c2471eb836");

    // Data to be inserted
    const parkingSpotsData = [
            // Floor 0 (7 large spots, 16 compact spots, 7 motorcycle spots)
            // Row 1: Large spots (1-7)
            { spotNumber: 1, row: 1, level: levelId, spotSize: "large", isAvailable: true, currentVehicle: null },
            { spotNumber: 2, row: 1, level: levelId, spotSize: "large", isAvailable: true, currentVehicle: null  },
            { spotNumber: 3, row: 1, level: levelId, spotSize: "large", isAvailable: true, currentVehicle: null  },
            { spotNumber: 4, row: 1, level: levelId, spotSize: "large", isAvailable: true, currentVehicle: null  },
            { spotNumber: 5, row: 1, level: levelId, spotSize: "large", isAvailable: true, currentVehicle: null  },
            { spotNumber: 6, row: 1, level: levelId, spotSize: "large", isAvailable: true, currentVehicle: null  },
            { spotNumber: 7, row: 1, level: levelId, spotSize: "large", isAvailable: true, currentVehicle: null  },
          
            // Row 2: Compact spots (8-23)
            { spotNumber: 8, row: 1, level: levelId, spotSize: "compact", isAvailable: true, currentVehicle: null  },
            { spotNumber: 9, row: 1, level: levelId, spotSize: "compact", isAvailable: true, currentVehicle: null  },
            { spotNumber: 10, row: 2, level: levelId, spotSize: "compact", isAvailable: true, currentVehicle: null  },
            { spotNumber: 11, row: 2, level: levelId, spotSize: "compact", isAvailable: true, currentVehicle: null  },
            { spotNumber: 12, row: 2, level: levelId, spotSize: "compact", isAvailable: true, currentVehicle: null  },
            { spotNumber: 13, row: 2, level: levelId, spotSize: "compact", isAvailable: true, currentVehicle: null  },
            { spotNumber: 14, row: 2, level: levelId, spotSize: "compact", isAvailable: true, currentVehicle: null  },
            { spotNumber: 15, row: 2, level: levelId, spotSize: "compact", isAvailable: true, currentVehicle: null  },
            { spotNumber: 16, row: 2, level: levelId, spotSize: "compact", isAvailable: true, currentVehicle: null  },
            { spotNumber: 17, row: 2, level: levelId, spotSize: "compact", isAvailable: true, currentVehicle: null  },
            { spotNumber: 18, row: 2, level: levelId, spotSize: "compact", isAvailable: true, currentVehicle: null  },
            { spotNumber: 19, row: 3, level: levelId, spotSize: "compact", isAvailable: true, currentVehicle: null  },
            { spotNumber: 20, row: 3, level: levelId, spotSize: "compact", isAvailable: true, currentVehicle: null  },
            { spotNumber: 21, row: 3, level: levelId, spotSize: "compact", isAvailable: true, currentVehicle: null  },
            { spotNumber: 22, row: 3, level: levelId, spotSize: "compact", isAvailable: true, currentVehicle: null  },
              { spotNumber: 23, row: 3, level: levelId, spotSize: "compact", isAvailable: true, currentVehicle: null  },
            // Row 3: Motorcycle spots (24-30)
            
            { spotNumber: 24, row: 3, level: levelId, spotSize: "motorcycle", isAvailable: true, currentVehicle: null  },
            { spotNumber: 25, row: 3, level: levelId, spotSize: "motorcycle", isAvailable: true, currentVehicle: null  },
            { spotNumber: 26, row: 3, level: levelId, spotSize: "motorcycle", isAvailable: true, currentVehicle: null  },
            { spotNumber: 27, row: 3, level: levelId, spotSize: "motorcycle", isAvailable: true, currentVehicle: null  },
            { spotNumber: 28, row: 4, level: levelId, spotSize: "motorcycle", isAvailable: true, currentVehicle: null  },
            { spotNumber: 29, row: 4, level: levelId, spotSize: "motorcycle", isAvailable: true, currentVehicle: null  },
              { spotNumber: 30, row: 4, level: levelId, spotSize: "motorcycle", isAvailable: true, currentVehicle: null  }
          
    ];

    // // Insert data into ParkingLevel collection
    const result = await ParkingSpot.insertMany(parkingSpotsData);
    // const result = [level];
    return res.status(201).json({ success: true, data: result });
  } catch (error) {
    console.error('Error importing data:', error);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
}
