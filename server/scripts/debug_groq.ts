import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { GroqProvider } from '../src/services/llm/groq-provider.ts';

// Manually load .env from server root
const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, '../.env') });

console.log('API Key present:', !!process.env.GROQ_API_KEY);
if (process.env.GROQ_API_KEY) {
    console.log('API Key prefix:', process.env.GROQ_API_KEY.substring(0, 5));
}

async function test() {
    console.log('Initializing GroqProvider...');
    try {
        const provider = new GroqProvider();
        console.log('Provider initialized.');

        console.log('Testing generateJson...');
        const result = await provider.generateJson<{ answer: string }>(
            'Return a JSON object with a single field "answer" containing "Hello World".',
            { maxOutputTokens: 100 }
        );
        console.log('Result:', JSON.stringify(result, null, 2));
    } catch (error) {
        console.error('Test Failed:', error);
    }
}

test();
