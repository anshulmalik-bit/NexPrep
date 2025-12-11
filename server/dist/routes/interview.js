import { Router } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { generateQuestion } from '../services/quinn-question.js';
import { generateHint } from '../services/quinn-hint.js';
import { evaluateAnswer } from '../services/quinn-evaluation.js';
import { generateReportSummary, generateSkillMatrix, generateStrengths, generateWeaknesses, generateBreakdown, generateImprovementPlan, } from '../services/quinn-report.js';
export const interviewRouter = Router();
// In-memory session storage (for demo - use a database in production)
const sessions = new Map();
// Start a new interview session
interviewRouter.post('/start', async (req, res) => {
    try {
        const { trackId, roleId, quinnMode, companyName, industryId, companySizeId, resumeText } = req.body;
        if (!trackId || !roleId || !quinnMode) {
            return res.status(400).json({ error: 'trackId, roleId, and quinnMode are required' });
        }
        const sessionId = uuidv4();
        sessions.set(sessionId, {
            trackId,
            roleId,
            quinnMode,
            companyName,
            industryId,
            companySizeId,
            resumeText,
            questions: [],
            answers: [],
        });
        res.json({ sessionId });
    }
    catch (error) {
        console.error('Error starting interview:', error);
        res.status(500).json({ error: 'Failed to start interview' });
    }
});
// Get next question
interviewRouter.post('/question', async (req, res) => {
    try {
        const { sessionId } = req.body;
        const session = sessions.get(sessionId);
        if (!session) {
            return res.status(404).json({ error: 'Session not found' });
        }
        const questionNumber = session.questions.length + 1;
        const previousQuestions = session.questions.map((q) => q.text);
        const question = await generateQuestion({
            track: session.trackId,
            role: session.roleId,
            quinnMode: session.quinnMode,
            resumeText: session.resumeText,
            companyName: session.companyName,
            industryId: session.industryId,
            companySizeId: session.companySizeId,
            questionNumber,
            previousQuestions,
        });
        const questionId = uuidv4();
        session.questions.push({
            id: questionId,
            text: question.question,
            competencyType: question.competencyType,
        });
        const totalQuestions = 5; // Configurable limit
        res.json({
            questionId,
            questionNumber,
            totalQuestions,
            ...question,
        });
    }
    catch (error) {
        console.error('Error generating question:', error);
        res.status(500).json({ error: 'Failed to generate question' });
    }
});
// Submit answer
interviewRouter.post('/answer', async (req, res) => {
    try {
        const { sessionId, questionId, answer } = req.body;
        const session = sessions.get(sessionId);
        if (!session) {
            return res.status(404).json({ error: 'Session not found' });
        }
        const question = session.questions.find((q) => q.id === questionId);
        if (!question) {
            return res.status(404).json({ error: 'Question not found' });
        }
        const evaluation = await evaluateAnswer({
            question: question.text,
            answer,
            quinnMode: session.quinnMode,
            role: session.roleId,
            competencyType: question.competencyType,
        });
        session.answers.push({
            questionId,
            question: question.text,
            answer,
            evaluation,
        });
        // Generate feedback summary for chat display
        const feedbackMessage = evaluation.score >= 80
            ? `Great answer! Score: ${evaluation.score}/100. ${evaluation.strengths[0] || 'Well structured response.'}`
            : evaluation.score >= 60
                ? `Good effort! Score: ${evaluation.score}/100. ${evaluation.weaknesses[0] || 'Consider adding more specific examples.'}`
                : `Score: ${evaluation.score}/100. ${evaluation.suggestedStructure || 'Try to be more specific.'}`;
        res.json({
            ...evaluation,
            feedback: feedbackMessage,
        });
    }
    catch (error) {
        console.error('Error evaluating answer:', error);
        res.status(500).json({ error: 'Failed to evaluate answer' });
    }
});
// Get hint
interviewRouter.post('/hint', async (req, res) => {
    try {
        const { sessionId, questionId } = req.body;
        const session = sessions.get(sessionId);
        if (!session) {
            return res.status(404).json({ error: 'Session not found' });
        }
        const question = session.questions.find((q) => q.id === questionId);
        if (!question) {
            return res.status(404).json({ error: 'Question not found' });
        }
        const hint = await generateHint({
            question: question.text,
            quinnMode: session.quinnMode,
            role: session.roleId,
        });
        res.json(hint);
    }
    catch (error) {
        console.error('Error generating hint:', error);
        res.status(500).json({ error: 'Failed to generate hint' });
    }
});
// Complete interview
interviewRouter.post('/complete', async (req, res) => {
    try {
        const { sessionId } = req.body;
        const session = sessions.get(sessionId);
        if (!session) {
            return res.status(404).json({ error: 'Session not found' });
        }
        res.json({ success: true, reportId: sessionId });
    }
    catch (error) {
        console.error('Error completing interview:', error);
        res.status(500).json({ error: 'Failed to complete interview' });
    }
});
// Report endpoints (chunked)
interviewRouter.get('/report/:sessionId/summary', async (req, res) => {
    try {
        const session = sessions.get(req.params.sessionId);
        if (!session)
            return res.status(404).json({ error: 'Session not found' });
        const result = await generateReportSummary({
            answers: session.answers,
            quinnMode: session.quinnMode,
            role: session.roleId,
            track: session.trackId,
        });
        res.json(result);
    }
    catch (error) {
        console.error('Error generating summary:', error);
        res.status(500).json({ error: 'Failed to generate summary' });
    }
});
interviewRouter.get('/report/:sessionId/skills', async (req, res) => {
    try {
        const session = sessions.get(req.params.sessionId);
        if (!session)
            return res.status(404).json({ error: 'Session not found' });
        const result = await generateSkillMatrix({
            answers: session.answers,
            quinnMode: session.quinnMode,
            role: session.roleId,
            track: session.trackId,
        });
        res.json(result);
    }
    catch (error) {
        console.error('Error generating skills:', error);
        res.status(500).json({ error: 'Failed to generate skill matrix' });
    }
});
interviewRouter.get('/report/:sessionId/strengths', async (req, res) => {
    try {
        const session = sessions.get(req.params.sessionId);
        if (!session)
            return res.status(404).json({ error: 'Session not found' });
        const result = await generateStrengths({
            answers: session.answers,
            quinnMode: session.quinnMode,
            role: session.roleId,
            track: session.trackId,
        });
        res.json(result);
    }
    catch (error) {
        console.error('Error generating strengths:', error);
        res.status(500).json({ error: 'Failed to generate strengths' });
    }
});
interviewRouter.get('/report/:sessionId/weaknesses', async (req, res) => {
    try {
        const session = sessions.get(req.params.sessionId);
        if (!session)
            return res.status(404).json({ error: 'Session not found' });
        const result = await generateWeaknesses({
            answers: session.answers,
            quinnMode: session.quinnMode,
            role: session.roleId,
            track: session.trackId,
        });
        res.json(result);
    }
    catch (error) {
        console.error('Error generating weaknesses:', error);
        res.status(500).json({ error: 'Failed to generate weaknesses' });
    }
});
interviewRouter.get('/report/:sessionId/breakdown', async (req, res) => {
    try {
        const session = sessions.get(req.params.sessionId);
        if (!session)
            return res.status(404).json({ error: 'Session not found' });
        const result = await generateBreakdown({
            answers: session.answers,
            quinnMode: session.quinnMode,
            role: session.roleId,
            track: session.trackId,
        });
        res.json(result);
    }
    catch (error) {
        console.error('Error generating breakdown:', error);
        res.status(500).json({ error: 'Failed to generate breakdown' });
    }
});
interviewRouter.get('/report/:sessionId/plan', async (req, res) => {
    try {
        const session = sessions.get(req.params.sessionId);
        if (!session)
            return res.status(404).json({ error: 'Session not found' });
        const result = await generateImprovementPlan({
            answers: session.answers,
            quinnMode: session.quinnMode,
            role: session.roleId,
            track: session.trackId,
        });
        res.json(result);
    }
    catch (error) {
        console.error('Error generating plan:', error);
        res.status(500).json({ error: 'Failed to generate improvement plan' });
    }
});
