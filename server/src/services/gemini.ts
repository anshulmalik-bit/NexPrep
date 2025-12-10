import { GoogleGenerativeAI, GenerativeModel } from '@google/generative-ai';

const API_KEY = process.env.GEMINI_API_KEY || '';

if (!API_KEY) {
    console.warn('⚠️ GEMINI_API_KEY not set. AI features will not work.');
}

const genAI = new GoogleGenerativeAI(API_KEY);

interface GeminiCallOptions {
    temperature?: number;
    maxOutputTokens?: number;
}

export async function callGemini(
    prompt: string,
    options: GeminiCallOptions = {}
): Promise<string> {
    const { temperature = 0.7, maxOutputTokens = 2048 } = options;

    const model: GenerativeModel = genAI.getGenerativeModel({
        model: 'gemini-2.0-flash',
        generationConfig: {
            temperature,
            maxOutputTokens,
            responseMimeType: 'application/json',
        },
    });

    const result = await model.generateContent(prompt);
    const response = result.response;
    return response.text();
}

export async function callGeminiText(
    prompt: string,
    options: GeminiCallOptions = {}
): Promise<string> {
    const { temperature = 0.7, maxOutputTokens = 2048 } = options;

    const model: GenerativeModel = genAI.getGenerativeModel({
        model: 'gemini-2.0-flash',
        generationConfig: {
            temperature,
            maxOutputTokens,
        },
    });

    const result = await model.generateContent(prompt);
    const response = result.response;
    return response.text();
}
