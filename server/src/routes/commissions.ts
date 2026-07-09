import { Hono }           from 'hono';
import { z }               from 'zod';
import { zValidator }      from '@hono/zod-validator';
import { and, eq, desc }   from 'drizzle-orm';
import { getDb }           from '../db/client';
import { commissions }     from '../db/schema';
import { authMiddleware }  from '../middleware/auth';
import type { Variables }  from '../types';

export const commissionsGlobalRouter = new Hono<{ Variables: Variables }>();
commissionsGlobalRouter.use('*', authMiddleware);
commissionsGlobalRouter.get('/', async (c) => {
    return c.json(await getDb().select().from(commissions)
        .where(eq(commissions.userId, c.get('userId')))
        .orderBy(desc(commissions.createdAt)).all());
});

const app = new Hono<{ Variables: Variables }>();
app.use('*', authMiddleware);

const createSchema = z.object({
    who:         z.string().min(1).max(200),
    amountCents: z.number().int().nonnegative().optional(),
    description: z.string().min(1),
    deadline:    z.string().optional(),
    done:        z.boolean().default(false),
});

app.get('/', async (c) => {
    return c.json(await getDb().select().from(commissions)
        .where(and(eq(commissions.projectId, c.req.param('projectId')!), eq(commissions.userId, c.get('userId'))))
        .all());
});

app.post('/', zValidator('json', createSchema), async (c) => {
    const [row] = await getDb().insert(commissions)
        .values({ ...c.req.valid('json'), projectId: c.req.param('projectId')!, userId: c.get('userId') })
        .returning();
    return c.json(row, 201);
});

app.patch('/:id', zValidator('json', createSchema.partial()), async (c) => {
    const [row] = await getDb().update(commissions).set(c.req.valid('json'))
        .where(and(eq(commissions.id, c.req.param('id')!), eq(commissions.userId, c.get('userId'))))
        .returning();
    if (!row) return c.notFound();
    return c.json(row);
});

app.delete('/:id', async (c) => {
    await getDb().delete(commissions)
        .where(and(eq(commissions.id, c.req.param('id')!), eq(commissions.userId, c.get('userId'))));
    return c.body(null, 204);
});

export default app;
