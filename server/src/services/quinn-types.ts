/**
 * Shared types for Quinn Interview Generator services.
 */

export type CoachingMode = 'SUPPORTIVE' | 'DIRECT';

/**
 * Input contract for the Quinn question generator.
 * Frontend must supply these fields on every call.
 */
export interface QuinnGeneratorInput {
    sessionId: string;
    requestId: string;
    clientState: {
        currentQuestionIndex: number;  // 1..12
        coachingMode: CoachingMode;
    };
    target: {
        track: string;      // e.g., "Tech", "MBA"
        role: string;       // specific job
        company?: string;   // company name if chosen
        industry?: string;  // industry if no specific company
    };
    resumeContext: string;      // short precomputed summary (max 100 words)
    lastUserMessage: string;    // raw transcript text (un-summarized)
    /** Previous Q&A pairs for context/tone memory */
    conversationHistory?: Array<{ question: string; answer: string }>;
}

/**
 * Diagnostic information for monitoring.
 */
export interface QuinnDiagnostic {
    modelUsed: string;
    latencyMs: number;
    tokenEstimate: number;
    fallbackReason?: string;
}

/**
 * Output contract for the Quinn question generator.
 * Always returns a structured object, never raw text.
 */
export interface QuinnGeneratorOutput {
    /** Full conversational reply (acknowledge + reflect + transition + question) */
    text: string;

    /** True only when interview loop must end (after question 12) */
    isInterviewComplete: boolean;

    /** Monitoring diagnostics */
    diagnostic: QuinnDiagnostic;

    /** True if fallback/local heuristic was used */
    fallback?: boolean;

    /** Present if service could not generate content */
    error?: string;
}

/** Total number of questions in a Quinn interview */
export const QUINN_TOTAL_QUESTIONS = 12;

/** End-of-interview standard message */
export const QUINN_END_MESSAGE = "Thank you. That concludes our session. I'm compiling your evaluation now.";

/** Empty transcript recovery message */
export const QUINN_EMPTY_TRANSCRIPT_MESSAGE = "I didn't catch that — could you repeat that briefly?";
