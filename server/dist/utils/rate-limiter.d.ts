/**
 * Rate Limiter for Groq API
 * Enforces:
 * - 30 Requests Per Minute (RPM)
 * - 6000 Tokens Per Minute (TPM)
 */
interface RateLimitConfig {
    rpm: number;
    tpm: number;
    windowMs: number;
}
export declare class RateLimiter {
    private requests;
    private tokens;
    private config;
    private circuitOpen;
    private circuitResetTime;
    constructor(config: RateLimitConfig);
    /**
     * Check if a request can proceed.
     * @param estimatedTokens Estimated tokens for this request (input + output)
     */
    canRequest(estimatedTokens: number): boolean;
    /**
     * Record a request usage.
     */
    recordRequest(tokenCount: number): void;
    /**
     * Trip the circuit breaker (e.g. on 429)
     */
    tripCircuit(cooldownMs?: number): void;
    private prune;
}
export declare class TokenBucketRateLimiter {
    private requestTimestamps;
    private tokenTimestamps;
    private config;
    private circuitOpen;
    private circuitResetTime;
    constructor(config: RateLimitConfig);
    canRequest(estimatedTokens: number): boolean;
    record(tokens: number): void;
    trip(cooldownMs: number): void;
    private prune;
}
export {};
