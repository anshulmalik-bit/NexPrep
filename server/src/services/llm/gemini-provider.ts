import { GoogleGenerativeAI, GenerativeModel } from '@google/generative-ai';
import { LLMProvider, LLMGenerationOptions } from './types.js';

const CONSTANTS = {
    MAX_RETRIES: 3,
    INITIAL_DELAY_MS: 2000,
    BACKOFF_FACTOR: 2,
};

export class GeminiProvider implements LLMProvider {
    private genAI: GoogleGenerativeAI;
    private apiKey: string;

    constructor() {
        this.apiKey = process.env.GEMINI_API_KEY || '';
        if (!this.apiKey) {
            console.warn('⚠️ GEMINI_API_KEY not set. Gemini usage will fail.');
        }
        this.genAI = new GoogleGenerativeAI(this.apiKey);
    }

    getProviderName(): string {
        return 'gemini';
    }

    /**
     * Helper to check for "zero quota" errors (Vertex vs AI Studio)
     */
    private isZeroLimitError(error: any): boolean {
        try {
            const msg = JSON.stringify(error);
            return msg.includes('limit: 0') && msg.includes('quota');
        } catch {
            return false;
        }
    }

    /**
     * Retry wrapper
     */
    private async callWithRetry<T>(fn: () => Promise<T>, attempt = 1): Promise<T> {
        try {
            return await fn();
        } catch (error: any) {
            // 1. Wrong Door check
            if (this.isZeroLimitError(error)) {
                console.error('\n🛑 GEMINI QUOTA ERROR (LIMIT=0)');
                console.error('Use a new AI Studio key, not Vertex AI.');
                throw error;
            }

            // 2. Rate Limit check
            const isRateLimit = error.message?.includes('429') || error.status === 429 || error.message?.includes('Too Many Requests');
            if (isRateLimit && attempt <= CONSTANTS.MAX_RETRIES) {
                const delay = CONSTANTS.INITIAL_DELAY_MS * Math.pow(CONSTANTS.BACKOFF_FACTOR, attempt - 1);
                console.warn(`[Gemini] Rate limit hit. Retrying in ${delay}ms... (Attempt ${attempt}/${CONSTANTS.MAX_RETRIES})`);
                await new Promise(resolve => setTimeout(resolve, delay));
                return this.callWithRetry(fn, attempt + 1);
            }

            throw error;
        }
    }

    async generateText(prompt: string, options: LLMGenerationOptions = {}): Promise<string> {
        const { temperature = 0.7, maxOutputTokens = 2048 } = options;

        const model: GenerativeModel = this.genAI.getGenerativeModel({
            model: 'gemini-2.0-flash',
            generationConfig: {
                temperature,
                maxOutputTokens,
            },
        });

        return this.callWithRetry(async () => {
            const result = await model.generateContent(prompt);
            return result.response.text();
        });
    }

    async generateJson<T>(prompt: string, options: LLMGenerationOptions = {}): Promise<T> {
        const { temperature = 0.7, maxOutputTokens = 2048 } = options;

        // Gemini supports JSON mode natively
        const model: GenerativeModel = this.genAI.getGenerativeModel({
            model: 'gemini-2.0-flash',
            generationConfig: {
                temperature,
                maxOutputTokens,
                responseMimeType: 'application/json',
            },
        });

        const jsonString = await this.callWithRetry(async () => {
            const result = await model.generateContent(prompt);
            return result.response.text();
        });

        // Clean and parse
        try {
            // Remove any markdown fencing if present (sometimes models add it even in JSON mode)
            const cleaned = jsonString.replace(/```json/g, '').replace(/```/g, '').trim();
            return JSON.parse(cleaned) as T;
        } catch (e) {
            console.error('Failed to parse JSON from Gemini:', jsonString);
            throw new Error('Invalid JSON response from Gemini');
        }
    }
}
