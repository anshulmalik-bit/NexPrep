import { Router } from 'express';
import { callGeminiText } from '../services/gemini.js';
import { buildQuinnCorePrompt, QuinnMode } from '../services/quinn-core.js';

export const briefingRouter = Router();

briefingRouter.post('/', async (req, res) => {
    try {
        const { companyName, industryId, companySizeId, roleId, quinnMode } = req.body;

        if (!roleId || !quinnMode) {
            return res.status(400).json({ error: 'roleId and quinnMode are required' });
        }

        const context = companyName
            ? `Company: ${companyName}`
            : `Industry: ${industryId || 'General'}, Company Size: ${companySizeId || 'Unspecified'}`;

        const prompt = `
${buildQuinnCorePrompt(quinnMode as QuinnMode)}

Generate a company/industry briefing for a candidate preparing for a ${roleId} interview.

CONTEXT: ${context}

Create a JSON briefing with these sections:
1. overview - Brief company/industry overview (2-3 sentences)
2. marketPosition - Current market position and competitors
3. recentNews - Relevant recent developments or trends
4. culture - Expected culture and work environment
5. roleExpectations - What they likely want from a ${roleId}
6. quinnPerspective - Quinn's personal insight/advice in character

OUTPUT FORMAT:
{
  "overview": "...",
  "marketPosition": "...",
  "recentNews": "...",
  "culture": "...",
  "roleExpectations": "...",
  "quinnPerspective": "..."
}

Generate the briefing:
`;

        const response = await callGeminiText(prompt, { temperature: 0.6 });

        try {
            // Try to parse as JSON
            const jsonMatch = response.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
                const parsed = JSON.parse(jsonMatch[0]);
                return res.json(parsed);
            }
        } catch (parseError) {
            // Fallback structure
        }

        // Fallback response
        res.json({
            overview: `Preparing for ${roleId} role in ${context}.`,
            marketPosition: 'Research the company\'s market position and competitors before your interview.',
            recentNews: 'Check recent news and press releases for current company initiatives.',
            culture: 'Understand the company culture through LinkedIn, Glassdoor, and their careers page.',
            roleExpectations: `For a ${roleId} position, they typically look for relevant experience and cultural fit.`,
            quinnPerspective: quinnMode === 'SUPPORTIVE'
                ? 'You\'ve got this! Take time to research and come prepared with specific examples.'
                : 'Do your homework. Show up prepared or don\'t show up at all.',
        });
    } catch (error) {
        console.error('Briefing error:', error);
        res.status(500).json({ error: 'Failed to generate briefing' });
    }
});
