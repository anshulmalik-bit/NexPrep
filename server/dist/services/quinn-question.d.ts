/**
 * Quinn Interview Generator Service
 *
 * Single source-of-truth for Quinn's question-generation during interviews.
 * Implements a 12-question HR-focused interview with conversational behavior.
 */
import { QuinnGeneratorInput, QuinnGeneratorOutput, CoachingMode } from './quinn-types.js';
/**
 * Generate Quinn's next utterance in the interview.
 *
 * This is the single-call realtime path - no chained summarization or
 * pre-processing LLM calls.
 */
export declare function generateQuinnResponse(input: QuinnGeneratorInput): Promise<QuinnGeneratorOutput>;
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
export declare function generateQuestion(input: LegacyQuestionGenInput): Promise<LegacyQuestionOutput>;
export {};
