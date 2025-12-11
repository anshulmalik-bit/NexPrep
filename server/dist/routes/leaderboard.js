import { Router } from 'express';
export const leaderboardRouter = Router();
const leaderboard = [
    // Seed with some sample data
    { id: '1', nickname: 'InterviewAce', score: 92, trackId: 'tech', roleId: 'swe', createdAt: new Date().toISOString() },
    { id: '2', nickname: 'PrepMaster', score: 88, trackId: 'mba', roleId: 'consultant', createdAt: new Date().toISOString() },
    { id: '3', nickname: 'QuinnFan', score: 85, trackId: 'tech', roleId: 'product-manager-tech', createdAt: new Date().toISOString() },
    { id: '4', nickname: 'HRHero', score: 82, trackId: 'hr', roleId: 'recruiter', createdAt: new Date().toISOString() },
    { id: '5', nickname: 'DataDriven', score: 80, trackId: 'analytics', roleId: 'data-analyst', createdAt: new Date().toISOString() },
];
// Track name mapping
const trackNames = {
    tech: 'Technology',
    mba: 'MBA & Strategy',
    hr: 'Human Resources',
    analytics: 'Analytics',
    sales: 'Sales',
    operations: 'Operations',
    creative: 'Creative & Content',
};
// Get leaderboard
leaderboardRouter.get('/', (req, res) => {
    const limit = parseInt(req.query.limit) || 20;
    const sorted = [...leaderboard]
        .sort((a, b) => b.score - a.score)
        .slice(0, limit)
        .map((entry, index) => ({
        rank: index + 1,
        nickname: entry.nickname,
        score: entry.score,
        track: trackNames[entry.trackId] || entry.trackId,
        role: entry.roleId,
        createdAt: entry.createdAt,
    }));
    res.json(sorted);
});
// Submit score
leaderboardRouter.post('/', (req, res) => {
    const { nickname, score, trackId, roleId } = req.body;
    if (!nickname || score === undefined || !trackId || !roleId) {
        return res.status(400).json({ error: 'nickname, score, trackId, and roleId are required' });
    }
    const entry = {
        id: Date.now().toString(),
        nickname: nickname.substring(0, 20),
        score: Math.min(100, Math.max(0, score)),
        trackId,
        roleId,
        createdAt: new Date().toISOString(),
    };
    leaderboard.push(entry);
    // Calculate rank
    const sorted = [...leaderboard].sort((a, b) => b.score - a.score);
    const rank = sorted.findIndex((e) => e.id === entry.id) + 1;
    res.json({ success: true, rank });
});
