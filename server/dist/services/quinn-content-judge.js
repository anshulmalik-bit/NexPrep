import { LLMFactory } from './llm/factory.js';
// ============================================
// COMPRESSED PROMPT FOR GROQ/LLAMA
// ============================================
// Reduced generic instructions. Focused on JSON schema and rules.
const CONTENT_JUDGE_SYSTEM_PROMPT = `Role: Interview Judge. Task: Evaluate answer.
Output JSON ONLY:
{
  "content_score": <0-100>,
  "content_strength": "<positive, max 15 words>",
  "content_fix": "<constructive fix, max 15 words>",
  "content_label": "<STRUCTURE|DEPTH|METRICS|CLARITY|EXAMPLES|RELEVANCE>",
  "key_evidence": "<quote max 10 words or null>",
  "suggested_rewrite": "<rewrite max 30 words or null>",
  "explainability": [{"signal": "<metric>", "value": <0-3>}],
  "resource_ids": []
}

Rules:
1. Penalize missing metrics/examples.
2. Be strict but constructive.
3. No hallucination.
`;
// ============================================
// SHORT ANSWER HANDLER
// ============================================
function handleShortAnswer(quinnMode) {
    const strength = quinnMode === 'SUPPORTIVE' ? "Good start." : "Too brief.";
    const fix = "Add specific examples and context.";
    return {
        status: 'OK',
        content_score: 15,
        content_strength: strength,
        content_fix: fix,
        content_label: 'DEPTH',
        key_evidence: null,
        suggested_rewrite: null,
        explainability: [{ signal: 'too_short', value: 1 }],
        resource_ids: [],
        latency_ms: 0
    };
}
// ============================================
// MAIN JUDGE FUNCTION
// ============================================
export async function judgeContent(input) {
    const startTime = Date.now();
    // Validate
    if (!input.questionId || !input.questionText || !input.transcript) {
        return createErrorResult(startTime, 'Missing required fields');
    }
    // Short answer check
    const wordCount = input.transcript.trim().split(/\s+/).length;
    if (wordCount < 5) {
        const result = handleShortAnswer(input.quinnMode);
        result.latency_ms = Date.now() - startTime;
        return result;
    }
    // Build Prompt
    const tone = input.quinnMode === 'SUPPORTIVE' ? 'Warm' : 'Concise';
    const context = `Ctx: ${input.role} / ${input.experienceLevel} / ${input.company || 'Generic'}`;
    const prompt = `${CONTENT_JUDGE_SYSTEM_PROMPT}
Tone: ${tone}
${context}
Q: "${input.questionText}"
A: "${input.transcript}"`;
    try {
        const provider = LLMFactory.getProvider();
        // Timeout handling handled by the provider wrapper potentially, strictly enforcing here too?
        // Let's rely on provider for now, but provider interface doesn't have timeout yet.
        // We will keep the race logic for safety.
        const timeoutPromise = new Promise((_, reject) => {
            setTimeout(() => reject(new Error('LLM_TIMEOUT')), input.maxResponseTimeMs || 8000);
        });
        const resultJson = await Promise.race([
            provider.generateJson(prompt, {
                temperature: 0.1,
                maxOutputTokens: 512
            }),
            timeoutPromise
        ]);
        return {
            status: 'OK',
            content_score: resultJson.content_score || 0,
            content_strength: resultJson.content_strength || 'Analyzed.',
            content_fix: resultJson.content_fix || 'Review details.',
            content_label: resultJson.content_label || 'GENERAL',
            key_evidence: resultJson.key_evidence || null,
            suggested_rewrite: resultJson.suggested_rewrite || null,
            explainability: resultJson.explainability || [],
            resource_ids: resultJson.resource_ids || [],
            latency_ms: Date.now() - startTime
        };
    }
    catch (error) {
        const msg = error instanceof Error ? error.message : 'Unknown';
        if (msg === 'LLM_TIMEOUT')
            return createPartialResult(startTime);
        console.error('Judge Error:', error);
        return createErrorResult(startTime, 'Evaluation failed');
    }
}
function createErrorResult(startTime, fix) {
    return {
        status: 'ERROR',
        content_score: 0,
        content_strength: '',
        content_fix: fix,
        content_label: 'ERROR',
        key_evidence: null,
        suggested_rewrite: null,
        explainability: [],
        resource_ids: [],
        latency_ms: Date.now() - startTime
    };
}
function createPartialResult(startTime) {
    return {
        status: 'PARTIAL',
        content_score: 50,
        content_strength: 'Pending',
        content_fix: 'Timeout',
        content_label: 'PENDING',
        key_evidence: null,
        suggested_rewrite: null,
        explainability: [],
        resource_ids: [],
        latency_ms: Date.now() - startTime
    };
}
