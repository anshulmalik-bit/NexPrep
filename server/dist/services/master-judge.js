/**
 * Master Judge Service
 *
 * Evaluates a full HR interview based on:
 * - All user answers (text)
 * - Precomputed voice metrics
 * - Precomputed video metrics
 * - Role, industry/company, resume summary
 *
 * Returns strict JSON with textScore, voiceScore, videoScore, breakdown, and improvement plan.
 */
import { LLMFactory } from './llm/factory.js';
// ============================================================================
// MASTER JUDGE SYSTEM PROMPT
// ============================================================================
const MASTER_JUDGE_SYSTEM_PROMPT = `YOU ARE THE NEXPREP MASTER JUDGE.

You evaluate a full HR interview based on:
- All user answers (text)
- Precomputed voice metrics for each answer
- Precomputed video metrics for each answer
- The role
- The industry/company
- The resume summary

Your judgment must be strictly HR/behavioral and must NEVER include technical evaluation.

Your output MUST be a strict JSON object conforming EXACTLY to the schema provided later.
No extra text. No explanations outside JSON. No conversational prose.

JUDGING PRINCIPLES:
You act as an HR interviewer, behavioral psychologist, and communication coach.
You evaluate what the candidate said (content), HOW they said it (voice), and HOW they behaved (video).

TEXT JUDGE DIMENSIONS (0-5 scale each):
- Clarity: Is the communication coherent and structured?
- Relevance: Did they answer the question?
- Specificity: Did they give concrete examples?
- Ownership: Did they show personal responsibility?
- Reflection: Do they demonstrate learning & awareness?
- Role Alignment: Does this response fit expectations for the role/industry?

VOICE METRICS (interpret only what's provided):
- pace, fillers, confidenceScore, volumeStability, silenceDuration
- Judge: Confidence, Vocal control, Energy, Calmness

VIDEO METRICS (interpret only what's provided):
- eyeContactScore, postureScore, expressivenessScore, engagementScore
- Judge: Non-verbal confidence, Stability, Engagement, Professional presence

AGGREGATED SCORES:
Output three global scores (0-100 integers): textScore, voiceScore, videoScore.
Do NOT calculate weighted final score - backend will compute this.

BEHAVIORAL PATTERNS:
Analyze the entire interview: 3 strengths, 3 weaknesses, pattern description.

IMPROVEMENT PLAN:
Summary paragraph + exactly 7 bullet points (7-day plan). Must be exactly 7 items.

OUTPUT FORMAT - STRICT JSON ONLY:
{
  "textScore": 0,
  "voiceScore": 0,
  "videoScore": 0,
  "questionBreakdown": [
    {
      "questionNumber": 1,
      "question": "",
      "userAnswer": "",
      "textJudge": {
        "clarity": 0,
        "relevance": 0,
        "specificity": 0,
        "ownership": 0,
        "reflection": 0,
        "alignment": 0,
        "explanation": ""
      },
      "voiceMetricsUsed": {},
      "videoMetricsUsed": {}
    }
  ],
  "strengths": [],
  "weaknesses": [],
  "behavioralPatterns": "",
  "improvementPlan": {
    "summary": "",
    "sevenDayPlan": ["", "", "", "", "", "", ""]
  }
}

HARD RULES:
- Never invent voice/video metric numbers
- Never evaluate technical skills
- Keep explanations tight
- Output MUST be valid JSON or return {"error": "JUDGE_FAILED"}`;
// ============================================================================
// MAIN JUDGE FUNCTION
// ============================================================================
export async function evaluateInterview(input) {
    const startTime = Date.now();
    // Validate input
    if (!input.answers || input.answers.length === 0) {
        return createErrorResult(startTime, 'No answers provided');
    }
    // Build the user prompt with all interview data
    const userPrompt = buildUserPrompt(input);
    try {
        const provider = LLMFactory.getProvider();
        const modelUsed = provider.getProviderName();
        // Use generateJson for structured output
        const result = await provider.generateJson(`${MASTER_JUDGE_SYSTEM_PROMPT}\n\n${userPrompt}`, {
            temperature: 0.2, // Low temperature for consistent evaluation
            maxOutputTokens: 2048,
        });
        // Validate the result
        if (!result || typeof result.textScore !== 'number') {
            throw new Error('Invalid judge response structure');
        }
        // Add diagnostic info
        return {
            ...result,
            diagnostic: {
                modelUsed,
                latencyMs: Date.now() - startTime,
            },
        };
    }
    catch (error) {
        const msg = error instanceof Error ? error.message : 'Unknown error';
        console.error('[MasterJudge] Error:', msg);
        return createErrorResult(startTime, msg);
    }
}
// ============================================================================
// HELPER FUNCTIONS
// ============================================================================
function buildUserPrompt(input) {
    const { answers, role, industry, company, resumeSummary } = input;
    const context = [
        `Role: ${role}`,
        company ? `Company: ${company}` : industry ? `Industry: ${industry}` : '',
        resumeSummary ? `Resume Summary: ${resumeSummary}` : '',
    ].filter(Boolean).join('\n');
    const answersJson = answers.map((a, i) => ({
        questionNumber: i + 1,
        question: a.question,
        answer: a.answer,
        voiceMetrics: a.voiceMetrics || {},
        videoMetrics: a.videoMetrics || {},
    }));
    return `CONTEXT:
${context}

INTERVIEW DATA:
${JSON.stringify(answersJson, null, 2)}

Evaluate this interview and return the JSON response.`;
}
function createErrorResult(startTime, errorMsg) {
    return {
        textScore: 0,
        voiceScore: 0,
        videoScore: 0,
        questionBreakdown: [],
        strengths: [],
        weaknesses: [],
        behavioralPatterns: '',
        improvementPlan: {
            summary: 'Evaluation could not be completed.',
            sevenDayPlan: [
                'Day 1: Review interview basics',
                'Day 2: Practice STAR method',
                'Day 3: Focus on clarity',
                'Day 4: Work on examples',
                'Day 5: Practice conciseness',
                'Day 6: Self-record practice',
                'Day 7: Full mock interview',
            ],
        },
        error: errorMsg,
        diagnostic: {
            modelUsed: 'none',
            latencyMs: Date.now() - startTime,
        },
    };
}
const QUICK_JUDGE_PROMPT = `You are a quick interview answer evaluator. 
Evaluate the answer and return JSON ONLY:
{
  "score": <0-100>,
  "strength": "<positive feedback, max 15 words>",
  "fix": "<constructive tip, max 15 words>",
  "label": "<STRUCTURE|DEPTH|METRICS|CLARITY|EXAMPLES|RELEVANCE>"
}
Be strict but constructive. HR/behavioral focus only.`;
export async function quickJudgeAnswer(input) {
    const startTime = Date.now();
    const { question, answer, role, quinnMode } = input;
    // Always use LLM for evaluation - removed short-answer heuristic
    const tone = quinnMode === 'SUPPORTIVE' ? 'Warm, encouraging' : 'Direct, concise';
    const prompt = `${QUICK_JUDGE_PROMPT}

Role: ${role}
Tone: ${tone}
Question: "${question}"
Answer: "${answer}"`;
    try {
        const provider = LLMFactory.getProvider();
        const result = await provider.generateJson(prompt, {
            temperature: 0.2,
            maxOutputTokens: 256,
        });
        console.log(`[QuickJudge] score=${result.score} latency=${Date.now() - startTime}ms`);
        return {
            score: result.score ?? 50, // Use ?? to preserve 0 values
            strength: result.strength || 'Answer received.',
            fix: result.fix || 'Continue to elaborate.',
            label: result.label || 'GENERAL',
        };
    }
    catch (error) {
        console.error('[QuickJudge] Error:', error);
        // Return heuristic fallback
        return {
            score: 40,
            strength: 'Answer recorded.',
            fix: 'Could not analyze. Try adding more detail.',
            label: 'ERROR',
        };
    }
}
