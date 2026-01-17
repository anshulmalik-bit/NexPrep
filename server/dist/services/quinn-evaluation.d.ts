import { QuinnMode } from './quinn-core.js';
interface EvaluationInput {
    question: string;
    answer: string;
    quinnMode: QuinnMode;
    role: string;
    competencyType: string;
    voiceMetrics?: {
        confidence?: number;
        pace?: number;
        fillers?: number;
    };
    videoMetrics?: {
        eyeContact?: number;
        posture?: number;
    };
}
interface EvaluationOutput {
    score: number;
    strengths: string[];
    weaknesses: string[];
    missingElements: string[];
    suggestedStructure: string;
    improvedSampleAnswer: string;
    flags?: string[];
}
export declare function evaluateAnswer(input: EvaluationInput): Promise<EvaluationOutput>;
export {};
