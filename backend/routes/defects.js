import express from 'express';
import sql from 'mssql';
import executeQuery from '../utils/helper.js';

const router = express.Router();

// ✅ Get all defects
router.get('/api/defects', async (req, res) => {
  try {
    const defects = await executeQuery('SELECT * FROM Defects');
    res.json(defects);
  } catch (err) {
    console.error('Error fetching defects:', err);
    res.status(500).json([]);
  }
});

// ✅ Add a new defect
router.post('/api/defects', async (req, res) => {
  try {
    const { name, defectType, status = 'active' } = req.body;

    const query = `
      INSERT INTO Defects (name, defectType, status)
      VALUES (@name, @defectType, @status)
    `;

    await executeQuery(query, [
      { name: 'name', type: sql.VarChar, value: name },
      { name: 'defectType', type: sql.VarChar, value: defectType },
      { name: 'status', type: sql.VarChar, value: status },
    ]);

    res.status(201).json({ message: 'Defect added successfully' });
  } catch (err) {
    console.error('Error adding defect:', err);
    res.status(500).json({ error: 'Failed to add defect' });
  }
});

// ✅ Update a defect
router.put('/api/defects/:defectId', async (req, res) => {
  try {
    const { defectId } = req.params;
    const { name, defectType, status } = req.body;

    const query = `
      UPDATE Defects
      SET name = @name,
          defectType = @defectType,
          status = @status
      WHERE defectId = @defectId
    `;

    await executeQuery(query, [
      { name: 'defectId', type: sql.UniqueIdentifier, value: defectId },
      { name: 'name', type: sql.VarChar, value: name },
      { name: 'defectType', type: sql.VarChar, value: defectType },
      { name: 'status', type: sql.VarChar, value: status },
    ]);

    res.json({ message: 'Defect updated successfully' });
  } catch (err) {
    console.error('Error updating defect:', err);
    res.status(500).json({ error: 'Failed to update defect' });
  }
});

// ✅ Delete a defect
router.delete('/api/defects/:defectId', async (req, res) => {
  try {
    const { defectId } = req.params;

    const query = `DELETE FROM Defects WHERE defectId = @defectId`;

    await executeQuery(query, [
      { name: 'defectId', type: sql.UniqueIdentifier, value: defectId }
    ]);

    res.json({ message: 'Defect deleted successfully' });
  } catch (err) {
    console.error('Error deleting defect:', err);
    res.status(500).json({ error: 'Failed to delete defect' });
  }
});

export default router;
