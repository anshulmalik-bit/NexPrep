import { callGemini } from './gemini.js';
import { buildQuinnCorePrompt } from './quinn-core.js';
// Chunked report generation - each function is a separate API call
export async function generateReportSummary(input) {
    const { answers, quinnMode, role } = input;
    const avgScore = answers.reduce((sum, a) => sum + a.evaluation.score, 0) / answers.length;
    const prompt = `
${buildQuinnCorePrompt(quinnMode)}

Generate a brief, personalized summary of this candidate's interview performance.

ROLE: ${role}
AVERAGE SCORE: ${Math.round(avgScore)}/100
QUESTIONS ANSWERED: ${answers.length}

KEY OBSERVATIONS:
${answers.map((a, i) => `Q${i + 1} (Score: ${a.evaluation.score}): ${a.evaluation.strengths[0] || 'N/A'}`).join('\n')}

OUTPUT JSON:
{ "summary": "2-3 sentence personalized summary in Quinn's voice" }
`;
    const response = await callGemini(prompt, { temperature: 0.5 });
    try {
        return JSON.parse(response);
    }
    catch {
        return { summary: `Overall interview performance: ${Math.round(avgScore)}/100. Areas of strength and growth identified.` };
    }
}
export async function generateSkillMatrix(input) {
    const { answers, role } = input;
    const prompt = `
Analyze these interview answers for a ${role} position and create a skill matrix.

ANSWERS:
${answers.map((a, i) => `Q${i + 1}: "${a.answer.substring(0, 200)}..." (Score: ${a.evaluation.score})`).join('\n')}

Create 5 relevant skills for this role and assign a score (0-100) based on demonstrated competency.

OUTPUT JSON:
{
  "skillMatrix": [
    { "skill": "Communication", "score": 75 },
    { "skill": "Problem Solving", "score": 80 },
    ...
  ]
}
`;
    const response = await callGemini(prompt, { temperature: 0.4 });
    try {
        return JSON.parse(response);
    }
    catch {
        return {
            skillMatrix: [
                { skill: 'Communication', score: 70 },
                { skill: 'Problem Solving', score: 65 },
                { skill: 'Technical Knowledge', score: 70 },
                { skill: 'Leadership', score: 60 },
                { skill: 'Adaptability', score: 65 },
            ],
        };
    }
}
export async function generateStrengths(input) {
    const { answers, quinnMode } = input;
    const allStrengths = answers.flatMap((a) => a.evaluation.strengths);
    const prompt = `
${buildQuinnCorePrompt(quinnMode)}

Based on these observed strengths from an interview:
${allStrengths.join(', ')}

Create 3-4 consolidated, actionable strength statements in Quinn's voice.

OUTPUT JSON:
{ "strengths": ["strength 1", "strength 2", "strength 3"] }
`;
    const response = await callGemini(prompt, { temperature: 0.4 });
    try {
        return JSON.parse(response);
    }
    catch {
        return { strengths: allStrengths.slice(0, 4) };
    }
}
export async function generateWeaknesses(input) {
    const { answers, quinnMode } = input;
    const allWeaknesses = answers.flatMap((a) => a.evaluation.weaknesses);
    const prompt = `
${buildQuinnCorePrompt(quinnMode)}

Based on these areas for improvement from an interview:
${allWeaknesses.join(', ')}

Create 3-4 consolidated, actionable improvement areas in Quinn's voice.
Frame them constructively.

OUTPUT JSON:
{ "weaknesses": ["area 1", "area 2", "area 3"] }
`;
    const response = await callGemini(prompt, { temperature: 0.4 });
    try {
        return JSON.parse(response);
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
    const { answers, quinnMode, role } = input;
    const weaknesses = answers.flatMap((a) => a.evaluation.weaknesses);
    const avgScore = answers.reduce((sum, a) => sum + a.evaluation.score, 0) / answers.length;
    const prompt = `
${buildQuinnCorePrompt(quinnMode)}

Create a personalized 4-5 step improvement plan for a ${role} candidate.

AVERAGE SCORE: ${Math.round(avgScore)}/100
AREAS TO IMPROVE: ${weaknesses.join(', ')}

Make each step specific and actionable. Use Quinn's voice.

OUTPUT JSON:
{ "improvementPlan": ["Step 1: ...", "Step 2: ...", ...] }
`;
    const response = await callGemini(prompt, { temperature: 0.5 });
    try {
        return JSON.parse(response);
    }
    catch {
        return {
            improvementPlan: [
                'Practice structuring answers using the STAR method',
                'Prepare 3-5 specific examples for common behavioral questions',
                'Research the company culture and values before interviews',
                'Work on quantifying your achievements with metrics',
            ],
        };
    }
}
