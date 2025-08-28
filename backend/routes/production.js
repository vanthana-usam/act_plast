// import express from 'express';
// import sql from 'mssql';
// import { v4 as uuidv4 } from 'uuid';
// import { poolPromise } from '../db.js'; // Assuming you have a db.js file that exports your
// // configured mssql pool
// import executeQuery from '../utils/helper.js'; // Import the helper function
// const router = express.Router();


// // =========================== GET: Fetch Production Records ==========================
// router.get('/api/production', async (req, res) => {
//   try {
//     const { search, date, shift, status, productionType, page = 1, limit = 20 } = req.query;

//     let query = 'SELECT * FROM ProductionRecords WHERE 1=1';
//     const params = [];

//     if (search) {
//       query += ' AND (recordId LIKE @search OR Product LIKE @search OR MachineName LIKE @search)';
//       params.push({ name: 'search', type: sql.VarChar, value: `%${search}%` });
//     }
//     if (date) {
//       query += ' AND CAST(Date AS DATE) = @date';
//       params.push({ name: 'date', type: sql.Date, value: date });
//     }
//     if (shift && shift !== 'all') {
//       query += ' AND Shift = @shift';
//       params.push({ name: 'shift', type: sql.VarChar(10), value: shift });
//     }
//     if (status && status !== 'all') {
//       query += ' AND Status = @status';
//       params.push({ name: 'status', type: sql.VarChar(20), value: status });
//     }
//     if (productionType && productionType !== 'all') {
//       query += ' AND ProductionType = @productionType';
//       params.push({ name: 'productionType', type: sql.VarChar(50), value: productionType });
//     }

//     // Pagination
//     const pageNum = parseInt(page) > 0 ? parseInt(page) : 1;
//     const limitNum = parseInt(limit) > 0 ? parseInt(limit) : 20;
//     const offset = (pageNum - 1) * limitNum;
//     query += ` ORDER BY Date DESC OFFSET ${offset} ROWS FETCH NEXT ${limitNum} ROWS ONLY`;

//     const records = await executeQuery(query, params);

//     // Optional: total count for frontend pagination
//     let totalCountQuery = 'SELECT COUNT(*) AS total FROM ProductionRecords WHERE 1=1';
//     totalCountQuery += query.split('WHERE 1=1')[1].split('ORDER BY')[0]; // reuse filters
//     const totalCountResult = await executeQuery(totalCountQuery, params);
//     const total = totalCountResult[0]?.total || 0;

//     res.json({ records, total, page: pageNum, limit: limitNum });
//   } catch (err) {
//     console.error('Error fetching production records:', err);
//     res.status(500).json({
//       error: 'Internal server error',
//       ...(process.env.NODE_ENV === 'development' && { details: err.message })
//     });
//   }
// });

// // =========================== POST: Add Production Record ==========================
// router.post('/api/production', async (req, res) => {
//   const transaction = new sql.Transaction(pool);

//   try {
//     const {
//       productionType, date, shift, machineName, product, plannedQty, actualQty,
//       rejectedQty, lumpsQty, lumpsReason, rejectionType, rejectionReason, issueType,
//       downtime, defectType, targetOutput, plannedMins, operator, supervisor, status, efficiency
//     } = req.body;

//     const recordId = uuidv4();

//     await transaction.begin();
//     const request = new sql.Request(transaction);

//     // Prepare inputs
//     request.input('recordId', sql.UniqueIdentifier, recordId);
//     request.input('productionType', sql.VarChar(50), productionType || null);
//     // request.input('date', sql.DateTime, date ? new Date(date) : null);
//     request.input('date', sql.DateTime, date ? new Date(date) : new Date());
//     request.input('shift', sql.VarChar(1), shift || "");
//     request.input('machineName', sql.VarChar(50), machineName || null);
//     request.input('product', sql.VarChar(100), product || null);
//     request.input('plannedQty', sql.Int, plannedQty ?? 0);
//     request.input('actualQty', sql.Int, actualQty ?? 0);
//     request.input('rejectedQty', sql.Int, rejectedQty ?? 0);
//     request.input('lumpsQty', sql.Int, lumpsQty ?? 0);
//     request.input('lumpsReason', sql.NVarChar(sql.MAX), lumpsReason || null);
//     request.input('rejectionType', sql.VarChar(50), rejectionType || null);
//     request.input('rejectionReason', sql.NVarChar(sql.MAX), rejectionReason || null);
//     request.input('issueType', sql.VarChar(50), issueType || null);
//     request.input('downtime', sql.Int, downtime ?? 0);
//     request.input('defectType', sql.VarChar(50), defectType || null);
//     request.input('targetOutput', sql.Int, targetOutput ?? 0);
//     request.input('plannedMins', sql.Int, plannedMins ?? 0);
//     request.input('operator', sql.VarChar(100), operator || null);
//     request.input('supervisor', sql.VarChar(100), supervisor || null);
//     request.input('status', sql.VarChar(20), status || 'Pending');
//     request.input('efficiency', sql.Decimal(18, 2), efficiency ?? 0);

//     // Insert production record
//     const insertProductionQuery = `
//       INSERT INTO ProductionRecords (
//         recordId, productionType, date, shift, machineName, product, plannedQty, actualQty,
//         rejectedQty, lumpsQty, lumpsReason, rejectionType, rejectionReason, issueType,
//         downtime, defectType, targetOutput, plannedMins, operator, supervisor, status, efficiency
//       ) VALUES (
//         @recordId, @productionType, @date, @shift, @machineName, @product, @plannedQty, @actualQty,
//         @rejectedQty, @lumpsQty, @lumpsReason, @rejectionType, @rejectionReason, @issueType,
//         @downtime, @defectType, @targetOutput, @plannedMins, @operator, @supervisor, @status, @efficiency
//       )
//     `;
//     await request.query(insertProductionQuery);

//     // // Optional: Create task if defectType exists
//     let createdTask = null;
//     // if (defectType?.trim()) {
//     //   const taskId = sql.UniqueIdentifier(); // generated by SQL
//     //   const assignedTo = (operator?.trim()) || null;
//     //   // const assignedTo = (supervisor?.trim() || operator?.trim()) || null;

//     //   const taskRequest = new sql.Request(transaction);
//     //   // taskRequest.input('taskId', sql.UniqueIdentifier, taskId);
//     //   taskRequest.input('ProductionCode', sql.UniqueIdentifier, recordId);
//     //   taskRequest.input('TaskType', sql.VarChar(50), 'defect');
//     //   taskRequest.input('Title', sql.VarChar(200), `Production Defect: ${defectType}`);
//     //   taskRequest.input('Description', sql.NVarChar(sql.MAX), `Defect detected in production for product ${product || 'N/A'} on machine ${machineName || 'N/A'}.`);
//     //   taskRequest.input('Priority', sql.VarChar(20), 'high');
//     //   taskRequest.input('AssignedTo', sql.VarChar(100), assignedTo);
//     //   taskRequest.input('DueDate', sql.DateTime, date ? new Date(date) : null);
//     //   taskRequest.input('Status', sql.VarChar(20), 'pending');
//     //   taskRequest.input('CreatedFrom', sql.VarChar(50), 'production');
//     //   taskRequest.input('RejectionReason', sql.NVarChar(sql.MAX), rejectionReason || null);
//     //   taskRequest.input('Quantity', sql.Int, rejectedQty ?? 0);
//     //   taskRequest.input('MaintenanceType', sql.VarChar(50), null);
//     //   taskRequest.input('Equipment', sql.VarChar(50), machineName || null);

//     //   const insertTaskQuery = `
//     //     INSERT INTO Tasks (
//     //       taskId, ProductionCode, TaskType, Title, Description, Priority, AssignedTo, DueDate, Status,
//     //       CreatedFrom, RejectionReason, Quantity, MaintenanceType, Equipment
//     //     ) VALUES (
//     //       NEWID(), @ProductionCode, @TaskType, @Title, @Description, @Priority, @AssignedTo, @DueDate, 
//     //       @Status, @CreatedFrom, @RejectionReason, @Quantity, @MaintenanceType, @Equipment
//     //     )
//     //   `;
//     //   await taskRequest.query(insertTaskQuery);

//     //   createdTask = { taskId, defectType, assignedTo, status: 'pending' };
//     // }
// if (defectType?.trim()) {
//   const taskId = uuidv4();
//   const assignedTo = operator?.trim() || null;

//   const taskRequest = new sql.Request(transaction);
//   taskRequest.input('taskId', sql.UniqueIdentifier, taskId);
//   taskRequest.input('ProductionCode', sql.UniqueIdentifier, recordId);
//   taskRequest.input('TaskType', sql.VarChar(50), 'defect');
//   taskRequest.input('Title', sql.VarChar(200), `Production Defect: ${defectType}`);
//   taskRequest.input('Description', sql.NVarChar(sql.MAX),
//     `Defect detected in production for product ${product || 'N/A'} on machine ${machineName || 'N/A'}.`);
//   taskRequest.input('Priority', sql.VarChar(20), 'high');
//   taskRequest.input('AssignedTo', sql.VarChar(100), assignedTo); // ✅ same type as /api/tasks
//   taskRequest.input('DueDate', sql.DateTime, date ? new Date(date) : null);
//   taskRequest.input('Status', sql.VarChar(20), 'pending');
//   taskRequest.input('CreatedFrom', sql.VarChar(50), 'production');
//   taskRequest.input('RejectionReason', sql.NVarChar(sql.MAX), rejectionReason || null);
//   taskRequest.input('Quantity', sql.Int, rejectedQty ?? 0);
//   taskRequest.input('MaintenanceType', sql.VarChar(50), null);
//   taskRequest.input('Equipment', sql.VarChar(50), machineName || null);

//   await taskRequest.query(`
//     INSERT INTO Tasks (
//       taskId, ProductionCode, TaskType, Title, Description, Priority, AssignedTo, DueDate, Status,
//       CreatedFrom, RejectionReason, Quantity, MaintenanceType, Equipment
//     ) VALUES (
//       @taskId, @ProductionCode, @TaskType, @Title, @Description, @Priority, @AssignedTo, @DueDate,
//       @Status, @CreatedFrom, @RejectionReason, @Quantity, @MaintenanceType, @Equipment
//     )
//   `);

//   createdTask = { taskId, defectType, assignedTo, status: 'pending' };
// }

//     await transaction.commit();

//     // Fetch inserted record for response
//     const insertedRecord = await executeQuery(
//       'SELECT * FROM ProductionRecords WHERE recordId = @recordId',
//       [{ name: 'recordId', type: sql.UniqueIdentifier, value: recordId }]
//     );

//     res.status(201).json({
//       message: 'Production record added successfully',
//       record: insertedRecord[0],
//       task: createdTask
//     });

//     console.log("✅ Production record inserted", recordId, createdTask ? `with Task ${createdTask.taskId}` : '');
//   } catch (err) {
//     console.error("❌ SQL ERROR inside transaction:", err);
//     try { if (!transaction._aborted) await transaction.rollback(); } catch {}
//     res.status(500).json({ error: 'Internal server error', details: err.message });
//   }
// });

// export default router; // Export the router to use in your main app file
// // Make sure to import this router in your main app file and use it with app.use('/


import express from 'express';
import sql from 'mssql';
import { v4 as uuidv4 } from 'uuid';
import { poolPromise } from '../db.js'; // configured mssql pool
import executeQuery from '../utils/helper.js'; // helper for simple queries

const router = express.Router();

// =========================== GET: Fetch Production Records ==========================
router.get('/api/production', async (req, res) => {
  try {
    const { search, date, shift, status, productionType, page = 1, limit = 20 } = req.query;

    let filters = ' WHERE 1=1';
    const params = [];

    if (search) {
      filters += ' AND (recordId LIKE @search OR Product LIKE @search OR MachineName LIKE @search)';
      params.push({ name: 'search', type: sql.VarChar, value: `%${search}%` });
    }
    if (date) {
      filters += ' AND CAST(Date AS DATE) = @date';
      params.push({ name: 'date', type: sql.Date, value: date });
    }
    if (shift && shift !== 'all') {
      filters += ' AND Shift = @shift';
      params.push({ name: 'shift', type: sql.VarChar(10), value: shift });
    }
    if (status && status !== 'all') {
      filters += ' AND Status = @status';
      params.push({ name: 'status', type: sql.VarChar(20), value: status });
    }
    if (productionType && productionType !== 'all') {
      filters += ' AND ProductionType = @productionType';
      params.push({ name: 'productionType', type: sql.VarChar(50), value: productionType });
    }

    // Pagination
    const pageNum = parseInt(page, 10) > 0 ? parseInt(page, 10) : 1;
    const limitNum = parseInt(limit, 10) > 0 ? parseInt(limit, 10) : 20;
    const offset = (pageNum - 1) * limitNum;

    const query = `
      SELECT * 
      FROM ProductionRecords
      ${filters}
      ORDER BY Date DESC 
      OFFSET ${offset} ROWS FETCH NEXT ${limitNum} ROWS ONLY
    `;

    const records = await executeQuery(query, params);

    // Total count
    const totalCountQuery = `SELECT COUNT(*) AS total FROM ProductionRecords ${filters}`;
    const totalCountResult = await executeQuery(totalCountQuery, params);
    const total = totalCountResult[0]?.total || 0;

    res.json({ records, total, page: pageNum, limit: limitNum });
  } catch (err) {
    console.error('❌ Error fetching production records:', err);
    res.status(500).json({
      error: 'Internal server error',
      ...(process.env.NODE_ENV === 'development' && { details: err.message })
    });
  }
});

// =========================== POST: Add Production Record ==========================

router.post('/api/production', async (req, res) => {
  const pool = await poolPromise;
  const transaction = new sql.Transaction(pool);

  try {
    const {
      productionType, date, shift, machineName, product, plannedQty, actualQty,
      rejectedQty, lumpsQty, lumpsReason, rejectionType, rejectionReason, issueType,
      downtime, defectType, targetOutput, plannedMins, operator, supervisor, status, efficiency , productionCode
    } = req.body;

    console.log("📝 Received production record data:", req.body);
    

    const recordId = uuidv4();

    await transaction.begin();
    const request = new sql.Request(transaction);

    // Prepare inputs
    request.input('recordId', sql.UniqueIdentifier, recordId);
    request.input('productionType', sql.VarChar(50), productionType || null);
    request.input('date', sql.DateTime, date ? new Date(date) : new Date());
    request.input('shift', sql.VarChar(1), shift || '');
    request.input('machineName', sql.VarChar(50), machineName || null);
    request.input('product', sql.VarChar(100), product || null);
    request.input('plannedQty', sql.Int, plannedQty ?? 0);
    request.input('actualQty', sql.Int, actualQty ?? 0);
    request.input('rejectedQty', sql.Int, rejectedQty ?? 0);
    request.input('lumpsQty', sql.Int, lumpsQty ?? 0);
    request.input('lumpsReason', sql.NVarChar(sql.MAX), lumpsReason || null);
    request.input('rejectionType', sql.VarChar(50), rejectionType || null);
    request.input('rejectionReason', sql.NVarChar(sql.MAX), rejectionReason || null);
    request.input('issueType', sql.VarChar(50), issueType || null);
    request.input('downtime', sql.Int, downtime ?? 0);
    request.input('defectType', sql.VarChar(50), defectType || null);
    request.input('targetOutput', sql.Int, targetOutput ?? 0);
    request.input('plannedMins', sql.Int, plannedMins ?? 0);
    request.input('operator', sql.VarChar(100), operator || null);
    request.input('supervisor', sql.VarChar(100), supervisor || null);
    request.input('status', sql.VarChar(20), (status || 'pending').toLowerCase());
    request.input('efficiency', sql.Decimal(18, 2), efficiency ?? 0);
    request.input('productionCode', sql.VarChar(50), productionCode || null);

    // Insert production record
    const insertProductionQuery = `
      INSERT INTO ProductionRecords (
        recordId, productionType, date, shift, machineName, product, plannedQty, actualQty,
        rejectedQty, lumpsQty, lumpsReason, rejectionType, rejectionReason, issueType,
        downtime, defectType, targetOutput, plannedMins, operator, supervisor, status, efficiency, productionCode
      ) VALUES (
        @recordId, @productionType, @date, @shift, @machineName, @product, @plannedQty, @actualQty,
        @rejectedQty, @lumpsQty, @lumpsReason, @rejectionType, @rejectionReason, @issueType,
        @downtime, @defectType, @targetOutput, @plannedMins, @operator, @supervisor, @status, @efficiency, @productionCode
      )
    `;
    await request.query(insertProductionQuery);

    // Optional: Create task if defectType exists
    let createdTask = null;
    if (defectType?.trim()) {
      const taskId = uuidv4();
      const assignedTo = operator?.trim() || null;

      const taskRequest = new sql.Request(transaction);
      taskRequest.input('taskId', sql.UniqueIdentifier, taskId);
      taskRequest.input('productionCode', sql.VarChar(50), productionCode || null);
      taskRequest.input('taskType', sql.VarChar(50), 'defect');
      taskRequest.input('title', sql.VarChar(200), `Production Defect: ${defectType}`);
      taskRequest.input('description', sql.NVarChar(sql.MAX),
        `Defect detected in production for product ${product || 'N/A'} on machine ${machineName || 'N/A'}.`);
      taskRequest.input('priority', sql.VarChar(20), 'high');
      taskRequest.input('assignedTo', sql.VarChar(100), assignedTo);
      taskRequest.input('dueDate', sql.DateTime, date ? new Date(date) : null);
      taskRequest.input('status', sql.VarChar(20), 'pending');
      taskRequest.input('createdFrom', sql.VarChar(50), 'production');
      taskRequest.input('rejectionReason', sql.NVarChar(sql.MAX), rejectionReason || null);
      taskRequest.input('quantity', sql.Int, rejectedQty ?? 0);
      taskRequest.input('maintenanceType', sql.VarChar(50), null);
      taskRequest.input('equipment', sql.VarChar(50), machineName || null);

      await taskRequest.query(`
        INSERT INTO Tasks (
          taskId, productionCode, taskType, title, description, priority, assignedTo, dueDate, status,
          createdFrom, rejectionReason, quantity, maintenanceType, equipment
        ) VALUES (
          @taskId, @productionCode, @taskType, @title, @description, @priority, @assignedTo, @dueDate,
          @status, @createdFrom, @rejectionReason, @quantity, @maintenanceType, @equipment
        )
      `);

      createdTask = { taskId, defectType, assignedTo, status: 'pending' };
    }

    await transaction.commit();

    // Fetch inserted record for response
    const insertedRecord = await executeQuery(
      'SELECT * FROM ProductionRecords WHERE recordId = @recordId',
      [{ name: 'recordId', type: sql.UniqueIdentifier, value: recordId }]
    );

    res.status(201).json({
      message: 'Production record added successfully',
      record: insertedRecord[0],
      task: createdTask
    });

    console.log("✅ Production record inserted", recordId, createdTask ? `with Task ${createdTask.taskId}` : '');
  } catch (err) {
    console.error("❌ SQL ERROR inside transaction:", err);
    try { await transaction.rollback(); } catch {}
    res.status(500).json({ error: 'Internal server error', details: err.message });
  }
});

export default router;
