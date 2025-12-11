import fetch from 'node-fetch';

async function verifyServer() {
    console.log('Testing server judge endpoint...');
    try {
        const response = await fetch('http://localhost:3001/api/judge/content', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                questionId: 'test-q1',
                questionText: 'Test Question',
                transcript: 'This is a test answer for verifcation.',
                role: 'frontend',
                track: 'tech',
                quinnMode: 'SUPPORTIVE'
            })
        });

        if (!response.ok) {
            console.error('Request failed with status:', response.status);
            const text = await response.text();
            console.error('Response text:', text);
        } else {
            const data = await response.json();
            console.log('Success! Response:', JSON.stringify(data, null, 2));
        }

    } catch (error) {
        console.error('Fetch failed:', error);
    }
}

verifyServer();
