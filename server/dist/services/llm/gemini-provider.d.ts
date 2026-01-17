import { LLMProvider, LLMGenerationOptions } from './types.js';
export declare class GeminiProvider implements LLMProvider {
    private genAI;
    private apiKey;
    constructor();
    getProviderName(): string;
    /**
     * Helper to check for "zero quota" errors (Vertex vs AI Studio)
     */
    private isZeroLimitError;
    /**
     * Retry wrapper
     */
    private callWithRetry;
    generateText(prompt: string, options?: LLMGenerationOptions): Promise<string>;
    generateJson<T>(prompt: string, options?: LLMGenerationOptions): Promise<T>;
}
