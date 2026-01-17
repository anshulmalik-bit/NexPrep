import { LLMProvider, LLMGenerationOptions } from './types.js';
export declare class GroqProvider implements LLMProvider {
    private groq;
    private apiKey;
    private limiter;
    constructor();
    getProviderName(): string;
    private estimateTokens;
    generateText(prompt: string, options?: LLMGenerationOptions): Promise<string>;
    generateJson<T>(prompt: string, options?: LLMGenerationOptions): Promise<T>;
}
