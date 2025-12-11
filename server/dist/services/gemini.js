import { GoogleGenerativeAI } from '@google/generative-ai';
const API_KEY = process.env.GEMINI_API_KEY || '';
if (!API_KEY) {
    console.warn('⚠️ GEMINI_API_KEY not set. AI features will not work.');
}
const genAI = new GoogleGenerativeAI(API_KEY);
const CONSTANTS = {
    MAX_RETRIES: 3,
    INITIAL_DELAY_MS: 2000,
    BACKOFF_FACTOR: 2,
};
/**
 * Helper to check if an error corresponds to a "limit: 0" quota issue,
 * which usually indicates the user is using a Vertex AI project/key
 * without billing instead of a fresh AI Studio key.
 */
function isZeroLimitError(error) {
    try {
        const msg = JSON.stringify(error);
        return msg.includes('limit: 0') && msg.includes('quota');
    }
    catch {
        return false;
    }
}
/**
 * Robust wrapper for Gemini calls with exponential backoff for rate limits.
 */
async function callWithRetry(fn, attempt = 1) {
    try {
        return await fn();
    }
    catch (error) {
        // 1. Check for the "Wrong Door" issue (Vertex vs AI Studio) immediately
        if (isZeroLimitError(error)) {
            console.error('\n🛑 GEMINI QUOTA ERROR (LIMIT=0)');
            console.error('It looks like you are using a key with no free tier quota.');
            console.error('TIP: You might be using a Google Cloud Vertex AI key requiring billing.');
            console.error('FIX: Go to https://aistudio.google.com/, create a NEW API Key in a NEW project, and use that.\n');
            throw error; // Don't retry, it won't help
        }
        // 2. Check for standard Rate Limits (429) to retry
        const isRateLimit = error.message?.includes('429') || error.status === 429 || error.message?.includes('Too Many Requests');
        if (isRateLimit && attempt <= CONSTANTS.MAX_RETRIES) {
            const delay = CONSTANTS.INITIAL_DELAY_MS * Math.pow(CONSTANTS.BACKOFF_FACTOR, attempt - 1);
            console.warn(`[Gemini] Rate limit hit. Retrying in ${delay}ms... (Attempt ${attempt}/${CONSTANTS.MAX_RETRIES})`);
            await new Promise(resolve => setTimeout(resolve, delay));
            return callWithRetry(fn, attempt + 1);
        }
        throw error;
    }
}
export async function callGemini(prompt, options = {}) {
    const { temperature = 0.7, maxOutputTokens = 2048 } = options;
    const model = genAI.getGenerativeModel({
        model: 'gemini-2.0-flash',
        generationConfig: {
            temperature,
            maxOutputTokens,
            responseMimeType: 'application/json',
        },
    });
    return callWithRetry(async () => {
        const result = await model.generateContent(prompt);
        const response = result.response;
        return response.text();
    });
}
export async function callGeminiText(prompt, options = {}) {
    const { temperature = 0.7, maxOutputTokens = 2048 } = options;
    const model = genAI.getGenerativeModel({
        model: 'gemini-2.0-flash',
        generationConfig: {
            temperature,
            maxOutputTokens,
        },
    });
    return callWithRetry(async () => {
        const result = await model.generateContent(prompt);
        const response = result.response;
        return response.text();
    });
}
