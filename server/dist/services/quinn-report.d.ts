import { QuinnMode } from './quinn-core.js';
interface ReportInput {
    answers: Array<{
        question: string;
        answer: string;
        evaluation: {
            score: number;
            strengths: string[];
            weaknesses: string[];
        };
    }>;
    quinnMode: QuinnMode;
    role: string;
    track: string;
}
export declare function generateReportSummary(input: ReportInput): Promise<{
    summary: string;
}>;
export declare function generateSkillMatrix(input: ReportInput): Promise<{
    skillMatrix: Array<{
        skill: string;
        score: number;
    }>;
}>;
export declare function generateStrengths(input: ReportInput): Promise<{
    strengths: string[];
}>;
export declare function generateWeaknesses(input: ReportInput): Promise<{
    weaknesses: string[];
}>;
export declare function generateBreakdown(input: ReportInput): Promise<{
    breakdown: Array<{
        question: string;
        score: number;
        feedback: string;
    }>;
}>;
export declare function generateImprovementPlan(input: ReportInput): Promise<{
    improvementPlan: string[];
}>;
export {};
