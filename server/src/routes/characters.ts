import { Hono }        from 'hono';
import { z }            from 'zod';
import { zValidator }   from '@hono/zod-validator';
import { and, eq, asc } from 'drizzle-orm';
import { getDb }        from '../db/client';
import { characters, characterImages } from '../db/schema';
import { authMiddleware }              from '../middleware/auth';
import type { Variables }              from '../types';

const app = new Hono<{ Variables: Variables }>();
app.use('*', authMiddleware);

const createSchema = z.object({
    name:                z.string().min(1).max(200),
    age:                 z.string().optional(),
    physicalDescription: z.string().optional(),
    notes:               z.string().optional(),
    sortOrder:           z.number().int().default(0),
});

app.get('/', async (c) => {
    const rows = await getDb()
        .select().from(characters)
        .where(and(eq(characters.projectId, c.req.param('projectId')!), eq(characters.userId, c.get('userId'))))
        .orderBy(asc(characters.sortOrder)).all();
    return c.json(rows);
});

app.post('/', zValidator('json', createSchema), async (c) => {
    const [row] = await getDb().insert(characters)
        .values({ ...c.req.valid('json'), projectId: c.req.param('projectId')!, userId: c.get('userId') })
        .returning();
    return c.json(row, 201);
});

app.get('/:characterId', async (c) => {
    const row = await getDb().select().from(characters)
        .where(and(eq(characters.id, c.req.param('characterId')!), eq(characters.userId, c.get('userId')))).get();
    if (!row) return c.notFound();
    const images = await getDb().select().from(characterImages)
        .where(eq(characterImages.characterId, row.id))
        .orderBy(asc(characterImages.sortOrder)).all();
    return c.json({ ...row, images });
});

app.patch('/:characterId', zValidator('json', createSchema.partial()), async (c) => {
    const [row] = await getDb().update(characters)
        .set({ ...c.req.valid('json'), updatedAt: new Date().toISOString() })
        .where(and(eq(characters.id, c.req.param('characterId')!), eq(characters.userId, c.get('userId'))))
        .returning();
    if (!row) return c.notFound();
    return c.json(row);
});

app.delete('/:characterId', async (c) => {
    await getDb().delete(characters)
        .where(and(eq(characters.id, c.req.param('characterId')!), eq(characters.userId, c.get('userId'))));
    return c.body(null, 204);
});

export default app;
