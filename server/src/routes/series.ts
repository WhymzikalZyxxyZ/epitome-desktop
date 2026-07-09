import { Hono }        from 'hono';
import { z }            from 'zod';
import { zValidator }   from '@hono/zod-validator';
import { and, eq }      from 'drizzle-orm';
import { getDb }        from '../db/client';
import { series }       from '../db/schema';
import { authMiddleware } from '../middleware/auth';
import type { Variables } from '../types';

const app = new Hono<{ Variables: Variables }>();
app.use('*', authMiddleware);

const createSchema = z.object({
    name:        z.string().min(1).max(200),
    description: z.string().optional(),
});

app.get('/', async (c) => {
    return c.json(await getDb().select().from(series).where(eq(series.userId, c.get('userId'))).all());
});

app.post('/', zValidator('json', createSchema), async (c) => {
    const [row] = await getDb().insert(series).values({ ...c.req.valid('json'), userId: c.get('userId') }).returning();
    return c.json(row, 201);
});

app.get('/:id', async (c) => {
    const row = await getDb().select().from(series)
        .where(and(eq(series.id, c.req.param('id')!), eq(series.userId, c.get('userId')))).get();
    if (!row) return c.notFound();
    return c.json(row);
});

app.patch('/:id', zValidator('json', createSchema.partial()), async (c) => {
    const [row] = await getDb().update(series)
        .set({ ...c.req.valid('json'), updatedAt: new Date().toISOString() })
        .where(and(eq(series.id, c.req.param('id')!), eq(series.userId, c.get('userId'))))
        .returning();
    if (!row) return c.notFound();
    return c.json(row);
});

app.delete('/:id', async (c) => {
    await getDb().delete(series)
        .where(and(eq(series.id, c.req.param('id')!), eq(series.userId, c.get('userId'))));
    return c.body(null, 204);
});

export default app;
