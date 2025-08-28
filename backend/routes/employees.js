import express from 'express';
import { v4 as uuidv4 } from 'uuid';
import bcrypt from 'bcrypt';
import sql from 'mssql';
import executeQuery from '../utils/helper.js';

const router = express.Router();

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

// ✅ Create Employee
router.post('/api/employees', async (req, res) => {
  try {
    const { name, role, email, password, employeeGroup, status } = req.body;
    const employeeId = uuidv4();

    const hashedPassword = password ? await bcrypt.hash(password, 10) : null;

    const query = `
      INSERT INTO Employees (employeeId, name, role, email, password, employeeGroup, status)
      VALUES (@employeeId, @name, @role, @email, @password, @employeeGroup, @status)
    `;

    await executeQuery(query, [
      { name: 'employeeId', type: sql.UniqueIdentifier, value: employeeId },
      { name: 'name', type: sql.NVarChar(100), value: name },
      { name: 'role', type: sql.NVarChar(50), value: role || null },
      { name: 'email', type: sql.NVarChar(100), value: email },
      { name: 'password', type: sql.NVarChar(255), value: hashedPassword || null },
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

// ✅ Update Employee
router.put('/api/employees/:id', async (req, res) => {
  const { id } = req.params;
  const { name, role, email, password, employeeGroup, status } = req.body;

  try {
    // Check if email is already taken by another employee
    const existing = await executeQuery(
      `SELECT employeeId FROM Employees WHERE email = @email AND employeeId != @employeeId`,
      [
        { name: 'email', type: sql.NVarChar(100), value: email },
        { name: 'employeeId', type: sql.UniqueIdentifier, value: id },
      ]
    );

    if (existing.length > 0) {
      return res.status(400).json({ error: "Email is already in use by another employee." });
    }

    let query = `
      UPDATE Employees
      SET name = @name,
          role = @role,
          email = @email,
          employeeGroup = @employeeGroup,
          status = @status
    `;
    const params = [
      { name: 'employeeId', type: sql.UniqueIdentifier, value: id },
      { name: 'name', type: sql.NVarChar(100), value: name },
      { name: 'role', type: sql.NVarChar(50), value: role },
      { name: 'email', type: sql.NVarChar(100), value: email },
      { name: 'employeeGroup', type: sql.NVarChar(50), value: employeeGroup },
      { name: 'status', type: sql.NVarChar(20), value: status },
    ];

    // Add password only if provided
    if (password) {
      const hashedPassword = await bcrypt.hash(password, 10);
      query += `, password = @password`;
      params.push({ name: 'password', type: sql.NVarChar(255), value: hashedPassword });
    }

    query += ` WHERE employeeId = @employeeId`;

    await executeQuery(query, params);

    res.status(200).json({ message: "Employee updated successfully." });
  } catch (error) {
    console.error("❌ Error updating employee:", error);
    res.status(500).json({ error: "Internal server error", details: error.message });
  }
});

// ✅ Delete Employee
router.delete('/api/employees/:id', async (req, res) => {
  try {
    const { id } = req.params;

    await executeQuery(
      `DELETE FROM Employees WHERE employeeId = @employeeId`,
      [{ name: 'employeeId', type: sql.UniqueIdentifier, value: id }]
    );

    res.json({ message: 'Employee deleted successfully' });
  } catch (err) {
    console.error('❌ Error deleting employee:', err);
    res.status(500).json({ error: 'Failed to delete employee', details: err.message });
  }
});

export default router;
