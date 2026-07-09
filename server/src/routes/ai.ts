import { Hono }      from 'hono';
import { z }          from 'zod';
import { zValidator } from '@hono/zod-validator';
import { authMiddleware }   from '../middleware/auth';
import { checkRateLimit }   from '../storage/rateLimit';
import type { Variables }   from '../types';

const app = new Hono<{ Variables: Variables }>();
app.use('*', authMiddleware);

const analyzeSchema = z.object({
    blurb: z.string().min(10).max(2000),
    genre: z.string().max(100).optional(),
    type:  z.string().max(100).optional(),
});

const AI_RATE_LIMIT = 20;

app.post('/blurb', zValidator('json', analyzeSchema), async (c) => {
    const userId = c.get('userId');
    const today  = new Date().toISOString().slice(0, 10);

    if (!checkRateLimit(`rate:ai:${userId}:${today}`, AI_RATE_LIMIT)) {
        return c.json({ error: 'Daily analysis limit reached — return tomorrow.' }, 429);
    }

    return c.json({
        searchabilityScore: null,
        missingKeywords:    [],
        strengths:          [],
        suggestedRevision:  null,
        topTropes:          [],
        _notice:            'AI analysis is not available in the desktop app.',
    });
});

export default app;
