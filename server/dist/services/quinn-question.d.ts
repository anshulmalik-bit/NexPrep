import { QuinnMode } from './quinn-core.js';
interface QuestionGenInput {
    track: string;
    role: string;
    quinnMode: QuinnMode;
    resumeText?: string;
    companyName?: string;
    industryId?: string;
    companySizeId?: string;
    questionNumber: number;
    previousQuestions: string[];
}
interface QuestionOutput {
    question: string;
    competencyType: 'behavioral' | 'technical' | 'communication' | 'role-specific';
    difficulty: 'easy' | 'medium' | 'hard';
    hintsAvailable: boolean;
}
export declare function generateQuestion(input: QuestionGenInput): Promise<QuestionOutput>;
export {};
