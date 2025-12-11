import { LLMFactory } from './llm/factory.js';
export async function evaluateAnswer(input) {
    const { question, answer, quinnMode, role, competencyType } = input;
    const tone = quinnMode === 'SUPPORTIVE' ? 'Constructive' : 'Strict';
    const prompt = `Role: Evaluator for ${role}.
Task: Score and critique answer.
Context:
Q: "${question}"
Type: ${competencyType}
A: "${answer}"
Tone: ${tone}.

Required JSON Output:
{
  "score": <0-100>,
  "strengths": ["<str1>", "<str2>"],
  "weaknesses": ["<wk1>", "<wk2>"],
  "missingElements": ["<missing>"],
  "suggestedStructure": "<structure>",
  "improvedSampleAnswer": "<brief sample>"
}`;
    try {
        const provider = LLMFactory.getProvider();
        const parsed = await provider.generateJson(prompt, { temperature: 0.4, maxOutputTokens: 1024 });
        return {
            score: Math.min(100, Math.max(0, parsed.score || 50)),
            strengths: parsed.strengths || [],
            weaknesses: parsed.weaknesses || [],
            missingElements: parsed.missingElements || [],
            suggestedStructure: parsed.suggestedStructure || 'STAR Method',
            improvedSampleAnswer: parsed.improvedSampleAnswer || '',
        };
    }
    catch (error) {
        return {
            score: 60,
            strengths: ['Attempted to answer'],
            weaknesses: ['Evaluation failed'],
            missingElements: [],
            suggestedStructure: 'STAR',
            improvedSampleAnswer: '',
        };
    }
}
