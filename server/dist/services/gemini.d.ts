interface GeminiCallOptions {
    temperature?: number;
    maxOutputTokens?: number;
    retries?: number;
}
export declare function callGemini(prompt: string, options?: GeminiCallOptions): Promise<string>;
export declare function callGeminiText(prompt: string, options?: GeminiCallOptions): Promise<string>;
export {};
