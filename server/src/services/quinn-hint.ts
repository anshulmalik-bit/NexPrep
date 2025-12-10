import { callGemini } from './gemini.js';
import { buildQuinnCorePrompt, QuinnMode } from './quinn-core.js';

interface HintInput {
    question: string;
    quinnMode: QuinnMode;
    role: string;
}

interface HintOutput {
    hint: string;
}

export async function generateHint(input: HintInput): Promise<HintOutput> {
    const { question, quinnMode, role } = input;

    const prompt = `
${buildQuinnCorePrompt(quinnMode)}

A candidate is stuck on this interview question and needs a hint.

QUESTION: "${question}"
ROLE: ${role}

CRITICAL RULES:
1. DO NOT provide the answer or content for the answer
2. DO NOT rewrite or paraphrase what they should say
3. ONLY provide frameworks, structures, or reflective cues
4. Examples of good hints:
   - "Consider using the STAR method: Situation, Task, Action, Result"
   - "Think about a time when you had to balance competing priorities"
   - "What metrics would show success in this situation?"
   - "Consider the 'why' behind the question"
5. Keep it brief but helpful

OUTPUT JSON SCHEMA:
{
  "hint": "Your structural hint or framework suggestion"
}

Generate the hint:
`;

    const response = await callGemini(prompt, { temperature: 0.3 });

    try {
        const parsed = JSON.parse(response);
        return {
            hint: parsed.hint,
        };
    } catch (error) {
        return {
            hint: 'Try using the STAR method: Situation, Task, Action, Result. Structure your answer to show clear impact.',
        };
    }
}
