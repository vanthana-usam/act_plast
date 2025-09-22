// import express from 'express';
// import sql from 'mssql';
// import { v4 as uuidv4 } from 'uuid';
// import executeQuery from '../utils/helper.js'; // helper wrapper for queries
// import authMiddleware from '../middleware/authMiddleware.js';

// const router = express.Router();

// /**
//  * GET all tasks with corrective & preventive actions
//  */
// router.get('/tasks',authMiddleware, async (req, res) => {
//   try {
//     const taskQuery = `
//       SELECT taskId, productionCode, taskType, title, description, priority, assignedTo, dueDate, 
//              status, createdFrom, rejectionReason, quantity, maintenanceType, equipment,
//              progress, statusComments, rootCause, impactAssessment, recurrenceRisk, lessonsLearned, assignedTeam
//       FROM Tasks
//     `;
//     const tasks = await executeQuery(taskQuery);

//     // Attach corrective & preventive actions
//     const taskData = await Promise.all(tasks.map(async (task) => {
//       const correctiveQuery = `
//         SELECT action, responsible, dueDate 
//         FROM Task_CorrectiveActions 
//         WHERE taskId = @taskId
//       `;
//       const preventiveQuery = `
//         SELECT action, responsible, dueDate 
//         FROM Task_PreventiveActions 
//         WHERE taskId = @taskId
//       `;

//       const correctiveActions = await executeQuery(correctiveQuery, [
//         { name: 'taskId', type: sql.UniqueIdentifier, value: task.taskId },
//       ]);
//       const preventiveActions = await executeQuery(preventiveQuery, [
//         { name: 'taskId', type: sql.UniqueIdentifier, value: task.taskId },
//       ]);

//       return { ...task, correctiveActions, preventiveActions };
//     }));

//     res.json(taskData);
//   } catch (err) {
//     console.error('❌ Error fetching tasks:', err);
//     res.status(500).json([]);
//   }
// });

// /**
//  * POST create new task
//  */
// router.post('/tasks', async (req, res) => {
//   try {
//     const {
//       title, taskType, priority, assignedTo, dueDate, productionCode,
//       description, rejectionReason, quantity, maintenanceType, equipment,
//     } = req.body;


//     console.log("📝 Received task data:", req.body);
    

//     const taskId = uuidv4();

//     const taskQuery = `
//       INSERT INTO Tasks 
//       (taskId, productionCode, taskType, title, description, priority, assignedTo, dueDate, status,
//        createdFrom, rejectionReason, quantity, maintenanceType, equipment)
//       VALUES 
//       (@taskId, @productionCode, @taskType, @title, @description, @priority, @assignedTo, @dueDate,
//        @status, @createdFrom, @rejectionReason, @quantity, @maintenanceType, @equipment)
//     `;

//     await executeQuery(taskQuery, [
//       { name: 'taskId', type: sql.UniqueIdentifier, value: taskId },
//       { name: 'productionCode', type: sql.VarChar(50), value: productionCode || null },
//       { name: 'taskType', type: sql.VarChar(20), value: taskType },
//       { name: 'title', type: sql.VarChar(100), value: title },
//       { name: 'description', type: sql.NVarChar(sql.MAX), value: description || '' },
//       { name: 'priority', type: sql.VarChar(20), value: priority },
//       { name: 'assignedTo', type: sql.UniqueIdentifier, value: assignedTo || null }, // ✅ FIX
//       { name: 'dueDate', type: sql.Date, value: dueDate ? new Date(dueDate) : null }, // ✅ FIX
//       { name: 'status', type: sql.VarChar(20), value: 'pending' },
//       { name: 'createdFrom', type: sql.VarChar(20), value: taskType === 'maintenance' ? 'manual' : 'production' },
//       { name: 'rejectionReason', type: sql.NVarChar(sql.MAX), value: rejectionReason || null },
//       { name: 'quantity', type: sql.Int, value: quantity || null },
//       { name: 'maintenanceType', type: sql.VarChar(20), value: maintenanceType || null },
//       { name: 'equipment', type: sql.VarChar(100), value: equipment || null },
//     ]);

//     res.status(201).json({ message: '✅ Task created successfully', taskId });
//   } catch (err) {
//     console.error('❌ Error creating task:', err);
//     res.status(500).json({ error: 'Failed to create task', details: err.message });
//   }
// });

// /**
//  * PUT update task & its actions
//  */
// router.put('/tasks/:id', async (req, res) => {
//   try {
//     const { id } = req.params;
//     const {
//       status, progress, statusComments, rootCause, impactAssessment,
//       recurrenceRisk, lessonsLearned, correctiveActions, preventiveActions,
//     } = req.body;

//     const taskQuery = `
//       UPDATE Tasks
//       SET status = @status, progress = @progress, statusComments = @statusComments,
//           rootCause = @rootCause, impactAssessment = @impactAssessment,
//           recurrenceRisk = @recurrenceRisk, lessonsLearned = @lessonsLearned
//       WHERE taskId = @taskId
//     `;

//     await executeQuery(taskQuery, [
//       { name: 'taskId', type: sql.UniqueIdentifier, value: id },
//       { name: 'status', type: sql.VarChar(20), value: status },
//       { name: 'progress', type: sql.Int, value: progress || null },
//       { name: 'statusComments', type: sql.NVarChar(sql.MAX), value: statusComments || null },
//       { name: 'rootCause', type: sql.NVarChar(sql.MAX), value: rootCause || null },
//       { name: 'impactAssessment', type: sql.VarChar(20), value: impactAssessment || null }, // ✅ FIX
//       { name: 'recurrenceRisk', type: sql.VarChar(20), value: recurrenceRisk || null },     // ✅ FIX
//       { name: 'lessonsLearned', type: sql.NVarChar(sql.MAX), value: lessonsLearned || null },
//     ]);

//     // Delete old actions
//     await executeQuery('DELETE FROM Task_CorrectiveActions WHERE taskId = @taskId', [
//       { name: 'taskId', type: sql.UniqueIdentifier, value: id },
//     ]);
//     await executeQuery('DELETE FROM Task_PreventiveActions WHERE taskId = @taskId', [
//       { name: 'taskId', type: sql.UniqueIdentifier, value: id },
//     ]);

//     // Insert corrective actions
//     for (const action of correctiveActions || []) {
//       await executeQuery(`
//         INSERT INTO Task_CorrectiveActions (taskId, action, responsible, dueDate)
//         VALUES (@taskId, @action, @responsible, @dueDate)
//       `, [
//         { name: 'taskId', type: sql.UniqueIdentifier, value: id },
//         { name: 'action', type: sql.NVarChar(sql.MAX), value: action.action },
//         { name: 'responsible', type: sql.NVarChar(100), value: action.responsible },
//         { name: 'dueDate', type: sql.Date, value: action.dueDate ? new Date(action.dueDate) : null },
//       ]);
//     }

//     // Insert preventive actions
//     for (const action of preventiveActions || []) {
//       await executeQuery(`
//         INSERT INTO Task_PreventiveActions (taskId, action, responsible, dueDate)
//         VALUES (@taskId, @action, @responsible, @dueDate)
//       `, [
//         { name: 'taskId', type: sql.UniqueIdentifier, value: id },
//         { name: 'action', type: sql.NVarChar(sql.MAX), value: action.action },
//         { name: 'responsible', type: sql.NVarChar(100), value: action.responsible },
//         { name: 'dueDate', type: sql.Date, value: action.dueDate ? new Date(action.dueDate) : null },
//       ]);
//     }

//     res.json({ message: '✅ Task updated successfully' });
//   } catch (err) {
//     console.error('❌ Error updating task:', err);
//     res.status(500).json({ error: 'Failed to update task', details: err.message });
//   }
// });

// /**
//  * DELETE task & children
//  */
// router.delete('/tasks/:id', async (req, res) => {
//   try {
//     const { id } = req.params;

//     // delete children first
//     await executeQuery('DELETE FROM Task_CorrectiveActions WHERE taskId = @taskId', [
//       { name: 'taskId', type: sql.UniqueIdentifier, value: id },
//     ]);
//     await executeQuery('DELETE FROM Task_PreventiveActions WHERE taskId = @taskId', [
//       { name: 'taskId', type: sql.UniqueIdentifier, value: id },
//     ]);

//     // delete task
//     await executeQuery('DELETE FROM Tasks WHERE taskId = @taskId', [
//       { name: 'taskId', type: sql.UniqueIdentifier, value: id },
//     ]);

//     res.json({ message: '✅ Task deleted successfully' });
//   } catch (err) {
//     console.error('❌ Error deleting task:', err);
//     res.status(500).json({ error: 'Failed to delete task', details: err.message });
//   }
// });

// export default router;



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

export default router;

// import express from 'express';
// import sql from 'mssql';
// import { v4 as uuidv4 } from 'uuid';
// import executeQuery from '../utils/helper.js'; // helper wrapper for queries
// import authMiddleware from '../middleware/authMiddleware.js';

// const router = express.Router();

// /**
//  * GET all tasks with corrective & preventive actions
//  */
// router.get('/tasks',authMiddleware, async (req, res) => {
//   try {
//     const taskQuery = `
//       SELECT taskId, productionCode, taskType, title, description, priority, assignedTo, dueDate, 
//              status, createdFrom, rejectionReason, quantity, maintenanceType, equipment,
//              progress, statusComments, rootCause, impactAssessment, recurrenceRisk, lessonsLearned, assignedTeam
//       FROM Tasks
//     `;
//     const tasks = await executeQuery(taskQuery);

//     // Attach corrective & preventive actions
//     const taskData = await Promise.all(tasks.map(async (task) => {
//       const correctiveQuery = `
//         SELECT action, responsible, dueDate 
//         FROM Task_CorrectiveActions 
//         WHERE taskId = @taskId
//       `;
//       const preventiveQuery = `
//         SELECT action, responsible, dueDate 
//         FROM Task_PreventiveActions 
//         WHERE taskId = @taskId
//       `;

//       const correctiveActions = await executeQuery(correctiveQuery, [
//         { name: 'taskId', type: sql.UniqueIdentifier, value: task.taskId },
//       ]);
//       const preventiveActions = await executeQuery(preventiveQuery, [
//         { name: 'taskId', type: sql.UniqueIdentifier, value: task.taskId },
//       ]);

//       return { ...task, correctiveActions, preventiveActions };
//     }));

//     res.json(taskData);
//   } catch (err) {
//     console.error('❌ Error fetching tasks:', err);
//     res.status(500).json([]);
//   }
// });

// /**
//  * POST create new task
//  */
// router.post('/tasks', async (req, res) => {
//   try {
//     const {
//       title, taskType, priority, assignedTo, dueDate, productionCode,
//       description, rejectionReason, quantity, maintenanceType, equipment,
//     } = req.body;


//     console.log("📝 Received task data:", req.body);
    

//     const taskId = uuidv4();

//     const taskQuery = `
//       INSERT INTO Tasks 
//       (taskId, productionCode, taskType, title, description, priority, assignedTo, dueDate, status,
//        createdFrom, rejectionReason, quantity, maintenanceType, equipment)
//       VALUES 
//       (@taskId, @productionCode, @taskType, @title, @description, @priority, @assignedTo, @dueDate,
//        @status, @createdFrom, @rejectionReason, @quantity, @maintenanceType, @equipment)
//     `;

//     await executeQuery(taskQuery, [
//       { name: 'taskId', type: sql.UniqueIdentifier, value: taskId },
//       { name: 'productionCode', type: sql.VarChar(50), value: productionCode || null },
//       { name: 'taskType', type: sql.VarChar(20), value: taskType },
//       { name: 'title', type: sql.VarChar(100), value: title },
//       { name: 'description', type: sql.NVarChar(sql.MAX), value: description || '' },
//       { name: 'priority', type: sql.VarChar(20), value: priority },
//       { name: 'assignedTo', type: sql.UniqueIdentifier, value: assignedTo || null }, // ✅ FIX
//       { name: 'dueDate', type: sql.Date, value: dueDate ? new Date(dueDate) : null }, // ✅ FIX
//       { name: 'status', type: sql.VarChar(20), value: 'pending' },
//       { name: 'createdFrom', type: sql.VarChar(20), value: taskType === 'maintenance' ? 'manual' : 'production' },
//       { name: 'rejectionReason', type: sql.NVarChar(sql.MAX), value: rejectionReason || null },
//       { name: 'quantity', type: sql.Int, value: quantity || null },
//       { name: 'maintenanceType', type: sql.VarChar(20), value: maintenanceType || null },
//       { name: 'equipment', type: sql.VarChar(100), value: equipment || null },
//     ]);

//     res.status(201).json({ message: '✅ Task created successfully', taskId });
//   } catch (err) {
//     console.error('❌ Error creating task:', err);
//     res.status(500).json({ error: 'Failed to create task', details: err.message });
//   }
// });

// /**
//  * PUT update task & its actions
//  */
// router.put('/tasks/:id', async (req, res) => {
//   try {
//     const { id } = req.params;
//     const {
//       status, progress, statusComments, rootCause, impactAssessment,
//       recurrenceRisk, lessonsLearned, correctiveActions, preventiveActions,
//     } = req.body;

//     const taskQuery = `
//       UPDATE Tasks
//       SET status = @status, progress = @progress, statusComments = @statusComments,
//           rootCause = @rootCause, impactAssessment = @impactAssessment,
//           recurrenceRisk = @recurrenceRisk, lessonsLearned = @lessonsLearned
//       WHERE taskId = @taskId
//     `;

//     await executeQuery(taskQuery, [
//       { name: 'taskId', type: sql.UniqueIdentifier, value: id },
//       { name: 'status', type: sql.VarChar(20), value: status },
//       { name: 'progress', type: sql.Int, value: progress || null },
//       { name: 'statusComments', type: sql.NVarChar(sql.MAX), value: statusComments || null },
//       { name: 'rootCause', type: sql.NVarChar(sql.MAX), value: rootCause || null },
//       { name: 'impactAssessment', type: sql.VarChar(20), value: impactAssessment || null }, // ✅ FIX
//       { name: 'recurrenceRisk', type: sql.VarChar(20), value: recurrenceRisk || null },     // ✅ FIX
//       { name: 'lessonsLearned', type: sql.NVarChar(sql.MAX), value: lessonsLearned || null },
//     ]);

//     // Delete old actions
//     await executeQuery('DELETE FROM Task_CorrectiveActions WHERE taskId = @taskId', [
//       { name: 'taskId', type: sql.UniqueIdentifier, value: id },
//     ]);
//     await executeQuery('DELETE FROM Task_PreventiveActions WHERE taskId = @taskId', [
//       { name: 'taskId', type: sql.UniqueIdentifier, value: id },
//     ]);

//     // Insert corrective actions
//     for (const action of correctiveActions || []) {
//       await executeQuery(`
//         INSERT INTO Task_CorrectiveActions (taskId, action, responsible, dueDate)
//         VALUES (@taskId, @action, @responsible, @dueDate)
//       `, [
//         { name: 'taskId', type: sql.UniqueIdentifier, value: id },
//         { name: 'action', type: sql.NVarChar(sql.MAX), value: action.action },
//         { name: 'responsible', type: sql.NVarChar(100), value: action.responsible },
//         { name: 'dueDate', type: sql.Date, value: action.dueDate ? new Date(action.dueDate) : null },
//       ]);
//     }

//     // Insert preventive actions
//     for (const action of preventiveActions || []) {
//       await executeQuery(`
//         INSERT INTO Task_PreventiveActions (taskId, action, responsible, dueDate)
//         VALUES (@taskId, @action, @responsible, @dueDate)
//       `, [
//         { name: 'taskId', type: sql.UniqueIdentifier, value: id },
//         { name: 'action', type: sql.NVarChar(sql.MAX), value: action.action },
//         { name: 'responsible', type: sql.NVarChar(100), value: action.responsible },
//         { name: 'dueDate', type: sql.Date, value: action.dueDate ? new Date(action.dueDate) : null },
//       ]);
//     }

//     res.json({ message: '✅ Task updated successfully' });
//   } catch (err) {
//     console.error('❌ Error updating task:', err);
//     res.status(500).json({ error: 'Failed to update task', details: err.message });
//   }
// });

// /**
//  * DELETE task & children
//  */
// router.delete('/tasks/:id', async (req, res) => {
//   try {
//     const { id } = req.params;

//     // delete children first
//     await executeQuery('DELETE FROM Task_CorrectiveActions WHERE taskId = @taskId', [
//       { name: 'taskId', type: sql.UniqueIdentifier, value: id },
//     ]);
//     await executeQuery('DELETE FROM Task_PreventiveActions WHERE taskId = @taskId', [
//       { name: 'taskId', type: sql.UniqueIdentifier, value: id },
//     ]);

//     // delete task
//     await executeQuery('DELETE FROM Tasks WHERE taskId = @taskId', [
//       { name: 'taskId', type: sql.UniqueIdentifier, value: id },
//     ]);

//     res.json({ message: '✅ Task deleted successfully' });
//   } catch (err) {
//     console.error('❌ Error deleting task:', err);
//     res.status(500).json({ error: 'Failed to delete task', details: err.message });
//   }
// });

// export default router;
