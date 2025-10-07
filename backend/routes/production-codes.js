import express from 'express';
// configured mssql pool
import { executeQuery } from '../utils/helper.js'; // Import the helper function
const router = express.Router();



router.get('/api/production-codes', async (req, res) => {
  try {
    const codes = await executeQuery('SELECT code FROM ProductionCodes');
    res.json(codes.map(c => c.code));
  } catch (err) {
    console.error('Error fetching production codes:', err);
    res.status(500).json([]);
  }
});

export default router; // Export the router to use in your main app file