import { Hono }            from 'hono';
import { z }               from 'zod';
import { zValidator }      from '@hono/zod-validator';
import { and, eq, asc, sql } from 'drizzle-orm';
import { getDb }           from '../db/client';
import { pages, projects } from '../db/schema';
import { authMiddleware }  from '../middleware/auth';
import type { Variables }  from '../types';

const app = new Hono<{ Variables: Variables }>();
app.use('*', authMiddleware);

function wordCount(html: string): number {
    const text = html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
    return text.length > 0 ? text.split(' ').length : 0;
}

async function syncProjectWords(projectId: string, userId: string) {
    const res = await getDb()
        .select({ total: sql<number>`sum(${pages.wordCount})` })
        .from(pages)
        .where(and(eq(pages.projectId, projectId), eq(pages.userId, userId)))
        .get();
    await getDb().update(projects)
        .set({ totalWords: res?.total ?? 0, updatedAt: new Date().toISOString() })
        .where(and(eq(projects.id, projectId), eq(projects.userId, userId)));
}

const patchSchema = z.object({
    title:   z.string().optional(),
    content: z.string().optional(),
});

app.get('/', async (c) => {
    return c.json(await getDb().select().from(pages)
        .where(and(eq(pages.projectId, c.req.param('projectId')!), eq(pages.userId, c.get('userId'))))
        .orderBy(asc(pages.pageDate))
        .all());
});

app.post('/today', async (c) => {
    const userId    = c.get('userId');
    const projectId = c.req.param('projectId')!;

    const project = await getDb().select().from(projects)
        .where(and(eq(projects.id, projectId), eq(projects.userId, userId))).get();
    if (!project) return c.notFound();

    const today     = new Date().toISOString().slice(0, 10);
    const todayPage = await getDb().select().from(pages)
        .where(and(eq(pages.projectId, projectId), eq(pages.userId, userId), eq(pages.pageDate, today)))
        .get();
    if (todayPage) return c.json(todayPage);

    const [page] = await getDb().insert(pages)
        .values({ projectId, userId, pageDate: today })
        .returning();
    return c.json(page, 201);
});

app.get('/:pageId', async (c) => {
    const page = await getDb().select().from(pages)
        .where(and(eq(pages.id, c.req.param('pageId')!), eq(pages.userId, c.get('userId')))).get();
    if (!page) return c.notFound();
    return c.json(page);
});

app.patch('/:pageId', zValidator('json', patchSchema), async (c) => {
    const userId    = c.get('userId');
    const projectId = c.req.param('projectId')!;
    const body      = c.req.valid('json');

    const existing = await getDb().select().from(pages)
        .where(and(eq(pages.id, c.req.param('pageId')!), eq(pages.userId, userId))).get();
    if (!existing) return c.notFound();

    const updates: Record<string, unknown> = { ...body, updatedAt: new Date().toISOString() };
    if (body.content !== undefined) updates['wordCount'] = wordCount(body.content);

    const pageResult = await getDb().update(pages).set(updates)
        .where(eq(pages.id, c.req.param('pageId')!)).returning();
    const page = pageResult[0];
    if (!page) return c.json({ error: 'Failed to save page' }, 500);

    await syncProjectWords(projectId, userId);
    return c.json(page);
});

app.delete('/:pageId', async (c) => {
    const userId    = c.get('userId');
    const projectId = c.req.param('projectId')!;

    const existing = await getDb().select().from(pages)
        .where(and(eq(pages.id, c.req.param('pageId')!), eq(pages.userId, userId))).get();
    if (!existing) return c.notFound();

    await getDb().delete(pages).where(eq(pages.id, c.req.param('pageId')!));
    await syncProjectWords(projectId, userId);
    return c.body(null, 204);
});

export default app;
