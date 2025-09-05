import express from "express";
import sql from "mssql";
import { v4 as uuidv4 } from "uuid";
import { poolPromise } from "../db.js";
import executeQuery from "../utils/helper.js";
import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

// =========================== GET: Fetch Production Records ==========================
router.get("/production", authMiddleware, async (req, res) => {
  try {
    const {
      search,
      date,
      shift,
      status,
      productionType,
      page = 1,
      limit = 20,
    } = req.query;

    let filters = " WHERE 1=1";
    const params = [];

    if (search) {
      filters +=
        " AND (recordId LIKE @search OR Product LIKE @search OR MachineName LIKE @search)";
      params.push({ name: "search", type: sql.VarChar, value: `%${search}%` });
    }
    if (date) {
      filters += " AND CAST(Date AS DATE) = @date";
      params.push({ name: "date", type: sql.Date, value: date });
    }
    if (shift && shift !== "all") {
      filters += " AND Shift = @shift";
      params.push({ name: "shift", type: sql.VarChar(10), value: shift });
    }
    if (status && status !== "all") {
      filters += " AND Status = @status";
      params.push({ name: "status", type: sql.VarChar(20), value: status });
    }
    if (productionType && productionType !== "all") {
      filters += " AND ProductionType = @productionType";
      params.push({
        name: "productionType",
        type: sql.VarChar(50),
        value: productionType,
      });
    }

    // Pagination
    const pageNum = Math.max(parseInt(page, 10), 1);
    const limitNum = Math.min(Math.max(parseInt(limit, 10), 10), 100); // Limit between 10 and 100
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

    res.json({
      message: "Production records fetched successfully",
      data: { records, total, page: pageNum, limit: limitNum },
    });
  } catch (err) {
    console.error("❌ Error fetching production records:", err);
    res.status(500).json({
      message: "Failed to fetch production records",
      error:
        process.env.NODE_ENV === "development"
          ? err.message
          : "Internal server error",
    });
  }
});

router.post("/production", async (req, res) => {
  const pool = await poolPromise;
  const transaction = new sql.Transaction(pool);

  try {
    const {
      productionCode,
      productionType,
      date,
      shift,
      machineName,
      product,
      plannedQty,
      actualQty,
      rejectedQty,
      lumpsQty,
      lumpsReason,
      rejectionType,
      rejectionReason,
      downtimeType,
      downtime,
      defectType,
      targetOutput,
      plannedMins,
      operator,
      supervisor,
      status,
      efficiency,
      customRejectionType,
      customDefectType,
      customDowntimeType,
      team,
    } = req.body;

    console.log("Recieved PRoduction entry", req.body);

    // ✅ 1. Validation before transaction.begin()
    // (your existing validation logic...)

    const recordId = uuidv4();

    await transaction.begin();
    const request = new sql.Request(transaction);

    // ✅ 2. Inputs (use correct types based on schema!)
    request.input("recordId", sql.UniqueIdentifier, recordId);
    request.input("productionType", sql.VarChar(50), productionType || null);
    request.input("date", sql.DateTime, new Date(date));
    request.input("shift", sql.VarChar(10), shift || null);
    request.input("machineName", sql.VarChar(50), machineName || null);
    request.input("product", sql.VarChar(100), product || null);
    request.input("plannedQty", sql.Int, Number(plannedQty) || 0);
    request.input("actualQty", sql.Int, Number(actualQty) || 0);
    request.input("rejectedQty", sql.Int, Number(rejectedQty) || 0);
    request.input("lumpsQty", sql.Int, Number(lumpsQty) || 0);
    request.input("lumpsReason", sql.NVarChar(sql.MAX), lumpsReason || null);

    // Custom fields handling
    const rejectionLabel =
      rejectionType === "other" ? customRejectionType : rejectionType;
    const defectLabel = defectType === "other" ? customDefectType : defectType;
    const downtimeLabel =
      downtimeType === "other" ? customDowntimeType : downtimeType;

    request.input("rejectionType", sql.VarChar(50), rejectionLabel || null);
    request.input(
      "rejectionReason",
      sql.NVarChar(sql.MAX),
      rejectionReason || null
    );
    request.input("downtimeType", sql.VarChar(50), downtimeLabel || null);
    request.input("downtime", sql.Int, Number(downtime) || 0);
    request.input("defectType", sql.VarChar(50), defectLabel || null);

    request.input("targetOutput", sql.Int, Number(targetOutput) || 0);
    request.input("plannedMins", sql.Int, Number(plannedMins) || 0);
    request.input("operator", sql.VarChar(100), operator || null); // ✅ Adjust if GUID
    request.input("supervisor", sql.VarChar(100), supervisor || null);
    request.input("assignedTeam", sql.VarChar(50), team || null);

    request.input(
      "status",
      sql.VarChar(20),
      (status || "pending").toLowerCase()
    );
    request.input("efficiency", sql.Decimal(18, 2), Number(efficiency) || 0);
    request.input("productionCode", sql.VarChar(50), productionCode || null);
    request.input(
      "customRejectionType",
      sql.VarChar(100),
      customRejectionType || null
    );
    request.input(
      "customDefectType",
      sql.VarChar(100),
      customDefectType || null
    );
    request.input(
      "customDowntimeType",
      sql.VarChar(100),
      customDowntimeType || null
    );

    // ✅ 3. Insert query
    const insertProductionQuery = `
      INSERT INTO ProductionRecords (
        recordId, productionType, date, shift, machineName, product, plannedQty, actualQty,
        rejectedQty, lumpsQty, lumpsReason, rejectionType, rejectionReason, downtimeType,
        downtime, defectType, targetOutput, plannedMins, operator, supervisor,assignedTeam, status, efficiency,
        productionCode, customRejectionType, customDefectType, customDowntimeType
      )
      VALUES (
        @recordId, @productionType, @date, @shift, @machineName, @product, @plannedQty, @actualQty,
        @rejectedQty, @lumpsQty, @lumpsReason, @rejectionType, @rejectionReason, @downtimeType,
        @downtime, @defectType, @targetOutput, @plannedMins, @operator, @supervisor,@assignedTeam, @status, @efficiency,
        @productionCode, @customRejectionType, @customDefectType, @customDowntimeType
      )
    `;
    await request.query(insertProductionQuery);

    // Create task if defectType exists OR rejectedQty > 0
    let createdTask = null;
    if ((defectType && defectType.trim()) || (rejectedQty && rejectedQty > 0)) {
      const taskId = uuidv4();
      const assignedTo = operator?.trim() || null;

      const taskRequest = new sql.Request(transaction);
      taskRequest.input("taskId", sql.UniqueIdentifier, taskId);
      taskRequest.input(
        "productionCode",
        sql.VarChar(50),
        productionCode || recordId
      );
      taskRequest.input(
        "taskType",
        sql.VarChar(50),
        defectType ? "defect" : "rejection"
      );
      taskRequest.input(
        "title",
        sql.VarChar(200),
        defectType ? `Production Defect: ${defectType}` : `Production Rejection`
      );
      taskRequest.input(
        "description",
        sql.NVarChar(sql.MAX),
        defectType
          ? `Defect detected in production for product ${
              product || "N/A"
            } on machine ${machineName || "N/A"}.`
          : `Rejected quantity (${rejectedQty}) reported for product ${
              product || "N/A"
            } on machine ${machineName || "N/A"}.`
      );
      taskRequest.input("priority", sql.VarChar(20), "high");
      taskRequest.input("assignedTo", sql.VarChar(100), assignedTo);
      taskRequest.input("dueDate", sql.DateTime, date ? new Date(date) : null);
      taskRequest.input("status", sql.VarChar(20), "pending");
      taskRequest.input("createdFrom", sql.VarChar(50), "production");
      taskRequest.input(
        "rejectionReason",
        sql.NVarChar(sql.MAX),
        rejectionReason || null
      );
      taskRequest.input("quantity", sql.Int, rejectedQty ?? 0);
      taskRequest.input("maintenanceType", sql.VarChar(50), null);
      taskRequest.input("equipment", sql.VarChar(50), machineName || null);
      taskRequest.input("assignedTeam", sql.VarChar(50), team || null);

      await taskRequest.query(`
    INSERT INTO Tasks (
      taskId, productionCode, taskType, title, description, priority, assignedTo, dueDate, status,
      createdFrom, rejectionReason, quantity, maintenanceType, equipment, assignedTeam
    ) VALUES (
      @taskId, @productionCode, @taskType, @title, @description, @priority, @assignedTo, @dueDate,
      @status, @createdFrom, @rejectionReason, @quantity, @maintenanceType, @equipment, @assignedTeam
    )
  `);

      createdTask = {
        taskId,
        defectType,
        rejectedQty,
        assignedTo,
        status: "pending",
      };
    }

    await transaction.commit();

    res.status(201).json({
      message: "Production record added successfully",
      recordId,
    });
    console.log(
      "✅ Production record inserted",
      recordId,
      createdTask ? `with Task ${createdTask.taskId}` : ""
    );
  } catch (err) {
    console.error("❌ SQL ERROR inside transaction:", err);
    if (transaction._aborted !== true) {
      await transaction.rollback();
      console.error("✅ Transaction rolled back");
    }
    res.status(500).json({
      message: "Failed to add production record",
      error:
        process.env.NODE_ENV === "development"
          ? err.message
          : "Internal server error",
    });
  }
});

export default router;
