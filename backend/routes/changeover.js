import express from 'express';
import executeQuery from '../utils/helper.js'; // Import the helper function
import authMiddleware from '../middleware/authMiddleware.js';

const router = express.Router();


// Changeover Matrix Endpoint (Placeholder)
router.get('/changeover',authMiddleware, async (req, res) => {
  try {
    const matrices = await executeQuery('SELECT * FROM ChangeoverMatrix');
    res.json(matrices);
  } catch (err) {
    console.error('Error fetching changeover matrices:', err);
    res.status(500).json([]); // Return empty array on error
  }
});


export default router;