import Groq from 'groq-sdk';
import { TokenBucketRateLimiter } from '../../utils/rate-limiter.js';
export class GroqProvider {
    groq;
    apiKey;
    limiter;
    constructor() {
        this.apiKey = process.env.GROQ_API_KEY || '';
        if (!this.apiKey) {
            console.warn('⚠️ GROQ_API_KEY not set. Groq usage will fail.');
        }
        this.groq = new Groq({ apiKey: this.apiKey });
        // Groq Free Tier Limits: 30 RPM, 6000 TPM
        this.limiter = new TokenBucketRateLimiter({
            rpm: 30,
            tpm: 6000,
            windowMs: 60000 // 1 minute
        });
    }
    getProviderName() {
        return 'groq';
    }
    estimateTokens(text) {
        // Rough heuristic: 4 chars per token. 
        // Llama 3 tokenizer is roughly this. Input + Output buffer.
        return Math.ceil(text.length / 4) + 500; // +500 buffer for output
    }
    async generateText(prompt, options = {}) {
        const { temperature = 0.7, maxOutputTokens = 2048, systemPrompt } = options;
        const fullContent = systemPrompt ? `${systemPrompt}\n${prompt}` : prompt; // Fallback estimate
        const estimatedTokens = this.estimateTokens(fullContent);
        if (!this.limiter.canRequest(estimatedTokens)) {
            // Simple fallback for now, or throw specific error handled by caller
            throw new Error('GROQ_RATE_LIMIT_EXCEEDED');
        }
        const messages = [];
        if (systemPrompt)
            messages.push({ role: 'system', content: systemPrompt });
        messages.push({ role: 'user', content: prompt });
        try {
            const completion = await this.groq.chat.completions.create({
                messages: messages,
                model: 'llama-3.1-8b-instant',
                temperature,
                max_completion_tokens: maxOutputTokens,
            });
            const content = completion.choices[0]?.message?.content || '';
            // Record actual usage if available, else estimate
            const usage = completion.usage;
            const totalTokens = usage ? usage.total_tokens : estimatedTokens; // Fallback to estimate if usage null
            this.limiter.record(totalTokens);
            return content;
        }
        catch (error) {
            if (error?.status === 429) {
                this.limiter.trip(60000); // 1 min cool-down
            }
            console.error('Groq generateText error:', error);
            throw error;
        }
    }
    async generateJson(prompt, options = {}) {
        const { temperature = 0.7, maxOutputTokens = 2048, systemPrompt } = options;
        const fullContent = systemPrompt ? `${systemPrompt}\n${prompt}` : prompt;
        const estimatedTokens = this.estimateTokens(fullContent);
        if (!this.limiter.canRequest(estimatedTokens)) {
            throw new Error('GROQ_RATE_LIMIT_EXCEEDED');
        }
        const messages = [];
        if (systemPrompt)
            messages.push({ role: 'system', content: systemPrompt });
        messages.push({ role: 'user', content: prompt });
        try {
            // Groq supports JSON mode for Llama 3.1
            const completion = await this.groq.chat.completions.create({
                messages: messages,
                model: 'llama-3.1-8b-instant',
                temperature,
                max_completion_tokens: maxOutputTokens,
                response_format: { type: 'json_object' },
            });
            const content = completion.choices[0]?.message?.content || '{}';
            // Record usage
            const usage = completion.usage;
            const totalTokens = usage ? usage.total_tokens : estimatedTokens;
            this.limiter.record(totalTokens);
            return JSON.parse(content);
        }
        catch (error) {
            if (error?.status === 429) {
                this.limiter.trip(60000);
            }
            console.error('Groq generateJson error:', error);
            throw error;
        }
    }
}
