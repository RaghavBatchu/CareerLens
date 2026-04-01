import express from 'express';
import axios from 'axios';
import pool from '../db/pool';
import { authMiddleware, AuthRequest } from '../middleware/authMiddleware';

const router = express.Router();
const ML = process.env.ML_SERVICE_URL || 'http://localhost:8000';

// POST /api/roadmap/generate
router.post('/generate', authMiddleware, async (req: AuthRequest, res) => {
  const { missing_keywords, top_match, culture_dimensions, job_role } = req.body;
  if (!missing_keywords || !top_match)
    return res.status(400).json({ error: 'missing_keywords and top_match required' });

  try {
    const { data } = await axios.post(`${ML}/ml/roadmap`, {
      missing_keywords, top_match, culture_dimensions, job_role,
    });

    // Delete old tasks for this user
    await pool.query('DELETE FROM roadmap_tasks WHERE user_id=$1', [req.userId]);

    // Persist each task
    const tasks = data.tasks || [];
    for (const t of tasks) {
      await pool.query(
        `INSERT INTO roadmap_tasks (user_id, category, task, priority, day_target)
         VALUES ($1,$2,$3,$4,$5)`,
        [req.userId, t.category || 'General', t.task, t.priority || 'medium', t.day_target]
      );
    }
    return res.json({ tasks });
  } catch (err) { console.error(err); return res.status(500).json({ error: 'Roadmap generation failed' }); }
});

// GET /api/roadmap/tasks
router.get('/tasks', authMiddleware, async (req: AuthRequest, res) => {
  try {
    const { rows } = await pool.query(
      'SELECT * FROM roadmap_tasks WHERE user_id=$1 ORDER BY day_target, created_at',
      [req.userId]
    );
    return res.json(rows);
  } catch (err) { console.error(err); return res.status(500).json({ error: 'Server error' }); }
});

// PATCH /api/roadmap/tasks/:id
router.patch('/tasks/:id', authMiddleware, async (req: AuthRequest, res) => {
  const { status } = req.body;
  const validStatuses = ['Todo', 'In Progress', 'Done'];
  if (!validStatuses.includes(status))
    return res.status(400).json({ error: 'status must be Todo | In Progress | Done' });

  try {
    const { rows } = await pool.query(
      'UPDATE roadmap_tasks SET status=$1 WHERE id=$2 AND user_id=$3 RETURNING *',
      [status, req.params.id, req.userId]
    );
    if (!rows.length) return res.status(404).json({ error: 'Task not found' });
    return res.json(rows[0]);
  } catch (err) { console.error(err); return res.status(500).json({ error: 'Server error' }); }
});

export default router;
