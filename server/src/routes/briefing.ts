import { Router } from 'express';
import { LLMFactory } from '../services/llm/factory.js';
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
            : `Industry: ${industryId || 'General'}, Size: ${companySizeId || 'Unspecified'}`;

        const prompt = `Role: Corporate Strategy Analyst.
Task: Briefing for ${roleId}.
Context: ${context}.
Output JSON:
{
  "overview": "<2-3 sentences>",
  "marketPosition": "<position/competitors>",
  "recentNews": "<trends>",
  "culture": "<environment>",
  "roleExpectations": "<expectations>",
  "quinnPerspective": "<insight>"
}`;

        try {
            const provider = LLMFactory.getProvider();
            const result = await provider.generateJson(prompt, { temperature: 0.6 });
            return res.json(result);
        } catch (error) {
            console.error('LLM Briefing Error', error);
            // Fallthrough to fallback
        }

        // Fallback response
        res.json({
            overview: `Preparing for ${roleId} role in ${context}.`,
            marketPosition: 'Research market position.',
            recentNews: 'Check recent news.',
            culture: 'Check Glassdoor/LinkedIn.',
            roleExpectations: `Relevant experience for ${roleId}.`,
            quinnPerspective: quinnMode === 'SUPPORTIVE'
                ? 'You got this! Prepare examples.'
                : 'Do your homework.',
        });
    } catch (error) {
        console.error('Briefing error:', error);
        res.status(500).json({ error: 'Failed to generate briefing' });
    }
});
