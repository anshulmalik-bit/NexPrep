import { create } from 'zustand';

export type QuinnMode = 'SUPPORTIVE' | 'DIRECT';

export interface Question {
    id: string;
    text: string;
    competencyType: 'behavioral' | 'technical' | 'communication' | 'role-specific';
    difficulty: 'easy' | 'medium' | 'hard';
    hintsAvailable: boolean;
}

export interface Answer {
    questionId: string;
    question: string;
    answer: string;
    evaluation?: {
        score: number;
        strengths: string[];
        weaknesses: string[];
        missingElements: string[];
        suggestedStructure: string;
        improvedSampleAnswer: string;
    };
    hintUsed?: string;
}

export interface InterviewState {
    // Setup
    trackId: string | null;
    roleId: string | null;
    companyName: string | null;
    industryId: string | null;
    companySizeId: string | null;
    quinnMode: QuinnMode;

    // Resume
    resumeText: string | null;
    resumeKeywords: string[];
    resumeParseStatus: 'none' | 'success' | 'partial' | 'failed';

    // Interview
    sessionId: string | null;
    currentQuestion: Question | null;
    questionNumber: number;
    totalQuestions: number;
    answers: Answer[];
    isLoading: boolean;

    // Company Briefing
    briefing: {
        overview: string;
        marketPosition: string;
        recentNews: string;
        culture: string;
        roleExpectations: string;
        quinnPerspective: string;
    } | null;

    // Final Report
    report: {
        summary: string;
        skillMatrix: Array<{ skill: string; score: number }>;
        strengths: string[];
        weaknesses: string[];
        questionBreakdown: Array<{ question: string; score: number; feedback: string }>;
        improvementPlan: string[];
        patternDetection: string[];
        resources: Array<{ title: string; url: string }>;
    } | null;

    // Actions
    setTrack: (trackId: string) => void;
    setRole: (roleId: string) => void;
    setTrackAndRole: (trackId: string, roleId: string) => void;
    setCompany: (companyName: string | null, industryId: string | null, companySizeId: string | null) => void;
    setCompanyInfo: (companyName: string | undefined, industryId: string | undefined) => void;
    setResumeData: (resumeText: string | undefined, resumeKeywords: string[] | undefined) => void;
    setQuinnMode: (mode: QuinnMode) => void;
    setResume: (text: string, keywords: string[], status: 'success' | 'partial' | 'failed') => void;
    startSession: (sessionId: string) => void;
    setQuestion: (question: Question) => void;
    submitAnswer: (answer: Answer) => void;
    setBriefing: (briefing: InterviewState['briefing']) => void;
    setReport: (report: InterviewState['report']) => void;
    setLoading: (loading: boolean) => void;
    reset: () => void;
}

const initialState = {
    trackId: null,
    roleId: null,
    companyName: null,
    industryId: null,
    companySizeId: null,
    quinnMode: 'SUPPORTIVE' as QuinnMode,
    resumeText: null,
    resumeKeywords: [],
    resumeParseStatus: 'none' as const,
    sessionId: null,
    currentQuestion: null,
    questionNumber: 0,
    totalQuestions: 5,
    answers: [],
    isLoading: false,
    briefing: null,
    report: null,
};

export const useInterviewStore = create<InterviewState>((set) => ({
    ...initialState,

    setTrack: (trackId) => set({ trackId }),

    setRole: (roleId) => set({ roleId }),

    setCompany: (companyName, industryId, companySizeId) => set({
        companyName,
        industryId,
        companySizeId,
    }),

    setTrackAndRole: (trackId, roleId) => set({ trackId, roleId }),

    setCompanyInfo: (companyName, industryId) => set({
        companyName: companyName || null,
        industryId: industryId || null,
    }),

    setResumeData: (resumeText, resumeKeywords) => set({
        resumeText: resumeText || null,
        resumeKeywords: resumeKeywords || [],
        resumeParseStatus: resumeText ? 'success' : 'none',
    }),

    setQuinnMode: (quinnMode) => set({ quinnMode }),

    setResume: (resumeText, resumeKeywords, resumeParseStatus) => set({
        resumeText,
        resumeKeywords,
        resumeParseStatus,
    }),

    startSession: (sessionId) => set({
        sessionId,
        questionNumber: 0,
        answers: [],
        currentQuestion: null,
    }),

    setQuestion: (currentQuestion) => set((state) => ({
        currentQuestion,
        questionNumber: state.questionNumber + 1,
    })),

    submitAnswer: (answer) => set((state) => ({
        answers: [...state.answers, answer],
        currentQuestion: null,
    })),

    setBriefing: (briefing) => set({ briefing }),

    setReport: (report) => set({ report }),

    setLoading: (isLoading) => set({ isLoading }),

    reset: () => set(initialState),
}));
