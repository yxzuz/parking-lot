import dbConnect from '../../lib/mongodb';
import ParkingLevel from '@/models/ParkingLevel';
import ParkingSpot from '@/models/ParkingSpot';


export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ success: false, message: 'Method not allowed' });
  }

  try {

    await dbConnect();
    // Fetch all parking levels
    const levelsData = await ParkingLevel.find({});
    const spots = await ParkingSpot.find({})
    // console.log('spots',spots);

    // console.log('leveldata',levelsData);

    // Group spots by level
    const spotsGroupedByLevel = spots.reduce((acc, spot) => {
      // Get the level of the current spot
      const levelId = spot.level.toString();

      // If the level is not in the accumulator, initialize an empty array for it
      if (!acc[levelId]) {
        acc[levelId] = [];
      }

      // Add the spot to the appropriate level
      acc[levelId].push(spot);

      return acc;
    }, {});

    // Map the levels data to include spots for each level
    const responseData = levelsData.map(level => {
      const levelId = level._id.toString();
      
      // Get the spots associated with the current level
      const levelSpots = spotsGroupedByLevel[levelId] || [];

      return {
        floor: level.floor,
        totalSpots: level.totalSpots,
        availableSpots: level.availableSpots,
        spots: levelSpots 
      };
    });

    
    return res.status(200).json({ 
      success: true, 
      data: responseData
    });
  } catch (error) {
    console.error('Error fetching parking levels:', error);
    return res.status(500).json({ 
      success: false, 
      message: 'Internal server error' 
    });
  }
}

