import { LLMFactory } from './llm/factory.js';
// Helper: Dynamic Weighting
function calculateFairScore(contentScore, voiceMetrics, videoMetrics) {
    // 1. Text Only Mode (100% Content)
    if (!voiceMetrics && !videoMetrics) {
        return contentScore;
    }
    // 2. Text + Voice Mode (70% Content, 30% Delivery)
    if (voiceMetrics && !videoMetrics) {
        const deliveryScore = (voiceMetrics.confidence || 50); // Fallback to neutral if minimal data
        return Math.round((contentScore * 0.7) + (deliveryScore * 0.3));
    }
    // 3. Full Video Mode (50% Content, 30% Voice, 20% Presence)
    const voiceScore = voiceMetrics?.confidence || 50;
    const presenceScore = videoMetrics?.eyeContact ? videoMetrics.eyeContact * 100 : 50; // Simple normalize
    return Math.round((contentScore * 0.5) + (voiceScore * 0.3) + (presenceScore * 0.2));
}
export async function evaluateAnswer(input) {
    const { question, answer, quinnMode, role, competencyType, voiceMetrics, videoMetrics } = input;
    const tone = quinnMode === 'SUPPORTIVE' ? 'Constructive' : 'Strict';
    // Build context string for Prompt based on what we have
    const deliveryContext = voiceMetrics
        ? `Voice: Confidence ${(voiceMetrics.confidence || 0).toFixed(0)}/100, Pace ${(voiceMetrics.pace || 0).toFixed(0)}wpm`
        : "Voice: N/A (Text Only)";
    const systemPrompt = `ROLE: Interview Evaluator for ${role}.
TASK: Score answer (0-100) and critique.
TONE: ${tone}.

METRICS:
1. Content Score: Quality/Relevance (0-100).
2. Flags:
   - VAGUE (<30 words, generic)
   - RAMBLING (Repetitive, off-topic)
   - MONOTONE (Flat voice)
   - LOW_CONFIDENCE (Voice < 60)

OUTPUT JSON:
{
  "contentScore": number,
  "strengths": ["str1", "str2"],
  "weaknesses": ["wk1", "wk2"],
  "missingElements": ["missing1"],
  "suggestedStructure": "STAR",
  "improvedSampleAnswer": "One sentence improved version",
  "flags": ["VAGUE", "RAMBLING"]
}`;
    const userPrompt = `CONTEXT:
Q: "${question}"
Type: ${competencyType}
A: "${answer}"
${deliveryContext}`;
    try {
        const provider = LLMFactory.getProvider();
        const parsed = await provider.generateJson(userPrompt, {
            temperature: 0.4,
            maxOutputTokens: 1024,
            systemPrompt: systemPrompt
        });
        // Calculate Final Fair Score
        const contentScore = Math.min(100, Math.max(0, parsed.contentScore || 50));
        const finalScore = calculateFairScore(contentScore, voiceMetrics, videoMetrics);
        return {
            score: finalScore,
            strengths: parsed.strengths || [],
            weaknesses: parsed.weaknesses || [],
            missingElements: parsed.missingElements || [],
            suggestedStructure: parsed.suggestedStructure || 'STAR Method',
            improvedSampleAnswer: parsed.improvedSampleAnswer || '',
            flags: parsed.flags || []
        };
    }
    catch (error) {
        return {
            score: 0,
            strengths: ['Attempted to answer'],
            weaknesses: ['Evaluation failed'],
            missingElements: [],
            suggestedStructure: 'STAR',
            improvedSampleAnswer: '',
            flags: []
        };
    }
}
