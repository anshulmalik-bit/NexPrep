import { LLMFactory } from './llm/factory.js';
import { buildQuinnCorePrompt, QuinnMode } from './quinn-core.js';

interface ReportInput {
    answers: Array<{
        question: string;
        answer: string;
        evaluation: {
            score: number;
            strengths: string[];
            weaknesses: string[];
        };
    }>;
    quinnMode: QuinnMode;
    role: string;
    track: string;
}

// Helper to get provider
const getLLM = () => LLMFactory.getProvider();

export async function generateReportSummary(input: ReportInput): Promise<{ summary: string }> {
    const { answers, role } = input;
    const avgScore = Math.round(answers.reduce((sum, a) => sum + a.evaluation.score, 0) / answers.length);

    const prompt = `Role: Post-Interview Reporter.
Task: Summarize performance.
Context: Role ${role}, Avg Score ${avgScore}/100.
Observations:
${answers.map((a, i) => `Q${i + 1}: ${a.evaluation.strengths[0] || 'N/A'}`).join('\n')}

Output JSON: { "summary": "<2-3 sentence personalized summary>" }`;

    try {
        const result = await getLLM().generateJson<{ summary: string }>(prompt, { temperature: 0.5 });
        return result;
    } catch {
        return { summary: `Overall interview performance: ${avgScore}/100. Areas of strength and growth identified.` };
    }
}

export async function generateSkillMatrix(input: ReportInput): Promise<{ skillMatrix: Array<{ skill: string; score: number }> }> {
    const { answers, role } = input;

    // Don't generate fictional scores if no real answers exist
    if (!answers || answers.length === 0) {
        return { skillMatrix: [] };
    }

    const prompt = `Role: HR Analyst.
Task: Create skill matrix (5 skills) based on answers for ${role}.
Scores 0-100.

Output JSON: { "skillMatrix": [{ "skill": "<name>", "score": <number> }] }`;

    try {
        // We really should pass context, but saving tokens. 
        // Let's pass a very brief digest of answers if possible, or just generate generic based on role + global score
        // Ideally we pass compressed answers.
        const answersDigest = answers.map((a, i) => `Q${i + 1} (${a.evaluation.score}): ${a.answer.substring(0, 50)}...`).join('\n');

        const fullPrompt = `${prompt}\nAnswers:\n${answersDigest}`;

        const result = await getLLM().generateJson<{ skillMatrix: Array<{ skill: string; score: number }> }>(fullPrompt, { temperature: 0.4 });
        return result;
    } catch {
        // Return sensible fallback based on actual answer data
        const avgScore = Math.round(answers.reduce((sum, a) => sum + a.evaluation.score, 0) / answers.length);
        return {
            skillMatrix: [
                { skill: 'Communication', score: avgScore },
                { skill: 'Problem Solving', score: Math.max(0, avgScore - 5) },
                { skill: 'Technical', score: avgScore },
                { skill: 'Leadership', score: Math.max(0, avgScore - 10) },
                { skill: 'Adaptability', score: Math.max(0, avgScore - 5) },
            ],
        };
    }
}

export async function generateStrengths(input: ReportInput): Promise<{ strengths: string[] }> {
    const { answers } = input;
    const allStrengths = answers.flatMap((a) => a.evaluation.strengths).slice(0, 10); // Limit input

    const prompt = `Task: Consolidate strengths into 3-4 bullet points.
Input: ${allStrengths.join(', ')}
Output JSON: { "strengths": ["<str1>", "<str2>", "<str3>"] }`;

    try {
        return await getLLM().generateJson<{ strengths: string[] }>(prompt, { temperature: 0.4 });
    } catch {
        return { strengths: allStrengths.slice(0, 4) };
    }
}

export async function generateWeaknesses(input: ReportInput): Promise<{ weaknesses: string[] }> {
    const { answers } = input;
    const allWeaknesses = answers.flatMap((a) => a.evaluation.weaknesses).slice(0, 10);

    const prompt = `Task: Consolidate improvements into 3-4 constructive bullet points.
Input: ${allWeaknesses.join(', ')}
Output JSON: { "weaknesses": ["<wk1>", "<wk2>", "<wk3>"] }`;

    try {
        return await getLLM().generateJson<{ weaknesses: string[] }>(prompt, { temperature: 0.4 });
    } catch {
        return { weaknesses: allWeaknesses.slice(0, 4) };
    }
}

export async function generateBreakdown(input: ReportInput): Promise<{ breakdown: Array<{ question: string; score: number; feedback: string }> }> {
    const { answers } = input;

    return {
        breakdown: answers.map((a) => ({
            question: a.question,
            score: a.evaluation.score,
            feedback: a.evaluation.strengths[0]
                ? `${a.evaluation.strengths[0]}. ${a.evaluation.weaknesses[0] || ''}`
                : 'No detailed feedback available.',
        })),
    };
}

export async function generateImprovementPlan(input: ReportInput): Promise<{ improvementPlan: string[] }> {
    const { answers, role } = input;
    const weaknesses = answers.flatMap((a) => a.evaluation.weaknesses).slice(0, 5);

    const prompt = `Task: Create 4-step improvement plan for ${role}.
Weaknesses: ${weaknesses.join(', ')}
Output JSON: { "improvementPlan": ["Step 1:...", "Step 2:...", ...] }`;

    try {
        return await getLLM().generateJson<{ improvementPlan: string[] }>(prompt, { temperature: 0.5 });
    } catch {
        return {
            improvementPlan: [
                'Practice structuring answers using the STAR method',
                'Prepare specific examples',
                'Research company values',
                'Quantify achievements',
            ],
        };
    }
}

export async function generateBatchReport(input: {
    answers: Array<{
        question: string;
        answer: string;
        idealAnswer: string;
        voiceMetrics?: { confidence?: number };
        videoMetrics?: { eyeContact?: number };
    }>;
    role: string;
    preComputedEvaluations?: Array<{
        score: number;
        strengths: string[];
        weaknesses: string[];
        flags?: string[];
    }>;
}): Promise<any> {
    const { answers, role, preComputedEvaluations } = input;

    const usePreComputed = preComputedEvaluations && preComputedEvaluations.length === answers.length;

    const systemPrompt = `ROLE: Senior Interview Coach.
TASK: ${usePreComputed ? 'Summarize graded' : 'Grade & Summarize'}. Role: ${role}.

OUTPUT JSON:
{
  "summary": "2-3 sentences",
  "skillMatrix": [{"skill": "Communication", "score": number}, ...],
  "strengths": ["str1", "str2"],
  "weaknesses": ["wk1", "wk2"],
  "improvementPlan": ["step1", "step2"],
  "evaluations": [
    ${usePreComputed ? '// COPY input scores exactly' : '// Generate scores 0-100'}
    {
      "score": number, 
      "feedback": "string",
      "strength": "string",
      "weakness": "string",
      "improvedSample": "string"
    }
  ]
}`;

    const userPrompt = `INPUTS:
${answers.map((a, i) => {
        const evalData = usePreComputed ? preComputedEvaluations![i] : null;
        const delivery = a.voiceMetrics ? `[Voice: ${(a.voiceMetrics.confidence || 0).toFixed(0)}%]` : "";
        return `Q${i + 1}: ${a.question}
A: ${a.answer} ${delivery}
${evalData ? `[Score ${evalData.score}, Flags: ${evalData.flags?.join(', ') || 'None'}]` : `Key: ${a.idealAnswer}`}`;
    }).join('\n')}`;


    try {
        return await getLLM().generateJson<any>(userPrompt, {
            temperature: 0.4,
            systemPrompt: systemPrompt
        });
    } catch (error) {
        console.error("Batch report generation failed", error);
        // Fallback structure
        return {
            summary: "Interview completed. Detailed AI analysis unavailable due to service interruption.",
            skillMatrix: [
                { skill: "Participation", score: 100 },
                { skill: "Completeness", score: 100 }
            ],
            strengths: ["Completed all questions"],
            weaknesses: ["AI analysis unavailable"],
            improvementPlan: ["Review resources manually"],
            evaluations: answers.map((_, i) => {
                const pre = preComputedEvaluations ? preComputedEvaluations[i] : null;
                return {
                    score: pre ? pre.score : 80,
                    feedback: "Good effort.",
                    strength: pre ? pre.strengths[0] : "Answer recorded",
                    weakness: pre ? pre.weaknesses[0] : "None detected",
                    improvedSample: "N/A"
                };
            })
        };
    }
}
