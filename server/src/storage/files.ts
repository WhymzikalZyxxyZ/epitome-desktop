import fs   from 'node:fs/promises';
import path  from 'node:path';

type FileMeta = { contentType: string };

let uploadsDir = '';

export function initStorage(dir: string): void {
    uploadsDir = dir;
    fs.mkdir(dir, { recursive: true }).catch(() => {});
    console.log(`[storage] uploads at ${dir}`);
}

function keyToPath(key: string): string {
    // Normalize KV-style keys (e.g. "covers/uuid-file.jpg") to local paths
    const safe = key.replace(/\.\./g, '_');
    return path.join(uploadsDir, ...safe.split('/'));
}

export const fileStorage = {
    async put(key: string, buffer: ArrayBuffer, meta: FileMeta): Promise<void> {
        const filePath = keyToPath(key);
        await fs.mkdir(path.dirname(filePath), { recursive: true });
        await fs.writeFile(filePath, Buffer.from(buffer));
        await fs.writeFile(filePath + '.meta', JSON.stringify(meta), 'utf-8');
    },

    async getWithMetadata(key: string): Promise<{ value: Buffer | null; metadata: FileMeta | null }> {
        try {
            const filePath = keyToPath(key);
            const [value, metaStr] = await Promise.all([
                fs.readFile(filePath),
                fs.readFile(filePath + '.meta', 'utf-8').catch(() => null),
            ]);
            const metadata: FileMeta | null = metaStr ? JSON.parse(metaStr) as FileMeta : null;
            return { value, metadata };
        } catch {
            return { value: null, metadata: null };
        }
    },

    async delete(key: string): Promise<void> {
        const filePath = keyToPath(key);
        await fs.unlink(filePath).catch(() => {});
        await fs.unlink(filePath + '.meta').catch(() => {});
    },
};
