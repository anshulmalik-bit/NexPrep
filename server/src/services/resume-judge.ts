/**
 * NexPrep Resume Judge Service
 * 
 * Harsh, realistic resume evaluation using LLM.
 * Returns JSON with scores and detailed feedback.
 */

import { LLMFactory } from './llm/factory.js';

// ============================================================================
// RESUME JUDGE SYSTEM PROMPT
// ============================================================================

const RESUME_JUDGE_PROMPT = `YOU ARE THE NEXPREP RESUME JUDGE.

You evaluate resumes with the strict, unforgiving standards used by top-tier HR interviewers at competitive companies.

Your judgment must be:
- Harshly realistic
- Bluntly honest
- Zero sugar-coating
- No polite encouragement
- No motivational tone
- No softening of criticism

Your goal is to give the candidate the raw truth about where their resume fails, so they can improve.
Never try to protect their feelings.

⭐ I. WHAT YOU ARE JUDGING

Evaluate the resume ONLY on content quality, based on:
- The selected Job Role
- The Company/Industry
- The Resume Text

You judge strictly across five pillars:

1. Role Relevance (35%)
   - Does this resume actually qualify for the job?
   - If skills/projects are missing → call it out plainly.
   - If experience is irrelevant → say so directly.

2. Industry/Company Fit (25%)
   - Does the resume reflect understanding of the company's style and values?
   - If not → say it bluntly.

3. Achievements & Impact (20%)
   - If the resume lists tasks instead of results → criticize it directly.
   - If metrics are missing → point it out.

4. Communication Quality (10%)
   - If writing is messy, vague, or generic → state that clearly.

5. Professionalism & Polish (10%)
   - If the resume has formatting inconsistencies or unclear sections → flag it aggressively.

⭐ II. HOW YOU MUST JUDGE

Be uncompromising.

Examples of allowed tone:
- "This experience does not relate to the chosen role."
- "Your resume lacks measurable impact."
- "Nothing here signals readiness for this job."
- "This bullet point is generic and meaningless."
- "This resume would not pass the first screening at this company."
- "The responsibilities listed are far too basic."

Examples of forbidden tone:
- "Don't worry too much…"
- "You did your best…"
- "Here are some gentle suggestions…"
- "It's okay, just try again…"

No gentleness. No emotional cushioning. Pure evaluation.

⭐ III. OUTPUT RULES

You must return strict JSON in this structure:

{
  "resumeScore": 0,
  "roleRelevance": 0,
  "industryFit": 0,
  "achievementsImpact": 0,
  "communicationQuality": 0,
  "professionalismPolish": 0,
  "strengths": [],
  "weaknesses": [],
  "roleFitSummary": "",
  "companyFitSummary": "",
  "improvementSuggestions": []
}

Where:
- Each score is an integer 0–100.
- Strengths = 2–4 items, but ONLY if they are genuinely strong.
- Weaknesses = 4–7 highly specific, blunt criticisms.
- improvementSuggestions = 5–10 concrete, actionable steps (no compliments).

If the resume is extremely weak:
- It is allowed to output 0 in multiple categories.
- It is allowed to say: "This resume would likely be rejected instantly."

⭐ IV. HARSHNESS RULES

- Always prioritize weaknesses over strengths.
- If the resume is generic → call it out.
- If the resume has NO relevance → score Role Relevance extremely low.
- If the company selected is very demanding (Google, Deloitte, etc.) → raise the evaluation bar.
- Avoid polite phrases. You must sound like a strict HR analyst evaluating hundreds of resumes daily.

⭐ V. PROHIBITIONS

Do NOT:
- be encouraging
- soften the language
- use therapy tone
- insert emojis
- give emotional support
- guess or invent missing information
- affect the JSON structure`;

// ============================================================================
// TYPES
// ============================================================================

export interface ResumeJudgeInput {
    resumeText: string;
    roleId: string;
    companyName?: string;
    industryId?: string;
}

export interface ResumeJudgeOutput {
    resumeScore: number;
    roleRelevance: number;
    industryFit: number;
    achievementsImpact: number;
    communicationQuality: number;
    professionalismPolish: number;
    strengths: string[];
    weaknesses: string[];
    roleFitSummary: string;
    companyFitSummary: string;
    improvementSuggestions: string[];
}

// ============================================================================
// MAIN SERVICE FUNCTION
// ============================================================================

export async function judgeResume(input: ResumeJudgeInput): Promise<ResumeJudgeOutput> {
    const startTime = Date.now();
    const { resumeText, roleId, companyName, industryId } = input;

    // Validate input
    if (!resumeText || resumeText.trim().length < 50) {
        console.log('[ResumeJudge] Resume too short, returning failure');
        return createFailureResponse('Resume text is too short or missing.');
    }

    // Build context
    const context = companyName
        ? `Target Company: ${companyName}`
        : industryId
            ? `Target Industry: ${industryId}`
            : 'General job market';

    const prompt = `${RESUME_JUDGE_PROMPT}

---

JOB ROLE: ${roleId}
${context}

RESUME TEXT:
"""
${resumeText.substring(0, 4000)}
"""

Evaluate this resume NOW. Return ONLY valid JSON.`;

    try {
        const provider = LLMFactory.getProvider();
        console.log('[ResumeJudge] Calling LLM provider:', provider.getProviderName());

        const result = await provider.generateJson<ResumeJudgeOutput>(prompt, {
            temperature: 0.3,
            maxOutputTokens: 1024,
        });

        console.log(`[ResumeJudge] score=${result.resumeScore} latency=${Date.now() - startTime}ms`);

        // Validate and sanitize output
        return {
            resumeScore: Math.min(100, Math.max(0, result.resumeScore || 0)),
            roleRelevance: Math.min(100, Math.max(0, result.roleRelevance || 0)),
            industryFit: Math.min(100, Math.max(0, result.industryFit || 0)),
            achievementsImpact: Math.min(100, Math.max(0, result.achievementsImpact || 0)),
            communicationQuality: Math.min(100, Math.max(0, result.communicationQuality || 0)),
            professionalismPolish: Math.min(100, Math.max(0, result.professionalismPolish || 0)),
            strengths: result.strengths || [],
            weaknesses: result.weaknesses || [],
            roleFitSummary: result.roleFitSummary || '',
            companyFitSummary: result.companyFitSummary || '',
            improvementSuggestions: result.improvementSuggestions || [],
        };

    } catch (error) {
        console.error('[ResumeJudge] Error:', error);
        return createFailureResponse('Failed to analyze resume.');
    }
}

function createFailureResponse(reason: string): ResumeJudgeOutput {
    return {
        resumeScore: 0,
        roleRelevance: 0,
        industryFit: 0,
        achievementsImpact: 0,
        communicationQuality: 0,
        professionalismPolish: 0,
        strengths: [],
        weaknesses: [reason],
        roleFitSummary: 'Unable to evaluate.',
        companyFitSummary: 'Unable to evaluate.',
        improvementSuggestions: ['Provide a complete resume for evaluation.'],
    };
}
