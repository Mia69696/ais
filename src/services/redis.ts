// Real Upstash Redis REST API — job queue & caching
const REDIS_URL = import.meta.env.VITE_UPSTASH_REDIS_REST_URL;
const REDIS_TOKEN = import.meta.env.VITE_UPSTASH_REDIS_REST_TOKEN;

async function redisCmd(command: string, ...args: (string | number)[]): Promise<unknown> {
  const res = await fetch(`${REDIS_URL}/${command}/${args.map(a => encodeURIComponent(String(a))).join('/')}`, {
    headers: { Authorization: `Bearer ${REDIS_TOKEN}` },
  });
  if (!res.ok) throw new Error(`Redis error: ${res.status}`);
  const data = await res.json();
  return data.result;
}

// Save a job to Redis with 24h expiry
export async function saveJobToRedis(jobId: string, jobData: Record<string, unknown>) {
  try {
    await redisCmd('set', `job:${jobId}`, JSON.stringify(jobData));
    await redisCmd('expire', `job:${jobId}`, 86400); // 24 hours
  } catch (e) {
    console.warn('Redis saveJob failed:', e);
  }
}

// Get job from Redis
export async function getJobFromRedis(jobId: string): Promise<Record<string, unknown> | null> {
  try {
    const raw = await redisCmd('get', `job:${jobId}`) as string | null;
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

// Track user stats in Redis
export async function incrementUserStat(userId: string, stat: string) {
  try {
    await redisCmd('incr', `user:${userId}:${stat}`);
  } catch (e) {
    console.warn('Redis increment failed:', e);
  }
}

export async function getUserStat(userId: string, stat: string): Promise<number> {
  try {
    const val = await redisCmd('get', `user:${userId}:${stat}`) as string | null;
    return parseInt(val || '0');
  } catch {
    return 0;
  }
}

// Rate limiting
export async function checkRateLimit(userId: string, action: string, limit = 10): Promise<boolean> {
  try {
    const key = `ratelimit:${userId}:${action}:${new Date().getHours()}`;
    const count = await redisCmd('incr', key) as number;
    if (count === 1) await redisCmd('expire', key, 3600);
    return count <= limit;
  } catch {
    return true; // allow on error
  }
}

// Cache AI responses
export async function cacheAIResponse(key: string, value: string, ttl = 3600) {
  try {
    await redisCmd('set', `cache:${key}`, value);
    await redisCmd('expire', `cache:${key}`, ttl);
  } catch (e) {
    console.warn('Redis cache failed:', e);
  }
}

export async function getCachedAIResponse(key: string): Promise<string | null> {
  try {
    return await redisCmd('get', `cache:${key}`) as string | null;
  } catch {
    return null;
  }
}

// Add to processing queue
export async function enqueueJob(jobId: string) {
  try {
    await redisCmd('lpush', 'queue:clips', jobId);
  } catch (e) {
    console.warn('Redis enqueue failed:', e);
  }
}

// Ping test
export async function pingRedis(): Promise<boolean> {
  try {
    const result = await redisCmd('ping');
    return result === 'PONG';
  } catch {
    return false;
  }
}

export default { saveJobToRedis, getJobFromRedis, incrementUserStat, getUserStat, checkRateLimit, cacheAIResponse, getCachedAIResponse, enqueueJob, pingRedis };
