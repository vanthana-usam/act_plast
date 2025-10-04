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
    const { search, date, shift, status, productionType, page = "1", limit = "20" } = req.query;

    const pageNum = Math.max(parseInt(page, 10), 1);
    const limitNum = Math.min(Math.max(parseInt(limit, 10), 10), 100);
    const offset = (pageNum - 1) * limitNum;

    let filters = " WHERE 1=1";
    const params = [];

    if (search) {
      filters +=
        " AND (pr.recordId LIKE @search OR pr.product LIKE @search OR pr.machineName LIKE @search OR pr.productionCode LIKE @search)";
      params.push({ name: "search", type: sql.NVarChar(100), value: `%${search}%` });
    }
    if (date) {
      filters += " AND CAST(pr.date AS DATE) = @date";
      params.push({ name: "date", type: sql.Date, value: date });
    }
    if (shift && shift !== "all") {
      filters += " AND pr.shift = @shift";
      params.push({ name: "shift", type: sql.NVarChar(10), value: shift });
    }
    if (status && status !== "all") {
      filters += " AND pr.status = @status";
      params.push({ name: "status", type: sql.NVarChar(20), value: status });
    }
    if (productionType && productionType !== "all") {
      filters += " AND pr.productionType = @productionType";
      params.push({ name: "productionType", type: sql.NVarChar(50), value: productionType });
    }

    const productionQuery = `
      SELECT pr.*
      FROM ProductionRecords pr
      ${filters}
      ORDER BY pr.date DESC
      OFFSET @offset ROWS FETCH NEXT @limitNum ROWS ONLY
    `;
    params.push({ name: "offset", type: sql.Int, value: offset }, { name: "limitNum", type: sql.Int, value: limitNum });

    const records = await executeQuery(productionQuery, params);

    const recordIds = records.map(r => r.recordId);
    let rejectionEntries = [];
    let downtimeEntries = [];
    let rejectionCorrectiveActions = [];
    let downtimeCorrectiveActions = [];

    if (recordIds.length > 0) {
      // Rejection Entries
      const rejectionQuery = `
        SELECT entryId, recordId, rejectionType, quantity, reason
        FROM RejectionEntries
        WHERE recordId IN (${recordIds.map((_, i) => `@recordId${i}`).join(", ")})
      `;
      const rejectionParams = recordIds.map((id, i) => ({ name: `recordId${i}`, type: sql.UniqueIdentifier, value: id }));
      rejectionEntries = await executeQuery(rejectionQuery, rejectionParams);

      // Corrective actions for rejections
      const rejectionEntryIds = rejectionEntries.map(e => e.entryId);
      if (rejectionEntryIds.length > 0) {
        const rejectionCorrectiveQuery = `
          SELECT actionId, entryId, action, responsible, dueDate
          FROM Production_CorrectiveActions
          WHERE entryId IN (${rejectionEntryIds.map((_, i) => `@entryId${i}`).join(", ")})
        `;
        const rejectionCorrectiveParams = rejectionEntryIds.map((id, i) => ({ name: `entryId${i}`, type: sql.UniqueIdentifier, value: id }));
        rejectionCorrectiveActions = await executeQuery(rejectionCorrectiveQuery, rejectionCorrectiveParams);
      }

      // Downtime Entries
      const downtimeQuery = `
        SELECT entryId, recordId, downtimeReason, downtimeMinutes, assignToTeam
        FROM DowntimeEntries
        WHERE recordId IN (${recordIds.map((_, i) => `@recordId${i}`).join(", ")})
      `;
      const downtimeParams = recordIds.map((id, i) => ({ name: `recordId${i}`, type: sql.UniqueIdentifier, value: id }));
      downtimeEntries = await executeQuery(downtimeQuery, downtimeParams);

      // Corrective actions for downtime
      const downtimeEntryIds = downtimeEntries.map(e => e.entryId);
      if (downtimeEntryIds.length > 0) {
        const downtimeCorrectiveQuery = `
          SELECT actionId, entryId, action, responsible, dueDate, downtimeType
          FROM Production_DowntimeCorrectiveActions
          WHERE entryId IN (${downtimeEntryIds.map((_, i) => `@entryId${i}`).join(", ")})
        `;
        const downtimeCorrectiveParams = downtimeEntryIds.map((id, i) => ({ name: `entryId${i}`, type: sql.UniqueIdentifier, value: id }));
        downtimeCorrectiveActions = await executeQuery(downtimeCorrectiveQuery, downtimeCorrectiveParams);
      }
    }

    // Combine data
    const parsedRecords = records.map(record => {
      const relatedRejections = rejectionEntries
        .filter(e => e.recordId === record.recordId)
        .map(e => ({
          entryId: e.entryId,
          type: e.rejectionType,
          quantity: e.quantity,
          reason: e.reason,
          correctiveActions: rejectionCorrectiveActions
            .filter(a => a.entryId === e.entryId)
            .map(a => ({
              id: a.actionId,
              action: a.action,
              responsible: a.responsible,
              dueDate: a.dueDate ? a.dueDate.toISOString().split("T")[0] : null,
            })),
        }));

      const relatedDowntime = downtimeEntries
        .filter(d => d.recordId === record.recordId)
        .map(d => ({
          entryId: d.entryId,
          downtimeReason: d.downtimeReason,
          downtimeMinutes: d.downtimeMinutes,
          assignToTeam: d.assignToTeam,
          correctiveActions: downtimeCorrectiveActions
            .filter(a => a.entryId === d.entryId)
            .map(a => ({
              id: a.actionId,
              action: a.action,
              responsible: a.responsible,
              dueDate: a.dueDate ? a.dueDate.toISOString().split("T")[0] : null,
              downtimeType: a.downtimeType,
            })),
        }));

      return {
        ...record,
        rejectionTypes: relatedRejections,
        rejectedQty: relatedRejections.reduce((sum, r) => sum + Number(r.quantity || 0), 0),
        downtimeEntries: relatedDowntime,
      };
    });

    const totalCountQuery = `SELECT COUNT(*) AS total FROM ProductionRecords pr ${filters}`;
    const totalCountResult = await executeQuery(
      totalCountQuery,
      params.filter(p => p.name !== "offset" && p.name !== "limitNum")
    );

    res.json({
      message: "Production records fetched successfully",
      data: { records: parsedRecords, total: totalCountResult[0]?.total || 0, page: pageNum, limit: limitNum },
    });
  } catch (err) {
    console.error("❌ Error fetching production records:", err);
    res.status(500).json({ message: "Failed to fetch production records", error: process.env.NODE_ENV === "development" ? err.message : "Internal server error" });
  }
});

// =========================== POST: Add Production Record ==========================
async function createTask(transaction, params) {
  const taskId = uuidv4();
  const taskRequest = new sql.Request(transaction);

  taskRequest.input("taskId", sql.UniqueIdentifier, taskId);
  taskRequest.input("productionCode", sql.NVarChar(50), params.productionCode || params.recordId);
  taskRequest.input("taskType", sql.NVarChar(50), params.taskType);
  taskRequest.input("title", sql.NVarChar(100), params.title);
  taskRequest.input("description", sql.NVarChar(sql.MAX), params.description);
  taskRequest.input("priority", sql.NVarChar(20), "high");
  taskRequest.input("assignedTo", sql.UniqueIdentifier, params.assignedTo || null);
  taskRequest.input("dueDate", sql.Date, params.dueDate ? new Date(params.dueDate) : null);
  taskRequest.input("status", sql.NVarChar(20), "pending");
  taskRequest.input("createdFrom", sql.NVarChar(20), "production");
  taskRequest.input("rejectionReason", sql.NVarChar(sql.MAX), params.rejectionReason || null);
  taskRequest.input("quantity", sql.Int, params.quantity || 0);
  taskRequest.input("maintenanceType", sql.NVarChar(20), null);
  taskRequest.input("equipment", sql.NVarChar(100), params.equipment || null);
  taskRequest.input("assignedTeam", sql.NVarChar(50), params.assignedTeam || null);

  const insertTaskQuery = `
    INSERT INTO Tasks (
      taskId, productionCode, taskType, title, description, priority, assignedTo, dueDate, status,
      createdFrom, rejectionReason, quantity, maintenanceType, equipment, assignedTeam
    ) VALUES (
      @taskId, @productionCode, @taskType, @title, @description, @priority, @assignedTo,
      CASE WHEN @dueDate IS NULL THEN NULL ELSE @dueDate END,
      @status, @createdFrom, @rejectionReason, @quantity, @maintenanceType, @equipment, @assignedTeam
    )
  `;
  await taskRequest.query(insertTaskQuery);

  return { taskId, taskType: params.taskType, title: params.title, assignedTo: params.assignedTo || defaultUserId, status: "pending" };
}

router.post("/production", authMiddleware, async (req, res) => {
  const pool = await poolPromise;
  const transaction = new sql.Transaction(pool);

  try {
    const {
      productionCode, productionType, date, shift, machineName, product,
      plannedQty, actualQty, lumpsQty, lumpsReason, defectType, customDefectType,
      downtimeEntries, rejectionTypes, targetOutput, plannedMins, operator,
      supervisor, status, efficiency, team
    } = req.body;

    console.log("Requested production record", req.body);
    

    const requiredFields = { productionType, date, shift, machineName, product, operator, supervisor, status };
    for (const [field, value] of Object.entries(requiredFields)) {
      if (!value || (typeof value === "string" && value.trim() === "")) {
        return res.status(400).json({ message: `Missing required field: ${field}` });
      }
    }

    const recordId = uuidv4();
    await transaction.begin();
    const request = new sql.Request(transaction);

    request.input("recordId", sql.UniqueIdentifier, recordId);
    request.input("productionType", sql.NVarChar(50), productionType);
    request.input("date", sql.Date, new Date(date));
    request.input("shift", sql.NVarChar(10), shift);
    request.input("machineName", sql.NVarChar(50), machineName);
    request.input("product", sql.NVarChar(100), product);
    request.input("plannedQty", sql.Int, Number(plannedQty) || 0);
    request.input("actualQty", sql.Int, Number(actualQty) || 0);
    request.input("lumpsQty", sql.Int, Number(lumpsQty) || 0);
    request.input("lumpsReason", sql.NVarChar(sql.MAX), lumpsReason || null);
    request.input("defectType", sql.NVarChar(50), defectType === "other" ? customDefectType : defectType || null);
    request.input("targetOutput", sql.Int, Number(targetOutput) || 0);
    request.input("plannedMins", sql.Int, Number(plannedMins) || 0);
    request.input("operator", sql.NVarChar(100), operator);
    request.input("supervisor", sql.NVarChar(100), supervisor);
    request.input("status", sql.NVarChar(20), status.toLowerCase());
    request.input("efficiency", sql.Decimal(5, 2), Number(efficiency) || 0);
    request.input("assignedTeam", sql.NVarChar(50), team || null);
    request.input("productionCode", sql.NVarChar(50), productionCode || null);

    const insertProductionQuery = `
      INSERT INTO ProductionRecords (
        recordId, productionType, date, shift, machineName, product, plannedQty, actualQty,
        lumpsQty, lumpsReason, defectType, targetOutput, plannedMins, operator, supervisor,
        status, efficiency, assignedTeam, productionCode
      ) VALUES (
        @recordId, @productionType, @date, @shift, @machineName, @product, @plannedQty, @actualQty,
        @lumpsQty, @lumpsReason, @defectType, @targetOutput, @plannedMins, @operator, @supervisor,
        @status, @efficiency, @assignedTeam, @productionCode
      )
    `;

    await request.query(insertProductionQuery);

    const createdTasks = [];

    // RejectionEntries
    if (rejectionTypes?.length) {
      for (const r of rejectionTypes) {
        const entryId = uuidv4();
        const rRequest = new sql.Request(transaction);
        rRequest.input("entryId", sql.UniqueIdentifier, entryId);
        rRequest.input("recordId", sql.UniqueIdentifier, recordId);
        rRequest.input("rejectionType", sql.NVarChar(100), r.type || null);
        rRequest.input("quantity", sql.Int, Number(r.quantity) || 0);
        rRequest.input("reason", sql.NVarChar(sql.MAX), r.reason || null);
        rRequest.input("assignToTeam", sql.NVarChar(100), r.assignToTeam || null);

        await rRequest.query(`
          INSERT INTO RejectionEntries (entryId, recordId, rejectionType, quantity, reason, assignToTeam)
          VALUES (@entryId, @recordId, @rejectionType, @quantity, @reason, @assignToTeam)
        `);

        // Corrective actions
        if (r.correctiveActions?.length) {
          for (const action of r.correctiveActions) {
            const actionId = uuidv4();
            const cRequest = new sql.Request(transaction);
            cRequest.input("actionId", sql.UniqueIdentifier, actionId);
            cRequest.input("entryId", sql.UniqueIdentifier, entryId);
            cRequest.input("action", sql.NVarChar(sql.MAX), action.action);
            cRequest.input("responsible", sql.NVarChar(100), action.responsible || null);
            cRequest.input("dueDate", sql.Date, action.dueDate ? new Date(action.dueDate) : null);

            await cRequest.query(`
              INSERT INTO Production_CorrectiveActions (actionId, entryId, action, responsible, dueDate)
              VALUES (@actionId, @entryId, @action, @responsible, @dueDate)
            `);
          }
        }

        // Create tasks
        if (r.assignToTeam) {
          const teams = r.assignToTeam.split(",").map(t => t.trim()).filter(t => t);
          for (const t of teams) {
            const task = await createTask(transaction, {
              productionCode,
              taskType: "rejection",
              title: `Rejection: ${r.type}`,
              description: `Rejected quantity: ${r.quantity} - ${r.reason}`,
              assignedTo: null,
              dueDate: null,
              rejectionReason: r.reason,
              quantity: r.quantity,
              equipment: machineName,
              assignedTeam: t,
            });
            createdTasks.push(task);
          }
        }
      }
    }

    // DowntimeEntries
    if (downtimeEntries?.length) {
      for (const d of downtimeEntries) {
        const entryId = uuidv4();
        const dtRequest = new sql.Request(transaction);
        dtRequest.input("entryId", sql.UniqueIdentifier, entryId);
        dtRequest.input("recordId", sql.UniqueIdentifier, recordId);
        dtRequest.input("downtimeReason", sql.NVarChar(100), d.type === "other" ? d.customType : d.type || null);
        dtRequest.input("downtimeMinutes", sql.Int, Number(d.downtimeMinutes) || 0);
        dtRequest.input("assignToTeam", sql.NVarChar(100), d.assignToTeam || null);

        await dtRequest.query(`
          INSERT INTO DowntimeEntries (entryId, recordId, downtimeReason, downtimeMinutes, assignToTeam)
          VALUES (@entryId, @recordId, @downtimeReason, @downtimeMinutes, @assignToTeam)
        `);

        if (d.correctiveActions?.length) {
          for (const action of d.correctiveActions) {
            const actionId = uuidv4();
            const cRequest = new sql.Request(transaction);
            cRequest.input("actionId", sql.UniqueIdentifier, actionId);
            cRequest.input("entryId", sql.UniqueIdentifier, entryId);
            cRequest.input("action", sql.NVarChar(sql.MAX), action.action);
            cRequest.input("responsible", sql.NVarChar(100), action.responsible || null);
            cRequest.input("dueDate", sql.Date, action.dueDate ? new Date(action.dueDate) : null);
            cRequest.input("downtimeType", sql.NVarChar(50), d.type === "other" ? d.customType : d.type || null);

            await cRequest.query(`
              INSERT INTO Production_DowntimeCorrectiveActions (actionId, entryId, action, responsible, dueDate, downtimeType)
              VALUES (@actionId, @entryId, @action, @responsible, @dueDate, @downtimeType)
            `);
          }
        }

        if (d.assignToTeam) {
          const teams = d.assignToTeam.split(",").map(t => t.trim()).filter(t => t);
          for (const t of teams) {
            const task = await createTask(transaction, {
              productionCode,
              taskType: "downtime",
              title: `Downtime: ${d.type}`,
              description: `Downtime ${d.downtimeMinutes} minutes due to ${d.type}`,
              assignedTo: null,
              dueDate: null,
              equipment: machineName,
              assignedTeam: t,
            });
            createdTasks.push(task);
          }
        }
      }
    }

    await transaction.commit();

    res.json({ message: "Production record added successfully", recordId, tasks: createdTasks });
  } catch (err) {
    console.error("❌ Error adding production record:", err);
    await transaction.rollback();
    res.status(500).json({ message: "Failed to add production record", error: process.env.NODE_ENV === "development" ? err.message : "Internal server error" });
  }
});

// =========================== DELETE: Production Record ==========================
router.delete("/production/:recordId", authMiddleware, async (req, res) => {
  const { recordId } = req.params;

  try {
    const pool = await poolPromise;
    const transaction = new sql.Transaction(pool);
    await transaction.begin();

    // Delete child entries manually (in case cascade not defined)
    const request = new sql.Request(transaction);
    request.input("recordId", sql.UniqueIdentifier, recordId);

    await request.query(`
      DELETE FROM Production_DowntimeCorrectiveActions 
      WHERE entryId IN (SELECT entryId FROM DowntimeEntries WHERE recordId = @recordId)
    `);
    await request.query(`DELETE FROM DowntimeEntries WHERE recordId = @recordId`);

    await request.query(`
      DELETE FROM Production_CorrectiveActions 
      WHERE entryId IN (SELECT entryId FROM RejectionEntries WHERE recordId = @recordId)
    `);
    await request.query(`DELETE FROM RejectionEntries WHERE recordId = @recordId`);

    await request.query(`DELETE FROM ProductionRecords WHERE recordId = @recordId`);

    await transaction.commit();

    res.json({ message: "Production record and related entries deleted successfully" });
  } catch (err) {
    console.error("❌ Error deleting production record:", err);
    res.status(500).json({ message: "Failed to delete production record", error: process.env.NODE_ENV === "development" ? err.message : "Internal server error" });
  }
});

export default router;





// import express from "express";
// import sql from "mssql";
// import { v4 as uuidv4 } from "uuid";
// import { poolPromise } from "../db.js";
// import executeQuery from "../utils/helper.js";
// import authMiddleware from "../middleware/authMiddleware.js";

// const router = express.Router();

// // =========================== GET: Fetch Production Records ==========================
// router.get("/production", authMiddleware, async (req, res) => {
//   try {
//     const {
//       search,
//       date,
//       shift,
//       status,
//       productionType,
//       page = "1",
//       limit = "20",
//     } = req.query;

//     // Validate pagination parameters
//     const pageNum = Math.max(parseInt(page, 10), 1);
//     const limitNum = Math.min(Math.max(parseInt(limit, 10), 10), 100);
//     const offset = (pageNum - 1) * limitNum;

//     let filters = " WHERE 1=1";
//     const params = [];

//     if (search) {
//       filters +=
//         " AND (pr.recordId LIKE @search OR pr.product LIKE @search OR pr.machineName LIKE @search OR pr.productionCode LIKE @search)";
//       params.push({
//         name: "search",
//         type: sql.NVarChar(100),
//         value: `%${search}%`,
//       });
//     }
//     if (date) {
//       filters += " AND CAST(pr.date AS DATE) = @date";
//       params.push({ name: "date", type: sql.Date, value: date });
//     }
//     if (shift && shift !== "all") {
//       filters += " AND pr.shift = @shift";
//       params.push({ name: "shift", type: sql.NVarChar(10), value: shift });
//     }
//     if (status && status !== "all") {
//       filters += " AND pr.status = @status";
//       params.push({ name: "status", type: sql.NVarChar(20), value: status });
//     }
//     if (productionType && productionType !== "all") {
//       filters += " AND pr.productionType = @productionType";
//       params.push({
//         name: "productionType",
//         type: sql.NVarChar(50),
//         value: productionType,
//       });
//     }

//     // Query to fetch production records
//     const productionQuery = `
//       SELECT pr.*
//       FROM ProductionRecords pr
//       ${filters}
//       ORDER BY pr.date DESC
//       OFFSET @offset ROWS FETCH NEXT @limitNum ROWS ONLY
//     `;
//     params.push(
//       { name: "offset", type: sql.Int, value: offset },
//       { name: "limitNum", type: sql.Int, value: limitNum }
//     );

//     const records = await executeQuery(productionQuery, params);

//     // Fetch rejection entries
//     const recordIds = records.map((record) => record.recordId);
//     let rejectionEntries = [];
//     let rejectionCorrectiveActions = [];
//     let downtimeCorrectiveActions = [];
//     if (recordIds.length > 0) {
//       // Fetch rejection entries with entryId
//       const rejectionQuery = `
//         SELECT entryId, recordId, rejectionType, quantity, reason
//         FROM RejectionEntries
//         WHERE recordId IN (${recordIds
//           .map((_, i) => `@recordId${i}`)
//           .join(", ")})
//       `;
//       const rejectionParams = recordIds.map((id, i) => ({
//         name: `recordId${i}`,
//         type: sql.UniqueIdentifier,
//         value: id,
//       }));
//       rejectionEntries = await executeQuery(rejectionQuery, rejectionParams);

//       // Fetch rejection corrective actions
//       const entryIds = rejectionEntries.map((entry) => entry.entryId);
//       if (entryIds.length > 0) {
//         const rejectionCorrectiveQuery = `
//           SELECT actionId, entryId, action, responsible, dueDate
//           FROM Production_CorrectiveActions
//           WHERE entryId IN (${entryIds
//             .map((_, i) => `@entryId${i}`)
//             .join(", ")})
//         `;
//         const rejectionCorrectiveParams = entryIds.map((id, i) => ({
//           name: `entryId${i}`,
//           type: sql.UniqueIdentifier,
//           value: id,
//         }));
//         rejectionCorrectiveActions = await executeQuery(
//           rejectionCorrectiveQuery,
//           rejectionCorrectiveParams
//         );
//       }

//       // Fetch downtime corrective actions
//       const downtimeCorrectiveQuery = `
//         SELECT actionId, recordId, action, responsible, dueDate, downtimeType
//         FROM Production_DowntimeCorrectiveActions
//         WHERE recordId IN (${recordIds
//           .map((_, i) => `@recordId${i}`)
//           .join(", ")})
//       `;
//       const downtimeCorrectiveParams = recordIds.map((id, i) => ({
//         name: `recordId${i}`,
//         type: sql.UniqueIdentifier,
//         value: id,
//       }));
//       downtimeCorrectiveActions = await executeQuery(
//         downtimeCorrectiveQuery,
//         downtimeCorrectiveParams
//       );
//     }

//     // Combine production records with rejection entries and corrective actions
//     const parsedRecords = records.map((record) => {
//       const relatedRejections = rejectionEntries
//         .filter((entry) => entry.recordId === record.recordId)
//         .map((entry) => ({
//           entryId: entry.entryId,
//           type: entry.rejectionType,
//           quantity: entry.quantity,
//           reason: entry.reason,
//           correctiveActions: rejectionCorrectiveActions
//             .filter((action) => action.entryId === entry.entryId)
//             .map((action) => ({
//               id: action.actionId,
//               action: action.action,
//               responsible: action.responsible,
//               dueDate: action.dueDate
//                 ? action.dueDate.toISOString().split("T")[0]
//                 : null,
//             })),
//         }));
//       const relatedDowntimeActions = downtimeCorrectiveActions
//         .filter((action) => action.recordId === record.recordId)
//         .map((action) => ({
//           id: action.actionId,
//           action: action.action,
//           responsible: action.responsible,
//           dueDate: action.dueDate
//             ? action.dueDate.toISOString().split("T")[0]
//             : null,
//           downtimeType: action.downtimeType,
//         }));
//       return {
//         ...record,
//         rejectionTypes: relatedRejections,
//         rejectedQty: relatedRejections.reduce(
//           (sum, entry) => sum + Number(entry.quantity || 0),
//           0
//         ),
//         downtimeCorrectiveActions: relatedDowntimeActions,
//       };
//     });

//     // Total count
//     const totalCountQuery = `SELECT COUNT(*) AS total FROM ProductionRecords pr ${filters}`;
//     const totalCountResult = await executeQuery(
//       totalCountQuery,
//       params.filter((p) => p.name !== "offset" && p.name !== "limitNum")
//     );
//     const total = totalCountResult[0]?.total || 0;

//     res.json({
//       message: "Production records fetched successfully",
//       data: { records: parsedRecords, total, page: pageNum, limit: limitNum },
//     });
//   } catch (err) {
//     console.error("❌ Error fetching production records:", err);
//     res.status(500).json({
//       message: "Failed to fetch production records",
//       error:
//         process.env.NODE_ENV === "development"
//           ? err.message
//           : "Internal server error",
//     });
//   }
// });

// // =========================== POST: Add Production Record ==========================

// // Utility function to create a task
// async function createTask(transaction, params) {
//   const taskId = uuidv4();
//   const taskRequest = new sql.Request(transaction);

//   taskRequest.input("taskId", sql.UniqueIdentifier, taskId);
//   taskRequest.input(
//     "productionCode",
//     sql.NVarChar(50),
//     params.productionCode || params.recordId
//   );
//   taskRequest.input("taskType", sql.NVarChar(20), params.taskType);
//   taskRequest.input("title", sql.NVarChar(100), params.title);
//   taskRequest.input("description", sql.NVarChar(sql.MAX), params.description);
//   taskRequest.input("priority", sql.NVarChar(20), "high");

//   // Ensure assignedTo is never null. Use a default or placeholder UUID if not provided.
//   const defaultUserId = "00000000-0000-0000-0000-000000000000";
//   taskRequest.input(
//     "assignedTo",
//     sql.UniqueIdentifier,
//     params.assignedTo || defaultUserId
//   );

//   taskRequest.input("dueDate", sql.Date, params.dueDate ? new Date(params.dueDate) : null);

//   // taskRequest.input(
//   //   "dueDate",
//   //   sql.Date,
//   //   null
//   //   // params.dueDate ? new Date(params.dueDate) : new Date()
//   // );
  
//   taskRequest.input("status", sql.NVarChar(20), "pending");
//   taskRequest.input("createdFrom", sql.NVarChar(20), "production");
//   taskRequest.input(
//     "rejectionReason",
//     sql.NVarChar(sql.MAX),
//     params.rejectionReason || null
//   );
//   taskRequest.input("quantity", sql.Int, params.quantity || 0);
//   taskRequest.input("maintenanceType", sql.NVarChar(20), null);
//   taskRequest.input("equipment", sql.NVarChar(100), params.equipment || null);
//   taskRequest.input(
//     "assignedTeam",
//     sql.NVarChar(50),
//     params.assignedTeam || null
//   );

//   // const insertTaskQuery = `
//   //   INSERT INTO Tasks (
//   //     taskId, productionCode, taskType, title, description, priority, assignedTo, dueDate, status,
//   //     createdFrom, rejectionReason, quantity, maintenanceType, equipment, assignedTeam
//   //   ) VALUES (
//   //     @taskId, @productionCode, @taskType, @title, @description, @priority, @assignedTo, @dueDate,
//   //     @status, @createdFrom, @rejectionReason, @quantity, @maintenanceType, @equipment, @assignedTeam
//   //   )
//   // `;

  
//   const insertTaskQuery = `
//     INSERT INTO Tasks (
//       taskId, productionCode, taskType, title, description, priority, assignedTo, dueDate, status,
//       createdFrom, rejectionReason, quantity, maintenanceType, equipment, assignedTeam
//     ) VALUES (
//       @taskId, @productionCode, @taskType, @title, @description, @priority, @assignedTo,
//       CASE WHEN @dueDate IS NULL THEN NULL ELSE @dueDate END,
//       @status, @createdFrom, @rejectionReason, @quantity, @maintenanceType, @equipment, @assignedTeam
//     )
//   `;

//   await taskRequest.query(insertTaskQuery);

//   return {
//     taskId,
//     taskType: params.taskType,
//     title: params.title,
//     assignedTo: params.assignedTo || defaultUserId,
//     status: "pending",
//   };
// }

// router.post("/production", authMiddleware, async (req, res) => {
//   const pool = await poolPromise;
//   const transaction = new sql.Transaction(pool);

//   try {
//     const {
//       productionCode,
//       productionType,
//       date,
//       shift,
//       machineName,
//       product,
//       plannedQty,
//       actualQty,
//       rejectionTypes,
//       downtimeCorrectiveActions,
//       lumpsQty,
//       lumpsReason,
//       downtimeType,
//       downtime,
//       defectType,
//       targetOutput,
//       plannedMins,
//       operator,
//       supervisor,
//       status,
//       efficiency,
//       customDefectType,
//       customDowntimeType,
//       team,
//       assignedToTeam,
//     } = req.body;

//     console.log("Received Production entry:", req.body);

//     // Validation
//     const requiredFields = {
//       productionType,
//       date,
//       shift,
//       machineName,
//       product,
//       operator,
//       supervisor,
//       status,
//     };
//     for (const [field, value] of Object.entries(requiredFields)) {
//       if (!value || (typeof value === "string" && value.trim() === "")) {
//         return res.status(400).json({
//           message: `Missing required field: ${field}`,
//           error: "All required fields must be provided",
//         });
//       }
//     }

//     if (
//       isNaN(Number(plannedQty)) ||
//       isNaN(Number(actualQty)) ||
//       Number(plannedQty) < 0 ||
//       Number(actualQty) < 0
//     ) {
//       return res.status(400).json({
//         message: "Invalid quantity values",
//         error: "Planned and actual quantities must be non-negative numbers",
//       });
//     }

//     if (rejectionTypes && !Array.isArray(rejectionTypes)) {
//       return res.status(400).json({
//         message: "Invalid rejection types",
//         error: "rejectionTypes must be an array",
//       });
//     }

//     if (
//       downtimeCorrectiveActions &&
//       !Array.isArray(downtimeCorrectiveActions)
//     ) {
//       return res.status(400).json({
//         message: "Invalid downtime corrective actions",
//         error: "downtimeCorrectiveActions must be an array",
//       });
//     }

//     if (lumpsQty && (isNaN(Number(lumpsQty)) || Number(lumpsQty) < 0)) {
//       return res.status(400).json({
//         message: "Invalid lumps quantity",
//         error: "Lumps quantity must be a non-negative number",
//       });
//     }

//     if (downtime && (isNaN(Number(downtime)) || Number(downtime) < 0)) {
//       return res.status(400).json({
//         message: "Invalid downtime",
//         error: "Downtime must be a non-negative number",
//       });
//     }

//     if (
//       targetOutput &&
//       (isNaN(Number(targetOutput)) || Number(targetOutput) < 0)
//     ) {
//       return res.status(400).json({
//         message: "Invalid target output",
//         error: "Target output must be a non-negative number",
//       });
//     }

//     if (
//       plannedMins &&
//       (isNaN(Number(plannedMins)) || Number(plannedMins) < 0)
//     ) {
//       return res.status(400).json({
//         message: "Invalid planned minutes",
//         error: "Planned minutes must be a non-negative number",
//       });
//     }

//     if (
//       efficiency &&
//       (isNaN(Number(efficiency)) ||
//         Number(efficiency) < 0 ||
//         Number(efficiency) > 100)
//     ) {
//       return res.status(400).json({
//         message: "Invalid efficiency",
//         error: "Efficiency must be a number between 0 and 100",
//       });
//     }

//     if (rejectionTypes) {
//       for (const entry of rejectionTypes) {
//         if (
//           !entry.type ||
//           !entry.reason ||
//           isNaN(Number(entry.quantity)) ||
//           Number(entry.quantity) < 0
//         ) {
//           return res.status(400).json({
//             message: "Invalid rejection entry",
//             error:
//               "Each rejection entry must have a type, reason, and non-negative quantity",
//           });
//         }
//         if (
//           entry.correctiveActions &&
//           !Array.isArray(entry.correctiveActions)
//         ) {
//           return res.status(400).json({
//             message: "Invalid corrective actions in rejection entry",
//             error: "correctiveActions must be an array",
//           });
//         }
//         if (entry.correctiveActions) {
//           for (const action of entry.correctiveActions) {
//             if (!action.action || !action.responsible) {
//               return res.status(400).json({
//                 message: "Invalid corrective action in rejection entry",
//                 error:
//                   "Each corrective action must have action, responsible",
//               });
//             }
//           }
//         }
//       }
//     }

//     if (downtimeCorrectiveActions) {
//       for (const action of downtimeCorrectiveActions) {
//         if (!action.action || !action.responsible) {
//           return res.status(400).json({
//             message: "Invalid downtime corrective action",
//             error:
//               "Each downtime corrective action must have action, responsible",
//           });
//         }
//       }
//     }

//     const recordId = uuidv4();
//     await transaction.begin();
//     const request = new sql.Request(transaction);

//     // Insert into ProductionRecords
//     request.input("recordId", sql.UniqueIdentifier, recordId);
//     request.input("productionType", sql.NVarChar(50), productionType);
//     request.input("date", sql.DateTime, new Date(date));
//     request.input("shift", sql.NVarChar(10), shift);
//     request.input("machineName", sql.NVarChar(50), machineName);
//     request.input("product", sql.NVarChar(100), product);
//     request.input("plannedQty", sql.Int, Number(plannedQty));
//     request.input("actualQty", sql.Int, Number(actualQty));
//     request.input("lumpsQty", sql.Int, Number(lumpsQty) || 0);
//     request.input("lumpsReason", sql.NVarChar(sql.MAX), lumpsReason || null);
//     const defectLabel = defectType === "other" ? customDefectType : defectType;
//     const downtimeLabel =
//       downtimeType === "other" ? customDowntimeType : downtimeType;
//     request.input("downtimeType", sql.NVarChar(50), downtimeLabel || null);
//     request.input("downtime", sql.Int, Number(downtime) || 0);
//     request.input("defectType", sql.NVarChar(50), defectLabel || null);
//     request.input("targetOutput", sql.Int, Number(targetOutput) || 0);
//     request.input("plannedMins", sql.Int, Number(plannedMins) || 0);
//     request.input("operator", sql.NVarChar(100), operator);
//     request.input("supervisor", sql.NVarChar(100), supervisor);
//     request.input("assignedTeam", sql.NVarChar(50), team || null);
//     request.input("status", sql.NVarChar(20), status.toLowerCase());
//     request.input("efficiency", sql.Decimal(5, 2), Number(efficiency) || 0);
//     request.input("productionCode", sql.NVarChar(50), productionCode || null);
//     request.input(
//       "customDefectType",
//       sql.NVarChar(100),
//       customDefectType || null
//     );
//     request.input(
//       "customDowntimeType",
//       sql.NVarChar(100),
//       customDowntimeType || null
//     );

//     const insertProductionQuery = `
//       INSERT INTO ProductionRecords (
//         recordId, productionType, date, shift, machineName, product, plannedQty, actualQty,
//         lumpsQty, lumpsReason, downtimeType, downtime, defectType, targetOutput, plannedMins,
//         operator, supervisor, assignedTeam, status, efficiency, productionCode, customDefectType, customDowntimeType
//       ) VALUES (
//         @recordId, @productionType, @date, @shift, @machineName, @product, @plannedQty, @actualQty,
//         @lumpsQty, @lumpsReason, @downtimeType, @downtime, @defectType, @targetOutput, @plannedMins,
//         @operator, @supervisor, @assignedTeam, @status, @efficiency, @productionCode, @customDefectType, @customDowntimeType
//       )
//     `;
//     await request.query(insertProductionQuery);

//     // Initialize createdTasks
//     let createdTasks = [];

//     // Insert Rejection Entries and Their Corrective Actions + Create Tasks
//     if (rejectionTypes && rejectionTypes.length > 0) {
//       for (const entry of rejectionTypes) {
//         const entryId = entry.entryId || uuidv4();
//         const rejectionRequest = new sql.Request(transaction);
//         rejectionRequest.input("entryId", sql.UniqueIdentifier, entryId);
//         rejectionRequest.input("recordId", sql.UniqueIdentifier, recordId);
//         rejectionRequest.input(
//           "rejectionType",
//           sql.NVarChar(100),
//           entry.type || null
//         );
//         rejectionRequest.input(
//           "quantity",
//           sql.Int,
//           Number(entry.quantity) || 0
//         );
//         rejectionRequest.input(
//           "reason",
//           sql.NVarChar(sql.MAX),
//           entry.reason || null
//         );
//         rejectionRequest.input(
//           "assignToTeam",
//           sql.NVarChar(100),
//           entry.assignToTeam || ""
//         );

//         const insertRejectionQuery = `
//       INSERT INTO RejectionEntries (
//         entryId, recordId, rejectionType, quantity, reason, assignToTeam
//       ) VALUES (
//         @entryId, @recordId, @rejectionType, @quantity, @reason, @assignToTeam
//       )
//     `;
//         await rejectionRequest.query(insertRejectionQuery);

//         // Insert corrective actions
//         if (entry.correctiveActions && entry.correctiveActions.length > 0) {
//           for (const action of entry.correctiveActions) {
//             const actionId = uuidv4();
//             const correctiveRequest = new sql.Request(transaction);
//             correctiveRequest.input("actionId", sql.UniqueIdentifier, actionId);
//             correctiveRequest.input("entryId", sql.UniqueIdentifier, entryId);
//             correctiveRequest.input(
//               "action",
//               sql.NVarChar(sql.MAX),
//               action.action
//             );
//             correctiveRequest.input(
//               "responsible",
//               sql.NVarChar(100),
//               action.responsible
//             );
//             correctiveRequest.input(
//               "dueDate",
//               sql.Date,
//               // new Date(action.dueDate)
//               action.dueDate ? new Date(action.dueDate) : null
//             );

//             const insertRejectionCorrectiveQuery = `
//           INSERT INTO Production_CorrectiveActions (
//             actionId, entryId, action, responsible, dueDate
//           ) VALUES (
//             @actionId, @entryId, @action, @responsible, @dueDate
//           )
//         `;
//             await correctiveRequest.query(insertRejectionCorrectiveQuery);
//           }
//         }

//         // ✅ Create Rejection Task (independently)
//         if (entry.assignedToTeam) {
//           const teams = entry.assignedToTeam
//             .split(",")
//             .map((team) => team.trim())
//             .filter((t) => t !== "");
//           for (const team of teams) {
//             const taskParams = {
//               productionCode,
//               recordId,
//               taskType: "rejection",
//               title: `Production Rejection: ${entry.type}`,
//               description: `Rejected quantities for product ${product}: ${entry.type} (${entry.quantity}) - ${entry.reason}`,
//               assignedTo: null,
//               dueDate: null,
//               rejectionReason: entry.reason,
//               quantity: Number(entry.quantity),
//               equipment: machineName,
//               assignedTeam: team,
//             };
//             const task = await createTask(transaction, taskParams);
//             createdTasks.push(task);
//           }
//         }
//       }
//     }

//     // Insert Downtime Corrective Actions + Create Tasks
//     if (
//       downtimeCorrectiveActions &&
//       downtimeCorrectiveActions.length > 0 &&
//       downtimeType &&
//       downtimeType !== "none"
//     ) {
//       for (const action of downtimeCorrectiveActions) {
//         const actionId = uuidv4();
//         const downtimeCorrectiveRequest = new sql.Request(transaction);
//         downtimeCorrectiveRequest.input(
//           "actionId",
//           sql.UniqueIdentifier,
//           actionId
//         );
//         downtimeCorrectiveRequest.input(
//           "recordId",
//           sql.UniqueIdentifier,
//           recordId
//         );
//         downtimeCorrectiveRequest.input(
//           "action",
//           sql.NVarChar(sql.MAX),
//           action.action
//         );
//         downtimeCorrectiveRequest.input(
//           "responsible",
//           sql.NVarChar(100),
//           action.responsible
//         );
//         downtimeCorrectiveRequest.input(
//           "dueDate",
//           sql.Date,
//           // new Date(action.dueDate)
//           action.dueDate ? new Date(action.dueDate) : null
//         );
//         downtimeCorrectiveRequest.input(
//           "downtimeType",
//           sql.NVarChar(50),
//           downtimeLabel || null
//         );

//         const insertDowntimeCorrectiveQuery = `
//       INSERT INTO Production_DowntimeCorrectiveActions (
//         actionId, recordId, action, responsible, dueDate, downtimeType
//       ) VALUES (
//         @actionId, @recordId, @action, @responsible, @dueDate, @downtimeType
//       )
//     `;
//         await downtimeCorrectiveRequest.query(insertDowntimeCorrectiveQuery);
//       }
//     }

//     // ✅ Create Downtime Task (independently)
//     if (downtimeType && downtimeType !== "none" && team) {
//       const teams = team
//         .split(",")
//         .map((team) => team.trim())
//         .filter((t) => t !== "");
//       for (const t of teams) {
//         const taskParams = {
//           productionCode,
//           recordId,
//           taskType: "downtime",
//           title: `Production Downtime: ${downtimeLabel}`,
//           description: `Downtime reported for machine ${machineName}: ${downtime} minutes - ${downtimeLabel}`,
//           assignedTo: null,
//           dueDate: null,
//           rejectionReason: null,
//           quantity: Number(downtime),
//           equipment: machineName,
//           assignedTeam: t,
//         };
//         const task = await createTask(transaction, taskParams);
//         createdTasks.push(task);
//       }
//     }

//     await transaction.commit();

//     res.status(201).json({
//       message: "Production record added successfullyyyy",
//       recordId,
//       tasks: createdTasks,
//     });

//     console.log(
//       `✅ Production record inserted: ${recordId} with ${createdTasks.length} task(s)`
//     );
//   } catch (err) {
//     console.error("❌ SQL Error inside transaction:", err);
//     if (!transaction._aborted) {
//       await transaction.rollback();
//       console.log("✅ Transaction rolled back");
//     }
//     res.status(500).json({
//       message: "Failed to add production record",
//       error:
//         process.env.NODE_ENV === "development"
//           ? err.message
//           : "Internal server error",
//     });
//   }
// });

// // =========================== DELETE: Delete Production Record ==========================
// router.delete("/production/:recordId", authMiddleware, async (req, res) => {
//   const pool = await poolPromise;
//   const transaction = new sql.Transaction(pool);

//   try {
//     const { recordId } = req.params;

//     if (
//       !recordId ||
//       !/^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/.test(
//         recordId
//       )
//     ) {
//       return res.status(400).json({
//         message: "Invalid record ID",
//         error: "Record ID must be a valid UUID",
//       });
//     }

//     await transaction.begin();
//     const request = new sql.Request(transaction);

//     // Delete production record (cascades to RejectionEntries and Production_DowntimeCorrectiveActions via foreign keys)
//     request.input("recordId", sql.UniqueIdentifier, recordId);
//     const deleteProductionQuery =
//       "DELETE FROM ProductionRecords WHERE recordId = @recordId";
//     const result = await request.query(deleteProductionQuery);

//     if (result.rowsAffected[0] === 0) {
//       await transaction.rollback();
//       return res.status(404).json({
//         message: "Production record not found",
//         error: "No record matches the provided ID",
//       });
//     }

//     await transaction.commit();
//     res.json({ message: "Production record deleted successfully" });
//     console.log(`✅ Production record deleted: ${recordId}`);
//   } catch (err) {
//     console.error("❌ Error deleting production record:", err);
//     if (!transaction._aborted) {
//       await transaction.rollback();
//       console.log("✅ Transaction rolled back");
//     }
//     res.status(500).json({
//       message: "Failed to delete production record",
//       error:
//         process.env.NODE_ENV === "development"
//           ? err.message
//           : "Internal server error",
//     });
//   }
// });

// export default router;


// // import express from "express";
// // import sql from "mssql";
// // import { v4 as uuidv4 } from "uuid";
// // import { poolPromise } from "../db.js";
// // import executeQuery from "../utils/helper.js";
// // import authMiddleware from "../middleware/authMiddleware.js";

// // const router = express.Router();

// // // =========================== GET: Fetch Production Records ==========================
// // router.get("/production", authMiddleware, async (req, res) => {
// //   try {
// //     const {
// //       search,
// //       date,
// //       shift,
// //       status,
// //       productionType,
// //       page = "1",
// //       limit = "20",
// //     } = req.query;

// //     // Validate pagination parameters
// //     const pageNum = Math.max(parseInt(page, 10), 1);
// //     const limitNum = Math.min(Math.max(parseInt(limit, 10), 10), 100);
// //     const offset = (pageNum - 1) * limitNum;

// //     let filters = " WHERE 1=1";
// //     const params = [];

// //     if (search) {
// //       filters +=
// //         " AND (pr.recordId LIKE @search OR pr.product LIKE @search OR pr.machineName LIKE @search OR pr.productionCode LIKE @search)";
// //       params.push({
// //         name: "search",
// //         type: sql.NVarChar(100),
// //         value: `%${search}%`,
// //       });
// //     }
// //     if (date) {
// //       filters += " AND CAST(pr.date AS DATE) = @date";
// //       params.push({ name: "date", type: sql.Date, value: date });
// //     }
// //     if (shift && shift !== "all") {
// //       filters += " AND pr.shift = @shift";
// //       params.push({ name: "shift", type: sql.NVarChar(10), value: shift });
// //     }
// //     if (status && status !== "all") {
// //       filters += " AND pr.status = @status";
// //       params.push({ name: "status", type: sql.NVarChar(20), value: status });
// //     }
// //     if (productionType && productionType !== "all") {
// //       filters += " AND pr.productionType = @productionType";
// //       params.push({
// //         name: "productionType",
// //         type: sql.NVarChar(50),
// //         value: productionType,
// //       });
// //     }

// //     // Query to fetch production records
// //     const productionQuery = `
// //       SELECT pr.*
// //       FROM ProductionRecords pr
// //       ${filters}
// //       ORDER BY pr.date DESC
// //       OFFSET @offset ROWS FETCH NEXT @limitNum ROWS ONLY
// //     `;
// //     params.push(
// //       { name: "offset", type: sql.Int, value: offset },
// //       { name: "limitNum", type: sql.Int, value: limitNum }
// //     );

// //     const records = await executeQuery(productionQuery, params);

// //     // Fetch rejection entries
// //     const recordIds = records.map((record) => record.recordId);
// //     let rejectionEntries = [];
// //     let rejectionCorrectiveActions = [];
// //     let downtimeCorrectiveActions = [];
// //     if (recordIds.length > 0) {
// //       // Fetch rejection entries with entryId
// //       const rejectionQuery = `
// //         SELECT entryId, recordId, rejectionType, quantity, reason
// //         FROM RejectionEntries
// //         WHERE recordId IN (${recordIds
// //           .map((_, i) => `@recordId${i}`)
// //           .join(", ")})
// //       `;
// //       const rejectionParams = recordIds.map((id, i) => ({
// //         name: `recordId${i}`,
// //         type: sql.UniqueIdentifier,
// //         value: id,
// //       }));
// //       rejectionEntries = await executeQuery(rejectionQuery, rejectionParams);

// //       // Fetch rejection corrective actions
// //       const entryIds = rejectionEntries.map((entry) => entry.entryId);
// //       if (entryIds.length > 0) {
// //         const rejectionCorrectiveQuery = `
// //           SELECT actionId, entryId, action, responsible, dueDate
// //           FROM Production_CorrectiveActions
// //           WHERE entryId IN (${entryIds
// //             .map((_, i) => `@entryId${i}`)
// //             .join(", ")})
// //         `;
// //         const rejectionCorrectiveParams = entryIds.map((id, i) => ({
// //           name: `entryId${i}`,
// //           type: sql.UniqueIdentifier,
// //           value: id,
// //         }));
// //         rejectionCorrectiveActions = await executeQuery(
// //           rejectionCorrectiveQuery,
// //           rejectionCorrectiveParams
// //         );
// //       }

// //       // Fetch downtime corrective actions
// //       const downtimeCorrectiveQuery = `
// //         SELECT actionId, recordId, action, responsible, dueDate, downtimeType
// //         FROM Production_DowntimeCorrectiveActions
// //         WHERE recordId IN (${recordIds
// //           .map((_, i) => `@recordId${i}`)
// //           .join(", ")})
// //       `;
// //       const downtimeCorrectiveParams = recordIds.map((id, i) => ({
// //         name: `recordId${i}`,
// //         type: sql.UniqueIdentifier,
// //         value: id,
// //       }));
// //       downtimeCorrectiveActions = await executeQuery(
// //         downtimeCorrectiveQuery,
// //         downtimeCorrectiveParams
// //       );
// //     }

// //     // Combine production records with rejection entries and corrective actions
// //     const parsedRecords = records.map((record) => {
// //       const relatedRejections = rejectionEntries
// //         .filter((entry) => entry.recordId === record.recordId)
// //         .map((entry) => ({
// //           entryId: entry.entryId,
// //           type: entry.rejectionType,
// //           quantity: entry.quantity,
// //           reason: entry.reason,
// //           correctiveActions: rejectionCorrectiveActions
// //             .filter((action) => action.entryId === entry.entryId)
// //             .map((action) => ({
// //               id: action.actionId,
// //               action: action.action,
// //               responsible: action.responsible,
// //               dueDate: action.dueDate
// //                 ? action.dueDate.toISOString().split("T")[0]
// //                 : null,
// //             })),
// //         }));
// //       const relatedDowntimeActions = downtimeCorrectiveActions
// //         .filter((action) => action.recordId === record.recordId)
// //         .map((action) => ({
// //           id: action.actionId,
// //           action: action.action,
// //           responsible: action.responsible,
// //           dueDate: action.dueDate
// //             ? action.dueDate.toISOString().split("T")[0]
// //             : null,
// //           downtimeType: action.downtimeType,
// //         }));
// //       return {
// //         ...record,
// //         rejectionTypes: relatedRejections,
// //         rejectedQty: relatedRejections.reduce(
// //           (sum, entry) => sum + Number(entry.quantity || 0),
// //           0
// //         ),
// //         downtimeCorrectiveActions: relatedDowntimeActions,
// //       };
// //     });

// //     // Total count
// //     const totalCountQuery = `SELECT COUNT(*) AS total FROM ProductionRecords pr ${filters}`;
// //     const totalCountResult = await executeQuery(
// //       totalCountQuery,
// //       params.filter((p) => p.name !== "offset" && p.name !== "limitNum")
// //     );
// //     const total = totalCountResult[0]?.total || 0;

// //     res.json({
// //       message: "Production records fetched successfully",
// //       data: { records: parsedRecords, total, page: pageNum, limit: limitNum },
// //     });
// //   } catch (err) {
// //     console.error("❌ Error fetching production records:", err);
// //     res.status(500).json({
// //       message: "Failed to fetch production records",
// //       error:
// //         process.env.NODE_ENV === "development"
// //           ? err.message
// //           : "Internal server error",
// //     });
// //   }
// // });

// // // =========================== POST: Add Production Record ==========================

// // // Utility function to create a task
// // async function createTask(transaction, params) {
// //   const taskId = uuidv4();
// //   const taskRequest = new sql.Request(transaction);

// //   taskRequest.input("taskId", sql.UniqueIdentifier, taskId);
// //   taskRequest.input(
// //     "productionCode",
// //     sql.NVarChar(50),
// //     params.productionCode || params.recordId
// //   );
// //   taskRequest.input("taskType", sql.NVarChar(20), params.taskType);
// //   taskRequest.input("title", sql.NVarChar(100), params.title);
// //   taskRequest.input("description", sql.NVarChar(sql.MAX), params.description);
// //   taskRequest.input("priority", sql.NVarChar(20), "high");

// //   // Ensure assignedTo is never null. Use a default or placeholder UUID if not provided.
// //   const defaultUserId = "00000000-0000-0000-0000-000000000000";
// //   taskRequest.input(
// //     "assignedTo",
// //     sql.UniqueIdentifier,
// //     params.assignedTo || defaultUserId
// //   );

// //   // taskRequest.input(
// //   //   "dueDate",
// //   //   sql.Date,
// //   //   null
// //   //   // params.dueDate ? new Date(params.dueDate) : new Date()
// //   // );

// //   taskRequest.input(
// //   "dueDate",
// //   params.dueDate ? new Date(params.dueDate) : null
// // );


  
// //   taskRequest.input("status", sql.NVarChar(20), "pending");
// //   taskRequest.input("createdFrom", sql.NVarChar(20), "production");
// //   taskRequest.input(
// //     "rejectionReason",
// //     sql.NVarChar(sql.MAX),
// //     params.rejectionReason || null
// //   );
// //   taskRequest.input("quantity", sql.Int, params.quantity || 0);
// //   taskRequest.input("maintenanceType", sql.NVarChar(20), null);
// //   taskRequest.input("equipment", sql.NVarChar(100), params.equipment || null);
// //   taskRequest.input(
// //     "assignedTeam",
// //     sql.NVarChar(50),
// //     params.assignedTeam || null
// //   );

// //   // const insertTaskQuery = `
// //   //   INSERT INTO Tasks (
// //   //     taskId, productionCode, taskType, title, description, priority, assignedTo, dueDate, status,
// //   //     createdFrom, rejectionReason, quantity, maintenanceType, equipment, assignedTeam
// //   //   ) VALUES (
// //   //     @taskId, @productionCode, @taskType, @title, @description, @priority, @assignedTo, @dueDate,
// //   //     @status, @createdFrom, @rejectionReason, @quantity, @maintenanceType, @equipment, @assignedTeam
// //   //   )
// //   // `;

  
// //   const insertTaskQuery = `
// //     INSERT INTO Tasks (
// //       taskId, productionCode, taskType, title, description, priority, assignedTo, dueDate, status,
// //       createdFrom, rejectionReason, quantity, maintenanceType, equipment, assignedTeam
// //     ) VALUES (
// //       @taskId, @productionCode, @taskType, @title, @description, @priority, @assignedTo,
// //       CASE WHEN @dueDate IS NULL THEN NULL ELSE @dueDate END,
// //       @status, @createdFrom, @rejectionReason, @quantity, @maintenanceType, @equipment, @assignedTeam
// //     )
// //   `;

// //   await taskRequest.query(insertTaskQuery);

// //   return {
// //     taskId,
// //     taskType: params.taskType,
// //     title: params.title,
// //     assignedTo: params.assignedTo || defaultUserId,
// //     status: "pending",
// //   };
// // }

// // router.post("/production", authMiddleware, async (req, res) => {
// //   const pool = await poolPromise;
// //   const transaction = new sql.Transaction(pool);

// //   try {
// //     const {
// //       productionCode,
// //       productionType,
// //       date,
// //       shift,
// //       machineName,
// //       product,
// //       plannedQty,
// //       actualQty,
// //       rejectionTypes,
// //       downtimeCorrectiveActions,
// //       lumpsQty,
// //       lumpsReason,
// //       downtimeType,
// //       downtime,
// //       defectType,
// //       targetOutput,
// //       plannedMins,
// //       operator,
// //       supervisor,
// //       status,
// //       efficiency,
// //       customDefectType,
// //       customDowntimeType,
// //       team,
// //       assignedToTeam,
// //     } = req.body;

// //     console.log("Received Production entry:", req.body);

// //     // Validation
// //     const requiredFields = {
// //       productionType,
// //       date,
// //       shift,
// //       machineName,
// //       product,
// //       operator,
// //       supervisor,
// //       status,
// //     };
// //     for (const [field, value] of Object.entries(requiredFields)) {
// //       if (!value || (typeof value === "string" && value.trim() === "")) {
// //         return res.status(400).json({
// //           message: `Missing required field: ${field}`,
// //           error: "All required fields must be provided",
// //         });
// //       }
// //     }

// //     if (
// //       isNaN(Number(plannedQty)) ||
// //       isNaN(Number(actualQty)) ||
// //       Number(plannedQty) < 0 ||
// //       Number(actualQty) < 0
// //     ) {
// //       return res.status(400).json({
// //         message: "Invalid quantity values",
// //         error: "Planned and actual quantities must be non-negative numbers",
// //       });
// //     }

// //     if (rejectionTypes && !Array.isArray(rejectionTypes)) {
// //       return res.status(400).json({
// //         message: "Invalid rejection types",
// //         error: "rejectionTypes must be an array",
// //       });
// //     }

// //     if (
// //       downtimeCorrectiveActions &&
// //       !Array.isArray(downtimeCorrectiveActions)
// //     ) {
// //       return res.status(400).json({
// //         message: "Invalid downtime corrective actions",
// //         error: "downtimeCorrectiveActions must be an array",
// //       });
// //     }

// //     if (lumpsQty && (isNaN(Number(lumpsQty)) || Number(lumpsQty) < 0)) {
// //       return res.status(400).json({
// //         message: "Invalid lumps quantity",
// //         error: "Lumps quantity must be a non-negative number",
// //       });
// //     }

// //     if (downtime && (isNaN(Number(downtime)) || Number(downtime) < 0)) {
// //       return res.status(400).json({
// //         message: "Invalid downtime",
// //         error: "Downtime must be a non-negative number",
// //       });
// //     }

// //     if (
// //       targetOutput &&
// //       (isNaN(Number(targetOutput)) || Number(targetOutput) < 0)
// //     ) {
// //       return res.status(400).json({
// //         message: "Invalid target output",
// //         error: "Target output must be a non-negative number",
// //       });
// //     }

// //     if (
// //       plannedMins &&
// //       (isNaN(Number(plannedMins)) || Number(plannedMins) < 0)
// //     ) {
// //       return res.status(400).json({
// //         message: "Invalid planned minutes",
// //         error: "Planned minutes must be a non-negative number",
// //       });
// //     }

// //     if (
// //       efficiency &&
// //       (isNaN(Number(efficiency)) ||
// //         Number(efficiency) < 0 ||
// //         Number(efficiency) > 100)
// //     ) {
// //       return res.status(400).json({
// //         message: "Invalid efficiency",
// //         error: "Efficiency must be a number between 0 and 100",
// //       });
// //     }

// //     if (rejectionTypes) {
// //       for (const entry of rejectionTypes) {
// //         if (
// //           !entry.type ||
// //           !entry.reason ||
// //           isNaN(Number(entry.quantity)) ||
// //           Number(entry.quantity) < 0
// //         ) {
// //           return res.status(400).json({
// //             message: "Invalid rejection entry",
// //             error:
// //               "Each rejection entry must have a type, reason, and non-negative quantity",
// //           });
// //         }
// //         if (
// //           entry.correctiveActions &&
// //           !Array.isArray(entry.correctiveActions)
// //         ) {
// //           return res.status(400).json({
// //             message: "Invalid corrective actions in rejection entry",
// //             error: "correctiveActions must be an array",
// //           });
// //         }
// //         if (entry.correctiveActions) {
// //           for (const action of entry.correctiveActions) {
// //             if (!action.action || !action.responsible) {
// //               return res.status(400).json({
// //                 message: "Invalid corrective action in rejection entry",
// //                 error:
// //                   "Each corrective action must have action, responsible",
// //               });
// //             }
// //           }
// //         }
// //       }
// //     }

// //     if (downtimeCorrectiveActions) {
// //       for (const action of downtimeCorrectiveActions) {
// //         if (!action.action || !action.responsible) {
// //           return res.status(400).json({
// //             message: "Invalid downtime corrective action",
// //             error:
// //               "Each downtime corrective action must have action, responsible",
// //           });
// //         }
// //       }
// //     }

// //     const recordId = uuidv4();
// //     await transaction.begin();
// //     const request = new sql.Request(transaction);

// //     // Insert into ProductionRecords
// //     request.input("recordId", sql.UniqueIdentifier, recordId);
// //     request.input("productionType", sql.NVarChar(50), productionType);
// //     request.input("date", sql.DateTime, new Date(date));
// //     request.input("shift", sql.NVarChar(10), shift);
// //     request.input("machineName", sql.NVarChar(50), machineName);
// //     request.input("product", sql.NVarChar(100), product);
// //     request.input("plannedQty", sql.Int, Number(plannedQty));
// //     request.input("actualQty", sql.Int, Number(actualQty));
// //     request.input("lumpsQty", sql.Int, Number(lumpsQty) || 0);
// //     request.input("lumpsReason", sql.NVarChar(sql.MAX), lumpsReason || null);
// //     const defectLabel = defectType === "other" ? customDefectType : defectType;
// //     const downtimeLabel =
// //       downtimeType === "other" ? customDowntimeType : downtimeType;
// //     request.input("downtimeType", sql.NVarChar(50), downtimeLabel || null);
// //     request.input("downtime", sql.Int, Number(downtime) || 0);
// //     request.input("defectType", sql.NVarChar(50), defectLabel || null);
// //     request.input("targetOutput", sql.Int, Number(targetOutput) || 0);
// //     request.input("plannedMins", sql.Int, Number(plannedMins) || 0);
// //     request.input("operator", sql.NVarChar(100), operator);
// //     request.input("supervisor", sql.NVarChar(100), supervisor);
// //     request.input("assignedTeam", sql.NVarChar(50), team || null);
// //     request.input("status", sql.NVarChar(20), status.toLowerCase());
// //     request.input("efficiency", sql.Decimal(5, 2), Number(efficiency) || 0);
// //     request.input("productionCode", sql.NVarChar(50), productionCode || null);
// //     request.input(
// //       "customDefectType",
// //       sql.NVarChar(100),
// //       customDefectType || null
// //     );
// //     request.input(
// //       "customDowntimeType",
// //       sql.NVarChar(100),
// //       customDowntimeType || null
// //     );

// //     const insertProductionQuery = `
// //       INSERT INTO ProductionRecords (
// //         recordId, productionType, date, shift, machineName, product, plannedQty, actualQty,
// //         lumpsQty, lumpsReason, downtimeType, downtime, defectType, targetOutput, plannedMins,
// //         operator, supervisor, assignedTeam, status, efficiency, productionCode, customDefectType, customDowntimeType
// //       ) VALUES (
// //         @recordId, @productionType, @date, @shift, @machineName, @product, @plannedQty, @actualQty,
// //         @lumpsQty, @lumpsReason, @downtimeType, @downtime, @defectType, @targetOutput, @plannedMins,
// //         @operator, @supervisor, @assignedTeam, @status, @efficiency, @productionCode, @customDefectType, @customDowntimeType
// //       )
// //     `;
// //     await request.query(insertProductionQuery);

// //     // Initialize createdTasks
// //     let createdTasks = [];

// //     // Insert Rejection Entries and Their Corrective Actions + Create Tasks
// //     if (rejectionTypes && rejectionTypes.length > 0) {
// //       for (const entry of rejectionTypes) {
// //         const entryId = entry.entryId || uuidv4();
// //         const rejectionRequest = new sql.Request(transaction);
// //         rejectionRequest.input("entryId", sql.UniqueIdentifier, entryId);
// //         rejectionRequest.input("recordId", sql.UniqueIdentifier, recordId);
// //         rejectionRequest.input(
// //           "rejectionType",
// //           sql.NVarChar(100),
// //           entry.type || null
// //         );
// //         rejectionRequest.input(
// //           "quantity",
// //           sql.Int,
// //           Number(entry.quantity) || 0
// //         );
// //         rejectionRequest.input(
// //           "reason",
// //           sql.NVarChar(sql.MAX),
// //           entry.reason || null
// //         );
// //         rejectionRequest.input(
// //           "assignToTeam",
// //           sql.NVarChar(100),
// //           entry.assignToTeam || ""
// //         );

// //         const insertRejectionQuery = `
// //       INSERT INTO RejectionEntries (
// //         entryId, recordId, rejectionType, quantity, reason, assignToTeam
// //       ) VALUES (
// //         @entryId, @recordId, @rejectionType, @quantity, @reason, @assignToTeam
// //       )
// //     `;
// //         await rejectionRequest.query(insertRejectionQuery);

// //         // Insert corrective actions
// //         if (entry.correctiveActions && entry.correctiveActions.length > 0) {
// //           for (const action of entry.correctiveActions) {
// //             const actionId = uuidv4();
// //             const correctiveRequest = new sql.Request(transaction);
// //             correctiveRequest.input("actionId", sql.UniqueIdentifier, actionId);
// //             correctiveRequest.input("entryId", sql.UniqueIdentifier, entryId);
// //             correctiveRequest.input(
// //               "action",
// //               sql.NVarChar(sql.MAX),
// //               action.action
// //             );
// //             correctiveRequest.input(
// //               "responsible",
// //               sql.NVarChar(100),
// //               action.responsible
// //             );
// //             correctiveRequest.input(
// //               "dueDate",
// //               sql.Date,
// //               // new Date(action.dueDate)
// //               action.dueDate ? new Date(action.dueDate) : null
// //             );

// //             const insertRejectionCorrectiveQuery = `
// //           INSERT INTO Production_CorrectiveActions (
// //             actionId, entryId, action, responsible, dueDate
// //           ) VALUES (
// //             @actionId, @entryId, @action, @responsible, @dueDate
// //           )
// //         `;
// //             await correctiveRequest.query(insertRejectionCorrectiveQuery);
// //           }
// //         }

// //         // ✅ Create Rejection Task (independently)
// //         if (entry.assignedToTeam) {
// //           const teams = entry.assignedToTeam
// //             .split(",")
// //             .map((team) => team.trim())
// //             .filter((t) => t !== "");
// //           for (const team of teams) {
// //             const taskParams = {
// //               productionCode,
// //               recordId,
// //               taskType: "rejection",
// //               title: `Production Rejection: ${entry.type}`,
// //               description: `Rejected quantities for product ${product}: ${entry.type} (${entry.quantity}) - ${entry.reason}`,
// //               assignedTo: null,
// //               dueDate: null,
// //               rejectionReason: entry.reason,
// //               quantity: Number(entry.quantity),
// //               equipment: machineName,
// //               assignedTeam: team,
// //             };
// //             const task = await createTask(transaction, taskParams);
// //             createdTasks.push(task);
// //           }
// //         }
// //       }
// //     }

// //     // Insert Downtime Corrective Actions + Create Tasks
// //     if (
// //       downtimeCorrectiveActions &&
// //       downtimeCorrectiveActions.length > 0 &&
// //       downtimeType &&
// //       downtimeType !== "none"
// //     ) {
// //       for (const action of downtimeCorrectiveActions) {
// //         const actionId = uuidv4();
// //         const downtimeCorrectiveRequest = new sql.Request(transaction);
// //         downtimeCorrectiveRequest.input(
// //           "actionId",
// //           sql.UniqueIdentifier,
// //           actionId
// //         );
// //         downtimeCorrectiveRequest.input(
// //           "recordId",
// //           sql.UniqueIdentifier,
// //           recordId
// //         );
// //         downtimeCorrectiveRequest.input(
// //           "action",
// //           sql.NVarChar(sql.MAX),
// //           action.action
// //         );
// //         downtimeCorrectiveRequest.input(
// //           "responsible",
// //           sql.NVarChar(100),
// //           action.responsible
// //         );
// //         downtimeCorrectiveRequest.input(
// //           "dueDate",
// //           sql.Date,
// //           // new Date(action.dueDate)
// //           action.dueDate ? new Date(action.dueDate) : null
// //         );
// //         downtimeCorrectiveRequest.input(
// //           "downtimeType",
// //           sql.NVarChar(50),
// //           downtimeLabel || null
// //         );

// //         const insertDowntimeCorrectiveQuery = `
// //       INSERT INTO Production_DowntimeCorrectiveActions (
// //         actionId, recordId, action, responsible, dueDate, downtimeType
// //       ) VALUES (
// //         @actionId, @recordId, @action, @responsible, @dueDate, @downtimeType
// //       )
// //     `;
// //         await downtimeCorrectiveRequest.query(insertDowntimeCorrectiveQuery);
// //       }
// //     }

// //     // ✅ Create Downtime Task (independently)
// //     if (downtimeType && downtimeType !== "none" && team) {
// //       const teams = team
// //         .split(",")
// //         .map((team) => team.trim())
// //         .filter((t) => t !== "");
// //       for (const t of teams) {
// //         const taskParams = {
// //           productionCode,
// //           recordId,
// //           taskType: "downtime",
// //           title: `Production Downtime: ${downtimeLabel}`,
// //           description: `Downtime reported for machine ${machineName}: ${downtime} minutes - ${downtimeLabel}`,
// //           assignedTo: null,
// //           dueDate: null,
// //           rejectionReason: null,
// //           quantity: Number(downtime),
// //           equipment: machineName,
// //           assignedTeam: t,
// //         };
// //         const task = await createTask(transaction, taskParams);
// //         createdTasks.push(task);
// //       }
// //     }

// //     await transaction.commit();

// //     res.status(201).json({
// //       message: "Production record added successfullyyyy",
// //       recordId,
// //       tasks: createdTasks,
// //     });

// //     console.log(
// //       `✅ Production record inserted: ${recordId} with ${createdTasks.length} task(s)`
// //     );
// //   } catch (err) {
// //     console.error("❌ SQL Error inside transaction:", err);
// //     if (!transaction._aborted) {
// //       await transaction.rollback();
// //       console.log("✅ Transaction rolled back");
// //     }
// //     res.status(500).json({
// //       message: "Failed to add production record",
// //       error:
// //         process.env.NODE_ENV === "development"
// //           ? err.message
// //           : "Internal server error",
// //     });
// //   }
// // });

// // // =========================== DELETE: Delete Production Record ==========================
// // router.delete("/production/:recordId", authMiddleware, async (req, res) => {
// //   const pool = await poolPromise;
// //   const transaction = new sql.Transaction(pool);

// //   try {
// //     const { recordId } = req.params;

// //     if (
// //       !recordId ||
// //       !/^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/.test(
// //         recordId
// //       )
// //     ) {
// //       return res.status(400).json({
// //         message: "Invalid record ID",
// //         error: "Record ID must be a valid UUID",
// //       });
// //     }

// //     await transaction.begin();
// //     const request = new sql.Request(transaction);

// //     // Delete production record (cascades to RejectionEntries and Production_DowntimeCorrectiveActions via foreign keys)
// //     request.input("recordId", sql.UniqueIdentifier, recordId);
// //     const deleteProductionQuery =
// //       "DELETE FROM ProductionRecords WHERE recordId = @recordId";
// //     const result = await request.query(deleteProductionQuery);

// //     if (result.rowsAffected[0] === 0) {
// //       await transaction.rollback();
// //       return res.status(404).json({
// //         message: "Production record not found",
// //         error: "No record matches the provided ID",
// //       });
// //     }

// //     await transaction.commit();
// //     res.json({ message: "Production record deleted successfully" });
// //     console.log(`✅ Production record deleted: ${recordId}`);
// //   } catch (err) {
// //     console.error("❌ Error deleting production record:", err);
// //     if (!transaction._aborted) {
// //       await transaction.rollback();
// //       console.log("✅ Transaction rolled back");
// //     }
// //     res.status(500).json({
// //       message: "Failed to delete production record",
// //       error:
// //         process.env.NODE_ENV === "development"
// //           ? err.message
// //           : "Internal server error",
// //     });
// //   }
// // });

// // export default router;
