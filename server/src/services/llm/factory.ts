import { LLMProvider } from './types.js';
import { GeminiProvider } from './gemini-provider.js';
import { GroqProvider } from './groq-provider.js';

export class LLMFactory {
    private static instance: LLMProvider;

    static getProvider(): LLMProvider {
        if (!this.instance) {
            const providerType = process.env.LLM_PROVIDER || 'gemini';

            switch (providerType.toLowerCase()) {
                case 'gemini':
                    console.log('Using LLM Provider: Gemini');
                    this.instance = new GeminiProvider();
                    break;
                case 'groq':
                    console.log('Using LLM Provider: Groq');
                    this.instance = new GroqProvider();
                    break;
                default:
                    console.warn(`Unknown LLM_PROVIDER '${providerType}', defaulting to Gemini`);
                    this.instance = new GeminiProvider();
            }
        }
        return this.instance;
    }
}
