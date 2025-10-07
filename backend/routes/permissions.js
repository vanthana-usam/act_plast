
import express from 'express';
import sql from 'mssql';
import { v4 as uuidv4 } from 'uuid';
import { executeQuery } from '../utils/helper.js';
import authMiddleware from '../middleware/authMiddleware.js';

const router = express.Router();

// Get all permissions
router.get('/permissions', authMiddleware, async (req, res) => {
  try {
    const data = await executeQuery(
      `SELECT employeeGroup, tabId FROM TabPermissions`
    );

    const permissions = {};
    data.forEach(row => {
      if (!permissions[row.employeeGroup]) permissions[row.employeeGroup] = [];
      permissions[row.employeeGroup].push(row.tabId);
    });

    res.json(permissions);
  } catch (err) {
    console.error('Error fetching permissions:', err);
    res.status(500).json({ error: 'Failed to fetch permissions', details: err.message });
  }
});

// Update permissions
router.post('/permissions', authMiddleware, async (req, res) => {
  try {
    const permissions = req.body; // { Admin: ["dashboard","tasks"], Production: ["production"] }
    if (!permissions || Object.keys(permissions).length === 0) {
      return res.status(400).json({ error: 'Permissions object is required' });
    }

    // Delete old permissions
    await executeQuery(`DELETE FROM TabPermissions`);

    const insertPromises = [];

    Object.keys(permissions).forEach(group => {
      permissions[group].forEach(tabId => {
        const permissionId = uuidv4(); // generate UUID
        insertPromises.push(
          executeQuery(
            `INSERT INTO TabPermissions (permissionId, employeeGroup, tabId)
             VALUES (@id, @group, @tabId)`,
            [
              { name: 'id', type: sql.UniqueIdentifier, value: permissionId },
              { name: 'group', type: sql.NVarChar(50), value: group },
              { name: 'tabId', type: sql.NVarChar(50), value: tabId },
            ]
          )
        );
      });
    });

    await Promise.all(insertPromises);

    res.json({ message: 'Permissions updated successfully' });
  } catch (err) {
    console.error('Error updating permissions:', err);
    res.status(500).json({ error: 'Failed to update permissions', details: err.message });
  }
});

export default router;
