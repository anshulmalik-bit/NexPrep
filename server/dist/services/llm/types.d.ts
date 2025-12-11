export interface LLMGenerationOptions {
    temperature?: number;
    maxOutputTokens?: number;
    jsonSchema?: any;
}
export interface LLMProvider {
    /**
     * Generate a simple text response.
     */
    generateText(prompt: string, options?: LLMGenerationOptions): Promise<string>;
    /**
     * Generate a JSON object response.
     * The provider implementation handles parsing and validation (basic).
     */
    generateJson<T>(prompt: string, options?: LLMGenerationOptions): Promise<T>;
    /**
     * Get the name of the provider (e.g. "gemini", "groq")
     */
    getProviderName(): string;
}
