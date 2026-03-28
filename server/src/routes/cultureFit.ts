import express from 'express';
import axios from 'axios';
import pool from '../db/pool';
import { authMiddleware, AuthRequest } from '../middleware/authMiddleware';

const router = express.Router();
const ML = process.env.ML_SERVICE_URL || 'http://localhost:8000';

// POST /api/culture
router.post('/', authMiddleware, async (req: AuthRequest, res) => {
  const { answers } = req.body;
  if (!answers || !Array.isArray(answers) || answers.length !== 12)
    return res.status(400).json({ error: 'Exactly 12 answers required' });

  try {
    const { data } = await axios.post(`${ML}/ml/culture`, { answers });

    await pool.query(
      'INSERT INTO culture_results (user_id, answers, result) VALUES ($1,$2,$3)',
      [req.userId, JSON.stringify(answers), JSON.stringify(data)]
    );
    return res.json(data);
  } catch (err) { console.error(err); return res.status(500).json({ error: 'Culture fit failed' }); }
});

// GET /api/culture/latest
router.get('/latest', authMiddleware, async (req: AuthRequest, res) => {
  try {
    const { rows } = await pool.query(
      'SELECT * FROM culture_results WHERE user_id=$1 ORDER BY created_at DESC LIMIT 1',
      [req.userId]
    );
    return res.json(rows[0] || null);
  } catch (err) { console.error(err); return res.status(500).json({ error: 'Server error' }); }
});

export default router;
