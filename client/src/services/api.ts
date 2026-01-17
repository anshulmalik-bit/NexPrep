// API service for communicating with the backend

// Use relative URL for production (same origin), absolute for local dev
const API_BASE = import.meta.env.VITE_API_URL || (import.meta.env.PROD ? '/api' : 'http://localhost:3001/api');

interface StartInterviewParams {
    trackId: string;
    roleId: string;
    quinnMode: 'SUPPORTIVE' | 'DIRECT';
    companyName?: string;
    industryId?: string;
    companySizeId?: string;
    resumeText?: string;
}

interface QuestionResponse {
    question: string;
    questionId: string;
    questionNumber: number;
    totalQuestions: number;
    competencyType: 'behavioral' | 'technical' | 'communication' | 'role-specific';
    difficulty: 'easy' | 'medium' | 'hard';
    hintsAvailable: boolean;
    isInterviewComplete?: boolean;
}

interface EvaluationResponse {
    score: number;
    feedback: string;
    strengths: string[];
    weaknesses: string[];
    missingElements: string[];
    suggestedStructure: string;
    improvedSampleAnswer: string;
}

interface HintResponse {
    hint: string;
}

interface BriefingResponse {
    overview: string;
    marketPosition: string;
    recentNews: string;
    culture: string;
    roleExpectations: string;
    quinnPerspective: string;
}

// ATS Score types
export interface ATSAnalysis {
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

interface ResumeUploadResponse {
    text: string;
    keywords: string[];
    status: 'success' | 'partial' | 'failed';
    atsScore?: number;
    atsAnalysis?: ATSAnalysis;
}

interface LeaderboardEntry {
    rank: number;
    nickname: string;
    score: number;
    track: string;
    role: string;
    createdAt: string;
}

// Content Judge types
export interface ContentJudgeParams {
    questionId: string;
    questionText: string;
    transcript: string;
    transcriptConfidence?: number;
    role: string;
    company?: string | null;
    track: string;
    experienceLevel?: 'Junior' | 'Mid' | 'Senior';
    quinnMode: 'SUPPORTIVE' | 'DIRECT';
    resumeKeywords?: string[];
    maxResponseTimeMs?: number;
}

export interface ContentFeedback {
    status: 'OK' | 'PARTIAL' | 'ERROR';
    content_score: number;
    content_strength: string;
    content_fix: string;
    content_label: string;
    key_evidence: string | null;
    suggested_rewrite: string | null;
    explainability: Array<{ signal: string; value: number }>;
    resource_ids: string[];
    latency_ms: number;
}

class ApiService {
    private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
        const response = await fetch(`${API_BASE}${endpoint}`, {
            headers: {
                'Content-Type': 'application/json',
                ...options.headers,
            },
            ...options,
        });

        if (!response.ok) {
            const error = await response.json().catch(() => ({ message: 'Request failed' }));
            throw new Error(error.message || `HTTP ${response.status}`);
        }

        return response.json();
    }

    // Interview endpoints
    async startInterview(params: StartInterviewParams): Promise<{ sessionId: string; totalQuestions: number }> {
        return this.request('/interview/start', {
            method: 'POST',
            body: JSON.stringify(params),
        });
    }

    async getQuestion(sessionId: string): Promise<QuestionResponse> {
        return this.request('/interview/question', {
            method: 'POST',
            body: JSON.stringify({ sessionId }),
        });
    }

    async submitAnswer(sessionId: string, questionId: string, answer: string): Promise<EvaluationResponse> {
        return this.request('/interview/answer', {
            method: 'POST',
            body: JSON.stringify({ sessionId, questionId, answer }),
        });
    }

    async getHint(sessionId: string, questionId: string): Promise<HintResponse> {
        return this.request('/interview/hint', {
            method: 'POST',
            body: JSON.stringify({ sessionId, questionId }),
        });
    }

    async completeInterview(sessionId: string): Promise<{ reportId: string }> {
        return this.request('/interview/complete', {
            method: 'POST',
            body: JSON.stringify({ sessionId }),
        });
    }

    // Report chunks
    async getReportSummary(sessionId: string): Promise<{ summary: string }> {
        return this.request(`/interview/report/${sessionId}/summary`);
    }

    async getReportSkillMatrix(sessionId: string): Promise<{ skillMatrix: Array<{ skill: string; score: number }> }> {
        return this.request(`/interview/report/${sessionId}/skills`);
    }

    async getReportStrengths(sessionId: string): Promise<{ strengths: string[] }> {
        return this.request(`/interview/report/${sessionId}/strengths`);
    }

    async getReportWeaknesses(sessionId: string): Promise<{ weaknesses: string[] }> {
        return this.request(`/interview/report/${sessionId}/weaknesses`);
    }

    async getReportBreakdown(sessionId: string): Promise<{ breakdown: Array<{ question: string; score: number; feedback: string }> }> {
        return this.request(`/interview/report/${sessionId}/breakdown`);
    }

    async getReportPlan(sessionId: string): Promise<{ improvementPlan: string[] }> {
        return this.request(`/interview/report/${sessionId}/plan`);
    }

    // Resume
    async uploadResume(file: File, options?: { roleId?: string; companyName?: string }): Promise<ResumeUploadResponse> {
        const formData = new FormData();
        formData.append('resume', file);
        if (options?.roleId) formData.append('roleId', options.roleId);
        if (options?.companyName) formData.append('companyName', options.companyName);

        const response = await fetch(`${API_BASE}/resume/upload`, {
            method: 'POST',
            body: formData,
        });

        if (!response.ok) {
            throw new Error('Resume upload failed');
        }

        return response.json();
    }

    // Analyze resume text without upload
    async analyzeResume(resumeText: string, roleId?: string, companyName?: string): Promise<ATSAnalysis> {
        return this.request('/resume/analyze', {
            method: 'POST',
            body: JSON.stringify({ resumeText, roleId, companyName }),
        });
    }

    // Briefing
    async getBriefing(params: {
        companyName?: string;
        industryId?: string;
        companySizeId?: string;
        roleId: string;
        quinnMode: 'SUPPORTIVE' | 'DIRECT';
    }): Promise<BriefingResponse> {
        return this.request('/briefing', {
            method: 'POST',
            body: JSON.stringify(params),
        });
    }

    // Leaderboard
    async getLeaderboard(limit = 20): Promise<LeaderboardEntry[]> {
        return this.request(`/leaderboard?limit=${limit}`);
    }

    async submitScore(data: {
        nickname: string;
        score: number;
        trackId: string;
        roleId: string;
    }): Promise<{ success: boolean; rank: number }> {
        return this.request('/leaderboard', {
            method: 'POST',
            body: JSON.stringify(data),
        });
    }

    // Content Judge
    async judgeContent(params: ContentJudgeParams): Promise<ContentFeedback> {
        return this.request('/judge/content', {
            method: 'POST',
            body: JSON.stringify(params),
        });
    }
}

export const api = new ApiService();
