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

        console.log('[Briefing] Generating AI briefing for:', { companyName, roleId, industryId });

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
            console.log('[Briefing] Calling LLM provider:', provider.getProviderName());
            const raw = await provider.generateJson<any>(prompt, { temperature: 0.6 });
            console.log('[Briefing] AI response received successfully');

            // Validate and sanitize types to prevent frontend crashes
            const result = {
                overview: String(raw.overview || 'Info unavailable'),
                marketPosition: String(raw.marketPosition || 'Info unavailable'),
                recentNews: String(raw.recentNews || 'Info unavailable'),
                culture: String(raw.culture || 'Info unavailable'),
                roleExpectations: String(raw.roleExpectations || 'Info unavailable'),
                quinnPerspective: String(raw.quinnPerspective || 'I am ready to help.')
            };

            return res.json(result);
        } catch (error) {
            console.error('[Briefing] AI failed, using fallback:', error);
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
