import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import { interviewRouter } from './routes/interview.js';
import { resumeRouter } from './routes/resume.js';
import { briefingRouter } from './routes/briefing.js';
import { leaderboardRouter } from './routes/leaderboard.js';
import judgeRouter from './routes/judge.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = parseInt(process.env.PORT || '3001', 10);

// Middleware
app.use(cors());
app.use(express.json());

// API Routes
app.use('/api/interview', interviewRouter);
app.use('/api/resume', resumeRouter);
app.use('/api/briefing', briefingRouter);
app.use('/api/leaderboard', leaderboardRouter);
app.use('/api/judge', judgeRouter);

// Health check
app.get('/api/health', (_req, res) => {
    res.json({ status: 'ok', message: 'NexPrep API is running' });
});

// Serve static files from the client build folder in production
const clientDistPath = path.join(__dirname, '../../client/dist');
app.use(express.static(clientDistPath));

// Fallback to index.html for SPA routing
app.get('*', (_req, res) => {
    res.sendFile(path.join(clientDistPath, 'index.html'));
});

// Start server
app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 NexPrep server running on http://localhost:${PORT}`);
});
