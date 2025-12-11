import { callGemini } from './gemini';
import { QuinnMode } from './quinn-core';

// ============================================
// TYPES
// ============================================

export interface ContentJudgeInput {
    questionId: string;
    questionText: string;
    transcript: string;
    transcriptConfidence?: number;
    role: string;
    company?: string | null;
    track: string;
    experienceLevel?: 'Junior' | 'Mid' | 'Senior';
    quinnMode: QuinnMode;
    resumeKeywords?: string[];
    maxResponseTimeMs?: number;
}

export interface ExplainabilitySignal {
    signal: string;
    value: number;
}

export interface ContentJudgeOutput {
    status: 'OK' | 'PARTIAL' | 'ERROR';
    content_score: number;
    content_strength: string;
    content_fix: string;
    content_label: string;
    key_evidence: string | null;
    suggested_rewrite: string | null;
    explainability: ExplainabilitySignal[];
    resource_ids: string[];
    latency_ms: number;
}

// ============================================
// SYSTEM PROMPT
// ============================================

const CONTENT_JUDGE_SYSTEM_PROMPT = `You are QUINN — an interview coach LLM. Your task is to evaluate a single candidate answer to a specific interview question.

You must output EXACTLY valid JSON matching this schema:
{
  "status": "OK",
  "content_score": <integer 0-100>,
  "content_strength": "<max 20 words - one positive thing>",
  "content_fix": "<max 20 words - one actionable fix>",
  "content_label": "<one-word: STRUCTURE, DEPTH, METRICS, CLARITY, EXAMPLES, RELEVANCE>",
  "key_evidence": "<max 15 words from answer or null>",
  "suggested_rewrite": "<max 40 words example or null>",
  "explainability": [{"signal": "<name>", "value": <0-3>}],
  "resource_ids": [],
  "latency_ms": 0
}

JUDGEMENT RULES:
1. Evaluate ONLY on: relevance to question, structure (STAR method), depth of examples, evidence/metrics, and alignment with role competencies.
2. Penalize heavily for: missing impact/metrics (especially for PM/Analytics), vague statements, no concrete examples.
3. Award for: specific numbers, clear structure, action-oriented language, relevant experience.
4. Do NOT invent facts. If evidence is missing, set content_fix to recommend what must be added.
5. Keep all text fields brief and plain.

SCORING GUIDE:
- 85-100: Excellent - structured, specific, impactful
- 70-84: Good - clear but missing metrics or depth
- 50-69: Fair - relevant but vague or lacks structure
- 30-49: Weak - missing key elements
- 0-29: Poor - off-topic or extremely brief

EXPLAINABILITY SIGNALS (use these):
- example_present (0-3): how many concrete examples given
- metrics_present (0-3): quantified impact
- structure_star (0-3): follows STAR/CAR format
- relevance (0-3): answers the actual question
- clarity (0-3): easy to follow
- action_oriented (0-3): shows initiative

Output ONLY the JSON object, no other text.`;

// ============================================
// SHORT ANSWER HANDLER
// ============================================

function handleShortAnswer(quinnMode: QuinnMode): ContentJudgeOutput {
    const strength = quinnMode === 'SUPPORTIVE'
        ? "You've started thinking about this!"
        : "Brief.";
    const fix = quinnMode === 'SUPPORTIVE'
        ? "Try expanding with a specific example or context."
        : "Expand. Add context and examples.";

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
// BUILD PROMPT
// ============================================

function buildContentJudgePrompt(input: ContentJudgeInput): string {
    const toneInstruction = input.quinnMode === 'SUPPORTIVE'
        ? 'TONE: Be warm, encouraging, never abrasive. Celebrate small wins.'
        : 'TONE: Be concise and blunt. No fluff, straight to the point.';

    const resumeContext = input.resumeKeywords?.length
        ? `\nCandidate's key skills: ${input.resumeKeywords.join(', ')}`
        : '';

    return `${CONTENT_JUDGE_SYSTEM_PROMPT}

${toneInstruction}

CONTEXT:
- Role: ${input.role}
- Track: ${input.track}
- Experience Level: ${input.experienceLevel || 'Mid'}
- Company: ${input.company || 'Generic'}${resumeContext}

INTERVIEW QUESTION:
"${input.questionText}"

CANDIDATE'S ANSWER:
"${input.transcript}"

Evaluate this answer and output the JSON result:`;
}

// ============================================
// MAIN JUDGE FUNCTION
// ============================================

export async function judgeContent(input: ContentJudgeInput): Promise<ContentJudgeOutput> {
    const startTime = Date.now();

    // Validate required fields
    if (!input.questionId || !input.questionText || !input.transcript) {
        return {
            status: 'ERROR',
            content_score: 0,
            content_strength: '',
            content_fix: 'Missing required fields',
            content_label: 'ERROR',
            key_evidence: null,
            suggested_rewrite: null,
            explainability: [],
            resource_ids: [],
            latency_ms: Date.now() - startTime
        };
    }

    // Handle short answers (< 8 words)
    const wordCount = input.transcript.trim().split(/\s+/).length;
    if (wordCount < 8) {
        const result = handleShortAnswer(input.quinnMode);
        result.latency_ms = Date.now() - startTime;
        return result;
    }

    // Build prompt and call Gemini
    const prompt = buildContentJudgePrompt(input);
    const timeout = input.maxResponseTimeMs || 7000;

    try {
        // Create a timeout promise
        const timeoutPromise = new Promise<never>((_, reject) => {
            setTimeout(() => reject(new Error('LLM_TIMEOUT')), timeout);
        });

        // Race between LLM call and timeout
        const responseText = await Promise.race([
            callGemini(prompt, { temperature: 0.3, maxOutputTokens: 512 }),
            timeoutPromise
        ]);

        // Parse JSON response
        const parsed = JSON.parse(responseText) as ContentJudgeOutput;

        // Validate and sanitize response
        const result: ContentJudgeOutput = {
            status: 'OK',
            content_score: Math.min(100, Math.max(0, parsed.content_score || 50)),
            content_strength: (parsed.content_strength || 'Good effort').slice(0, 100),
            content_fix: (parsed.content_fix || 'Add more detail').slice(0, 100),
            content_label: parsed.content_label || 'GENERAL',
            key_evidence: parsed.key_evidence?.slice(0, 80) || null,
            suggested_rewrite: parsed.suggested_rewrite?.slice(0, 200) || null,
            explainability: Array.isArray(parsed.explainability) ? parsed.explainability.slice(0, 6) : [],
            resource_ids: Array.isArray(parsed.resource_ids) ? parsed.resource_ids : [],
            latency_ms: Date.now() - startTime
        };

        return result;

    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';

        // Handle timeout specifically
        if (errorMessage === 'LLM_TIMEOUT') {
            return {
                status: 'PARTIAL',
                content_score: 50,
                content_strength: 'Answer received',
                content_fix: 'Detailed feedback pending...',
                content_label: 'PENDING',
                key_evidence: null,
                suggested_rewrite: null,
                explainability: [{ signal: 'timeout', value: 1 }],
                resource_ids: [],
                latency_ms: Date.now() - startTime
            };
        }

        // General error
        console.error('Content Judge error:', error);
        return {
            status: 'ERROR',
            content_score: 0,
            content_strength: '',
            content_fix: 'Unable to evaluate at this time',
            content_label: 'ERROR',
            key_evidence: null,
            suggested_rewrite: null,
            explainability: [{ signal: 'error', value: 1 }],
            resource_ids: [],
            latency_ms: Date.now() - startTime
        };
    }
}
