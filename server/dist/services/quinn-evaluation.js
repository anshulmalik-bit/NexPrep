import { callGemini } from './gemini.js';
import { buildQuinnCorePrompt } from './quinn-core.js';
export async function evaluateAnswer(input) {
    const { question, answer, quinnMode, role, competencyType } = input;
    const prompt = `
${buildQuinnCorePrompt(quinnMode)}

Evaluate this interview answer for a ${role} position.

QUESTION: "${question}"
COMPETENCY TYPE: ${competencyType}
CANDIDATE'S ANSWER: "${answer}"

EVALUATION CRITERIA:
1. Relevance to the question
2. Structure and clarity
3. Use of specific examples
4. Demonstration of relevant skills
5. Conciseness and impact

Score from 0-100 based on interview performance standards.
Be fair but honest. A perfect answer scores 90-100. Average is 60-70.

OUTPUT JSON SCHEMA:
{
  "score": number (0-100),
  "strengths": ["strength 1", "strength 2"],
  "weaknesses": ["area to improve 1", "area to improve 2"],
  "missingElements": ["what could have been included"],
  "suggestedStructure": "recommended framework or structure",
  "improvedSampleAnswer": "brief example of how to strengthen the answer"
}

Evaluate now:
`;
    const response = await callGemini(prompt, { temperature: 0.4 });
    try {
        const parsed = JSON.parse(response);
        return {
            score: Math.min(100, Math.max(0, parsed.score || 50)),
            strengths: parsed.strengths || [],
            weaknesses: parsed.weaknesses || [],
            missingElements: parsed.missingElements || [],
            suggestedStructure: parsed.suggestedStructure || 'Use the STAR method for behavioral questions',
            improvedSampleAnswer: parsed.improvedSampleAnswer || '',
        };
    }
    catch (error) {
        return {
            score: 60,
            strengths: ['Attempted to answer the question'],
            weaknesses: ['Could use more specific examples'],
            missingElements: ['Quantifiable results'],
            suggestedStructure: 'STAR method: Situation, Task, Action, Result',
            improvedSampleAnswer: 'Consider providing a specific example with measurable outcomes.',
        };
    }
}
