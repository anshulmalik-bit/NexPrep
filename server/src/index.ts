import express from 'express';
import cors from 'cors';
import { interviewRouter } from './routes/interview.js';
import { resumeRouter } from './routes/resume.js';
import { briefingRouter } from './routes/briefing.js';
import { leaderboardRouter } from './routes/leaderboard.js';

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/interview', interviewRouter);
app.use('/api/resume', resumeRouter);
app.use('/api/briefing', briefingRouter);
app.use('/api/leaderboard', leaderboardRouter);

// Health check
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', message: 'NexPrep API is running' });
});

// Start server
app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 NexPrep server running on http://localhost:${PORT}`);
});
