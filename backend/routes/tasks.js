import express from 'express';
import sql from 'mssql';
import { v4 as uuidv4 } from 'uuid';
import executeQuery from '../utils/helper.js'; // helper wrapper for queries
import authMiddleware from '../middleware/authMiddleware.js';

const router = express.Router();

/**
 * GET all tasks with preventive actions
 */
router.get('/tasks', authMiddleware, async (req, res) => {
  try {
    const taskQuery = `
      SELECT taskId, productionCode, taskType, title, description, priority, assignedTo, dueDate, 
             status, createdFrom, rejectionReason, quantity, maintenanceType, equipment,
             progress, statusComments, rootCause, impactAssessment, recurrenceRisk, lessonsLearned, assignedTeam
      FROM Tasks
    `;
    const tasks = await executeQuery(taskQuery);

    // Attach preventive actions
    const taskData = await Promise.all(tasks.map(async (task) => {
      const preventiveQuery = `
        SELECT action, responsible, dueDate 
        FROM Task_PreventiveActions 
        WHERE taskId = @taskId
      `;

      const preventiveActions = await executeQuery(preventiveQuery, [
        { name: 'taskId', type: sql.UniqueIdentifier, value: task.taskId },
      ]);

      return { ...task, preventiveActions };
    }));

    res.json(taskData);
  } catch (err) {
    console.error('❌ Error fetching tasks:', err);
    res.status(500).json([]);
  }
});

/**
 * POST create new task
 */
router.post('/tasks', async (req, res) => {
  try {
    const {
      title, taskType, priority, assignedTo, dueDate, productionCode,
      description, rejectionReason, quantity, maintenanceType, equipment,
    } = req.body;

    console.log("📝 Received task data:", req.body);

    const taskId = uuidv4();

    const taskQuery = `
      INSERT INTO Tasks 
      (taskId, productionCode, taskType, title, description, priority, assignedTo, dueDate, status,
       createdFrom, rejectionReason, quantity, maintenanceType, equipment)
      VALUES 
      (@taskId, @productionCode, @taskType, @title, @description, @priority, @assignedTo, @dueDate,
       @status, @createdFrom, @rejectionReason, @quantity, @maintenanceType, @equipment)
    `;

    await executeQuery(taskQuery, [
      { name: 'taskId', type: sql.UniqueIdentifier, value: taskId },
      { name: 'productionCode', type: sql.VarChar(50), value: productionCode || null },
      { name: 'taskType', type: sql.VarChar(20), value: taskType },
      { name: 'title', type: sql.VarChar(100), value: title },
      { name: 'description', type: sql.NVarChar(sql.MAX), value: description || '' },
      { name: 'priority', type: sql.VarChar(20), value: priority },
      { name: 'assignedTo', type: sql.UniqueIdentifier, value: assignedTo || null },
      { name: 'dueDate', type: sql.Date, value: dueDate ? new Date(dueDate) : null },
      { name: 'status', type: sql.VarChar(20), value: 'pending' },
      { name: 'createdFrom', type: sql.VarChar(20), value: taskType === 'maintenance' ? 'manual' : 'production' },
      { name: 'rejectionReason', type: sql.NVarChar(sql.MAX), value: rejectionReason || null },
      { name: 'quantity', type: sql.Int, value: quantity || null },
      { name: 'maintenanceType', type: sql.VarChar(20), value: maintenanceType || null },
      { name: 'equipment', type: sql.VarChar(100), value: equipment || null },
    ]);

    res.status(201).json({ message: '✅ Task created successfully', taskId });
  } catch (err) {
    console.error('❌ Error creating task:', err);
    res.status(500).json({ error: 'Failed to create task', details: err.message });
  }
});

/**
 * PUT update task & its preventive actions
 */
router.put('/tasks/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const {
      status, progress,dueDate, statusComments, rootCause, impactAssessment,
      recurrenceRisk, lessonsLearned, preventiveActions,
    } = req.body;

    const taskQuery = `
      UPDATE Tasks
      SET status = @status, progress = @progress, dueDate= @dueDate, statusComments = @statusComments,
          rootCause = @rootCause, impactAssessment = @impactAssessment,
          recurrenceRisk = @recurrenceRisk, lessonsLearned = @lessonsLearned
      WHERE taskId = @taskId
    `;

    await executeQuery(taskQuery, [
      { name: 'taskId', type: sql.UniqueIdentifier, value: id },
      { name: 'status', type: sql.VarChar(20), value: status },
      { name: 'progress', type: sql.Int, value: progress || null },
      { name: 'dueDate', type: sql.Date, value: dueDate ? new Date(dueDate) : null },
      { name: 'statusComments', type: sql.NVarChar(sql.MAX), value: statusComments || null },
      { name: 'rootCause', type: sql.NVarChar(sql.MAX), value: rootCause || null },
      { name: 'impactAssessment', type: sql.VarChar(20), value: impactAssessment || null },
      { name: 'recurrenceRisk', type: sql.VarChar(20), value: recurrenceRisk || null },
      { name: 'lessonsLearned', type: sql.NVarChar(sql.MAX), value: lessonsLearned || null },
    ]);

    // Delete old preventive actions
    await executeQuery('DELETE FROM Task_PreventiveActions WHERE taskId = @taskId', [
      { name: 'taskId', type: sql.UniqueIdentifier, value: id },
    ]);

    // Insert preventive actions
    for (const action of preventiveActions || []) {
      await executeQuery(`
        INSERT INTO Task_PreventiveActions (taskId, action, responsible, dueDate)
        VALUES (@taskId, @action, @responsible, @dueDate)
      `, [
        { name: 'taskId', type: sql.UniqueIdentifier, value: id },
        { name: 'action', type: sql.NVarChar(sql.MAX), value: action.action },
        { name: 'responsible', type: sql.NVarChar(100), value: action.responsible },
        { name: 'dueDate', type: sql.Date, value: action.dueDate ? new Date(action.dueDate) : null },
      ]);
    }

    res.json({ message: '✅ Task updated successfully' });
  } catch (err) {
    console.error('❌ Error updating task:', err);
    res.status(500).json({ error: 'Failed to update task', details: err.message });
  }
});

/**
 * DELETE task & its preventive actions
 */
router.delete('/tasks/:id', async (req, res) => {
  try {
    const { id } = req.params;

    // Delete preventive actions
    await executeQuery('DELETE FROM Task_PreventiveActions WHERE taskId = @taskId', [
      { name: 'taskId', type: sql.UniqueIdentifier, value: id },
    ]);

    // Delete task
    await executeQuery('DELETE FROM Tasks WHERE taskId = @taskId', [
      { name: 'taskId', type: sql.UniqueIdentifier, value: id },
    ]);

    res.json({ message: '✅ Task deleted successfully' });
  } catch (err) {
    console.error('❌ Error deleting task:', err);
    res.status(500).json({ error: 'Failed to delete task', details: err.message });
  }
});



// // ========================= PREVENTIVE MAINTENANCE =========================

// /**
//  * GET all preventive maintenance records
//  */

// router.get('/preventive-maintenance', authMiddleware, async (req, res) => {
//   try {
//     const query = `
//       SELECT Id, EquipmentType, DueDate, Description, Status, CreatedAt, UpdatedAt, CompletedAt
//       FROM [dbo].[PreventiveMaintenance]
//     `;
//     const result = await executeQuery(query);
//     res.json(result);
//   } catch (err) {
//     console.error('❌ Error fetching preventive maintenance records:', err);
//     res.status(500).json({ error: 'Failed to fetch records', details: process.env.NODE_ENV === 'production' ? 'Internal server error' : err.message });
//   }
// });

// /**
//  * GET preventive maintenance record by ID
//  */
// router.get('/preventive-maintenance/:id', authMiddleware, async (req, res) => {
//   try {
//     const { id } = req.params;
//     const query = `SELECT * FROM [dbo].[PreventiveMaintenance] WHERE Id = @Id`;
//     const result = await executeQuery(query, [
//       { name: 'Id', type: sql.UniqueIdentifier, value: id },
//     ]);

//     if (!result || result.length === 0) {
//       return res.status(404).json({ error: 'Record not found' });
//     }

//     res.json(result[0]);
//   } catch (err) {
//     console.error('❌ Error fetching preventive maintenance record:', err);
//     res.status(500).json({ error: 'Failed to fetch record', details: err.message });
//   }
// });

// /**
//  * POST create new preventive maintenance record
//  * and automatically create a corresponding task
//  */
// router.post('/preventive-maintenance', authMiddleware, async (req, res) => {
//   console.log('🚀 Hit POST /api/preventive-maintenance');
//   try {
//     const { EquipmentType, DueDate, Description } = req.body;
//     console.log('📝 Received preventive maintenance record:', req.body);

//     const id = uuidv4();

//     // 1️⃣ Insert into PreventiveMaintenance table
//     const pmQuery = `
//       INSERT INTO [dbo].[PreventiveMaintenance]
//       (Id, EquipmentType, DueDate, Description, Status, CreatedAt)
//       VALUES (@Id, @EquipmentType, @DueDate, @Description, @Status, GETUTCDATE())
//     `;

//     await executeQuery(pmQuery, [
//       { name: 'Id', type: sql.UniqueIdentifier, value: id },
//       { name: 'EquipmentType', type: sql.NVarChar(50), value: EquipmentType },
//       { name: 'DueDate', type: sql.Date, value: DueDate ? new Date(DueDate) : null },
//       { name: 'Description', type: sql.NVarChar(sql.MAX), value: Description || '' },
//       { name: 'Status', type: sql.NVarChar(50), value: 'pending' },
//     ]);

    
//   } catch (err) {
//     console.error('❌ Error creating preventive maintenance record:', err);
//     res.status(500).json({ error: 'Failed to create record', details: err.message });
//   }
  
// });



// /**
//  * PUT update preventive maintenance record
//  */
// router.put('/preventive-maintenance/:id', authMiddleware, async (req, res) => {
//   try {
//     const { id } = req.params;
//     const { EquipmentType, DueDate, Description, Status, CompletedAt } = req.body;

//     console.log('📝 Received preventive maintenance update record:', req.body);

    
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

//      await executeQuery(query, [
//       { name: 'Id', type: sql.UniqueIdentifier, value: id },
//       { name: 'EquipmentType', type: sql.NVarChar(50), value: EquipmentType },
//       { name: 'DueDate', type: sql.Date, value: DueDate ? new Date(DueDate) : null },
//       { name: 'Description', type: sql.NVarChar(sql.MAX), value: Description || '' },
//       { name: 'Status', type: sql.NVarChar(50), value: Status || 'pending' },
//       { name: 'CompletedAt', type: sql.DateTime2, value: CompletedAt ? new Date(CompletedAt) : null },
//     ]);

//     res.json({ message: '✅ Preventive maintenance record updated' });
//   } catch (err) {
//     console.error('❌ Error updating preventive maintenance record:', err);
//     res.status(500).json({ error: 'Failed to update record', details: err.message });
//   }
// });

// /**
//  * DELETE preventive maintenance record
//  */
// router.delete('/preventive-maintenance/:id', authMiddleware, async (req, res) => {
//   try {
//     const { id } = req.params;

//     const query = `DELETE FROM [dbo].[PreventiveMaintenance] WHERE Id = @Id`;
//     await executeQuery(query, [
//       { name: 'Id', type: sql.UniqueIdentifier, value: id },
//     ]);

//     res.json({ message: '✅ Preventive maintenance record deleted' });
//   } catch (err) {
//     console.error('❌ Error deleting preventive maintenance record:', err);
//     res.status(500).json({ error: 'Failed to delete record', details: err.message });
//   }
// });


export default router;
