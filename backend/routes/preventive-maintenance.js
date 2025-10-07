// final code
import express from 'express';
import { sql, poolPromise } from '../db.js';
import { body, param, validationResult } from 'express-validator';
import { v4 as uuidv4 } from 'uuid';
import { validate as isUuid } from 'uuid';
import { pmexecuteQuery } from '../utils/helper.js';
import authMiddleware from '../middleware/authMiddleware.js';

const router = express.Router();

// Validation middleware for POST and PUT
const preventiveValidation = [
  body('EquipmentType').trim().notEmpty().withMessage('Equipment type is required'),
  body('DueDate').optional().isDate().withMessage('Valid due date is required'),
  body('Description').optional().trim().isLength({ max: 1000 }).withMessage('Description cannot exceed 1000 characters'),
  body('Status').optional().isIn(['pending', 'in progress', 'completed']).withMessage('Status must be one of: pending, in progress, completed'),
];

// GET all preventive maintenance records
router.get('/preventive-maintenance', authMiddleware, async (req, res) => {
  try {
    const query = `
      SELECT Id, EquipmentType, DueDate, Description, Status, CreatedAt, UpdatedAt, CompletedAt
      FROM [dbo].[PreventiveMaintenance]
      ORDER BY CreatedAt DESC
    `;
    const result = await pmexecuteQuery(query);
    
    const records = result && result.recordset ? result.recordset : [];
    res.json({ success: true, data: records });
  } catch (err) {
    console.error('❌ Error fetching preventive maintenance records:', err);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch records',
      details: process.env.NODE_ENV === 'production' ? 'Internal server error' : err.message,
    });
  }
});


// GET preventive maintenance record by ID
router.get(
  '/preventive-maintenance/:id',
  [param('id').custom(isUuid).withMessage('Invalid ID format')],
  authMiddleware,
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    try {
      const { id } = req.params;
      const query = `SELECT Id, EquipmentType, DueDate, Description, Status, CreatedAt, UpdatedAt, CompletedAt
                    FROM [dbo].[PreventiveMaintenance] WHERE Id = @Id`;
      const result = await pmexecuteQuery(query, [
        { name: 'Id', type: sql.UniqueIdentifier, value: id },
      ]);

      const records = result.recordset;
      if (!records || records.length === 0) {
        return res.status(404).json({ success: false, error: 'Record not found' });
      }

      res.json({ success: true, data: records[0] });
    } catch (err) {
      console.error('❌ Error fetching preventive maintenance record:', err);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch record',
        details: process.env.NODE_ENV === 'production' ? 'Internal server error' : err.message,
      });
    }
  }
);

// POST create new preventive maintenance record
router.post('/preventive-maintenance', preventiveValidation, authMiddleware, async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, errors: errors.array() });
  }

  try {
    const { EquipmentType, DueDate, Description } = req.body;
    const id = uuidv4();
    const pool = await poolPromise;
    const transaction = new sql.Transaction(pool);
    await transaction.begin();

    try {
      const pmQuery = `
        INSERT INTO [dbo].[PreventiveMaintenance]
        (Id, EquipmentType, DueDate, Description, Status, CreatedAt)
        VALUES (@Id, @EquipmentType, @DueDate, @Description, @Status, GETUTCDATE())
      `;
      await pmexecuteQuery(
        pmQuery,
        [
          { name: 'Id', type: sql.UniqueIdentifier, value: id },
          { name: 'EquipmentType', type: sql.NVarChar(50), value: EquipmentType },
          { name: 'DueDate', type: sql.Date, value: DueDate ? new Date(DueDate) : null },
          { name: 'Description', type: sql.NVarChar(sql.MAX), value: Description || '' },
          { name: 'Status', type: sql.NVarChar(50), value: 'pending' },
        ],
        transaction
      );

      await transaction.commit();
      res.status(201).json({ success: true, data: { id, message: 'Preventive maintenance record created successfully' } });
    } catch (sqlErr) {
      await transaction.rollback();
      console.error('❌ SQL Error in POST:', sqlErr);
      return res.status(500).json({
        success: false,
        error: 'Database error while creating record',
        details: process.env.NODE_ENV === 'production' ? 'Internal server error' : sqlErr.message,
      });
    }
  } catch (err) {
    console.error('❌ Error creating preventive maintenance record:', err);
    res.status(500).json({
      success: false,
      error: 'Failed to create record',
      details: process.env.NODE_ENV === 'production' ? 'Internal server error' : err.message,
    });
  }
});

// PUT update preventive maintenance record
router.put(
  '/preventive-maintenance/:id',
  [param('id').custom(isUuid).withMessage('Invalid ID format'), ...preventiveValidation],
  authMiddleware,
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    try {
      const { id } = req.params;
      const { EquipmentType, DueDate, Description, Status, CompletedAt } = req.body;

      const pool = await poolPromise;
      const transaction = new sql.Transaction(pool);
      await transaction.begin();

      try {
        const checkQuery = `SELECT 1 FROM [dbo].[PreventiveMaintenance] WHERE Id = @Id`;
        const checkResult = await pmexecuteQuery(
          checkQuery,
          [{ name: 'Id', type: sql.UniqueIdentifier, value: id }],
          transaction
        );

        if (!checkResult.recordset || checkResult.recordset.length === 0) {
          await transaction.rollback();
          return res.status(404).json({ success: false, error: 'Record not found' });
        }

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
        const result = await pmexecuteQuery(
          query,
          [
            { name: 'Id', type: sql.UniqueIdentifier, value: id },
            { name: 'EquipmentType', type: sql.NVarChar(50), value: EquipmentType },
            { name: 'DueDate', type: sql.Date, value: DueDate ? new Date(DueDate) : null },
            { name: 'Description', type: sql.NVarChar(sql.MAX), value: Description || '' },
            { name: 'Status', type: sql.NVarChar(50), value: Status },
            { name: 'CompletedAt', type: sql.DateTime2, value: CompletedAt ? new Date(CompletedAt) : null },
          ],
          transaction
        );
        
        if (!result.rowsAffected || result.rowsAffected[0] === 0) {
          await transaction.rollback();
          return res.status(404).json({ success: false, error: 'Record not found or no changes applied' });
        }

        await transaction.commit();
        res.json({ success: true, data: { message: 'Preventive maintenance record updated' } });
      } catch (sqlErr) {
        await transaction.rollback();
        console.error('❌ SQL Error in PUT:', sqlErr);
        return res.status(500).json({
          success: false,
          error: 'Database error while updating record',
          details: process.env.NODE_ENV === 'production' ? 'Internal server error' : sqlErr.message,
        });
      }
    } catch (err) {
      console.error('❌ Error updating preventive maintenance record:', err);
      res.status(500).json({
        success: false,
        error: 'Failed to update record',
        details: process.env.NODE_ENV === 'production' ? 'Internal server error' : err.message,
      });
    }
  }
);

// DELETE preventive maintenance record
router.delete(
  '/preventive-maintenance/:id',
  [param('id').custom(isUuid).withMessage('Invalid ID format')],
  authMiddleware,
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    try {
      const { id } = req.params;
      const pool = await poolPromise;
      const transaction = new sql.Transaction(pool);
      await transaction.begin();

      try {
        const checkQuery = `SELECT 1 FROM [dbo].[PreventiveMaintenance] WHERE Id = @Id`;
        const checkResult = await pmexecuteQuery(
          checkQuery,
          [{ name: 'Id', type: sql.UniqueIdentifier, value: id }],
          transaction
        );

        if (checkResult.recordset.length === 0) {
          await transaction.rollback();
          return res.status(404).json({ success: false, error: 'Record not found' });
        }

        const query = `DELETE FROM [dbo].[PreventiveMaintenance] WHERE Id = @Id`;
        const result = await pmexecuteQuery(
          query,
          [{ name: 'Id', type: sql.UniqueIdentifier, value: id }],
          transaction
        );

        if (result.rowsAffected[0] === 0) {
          await transaction.rollback();
          return res.status(404).json({ success: false, error: 'Record not found' });
        }

        await transaction.commit();
        res.json({ success: true, data: { message: 'Preventive maintenance record deleted' } });
      } catch (sqlErr) {
        await transaction.rollback();
        console.error('❌ SQL Error in DELETE:', sqlErr);
        return res.status(500).json({
          success: false,
          error: 'Database error while deleting record',
          details: process.env.NODE_ENV === 'production' ? 'Internal server error' : sqlErr.message,
        });
      }
    } catch (err) {
      console.error('❌ Error deleting preventive maintenance record:', err);
      res.status(500).json({
        success: false,
        error: 'Failed to delete record',
        details: process.env.NODE_ENV === 'production' ? 'Internal server error' : err.message,
      });
    }
  }
);


export default router;
