import type { ContentFeedback } from './api';

/**
 * Instant, zero-latency judge using heuristics.
 * Used for immediate feedback while the LLM processes in the background.
 */
export function judgeContentHeuristic(transcript: string): ContentFeedback {
    const startTime = Date.now();
    const words = transcript.trim().split(/\s+/);
    const wordCount = words.length;

    // 1. Length Check
    if (wordCount < 10) {
        return {
            status: 'OK',
            content_score: 10,
            content_strength: 'Good start.',
            content_fix: 'Much too short. Please elaborate.',
            content_label: 'DEPTH',
            key_evidence: null,
            suggested_rewrite: null,
            explainability: [{ signal: 'length', value: 0 }],
            resource_ids: [],
            latency_ms: Date.now() - startTime
        };
    }

    // 2. Metrics Check (Numbers, %, $)
    const hasMetrics = /\d+%|\$\d+|\d+ (years|users|percent|growth|revenue)/i.test(transcript);

    // 3. Structure Check (STAR keywords)
    const starKeywords = ['situation', 'task', 'action', 'result', 'outcome', 'challenged', 'solved'];
    const hasStructure = starKeywords.some(kw => transcript.toLowerCase().includes(kw));

    let score = 50; // Base score
    if (hasMetrics) score += 20;
    if (hasStructure) score += 15;
    if (wordCount > 50) score += 10;

    // Cap score at 85 (LLM must give the final 15% for "quality")
    score = Math.min(85, score);

    return {
        status: 'OK',
        content_score: score,
        content_strength: hasMetrics ? 'Great usage of metrics!' : 'Clear communication.',
        content_fix: hasMetrics ? 'Ensure the impact connects to business goals.' : 'Try adding specific numbers or metrics.',
        content_label: hasMetrics ? 'METRICS' : 'CLARITY',
        key_evidence: null,
        suggested_rewrite: null,
        explainability: [
            { signal: 'metrics', value: hasMetrics ? 1 : 0 },
            { signal: 'heuristic_score', value: score }
        ],
        resource_ids: [],
        latency_ms: Date.now() - startTime
    };
}
