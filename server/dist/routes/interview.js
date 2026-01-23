import { Router } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { generateQuinnResponse } from '../services/quinn-question.js';
import { generateHint } from '../services/quinn-hint.js';
import { evaluateAnswer } from '../services/quinn-evaluation.js';
import { generateReportSummary, generateSkillMatrix, generateStrengths, generateWeaknesses, generateBreakdown, generateImprovementPlan, } from '../services/quinn-report.js';
import { QUINN_TOTAL_QUESTIONS } from '../services/quinn-types.js';
import { staticQuestions } from '../data/static-questions.js';
import { generateBatchReport } from '../services/quinn-report.js';
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
        // Compute resumeContext from resumeText (max 100 words for token efficiency)
        const resumeContext = resumeText
            ? resumeText.split(/\s+/).slice(0, 100).join(' ')
            : '';
        if (roleId === 'general-hr') {
            // Pre-load static questions
            // Rule 1: First question is ALWAYS "Tell me about yourself" (hr-q1)
            const firstQuestion = staticQuestions.find(q => q.id === 'hr-q1');
            // Rule 2: Remaining 4 questions are random unique selection
            const remainingPool = staticQuestions.filter(q => q.id !== 'hr-q1');
            // Fisher-Yates shuffle the pool
            for (let i = remainingPool.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [remainingPool[i], remainingPool[j]] = [remainingPool[j], remainingPool[i]];
            }
            // Select next 4
            const nextQuestions = remainingPool.slice(0, 4);
            // Combine: [Q1, ...Random4]
            const selectedQuestions = firstQuestion
                ? [firstQuestion, ...nextQuestions]
                : nextQuestions.slice(0, 5); // Fallback if Q1 missing
            const loadedQuestions = selectedQuestions.map(sq => ({
                id: sq.id,
                text: sq.text,
                competencyType: 'behavioral'
            }));
            sessions.set(sessionId, {
                trackId,
                roleId,
                quinnMode,
                companyName,
                questions: loadedQuestions,
                answers: [],
                lastUserMessage: '',
            });
            // Return total questions count from selected list
            res.json({ sessionId, totalQuestions: loadedQuestions.length });
            return;
        }
        sessions.set(sessionId, {
            trackId,
            roleId,
            quinnMode,
            companyName,
            industryId,
            companySizeId,
            resumeText,
            resumeContext,
            questions: [],
            answers: [],
            lastUserMessage: '',
        });
        res.json({ sessionId, totalQuestions: QUINN_TOTAL_QUESTIONS });
    }
    catch (error) {
        console.error('Error starting interview:', error);
        res.status(500).json({ error: 'Failed to start interview' });
    }
});
// Get next question (NEW CONTRACT)
interviewRouter.post('/question', async (req, res) => {
    try {
        const { sessionId, lastUserMessage } = req.body;
        const session = sessions.get(sessionId);
        if (!session) {
            return res.status(404).json({ error: 'Session not found' });
        }
        // SPECIAL CASE: Static Questions (General HR)
        if (session.roleId === 'general-hr') {
            const nextIndex = session.answers.length;
            if (nextIndex >= session.questions.length) {
                return res.json({
                    text: "That covers everything! Let's review your answers.",
                    isInterviewComplete: true,
                    questionNumber: nextIndex,
                    totalQuestions: session.questions.length,
                });
            }
            const nextQ = session.questions[nextIndex];
            return res.json({
                questionId: nextQ.id,
                questionNumber: nextIndex + 1,
                totalQuestions: session.questions.length,
                question: nextQ.text,
                competencyType: 'behavioral',
                difficulty: 'medium',
                hintsAvailable: true,
                isInterviewComplete: false,
            });
        }
        const requestId = uuidv4();
        const currentQuestionIndex = session.questions.length;
        // Build input for new Quinn generator
        const quinnInput = {
            sessionId,
            requestId,
            clientState: {
                currentQuestionIndex,
                coachingMode: session.quinnMode,
            },
            target: {
                track: session.trackId,
                role: session.roleId,
                company: session.companyName,
                industry: session.industryId,
            },
            resumeContext: session.resumeContext || '',
            lastUserMessage: lastUserMessage || session.lastUserMessage || 'Starting interview.',
            // Pass conversation history for tone memory
            conversationHistory: session.answers.map(a => ({
                question: a.question,
                answer: a.answer
            })),
        };
        // Generate response using new service
        const result = await generateQuinnResponse(quinnInput);
        // If interview is complete, don't add to questions list
        if (result.isInterviewComplete) {
            return res.json({
                text: result.text,
                isInterviewComplete: true,
                questionNumber: currentQuestionIndex,
                totalQuestions: QUINN_TOTAL_QUESTIONS,
                diagnostic: result.diagnostic,
            });
        }
        // Extract question for tracking (the last sentence with a question mark)
        const questionId = uuidv4();
        session.questions.push({
            id: questionId,
            text: result.text,
            competencyType: 'behavioral',
        });
        // Update last user message for context
        if (lastUserMessage) {
            session.lastUserMessage = lastUserMessage;
        }
        res.json({
            questionId,
            questionNumber: currentQuestionIndex + 1,
            totalQuestions: QUINN_TOTAL_QUESTIONS,
            question: result.text, // Client expects 'question' field, not 'text'
            competencyType: 'behavioral',
            difficulty: currentQuestionIndex <= 2 ? 'easy' : currentQuestionIndex <= 7 ? 'medium' : 'hard',
            hintsAvailable: true,
            isInterviewComplete: false,
            diagnostic: result.diagnostic,
            fallback: result.fallback,
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
        const { sessionId, questionId, answer, voiceMetrics, videoMetrics } = req.body;
        const session = sessions.get(sessionId);
        if (!session) {
            return res.status(404).json({ error: 'Session not found' });
        }
        const question = session.questions.find((q) => q.id === questionId);
        if (!question || !session) {
            return res.status(404).json({ error: 'Question or Session not found' });
        }
        // SPECIAL CASE: Static Questions (General HR) - SKIP EVALUATION
        // SPECIAL CASE: Static Questions (General HR) - BATCH MODE (Save Tokens)
        // Skip real-time evaluation. Just store metrics for later batch analysis.
        if (session.roleId === 'general-hr') {
            const staticQ = staticQuestions.find(sq => sq.id === questionId);
            const idealAnswer = staticQ ? staticQ.idealAnswerKeyPoints : "Provide a structured answer.";
            // Store answer + metrics (Evaluation deferred)
            session.answers.push({
                questionId,
                question: question.text,
                answer,
                idealAnswer,
                evaluation: {
                    score: 0,
                    strengths: ["Answer recorded"],
                    weaknesses: ["Feedback pending end of interview"],
                    missingElements: [],
                    suggestedStructure: "Evaluation deferred to final report",
                    improvedSampleAnswer: "",
                    flags: []
                },
                voiceMetrics, // Persist for Batch Report
                videoMetrics // Persist for Batch Report
            });
            return res.json({
                score: 0,
                status: "OK",
                content_score: 0,
                content_strength: "Answer recorded",
                content_fix: "Feedback pending...",
                strengths: ["Answer recorded"],
                weaknesses: ["Feedback pending..."],
                improvedSampleAnswer: null,
                flags: [],
                feedback: "Answer recorded. Feedback will be provided in the final report."
            });
        }
        // Evaluate Answer (AI - Fair Scoring Engine) - Only for Technical/Role-Specific
        const evaluationResult = await evaluateAnswer({
            question: question.text,
            answer,
            quinnMode: session.quinnMode,
            role: session.roleId,
            competencyType: question.competencyType,
            voiceMetrics, // Pass captured metrics
            videoMetrics // Pass captured metrics
        });
        // Store result
        session.answers.push({
            questionId,
            question: question.text,
            answer,
            idealAnswer: "Provide a structured answer.", // Dynamic questions handle this internally
            evaluation: {
                score: evaluationResult.score,
                strengths: evaluationResult.strengths,
                weaknesses: evaluationResult.weaknesses,
                missingElements: evaluationResult.missingElements,
                suggestedStructure: evaluationResult.suggestedStructure,
                improvedSampleAnswer: evaluationResult.improvedSampleAnswer,
                flags: evaluationResult.flags
            },
            voiceMetrics,
            videoMetrics
        });
        // Return real feedback to client
        return res.json({
            score: evaluationResult.score,
            status: "OK",
            content_score: evaluationResult.score, // Backward compatibility
            content_strength: evaluationResult.strengths[0] || "Answer recorded",
            content_fix: evaluationResult.weaknesses[0] || "Keep practicing",
            strengths: evaluationResult.strengths,
            weaknesses: evaluationResult.weaknesses,
            improvedSampleAnswer: evaluationResult.improvedSampleAnswer,
            flags: evaluationResult.flags,
            feedback: evaluationResult.score >= 80
                ? `Great job! Score: ${evaluationResult.score}`
                : `Score: ${evaluationResult.score}. check report for details.`
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
        // Check if we need to run batch analysis
        console.log(`[DEBUG] Completing Interview ${sessionId}. Role: ${session.roleId}, Answers: ${session.answers.length}, Existing Report: ${!!session.finalReport}`);
        // Relaxed check: Includes 'hr' to cover general-hr, hr-manager etc.
        if ((session.roleId === 'general-hr' || session.roleId.includes('hr')) && session.answers.length > 0) {
            console.log(`Starting Batch Report for session ${sessionId}...`);
            try {
                // generateBatchReport now handles its own errors and returns a fallback if needed.
                const report = await generateBatchReport({
                    answers: session.answers.map(a => ({
                        question: a.question,
                        answer: a.answer,
                        idealAnswer: a.idealAnswer || "Standard professional answer",
                        voiceMetrics: a.voiceMetrics,
                        videoMetrics: a.videoMetrics
                    })),
                    role: session.roleId,
                    preComputedEvaluations: []
                });
                console.log(`Batch Report Generated. Overall Score: ${report.overallScore}`);
                session.finalReport = report;
                // Backfill evaluations into answers (Single Truth Source)
                if (report.evaluations && Array.isArray(report.evaluations)) {
                    report.evaluations.forEach((ev, index) => {
                        if (session.answers[index]) {
                            session.answers[index].evaluation = {
                                score: ev.score,
                                strengths: [ev.strength || "Response Recorded"],
                                weaknesses: [ev.weakness || "Analysis Pending"],
                                missingElements: [],
                                suggestedStructure: "N/A",
                                improvedSampleAnswer: ev.improvedSample || "N/A",
                                starRating: ev.starRating || 1,
                                flags: [],
                                // Use a temporary property or ensure interface matches
                                feedback: ev.feedback || "Feedback available in report"
                            };
                        }
                    });
                }
            }
            catch (batchError) {
                console.error("FATAL: Batch Report crashed even with internal catch.", batchError);
                // Last ditch effort to prevent hanging
                session.finalReport = { overallScore: -1, summary: "Service Failed", evaluations: [] };
            }
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
        if (session.finalReport) {
            return res.json({
                summary: session.finalReport.summary,
                overallScore: session.finalReport.overallScore
            });
        }
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
        if (session.finalReport) {
            return res.json({ skillMatrix: session.finalReport.skillMatrix });
        }
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
        if (session.finalReport) {
            return res.json({ strengths: session.finalReport.strengths });
        }
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
        if (session.finalReport) {
            return res.json({ weaknesses: session.finalReport.weaknesses });
        }
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
        if (session.finalReport && session.finalReport.evaluations) {
            const breakdown = session.finalReport.evaluations.map((ev, index) => ({
                question: session.answers[index]?.question || `Question ${index + 1}`,
                score: ev.score,
                starRating: ev.starRating,
                feedback: ev.feedback || (ev.strength ? `${ev.strength}. ${ev.weakness}` : 'Feedback available in full report.')
            }));
            return res.json({ breakdown });
        }
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
        if (session.finalReport) {
            return res.json({ improvementPlan: session.finalReport.improvementPlan });
        }
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
