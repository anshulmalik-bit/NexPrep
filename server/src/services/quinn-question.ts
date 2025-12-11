import { LLMFactory } from './llm/factory.js';
import { QuinnMode } from './quinn-core.js';

interface QuestionGenInput {
    track: string;
    role: string;
    quinnMode: QuinnMode;
    resumeText?: string;
    companyName?: string;
    industryId?: string;
    companySizeId?: string;
    questionNumber: number;
    previousQuestions: string[];
}

interface QuestionOutput {
    question: string;
    competencyType: 'behavioral' | 'technical' | 'communication' | 'role-specific';
    difficulty: 'easy' | 'medium' | 'hard';
    hintsAvailable: boolean;
}

export async function generateQuestion(input: QuestionGenInput): Promise<QuestionOutput> {
    const { track, role, quinnMode, resumeText, companyName, industryId, companySizeId, questionNumber, previousQuestions } = input;

    // Compressed Context Building
    const companyCtx = companyName ? `Target: ${companyName}` : industryId ? `Industry: ${industryId}` : '';
    const resumeCtx = resumeText ? `Resume: ${resumeText.substring(0, 300)}...` : '';
    const prevQs = previousQuestions.length > 0 ? `PrevQs: ${previousQuestions.join('; ')}` : '';
    const difficulty = questionNumber <= 2 ? 'easy' : questionNumber <= 4 ? 'medium' : 'hard';

    const tone = quinnMode === 'SUPPORTIVE' ? 'Encouraging' : 'Direct';

    // Compressed Prompt for Llama 3
    // Intentionally minimal to save tokens
    const prompt = `Role: Interviewer for ${role}.
Context: ${companyCtx} ${resumeCtx}
Task: Generate Q#${questionNumber} (${difficulty}, ${track}).
${prevQs} (Avoid duplicates).
Tone: ${tone}.

Required JSON Output:
{
  "question": "<text>",
  "competencyType": "<behavioral|technical|communication|role-specific>",
  "difficulty": "<easy|medium|hard>",
  "hintsAvailable": true
}`;

    try {
        const provider = LLMFactory.getProvider();
        const parsed = await provider.generateJson<QuestionOutput>(prompt, {
            temperature: 0.7,
            maxOutputTokens: 256
        });

        return {
            question: parsed.question,
            competencyType: parsed.competencyType || 'behavioral',
            difficulty: parsed.difficulty || 'medium',
            hintsAvailable: parsed.hintsAvailable !== false,
        };
    } catch (error) {
        console.error('Question Gen Error:', error);
        // Fallback
        return {
            question: `Describe a challenge you faced as a ${role} and how you solved it.`,
            competencyType: 'behavioral',
            difficulty: 'medium',
            hintsAvailable: true,
        };
    }
}
