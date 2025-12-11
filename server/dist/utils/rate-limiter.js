/**
 * Rate Limiter for Groq API
 * Enforces:
 * - 30 Requests Per Minute (RPM)
 * - 6000 Tokens Per Minute (TPM)
 */
export class RateLimiter {
    requests = [];
    tokens = [];
    config;
    circuitOpen = false;
    circuitResetTime = 0;
    constructor(config) {
        this.config = config;
    }
    /**
     * Check if a request can proceed.
     * @param estimatedTokens Estimated tokens for this request (input + output)
     */
    canRequest(estimatedTokens) {
        this.prune();
        if (this.circuitOpen) {
            if (Date.now() > this.circuitResetTime) {
                this.circuitOpen = false;
            }
            else {
                return false;
            }
        }
        if (this.requests.length >= this.config.rpm) {
            console.warn(`[Groq] RPM Limit Hit: ${this.requests.length}/${this.config.rpm}`);
            return false;
        }
        const currentTokens = this.tokens.reduce((a, b) => a + b, 0);
        if (currentTokens + estimatedTokens > this.config.tpm) {
            console.warn(`[Groq] TPM Limit Hit: ${currentTokens + estimatedTokens}/${this.config.tpm}`);
            return false;
        }
        return true;
    }
    /**
     * Record a request usage.
     */
    recordRequest(tokenCount) {
        const now = Date.now();
        this.requests.push(now);
        this.tokens.push(tokenCount);
    }
    /**
     * Trip the circuit breaker (e.g. on 429)
     */
    tripCircuit(cooldownMs = 30000) {
        console.error(`[Groq] Circuit Breaker Tripped. Pausing for ${cooldownMs}ms.`);
        this.circuitOpen = true;
        this.circuitResetTime = Date.now() + cooldownMs;
    }
    prune() {
        const now = Date.now();
        const windowStart = now - this.config.windowMs;
        this.requests = this.requests.filter(t => t > windowStart);
        this.tokens = this.tokens; // We can't prune tokens array directly by timestamp easily unless we store objects, let's simplify.
        // Actually, we need to store timestamp with tokens.
    }
}
// Re-implementing correctly with TokenBucket structure
export class TokenBucketRateLimiter {
    requestTimestamps = [];
    tokenTimestamps = [];
    config;
    circuitOpen = false;
    circuitResetTime = 0;
    constructor(config) {
        this.config = config;
    }
    canRequest(estimatedTokens) {
        this.prune();
        if (this.circuitOpen) {
            if (Date.now() > this.circuitResetTime) {
                this.circuitOpen = false;
                console.log('[Groq] Circuit Breaker Reset.');
            }
            else {
                return false;
            }
        }
        if (this.requestTimestamps.length >= this.config.rpm)
            return false;
        const currentTokens = this.tokenTimestamps.reduce((sum, item) => sum + item.count, 0);
        if (currentTokens + estimatedTokens > this.config.tpm)
            return false;
        return true;
    }
    record(tokens) {
        const now = Date.now();
        this.requestTimestamps.push(now);
        this.tokenTimestamps.push({ time: now, count: tokens });
    }
    trip(cooldownMs) {
        this.circuitOpen = true;
        this.circuitResetTime = Date.now() + cooldownMs;
    }
    prune() {
        const now = Date.now();
        const windowStart = now - this.config.windowMs;
        this.requestTimestamps = this.requestTimestamps.filter(t => t > windowStart);
        this.tokenTimestamps = this.tokenTimestamps.filter(t => t.time > windowStart);
    }
}
