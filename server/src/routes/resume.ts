import express from 'express';
import FormData from 'form-data';
import axios from 'axios';
import pool from '../db/pool';
import { upload } from '../middleware/upload';
import { authMiddleware, AuthRequest } from '../middleware/authMiddleware';

const router = express.Router();
const ML = process.env.ML_SERVICE_URL || 'http://localhost:8000';

// POST /api/resume/score
router.post('/score', authMiddleware, upload.single('resume'), async (req: AuthRequest, res) => {
  const { jd_text, job_role } = req.body;
  if (!req.file || !jd_text) return res.status(400).json({ error: 'resume PDF and jd_text required' });

  try {
    const form = new FormData();
    form.append('resume', req.file.buffer, { filename: 'resume.pdf', contentType: 'application/pdf' });
    form.append('jd_text', jd_text);

    const { data } = await axios.post(`${ML}/ml/score`, form, { headers: form.getHeaders() });
    const { score, matched_keywords, missing_keywords, resume_text } = data;

    const { rows } = await pool.query(
      `INSERT INTO resume_scores (user_id, resume_text, jd_text, score, matched_keywords, missing_keywords, job_role)
       VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING *`,
      [req.userId, resume_text, jd_text, score,
       JSON.stringify(matched_keywords), JSON.stringify(missing_keywords), job_role || null]
    );
    return res.json(rows[0]);
  } catch (err) { console.error(err); return res.status(500).json({ error: 'Scoring failed' }); }
});

// POST /api/resume/enhance
router.post('/enhance', authMiddleware, upload.single('resume'), async (req: AuthRequest, res) => {
  const { jd_text } = req.body;
  if (!req.file || !jd_text) return res.status(400).json({ error: 'resume PDF and jd_text required' });

  try {
    const form = new FormData();
    form.append('resume', req.file.buffer, { filename: 'resume.pdf', contentType: 'application/pdf' });
    form.append('jd_text', jd_text);

    const { data } = await axios.post(`${ML}/ml/enhance`, form, { headers: form.getHeaders() });
    return res.json(data);
  } catch (err) { console.error(err); return res.status(500).json({ error: 'Enhancement failed' }); }
});

// GET /api/resume/history
router.get('/history', authMiddleware, async (req: AuthRequest, res) => {
  try {
    const { rows } = await pool.query(
      'SELECT * FROM resume_scores WHERE user_id=$1 ORDER BY created_at DESC LIMIT 10',
      [req.userId]
    );
    return res.json(rows);
  } catch (err) { console.error(err); return res.status(500).json({ error: 'Server error' }); }
});

export default router;
