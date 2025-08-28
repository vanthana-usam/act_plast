import express from 'express';
import sql from 'mssql'; // Assuming you're using mssql for SQL Server
import executeQuery from '../utils/helper.js';
const router = express.Router();


// Molds Endpoints
router.get('/api/molds', async (req, res) => {
  try {
    const { search } = req.query;
    let query = 'SELECT * FROM Molds WHERE 1=1';
    const params = [];
    if (search) {
      query += ' AND name LIKE @search';
      params.push({ name: 'search', type: sql.VarChar, value: `%${search}%` });
    }
    const molds = await executeQuery(query, params);
    res.json(molds);
  } catch (err) {
    console.error('Error fetching molds:', err);
    res.status(500).json([]); // Return empty array on error
  }
});

router.post('/api/molds', async (req, res) => {
  try {
    const {
      name, dimension, hotRunnerZones, sprueRadius, gateSequence, pmShotCount,
      openingShotCount, cores, ejectorType, status
    } = req.body;
    const query = `
      INSERT INTO Molds (name, dimension, hotRunnerZones, sprueRadius, gateSequence, pmShotCount, openingShotCount, cores, ejectorType, status)
      VALUES (@name, @dimension, @hotRunnerZones, @sprueRadius, @gateSequence, @pmShotCount, @openingShotCount, @cores, @ejectorType, @status)
    `;
    await executeQuery(query, [
      { name: 'name', type: sql.VarChar, value: name },
      { name: 'dimension', type: sql.VarChar, value: dimension },
      { name: 'hotRunnerZones', type: sql.Int, value: hotRunnerZones },
      { name: 'sprueRadius', type: sql.Decimal(4,1), value: sprueRadius },
      { name: 'gateSequence', type: sql.Int, value: gateSequence },
      { name: 'pmShotCount', type: sql.Int, value: pmShotCount },
      { name: 'openingShotCount', type: sql.Int, value: openingShotCount },
      { name: 'cores', type: sql.Int, value: cores },
      { name: 'ejectorType', type: sql.VarChar, value: ejectorType },
      { name: 'status', type: sql.VarChar, value: status }
    ]);
    res.status(201).json({ message: 'Mold added successfully' });
  } catch (err) {
    console.error('Error adding mold:', err);
    res.status(500).json({ error: 'Failed to add mold' });
  }
});

// Update Mold
router.put('/api/molds/:moldId', async (req, res) => {
  try {
    const { moldId } = req.params;
    const {
      name, dimension, hotRunnerZones, sprueRadius, gateSequence, pmShotCount,
      openingShotCount, cores, ejectorType, status
    } = req.body;

    const query = `
      UPDATE Molds
      SET name = @name,
          dimension = @dimension,
          hotRunnerZones = @hotRunnerZones,
          sprueRadius = @sprueRadius,
          gateSequence = @gateSequence,
          pmShotCount = @pmShotCount,
          openingShotCount = @openingShotCount,
          cores = @cores,
          ejectorType = @ejectorType,
          status = @status
      WHERE moldId = @moldId
    `;

    await executeQuery(query, [
      { name: 'moldId', type: sql.UniqueIdentifier, value: moldId }, // ✅ GUID
      { name: 'name', type: sql.VarChar, value: name },
      { name: 'dimension', type: sql.VarChar, value: dimension },
      { name: 'hotRunnerZones', type: sql.Int, value: hotRunnerZones },
      { name: 'sprueRadius', type: sql.Decimal(10, 2), value: sprueRadius },
      { name: 'gateSequence', type: sql.Int, value: gateSequence },
      { name: 'pmShotCount', type: sql.Int, value: pmShotCount },
      { name: 'openingShotCount', type: sql.Int, value: openingShotCount },
      { name: 'cores', type: sql.Int, value: cores },
      { name: 'ejectorType', type: sql.VarChar, value: ejectorType },
      { name: 'status', type: sql.VarChar, value: status }
    ]);

    res.json({ message: 'Mold updated successfully' });
  } catch (err) {
    console.error('Error updating mold:', err);
    res.status(500).json({ error: 'Failed to update mold' });
  }
});

// Delete Mold
router.delete('/api/molds/:moldId', async (req, res) => {
  try {
    const { moldId } = req.params;

    const query = `DELETE FROM Molds WHERE moldId = @moldId`;

    await executeQuery(query, [
      { name: 'moldId', type: sql.UniqueIdentifier, value: moldId } // ✅ GUID
    ]);

    res.json({ message: 'Mold deleted successfully' });
  } catch (err) {
    console.error('Error deleting mold:', err);
    res.status(500).json({ error: 'Failed to delete mold' });
  }
});

export default router; // Export the router to use in your main app file