// // // import express from 'express';
// // // import { sql, poolPromise } from '../db.js';
// // // import { body, param, validationResult } from 'express-validator';
// // // // import { v4: }
// // // import { v4 } from 'uuid';
// // // const router = express.Router();

// // // // Validation middleware for POST and PUT
// // // const momValidation = [
// // //   body('title').trim().notEmpty().withMessage('Title is required'),
// // //   body('meetingDate').isDate().withMessage('Valid meeting date is required'),
// // //   body('department').trim().notEmpty().withMessage('Department is required'),
// // //   body('status').trim().notEmpty().withMessage('Status is required'),
// // //   body('attendees').trim().notEmpty().withMessage('Attendees are required'),
// // //   body('actionItems')
// // //     .isArray({ min: 1 })
// // //     .withMessage('At least one action item is required'),
// // //   body('actionItems.*.description')
// // //     .trim()
// // //     .notEmpty()
// // //     .withMessage('Action item description is required'),
// // //   body('actionItems.*.assignedTo')
// // //     .trim()
// // //     .notEmpty()
// // //     .withMessage('Action item assignedTo is required'),
// // //   body('actionItems.*.dueDate')
// // //     .isDate()
// // //     .withMessage('Valid due date is required for action item'),
// // // ];

// // // const generateUUID = () => uuidv4();

// // // const momId = generateUUID();


// // // // ================== GET all MOMs ==================
// // // router.get('/mom', async (req, res) => {
// // //   try {
// // //     const pool = await poolPromise;

// // //     const momsResult = await pool.request().query(`
// // //       SELECT momId AS MOMId, Title, MeetingDate, Department, Status, Attendees, Summary, Decisions
// // //       FROM MOM
// // //       ORDER BY MeetingDate DESC
// // //     `);

// // //     const moms = momsResult.recordset;

// // //     const actionsResult = await pool.request().query(`
// // //       SELECT ActionId, momId, Description AS description, AssignedTo AS assignedTo, DueDate AS dueDate
// // //       FROM MOM_ActionItems
// // //     `);

// // //     const actions = actionsResult.recordset;

// // //     const momsWithActions = moms.map((mom) => ({
// // //       ...mom,
// // //       ActionItems: actions
// // //         .filter((a) => a.momId === mom.MOMId)
// // //         .map(({ ActionId, momId, ...rest }) => rest),
// // //     }));

// // //     res.json(momsWithActions);
// // //   } catch (err) {
// // //     console.error('Error fetching MOMs:', err);
// // //     res.status(500).json({ success: false, error: 'Internal server error' });
// // //   }
// // // });

// // // // ================== GET MOM by ID ==================
// // // router.get(
// // //   '/mom/:id',
// // //   [param('id').isUUID().withMessage('Invalid MOM ID')],
// // //   async (req, res) => {
// // //     const errors = validationResult(req);
// // //     if (!errors.isEmpty()) {
// // //       return res.status(400).json({ success: false, errors: errors.array() });
// // //     }

// // //     try {
// // //       const { id } = req.params;
// // //       const pool = await poolPromise;

// // //       const momResult = await pool.request()
// // //         .input('momId', sql.UniqueIdentifier, id)
// // //         .query(`
// // //         SELECT momId AS MOMId, Title, MeetingDate, Department, Status, Attendees, Summary, Decisions
// // //         FROM MOM
// // //         WHERE momId = @momId
// // //       `);

// // //       if (momResult.recordset.length === 0) {
// // //         return res.status(404).json({ success: false, error: 'MOM not found' });
// // //       }

// // //       const mom = momResult.recordset[0];

// // //       const actionsResult = await pool.request()
// // //         .input('momId', sql.UniqueIdentifier, id)
// // //         .query(`
// // //         SELECT ActionId, momId, Description AS description, AssignedTo AS assignedTo, DueDate AS dueDate
// // //         FROM MOM_ActionItems
// // //         WHERE momId = @momId
// // //       `);

// // //       res.json({
// // //         ...mom,
// // //         ActionItems: actionsResult.recordset.map(
// // //           ({ ActionId, momId, ...rest }) => rest
// // //         ),
// // //       });
// // //     } catch (err) {
// // //       console.error('Error fetching MOM by ID:', err);
// // //       res.status(500).json({ success: false, error: 'Internal server error' });
// // //     }
// // //   }
// // // );

// // // // ================== CREATE MOM ==================
// // // router.post('/mom', momValidation, async (req, res) => {
// // //   const errors = validationResult(req);
// // //   if (!errors.isEmpty()) {
// // //     return res.status(400).json({ success: false, errors: errors.array() });
// // //   }

// // //   const pool = await poolPromise;
// // //   const {
// // //     title,
// // //     meetingDate,
// // //     department,
// // //     status,
// // //     attendees,
// // //     summary = '',
// // //     decisions = '',
// // //     actionItems,
// // //   } = req.body;

// // //   let transaction;
// // //   try {
// // //     transaction = new sql.Transaction(pool);
// // //     await transaction.begin();

// // //     const momId = generateUUID()();

// // //     await transaction
// // //       .request()
// // //       .input('momId', sql.UniqueIdentifier, momId)
// // //       .input('Title', sql.NVarChar, title)
// // //       .input('MeetingDate', sql.Date, meetingDate)
// // //       .input('Department', sql.NVarChar, department)
// // //       .input('Status', sql.NVarChar, status)
// // //       .input('Attendees', sql.NVarChar, attendees)
// // //       .input('Summary', sql.NVarChar, summary || null)
// // //       .input('Decisions', sql.NVarChar, decisions || null)
// // //       .query(`
// // //         INSERT INTO MOM (momId, Title, MeetingDate, Department, Status, Attendees, Summary, Decisions)
// // //         VALUES (@momId, @Title, @MeetingDate, @Department, @Status, @Attendees, @Summary, @Decisions)
// // //       `);

// // //     for (const item of actionItems) {
// // //       await transaction
// // //         .request()
// // //         .input('ActionId', sql.UniqueIdentifier, generateUUID()())
// // //         .input('momId', sql.UniqueIdentifier, momId)
// // //         .input('Description', sql.NVarChar, item.description)
// // //         .input('AssignedTo', sql.NVarChar, item.assignedTo)
// // //         .input('DueDate', sql.Date, item.dueDate)
// // //         .query(`
// // //           INSERT INTO MOM_ActionItems (ActionId, momId, Description, AssignedTo, DueDate)
// // //           VALUES (@ActionId, @momId, @Description, @AssignedTo, @DueDate)
// // //         `);
// // //     }

// // //     await transaction.commit();
// // //     res.json({ success: true, momId });
// // //   } catch (err) {
// // //     if (transaction) await transaction.rollback();
// // //     console.error('Error creating MOM:', err);
// // //     res.status(500).json({ success: false, error: 'Internal server error' });
// // //   }
// // // });



// // import express from 'express';
// // import { sql, poolPromise } from '../db.js';
// // import { body, param, validationResult } from 'express-validator';
// // import { v4 as uuidv4 } from 'uuid';   // ✅ correct import

// // const router = express.Router();

// // // Validation middleware
// // const momValidation = [
// //   body('title').trim().notEmpty().withMessage('Title is required'),
// //   body('meetingDate').isDate().withMessage('Valid meeting date is required'),
// //   body('department').trim().notEmpty().withMessage('Department is required'),
// //   body('status').trim().notEmpty().withMessage('Status is required'),
// //   body('attendees').trim().notEmpty().withMessage('Attendees are required'),
// //   body('actionItems').isArray({ min: 1 }).withMessage('At least one action item is required'),
// //   body('actionItems.*.description').trim().notEmpty().withMessage('Action item description is required'),
// //   body('actionItems.*.assignedTo').trim().notEmpty().withMessage('Action item assignedTo is required'),
// //   body('actionItems.*.dueDate').isDate().withMessage('Valid due date is required for action item'),
// // ];

// // const generateUUID = () => uuidv4();  // ✅ fixed

// // // ================== CREATE MOM ==================
// // router.post('/mom', momValidation, async (req, res) => {
// //   const errors = validationResult(req);
// //   if (!errors.isEmpty()) {
// //     return res.status(400).json({ success: false, errors: errors.array() });
// //   }

// //   const pool = await poolPromise;
// //   const {
// //     title,
// //     meetingDate,
// //     department,
// //     status,
// //     attendees,
// //     summary = '',
// //     decisions = '',
// //     actionItems,
// //   } = req.body;

// //   let transaction;
// //   try {
// //     transaction = new sql.Transaction(pool);
// //     await transaction.begin();

// //     const momId = generateUUID();   // ✅ no double ()
    
// //     await transaction
// //       .request()
// //       .input('momId', sql.UniqueIdentifier, momId)
// //       .input('Title', sql.NVarChar, title)
// //       .input('MeetingDate', sql.Date, meetingDate)
// //       .input('Department', sql.NVarChar, department)
// //       .input('Status', sql.NVarChar, status)
// //       .input('Attendees', sql.NVarChar, attendees)
// //       .input('Summary', sql.NVarChar, summary || null)
// //       .input('Decisions', sql.NVarChar, decisions || null)
// //       .query(`
// //         INSERT INTO MOM (momId, Title, MeetingDate, Department, Status, Attendees, Summary, Decisions)
// //         VALUES (@momId, @Title, @MeetingDate, @Department, @Status, @Attendees, @Summary, @Decisions)
// //       `);

// //     for (const item of actionItems) {
// //       await transaction
// //         .request()
// //         .input('ActionId', sql.UniqueIdentifier, generateUUID())  // ✅ fixed
// //         .input('momId', sql.UniqueIdentifier, momId)
// //         .input('Description', sql.NVarChar, item.description)
// //         .input('AssignedTo', sql.NVarChar, item.assignedTo)
// //         .input('DueDate', sql.Date, item.dueDate)
// //         .query(`
// //           INSERT INTO MOM_ActionItems (ActionId, momId, Description, AssignedTo, DueDate)
// //           VALUES (@ActionId, @momId, @Description, @AssignedTo, @DueDate)
// //         `);
// //     }

// //     await transaction.commit();
// //     res.json({ success: true, momId });
// //   } catch (err) {
// //     if (transaction) await transaction.rollback();
// //     console.error('Error creating MOM:', err);
// //     res.status(500).json({ success: false, error: 'Internal server error' });
// //   }
// // });


// // // ================== UPDATE MOM ==================
// // router.put(
// //   '/mom/:id',
// //   [param('id').isUUID().withMessage('Invalid MOM ID'), ...momValidation],
// //   async (req, res) => {
// //     const errors = validationResult(req);
// //     if (!errors.isEmpty()) {
// //       return res.status(400).json({ success: false, errors: errors.array() });
// //     }

// //     const { id } = req.params;
// //     const {
// //       title,
// //       meetingDate,
// //       department,
// //       status,
// //       attendees,
// //       summary = '',
// //       decisions = '',
// //       actionItems,
// //     } = req.body;

// //     let transaction;
// //     try {
// //       const pool = await poolPromise;
// //       transaction = new sql.Transaction(pool);
// //       await transaction.begin();

// //       // Check if MOM exists
// //       const momCheck = await transaction
// //         .request()
// //         .input('momId', sql.UniqueIdentifier, id)
// //         .query(`SELECT 1 FROM MOM WHERE momId = @momId`);

// //       if (momCheck.recordset.length === 0) {
// //         await transaction.rollback();
// //         return res.status(404).json({ success: false, error: 'MOM not found' });
// //       }

// //       // Update main MOM record
// //       await transaction
// //         .request()
// //         .input('momId', sql.UniqueIdentifier, id)
// //         .input('Title', sql.NVarChar, title)
// //         .input('MeetingDate', sql.Date, meetingDate)
// //         .input('Department', sql.NVarChar, department)
// //         .input('Status', sql.NVarChar, status)
// //         .input('Attendees', sql.NVarChar, attendees)
// //         .input('Summary', sql.NVarChar, summary || null)
// //         .input('Decisions', sql.NVarChar, decisions || null)
// //         .query(`
// //         UPDATE MOM
// //         SET Title = @Title,
// //             MeetingDate = @MeetingDate,
// //             Department = @Department,
// //             Status = @Status,
// //             Attendees = @Attendees,
// //             Summary = @Summary,
// //             Decisions = @Decisions
// //         WHERE momId = @momId
// //       `);

// //       // Clear old action items
// //       await transaction
// //         .request()
// //         .input('momId', sql.UniqueIdentifier, id)
// //         .query(`DELETE FROM MOM_ActionItems WHERE momId = @momId`);

// //       // Insert new action items
// //       for (const item of actionItems) {
// //         await transaction
// //           .request()
// //           .input('ActionId', sql.UniqueIdentifier, generateUUID()())
// //           .input('momId', sql.UniqueIdentifier, id)
// //           .input('Description', sql.NVarChar, item.description)
// //           .input('AssignedTo', sql.NVarChar, item.assignedTo)
// //           .input('DueDate', sql.Date, item.dueDate)
// //           .query(`
// //           INSERT INTO MOM_ActionItems (ActionId, momId, Description, AssignedTo, DueDate)
// //           VALUES (@ActionId, @momId, @Description, @AssignedTo, @DueDate)
// //         `);
// //       }

// //       await transaction.commit();
// //       res.json({ success: true, momId: id });
// //     } catch (err) {
// //       if (transaction) await transaction.rollback();
// //       console.error('Error updating MOM:', err);
// //       res.status(500).json({ success: false, error: 'Internal server error' });
// //     }
// //   }
// // );

// // // ================== DELETE MOM ==================
// // router.delete(
// //   '/mom/:id',
// //   [param('id').isUUID().withMessage('Invalid MOM ID')],
// //   async (req, res) => {
// //     const errors = validationResult(req);
// //     if (!errors.isEmpty()) {
// //       return res.status(400).json({ success: false, errors: errors.array() });
// //     }

// //     const { id } = req.params;
// //     let transaction;
// //     try {
// //       const pool = await poolPromise;
// //       transaction = new sql.Transaction(pool);
// //       await transaction.begin();

// //       // Check if MOM exists
// //       const momCheck = await transaction
// //         .request()
// //         .input('momId', sql.UniqueIdentifier, id)
// //         .query(`SELECT 1 FROM MOM WHERE momId = @momId`);

// //       if (momCheck.recordset.length === 0) {
// //         await transaction.rollback();
// //         return res.status(404).json({ success: false, error: 'MOM not found' });
// //       }

// //       // Delete child action items first
// //       await transaction
// //         .request()
// //         .input('momId', sql.UniqueIdentifier, id)
// //         .query(`DELETE FROM MOM_ActionItems WHERE momId = @momId`);

// //       // Delete MOM itself
// //       await transaction
// //         .request()
// //         .input('momId', sql.UniqueIdentifier, id)
// //         .query(`DELETE FROM MOM WHERE momId = @momId`);

// //       await transaction.commit();
// //       res.json({ success: true, momId: id });
// //     } catch (err) {
// //       if (transaction) await transaction.rollback();
// //       console.error('Error deleting MOM:', err);
// //       res.status(500).json({ success: false, error: 'Internal server error' });
// //     }
// //   }
// // );

// // export default router;



// // File: routes/mom.js
// import express from 'express';
// import { sql, poolPromise } from '../db.js';
// import { body, param, validationResult } from 'express-validator';
// import { v4 as uuidv4 } from 'uuid';
// import cors from 'cors';

// const router = express.Router();

// // Enable CORS for the frontend origin
// router.use(cors({ origin: 'http://localhost:3000' }));

// // Validation middleware for POST and PUT
// const momValidation = [
//   body('title').trim().notEmpty().withMessage('Title is required'),
//   body('meetingDate').isDate().withMessage('Valid meeting date is required'),
//   body('department').trim().notEmpty().withMessage('Department is required'),
//   body('status').trim().notEmpty().withMessage('Status is required'),
//   body('attendees').trim().notEmpty().withMessage('Attendees are required'),
//   body('actionItems')
//     .isArray({ min: 1 })
//     .withMessage('At least one action item is required'),
//   body('actionItems.*.description')
//     .trim()
//     .notEmpty()
//     .withMessage('Action item description is required'),
//   body('actionItems.*.assignedTo')
//     .trim()
//     .notEmpty()
//     .withMessage('Action item assignedTo is required'),
//   body('actionItems.*.dueDate')
//     .isDate()
//     .withMessage('Valid due date is required for action item'),
// ];

// const generateUUID = () => uuidv4();

// // GET all MOMs
// router.get('/mom', async (req, res) => {
//   try {
//     const pool = await poolPromise;

//     const momsResult = await pool.request().query(`
//       SELECT momId AS MOMId, Title, MeetingDate, Department, Status, Attendees, Summary, Decisions
//       FROM MOM
//       ORDER BY MeetingDate DESC
//     `);

//     const moms = momsResult.recordset;

//     const actionsResult = await pool.request().query(`
//       SELECT ActionId, momId, Description AS description, AssignedTo AS assignedTo, DueDate AS dueDate
//       FROM MOM_ActionItems
//     `);

//     const actions = actionsResult.recordset;

//     const momsWithActions = moms.map((mom) => ({
//       ...mom,
//       ActionItems: actions
//         .filter((a) => a.momId === mom.MOMId)
//         .map(({ ActionId, momId, ...rest }) => rest),
//     }));

//     res.json(momsWithActions);
//   } catch (err) {
//     console.error('Error fetching MOMs:', {
//       message: err.message,
//       stack: err.stack,
//     });
//     res.status(500).json({ success: false, error: 'Failed to fetch MOMs', details: err.message });
//   }
// });

// // GET MOM by ID
// router.get(
//   '/mom/:id',
//   [param('id').isUUID().withMessage('Invalid MOM ID')],
//   async (req, res) => {
//     const errors = validationResult(req);
//     if (!errors.isEmpty()) {
//       return res.status(400).json({ success: false, errors: errors.array() });
//     }

//     try {
//       const { id } = req.params;
//       const pool = await poolPromise;

//       const momResult = await pool.request()
//         .input('momId', sql.UniqueIdentifier, id)
//         .query(`
//         SELECT momId AS MOMId, Title, MeetingDate, Department, Status, Attendees, Summary, Decisions
//         FROM MOM
//         WHERE momId = @momId
//       `);

//       if (momResult.recordset.length === 0) {
//         return res.status(404).json({ success: false, error: 'MOM not found' });
//       }

//       const mom = momResult.recordset[0];

//       const actionsResult = await pool.request()
//         .input('momId', sql.UniqueIdentifier, id)
//         .query(`
//         SELECT ActionId, momId, Description AS description, AssignedTo AS assignedTo, DueDate AS dueDate
//         FROM MOM_ActionItems
//         WHERE momId = @momId
//       `);

//       res.json({
//         ...mom,
//         ActionItems: actionsResult.recordset.map(
//           ({ ActionId, momId, ...rest }) => rest
//         ),
//       });
//     } catch (err) {
//       console.error('Error fetching MOM by ID:', {
//         message: err.message,
//         stack: err.stack,
//       });
//       res.status(500).json({ success: false, error: 'Failed to fetch MOM', details: err.message });
//     }
//   }
// );

// // CREATE MOM
// router.post('/mom', momValidation, async (req, res) => {
//   const errors = validationResult(req);
//   if (!errors.isEmpty()) {
//     return res.status(400).json({ success: false, errors: errors.array() });
//   }

//   const pool = await poolPromise;
//   const {
//     title,
//     meetingDate,
//     department,
//     status,
//     attendees,
//     summary = '',
//     decisions = '',
//     actionItems,
//   } = req.body;

//   let transaction;
//   try {
//     transaction = new sql.Transaction(pool);
//     await transaction.begin();

//     const momId = generateUUID();

//     await transaction
//       .request()
//       .input('momId', sql.UniqueIdentifier, momId)
//       .input('Title', sql.NVarChar, title)
//       .input('MeetingDate', sql.Date, meetingDate)
//       .input('Department', sql.NVarChar, department)
//       .input('Status', sql.NVarChar, status)
//       .input('Attendees', sql.NVarChar, attendees)
//       .input('Summary', sql.NVarChar, summary || null)
//       .input('Decisions', sql.NVarChar, decisions || null)
//       .query(`
//         INSERT INTO MOM (momId, Title, MeetingDate, Department, Status, Attendees, Summary, Decisions)
//         VALUES (@momId, @Title, @MeetingDate, @Department, @Status, @Attendees, @Summary, @Decisions)
//       `);

//     for (const item of actionItems) {
//       await transaction
//         .request()
//         .input('ActionId', sql.UniqueIdentifier, generateUUID())
//         .input('momId', sql.UniqueIdentifier, momId)
//         .input('Description', sql.NVarChar, item.description)
//         .input('AssignedTo', sql.NVarChar, item.assignedTo)
//         .input('DueDate', sql.Date, item.dueDate)
//         .query(`
//           INSERT INTO MOM_ActionItems (ActionId, momId, Description, AssignedTo, DueDate)
//           VALUES (@ActionId, @momId, @Description, @AssignedTo, @DueDate)
//         `);
//     }

//     await transaction.commit();
//     res.json({ success: true, momId });
//   } catch (err) {
//     if (transaction) await transaction.rollback();
//     console.error('Error creating MOM:', {
//       message: err.message,
//       stack: err.stack,
//     });
//     res.status(500).json({ success: false, error: 'Failed to create MOM', details: err.message });
//   }
// });

// // UPDATE MOM
// router.put(
//   '/mom/:id',
//   [param('id').isUUID().withMessage('Invalid MOM ID'), ...momValidation],
//   async (req, res) => {
//     const errors = validationResult(req);
//     if (!errors.isEmpty()) {
//       return res.status(400).json({ success: false, errors: errors.array() });
//     }

//     const { id } = req.params;
//     const {
//       title,
//       meetingDate,
//       department,
//       status,
//       attendees,
//       summary = '',
//       decisions = '',
//       actionItems,
//     } = req.body;

//     let transaction;
//     try {
//       const pool = await poolPromise;
//       transaction = new sql.Transaction(pool);
//       await transaction.begin();

//       // Check if MOM exists
//       const momCheck = await transaction
//         .request()
//         .input('momId', sql.UniqueIdentifier, id)
//         .query(`SELECT 1 FROM MOM WHERE momId = @momId`);

//       if (momCheck.recordset.length === 0) {
//         await transaction.rollback();
//         return res.status(404).json({ success: false, error: 'MOM not found' });
//       }

//       // Update main MOM record
//       await transaction
//         .request()
//         .input('momId', sql.UniqueIdentifier, id)
//         .input('Title', sql.NVarChar, title)
//         .input('MeetingDate', sql.Date, meetingDate)
//         .input('Department', sql.NVarChar, department)
//         .input('Status', sql.NVarChar, status)
//         .input('Attendees', sql.NVarChar, attendees)
//         .input('Summary', sql.NVarChar, summary || null)
//         .input('Decisions', sql.NVarChar, decisions || null)
//         .query(`
//         UPDATE MOM
//         SET Title = @Title,
//             MeetingDate = @MeetingDate,
//             Department = @Department,
//             Status = @Status,
//             Attendees = @Attendees,
//             Summary = @Summary,
//             Decisions = @Decisions
//         WHERE momId = @momId
//       `);

//       // Clear old action items
//       await transaction
//         .request()
//         .input('momId', sql.UniqueIdentifier, id)
//         .query(`DELETE FROM MOM_ActionItems WHERE momId = @momId`);

//       // Insert new action items
//       for (const item of actionItems) {
//         await transaction
//           .request()
//           .input('ActionId', sql.UniqueIdentifier, generateUUID())
//           .input('momId', sql.UniqueIdentifier, id)
//           .input('Description', sql.NVarChar, item.description)
//           .input('AssignedTo', sql.NVarChar, item.assignedTo)
//           .input('DueDate', sql.Date, item.dueDate)
//           .query(`
//           INSERT INTO MOM_ActionItems (ActionId, momId, Description, AssignedTo, DueDate)
//           VALUES (@ActionId, @momId, @Description, @AssignedTo, @DueDate)
//         `);
//       }

//       await transaction.commit();
//       res.json({ success: true, momId: id });
//     } catch (err) {
//       if (transaction) await transaction.rollback();
//       console.error('Error updating MOM:', {
//         message: err.message,
//         stack: err.stack,
//       });
//       res.status(500).json({ success: false, error: 'Failed to update MOM', details: err.message });
//     }
//   }
// );

// // DELETE MOM
// router.delete(
//   '/mom/:id',
//   [param('id').isUUID().withMessage('Invalid MOM ID')],
//   async (req, res) => {
//     const errors = validationResult(req);
//     if (!errors.isEmpty()) {
//       return res.status(400).json({ success: false, errors: errors.array() });
//     }

//     const { id } = req.params;
//     let transaction;
//     try {
//       const pool = await poolPromise;
//       transaction = new sql.Transaction(pool);
//       await transaction.begin();

//       // Check if MOM exists
//       const momCheck = await transaction
//         .request()
//         .input('momId', sql.UniqueIdentifier, id)
//         .query(`SELECT 1 FROM MOM WHERE momId = @momId`);

//       if (momCheck.recordset.length === 0) {
//         await transaction.rollback();
//         return res.status(404).json({ success: false, error: 'MOM not found' });
//       }

//       // Delete child action items first
//       await transaction
//         .request()
//         .input('momId', sql.UniqueIdentifier, id)
//         .query(`DELETE FROM MOM_ActionItems WHERE momId = @momId`);

//       // Delete MOM itself
//       await transaction
//         .request()
//         .input('momId', sql.UniqueIdentifier, id)
//         .query(`DELETE FROM MOM WHERE momId = @momId`);

//       await transaction.commit();
//       res.json({ success: true, momId: id });
//     } catch (err) {
//       if (transaction) await transaction.rollback();
//       console.error('Error deleting MOM:', {
//         message: err.message,
//         stack: err.stack,
//       });
//       res.status(500).json({ success: false, error: 'Failed to delete MOM', details: err.message });
//     }
//   }
// );

// export default router;


import express from 'express';
import { sql, poolPromise } from '../db.js';
import { body, param, validationResult } from 'express-validator';
import { v4 as uuidv4 } from 'uuid';
import authMiddleware from '../middleware/authMiddleware.js';

const router = express.Router();

const generateUUID = () => uuidv4();

// Validation middleware for POST and PUT
const momValidation = [
  body('title').trim().notEmpty().withMessage('Title is required'),
  body('meetingDate').isDate().withMessage('Valid meeting date is required'),
  body('department').trim().notEmpty().withMessage('Department is required'),
  body('status').trim().notEmpty().withMessage('Status is required'),
  body('attendees').trim().notEmpty().withMessage('Attendees are required'),
  body('actionItems')
    .isArray({ min: 1 })
    .withMessage('At least one action item is required'),
  body('actionItems.*.description')
    .trim()
    .notEmpty()
    .withMessage('Action item description is required'),
  body('actionItems.*.assignedTo')
    .trim()
    .notEmpty()
    .withMessage('Action item assignedTo is required'),
  body('actionItems.*.dueDate')
    .isDate()
    .withMessage('Valid due date is required for action item'),
];

// GET all MOMs
router.get('/mom',authMiddleware, async (req, res) => {
  try {
    const pool = await poolPromise;

    const momsResult = await pool.request().query(`
      SELECT momId AS MOMId, Title, MeetingDate, Department, Status, Attendees, Summary, Decisions
      FROM MOM
      ORDER BY MeetingDate DESC
    `);

    const moms = momsResult.recordset;

    const actionsResult = await pool.request().query(`
      SELECT actionId, momId, Description AS description, AssignedTo AS assignedTo, DueDate AS dueDate
      FROM MOM_ActionItems
    `);

    const actions = actionsResult.recordset;

    const momsWithActions = moms.map((mom) => ({
      ...mom,
      ActionItems: actions
        .filter((a) => a.momId === mom.MOMId)
        .map(({ momId, ...rest }) => rest),
    }));

    res.json(momsWithActions);
  } catch (err) {
    console.error('Error fetching MOMs:', err);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

// GET MOM by ID
router.get(
  '/mom/:id',
  [param('id').isUUID().withMessage('Invalid MOM ID')],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    try {
      const { id } = req.params;
      const pool = await poolPromise;

      const momResult = await pool.request()
        .input('momId', sql.UniqueIdentifier, id)
        .query(`
        SELECT momId AS MOMId, Title, MeetingDate, Department, Status, Attendees, Summary, Decisions
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
        SELECT actionId, momId, Description AS description, AssignedTo AS assignedTo, DueDate AS dueDate
        FROM MOM_ActionItems
        WHERE momId = @momId
      `);

      res.json({
        ...mom,
        ActionItems: actionsResult.recordset.map(({ momId, ...rest }) => rest),
      });
    } catch (err) {
      console.error('Error fetching MOM by ID:', err);
      res.status(500).json({ success: false, error: 'Internal server error' });
    }
  }
);

// CREATE MOM
router.post('/mom', momValidation, async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, errors: errors.array() });
  }

  const pool = await poolPromise;
  const {
    title,
    meetingDate,
    department,
    status,
    attendees,
    summary = '',
    decisions = '',
    actionItems,
  } = req.body;

  let transaction;
  try {
    transaction = new sql.Transaction(pool);
    await transaction.begin();

    const momId = generateUUID();

    await transaction
      .request()
      .input('momId', sql.UniqueIdentifier, momId)
      .input('Title', sql.NVarChar, title)
      .input('MeetingDate', sql.Date, meetingDate)
      .input('Department', sql.NVarChar, department)
      .input('Status', sql.NVarChar, status)
      .input('Attendees', sql.NVarChar, attendees)
      .input('Summary', sql.NVarChar, summary || null)
      .input('Decisions', sql.NVarChar, decisions || null)
      .query(`
        INSERT INTO MOM (momId, Title, MeetingDate, Department, Status, Attendees, Summary, Decisions)
        VALUES (@momId, @Title, @MeetingDate, @Department, @Status, @Attendees, @Summary, @Decisions)
      `);

    for (const item of actionItems) {
      await transaction
        .request()
        .input('actionId', sql.UniqueIdentifier, generateUUID())
        .input('momId', sql.UniqueIdentifier, momId)
        .input('Description', sql.NVarChar, item.description)
        .input('AssignedTo', sql.NVarChar, item.assignedTo)
        .input('DueDate', sql.Date, item.dueDate)
        .query(`
          INSERT INTO MOM_ActionItems (actionId, momId, Description, AssignedTo, DueDate)
          VALUES (@actionId, @momId, @Description, @AssignedTo, @DueDate)
        `);
    }

    await transaction.commit();
    res.json({ success: true, momId });
  } catch (err) {
    if (transaction) await transaction.rollback();
    console.error('Error creating MOM:', err);
    res.status(500).json({ success: false, error: `Failed to create MOM: ${err.message}` });
  }
});

// UPDATE MOM
router.put(
  '/mom/:id',
  [param('id').isUUID().withMessage('Invalid MOM ID'), ...momValidation],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const { id } = req.params;
    const {
      title,
      meetingDate,
      department,
      status,
      attendees,
      summary = '',
      decisions = '',
      actionItems,
    } = req.body;

    let transaction;
    try {
      const pool = await poolPromise;
      transaction = new sql.Transaction(pool);
      await transaction.begin();

      const momCheck = await transaction
        .request()
        .input('momId', sql.UniqueIdentifier, id)
        .query(`SELECT 1 FROM MOM WHERE momId = @momId`);

      if (momCheck.recordset.length === 0) {
        await transaction.rollback();
        return res.status(404).json({ success: false, error: 'MOM not found' });
      }

      await transaction
        .request()
        .input('momId', sql.UniqueIdentifier, id)
        .input('Title', sql.NVarChar, title)
        .input('MeetingDate', sql.Date, meetingDate)
        .input('Department', sql.NVarChar, department)
        .input('Status', sql.NVarChar, status)
        .input('Attendees', sql.NVarChar, attendees)
        .input('Summary', sql.NVarChar, summary || null)
        .input('Decisions', sql.NVarChar, decisions || null)
        .query(`
        UPDATE MOM
        SET Title = @Title,
            MeetingDate = @MeetingDate,
            Department = @Department,
            Status = @Status,
            Attendees = @Attendees,
            Summary = @Summary,
            Decisions = @Decisions
        WHERE momId = @momId
      `);

      await transaction
        .request()
        .input('momId', sql.UniqueIdentifier, id)
        .query(`DELETE FROM MOM_ActionItems WHERE momId = @momId`);

      for (const item of actionItems) {
        await transaction
          .request()
          .input('actionId', sql.UniqueIdentifier, generateUUID())
          .input('momId', sql.UniqueIdentifier, id)
          .input('Description', sql.NVarChar, item.description)
          .input('AssignedTo', sql.NVarChar, item.assignedTo)
          .input('DueDate', sql.Date, item.dueDate)
          .query(`
          INSERT INTO MOM_ActionItems (actionId, momId, Description, AssignedTo, DueDate)
          VALUES (@actionId, @momId, @Description, @AssignedTo, @DueDate)
        `);
      }

      await transaction.commit();
      res.json({ success: true, momId: id });
    } catch (err) {
      if (transaction) await transaction.rollback();
      console.error('Error updating MOM:', err);
      res.status(500).json({ success: false, error: `Failed to update MOM: ${err.message}` });
    }
  }
);

// DELETE MOM
router.delete(
  '/mom/:id',
  [param('id').isUUID().withMessage('Invalid MOM ID')],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const { id } = req.params;
    let transaction;
    try {
      const pool = await poolPromise;
      transaction = new sql.Transaction(pool);
      await transaction.begin();

      const momCheck = await transaction
        .request()
        .input('momId', sql.UniqueIdentifier, id)
        .query(`SELECT 1 FROM MOM WHERE momId = @momId`);

      if (momCheck.recordset.length === 0) {
        await transaction.rollback();
        return res.status(404).json({ success: false, error: 'MOM not found' });
      }

      await transaction
        .request()
        .input('momId', sql.UniqueIdentifier, id)
        .query(`DELETE FROM MOM_ActionItems WHERE momId = @momId`);

      await transaction
        .request()
        .input('momId', sql.UniqueIdentifier, id)
        .query(`DELETE FROM MOM WHERE momId = @momId`);

      await transaction.commit();
      res.json({ success: true, momId: id });
    } catch (err) {
      if (transaction) await transaction.rollback();
      console.error('Error deleting MOM:', err);
      res.status(500).json({ success: false, error: `Failed to delete MOM: ${err.message}` });
    }
  }
);

export default router;