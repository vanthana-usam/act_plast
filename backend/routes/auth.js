// import express from 'express';
// import sql from 'mssql';
// import bcrypt from 'bcrypt';
// import jwt from 'jsonwebtoken';
// // import executeQuery from '../utils/helper.js'; // adjust if default export
// import executeQuery from '../utils/helper.js';


// const router = express.Router();

// router.post('/login', async (req, res) => {
//   try {
//     const { email, password } = req.body;

//     if (!email || !password) {
//       return res.status(400).json({ message: 'Email and password are required' });
//     }

//     const result = await executeQuery(
//       'SELECT TOP 1 employeeId, name, email, password, role, employeeGroup  FROM Employees WHERE email = @email',
//       [{ name: 'email', type: sql.VarChar(100), value: email }]
//     );

//     if (result.length === 0) {
//       return res.status(401).json({ message: 'Invalid credentials' });
//     }

//     const user = result[0];
//     const passwordMatch = await bcrypt.compare(password, user.password);

//     if (!passwordMatch) {
//       return res.status(401).json({ message: 'Invalid credentials' });
//     }
// const secret = process.env.JWT_SECRET || "fallback_secret";

//     const token = jwt.sign(
//       {
//         userId: user.employeeId,
//         name: user.name,
//         email: user.email,
//         role: user.role,
//         employeeGroup: user.employeeGroup
//       },
//       // process.env.JWT_SECRET,
//       secret,
//       { expiresIn: '8h' }
//     );

//     res.json({
//       message: 'Login successful',
//       token,
//       user: {
//         id: user.employeeId,
//         name: user.name,
//         email: user.email,
//         role: user.role,
//         employeeGroup: user.employeeGroup,
//       },
//     });
//   } catch (err) {
//     console.error('❌ Login error:', err);
//     res.status(500).json({ message: 'Failed to login' });
//   }
// });

// export default router;


import express from 'express';
import sql from 'mssql';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import executeQuery from '../utils/helper.js';

const router = express.Router();

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    const result = await executeQuery(
      `SELECT TOP 1 employeeId, name, email, password, role, employeeGroup 
       FROM Employees WHERE email = @email`,
      [{ name: 'email', type: sql.VarChar(100), value: email }]
    );

    if (result.length === 0) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const user = result[0];
    const passwordMatch = await bcrypt.compare(password, user.password);

    if (!passwordMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const secret = process.env.JWT_SECRET || "fallback_secret";

    const token = jwt.sign(
      {
        userId: user.employeeId,
        name: user.name,
        email: user.email,
        role: user.role,
        employeeGroup: user.employeeGroup,
      },
      secret,
      { expiresIn: '8h' }
    );

    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user.employeeId,
        name: user.name,
        email: user.email,
        role: user.role,
        employeeGroup: user.employeeGroup,
      },
    });
  } catch (err) {
    console.error('❌ Login error:', err);
    res.status(500).json({ message: 'Failed to login' });
  }
});

export default router;
