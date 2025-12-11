export type QuinnMode = 'SUPPORTIVE' | 'DIRECT';
export declare function buildQuinnCorePrompt(mode: QuinnMode): string;
export declare function getQuinnGreeting(mode: QuinnMode, totalQuestions: number): string;
export declare function getQuinnFeedbackIntro(mode: QuinnMode, score: number): string;
export declare function getQuinnHintIntro(mode: QuinnMode): string;
export declare function getQuinnCompletionMessage(mode: QuinnMode): string;
