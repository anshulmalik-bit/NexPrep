import { LLMFactory } from './llm/factory.js';
// Helper to get provider
const getLLM = () => LLMFactory.getProvider();
export async function generateReportSummary(input) {
    const { answers, role } = input;
    const avgScore = Math.round(answers.reduce((sum, a) => sum + a.evaluation.score, 0) / answers.length);
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
        return {
            skillMatrix: [
                { skill: 'Communication', score: 70 },
                { skill: 'Problem Solving', score: 65 },
                { skill: 'Technical', score: 70 },
                { skill: 'Leadership', score: 60 },
                { skill: 'Adaptability', score: 65 },
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
