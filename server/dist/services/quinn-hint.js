import { LLMFactory } from './llm/factory.js';
export async function generateHint(input) {
    const { question, quinnMode, role } = input;
    const tone = quinnMode === 'SUPPORTIVE' ? 'Helpful' : 'Direct';
    const prompt = `Role: Interview Coach.
Task: Provide a structural hint for this question (do not answer it).
Question: "${question}" (Role: ${role})
Tone: ${tone}.
Rules: No direct answers. Only frameworks/cues.

Required JSON Output:
{
  "hint": "<short structural hint>"
}`;
    try {
        const provider = LLMFactory.getProvider();
        const parsed = await provider.generateJson(prompt, { temperature: 0.3, maxOutputTokens: 128 });
        return { hint: parsed.hint };
    }
    catch (error) {
        return {
            hint: 'Structure your answer using the STAR method: Situation, Task, Action, Result.',
        };
    }
}
