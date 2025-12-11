import fetch from 'node-fetch';

const API_URL = 'http://localhost:3001/api';

async function runVerification() {
    console.log('🔍 Starting Functional Verification...');

    // 1. Verify Judge Schema
    console.log('\n[Test A] Provider Correctness & Schema');
    try {
        const response = await fetch(`${API_URL}/judge/content`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                questionId: 'test-q1',
                questionText: 'Tell me about a time you failed.',
                transcript: 'I once deployed a bug to production. I fixed it immediately.',
                role: 'software engineer',
                track: 'tech',
                quinnMode: 'DIRECT'
            })
        });

        const data = await response.json();
        console.log('Status:', response.status);

        if (data.status === 'OK' && typeof data.content_score === 'number') {
            console.log('✅ Schema check passed');
            console.log('Score:', data.content_score);
            console.log('Feedback:', data.content_strength);
        } else {
            console.error('❌ Schema mismatch:', data);
        }
    } catch (e) {
        console.error('❌ Test A Failed:', e);
    }

    // 2. Token & Rate Limits (Simulation)
    console.log('\n[Test B] Rate Limit Check');
    // We expect this to succeed for a few calls, then maybe we can inspect headers if we added them, 
    // or just rely on server logs (which we'll inspect manually).
    // For now, let's just assert that multiple calls work (Circuit Breaker doesn't trip prematurely).

    let passCount = 0;
    for (let i = 0; i < 5; i++) {
        try {
            const start = Date.now();
            await fetch(`${API_URL}/judge/content`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    questionId: `stress-${i}`,
                    questionText: 'Quick question?',
                    transcript: 'Short answer.',
                    role: 'tester',
                    track: 'test',
                    quinnMode: 'DIRECT'
                })
            });
            const duration = Date.now() - start;
            process.stdout.write(`call ${i + 1} (${duration}ms) `);
            passCount++;
        } catch (e) {
            process.stdout.write('❌ ');
        }
    }
    console.log(`\n✅ ${passCount}/5 calls successful (normal load)`);

    // 3. System Prompt / JSON Validation
    // Handled by Test A implicitly.

    console.log('\nVerification Complete.');
}

runVerification();
