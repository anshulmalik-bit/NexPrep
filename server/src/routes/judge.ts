import { Router, Request, Response } from 'express';
import { judgeContent, ContentJudgeInput, ContentJudgeOutput } from '../services/quinn-content-judge.js';
import {
    evaluateInterview,
    quickJudgeAnswer,
    MasterJudgeInput,
    MasterJudgeOutput,
    QuickJudgeInput
} from '../services/master-judge.js';

const router = Router();

/**
 * POST /api/judge/content
 * 
 * Quick evaluation of a single interview answer.
 * Uses Groq for fast per-answer feedback.
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
            console.log('[Judge/content] Validation FAILED - missing fields');
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

        // Use the new quickJudgeAnswer for fast feedback
        const quickInput: QuickJudgeInput = {
            question: questionText,
            answer: transcript,
            role,
            quinnMode,
        };


        let quickResult;
        try {
            quickResult = await quickJudgeAnswer(quickInput);

        } catch (quickError) {
            console.error('[Judge/content] quickJudgeAnswer error:', quickError);
            // Return fallback response
            return res.json({
                status: 'OK',
                content_score: 40,
                content_strength: 'Answer recorded.',
                content_fix: 'Try adding more detail and specific examples.',
                content_label: 'FALLBACK',
                key_evidence: null,
                suggested_rewrite: null,
                explainability: [],
                resource_ids: [],
                latency_ms: Date.now() - startTime
            });
        }

        // Map to ContentJudgeOutput format for backward compatibility
        const result: ContentJudgeOutput = {
            status: 'OK',
            content_score: quickResult.score,
            content_strength: quickResult.strength,
            content_fix: quickResult.fix,
            content_label: quickResult.label,
            key_evidence: null,
            suggested_rewrite: null,
            explainability: [],
            resource_ids: [],
            latency_ms: Date.now() - startTime
        };

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
 * POST /api/judge/interview
 * 
 * Full interview evaluation using the Master Judge.
 * Evaluates all answers with text, voice, and video metrics.
 */
router.post('/interview', async (req: Request, res: Response) => {
    const startTime = Date.now();

    try {
        const {
            answers,
            role,
            industry,
            company,
            resumeSummary
        } = req.body;

        // Validate required fields
        if (!answers || !Array.isArray(answers) || answers.length === 0) {
            return res.status(400).json({
                error: 'Missing or empty answers array',
                textScore: 0,
                voiceScore: 0,
                videoScore: 0,
                questionBreakdown: [],
                strengths: [],
                weaknesses: [],
                behavioralPatterns: '',
                improvementPlan: {
                    summary: 'No answers to evaluate.',
                    sevenDayPlan: []
                }
            });
        }

        if (!role) {
            return res.status(400).json({
                error: 'Missing required field: role',
                textScore: 0,
                voiceScore: 0,
                videoScore: 0,
                questionBreakdown: [],
                strengths: [],
                weaknesses: [],
                behavioralPatterns: '',
                improvementPlan: {
                    summary: 'Role is required for evaluation.',
                    sevenDayPlan: []
                }
            });
        }

        // Build input for Master Judge
        const input: MasterJudgeInput = {
            answers,
            role,
            industry,
            company,
            resumeSummary
        };

        // Call the Master Judge
        const result: MasterJudgeOutput = await evaluateInterview(input);

        // Log for monitoring
        console.log(`[MasterJudge] role=${role} textScore=${result.textScore} voiceScore=${result.voiceScore} videoScore=${result.videoScore} latency=${result.diagnostic?.latencyMs}ms`);

        return res.json(result);

    } catch (error) {
        console.error('[MasterJudge] Unexpected error:', error);
        return res.status(500).json({
            error: 'Internal server error',
            textScore: 0,
            voiceScore: 0,
            videoScore: 0,
            questionBreakdown: [],
            strengths: [],
            weaknesses: [],
            behavioralPatterns: '',
            improvementPlan: {
                summary: 'An error occurred during evaluation.',
                sevenDayPlan: [
                    'Day 1: Review interview basics',
                    'Day 2: Practice STAR method',
                    'Day 3: Focus on clarity',
                    'Day 4: Work on examples',
                    'Day 5: Practice conciseness',
                    'Day 6: Self-record practice',
                    'Day 7: Full mock interview'
                ]
            }
        });
    }
});

/**
 * GET /api/judge/health
 * Health check for the judge endpoint
 */
router.get('/health', (_req: Request, res: Response) => {
    res.json({ status: 'ok', service: 'master-judge' });
});

export default router;
