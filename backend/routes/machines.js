
import express from 'express';
import sql from 'mssql'; // Assuming you're using mssql for SQL Server
import executeQuery from '../utils/helper.js';
import authMiddleware from '../middleware/authMiddleware.js';

const router = express.Router();

// ✅ Get Machines API

router.get('/machines',authMiddleware, async (req, res) => {
  try {
    const { search } = req.query;
    let query = 'SELECT * FROM Machines WHERE 1=1';
    const params = [];
    if (search) {
      query += ' AND name LIKE @search';
      params.push({ name: 'search', type: sql.VarChar, value: `%${search}%` });
    }
    const machines = await executeQuery(query, params);
    res.json(machines);
  } catch (err) {
    console.error('Error fetching machines:', err);
    res.status(500).json([]); // Return empty array on error
  }
});


router.post('/machines', async (req, res) => { 
  try {
    const {
      name, tieBarDistance, cores, maxMoldHeight, maxDaylight, screwDia, ldRatio,
      screwType, shotSize, screwStrokeLength, ejectorStrokeLength, minMoldHeight, hopperCapacity, status
    } = req.body;
    const query = `
      INSERT INTO Machines (
        name, tieBarDistance, cores, maxMoldHeight, maxDaylight, screwDia, ldRatio,
        screwType, shotSize, screwStrokeLength, ejectorStrokeLength, minMoldHeight, hopperCapacity, status
      ) VALUES (
        @name, @tieBarDistance, @cores, @maxMoldHeight, @maxDaylight, @screwDia, @ldRatio,
        @screwType, @shotSize, @screwStrokeLength, @ejectorStrokeLength, @minMoldHeight, @hopperCapacity, @status
      )
    `;
    await executeQuery(query, [
      { name: 'name', type: sql.VarChar, value: name },
      { name: 'tieBarDistance', type: sql.VarChar, value: tieBarDistance },
      { name: 'cores', type: sql.Int, value: cores },
      { name: 'maxMoldHeight', type: sql.Int, value: maxMoldHeight },
      { name: 'maxDaylight', type: sql.Int, value: maxDaylight },
      { name: 'screwDia', type: sql.Int, value: screwDia },
      { name: 'ldRatio', type: sql.Int, value: ldRatio },
      { name: 'screwType', type: sql.VarChar, value: screwType },
      { name: 'shotSize', type: sql.Int, value: shotSize },
      { name: 'screwStrokeLength', type: sql.Int, value: screwStrokeLength },
      { name: 'ejectorStrokeLength', type: sql.Int, value: ejectorStrokeLength },
      { name: 'minMoldHeight', type: sql.Int, value: minMoldHeight },
      { name: 'hopperCapacity', type: sql.Int, value: hopperCapacity },
      { name: 'status', type: sql.VarChar, value: status }
    ]);
    res.status(201).json({ message: 'Machine added successfully' });
  } catch (err) {
    console.error('Error adding machine:', err);
    res.status(500).json({ error: 'Failed to add machine' });
  }
});

// Update Machine
router.put('/machines/:machineId', async (req, res) => {
  try {
    const { machineId } = req.params;
    const {
      name, tieBarDistance, cores, maxMoldHeight, maxDaylight, screwDia, ldRatio,
      screwType, shotSize, screwStrokeLength, ejectorStrokeLength, minMoldHeight, hopperCapacity, status
    } = req.body;

    console.log(req.body);
    
    const query = `
      UPDATE Machines
      SET name = @name,
          tieBarDistance = @tieBarDistance,
          cores = @cores,
          maxMoldHeight = @maxMoldHeight,
          maxDaylight = @maxDaylight,
          screwDia = @screwDia,
          ldRatio = @ldRatio,
          screwType = @screwType,
          shotSize = @shotSize,
          screwStrokeLength = @screwStrokeLength,
          ejectorStrokeLength = @ejectorStrokeLength,
          minMoldHeight = @minMoldHeight,
          hopperCapacity = @hopperCapacity,
          status = @status
      WHERE machineId = @machineId
    `;

    await executeQuery(query, [
      { name: 'machineId', type: sql.UniqueIdentifier, value: machineId },
      { name: 'name', type: sql.VarChar, value: name },
      { name: 'tieBarDistance', type: sql.VarChar, value: tieBarDistance },
      { name: 'cores', type: sql.Int, value: cores },
      { name: 'maxMoldHeight', type: sql.Int, value: maxMoldHeight },
      { name: 'maxDaylight', type: sql.Int, value: maxDaylight },
      { name: 'screwDia', type: sql.Int, value: screwDia },
      { name: 'ldRatio', type: sql.Int, value: ldRatio },
      { name: 'screwType', type: sql.VarChar, value: screwType },
      { name: 'shotSize', type: sql.Int, value: shotSize },
      { name: 'screwStrokeLength', type: sql.Int, value: screwStrokeLength },
      { name: 'ejectorStrokeLength', type: sql.Int, value: ejectorStrokeLength },
      { name: 'minMoldHeight', type: sql.Int, value: minMoldHeight },
      { name: 'hopperCapacity', type: sql.Int, value: hopperCapacity },
      { name: 'status', type: sql.VarChar, value: status }
    ]);

    res.json({ message: 'Machine updated successfully' });
  } catch (err) {
    console.error('Error updating machine:', err);
    res.status(500).json({ error: 'Failed to update machine' });
  }
});

// Delete Machine
router.delete('/machines/:machineId', async (req, res) => {
  try {
    const { machineId } = req.params;

    const query = `DELETE FROM Machines WHERE machineId = @machineId`;

    await executeQuery(query, [
      { name: 'machineId', type: sql.UniqueIdentifier, value: machineId }
    ]);

    res.json({ message: 'Machine deleted successfully' });
  } catch (err) {
    console.error('Error deleting machine:', err);
    res.status(500).json({ error: 'Failed to delete machine' });
  }
});


export default router; // Export the router to use in your main app file