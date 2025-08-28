import express from 'express';
import executeQuery from '../utils/helper.js'; // Import the helper function
const router = express.Router();


router.get('/api/teams', async (req, res) => {
  try {
    const teams = await executeQuery('SELECT name FROM Teams');
    res.json(teams.map(t => t.name));
  } catch (err) {
    console.error('Error fetching teams:', err);
    res.status(500).json([]);
  }
});

export default router; // Export the router to use in your main app file