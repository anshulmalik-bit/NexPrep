import { Router, Request, Response } from 'express';
import { judgeContent, ContentJudgeInput, ContentJudgeOutput } from '../services/quinn-content-judge.js';

const router = Router();

/**
 * POST /api/judge/content
 * 
 * Evaluates a user's interview answer and returns structured feedback.
 * Uses Gemini to analyze content quality, structure, and relevance.
 */
router.post('/content', async (req: Request, res: Response) => {
    const startTime = Date.now();

    try {
        const {
            questionId,
            questionText,
            transcript,
            transcriptConfidence,
            role,
            company,
            track,
            experienceLevel,
            quinnMode,
            resumeKeywords,
            maxResponseTimeMs
        } = req.body;

        // Validate required fields
        if (!questionId || !questionText || !transcript || !role || !track || !quinnMode) {
            return res.status(400).json({
                status: 'ERROR',
                error: 'Missing required fields: questionId, questionText, transcript, role, track, quinnMode',
                content_score: 0,
                content_strength: '',
                content_fix: '',
                content_label: 'ERROR',
                key_evidence: null,
                suggested_rewrite: null,
                explainability: [],
                resource_ids: [],
                latency_ms: Date.now() - startTime
            });
        }

        // Validate quinnMode
        if (quinnMode !== 'SUPPORTIVE' && quinnMode !== 'DIRECT') {
            return res.status(400).json({
                status: 'ERROR',
                error: 'quinnMode must be SUPPORTIVE or DIRECT',
                content_score: 0,
                content_strength: '',
                content_fix: '',
                content_label: 'ERROR',
                key_evidence: null,
                suggested_rewrite: null,
                explainability: [],
                resource_ids: [],
                latency_ms: Date.now() - startTime
            });
        }

        // Build input for the judge
        const input: ContentJudgeInput = {
            questionId,
            questionText,
            transcript,
            transcriptConfidence: transcriptConfidence || 1.0,
            role,
            company: company || null,
            track,
            experienceLevel: experienceLevel || 'Mid',
            quinnMode,
            resumeKeywords: resumeKeywords || [],
            maxResponseTimeMs: maxResponseTimeMs || 7000
        };

        // Call the content judge
        const result: ContentJudgeOutput = await judgeContent(input);

        // Log for monitoring (no PII)
        console.log(`[Judge] questionId=${questionId} score=${result.content_score} label=${result.content_label} latency=${result.latency_ms}ms status=${result.status}`);

        // Return result
        return res.json(result);

    } catch (error) {
        console.error('[Judge] Unexpected error:', error);
        return res.status(500).json({
            status: 'ERROR',
            error: 'Internal server error',
            content_score: 0,
            content_strength: '',
            content_fix: 'Unable to evaluate at this time',
            content_label: 'ERROR',
            key_evidence: null,
            suggested_rewrite: null,
            explainability: [],
            resource_ids: [],
            latency_ms: Date.now() - startTime
        });
    }
});

/**
 * GET /api/judge/health
 * Health check for the judge endpoint
 */
router.get('/health', (_req: Request, res: Response) => {
    res.json({ status: 'ok', service: 'content-judge' });
});

export default router;
