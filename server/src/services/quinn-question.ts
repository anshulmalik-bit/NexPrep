/**
 * Quinn Interview Generator Service
 * 
 * Single source-of-truth for Quinn's question-generation during interviews.
 * Implements a 12-question HR-focused interview with conversational behavior.
 */

import { LLMFactory } from './llm/factory.js';
import {
    QuinnGeneratorInput,
    QuinnGeneratorOutput,
    QuinnDiagnostic,
    CoachingMode,
    QUINN_TOTAL_QUESTIONS,
    QUINN_END_MESSAGE,
    QUINN_EMPTY_TRANSCRIPT_MESSAGE,
} from './quinn-types.js';

// ============================================================================
// QUINN INTERVIEW GENERATOR SYSTEM PROMPT
// ============================================================================

// ============================================================================
// QUINN INTERVIEW GENERATOR SYSTEM PROMPT
// ============================================================================

const QUINN_SYSTEM_PROMPT = `ROLE: QUINN, NexPrep's HR interviewer.
TASK: 12-question HR interview (Soft skills only. NO technical questions).
STRUCTURE:
Q1-2: Intro/Motivations
Q3-7: Behavioral (Challenge, Collaboration, Conflict, Ownership, Fit)
Q8-10: Role Aware (Strengths, Pressure, 90-Day Plan)
Q11: Deep Dive (Follow-up)
Q12: Closing

MANDATORY OUTPUT FORMAT (Per Turn):
1. Acknowledge (Short)
2. Micro-reflect (Short, shows listening)
3. Transition (Segue)
4. Next Question (Unambiguous, <30 words)

RULES:
- Tone: Match user's Coaching Mode (Supportive=Warm, Direct=Concise).
- Length: Short & conversational. Max 2-3 sentences before the question.
- Safety: No personal identifiers. Use resume only for role stability.
- End interview after Q12.`;

// ============================================================================
// FALLBACK QUESTIONS (used when LLM fails)
// ============================================================================

const FALLBACK_QUESTIONS: Record<number, string> = {
    1: "Let's start by getting to know you. Tell me about yourself and what brings you to this role.",
    2: "What motivates you to pursue this opportunity?",
    3: "Describe a challenging situation you faced at work and how you handled it.",
    4: "Tell me about a time you collaborated successfully with a team.",
    5: "How do you handle disagreements or conflicts with colleagues?",
    6: "Share an example where you took ownership of a difficult project.",
    7: "What draws you to this industry, and how do you stay motivated?",
    8: "What strengths would you bring to this role?",
    9: "How do you perform under pressure or tight deadlines?",
    10: "What would your first 90 days look like if you joined us?",
    11: "Based on our conversation, tell me more about how you handle feedback.",
    12: "Finally, what sets you apart from other candidates?",
};

// ============================================================================
// MAIN SERVICE FUNCTION
// ============================================================================

/**
 * Generate Quinn's next utterance in the interview.
 * 
 * This is the single-call realtime path - no chained summarization or 
 * pre-processing LLM calls.
 */
export async function generateQuinnResponse(
    input: QuinnGeneratorInput
): Promise<QuinnGeneratorOutput> {
    const startTime = Date.now();
    const { sessionId, requestId, clientState, target, resumeContext, lastUserMessage } = input;
    const { currentQuestionIndex, coachingMode } = clientState;

    // Build diagnostic base
    const buildDiagnostic = (modelUsed: string, fallbackReason?: string): QuinnDiagnostic => ({
        modelUsed,
        latencyMs: Date.now() - startTime,
        tokenEstimate: Math.ceil((resumeContext.length + lastUserMessage.length + QUINN_SYSTEM_PROMPT.length) / 4),
        fallbackReason,
    });

    // ========================================================================
    // GUARD: Early-end (question 12 reached)
    // ========================================================================
    if (currentQuestionIndex >= QUINN_TOTAL_QUESTIONS) {
        logTelemetry(sessionId, requestId, currentQuestionIndex, target.role, 'none', 0, false, 'early-end-guard');
        return {
            text: QUINN_END_MESSAGE,
            isInterviewComplete: true,
            diagnostic: buildDiagnostic('none'),
        };
    }

    // ========================================================================
    // GUARD: Empty transcript
    // ========================================================================
    if (!lastUserMessage || lastUserMessage.trim() === '') {
        logTelemetry(sessionId, requestId, currentQuestionIndex, target.role, 'none', 0, false, 'empty-transcript');
        return {
            text: QUINN_EMPTY_TRANSCRIPT_MESSAGE,
            isInterviewComplete: false,
            diagnostic: buildDiagnostic('none'),
        };
    }

    // ========================================================================
    // BUILD USER PROMPT
    // ========================================================================
    const userPrompt = buildUserPrompt(input);

    // ========================================================================
    // CALL LLM (single call, no chaining)
    // ========================================================================
    try {
        const provider = LLMFactory.getProvider();
        const modelUsed = provider.getProviderName();

        const response = await provider.generateText(
            userPrompt, // User data only
            {
                temperature: 0.7,
                maxOutputTokens: 300,
                systemPrompt: QUINN_SYSTEM_PROMPT // Instructions separately
            }
        );

        // Validate response
        if (!response || typeof response !== 'string' || response.trim().length < 10) {
            throw new Error('Invalid LLM response: too short or malformed');
        }

        const diagnostic = buildDiagnostic(modelUsed);
        logTelemetry(sessionId, requestId, currentQuestionIndex, target.role, modelUsed, diagnostic.latencyMs, false);

        return {
            text: response.trim(),
            isInterviewComplete: false,
            diagnostic,
        };

    } catch (error) {
        // ====================================================================
        // FALLBACK: LLM failure
        // ====================================================================
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        console.error(`[Quinn] LLM Error for session=${sessionId} request=${requestId}:`, errorMessage);

        const fallbackText = generateFallbackResponse(currentQuestionIndex, coachingMode, target.role);
        const diagnostic = buildDiagnostic('fallback', errorMessage);

        logTelemetry(sessionId, requestId, currentQuestionIndex, target.role, 'fallback', diagnostic.latencyMs, true, errorMessage);

        return {
            text: fallbackText,
            isInterviewComplete: false,
            diagnostic,
            fallback: true,
            error: errorMessage,
        };
    }
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Build the user prompt with context for the LLM.
 */
function buildUserPrompt(input: QuinnGeneratorInput): string {
    const { clientState, target, resumeContext, lastUserMessage, conversationHistory } = input;
    const { currentQuestionIndex, coachingMode } = clientState;

    const companyContext = target.company
        ? `Target Company: ${target.company}`
        : target.industry
            ? `Industry: ${target.industry}`
            : '';

    // Explicit guidance for each question phase
    const questionGuidance = getQuestionPhaseGuidance(currentQuestionIndex + 1);

    // Build conversation summary for tone/context memory (last 3 Q&As max)
    let conversationSummary = '';
    if (conversationHistory && conversationHistory.length > 0) {
        const recentHistory = conversationHistory.slice(-3); // Last 3 Q&As
        conversationSummary = `
Previous Conversation (for context and tone awareness):
${recentHistory.map((qa, i) => `Q${conversationHistory.length - recentHistory.length + i + 1}: ${qa.question.slice(0, 100)}...
A${conversationHistory.length - recentHistory.length + i + 1}: "${qa.answer}"`).join('\n')}

IMPORTANT: Adapt your tone and questions based on the candidate's communication style shown above.
`;
    }

    return `Context:
- Role: ${target.role}
- Track: ${target.track}
${companyContext ? `- ${companyContext}` : ''}
- Resume Summary: ${resumeContext || 'Not provided'}
- Coaching Mode: ${coachingMode}
- Current Question Number: ${currentQuestionIndex + 1} of ${QUINN_TOTAL_QUESTIONS}

IMPORTANT: ${questionGuidance}
${conversationSummary}
User's Last Answer:
"${lastUserMessage}"

Generate your response following the per-turn conversational behavior (Acknowledge → Micro-reflect → Transition → Next Question).`;
}

/**
 * Get explicit guidance for what each question should focus on.
 */
function getQuestionPhaseGuidance(questionNum: number): string {
    switch (questionNum) {
        case 1: return "Q1 is INTRO. Ask them to tell you about themselves and their background.";
        case 2: return "Q2 is MOTIVATION. Ask what motivates them in their career.";
        case 3: return "Q3 is CHALLENGE. Ask about a challenging situation they handled.";
        case 4: return "Q4 is COLLABORATION. Ask about teamwork or collaboration.";
        case 5: return "Q5 is CONFLICT. Ask how they handle disagreements or conflicts.";
        case 6: return "Q6 is OWNERSHIP. Ask about taking ownership of a project.";
        case 7: return "Q7 is INDUSTRY FIT. Ask about their connection to the industry.";
        case 8: return "Q8 is ROLE STRENGTHS. Ask what strengths they bring to this role.";
        case 9: return "Q9 is PRESSURE. Ask how they handle pressure or deadlines.";
        case 10: return "Q10 is 90-DAY PLAN. Ask what their first 90 days would look like.";
        case 11: return "Q11 is DEEP DIVE. Probe a weakness or gap from earlier answers.";
        case 12: return "Q12 is CLOSING. Ask what sets them apart from others.";
        default: return "Follow the interview structure as defined.";
    }
}

/**
 * Generate a fallback response when LLM fails.
 */
function generateFallbackResponse(
    questionIndex: number,
    coachingMode: CoachingMode,
    role: string
): string {
    const nextQuestionNum = questionIndex + 1;
    const fallbackQuestion = FALLBACK_QUESTIONS[nextQuestionNum] ||
        `Tell me about a significant experience that shaped your approach to being a ${role}.`;

    if (coachingMode === 'SUPPORTIVE') {
        return `Thanks for sharing that. Let me ask you this: ${fallbackQuestion}`;
    } else {
        return `Noted. Next question: ${fallbackQuestion}`;
    }
}

/**
 * Log telemetry for monitoring.
 */
function logTelemetry(
    sessionId: string,
    requestId: string,
    questionIndex: number,
    role: string,
    modelUsed: string,
    latencyMs: number,
    fallback: boolean,
    error?: string
): void {
    const logEntry = {
        timestamp: new Date().toISOString(),
        sessionId,
        requestId,
        questionIndex,
        role,
        modelUsed,
        latencyMs,
        fallback,
        ...(error && { error }),
    };

    console.log('[Quinn Telemetry]', JSON.stringify(logEntry));
}

// ============================================================================
// LEGACY EXPORT (for backward compatibility during migration)
// ============================================================================

// Keep old interface temporarily for routes that haven't migrated yet
interface LegacyQuestionGenInput {
    track: string;
    role: string;
    quinnMode: CoachingMode;
    resumeText?: string;
    companyName?: string;
    industryId?: string;
    companySizeId?: string;
    questionNumber: number;
    previousQuestions: string[];
}

interface LegacyQuestionOutput {
    question: string;
    competencyType: 'behavioral' | 'technical' | 'communication' | 'role-specific';
    difficulty: 'easy' | 'medium' | 'hard';
    hintsAvailable: boolean;
}

/**
 * @deprecated Use generateQuinnResponse instead
 */
export async function generateQuestion(input: LegacyQuestionGenInput): Promise<LegacyQuestionOutput> {
    const { track, role, quinnMode, resumeText, companyName, industryId, questionNumber, previousQuestions } = input;

    // Convert to new format
    const newInput: QuinnGeneratorInput = {
        sessionId: 'legacy-' + Date.now(),
        requestId: 'legacy-' + Math.random().toString(36).substr(2, 9),
        clientState: {
            currentQuestionIndex: questionNumber - 1, // Convert 1-based to 0-based
            coachingMode: quinnMode,
        },
        target: {
            track,
            role,
            company: companyName,
            industry: industryId,
        },
        resumeContext: resumeText ? resumeText.substring(0, 400) : '',
        lastUserMessage: previousQuestions.length > 0
            ? `Previous context: ${previousQuestions.slice(-1)[0]}`
            : 'Starting interview.',
    };

    const result = await generateQuinnResponse(newInput);

    // Extract question from the response text (best effort)
    const questionMatch = result.text.match(/[?]([^?]*[?])?$/);
    const extractedQuestion = questionMatch
        ? result.text.substring(result.text.lastIndexOf('?', result.text.length - 2) + 1).trim() || result.text
        : result.text;

    return {
        question: extractedQuestion.endsWith('?') ? extractedQuestion : result.text,
        competencyType: 'behavioral',
        difficulty: questionNumber <= 2 ? 'easy' : questionNumber <= 7 ? 'medium' : 'hard',
        hintsAvailable: true,
    };
}
