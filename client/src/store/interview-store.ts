import { create } from 'zustand';

// ============================================
// TYPE DEFINITIONS
// ============================================

export type QuinnMode = 'SUPPORTIVE' | 'DIRECT';
export type AnswerMode = 'TEXT' | 'AUDIO' | 'VIDEO';
export type PermissionStatus = 'pending' | 'granted' | 'denied';
export type GazeStatus = 'on' | 'off' | 'unknown';
export type PostureStatus = 'good' | 'poor' | 'unknown';

export interface Question {
    id: string;
    text: string;
    competencyType: 'behavioral' | 'technical' | 'communication' | 'role-specific';
    difficulty: 'easy' | 'medium' | 'hard';
    hintsAvailable: boolean;
}

export interface AnswerRecord {
    questionId: string;
    questionText: string;
    answerText: string;
    audioBlob?: Blob;
    videoBlob?: Blob;
    submittedAt: Date;
    hintUsed?: string;
    evaluation?: {
        score: number;
        strengths: string[];
        weaknesses: string[];
        missingElements: string[];
        suggestedStructure: string;
        improvedSampleAnswer: string;
    };
}

export interface Permissions {
    microphone: PermissionStatus;
    camera: PermissionStatus;
    calibrationComplete: boolean;
}

export interface LiveMetrics {
    pacing: number;           // 0-100
    fillerWordCount: number;
    gaze: GazeStatus;
    posture: PostureStatus;
    confidence: number;       // 0-100
    volume: number;           // 0-100
}

export interface CalibrationResult {
    micLevel: number;
    cameraOk: boolean;
    completedAt: Date | null;
}

export interface UIState {
    hudVisible: boolean;
    bottomSheetOpen: boolean;
    utilityPanelTab: 'feedback' | 'frameworks' | 'mission';
    hintLoading: boolean;
    currentHint: string | null;
}

export interface CompanyBriefing {
    overview: string;
    marketPosition: string;
    recentNews: string;
    culture: string;
    roleExpectations: string;
    quinnPerspective: string;
}

export interface FinalReport {
    summary: string;
    skillMatrix: Array<{ skill: string; score: number }>;
    strengths: string[];
    weaknesses: string[];
    questionBreakdown: Array<{ question: string; score: number; feedback: string }>;
    improvementPlan: string[];
    patternDetection: string[];
    resources: Array<{ title: string; url: string }>;
}

// ============================================
// STORE STATE INTERFACE
// ============================================

export interface InterviewState {
    // Setup
    trackId: string | null;
    roleId: string | null;
    companyName: string | null;
    industryId: string | null;
    companySizeId: string | null;
    answerMode: AnswerMode;
    quinnMode: QuinnMode;

    // Resume
    resumeText: string | null;
    resumeKeywords: string[];
    resumeParseStatus: 'none' | 'success' | 'partial' | 'failed';

    // Permissions & Calibration
    permissions: Permissions;
    calibration: CalibrationResult;

    // Live Metrics
    liveMetrics: LiveMetrics;

    // UI State
    ui: UIState;

    // Interview
    sessionId: string | null;
    currentQuestion: Question | null;
    questionNumber: number;
    totalQuestions: number;
    answers: AnswerRecord[];
    isLoading: boolean;

    // Company Briefing & Report
    briefing: CompanyBriefing | null;
    report: FinalReport | null;

    // ========================================
    // SETUP ACTIONS
    // ========================================
    setTrack: (trackId: string) => void;
    setRole: (roleId: string) => void;
    setTrackAndRole: (trackId: string, roleId: string) => void;
    setCompany: (companyName: string | null, industryId: string | null, companySizeId: string | null) => void;
    setCompanyInfo: (companyName: string | undefined, industryId: string | undefined) => void;
    setAnswerMode: (mode: AnswerMode) => void;
    setQuinnMode: (mode: QuinnMode) => void;

    // ========================================
    // RESUME ACTIONS
    // ========================================
    setResumeData: (resumeText: string | undefined, resumeKeywords: string[] | undefined) => void;
    setResume: (text: string, keywords: string[], status: 'success' | 'partial' | 'failed') => void;
    clearResume: () => void;

    // ========================================
    // PERMISSION ACTIONS
    // ========================================
    setMicPermission: (status: PermissionStatus) => void;
    setCamPermission: (status: PermissionStatus) => void;
    setCalibrationComplete: (complete: boolean) => void;
    setCalibrationResult: (result: Partial<CalibrationResult>) => void;

    // ========================================
    // LIVE METRICS ACTIONS
    // ========================================
    updatePacing: (value: number) => void;
    incrementFillerWord: () => void;
    updateGaze: (status: GazeStatus) => void;
    updatePosture: (status: PostureStatus) => void;
    updateVolume: (value: number) => void;
    updateConfidence: (value: number) => void;
    resetMetrics: () => void;

    // ========================================
    // UI ACTIONS
    // ========================================
    toggleHud: () => void;
    setHudVisible: (visible: boolean) => void;
    openBottomSheet: () => void;
    closeBottomSheet: () => void;
    toggleBottomSheet: () => void;
    setUtilityPanelTab: (tab: 'feedback' | 'frameworks' | 'mission') => void;
    setHint: (hint: string | null) => void;
    setHintLoading: (loading: boolean) => void;

    // ========================================
    // INTERVIEW ACTIONS
    // ========================================
    startSession: (sessionId: string) => void;
    setQuestion: (question: Question) => void;
    nextQuestion: () => void;
    submitAnswer: (answer: AnswerRecord) => void;
    saveAnswer: (questionId: string, answerRecord: AnswerRecord) => void;

    // ========================================
    // BRIEFING & REPORT ACTIONS
    // ========================================
    setBriefing: (briefing: CompanyBriefing | null) => void;
    setReport: (report: FinalReport | null) => void;
    setLoading: (loading: boolean) => void;

    // ========================================
    // GLOBAL ACTIONS
    // ========================================
    reset: () => void;
}

// ============================================
// INITIAL STATE
// ============================================

const initialPermissions: Permissions = {
    microphone: 'pending',
    camera: 'pending',
    calibrationComplete: false,
};

const initialCalibration: CalibrationResult = {
    micLevel: 0,
    cameraOk: false,
    completedAt: null,
};

const initialLiveMetrics: LiveMetrics = {
    pacing: 50,
    fillerWordCount: 0,
    gaze: 'unknown',
    posture: 'unknown',
    confidence: 50,
    volume: 50,
};

const initialUI: UIState = {
    hudVisible: true,
    bottomSheetOpen: false,
    utilityPanelTab: 'feedback',
    hintLoading: false,
    currentHint: null,
};

const initialState = {
    // Setup
    trackId: null,
    roleId: null,
    companyName: null,
    industryId: null,
    companySizeId: null,
    answerMode: 'TEXT' as AnswerMode,
    quinnMode: 'SUPPORTIVE' as QuinnMode,

    // Resume
    resumeText: null,
    resumeKeywords: [],
    resumeParseStatus: 'none' as const,

    // Permissions & Calibration
    permissions: initialPermissions,
    calibration: initialCalibration,

    // Live Metrics
    liveMetrics: initialLiveMetrics,

    // UI State
    ui: initialUI,

    // Interview
    sessionId: null,
    currentQuestion: null,
    questionNumber: 0,
    totalQuestions: 5,
    answers: [] as AnswerRecord[],
    isLoading: false,

    // Briefing & Report
    briefing: null,
    report: null,
};

// ============================================
// STORE IMPLEMENTATION
// ============================================

export const useInterviewStore = create<InterviewState>((set) => ({
    ...initialState,

    // ========================================
    // SETUP ACTIONS
    // ========================================
    setTrack: (trackId) => set({ trackId }),

    setRole: (roleId) => set({ roleId }),

    setTrackAndRole: (trackId, roleId) => set({ trackId, roleId }),

    setCompany: (companyName, industryId, companySizeId) => set({
        companyName,
        industryId,
        companySizeId,
    }),

    setCompanyInfo: (companyName, industryId) => set({
        companyName: companyName || null,
        industryId: industryId || null,
    }),

    setAnswerMode: (answerMode) => set({ answerMode }),

    setQuinnMode: (quinnMode) => set({ quinnMode }),

    // ========================================
    // RESUME ACTIONS
    // ========================================
    setResumeData: (resumeText, resumeKeywords) => set({
        resumeText: resumeText || null,
        resumeKeywords: resumeKeywords || [],
        resumeParseStatus: resumeText ? 'success' : 'none',
    }),

    setResume: (resumeText, resumeKeywords, resumeParseStatus) => set({
        resumeText,
        resumeKeywords,
        resumeParseStatus,
    }),

    clearResume: () => set({
        resumeText: null,
        resumeKeywords: [],
        resumeParseStatus: 'none',
    }),

    // ========================================
    // PERMISSION ACTIONS
    // ========================================
    setMicPermission: (status) => set((state) => ({
        permissions: { ...state.permissions, microphone: status },
    })),

    setCamPermission: (status) => set((state) => ({
        permissions: { ...state.permissions, camera: status },
    })),

    setCalibrationComplete: (complete) => set((state) => ({
        permissions: { ...state.permissions, calibrationComplete: complete },
    })),

    setCalibrationResult: (result) => set((state) => ({
        calibration: {
            ...state.calibration,
            ...result,
            completedAt: result.completedAt ?? new Date(),
        },
        permissions: { ...state.permissions, calibrationComplete: true },
    })),

    // ========================================
    // LIVE METRICS ACTIONS
    // ========================================
    updatePacing: (pacing) => set((state) => ({
        liveMetrics: { ...state.liveMetrics, pacing },
    })),

    incrementFillerWord: () => set((state) => ({
        liveMetrics: {
            ...state.liveMetrics,
            fillerWordCount: state.liveMetrics.fillerWordCount + 1,
        },
    })),

    updateGaze: (gaze) => set((state) => ({
        liveMetrics: { ...state.liveMetrics, gaze },
    })),

    updatePosture: (posture) => set((state) => ({
        liveMetrics: { ...state.liveMetrics, posture },
    })),

    updateVolume: (volume) => set((state) => ({
        liveMetrics: { ...state.liveMetrics, volume },
    })),

    updateConfidence: (confidence) => set((state) => ({
        liveMetrics: { ...state.liveMetrics, confidence },
    })),

    resetMetrics: () => set({ liveMetrics: initialLiveMetrics }),

    // ========================================
    // UI ACTIONS
    // ========================================
    toggleHud: () => set((state) => ({
        ui: { ...state.ui, hudVisible: !state.ui.hudVisible },
    })),

    setHudVisible: (hudVisible) => set((state) => ({
        ui: { ...state.ui, hudVisible },
    })),

    openBottomSheet: () => set((state) => ({
        ui: { ...state.ui, bottomSheetOpen: true },
    })),

    closeBottomSheet: () => set((state) => ({
        ui: { ...state.ui, bottomSheetOpen: false },
    })),

    toggleBottomSheet: () => set((state) => ({
        ui: { ...state.ui, bottomSheetOpen: !state.ui.bottomSheetOpen },
    })),

    setUtilityPanelTab: (utilityPanelTab) => set((state) => ({
        ui: { ...state.ui, utilityPanelTab },
    })),

    setHint: (currentHint) => set((state) => ({
        ui: { ...state.ui, currentHint, hintLoading: false },
    })),

    setHintLoading: (hintLoading) => set((state) => ({
        ui: { ...state.ui, hintLoading },
    })),

    // ========================================
    // INTERVIEW ACTIONS
    // ========================================
    startSession: (sessionId) => set({
        sessionId,
        questionNumber: 0,
        answers: [],
        currentQuestion: null,
        liveMetrics: initialLiveMetrics,
    }),

    setQuestion: (currentQuestion) => set((state) => ({
        currentQuestion,
        questionNumber: state.questionNumber + 1,
    })),

    nextQuestion: () => set(() => ({
        currentQuestion: null,
        // Question will be set by API call
    })),

    submitAnswer: (answer) => set((state) => ({
        answers: [...state.answers, answer],
        currentQuestion: null,
    })),

    saveAnswer: (questionId, answerRecord) => set((state) => {
        const existingIndex = state.answers.findIndex(a => a.questionId === questionId);
        if (existingIndex >= 0) {
            const newAnswers = [...state.answers];
            newAnswers[existingIndex] = answerRecord;
            return { answers: newAnswers };
        }
        return { answers: [...state.answers, answerRecord] };
    }),

    // ========================================
    // BRIEFING & REPORT ACTIONS
    // ========================================
    setBriefing: (briefing) => set({ briefing }),

    setReport: (report) => set({ report }),

    setLoading: (isLoading) => set({ isLoading }),

    // ========================================
    // GLOBAL ACTIONS
    // ========================================
    reset: () => set(initialState),
}));

// ============================================
// SELECTOR HOOKS (for performance)
// ============================================

export const useAnswerMode = () => useInterviewStore((state) => state.answerMode);
export const usePermissions = () => useInterviewStore((state) => state.permissions);
export const useLiveMetrics = () => useInterviewStore((state) => state.liveMetrics);
export const useUIState = () => useInterviewStore((state) => state.ui);
export const useCurrentQuestion = () => useInterviewStore((state) => state.currentQuestion);
export const useCalibration = () => useInterviewStore((state) => state.calibration);
