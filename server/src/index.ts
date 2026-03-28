import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

import authRoutes from './routes/auth';
import resumeRoutes from './routes/resume';
import cultureFitRoutes from './routes/cultureFit';
import roadmapRoutes from './routes/roadmap';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors({ origin: ['http://localhost:5173'], credentials: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/resume', resumeRoutes);
app.use('/api/culture', cultureFitRoutes);
app.use('/api/roadmap', roadmapRoutes);

// Health
app.get('/health', (_req, res) => res.json({ status: 'ok' }));

// Global error handler
app.use((err: Error, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error(err.stack);
  res.status(500).json({ error: err.message || 'Internal server error' });
});

app.listen(PORT, () => console.log(`🚀 Server running on http://localhost:${PORT}`));

export default app;
