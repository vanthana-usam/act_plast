// // import express from 'express';
// // import sql from 'mssql';
// // import { poolPromise } from '../db.js';
// // import { v4 as uuidv4 } from 'uuid';

// // const router = express.Router();

// // // =================== GET /api/pdi ===================
// // router.get('/api/pdi', async (req, res) => {
// //   try {
// //     const pool = await poolPromise;

// //     const query = `
// //       SELECT 
// //         p.pdiId,
// //         p.productionCode,
// //         p.product,
// //         p.date,
// //         p.shift,
// //         p.defectName,
// //         p.quantity,
// //         p.inspector,
// //         p.status,
// //         p.severity,
// //         ca.action AS correctiveAction,
// //         ca.responsible AS correctiveResponsible,
// //         ca.dueDate AS correctiveDueDate,
// //         pa.action AS preventiveAction,
// //         pa.responsible AS preventiveResponsible,
// //         pa.dueDate AS preventiveDueDate
// //       FROM PDI p
// //       LEFT JOIN PDI_CorrectiveActions ca ON ca.pdiId = p.pdiId
// //       LEFT JOIN PDI_PreventiveActions pa ON pa.pdiId = p.pdiId
// //       ORDER BY p.date DESC
// //     `;

// //     const result = await pool.request().query(query);

// //     // Group results by PDI
// //     const pdiMap = {};
// //     result.recordset.forEach(row => {
// //       if (!pdiMap[row.pdiId]) {
// //         pdiMap[row.pdiId] = {
// //           pdiId: row.pdiId,
// //           productionCode: row.productionCode,
// //           product: row.product,
// //           date: row.date,
// //           shift: row.shift,
// //           defectName: row.defectName,
// //           quantity: row.quantity,
// //           inspector: row.inspector,
// //           status: row.status,
// //           severity: row.severity,
// //           correctiveActions: [],
// //           preventiveActions: []
// //         };
// //       }

// //       if (row.correctiveAction) {
// //         pdiMap[row.pdiId].correctiveActions.push({
// //           action: row.correctiveAction,
// //           responsible: row.correctiveResponsible,
// //           dueDate: row.correctiveDueDate
// //         });
// //       }

// //       if (row.preventiveAction) {
// //         pdiMap[row.pdiId].preventiveActions.push({
// //           action: row.preventiveAction,
// //           responsible: row.preventiveResponsible,
// //           dueDate: row.preventiveDueDate
// //         });
// //       }
// //     });

// //     res.json(Object.values(pdiMap));
// //   } catch (err) {
// //     console.error('Error fetching PDI entries:', err);
// //     res.status(500).json({ error: 'Failed to fetch PDI entries' });
// //   }
// // });

// // // =================== POST /api/pdi ===================
// // router.post('/api/pdi', async (req, res) => {
// //   const pool = await poolPromise;
// //   const transaction = new sql.Transaction(pool);

// //   try {
// //     const {
// //       productionCode, product, date, shift, defectName, quantity, inspector,
// //       status = 'Open', severity,
// //       correctiveActions, preventiveActions
// //     } = req.body;

// //     // const uuid = generateUUID()(); // new PDI id
// //     const uuid = uuidv4();

// //     await transaction.begin();

// //     // 1️⃣ Insert PDI entry
// //     const pdiRequest = new sql.Request(transaction);
// //     pdiRequest.input('pdiId', sql.UniqueIdentifier, uuid);
// //     pdiRequest.input('productionCode', sql.VarChar, productionCode);
// //     pdiRequest.input('product', sql.VarChar, product);
// //     pdiRequest.input('date', sql.Date, date);
// //     pdiRequest.input('shift', sql.VarChar, shift);
// //     pdiRequest.input('defectName', sql.VarChar, defectName);
// //     pdiRequest.input('quantity', sql.Int, quantity);
// //     pdiRequest.input('inspector', sql.VarChar, inspector);
// //     pdiRequest.input('status', sql.VarChar, status);
// //     pdiRequest.input('severity', sql.VarChar, severity);

// //     const pdiInsertQuery = `
// //       INSERT INTO PDI (pdiId, productionCode, product, date, shift, defectName, quantity, inspector, status, severity)
// //       VALUES (@pdiId, @productionCode, @product, @date, @shift, @defectName, @quantity, @inspector, @status, @severity)
// //     `;
// //     await pdiRequest.query(pdiInsertQuery);

// //     const pdiId = uuid; // use the generated UUID

// //     // 2️⃣ Insert corrective actions
// //     for (const action of correctiveActions || []) {
// //       const correctiveReq = new sql.Request(transaction);
// //       correctiveReq.input('pdiId', sql.UniqueIdentifier, pdiId);
// //       correctiveReq.input('action', sql.NVarChar(sql.MAX), action.action);
// //       correctiveReq.input('responsible', sql.VarChar, action.responsible);
// //       correctiveReq.input('dueDate', sql.Date, action.dueDate);

// //       await correctiveReq.query(`
// //         INSERT INTO PDI_CorrectiveActions (pdiId, action, responsible, dueDate)
// //         VALUES (@pdiId, @action, @responsible, @dueDate)
// //       `);
// //     }

// //     // 3️⃣ Insert preventive actions
// //     for (const action of preventiveActions || []) {
// //       const preventiveReq = new sql.Request(transaction);
// //       preventiveReq.input('pdiId', sql.UniqueIdentifier, pdiId);
// //       preventiveReq.input('action', sql.NVarChar(sql.MAX), action.action);
// //       preventiveReq.input('responsible', sql.VarChar, action.responsible);
// //       preventiveReq.input('dueDate', sql.Date, action.dueDate);

// //       await preventiveReq.query(`
// //         INSERT INTO PDI_PreventiveActions (pdiId, action, responsible, dueDate)
// //         VALUES (@pdiId, @action, @responsible, @dueDate)
// //       `);
// //     }

// //     // 4️⃣ Auto-create a Task if defectName is provided
// //     if (defectName && defectName.trim() !== '') {
// //       const taskId = uuidv4();
// //       const taskReq = new sql.Request(transaction);

// //       taskReq.input('taskId', sql.UniqueIdentifier, taskId);
// //       taskReq.input('productionCode', sql.VarChar, productionCode || null);
// //       taskReq.input('taskType', sql.VarChar, 'pdi-defect');
// //       taskReq.input('title', sql.VarChar, `PDI Defect: ${defectName}`);
// //       taskReq.input('description', sql.NVarChar(sql.MAX), `Defect found during PDI for product ${product} in shift ${shift}.`);
// //       taskReq.input('priority', sql.VarChar, severity?.toLowerCase() === 'high' ? 'high' : 'medium');

// //       // 🚨 Make sure frontend sends inspector as employeeId (UUID), not a string name
// //       taskReq.input('assignedTo', sql.UniqueIdentifier, inspector || null);

// //       taskReq.input('dueDate', sql.Date, date);
// //       taskReq.input('status', sql.VarChar, 'pending');
// //       taskReq.input('createdFrom', sql.VarChar, 'pdi');
// //       taskReq.input('rejectionReason', sql.NVarChar(sql.MAX), null);
// //       taskReq.input('quantity', sql.Int, quantity || null);
// //       taskReq.input('maintenanceType', sql.VarChar, null);
// //       taskReq.input('equipment', sql.VarChar, null);

// //       await taskReq.query(`
// //     INSERT INTO Tasks (
// //       taskId, productionCode, taskType, title, description, priority, assignedTo, dueDate,
// //       status, createdFrom, rejectionReason, quantity, maintenanceType, equipment
// //     )
// //     VALUES (
// //       @taskId, @productionCode, @taskType, @title, @description, @priority, @assignedTo, @dueDate,
// //       @status, @createdFrom, @rejectionReason, @quantity, @maintenanceType, @equipment
// //     )
// //   `);
// //     }


// //     await transaction.commit();
// //     res.status(201).json({ message: 'PDI entry (and task if defect) added successfully', pdiId });

// //   } catch (err) {
// //     try { await transaction.rollback(); } catch { }
// //     console.error('Error adding PDI entry or task:', err);
// //     res.status(500).json({ error: 'Failed to add PDI entry' });
// //   }
// // });

// // export default router;



// // backend/routes/pdi.js
// import express from 'express';
// import sql from 'mssql';
// import { poolPromise } from '../db.js';
// import { v4 as uuidv4 } from 'uuid';

// const router = express.Router();

// // =================== GET /api/pdi ===================
// router.get('/api/pdi', async (req, res) => {
//   try {
//     const pool = await poolPromise;

//     const query = `
//       SELECT 
//         p.pdiId,
//         p.productionCode,
//         p.product,
//         p.date,
//         p.shift,
//         p.defectName,
//         p.quantity,
//         p.inspector,
//         p.status,
//         p.severity,
//         ca.action AS correctiveAction,
//         ca.responsible AS correctiveResponsible,
//         ca.dueDate AS correctiveDueDate,
//         pa.action AS preventiveAction,
//         pa.responsible AS preventiveResponsible,
//         pa.dueDate AS preventiveDueDate
//       FROM PDI p
//       LEFT JOIN PDI_CorrectiveActions ca ON ca.pdiId = p.pdiId
//       LEFT JOIN PDI_PreventiveActions pa ON pa.pdiId = p.pdiId
//       ORDER BY p.date DESC
//     `;

//     const result = await pool.request().query(query);

//     // Group results by PDI
//     const pdiMap = {};
//     result.recordset.forEach(row => {
//       if (!pdiMap[row.pdiId]) {
//         pdiMap[row.pdiId] = {
//           pdiId: row.pdiId,
//           productionCode: row.productionCode,
//           product: row.product,
//           date: row.date,
//           shift: row.shift,
//           defectName: row.defectName,
//           quantity: row.quantity,
//           inspector: row.inspector,
//           status: row.status,
//           severity: row.severity,
//           correctiveActions: [],
//           preventiveActions: []
//         };
//       }

//       if (row.correctiveAction) {
//         pdiMap[row.pdiId].correctiveActions.push({
//           action: row.correctiveAction,
//           responsible: row.correctiveResponsible,
//           dueDate: row.correctiveDueDate
//         });
//       }

//       if (row.preventiveAction) {
//         pdiMap[row.pdiId].preventiveActions.push({
//           action: row.preventiveAction,
//           responsible: row.preventiveResponsible,
//           dueDate: row.preventiveDueDate
//         });
//       }
//     });

//     res.json(Object.values(pdiMap));
//   } catch (err) {
//     console.error('Error fetching PDI entries:', err);
//     res.status(500).json({ error: 'Failed to fetch PDI entries' });
//   }
// });

// // =================== POST /api/pdi ===================
// router.post('/api/pdi', async (req, res) => {
//   const pool = await poolPromise;
//   const transaction = new sql.Transaction(pool);

//   try {
//     const {
//       productionCode, product, date, shift, defectName, quantity, inspector,
//       status = 'Open', severity,
//       correctiveActions, preventiveActions
//     } = req.body;

//     const uuid = uuidv4();

//     await transaction.begin();

//     // 1️⃣ Insert PDI entry
//     const pdiRequest = new sql.Request(transaction);
//     pdiRequest.input('pdiId', sql.UniqueIdentifier, uuid);
//     pdiRequest.input('productionCode', sql.VarChar, productionCode);
//     pdiRequest.input('product', sql.VarChar, product);
//     pdiRequest.input('date', sql.Date, date);
//     pdiRequest.input('shift', sql.VarChar, shift);
//     pdiRequest.input('defectName', sql.VarChar, defectName);
//     pdiRequest.input('quantity', sql.Int, quantity);
//     pdiRequest.input('inspector', sql.UniqueIdentifier, inspector); // inspector is UUID
//     pdiRequest.input('status', sql.VarChar, status);
//     pdiRequest.input('severity', sql.VarChar, severity);

//     await pdiRequest.query(`
//       INSERT INTO PDI (pdiId, productionCode, product, date, shift, defectName, quantity, inspector, status, severity)
//       VALUES (@pdiId, @productionCode, @product, @date, @shift, @defectName, @quantity, @inspector, @status, @severity)
//     `);

//     // 2️⃣ Insert corrective actions
//     for (const action of correctiveActions || []) {
//       const correctiveReq = new sql.Request(transaction);
//       correctiveReq.input('pdiId', sql.UniqueIdentifier, uuid);
//       correctiveReq.input('action', sql.NVarChar(sql.MAX), action.action);
//       correctiveReq.input('responsible', sql.VarChar, action.responsible);
//       correctiveReq.input('dueDate', sql.Date, action.dueDate);

//       await correctiveReq.query(`
//         INSERT INTO PDI_CorrectiveActions (pdiId, action, responsible, dueDate)
//         VALUES (@pdiId, @action, @responsible, @dueDate)
//       `);
//     }

//     // 3️⃣ Insert preventive actions
//     for (const action of preventiveActions || []) {
//       const preventiveReq = new sql.Request(transaction);
//       preventiveReq.input('pdiId', sql.UniqueIdentifier, uuid);
//       preventiveReq.input('action', sql.NVarChar(sql.MAX), action.action);
//       preventiveReq.input('responsible', sql.VarChar, action.responsible);
//       preventiveReq.input('dueDate', sql.Date, action.dueDate);

//       await preventiveReq.query(`
//         INSERT INTO PDI_PreventiveActions (pdiId, action, responsible, dueDate)
//         VALUES (@pdiId, @action, @responsible, @dueDate)
//       `);
//     }

//     // 4️⃣ Auto-create a Task if defectName exists
//     if (defectName && defectName.trim() !== '') {
//       const taskId = uuidv4();
//       const taskReq = new sql.Request(transaction);

//       taskReq.input('taskId', sql.UniqueIdentifier, taskId);
//       taskReq.input('productionCode', sql.VarChar, productionCode || null);
//       taskReq.input('taskType', sql.VarChar, 'pdi-defect');
//       taskReq.input('title', sql.VarChar, `PDI Defect: ${defectName}`);
//       taskReq.input('description', sql.NVarChar(sql.MAX), `Defect found during PDI for product ${product} in shift ${shift}.`);
//       taskReq.input('priority', sql.VarChar, severity?.toLowerCase() || 'medium');
//       taskReq.input('assignedTo', sql.UniqueIdentifier, inspector || null);
//       taskReq.input('dueDate', sql.Date, date);
//       taskReq.input('status', sql.VarChar, 'pending');
//       taskReq.input('createdFrom', sql.VarChar, 'pdi');
//       taskReq.input('rejectionReason', sql.NVarChar(sql.MAX), null);
//       taskReq.input('quantity', sql.Int, quantity || null);
//       taskReq.input('maintenanceType', sql.VarChar, null);
//       taskReq.input('equipment', sql.VarChar, null);

//       await taskReq.query(`
//         INSERT INTO Tasks (
//           taskId, productionCode, taskType, title, description, priority, assignedTo, dueDate,
//           status, createdFrom, rejectionReason, quantity, maintenanceType, equipment
//         )
//         VALUES (
//           @taskId, @productionCode, @taskType, @title, @description, @priority, @assignedTo, @dueDate,
//           @status, @createdFrom, @rejectionReason, @quantity, @maintenanceType, @equipment
//         )
//       `);
//     }

//     await transaction.commit();

//     res.status(201).json({
//       pdiId: uuid,
//       productionCode,
//       product,
//       date,
//       shift,
//       defectName,
//       quantity,
//       inspector,
//       status,
//       severity,
//       correctiveActions,
//       preventiveActions
//     });

//   } catch (err) {
//     try { await transaction.rollback(); } catch {}
//     console.error('Error adding PDI entry:', err);
//     res.status(500).json({ error: 'Failed to add PDI entry' });
//   }
// });

// // =================== PATCH /api/pdi/:id ===================
// // router.patch('/api/pdi/:id', async (req, res) => {
// //   const { id } = req.params;
// //   const { status } = req.body;

// //   console.log(`🔧 Updating PDI status for ID ${id} to ${status}`);
  

// //   try {
// //     const pool = await poolPromise;
// //     const request = pool.request();
// //     request.input('pdiId', sql.UniqueIdentifier, id);
// //     request.input('status', sql.VarChar, status);

// //     const result = await request.query(`
// //       UPDATE PDI SET status = @status WHERE pdiId = @pdiId
// //     `);

// //     if (result.rowsAffected[0] === 0) {
// //       return res.status(404).json({ error: 'PDI entry not found' });
// //     }

// //     res.json({ message: 'PDI status updated successfully', pdiId: id, status });
// //   } catch (err) {
// //     console.error('Error updating PDI status:', err);
// //     res.status(500).json({ error: 'Failed to update PDI status' });
// //   }
// // });

// // ✅ Update PDI entry
// // router.patch("/api/pdi/:id", async (req, res) => {
// //   // await poolPromise;

// //   const { id } = req.params;
// //   const {
// //     productionCode,
// //     product,
// //     date,
// //     shift,
// //     defectName,
// //     quantity,
// //     inspector,
// //     status,
// //     severity,
// //     correctiveActions,
// //     preventiveActions,
// //   } = req.body;

// //   const pool = await poolPromise;
// //   if (!pool) {
// //     return res.status(500).json({ error: 'Database connection failed' });
// //   }
// //   const request = pool.request();

// //   const transaction = new sql.Transaction(pool);

// //   try {
// //     await transaction.begin();

// //     // Update main PDI record
// //     await transaction
// //       .request()
// //       .input("pdiId", sql.UniqueIdentifier, id)
// //       .input("productionCode", sql.NVarChar(50), productionCode)
// //       .input("product", sql.NVarChar(100), product)
// //       .input("date", sql.Date, date? new Date(date) : null)
// //       .input("shift", sql.NVarChar(10), shift)
// //       .input("defectName", sql.NVarChar(100), defectName)
// //       .input("quantity", sql.Int, quantity)
// //       .input("inspector", sql.NVarChar(100), inspector)
// //       .input("status", sql.NVarChar(50), status)
// //       .input("severity", sql.NVarChar(50), severity)
// //       .query(`
// //         UPDATE PDI
// //         SET productionCode = @productionCode,
// //             product = @product,
// //             date = @date,
// //             shift = @shift,
// //             defectName = @defectName,
// //             quantity = @quantity,
// //             inspector = @inspector,
// //             status = @status,
// //             severity = @severity
// //         WHERE pdiId = @pdiId
// //       `);

// //     // Delete old actions (simpler than updating in place)
// //     await transaction
// //       .request()
// //       .input("pdiId", sql.UniqueIdentifier, id)
// //       .query(`DELETE FROM Actions WHERE pdiId = @pdiId`);

// //     // Insert corrective actions
// //     for (const action of correctiveActions || []) {
// //       await transaction
// //         .request()
// //         .input("pdiId", sql.UniqueIdentifier, id)
// //         .input("action", sql.NVarChar(sql.MAX), action.action)
// //         .input("responsible", sql.NVarChar(100), action.responsible)
// //         .input("dueDate", sql.Date, action.dueDate || null)
// //         .query(
// //           `INSERT INTO Actions (pdiId, actionType, action, responsible, dueDate)
// //            VALUES (@pdiId, 'corrective', @action, @responsible, @dueDate)`
// //         );
// //     }

// //     // Insert preventive actions
// //     for (const action of preventiveActions || []) {
// //       await transaction
// //         .request()
// //         .input("pdiId", sql.UniqueIdentifier, id)
// //         .input("action", sql.NVarChar(sql.MAX), action.action)
// //         .input("responsible", sql.NVarChar(100), action.responsible)
// //         .input("dueDate", sql.Date, action.dueDate || null)
// //         .query(
// //           `INSERT INTO Actions (pdiId, actionType, action, responsible, dueDate)
// //            VALUES (@pdiId, 'preventive', @action, @responsible, @dueDate)`
// //         );
// //     }

// //     await transaction.commit();
// //     res.json({ message: "PDI entry updated successfully" });
// //   } catch (err) {
// //     await transaction.rollback();
// //     console.error("Error updating PDI:", err);
// //     res.status(500).json({ message: "Failed to update PDI entry", error: err.message });
// //   }
// // });

// router.patch("/api/pdi/:id", async (req, res) => {
//   const { id } = req.params;
//   const {
//     productionCode,
//     product,
//     date,
//     shift,
//     defectName,
//     quantity,
//     inspector,
//     status,
//     severity,
//     correctiveActions = [],
//     preventiveActions = []
//   } = req.body;

//   const pool = await poolPromise;
//   if (!pool) {
//     return res.status(500).json({ error: "Database connection failed" });
//   }

//   const transaction = new sql.Transaction(pool);

//   try {
//     await transaction.begin();

//     // 1️⃣ Update main PDI record
//     await transaction.request()
//       .input("pdiId", sql.UniqueIdentifier, id)
//       .input("productionCode", sql.NVarChar(50), productionCode)
//       .input("product", sql.NVarChar(100), product)
//       .input("date", sql.Date, date ? new Date(date) : null)
//       .input("shift", sql.NVarChar(10), shift)
//       .input("defectName", sql.NVarChar(100), defectName)
//       .input("quantity", sql.Int, quantity)
//       .input("inspector", sql.UniqueIdentifier, inspector)
//       .input("status", sql.NVarChar(50), status)
//       .input("severity", sql.NVarChar(50), severity)
//       .query(`
//         UPDATE PDI
//         SET productionCode = @productionCode,
//             product = @product,
//             date = @date,
//             shift = @shift,
//             defectName = @defectName,
//             quantity = @quantity,
//             inspector = @inspector,
//             status = @status,
//             severity = @severity
//         WHERE pdiId = @pdiId
//       `);

//     // 2️⃣ Delete old corrective actions
//     await transaction.request()
//       .input("pdiId", sql.UniqueIdentifier, id)
//       .query(`DELETE FROM PDI_CorrectiveActions WHERE pdiId = @pdiId`);

//     // 3️⃣ Insert new corrective actions
//     for (const action of correctiveActions) {
//       await transaction.request()
//         .input("pdiId", sql.UniqueIdentifier, id)
//         .input("action", sql.NVarChar(sql.MAX), action.action || null)
//         .input("responsible", sql.NVarChar(100), action.responsible || null)
//         .input("dueDate", sql.Date, action.dueDate ? new Date(action.dueDate) : null)
//         .query(`
//           INSERT INTO PDI_CorrectiveActions (pdiId, action, responsible, dueDate)
//           VALUES (@pdiId, @action, @responsible, @dueDate)
//         `);
//     }

//     // 4️⃣ Delete old preventive actions
//     await transaction.request()
//       .input("pdiId", sql.UniqueIdentifier, id)
//       .query(`DELETE FROM PDI_PreventiveActions WHERE pdiId = @pdiId`);

//     // 5️⃣ Insert new preventive actions
//     for (const action of preventiveActions) {
//       await transaction.request()
//         .input("pdiId", sql.UniqueIdentifier, id)
//         .input("action", sql.NVarChar(sql.MAX), action.action || null)
//         .input("responsible", sql.NVarChar(100), action.responsible || null)
//         .input("dueDate", sql.Date, action.dueDate ? new Date(action.dueDate) : null)
//         .query(`
//           INSERT INTO PDI_PreventiveActions (pdiId, action, responsible, dueDate)
//           VALUES (@pdiId, @action, @responsible, @dueDate)
//         `);
//     }

//     // 6️⃣ Commit transaction
//     await transaction.commit();
//     res.json({ message: "PDI entry updated successfully" });

//   } catch (err) {
//     // Rollback if any error occurs
//     try { await transaction.rollback(); } catch (rollbackErr) {
//       console.error("Rollback failed:", rollbackErr);
//     }
//     console.error("Error updating PDI:", err);
//     res.status(500).json({ message: "Failed to update PDI entry", error: err.message });
//   }
// });



// // =================== DELETE /api/pdi/:id ===================
// router.delete('/api/pdi/:id', async (req, res) => {
//   const { id } = req.params;

//   try {
//     const pool = await poolPromise;
//     const request = pool.request();
//     request.input('pdiId', sql.UniqueIdentifier, id);

//     await request.query(`DELETE FROM PDI_CorrectiveActions WHERE pdiId = @pdiId`);
//     await request.query(`DELETE FROM PDI_PreventiveActions WHERE pdiId = @pdiId`);
//     const result = await request.query(`DELETE FROM PDI WHERE pdiId = @pdiId`);

//     if (result.rowsAffected[0] === 0) {
//       return res.status(404).json({ error: 'PDI entry not found' });
//     }

//     res.json({ message: 'PDI entry deleted successfully', pdiId: id });
//   } catch (err) {
//     console.error('Error deleting PDI entry:', err);
//     res.status(500).json({ error: 'Failed to delete PDI entry' });
//   }
// });

// export default router;


import express from 'express';
import sql from 'mssql';
import { poolPromise } from '../db.js';
import { v4 as uuidv4 } from 'uuid';

const router = express.Router();

// Valid status values
const VALID_STATUSES = ['Open', 'In Progress', 'Closed'];

// =================== GET /api/pdi ===================
router.get('/api/pdi', async (req, res) => {
  try {
    const pool = await poolPromise;

    const query = `
      SELECT 
        p.pdiId,
        p.productionCode,
        p.product,
        p.date,
        p.shift,
        p.defectName,
        p.quantity,
        p.inspector,
        p.status,
        p.severity,
        ca.action AS correctiveAction,
        ca.responsible AS correctiveResponsible,
        ca.dueDate AS correctiveDueDate,
        pa.action AS preventiveAction,
        pa.responsible AS preventiveResponsible,
        pa.dueDate AS preventiveDueDate
      FROM PDI p
      LEFT JOIN PDI_CorrectiveActions ca ON ca.pdiId = p.pdiId
      LEFT JOIN PDI_PreventiveActions pa ON pa.pdiId = p.pdiId
      ORDER BY p.date DESC
    `;

    const result = await pool.request().query(query);

    // Group results by PDI
    const pdiMap = {};
    result.recordset.forEach(row => {
      if (!pdiMap[row.pdiId]) {
        pdiMap[row.pdiId] = {
          pdiId: row.pdiId,
          productionCode: row.productionCode,
          product: row.product,
          date: row.date ? row.date.toISOString().split('T')[0] : null,
          shift: row.shift,
          defectName: row.defectName,
          quantity: row.quantity,
          inspector: row.inspector,
          status: row.status,
          severity: row.severity,
          correctiveActions: [],
          preventiveActions: []
        };
      }

      if (row.correctiveAction) {
        pdiMap[row.pdiId].correctiveActions.push({
          actionId: uuidv4(), // Generate actionId for frontend
          action: row.correctiveAction,
          responsible: row.correctiveResponsible,
          dueDate: row.correctiveDueDate ? row.correctiveDueDate.toISOString().split('T')[0] : null
        });
      }

      if (row.preventiveAction) {
        pdiMap[row.pdiId].preventiveActions.push({
          actionId: uuidv4(), // Generate actionId for frontend
          action: row.preventiveAction,
          responsible: row.preventiveResponsible,
          dueDate: row.preventiveDueDate ? row.preventiveDueDate.toISOString().split('T')[0] : null
        });
      }
    });

    res.json(Object.values(pdiMap));
  } catch (err) {
    console.error('Error fetching PDI entries:', err);
    res.status(500).json({ error: 'Failed to fetch PDI entries' });
  }
});

// =================== POST /api/pdi ===================
router.post('/api/pdi', async (req, res) => {
  const pool = await poolPromise;
  const transaction = new sql.Transaction(pool);

  try {
    const {
      productionCode, product, date, shift, defectName, quantity, inspector,
      status = 'Open', severity, correctiveActions = [], preventiveActions = []
    } = req.body;

    // Validate status
    if (!VALID_STATUSES.includes(status)) {
      return res.status(400).json({ error: `Invalid status value. Must be one of: ${VALID_STATUSES.join(', ')}` });
    }

    // Validate inspector as UUID
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(inspector)) {
      return res.status(400).json({ error: 'Invalid inspector ID format' });
    }

    const pdiId = uuidv4();

    await transaction.begin();

    // Insert PDI entry
    const pdiRequest = new sql.Request(transaction);
    pdiRequest.input('pdiId', sql.UniqueIdentifier, pdiId);
    pdiRequest.input('productionCode', sql.VarChar, productionCode);
    pdiRequest.input('product', sql.VarChar, product);
    pdiRequest.input('date', sql.Date, date ? new Date(date) : null);
    pdiRequest.input('shift', sql.VarChar, shift);
    pdiRequest.input('defectName', sql.VarChar, defectName);
    pdiRequest.input('quantity', sql.Int, quantity);
    pdiRequest.input('inspector', sql.UniqueIdentifier, inspector);
    pdiRequest.input('status', sql.VarChar, status);
    pdiRequest.input('severity', sql.VarChar, severity);

    await pdiRequest.query(`
      INSERT INTO PDI (pdiId, productionCode, product, date, shift, defectName, quantity, inspector, status, severity)
      VALUES (@pdiId, @productionCode, @product, @date, @shift, @defectName, @quantity, @inspector, @status, @severity)
    `);

    // Insert corrective actions
    for (const action of correctiveActions) {
      const correctiveReq = new sql.Request(transaction);
      correctiveReq.input('pdiId', sql.UniqueIdentifier, pdiId);
      correctiveReq.input('action', sql.NVarChar(sql.MAX), action.action || null);
      correctiveReq.input('responsible', sql.VarChar, action.responsible || null);
      correctiveReq.input('dueDate', sql.Date, action.dueDate ? new Date(action.dueDate) : null);

      await correctiveReq.query(`
        INSERT INTO PDI_CorrectiveActions (pdiId, action, responsible, dueDate)
        VALUES (@pdiId, @action, @responsible, @dueDate)
      `);
    }

    // Insert preventive actions
    for (const action of preventiveActions) {
      const preventiveReq = new sql.Request(transaction);
      preventiveReq.input('pdiId', sql.UniqueIdentifier, pdiId);
      preventiveReq.input('action', sql.NVarChar(sql.MAX), action.action || null);
      preventiveReq.input('responsible', sql.VarChar, action.responsible || null);
      preventiveReq.input('dueDate', sql.Date, action.dueDate ? new Date(action.dueDate) : null);

      await preventiveReq.query(`
        INSERT INTO PDI_PreventiveActions (pdiId, action, responsible, dueDate)
        VALUES (@pdiId, @action, @responsible, @dueDate)
      `);
    }

    // Auto-create a Task if defectName exists
    if (defectName && defectName.trim() !== '') {
      const taskId = uuidv4();
      const taskReq = new sql.Request(transaction);

      taskReq.input('taskId', sql.UniqueIdentifier, taskId);
      taskReq.input('productionCode', sql.VarChar, productionCode || null);
      taskReq.input('taskType', sql.VarChar, 'pdi-defect');
      taskReq.input('title', sql.VarChar, `PDI Defect: ${defectName}`);
      taskReq.input('description', sql.NVarChar(sql.MAX), `Defect found during PDI for product ${product} in shift ${shift}.`);
      taskReq.input('priority', sql.VarChar, severity?.toLowerCase() || 'medium');
      taskReq.input('assignedTo', sql.UniqueIdentifier, inspector || null);
      taskReq.input('dueDate', sql.Date, date ? new Date(date) : null);
      taskReq.input('status', sql.VarChar, 'pending');
      taskReq.input('createdFrom', sql.VarChar, 'pdi');
      taskReq.input('rejectionReason', sql.NVarChar(sql.MAX), null);
      taskReq.input('quantity', sql.Int, quantity || null);
      taskReq.input('maintenanceType', sql.VarChar, null);
      taskReq.input('equipment', sql.VarChar, null);

      await taskReq.query(`
        INSERT INTO Tasks (
          taskId, productionCode, taskType, title, description, priority, assignedTo, dueDate,
          status, createdFrom, rejectionReason, quantity, maintenanceType, equipment
        )
        VALUES (
          @taskId, @productionCode, @taskType, @title, @description, @priority, @assignedTo, @dueDate,
          @status, @createdFrom, @rejectionReason, @quantity, @maintenanceType, @equipment
        )
      `);
    }

    await transaction.commit();

    // Fetch the full PDI entry to return
    const result = await pool.request()
      .input('pdiId', sql.UniqueIdentifier, pdiId)
      .query(`
        SELECT 
          p.pdiId,
          p.productionCode,
          p.product,
          p.date,
          p.shift,
          p.defectName,
          p.quantity,
          p.inspector,
          p.status,
          p.severity,
          ca.action AS correctiveAction,
          ca.responsible AS correctiveResponsible,
          ca.dueDate AS correctiveDueDate,
          pa.action AS preventiveAction,
          pa.responsible AS preventiveResponsible,
          pa.dueDate AS preventiveDueDate
        FROM PDI p
        LEFT JOIN PDI_CorrectiveActions ca ON ca.pdiId = p.pdiId
        LEFT JOIN PDI_PreventiveActions pa ON pa.pdiId = p.pdiId
        WHERE p.pdiId = @pdiId
      `);

    const pdiMap = {};
    result.recordset.forEach(row => {
      if (!pdiMap[row.pdiId]) {
        pdiMap[row.pdiId] = {
          pdiId: row.pdiId,
          productionCode: row.productionCode,
          product: row.product,
          date: row.date ? row.date.toISOString().split('T')[0] : null,
          shift: row.shift,
          defectName: row.defectName,
          quantity: row.quantity,
          inspector: row.inspector,
          status: row.status,
          severity: row.severity,
          correctiveActions: [],
          preventiveActions: []
        };
      }

      if (row.correctiveAction) {
        pdiMap[row.pdiId].correctiveActions.push({
          actionId: uuidv4(),
          action: row.correctiveAction,
          responsible: row.correctiveResponsible,
          dueDate: row.correctiveDueDate ? row.correctiveDueDate.toISOString().split('T')[0] : null
        });
      }

      if (row.preventiveAction) {
        pdiMap[row.pdiId].preventiveActions.push({
          actionId: uuidv4(),
          action: row.preventiveAction,
          responsible: row.preventiveResponsible,
          dueDate: row.preventiveDueDate ? row.preventiveDueDate.toISOString().split('T')[0] : null
        });
      }
    });

    const pdiEntry = Object.values(pdiMap)[0];
    res.status(201).json(pdiEntry);

  } catch (err) {
    try { await transaction.rollback(); } catch (rollbackErr) {
      console.error('Rollback failed:', rollbackErr);
    }
    console.error('Error adding PDI entry:', err);
    res.status(500).json({ error: 'Failed to add PDI entry' });
  }
});

// =================== PATCH /api/pdi/:id ===================
router.patch('/api/pdi/:id', async (req, res) => {
  const { id } = req.params;
  const {
    productionCode, product, date, shift, defectName, quantity, inspector,
    status, severity, correctiveActions = [], preventiveActions = []
  } = req.body;

  const pool = await poolPromise;
  if (!pool) {
    return res.status(500).json({ error: 'Database connection failed' });
  }

  const transaction = new sql.Transaction(pool);

  try {
    await transaction.begin();

    // Check if PDI entry exists
    const existsResult = await transaction.request()
      .input('pdiId', sql.UniqueIdentifier, id)
      .query('SELECT 1 FROM PDI WHERE pdiId = @pdiId');
    if (existsResult.recordset.length === 0) {
      await transaction.rollback();
      return res.status(404).json({ error: 'PDI entry not found' });
    }

    // Validate status if provided
    if (status && !VALID_STATUSES.includes(status)) {
      await transaction.rollback();
      return res.status(400).json({ error: `Invalid status value. Must be one of: ${VALID_STATUSES.join(', ')}` });
    }

    // Validate inspector if provided
    if (inspector) {
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
      if (!uuidRegex.test(inspector)) {
        await transaction.rollback();
        return res.status(400).json({ error: 'Invalid inspector ID format' });
      }
    }

    // Update main PDI record with provided fields only
    const updateFields = [];
    const updateParams = new sql.Request(transaction);
    updateParams.input('pdiId', sql.UniqueIdentifier, id);

    if (productionCode !== undefined) {
      updateFields.push('productionCode = @productionCode');
      updateParams.input('productionCode', sql.VarChar, productionCode);
    }
    if (product !== undefined) {
      updateFields.push('product = @product');
      updateParams.input('product', sql.VarChar, product);
    }
    if (date !== undefined) {
      updateFields.push('date = @date');
      updateParams.input('date', sql.Date, date ? new Date(date) : null);
    }
    if (shift !== undefined) {
      updateFields.push('shift = @shift');
      updateParams.input('shift', sql.VarChar, shift);
    }
    if (defectName !== undefined) {
      updateFields.push('defectName = @defectName');
      updateParams.input('defectName', sql.VarChar, defectName);
    }
    if (quantity !== undefined) {
      updateFields.push('quantity = @quantity');
      updateParams.input('quantity', sql.Int, quantity);
    }
    if (inspector !== undefined) {
      updateFields.push('inspector = @inspector');
      updateParams.input('inspector', sql.UniqueIdentifier, inspector);
    }
    if (status !== undefined) {
      updateFields.push('status = @status');
      updateParams.input('status', sql.VarChar, status);
    }
    if (severity !== undefined) {
      updateFields.push('severity = @severity');
      updateParams.input('severity', sql.VarChar, severity);
    }

    if (updateFields.length > 0) {
      await updateParams.query(`
        UPDATE PDI
        SET ${updateFields.join(', ')}
        WHERE pdiId = @pdiId
      `);
    }

    // Delete old corrective actions if new ones provided
    if (correctiveActions.length > 0) {
      await transaction.request()
        .input('pdiId', sql.UniqueIdentifier, id)
        .query('DELETE FROM PDI_CorrectiveActions WHERE pdiId = @pdiId');

      // Insert new corrective actions
      for (const action of correctiveActions) {
        await transaction.request()
          .input('pdiId', sql.UniqueIdentifier, id)
          .input('action', sql.NVarChar(sql.MAX), action.action || null)
          .input('responsible', sql.NVarChar(100), action.responsible || null)
          .input('dueDate', sql.Date, action.dueDate ? new Date(action.dueDate) : null)
          .query(`
            INSERT INTO PDI_CorrectiveActions (pdiId, action, responsible, dueDate)
            VALUES (@pdiId, @action, @responsible, @dueDate)
          `);
      }
    }

    // Delete old preventive actions if new ones provided
    if (preventiveActions.length > 0) {
      await transaction.request()
        .input('pdiId', sql.UniqueIdentifier, id)
        .query('DELETE FROM PDI_PreventiveActions WHERE pdiId = @pdiId');

      // Insert new preventive actions
      for (const action of preventiveActions) {
        await transaction.request()
          .input('pdiId', sql.UniqueIdentifier, id)
          .input('action', sql.NVarChar(sql.MAX), action.action || null)
          .input('responsible', sql.NVarChar(100), action.responsible || null)
          .input('dueDate', sql.Date, action.dueDate ? new Date(action.dueDate) : null)
          .query(`
            INSERT INTO PDI_PreventiveActions (pdiId, action, responsible, dueDate)
            VALUES (@pdiId, @action, @responsible, @dueDate)
          `);
      }
    }

    await transaction.commit();

    // Fetch and return the updated PDI entry
    const result = await pool.request()
      .input('pdiId', sql.UniqueIdentifier, id)
      .query(`
        SELECT 
          p.pdiId,
          p.productionCode,
          p.product,
          p.date,
          p.shift,
          p.defectName,
          p.quantity,
          p.inspector,
          p.status,
          p.severity,
          ca.action AS correctiveAction,
          ca.responsible AS correctiveResponsible,
          ca.dueDate AS correctiveDueDate,
          pa.action AS preventiveAction,
          pa.responsible AS preventiveResponsible,
          pa.dueDate AS preventiveDueDate
        FROM PDI p
        LEFT JOIN PDI_CorrectiveActions ca ON ca.pdiId = p.pdiId
        LEFT JOIN PDI_PreventiveActions pa ON pa.pdiId = p.pdiId
        WHERE p.pdiId = @pdiId
      `);

    if (result.recordset.length === 0) {
      return res.status(404).json({ error: 'PDI entry not found' });
    }

    const pdiMap = {};
    result.recordset.forEach(row => {
      if (!pdiMap[row.pdiId]) {
        pdiMap[row.pdiId] = {
          pdiId: row.pdiId,
          productionCode: row.productionCode,
          product: row.product,
          date: row.date ? row.date.toISOString().split('T')[0] : null,
          shift: row.shift,
          defectName: row.defectName,
          quantity: row.quantity,
          inspector: row.inspector,
          status: row.status,
          severity: row.severity,
          correctiveActions: [],
          preventiveActions: []
        };
      }

      if (row.correctiveAction) {
        pdiMap[row.pdiId].correctiveActions.push({
          actionId: uuidv4(),
          action: row.correctiveAction,
          responsible: row.correctiveResponsible,
          dueDate: row.correctiveDueDate ? row.correctiveDueDate.toISOString().split('T')[0] : null
        });
      }

      if (row.preventiveAction) {
        pdiMap[row.pdiId].preventiveActions.push({
          actionId: uuidv4(),
          action: row.preventiveAction,
          responsible: row.preventiveResponsible,
          dueDate: row.preventiveDueDate ? row.preventiveDueDate.toISOString().split('T')[0] : null
        });
      }
    });

    const pdiEntry = Object.values(pdiMap)[0];
    res.json(pdiEntry);

  } catch (err) {
    try { await transaction.rollback(); } catch (rollbackErr) {
      console.error('Rollback failed:', rollbackErr);
    }
    console.error('Error updating PDI:', err);
    res.status(500).json({ error: 'Failed to update PDI entry', details: err.message });
  }
});

// =================== PATCH /api/pdi/:id/status ===================
router.patch('/api/pdi/:id/status', async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  try {
    const pool = await poolPromise;

    // Validate status
    if (!status || !VALID_STATUSES.includes(status)) {
      return res.status(400).json({ error: `Invalid status value. Must be one of: ${VALID_STATUSES.join(', ')}` });
    }

    // Check if PDI entry exists
    const existsResult = await pool.request()
      .input('pdiId', sql.UniqueIdentifier, id)
      .query('SELECT 1 FROM PDI WHERE pdiId = @pdiId');
    if (existsResult.recordset.length === 0) {
      return res.status(404).json({ error: 'PDI entry not found' });
    }

    // Update status
    const updateResult = await pool.request()
      .input('pdiId', sql.UniqueIdentifier, id)
      .input('status', sql.VarChar, status)
      .query('UPDATE PDI SET status = @status WHERE pdiId = @pdiId');

    if (updateResult.rowsAffected[0] === 0) {
      return res.status(404).json({ error: 'PDI entry not found' });
    }

    // Fetch the updated PDI entry
    const result = await pool.request()
      .input('pdiId', sql.UniqueIdentifier, id)
      .query(`
        SELECT 
          p.pdiId,
          p.productionCode,
          p.product,
          p.date,
          p.shift,
          p.defectName,
          p.quantity,
          p.inspector,
          p.status,
          p.severity,
          ca.action AS correctiveAction,
          ca.responsible AS correctiveResponsible,
          ca.dueDate AS correctiveDueDate,
          pa.action AS preventiveAction,
          pa.responsible AS preventiveResponsible,
          pa.dueDate AS preventiveDueDate
        FROM PDI p
        LEFT JOIN PDI_CorrectiveActions ca ON ca.pdiId = p.pdiId
        LEFT JOIN PDI_PreventiveActions pa ON pa.pdiId = p.pdiId
        WHERE p.pdiId = @pdiId
      `);

    const pdiMap = {};
    result.recordset.forEach(row => {
      if (!pdiMap[row.pdiId]) {
        pdiMap[row.pdiId] = {
          pdiId: row.pdiId,
          productionCode: row.productionCode,
          product: row.product,
          date: row.date ? row.date.toISOString().split('T')[0] : null,
          shift: row.shift,
          defectName: row.defectName,
          quantity: row.quantity,
          inspector: row.inspector,
          status: row.status,
          severity: row.severity,
          correctiveActions: [],
          preventiveActions: []
        };
      }

      if (row.correctiveAction) {
        pdiMap[row.pdiId].correctiveActions.push({
          actionId: uuidv4(),
          action: row.correctiveAction,
          responsible: row.correctiveResponsible,
          dueDate: row.correctiveDueDate ? row.correctiveDueDate.toISOString().split('T')[0] : null
        });
      }

      if (row.preventiveAction) {
        pdiMap[row.pdiId].preventiveActions.push({
          actionId: uuidv4(),
          action: row.preventiveAction,
          responsible: row.preventiveResponsible,
          dueDate: row.preventiveDueDate ? row.preventiveDueDate.toISOString().split('T')[0] : null
        });
      }
    });

    const pdiEntry = Object.values(pdiMap)[0];
    res.json(pdiEntry);

  } catch (err) {
    console.error('Error updating PDI status:', err);
    res.status(500).json({ error: 'Failed to update PDI status', details: err.message });
  }
});

// =================== DELETE /api/pdi/:id ===================
router.delete('/api/pdi/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const pool = await poolPromise;
    const transaction = new sql.Transaction(pool);

    await transaction.begin();

    // Delete corrective and preventive actions
    await transaction.request()
      .input('pdiId', sql.UniqueIdentifier, id)
      .query('DELETE FROM PDI_CorrectiveActions WHERE pdiId = @pdiId');
    await transaction.request()
      .input('pdiId', sql.UniqueIdentifier, id)
      .query('DELETE FROM PDI_PreventiveActions WHERE pdiId = @pdiId');

    // Delete PDI entry
    const result = await transaction.request()
      .input('pdiId', sql.UniqueIdentifier, id)
      .query('DELETE FROM PDI WHERE pdiId = @pdiId');

    if (result.rowsAffected[0] === 0) {
      await transaction.rollback();
      return res.status(404).json({ error: 'PDI entry not found' });
    }

    await transaction.commit();
    res.json({ message: 'PDI entry deleted successfully', pdiId: id });
  } catch (err) {
    try { await transaction.rollback(); } catch (rollbackErr) {
      console.error('Rollback failed:', rollbackErr);
    }
    console.error('Error deleting PDI entry:', err);
    res.status(500).json({ error: 'Failed to delete PDI entry', details: err.message });
  }
});

export default router;