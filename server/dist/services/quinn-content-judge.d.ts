import { QuinnMode } from './quinn-core.js';
export interface ContentJudgeInput {
    questionId: string;
    questionText: string;
    transcript: string;
    transcriptConfidence?: number;
    role: string;
    company?: string | null;
    track: string;
    experienceLevel?: 'Junior' | 'Mid' | 'Senior';
    quinnMode: QuinnMode;
    resumeKeywords?: string[];
    maxResponseTimeMs?: number;
}
export interface ExplainabilitySignal {
    signal: string;
    value: number;
}
export interface ContentJudgeOutput {
    status: 'OK' | 'PARTIAL' | 'ERROR';
    content_score: number;
    content_strength: string;
    content_fix: string;
    content_label: string;
    key_evidence: string | null;
    suggested_rewrite: string | null;
    explainability: ExplainabilitySignal[];
    resource_ids: string[];
    latency_ms: number;
}
export declare function judgeContent(input: ContentJudgeInput): Promise<ContentJudgeOutput>;
