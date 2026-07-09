// In-memory daily rate limiter — resets when the server restarts (fine for desktop).

const counts = new Map<string, { count: number; resetAt: number }>();

export function checkRateLimit(key: string, limit: number): boolean {
    const now   = Date.now();
    const entry = counts.get(key);
    if (!entry || entry.resetAt < now) {
        counts.set(key, { count: 1, resetAt: now + 86_400_000 });
        return true;
    }
    if (entry.count >= limit) return false;
    entry.count++;
    return true;
}
