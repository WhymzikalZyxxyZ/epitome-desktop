import path    from 'node:path';
import { serve } from '@hono/node-server';
import { serveStatic } from '@hono/node-server/serve-static';
import { Hono }   from 'hono';
import { cors }   from 'hono/cors';
import { logger } from 'hono/logger';
import { initDb } from './db/client';
import { initStorage, fileStorage } from './storage/files';
import type { Variables } from './types';

import authRouter                              from './routes/auth';
import genresRouter                            from './routes/genres';
import seriesRouter                            from './routes/series';
import projectsRouter                          from './routes/projects';
import chaptersRouter, { chaptersGlobalRouter } from './routes/chapters';
import charactersRouter                        from './routes/characters';
import commissionsRouter, { commissionsGlobalRouter } from './routes/commissions';
import publishingRouter                        from './routes/publishing';
import uploadsRouter                           from './routes/uploads';
import eventsRouter                            from './routes/events';
import inventoryRouter                         from './routes/inventory';
import bundlesRouter                           from './routes/bundles';
import aiRouter                                from './routes/ai';

function buildApp() {
    const app = new Hono<{ Variables: Variables }>();

    app.use('*', logger());

    app.use('/api/*', async (c, next) => {
        await next();
        c.res.headers.set('X-Content-Type-Options', 'nosniff');
        c.res.headers.set('X-Frame-Options',        'DENY');
        c.res.headers.set('Referrer-Policy',        'strict-origin-when-cross-origin');
    });

    app.use('/api/*', cors({
        origin:        ['http://localhost:5173', 'http://localhost:3847'],
        allowMethods:  ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
        allowHeaders:  ['Content-Type'],
        exposeHeaders: ['Content-Length'],
        credentials:   true,
        maxAge:        600,
    }));

    app.get('/api/files/*', async (c) => {
        const key = c.req.path.replace('/api/files/', '');
        const { value, metadata } = await fileStorage.getWithMetadata(key);
        if (!value) return c.notFound();
        const ct          = metadata?.contentType ?? 'application/octet-stream';
        const disposition = ct.startsWith('image/') ? 'inline' : 'attachment';
        return new Response(value as unknown as BodyInit, {
            headers: {
                'Content-Type':           ct,
                'Cache-Control':          'public, max-age=31536000, immutable',
                'Content-Disposition':    disposition,
                'X-Content-Type-Options': 'nosniff',
            },
        });
    });

    app.route('/api/auth',                               authRouter);
    app.route('/api/genres',                             genresRouter);
    app.route('/api/series',                             seriesRouter);
    app.route('/api/projects',                           projectsRouter);
    app.route('/api/projects/:projectId/chapters',       chaptersRouter);
    app.route('/api/projects/:projectId/characters',     charactersRouter);
    app.route('/api/projects/:projectId/commissions',    commissionsRouter);
    app.route('/api/projects/:projectId/publishing',     publishingRouter);
    app.route('/api/projects/:projectId/inventory',      inventoryRouter);
    app.route('/api/chapters',                           chaptersGlobalRouter);
    app.route('/api/commissions',                        commissionsGlobalRouter);
    app.route('/api/events',                             eventsRouter);
    app.route('/api/bundles',                            bundlesRouter);
    app.route('/api/uploads',                            uploadsRouter);
    app.route('/api/ai',                                 aiRouter);

    app.get('/api/health', (c) => c.json({ ok: true, ts: new Date().toISOString() }));

    app.use('/*', serveStatic({ root: './dist/client' }));
    app.get('/*', serveStatic({ path: './dist/client/index.html' }));

    app.onError((err, c) => {
        console.error('[epitome-desktop]', err);
        return c.json({ error: 'Internal server error' }, 500);
    });

    app.notFound((c) => c.json({ error: 'Not found' }, 404));

    return app;
}

// Called by electron/main.ts in both dev and prod
export async function startServer(dataDir: string, port: number, migrationsDir: string): Promise<void> {
    initDb(path.join(dataDir, 'epitome.db'), migrationsDir);
    initStorage(path.join(dataDir, 'files'));
    const app = buildApp();
    return new Promise((resolve) => {
        serve({ fetch: app.fetch, port }, () => {
            console.log(`[epitome-desktop] server listening on port ${port}`);
            resolve();
        });
    });
}

// Standalone entry point (kept for future standalone/CLI use)
if (require.main === module) {
    const dataDir       = process.env['APP_DATA_DIR'] ?? path.join(process.cwd(), '.epitome-data');
    const migrationsDir = path.join(process.cwd(), 'server', 'src', 'db', 'migrations');
    const port          = parseInt(process.env['PORT'] ?? '3847', 10);
    startServer(dataDir, port, migrationsDir).catch(console.error);
}
