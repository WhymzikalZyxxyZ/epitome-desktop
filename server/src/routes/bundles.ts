import { Hono }      from 'hono';
import { z }          from 'zod';
import { zValidator } from '@hono/zod-validator';
import { and, eq }    from 'drizzle-orm';
import { getDb }      from '../db/client';
import { bundles, bundleItems } from '../db/schema';
import { authMiddleware }       from '../middleware/auth';
import type { Variables }       from '../types';

const app = new Hono<{ Variables: Variables }>();
app.use('*', authMiddleware);

const bundleSchema = z.object({
    name:        z.string().min(1),
    description: z.string().optional().nullable(),
    priceCents:  z.number().int().nonnegative().default(0),
});

const itemSchema = z.object({
    projectId: z.string().min(1),
    quantity:  z.number().int().positive().default(1),
});

app.get('/', async (c) => {
    return c.json(await getDb().select().from(bundles)
        .where(eq(bundles.userId, c.get('userId'))).all());
});

app.post('/', zValidator('json', bundleSchema), async (c) => {
    const [row] = await getDb().insert(bundles)
        .values({ ...c.req.valid('json'), userId: c.get('userId') })
        .returning();
    return c.json(row, 201);
});

app.patch('/:id', zValidator('json', bundleSchema.partial()), async (c) => {
    const [row] = await getDb().update(bundles)
        .set({ ...c.req.valid('json'), updatedAt: new Date().toISOString() })
        .where(and(eq(bundles.id, c.req.param('id')!), eq(bundles.userId, c.get('userId'))))
        .returning();
    if (!row) return c.notFound();
    return c.json(row);
});

app.delete('/:id', async (c) => {
    await getDb().delete(bundles)
        .where(and(eq(bundles.id, c.req.param('id')!), eq(bundles.userId, c.get('userId'))));
    return c.body(null, 204);
});

app.get('/:id/items', async (c) => {
    const bundleId = c.req.param('id')!;
    const bundle   = await getDb().select({ id: bundles.id }).from(bundles)
        .where(and(eq(bundles.id, bundleId), eq(bundles.userId, c.get('userId')))).get();
    if (!bundle) return c.notFound();
    return c.json(await getDb().select().from(bundleItems)
        .where(eq(bundleItems.bundleId, bundleId)).all());
});

app.post('/:id/items', zValidator('json', itemSchema), async (c) => {
    const bundleId = c.req.param('id')!;
    const bundle   = await getDb().select({ id: bundles.id }).from(bundles)
        .where(and(eq(bundles.id, bundleId), eq(bundles.userId, c.get('userId')))).get();
    if (!bundle) return c.notFound();
    const [row] = await getDb().insert(bundleItems)
        .values({ ...c.req.valid('json'), bundleId })
        .returning();
    return c.json(row, 201);
});

app.delete('/:id/items/:itemId', async (c) => {
    const bundleId = c.req.param('id')!;
    const bundle   = await getDb().select({ id: bundles.id }).from(bundles)
        .where(and(eq(bundles.id, bundleId), eq(bundles.userId, c.get('userId')))).get();
    if (!bundle) return c.notFound();
    await getDb().delete(bundleItems).where(eq(bundleItems.id, c.req.param('itemId')!));
    return c.body(null, 204);
});

export default app;
