import Database      from 'better-sqlite3';
import { drizzle }   from 'drizzle-orm/better-sqlite3';
import { readFileSync } from 'node:fs';
import { join }      from 'node:path';
import * as schema   from './schema';

type DrizzleDb = ReturnType<typeof drizzle<typeof schema>>;

let _db: DrizzleDb | null = null;

export function getDb(): DrizzleDb {
    if (!_db) throw new Error('Database not initialized — call initDb first');
    return _db;
}

const MIGRATIONS = [
    '0001_initial.sql',
    '0002_chapters.sql',
    '0003_events_inventory_sales.sql',
];

export function initDb(dbPath: string, migrationsDir: string): void {
    const sqlite = new Database(dbPath);
    sqlite.pragma('journal_mode = WAL');
    sqlite.pragma('foreign_keys = ON');

    // Simple migration runner — tracks applied migrations in _migrations table
    sqlite.exec(`CREATE TABLE IF NOT EXISTS _migrations (
        name    TEXT PRIMARY KEY,
        ran_at  TEXT NOT NULL DEFAULT (datetime('now'))
    )`);

    const applied = new Set(
        (sqlite.prepare('SELECT name FROM _migrations').all() as { name: string }[]).map(r => r.name),
    );

    for (const name of MIGRATIONS) {
        if (applied.has(name)) continue;
        const sql = readFileSync(join(migrationsDir, name), 'utf-8');
        sqlite.exec(sql);
        sqlite.prepare('INSERT INTO _migrations (name) VALUES (?)').run(name);
        console.log(`[db] migration applied: ${name}`);
    }

    _db = drizzle(sqlite, { schema });
    console.log(`[db] ready at ${dbPath}`);
}
