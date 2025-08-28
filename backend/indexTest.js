const express = require('express');
const sql = require('mssql');
const cors = require('cors');
const router = require('router')(); // Assuming you're using express-router
const app = express();
const port = 5000;
const dotenv = require('dotenv')
const crypto = require('crypto');
const { v4: uuidv4 } = require('uuid');
const bcrypt = require('bcrypt');


dotenv.config();

app.use(cors());
app.use(express.json());
app.use(router); // Mount the router middleware

// MS SQL Server configuration
const dbConfig = {
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  server: process.env.DB_SERVER,
  database: process.env.DB_NAME,
  options: {
    encrypt: true,
    // trustServerCertificate: process.env.NODE_ENV === 'development',
    trustServerCertificate: true,
  },
};

// // Connect to the database
let pool;
const connectToDb = async () => {
  try {
    pool = await sql.connect(dbConfig);
    console.log('Connected to MS SQL Server');
  } catch (err) {
    console.error('Database connection failed:', err);
  }
};
connectToDb();


// ================================= Helper =====================================
const executeQuery = async (query, params = []) => {
  try {
    const request = pool.request();
    params.forEach(param => request.input(param.name, param.type, param.value));
    const result = await request.query(query);
    return Array.isArray(result.recordset) ? result.recordset : [];
  } catch (err) {
    console.error('Query execution failed:', err);
    throw err;
  }
};

// =========================== GET: Fetch Production Records ==========================
router.get('/api/production', async (req, res) => {
  try {
    const { search, date, shift, status, productionType, page = 1, limit = 20 } = req.query;

    let query = 'SELECT * FROM ProductionRecords WHERE 1=1';
    const params = [];

    if (search) {
      query += ' AND (recordId LIKE @search OR Product LIKE @search OR MachineName LIKE @search)';
      params.push({ name: 'search', type: sql.VarChar, value: `%${search}%` });
    }
    if (date) {
      query += ' AND CAST(Date AS DATE) = @date';
      params.push({ name: 'date', type: sql.Date, value: date });
    }
    if (shift && shift !== 'all') {
      query += ' AND Shift = @shift';
      params.push({ name: 'shift', type: sql.VarChar(10), value: shift });
    }
    if (status && status !== 'all') {
      query += ' AND Status = @status';
      params.push({ name: 'status', type: sql.VarChar(20), value: status });
    }
    if (productionType && productionType !== 'all') {
      query += ' AND ProductionType = @productionType';
      params.push({ name: 'productionType', type: sql.VarChar(50), value: productionType });
    }

    // Pagination
    const pageNum = parseInt(page) > 0 ? parseInt(page) : 1;
    const limitNum = parseInt(limit) > 0 ? parseInt(limit) : 20;
    const offset = (pageNum - 1) * limitNum;
    query += ` ORDER BY Date DESC OFFSET ${offset} ROWS FETCH NEXT ${limitNum} ROWS ONLY`;

    const records = await executeQuery(query, params);

    // Optional: total count for frontend pagination
    let totalCountQuery = 'SELECT COUNT(*) AS total FROM ProductionRecords WHERE 1=1';
    totalCountQuery += query.split('WHERE 1=1')[1].split('ORDER BY')[0]; // reuse filters
    const totalCountResult = await executeQuery(totalCountQuery, params);
    const total = totalCountResult[0]?.total || 0;

    res.json({ records, total, page: pageNum, limit: limitNum });
  } catch (err) {
    console.error('Error fetching production records:', err);
    res.status(500).json({
      error: 'Internal server error',
      ...(process.env.NODE_ENV === 'development' && { details: err.message })
    });
  }
});

// =========================== POST: Add Production Record ==========================
router.post('/api/production', async (req, res) => {
  const transaction = new sql.Transaction(pool);

  try {
    const {
      productionType, date, shift, machineName, product, plannedQty, actualQty,
      rejectedQty, lumpsQty, lumpsReason, rejectionType, rejectionReason, issueType,
      downtime, defectType, targetOutput, plannedMins, operator, supervisor, status, efficiency
    } = req.body;

    const recordId = uuidv4();

    await transaction.begin();
    const request = new sql.Request(transaction);

    // Prepare inputs
    request.input('recordId', sql.UniqueIdentifier, recordId);
    request.input('productionType', sql.VarChar(50), productionType || null);
    // request.input('date', sql.DateTime, date ? new Date(date) : null);
    request.input('date', sql.DateTime, date ? new Date(date) : new Date());
    request.input('shift', sql.VarChar(1), shift || "");
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
    request.input('status', sql.VarChar(20), status || 'Pending');
    request.input('efficiency', sql.Decimal(18, 2), efficiency ?? 0);

    // Insert production record
    const insertProductionQuery = `
      INSERT INTO ProductionRecords (
        recordId, productionType, date, shift, machineName, product, plannedQty, actualQty,
        rejectedQty, lumpsQty, lumpsReason, rejectionType, rejectionReason, issueType,
        downtime, defectType, targetOutput, plannedMins, operator, supervisor, status, efficiency
      ) VALUES (
        @recordId, @productionType, @date, @shift, @machineName, @product, @plannedQty, @actualQty,
        @rejectedQty, @lumpsQty, @lumpsReason, @rejectionType, @rejectionReason, @issueType,
        @downtime, @defectType, @targetOutput, @plannedMins, @operator, @supervisor, @status, @efficiency
      )
    `;
    await request.query(insertProductionQuery);

    // // Optional: Create task if defectType exists
    let createdTask = null;
    // if (defectType?.trim()) {
    //   const taskId = sql.UniqueIdentifier(); // generated by SQL
    //   const assignedTo = (operator?.trim()) || null;
    //   // const assignedTo = (supervisor?.trim() || operator?.trim()) || null;

    //   const taskRequest = new sql.Request(transaction);
    //   // taskRequest.input('taskId', sql.UniqueIdentifier, taskId);
    //   taskRequest.input('ProductionCode', sql.UniqueIdentifier, recordId);
    //   taskRequest.input('TaskType', sql.VarChar(50), 'defect');
    //   taskRequest.input('Title', sql.VarChar(200), `Production Defect: ${defectType}`);
    //   taskRequest.input('Description', sql.NVarChar(sql.MAX), `Defect detected in production for product ${product || 'N/A'} on machine ${machineName || 'N/A'}.`);
    //   taskRequest.input('Priority', sql.VarChar(20), 'high');
    //   taskRequest.input('AssignedTo', sql.VarChar(100), assignedTo);
    //   taskRequest.input('DueDate', sql.DateTime, date ? new Date(date) : null);
    //   taskRequest.input('Status', sql.VarChar(20), 'pending');
    //   taskRequest.input('CreatedFrom', sql.VarChar(50), 'production');
    //   taskRequest.input('RejectionReason', sql.NVarChar(sql.MAX), rejectionReason || null);
    //   taskRequest.input('Quantity', sql.Int, rejectedQty ?? 0);
    //   taskRequest.input('MaintenanceType', sql.VarChar(50), null);
    //   taskRequest.input('Equipment', sql.VarChar(50), machineName || null);

    //   const insertTaskQuery = `
    //     INSERT INTO Tasks (
    //       taskId, ProductionCode, TaskType, Title, Description, Priority, AssignedTo, DueDate, Status,
    //       CreatedFrom, RejectionReason, Quantity, MaintenanceType, Equipment
    //     ) VALUES (
    //       NEWID(), @ProductionCode, @TaskType, @Title, @Description, @Priority, @AssignedTo, @DueDate, 
    //       @Status, @CreatedFrom, @RejectionReason, @Quantity, @MaintenanceType, @Equipment
    //     )
    //   `;
    //   await taskRequest.query(insertTaskQuery);

    //   createdTask = { taskId, defectType, assignedTo, status: 'pending' };
    // }
if (defectType?.trim()) {
  const taskId = uuidv4();
  const assignedTo = operator?.trim() || null;

  const taskRequest = new sql.Request(transaction);
  taskRequest.input('taskId', sql.UniqueIdentifier, taskId);
  taskRequest.input('ProductionCode', sql.UniqueIdentifier, recordId);
  taskRequest.input('TaskType', sql.VarChar(50), 'defect');
  taskRequest.input('Title', sql.VarChar(200), `Production Defect: ${defectType}`);
  taskRequest.input('Description', sql.NVarChar(sql.MAX),
    `Defect detected in production for product ${product || 'N/A'} on machine ${machineName || 'N/A'}.`);
  taskRequest.input('Priority', sql.VarChar(20), 'high');
  taskRequest.input('AssignedTo', sql.VarChar(100), assignedTo); // ✅ same type as /api/tasks
  taskRequest.input('DueDate', sql.DateTime, date ? new Date(date) : null);
  taskRequest.input('Status', sql.VarChar(20), 'pending');
  taskRequest.input('CreatedFrom', sql.VarChar(50), 'production');
  taskRequest.input('RejectionReason', sql.NVarChar(sql.MAX), rejectionReason || null);
  taskRequest.input('Quantity', sql.Int, rejectedQty ?? 0);
  taskRequest.input('MaintenanceType', sql.VarChar(50), null);
  taskRequest.input('Equipment', sql.VarChar(50), machineName || null);

  await taskRequest.query(`
    INSERT INTO Tasks (
      taskId, ProductionCode, TaskType, Title, Description, Priority, AssignedTo, DueDate, Status,
      CreatedFrom, RejectionReason, Quantity, MaintenanceType, Equipment
    ) VALUES (
      @taskId, @ProductionCode, @TaskType, @Title, @Description, @Priority, @AssignedTo, @DueDate,
      @Status, @CreatedFrom, @RejectionReason, @Quantity, @MaintenanceType, @Equipment
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
    try { if (!transaction._aborted) await transaction.rollback(); } catch {}
    res.status(500).json({ error: 'Internal server error', details: err.message });
  }
});


// ========================================================= MASTER TAB =====================================

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
router.put('/api/molds/:id', async (req, res) => {
  try {
    const { id } = req.params;
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
      WHERE id = @id
    `;

    await executeQuery(query, [
      { name: 'moldId', type: sql.Int, value: id },
      { name: 'name', type: sql.VarChar, value: name },
      { name: 'dimension', type: sql.VarChar, value: dimension },
      { name: 'hotRunnerZones', type: sql.Int, value: hotRunnerZones },
      { name: 'sprueRadius', type: sql.Decimal(4, 1), value: sprueRadius },
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
router.delete('/api/molds/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const query = `DELETE FROM Molds WHERE id = @id`;

    await executeQuery(query, [
      { name: 'id', type: sql.Int, value: id }
    ]);

    res.json({ message: 'Mold deleted successfully' });
  } catch (err) {
    console.error('Error deleting mold:', err);
    res.status(500).json({ error: 'Failed to delete mold' });
  }
});


// Machines Endpoints
router.get('/api/machines', async (req, res) => {
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

router.post('/api/machines', async (req, res) => {
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
router.put('/api/machines/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const {
      name, tieBarDistance, cores, maxMoldHeight, maxDaylight, screwDia, ldRatio,
      screwType, shotSize, screwStrokeLength, ejectorStrokeLength, minMoldHeight, hopperCapacity, status
    } = req.body;

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
      WHERE id = @id
    `;

    await executeQuery(query, [
      { name: 'id', type: sql.Int, value: id },
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
router.delete('/api/machines/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const query = `DELETE FROM Machines WHERE id = @id`;

    await executeQuery(query, [
      { name: 'id', type: sql.Int, value: id }
    ]);

    res.json({ message: 'Machine deleted successfully' });
  } catch (err) {
    console.error('Error deleting machine:', err);
    res.status(500).json({ error: 'Failed to delete machine' });
  }
});


// Products Endpoints
router.get('/api/products', async (req, res) => {
  try {
    const { search } = req.query;
    let query = 'SELECT * FROM Products WHERE 1=1';
    const params = [];
    if (search) {
      query += ' AND name LIKE @search';
      params.push({ name: 'search', type: sql.VarChar, value: `%${search}%` });
    }
    const products = await executeQuery(query, params);
    res.json(products);
  } catch (err) {
    console.error('Error fetching products:', err);
    res.status(500).json([]); // Return empty array on error
  }
});

router.post('/api/products', async (req, res) => {
  try {
    const {
      name, cycleTime, material, partWeight, runnerWeight, cavities, packingMethod, packingQty, status
    } = req.body;
    const query = `
      INSERT INTO Products (name, cycleTime, material, partWeight, runnerWeight, cavities, packingMethod, packingQty, status)
      VALUES (@name, @cycleTime, @material, @partWeight, @runnerWeight, @cavities, @packingMethod, @packingQty, @status)
    `;
    await executeQuery(query, [
      { name: 'name', type: sql.VarChar, value: name },
      { name: 'cycleTime', type: sql.Int, value: cycleTime },
      { name: 'material', type: sql.VarChar, value: material },
      { name: 'partWeight', type: sql.Decimal(5,1), value: partWeight },
      { name: 'runnerWeight', type: sql.Decimal(5,1), value: runnerWeight },
      { name: 'cavities', type: sql.Int, value: cavities },
      { name: 'packingMethod', type: sql.VarChar, value: packingMethod },
      { name: 'packingQty', type: sql.Int, value: packingQty },
      { name: 'status', type: sql.VarChar, value: status }
    ]);
    res.status(201).json({ message: 'Product added successfully' });
  } catch (err) {
    console.error('Error adding product:', err);
    res.status(500).json({ error: 'Failed to add product' });
  }
});

// Update Product
router.put('/api/products/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const {
      name, cycleTime, material, partWeight, runnerWeight, cavities, packingMethod, packingQty, status
    } = req.body;

    const query = `
      UPDATE Products
      SET name = @name,
          cycleTime = @cycleTime,
          material = @material,
          partWeight = @partWeight,
          runnerWeight = @runnerWeight,
          cavities = @cavities,
          packingMethod = @packingMethod,
          packingQty = @packingQty,
          status = @status
      WHERE id = @id
    `;

    await executeQuery(query, [
      { name: 'id', type: sql.Int, value: id },
      { name: 'name', type: sql.VarChar, value: name },
      { name: 'cycleTime', type: sql.Int, value: cycleTime },
      { name: 'material', type: sql.VarChar, value: material },
      { name: 'partWeight', type: sql.Decimal(5,1), value: partWeight },
      { name: 'runnerWeight', type: sql.Decimal(5,1), value: runnerWeight },
      { name: 'cavities', type: sql.Int, value: cavities },
      { name: 'packingMethod', type: sql.VarChar, value: packingMethod },
      { name: 'packingQty', type: sql.Int, value: packingQty },
      { name: 'status', type: sql.VarChar, value: status }
    ]);

    res.json({ message: 'Product updated successfully' });
  } catch (err) {
    console.error('Error updating product:', err);
    res.status(500).json({ error: 'Failed to update product' });
  }
});

// Delete Product
router.delete('/api/products/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const query = `DELETE FROM Products WHERE id = @id`;

    await executeQuery(query, [
      { name: 'id', type: sql.Int, value: id }
    ]);

    res.json({ message: 'Product deleted successfully' });
  } catch (err) {
    console.error('Error deleting product:', err);
    res.status(500).json({ error: 'Failed to delete product' });
  }
});


// ✅ Get Employees API
router.get('/api/employees', async (req, res) => {
  try {
    const { search } = req.query;
    let query = `
      SELECT employeeId, name, role, email, employeeGroup, status 
      FROM Employees 
      WHERE 1=1
    `;
    const params = [];

    if (search) {
      query += ' AND (name LIKE @search OR email LIKE @search)';
      params.push({ name: 'search', type: sql.VarChar, value: `%${search}%` });
    }

    const employees = await executeQuery(query, params);
    res.json(employees);
  } catch (err) {
    console.error('❌ Error fetching employees:', err);
    res.status(500).json({ error: 'Failed to fetch employees', details: err.message });
  }
});

// POST API: Create Employee
router.post('/api/employees', async (req, res) => {
  try {
    const { name, role, email, password, employeeGroup, status } = req.body;

    // Generate GUID
    const employeeId = uuidv4();

     // Hash password before saving
    const hashedPassword = password ? await bcrypt.hash(password, 10) : null;

    // Insert Query
    const query = `
      INSERT INTO Employees (employeeId, name, role, email, password, employeeGroup, status)
      VALUES (@employeeId, @name, @role, @email, @password, @employeeGroup, @status)
    `;

    // Execute with parameters
    await executeQuery(query, [
      { name: 'employeeId', type: sql.UniqueIdentifier, value: employeeId },
      { name: 'name', type: sql.NVarChar(100), value: name },
      { name: 'role', type: sql.NVarChar(50), value: role || null },
      { name: 'email', type: sql.NVarChar(100), value: email },
      { name: 'password', type: sql.NVarChar(255), value: hashedPassword || null },  // ✅ hash before saving in prod
      { name: 'employeeGroup', type: sql.NVarChar(50), value: employeeGroup || null },
      { name: 'status', type: sql.NVarChar(20), value: status || 'active' },
    ]);

    res.status(201).json({
      message: 'Employee created successfully',
      employeeId,
    });
  } catch (err) {
    console.error('❌ Error creating employee:', err);
    res.status(500).json({ error: 'Failed to create employee', details: err.message });
  }
});

// UPDATE Employee
router.put('/api/employees/:id', async (req, res) => {
  const { id } = req.params;
  const { name, role, email, password, employeeGroup, status } = req.body;

  try {
    // Check if another employee (different ID) already uses the email
    const checkEmail = await pool.request()
      .input('email', sql.NVarChar, email)
      .input('employeeId', sql.UniqueIdentifier, id)
      .query(`
        SELECT employeeId 
        FROM Employees 
        WHERE email = @email AND employeeId != @employeeId
      `);

    if (checkEmail.recordset.length > 0) {
      return res.status(400).json({ error: "Email is already in use by another employee." });
    }

    // Encrypt password if provided
    let encryptedPassword = null;
    if (password) {
      const saltRounds = 10;
      encryptedPassword = await bcrypt.hash(password, saltRounds);
    }

    // Update employee record
    const result = await pool.request()
      .input('employeeId', sql.UniqueIdentifier, id)
      .input('name', sql.NVarChar, name)
      .input('role', sql.NVarChar, role)
      .input('email', sql.NVarChar, email)
      .input('password', sql.NVarChar, encryptedPassword)
      .input('employeeGroup', sql.NVarChar, employeeGroup)
      .input('status', sql.NVarChar, status)
      .query(`
        UPDATE Employees
        SET 
          name = @name,
          role = @role,
          email = @email,
          ${password ? "password = @password," : ""}
          employeeGroup = @employeeGroup,
          status = @status
        WHERE employeeId = @employeeId
      `);

    if (result.rowsAffected[0] === 0) {
      return res.status(404).json({ error: "Employee not found." });
    }

    res.status(200).json({ message: "Employee updated successfully." });
  } catch (error) {
    console.error("Error updating employee:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});


// DELETE Employee
router.delete('/api/employees/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const query = `DELETE FROM Employees WHERE employeeId = @employeeId`;

    await executeQuery(query, [
      { name: 'employeeId', type: sql.UniqueIdentifier, value: id },
    ]);

    res.json({ message: 'Employee deleted successfully' });
  } catch (err) {
    console.error('❌ Error deleting employee:', err);
    res.status(500).json({ error: 'Failed to delete employee', details: err.message });
  }
});


// Defects Endpoint
router.get('/api/defects', async (req, res) => {
  try {
    const defects = await executeQuery('SELECT * FROM Defects');
    res.json(defects);
  } catch (err) {
    console.error('Error fetching defects:', err);
    res.status(500).json([]); // Return empty array on error
  }
});


// Changeover Matrix Endpoint (Placeholder)
router.get('/api/changeover', async (req, res) => {
  try {
    const matrices = await executeQuery('SELECT * FROM ChangeoverMatrix');
    res.json(matrices);
  } catch (err) {
    console.error('Error fetching changeover matrices:', err);
    res.status(500).json([]); // Return empty array on error
  }
});


// ========================================================= DOWNTIME TAB =====================================

// =================== GET /api/pdi ===================
router.get('/api/pdi', async (req, res) => {
  try {
    const poolConn = await pool.connect();

    const query = `
      SELECT 
        p.id AS pdiId,
        p.new_id AS new_pdiId,
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
      LEFT JOIN PDI_CorrectiveActions ca ON ca.new_pdiId = p.new_id
      LEFT JOIN PDI_PreventiveActions pa ON pa.new_pdiId = p.new_id
      ORDER BY p.id DESC
    `;

    const result = await poolConn.request().query(query);

    // Group results by PDI
    const pdiMap = {};

    result.recordset.forEach(row => {
      if (!pdiMap[row.pdiId]) {
        pdiMap[row.pdiId] = {
          id: row.pdiId,
          new_pdiId: row.new_pdiId,
          productionCode: row.productionCode,
          product: row.product,
          date: row.date,
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
          action: row.correctiveAction,
          responsible: row.correctiveResponsible,
          dueDate: row.correctiveDueDate
        });
      }

      if (row.preventiveAction) {
        pdiMap[row.pdiId].preventiveActions.push({
          action: row.preventiveAction,
          responsible: row.preventiveResponsible,
          dueDate: row.preventiveDueDate
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
  const transaction = new sql.Transaction(pool);

  try {
    const {
      productionCode, product, date, shift, defectName, quantity, inspector,
      status = 'Open', severity,
      correctiveActions, preventiveActions
    } = req.body;

    const uuid = require('crypto').randomUUID(); // Generate new_id

    await transaction.begin();

    // 1️⃣ Insert PDI entry
    const pdiRequest = new sql.Request(transaction);
    pdiRequest.input('new_id', sql.UniqueIdentifier, uuid);
    pdiRequest.input('productionCode', sql.VarChar, productionCode);
    pdiRequest.input('product', sql.VarChar, product);
    pdiRequest.input('date', sql.Date, date);
    pdiRequest.input('shift', sql.VarChar, shift);
    pdiRequest.input('defectName', sql.VarChar, defectName);
    pdiRequest.input('quantity', sql.Int, quantity);
    pdiRequest.input('inspector', sql.VarChar, inspector);
    pdiRequest.input('status', sql.VarChar, status);
    pdiRequest.input('severity', sql.VarChar, severity);

    const pdiInsertQuery = `
      INSERT INTO PDI (new_id, productionCode, product, date, shift, defectName, quantity, inspector, status, severity)
      OUTPUT INSERTED.id, INSERTED.new_id
      VALUES (@new_id, @productionCode, @product, @date, @shift, @defectName, @quantity, @inspector, @status, @severity)
    `;
    const pdiResult = await pdiRequest.query(pdiInsertQuery);
    const pdiId = pdiResult.recordset[0]?.id;
    const new_pdiId = pdiResult.recordset[0]?.new_id;

    console.log("pdiId:", pdiId, "new_pdiId:", new_pdiId);

    if (!pdiId) throw new Error('Failed to insert PDI entry');

    // 2️⃣ Insert corrective actions
    for (const action of correctiveActions || []) {
      const correctiveReq = new sql.Request(transaction);
      correctiveReq.input('pdiId', sql.Int, pdiId);
      correctiveReq.input('new_pdiId', sql.UniqueIdentifier, new_pdiId);
      correctiveReq.input('action', sql.NVarChar(sql.MAX), action.action);
      correctiveReq.input('responsible', sql.VarChar, action.responsible);
      correctiveReq.input('dueDate', sql.Date, action.dueDate);

      await correctiveReq.query(`
        INSERT INTO PDI_CorrectiveActions (pdiId, new_pdiId, action, responsible, dueDate)
        VALUES (@pdiId, @new_pdiId, @action, @responsible, @dueDate)
      `);
    }

    // 3️⃣ Insert preventive actions
    for (const action of preventiveActions || []) {
      const preventiveReq = new sql.Request(transaction);
      preventiveReq.input('pdiId', sql.Int, pdiId);
      preventiveReq.input('new_pdiId', sql.UniqueIdentifier, new_pdiId);
      preventiveReq.input('action', sql.NVarChar(sql.MAX), action.action);
      preventiveReq.input('responsible', sql.VarChar, action.responsible);
      preventiveReq.input('dueDate', sql.Date, action.dueDate);

      await preventiveReq.query(`
        INSERT INTO PDI_PreventiveActions (pdiId, new_pdiId, action, responsible, dueDate)
        VALUES (@pdiId, @new_pdiId, @action, @responsible, @dueDate)
      `);
    }

    // 4️⃣ Auto-create a Task if defectName is provided
    if (defectName && defectName.trim() !== '') {
      const taskId = `TASK-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`;
      const taskReq = new sql.Request(transaction);

      taskReq.input('id', sql.VarChar, taskId);
      taskReq.input('productionCode', sql.VarChar, productionCode || null);
      taskReq.input('taskType', sql.VarChar, 'pdi-defect');
      taskReq.input('title', sql.VarChar, `PDI Defect: ${defectName}`);
      taskReq.input('description', sql.NVarChar(sql.MAX), `Defect found during PDI for product ${product} in shift ${shift}.`);
      taskReq.input('priority', sql.VarChar, severity?.toLowerCase() === 'high' ? 'high' : 'medium');
      taskReq.input('assignedTo', sql.VarChar, inspector || null);
      taskReq.input('dueDate', sql.Date, date);
      taskReq.input('status', sql.VarChar, 'pending');
      taskReq.input('createdFrom', sql.VarChar, 'pdi');
      taskReq.input('rejectionReason', sql.NVarChar(sql.MAX), null);
      taskReq.input('quantity', sql.Int, quantity || null);
      taskReq.input('maintenanceType', sql.VarChar, null);
      taskReq.input('equipment', sql.VarChar, null);

      await taskReq.query(`
        INSERT INTO Tasks (
          id, productionCode, taskType, title, description, priority, assignedTo, dueDate,
          status, createdFrom, rejectionReason, quantity, maintenanceType, equipment
        )
        VALUES (
          @id, @productionCode, @taskType, @title, @description, @priority, @assignedTo, @dueDate,
          @status, @createdFrom, @rejectionReason, @quantity, @maintenanceType, @equipment
        )
      `);
    }

    await transaction.commit();
    res.status(201).json({ message: 'PDI entry (and task if defect) added successfully', pdiId, new_pdiId });

  } catch (err) {
    try { await transaction.rollback(); } catch {}
    console.error('Error adding PDI entry or task:', err);
    res.status(500).json({ error: 'Failed to add PDI entry' });
  }
});

router.get('/api/production-codes', async (req, res) => {
  try {
    const codes = await executeQuery('SELECT code FROM ProductionCodes');
    res.json(codes.map(c => c.code));
  } catch (err) {
    console.error('Error fetching production codes:', err);
    res.status(500).json([]);
  }
});

router.get('/api/tasks', async (req, res) => {
  try {
    // Fetch tasks
    const taskQuery = `
      SELECT taskId, productionCode, taskType, title, description, priority, assignedTo, dueDate, 
             status, createdFrom, rejectionReason, quantity, maintenanceType, equipment,
             progress, statusComments, rootCause, impactAssessment, recurrenceRisk, lessonsLearned
      FROM Tasks
    `;
    const tasks = await executeQuery(taskQuery);

    // Fetch actions for each task
    const taskData = await Promise.all(tasks.map(async (task) => {
      const correctiveQuery = 'SELECT action, responsible, dueDate FROM Task_CorrectiveActions WHERE taskId = @taskId';
      const preventiveQuery = 'SELECT action, responsible, dueDate FROM Task_PreventiveActions WHERE taskId = @taskId';
      const correctiveActions = await executeQuery(correctiveQuery, [{ name: 'taskId', type: sql.VarChar, value: task.id }]);
      const preventiveActions = await executeQuery(preventiveQuery, [{ name: 'taskId', type: sql.VarChar, value: task.id }]);
      return {
        ...task,
        correctiveActions,
        preventiveActions,
      };
    }));

    res.json(taskData);
  } catch (err) {
    console.error('Error fetching tasks:', err);
    res.status(500).json([]);
  }
});

// ✅ Create Task API
// router.post('/api/tasks', async (req, res) => {
//   try {
//     const {
//       title,
//       taskType,
//       priority,
//       assignedTo,
//       dueDate,
//       productionCode,
//       description,
//       rejectionReason,
//       quantity,
//       maintenanceType,
//       equipment
//     } = req.body;

//     // Generate unique task ID: TASK-YYYYMMDD-Random
//  // Instead of using taskId as VARCHAR
// // use GUID for taskId and store TaskCode separately
// const taskId = sql.UniqueIdentifier(); // generated by SQL
// const date = new Date().toISOString().slice(0, 10).replace(/-/g, '');
// const random = Math.floor(1000 + Math.random() * 9000);
// // const taskCode = `TASK-${date}-${random}`;

// const taskQuery = `
//   INSERT INTO Tasks 
//   (taskId, ProductionCode, TaskType, Title, Description, Priority, AssignedTo, DueDate, Status, CreatedFrom, RejectionReason, Quantity, MaintenanceType, Equipment)
//   VALUES 
//   (NEWID(), @ProductionCode, @TaskType, @Title, @Description, @Priority, @AssignedTo, @DueDate, @Status, @CreatedFrom, @RejectionReason, @Quantity, @MaintenanceType, @Equipment)
// `;

// await executeQuery(taskQuery, [
//   // { name: 'TaskCode', type: sql.VarChar, value: taskCode },
//   { name: 'ProductionCode', type: sql.UniqueIdentifier, value: productionCode || null },
//   { name: 'TaskType', type: sql.VarChar, value: taskType },
//   { name: 'Title', type: sql.VarChar, value: title },
//   { name: 'Description', type: sql.VarChar, value: description || '' },
//   { name: 'Priority', type: sql.VarChar, value: priority },
//   { name: 'AssignedTo', type: sql.UniqueIdentifier, value: assignedTo },
//   { name: 'DueDate', type: sql.Date, value: dueDate },
//   { name: 'Status', type: sql.VarChar, value: 'pending' },
//   { name: 'CreatedFrom', type: sql.VarChar, value: taskType === 'maintenance' ? 'manual' : 'production' },
//   { name: 'RejectionReason', type: sql.VarChar, value: rejectionReason || null },
//   { name: 'Quantity', type: sql.Int, value: quantity || null },
//   { name: 'MaintenanceType', type: sql.VarChar, value: maintenanceType || null },
//   { name: 'Equipment', type: sql.VarChar, value: equipment || null },
// ]);

//     res.status(201).json({ message: 'Task created successfully', taskId });
//   } catch (err) {
//     console.error('❌ Error creating task:', err);
//     res.status(500).json({ error: 'Failed to create task', details: err.message });
//   }
// });

router.post('/api/tasks', async (req, res) => {
  try {
    const {
      title, taskType, priority, assignedTo, dueDate, productionCode,
      description, rejectionReason, quantity, maintenanceType, equipment
    } = req.body;

    const taskId = uuidv4(); // ✅ generate GUID
    const taskQuery = `
      INSERT INTO Tasks 
      (taskId, ProductionCode, TaskType, Title, Description, Priority, AssignedTo, DueDate, Status,
       CreatedFrom, RejectionReason, Quantity, MaintenanceType, Equipment)
      VALUES 
      (@taskId, @ProductionCode, @TaskType, @Title, @Description, @Priority, @AssignedTo, @DueDate, 
       @Status, @CreatedFrom, @RejectionReason, @Quantity, @MaintenanceType, @Equipment)
    `;

    await executeQuery(taskQuery, [
      { name: 'taskId', type: sql.UniqueIdentifier, value: taskId },
      { name: 'ProductionCode', type: sql.UniqueIdentifier, value: productionCode || null },
      { name: 'TaskType', type: sql.VarChar, value: taskType },
      { name: 'Title', type: sql.VarChar, value: title },
      { name: 'Description', type: sql.NVarChar(sql.MAX), value: description || '' },
      { name: 'Priority', type: sql.VarChar, value: priority },
      { name: 'AssignedTo', type: sql.VarChar(100), value: assignedTo || null }, // ✅ decide if GUID or string
      { name: 'DueDate', type: sql.DateTime, value: dueDate ? new Date(dueDate) : null },
      { name: 'Status', type: sql.VarChar, value: 'pending' },
      { name: 'CreatedFrom', type: sql.VarChar, value: taskType === 'maintenance' ? 'manual' : 'production' },
      { name: 'RejectionReason', type: sql.NVarChar(sql.MAX), value: rejectionReason || null },
      { name: 'Quantity', type: sql.Int, value: quantity || null },
      { name: 'MaintenanceType', type: sql.VarChar, value: maintenanceType || null },
      { name: 'Equipment', type: sql.VarChar, value: equipment || null },
    ]);

    res.status(201).json({ message: 'Task created successfully', taskId });
  } catch (err) {
    console.error('❌ Error creating task:', err);
    res.status(500).json({ error: 'Failed to create task', details: err.message });
  }
});


// router.put('/api/tasks/:id', async (req, res) => {
//   try {
//     const { id } = req.params;
//     const {
//       status, progress, statusComments, rootCause, impactAssessment, recurrenceRisk, lessonsLearned,
//       correctiveActions, preventiveActions
//     } = req.body;

//     // Update task
//     const taskQuery = `
//       UPDATE Tasks
//       SET status = @status, progress = @progress, statusComments = @statusComments,
//           rootCause = @rootCause, impactAssessment = @impactAssessment,
//           recurrenceRisk = @recurrenceRisk, lessonsLearned = @lessonsLearned
//       WHERE id = @id
//     `;
//     await executeQuery(taskQuery, [
//       { name: 'id', type: sql.VarChar, value: id },
//       { name: 'status', type: sql.VarChar, value: status },
//       { name: 'progress', type: sql.Int, value: progress || null },
//       { name: 'statusComments', type: sql.Text, value: statusComments || null },
//       { name: 'rootCause', type: sql.Text, value: rootCause || null },
//       { name: 'impactAssessment', type: sql.VarChar, value: impactAssessment || null },
//       { name: 'recurrenceRisk', type: sql.VarChar, value: recurrenceRisk || null },
//       { name: 'lessonsLearned', type: sql.Text, value: lessonsLearned || null },
//     ]);

//     // Delete existing actions
//     await executeQuery('DELETE FROM Task_CorrectiveActions WHERE taskId = @taskId', [
//       { name: 'taskId', type: sql.VarChar, value: id },
//     ]);
//     await executeQuery('DELETE FROM Task_PreventiveActions WHERE taskId = @taskId', [
//       { name: 'taskId', type: sql.VarChar, value: id },
//     ]);

//     // Insert new corrective actions
//     for (const action of correctiveActions) {
//       const correctiveQuery = `
//         INSERT INTO Task_CorrectiveActions (taskId, action, responsible, dueDate)
//         VALUES (@taskId, @action, @responsible, @dueDate)
//       `;
//       await executeQuery(correctiveQuery, [
//         { name: 'taskId', type: sql.VarChar, value: id },
//         { name: 'action', type: sql.Text, value: action.action },
//         { name: 'responsible', type: sql.VarChar, value: action.responsible },
//         { name: 'dueDate', type: sql.Date, value: action.dueDate },
//       ]);
//     }

//     // Insert new preventive actions
//     for (const action of preventiveActions) {
//       const preventiveQuery = `
//         INSERT INTO Task_PreventiveActions (taskId, action, responsible, dueDate)
//         VALUES (@taskId, @action, @responsible, @dueDate)
//       `;
//       await executeQuery(preventiveQuery, [
//         { name: 'taskId', type: sql.VarChar, value: id },
//         { name: 'action', type: sql.Text, value: action.action },
//         { name: 'responsible', type: sql.VarChar, value: action.responsible },
//         { name: 'dueDate', type: sql.Date, value: action.dueDate },
//       ]);
//     }

//     res.json({ message: 'Task updated successfully' });
//   } catch (err) {
//     console.error('Error updating task:', err);
//     res.status(500).json({ error: 'Failed to update task' });
//   }
// });

// router.delete('/api/tasks/:id', async (req, res) => {
//   try {
//     const { id } = req.params;
//     await executeQuery('DELETE FROM Tasks WHERE id = @id', [
//       { name: 'id', type: sql.VarChar, value: id },
//     ]);
//     res.json({ message: 'Task deleted successfully' });
//   } catch (err) {
//     console.error('Error deleting task:', err);
//     res.status(500).json({ error: 'Failed to delete task' });
//   }
// });

router.put('/api/tasks/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const {
      status, progress, statusComments, rootCause, impactAssessment, recurrenceRisk, lessonsLearned,
      correctiveActions, preventiveActions
    } = req.body;

    const taskQuery = `
      UPDATE Tasks
      SET status = @status, progress = @progress, statusComments = @statusComments,
          rootCause = @rootCause, impactAssessment = @impactAssessment,
          recurrenceRisk = @recurrenceRisk, lessonsLearned = @lessonsLearned
      WHERE taskId = @taskId
    `;
    await executeQuery(taskQuery, [
      { name: 'taskId', type: sql.UniqueIdentifier, value: id },
      { name: 'status', type: sql.VarChar(50), value: status },
      { name: 'progress', type: sql.Int, value: progress || null },
      { name: 'statusComments', type: sql.NVarChar(sql.MAX), value: statusComments || null },
      { name: 'rootCause', type: sql.NVarChar(sql.MAX), value: rootCause || null },
      { name: 'impactAssessment', type: sql.NVarChar(255), value: impactAssessment || null },
      { name: 'recurrenceRisk', type: sql.NVarChar(100), value: recurrenceRisk || null },
      { name: 'lessonsLearned', type: sql.NVarChar(sql.MAX), value: lessonsLearned || null },
    ]);

    // Delete old actions
    await executeQuery('DELETE FROM Task_CorrectiveActions WHERE taskId = @taskId', [
      { name: 'taskId', type: sql.UniqueIdentifier, value: id },
    ]);
    await executeQuery('DELETE FROM Task_PreventiveActions WHERE taskId = @taskId', [
      { name: 'taskId', type: sql.UniqueIdentifier, value: id },
    ]);

    // Insert corrective actions
    for (const action of correctiveActions || []) {
      await executeQuery(`
        INSERT INTO Task_CorrectiveActions (taskId, Action, Responsible, DueDate)
        VALUES (@taskId, @Action, @Responsible, @DueDate)
      `, [
        { name: 'taskId', type: sql.UniqueIdentifier, value: id },
        { name: 'Action', type: sql.NVarChar(sql.MAX), value: action.action },
        { name: 'Responsible', type: sql.NVarChar(100), value: action.responsible },
        { name: 'DueDate', type: sql.Date, value: action.dueDate ? new Date(action.dueDate) : null },
      ]);
    }

    // Insert preventive actions
    for (const action of preventiveActions || []) {
      await executeQuery(`
        INSERT INTO Task_PreventiveActions (taskId, Action, Responsible, DueDate)
        VALUES (@taskId, @Action, @Responsible, @DueDate)
      `, [
        { name: 'taskId', type: sql.UniqueIdentifier, value: id },
        { name: 'Action', type: sql.NVarChar(sql.MAX), value: action.action },
        { name: 'Responsible', type: sql.NVarChar(100), value: action.responsible },
        { name: 'DueDate', type: sql.Date, value: action.dueDate ? new Date(action.dueDate) : null },
      ]);
    }

    res.json({ message: 'Task updated successfully' });
  } catch (err) {
    console.error('❌ Error updating task:', err);
    res.status(500).json({ error: 'Failed to update task' });
  }
});

router.delete('/api/tasks/:id', async (req, res) => {
  try {
    const { id } = req.params;

    // delete children first (or rely on ON DELETE CASCADE)
    await executeQuery('DELETE FROM Task_CorrectiveActions WHERE taskId = @taskId', [
      { name: 'taskId', type: sql.UniqueIdentifier, value: id },
    ]);
    await executeQuery('DELETE FROM Task_PreventiveActions WHERE taskId = @taskId', [
      { name: 'taskId', type: sql.UniqueIdentifier, value: id },
    ]);

    // delete task
    await executeQuery('DELETE FROM Tasks WHERE taskId = @taskId', [
      { name: 'taskId', type: sql.UniqueIdentifier, value: id },
    ]);

    res.json({ message: 'Task deleted successfully' });
  } catch (err) {
    console.error('❌ Error deleting task:', err);
    res.status(500).json({ error: 'Failed to delete task' });
  }
});


router.get('/api/teams', async (req, res) => {
  try {
    const teams = await executeQuery('SELECT name FROM Teams');
    res.json(teams.map(t => t.name));
  } catch (err) {
    console.error('Error fetching teams:', err);
    res.status(500).json([]);
  }
});

// Get all MOMs with their Action Items
router.get('/api/mom', async (req, res) => {
  try {
    const pool = await sql.connect(dbConfig);

    // Fetch MOMs
    const momsResult = await pool.request().query(`
      SELECT momId, Title, MeetingDate, Department, Status, Attendees, Summary, Decisions
      FROM MOM
      ORDER BY MeetingDate DESC
    `);

    const moms = momsResult.recordset;

    // Fetch all Action Items
    const actionsResult = await pool.request().query(`
      SELECT ActionId, momId, Description, AssignedTo, DueDate
      FROM MOM_ActionItems
    `);

    const actions = actionsResult.recordset;

    // Group action items by momId
    const momsWithActions = moms.map(mom => ({
      ...mom,
      actionItems: actions.filter(a => a.momId === mom.momId)
    }));

    res.json(momsWithActions);
  } catch (err) {
    console.error('Error fetching MOMs:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// (Optional) Get single MOM by ID
router.get('/api/mom/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const pool = await sql.connect(dbConfig);

    const momResult = await pool.request()
      .input('momId', sql.UniqueIdentifier, id)
      .query(`
        SELECT momId, Title, MeetingDate, Department, Status, Attendees, Summary, Decisions
        FROM MOM
        WHERE momId = @momId
      `);

    if (momResult.recordset.length === 0) {
      return res.status(404).json({ success: false, error: 'MOM not found' });
    }

    const mom = momResult.recordset[0];

    const actionsResult = await pool.request()
      .input('momId', sql.UniqueIdentifier, id)
      .query(`
        SELECT ActionId, momId, Description, AssignedTo, DueDate
        FROM MOM_ActionItems
        WHERE momId = @momId
      `);

    res.json({
      ...mom,
      actionItems: actionsResult.recordset
    });
  } catch (err) {
    console.error('Error fetching MOM by ID:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});


// Create MOM + Action Items
router.post('/api/mom', async (req, res) => {
  const pool = await sql.connect(dbConfig);
  const { title, meetingDate, department, status, attendees, summary, decisions, actionItems } = req.body;

  try {
    const momId = require('crypto').randomUUID();

    // Insert MOM
    await pool.request()
      .input('momId', sql.UniqueIdentifier, momId)
      .input('Title', sql.NVarChar, title)
      .input('MeetingDate', sql.Date, meetingDate)
      .input('Department', sql.NVarChar, department)
      .input('Status', sql.NVarChar, status)
      .input('Attendees', sql.NVarChar, attendees)
      .input('Summary', sql.NVarChar, summary)
      .input('Decisions', sql.NVarChar, decisions)
      .query(`
        INSERT INTO MOM (momId, Title, MeetingDate, Department, Status, Attendees, Summary, Decisions)
        VALUES (@momId, @Title, @MeetingDate, @Department, @Status, @Attendees, @Summary, @Decisions)
      `);

    // ✅ Only insert Action Items if they exist and are not empty
    if (Array.isArray(actionItems)) {
      for (const item of actionItems) {
        if (item.description?.trim()) {   // check only if description is filled
          await pool.request()
            .input('ActionId', sql.UniqueIdentifier, require('crypto').randomUUID())
            .input('momId', sql.UniqueIdentifier, momId)
            .input('Description', sql.NVarChar, item.description)
            .input('AssignedTo', sql.NVarChar, item.assignedTo || null)
            .input('DueDate', sql.Date, item.dueDate || null)
            .query(`
              INSERT INTO MOM_ActionItems (ActionId, momId, Description, AssignedTo, DueDate)
              VALUES (@ActionId, @momId, @Description, @AssignedTo, @DueDate)
            `);
        }
      }
    }

    res.json({ success: true, momId });
  } catch (err) {
    console.error('Error creating MOM:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});


app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});