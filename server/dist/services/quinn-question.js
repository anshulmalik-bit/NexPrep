import { callGemini } from './gemini.js';
import { buildQuinnCorePrompt } from './quinn-core.js';
export async function generateQuestion(input) {
    const { track, role, quinnMode, resumeText, companyName, industryId, companySizeId, questionNumber, previousQuestions } = input;
    const contextInfo = companyName
        ? `Targeting company: ${companyName}`
        : industryId
            ? `Industry: ${industryId}, Company Size: ${companySizeId}`
            : 'General industry context';
    const resumeContext = resumeText
        ? `The candidate has this background from their resume: ${resumeText.substring(0, 500)}...`
        : 'No resume provided.';
    const previousQsText = previousQuestions.length > 0
        ? `Previous questions asked (DO NOT REPEAT): ${previousQuestions.join('; ')}`
        : 'This is the first question.';
    const difficultyGuidance = questionNumber <= 2 ? 'easy to medium' : questionNumber <= 4 ? 'medium' : 'medium to hard';
    const prompt = `
${buildQuinnCorePrompt(quinnMode)}

You are generating interview question #${questionNumber} for a candidate.

CONTEXT:
- Track: ${track}
- Role: ${role}
- ${contextInfo}
- ${resumeContext}
- ${previousQsText}

REQUIREMENTS:
1. Generate a realistic interview question for the ${role} position
2. Difficulty should be ${difficultyGuidance}
3. Mix competency types: behavioral, technical, communication, role-specific
4. Make it specific and relevant to the role
5. DO NOT repeat any previous questions

OUTPUT JSON SCHEMA:
{
  "question": "The interview question text",
  "competencyType": "behavioral" | "technical" | "communication" | "role-specific",
  "difficulty": "easy" | "medium" | "hard",
  "hintsAvailable": true
}

Generate the question now:
`;
    const response = await callGemini(prompt, { temperature: 0.7 });
    try {
        const parsed = JSON.parse(response);
        return {
            question: parsed.question,
            competencyType: parsed.competencyType || 'behavioral',
            difficulty: parsed.difficulty || 'medium',
            hintsAvailable: parsed.hintsAvailable !== false,
        };
    }
    catch (error) {
        // Fallback question
        return {
            question: `Tell me about a challenging situation you faced in a ${role} context and how you handled it.`,
            competencyType: 'behavioral',
            difficulty: 'medium',
            hintsAvailable: true,
        };
    }
}
