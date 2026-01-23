import { LLMFactory } from './llm/factory.js';
// Helper to get provider
const getLLM = () => LLMFactory.getProvider();
export async function generateReportSummary(input) {
    const { answers, role } = input;
    const hasAnswers = answers && answers.length > 0;
    const avgScore = hasAnswers
        ? Math.round(answers.reduce((sum, a) => sum + (a.evaluation?.score || 0), 0) / answers.length)
        : 0;
    const prompt = `Role: Post-Interview Reporter.
Task: Summarize performance.
Context: Role ${role}, Avg Score ${avgScore}/100.
Observations:
${answers.map((a, i) => `Q${i + 1}: ${a.evaluation.strengths[0] || 'N/A'}`).join('\n')}

Output JSON: { "summary": "<2-3 sentence personalized summary>" }`;
    try {
        const result = await getLLM().generateJson(prompt, { temperature: 0.5 });
        return result;
    }
    catch {
        return { summary: `Overall interview performance: ${avgScore}/100. Areas of strength and growth identified.` };
    }
}
export async function generateSkillMatrix(input) {
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
        const result = await getLLM().generateJson(fullPrompt, { temperature: 0.4 });
        return result;
    }
    catch {
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
export async function generateStrengths(input) {
    const { answers } = input;
    const allStrengths = answers.flatMap((a) => a.evaluation.strengths).slice(0, 10); // Limit input
    const prompt = `Task: Consolidate strengths into 3-4 bullet points.
Input: ${allStrengths.join(', ')}
Output JSON: { "strengths": ["<str1>", "<str2>", "<str3>"] }`;
    try {
        return await getLLM().generateJson(prompt, { temperature: 0.4 });
    }
    catch {
        return { strengths: allStrengths.slice(0, 4) };
    }
}
export async function generateWeaknesses(input) {
    const { answers } = input;
    const allWeaknesses = answers.flatMap((a) => a.evaluation.weaknesses).slice(0, 10);
    const prompt = `Task: Consolidate improvements into 3-4 constructive bullet points.
Input: ${allWeaknesses.join(', ')}
Output JSON: { "weaknesses": ["<wk1>", "<wk2>", "<wk3>"] }`;
    try {
        return await getLLM().generateJson(prompt, { temperature: 0.4 });
    }
    catch {
        return { weaknesses: allWeaknesses.slice(0, 4) };
    }
}
export async function generateBreakdown(input) {
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
export async function generateImprovementPlan(input) {
    const { answers, role } = input;
    const weaknesses = answers.flatMap((a) => a.evaluation.weaknesses).slice(0, 5);
    const prompt = `Task: Create 4-step improvement plan for ${role}.
Weaknesses: ${weaknesses.join(', ')}
Output JSON: { "improvementPlan": ["Step 1:...", "Step 2:...", ...] }`;
    try {
        return await getLLM().generateJson(prompt, { temperature: 0.5 });
    }
    catch {
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
export async function generateBatchReport(input) {
    const { answers, role, preComputedEvaluations } = input;
    const usePreComputed = preComputedEvaluations && preComputedEvaluations.length === answers.length;
    // 1. TRUNCATE INPUTS (Prevent Context Overflow)
    const truncatedAnswers = answers.map(a => ({
        ...a,
        answer: a.answer.length > 800 ? a.answer.substring(0, 800) + "..." : a.answer
    }));
    const systemPrompt = `ROLE: HR Analyst.
TASK: Grade interview answers. Role: ${role}.

GRADING RULES:
1. Rate "score" (0-100) based on relevance to Key Points.
2. Rate "starRating" (1-5) on STAR structure.
3. "Communication" score = clarity/grammar.

OUTPUT JSON SCHEMA:
{
  "summary": "2 sentence summary.",
  "skillMatrix": [
    {"skill": "Communication", "score": number},
    {"skill": "Problem Solving", "score": number},
    {"skill": "Technical Knowledge", "score": number},
    {"skill": "Cultural Fit", "score": number},
    {"skill": "Adaptability", "score": number}
  ],
  "strengths": ["str1", "str2"],
  "weaknesses": ["wk1", "wk2"],
  "improvementPlan": ["step1", "step2", "step3", "step4"],
  "evaluations": [
    {
      "score": number, 
      "starRating": number,
      "feedback": "string",
      "strength": "string",
      "weakness": "string",
      "improvedSample": "string"
    }
  ]
}`;
    const userPrompt = `INPUTS:
${truncatedAnswers.map((a, i) => {
        const evalData = usePreComputed ? preComputedEvaluations[i] : null;
        let idealKey = a.idealAnswer;
        if (!idealKey || idealKey.length < 5)
            idealKey = "Standard professional answer";
        return `Q${i + 1}: ${a.question}
Key: ${idealKey}
Answer: ${a.answer}
${evalData ? `[PRE-SCORED: ${evalData.score}]` : ''}`;
    }).join('\n\n')}`;
    try {
        // 2. TIMEOUT WRAPPER (Prevent Hanging)
        const timeoutPromise = new Promise((_, reject) => setTimeout(() => reject(new Error("LLM_TIMEOUT")), 25000));
        const llmPromise = getLLM().generateJson(userPrompt, {
            temperature: 0.3, // Lower temperature for stability
            systemPrompt: systemPrompt
        });
        const report = await Promise.race([llmPromise, timeoutPromise]);
        // 3. VALIDATION
        if (!report.evaluations || !Array.isArray(report.evaluations)) {
            throw new Error("Invalid format");
        }
        // 4. SCORE CALCULATION
        const validScores = report.evaluations.map((e) => e.score).filter((s) => typeof s === 'number');
        const overallScore = validScores.length > 0
            ? Math.round(validScores.reduce((a, b) => a + b, 0) / validScores.length)
            : 0;
        return { ...report, overallScore };
    }
    catch (error) {
        console.error("Batch report failed:", error);
        // 5. EXPLICIT ERROR REPORT
        // distinct from "0 score" -> Use -1 or distinct text
        const isTimeout = error.message === "LLM_TIMEOUT";
        const errorMsg = isTimeout ? "Analysis Timed Out" : "Analysis Failed";
        return {
            overallScore: -1, // Client handles this as "Error State"
            summary: `Report unavailable: ${errorMsg}. Please try again.`,
            skillMatrix: [],
            strengths: ["Review needed"],
            weaknesses: [errorMsg],
            improvementPlan: ["Retry interview"],
            evaluations: answers.map((_, i) => ({
                score: 0,
                starRating: 1,
                feedback: `${errorMsg}. Please retry.`,
                strength: "Response Recorded",
                weakness: errorMsg,
                improvedSample: "N/A"
            }))
        };
    }
}
