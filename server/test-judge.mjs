// Test script for judge API
async function testJudge() {
    try {
        const response = await fetch('http://localhost:3001/api/judge/content', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                questionId: 'test-1',
                questionText: 'Tell me about yourself',
                transcript: 'I am a software developer with experience building web applications.',
                role: 'developer',
                track: 'tech',
                quinnMode: 'SUPPORTIVE'
            })
        });
        const data = await response.json();
        console.log('Response:', JSON.stringify(data, null, 2));
    } catch (error) {
        console.error('Error:', error);
    }
}

testJudge();
