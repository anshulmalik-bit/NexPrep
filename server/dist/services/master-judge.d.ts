/**
 * Master Judge Service
 *
 * Evaluates a full HR interview based on:
 * - All user answers (text)
 * - Precomputed voice metrics
 * - Precomputed video metrics
 * - Role, industry/company, resume summary
 *
 * Returns strict JSON with textScore, voiceScore, videoScore, breakdown, and improvement plan.
 */
export interface VoiceMetrics {
    pace?: number;
    fillers?: number;
    confidenceScore?: number;
    volumeStability?: number;
    silenceDuration?: number;
}
export interface VideoMetrics {
    eyeContactScore?: number;
    postureScore?: number;
    expressivenessScore?: number;
    engagementScore?: number;
}
export interface AnswerInput {
    question: string;
    answer: string;
    voiceMetrics?: VoiceMetrics;
    videoMetrics?: VideoMetrics;
}
export interface MasterJudgeInput {
    answers: AnswerInput[];
    role: string;
    industry?: string;
    company?: string;
    resumeSummary?: string;
}
export interface TextJudge {
    clarity: number;
    relevance: number;
    specificity: number;
    ownership: number;
    reflection: number;
    alignment: number;
    explanation: string;
}
export interface QuestionBreakdown {
    questionNumber: number;
    question: string;
    userAnswer: string;
    textJudge: TextJudge;
    voiceMetricsUsed: VoiceMetrics;
    videoMetricsUsed: VideoMetrics;
}
export interface ImprovementPlan {
    summary: string;
    sevenDayPlan: [string, string, string, string, string, string, string];
}
export interface MasterJudgeOutput {
    textScore: number;
    voiceScore: number;
    videoScore: number;
    questionBreakdown: QuestionBreakdown[];
    strengths: string[];
    weaknesses: string[];
    behavioralPatterns: string;
    improvementPlan: ImprovementPlan;
    error?: string;
    diagnostic?: {
        modelUsed: string;
        latencyMs: number;
    };
}
export declare function evaluateInterview(input: MasterJudgeInput): Promise<MasterJudgeOutput>;
export interface QuickJudgeInput {
    question: string;
    answer: string;
    role: string;
    quinnMode: 'SUPPORTIVE' | 'DIRECT';
}
export interface QuickJudgeOutput {
    score: number;
    strength: string;
    fix: string;
    label: string;
}
export declare function quickJudgeAnswer(input: QuickJudgeInput): Promise<QuickJudgeOutput>;
