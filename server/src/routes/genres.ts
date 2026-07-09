import { Hono }        from 'hono';
import { z }            from 'zod';
import { zValidator }   from '@hono/zod-validator';
import { eq }           from 'drizzle-orm';
import { getDb }        from '../db/client';
import { genres }       from '../db/schema';
import { authMiddleware } from '../middleware/auth';
import type { Variables } from '../types';

const app = new Hono<{ Variables: Variables }>();
app.use('*', authMiddleware);

const createSchema = z.object({
    name:     z.string().min(1).max(100),
    parentId: z.string().uuid().optional(),
});

app.get('/', async (c) => {
    return c.json(await getDb().select().from(genres).all());
});

app.post('/', zValidator('json', createSchema), async (c) => {
    const [row] = await getDb().insert(genres).values(c.req.valid('json')).returning();
    return c.json(row, 201);
});

app.delete('/:id', async (c) => {
    await getDb().delete(genres).where(eq(genres.id, c.req.param('id')!));
    return c.body(null, 204);
});

export default app;
