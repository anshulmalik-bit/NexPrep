/**
 * HRprep Resume Judge Service
 *
 * Harsh, realistic resume evaluation using LLM.
 * Returns JSON with scores and detailed feedback.
 */
export interface ResumeJudgeInput {
    resumeText: string;
    roleId: string;
    companyName?: string;
    industryId?: string;
}
export interface ResumeJudgeOutput {
    resumeScore: number;
    roleRelevance: number;
    industryFit: number;
    achievementsImpact: number;
    communicationQuality: number;
    professionalismPolish: number;
    strengths: string[];
    weaknesses: string[];
    roleFitSummary: string;
    companyFitSummary: string;
    improvementSuggestions: string[];
}
export declare function judgeResume(input: ResumeJudgeInput): Promise<ResumeJudgeOutput>;
