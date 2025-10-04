
import express from 'express';
import sql from 'mssql';
import { v4 as uuidv4 } from 'uuid';
import executeQuery from '../utils/helper.js'; // helper wrapper for queries
import authMiddleware from '../middleware/authMiddleware.js';

const router = express.Router();

// ========================= PREVENTIVE MAINTENANCE =========================

/**
 * GET all preventive maintenance records
 */
router.get('/preventive-maintenance', authMiddleware, async (req, res) => {
  try {
    const query = `
      SELECT Id, EquipmentType, DueDate, Description, Status, CreatedAt, UpdatedAt, CompletedAt
      FROM [dbo].[PreventiveMaintenance]
    `;
    const result = await executeQuery(query);
    res.json(result); // Send only the recordset array
  } catch (err) {
    console.error('❌ Error fetching preventive maintenance records:', err);
    res.status(500).json({ 
      error: 'Failed to fetch records', 
      details: process.env.NODE_ENV === 'production' ? 'Internal server error' : err.message 
    });
  }
});

/**
 * GET preventive maintenance record by ID
 */
router.get('/preventive-maintenance/:id', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const query = `SELECT * FROM [dbo].[PreventiveMaintenance] WHERE Id = @Id`;
    const result = await executeQuery(query, [
      { name: 'Id', type: sql.UniqueIdentifier, value: id },
    ]);

    const records = result; // Use recordset
    if (!records || records.length === 0) {
      return res.status(404).json({ error: 'Record not found' });
    }

    res.json(records[0]);
  } catch (err) {
    console.error('❌ Error fetching preventive maintenance record:', err);
    res.status(500).json({ 
      error: 'Failed to fetch record', 
      details: process.env.NODE_ENV === 'production' ? 'Internal server error' : err.message 
    });
  }
});

/**
 * POST create new preventive maintenance record
 * and automatically create a corresponding task
 */
router.post('/preventive-maintenance', authMiddleware, async (req, res) => {
  console.log('🚀 Hit POST /api/preventive-maintenance');
  try {
    const { EquipmentType, DueDate, Description } = req.body;
    console.log('📝 Received preventive maintenance record:', req.body);

    if (!EquipmentType) {
      return res.status(400).json({ error: 'EquipmentType is required' });
    }

    const id = uuidv4();

    // 1️⃣ Insert into PreventiveMaintenance table
    const pmQuery = `
      INSERT INTO [dbo].[PreventiveMaintenance]
      (Id, EquipmentType, DueDate, Description, Status, CreatedAt)
      VALUES (@Id, @EquipmentType, @DueDate, @Description, @Status, GETUTCDATE())
    `;

    const result = await executeQuery(pmQuery, [
      { name: 'Id', type: sql.UniqueIdentifier, value: id },
      { name: 'EquipmentType', type: sql.NVarChar(50), value: EquipmentType },
      { name: 'DueDate', type: sql.Date, value: DueDate ? new Date(DueDate) : null },
      { name: 'Description', type: sql.NVarChar(sql.MAX), value: Description || '' },
      { name: 'Status', type: sql.NVarChar(50), value: 'pending' },
    ]);

    if (result.rowsAffected[0] === 0) {
      return res.status(500).json({ error: 'Failed to insert record' });
    }

    res.status(201).json({ id, message: 'Preventive maintenance record created successfully' });
  } catch (err) {
    console.error('❌ Error creating preventive maintenance record:', err);
    res.status(500).json({ 
      error: 'Failed to create record', 
      details: process.env.NODE_ENV === 'production' ? 'Internal server error' : err.message 
    });
  }
});

/**
 * PUT update preventive maintenance record
 */

// router.put('/preventive-maintenance/:id', authMiddleware, async (req, res) => {
//   try {
//     const { id } = req.params;
//     const { EquipmentType, DueDate, Description, Status, CompletedAt } = req.body;

//     console.log('📝 Received preventive maintenance update record:', req.body);

//     // Basic validation
   

//     const query = `
//       UPDATE [dbo].[PreventiveMaintenance]
//       SET EquipmentType = @EquipmentType,
//           DueDate = @DueDate,
//           Description = @Description,
//           Status = @Status,
//           CompletedAt = @CompletedAt,
//           UpdatedAt = GETUTCDATE()
//       WHERE Id = @Id
//     `;

//     const result = await executeQuery(query, [
//       { name: 'Id', type: sql.UniqueIdentifier, value: id },
//       { name: 'EquipmentType', type: sql.NVarChar(50), value: EquipmentType },
//       { name: 'DueDate', type: sql.Date, value: DueDate ? new Date(DueDate) : null },
//       { name: 'Description', type: sql.NVarChar(sql.MAX), value: Description || '' },
//       { name: 'Status', type: sql.NVarChar(50), value: Status },
//       { name: 'CompletedAt', type: sql.DateTime2, value: CompletedAt ? new Date(CompletedAt) : null },
//     ]);

//     console.log('🔍 PUT query result:', JSON.stringify(result, null, 2));

//     // Defensive check for result
//     if (!result || typeof result.rowsAffected === 'undefined' || !Array.isArray(result.rowsAffected)) {
//       console.error('❌ Invalid query result:', result);
//       return res.status(500).json({ error: 'Unexpected database response', details: 'Query result is invalid' });
//     }

//     if (result.rowsAffected[0] === 0) {
//       return res.status(404).json({ error: 'Record not found' });
//     }

//     res.json({ message: '✅ Preventive maintenance record updated' });
//   } catch (err) {
//     console.error('❌ Error updating preventive maintenance record:', err);
//     res.status(500).json({
//       error: 'Failed to update record',
//       details: process.env.NODE_ENV === 'production' ? 'Internal server error' : err.message,
//     });
//   }
// });

router.put('/preventive-maintenance/:id', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const { EquipmentType, DueDate, Description, Status, CompletedAt } = req.body;

    console.log('📝 Received preventive maintenance update record:', req.body);

    // ------------------- LOG PARAMETERS -------------------
    console.log('🔹 PUT query params:', {
      Id: id,
      EquipmentType,
      DueDate,
      Description,
      Status,
      CompletedAt,
    });

    // ------------------- SQL UPDATE -------------------
    const query = `
      UPDATE [dbo].[PreventiveMaintenance]
      SET EquipmentType = @EquipmentType,
          DueDate = @DueDate,
          Description = @Description,
          Status = @Status,
          CompletedAt = @CompletedAt,
          UpdatedAt = GETUTCDATE()
      WHERE Id = @Id
    `;

    let result;
    try {
      result = await executeQuery(query, [
        { name: 'Id', type: sql.UniqueIdentifier, value: id },
        { name: 'EquipmentType', type: sql.NVarChar(50), value: EquipmentType },
        { name: 'DueDate', type: sql.Date, value: DueDate ? new Date(DueDate) : null },
        { name: 'Description', type: sql.NVarChar(sql.MAX), value: Description || '' },
        { name: 'Status', type: sql.NVarChar(50), value: Status },
        { name: 'CompletedAt', type: sql.DateTime2, value: CompletedAt ? new Date(CompletedAt) : null },
      ]);
    } catch (sqlErr) {
      console.error('❌ SQL Error:', sqlErr);
      return res.status(500).json({
        error: 'Database error while updating record',
        details: sqlErr.message,
      });
    }

    console.log('🔍 PUT query result:', JSON.stringify(result, null, 2));

    if (!result || !Array.isArray(result.rowsAffected)) {
      return res.status(500).json({ error: 'Unexpected database response', details: 'Query result invalid' });
    }

    if (result.rowsAffected[0] === 0) {
      return res.status(404).json({ error: 'Record not found' });
    }

    res.json({ message: '✅ Preventive maintenance record updated' });
  } catch (err) {
    console.error('❌ Error updating preventive maintenance record:', err);
    res.status(500).json({
      error: 'Failed to update record',
      details: process.env.NODE_ENV === 'production' ? 'Internal server error' : err.message,
    });
  }
});


/**
 * DELETE preventive maintenance record
 */
router.delete('/preventive-maintenance/:id', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;

    const query = `DELETE FROM [dbo].[PreventiveMaintenance] WHERE Id = @Id`;
    const result = await executeQuery(query, [
      { name: 'Id', type: sql.UniqueIdentifier, value: id },
    ]);

    if (result.rowsAffected[0] === 0) {
      return res.status(404).json({ error: 'Record not found' });
    }

    res.json({ message: '✅ Preventive maintenance record deleted' });
  } catch (err) {
    console.error('❌ Error deleting preventive maintenance record:', err);
    res.status(500).json({ 
      error: 'Failed to delete record', 
    });
  }
});


export default router;
