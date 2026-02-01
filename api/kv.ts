import { createClient } from 'redis';

export interface KVClient {
  get(key: string): Promise<any>;
  set(key: string, value: any): Promise<void>;
  lrange(key: string, start: number, stop: number): Promise<any[]>;
  lpush(key: string, value: any): Promise<void>;
  /** 可选：Redis 内存用量（字节），Mock 返回 0 */
  getMemoryUsage?(): Promise<number>;
  del?(key: string): Promise<void>;
  llen?(key: string): Promise<number>;
  ltrim?(key: string, start: number, stop: number): Promise<void>;
}

// 轻量 Mock KV，用于未配置 REDIS_URL 的场景
class MockKV implements KVClient {
  private data: Map<string, any> = new Map();

  async get(key: string): Promise<any> {
    return this.data.get(key);
  }

  async set(key: string, value: any): Promise<void> {
    this.data.set(key, value);
  }

  async lrange(key: string, start: number, stop: number): Promise<any[]> {
    const list = this.data.get(key) || [];
    return list.slice(start, stop === -1 ? undefined : stop + 1);
  }

  async lpush(key: string, value: any): Promise<void> {
    const list = this.data.get(key) || [];
    list.unshift(value);
    this.data.set(key, list);
  }

  async getMemoryUsage(): Promise<number> {
    return 0;
  }

  async del(key: string): Promise<void> {
    this.data.delete(key);
  }

  async llen(key: string): Promise<number> {
    const list = this.data.get(key) || [];
    return list.length;
  }

  async ltrim(key: string, start: number, stop: number): Promise<void> {
    const list = this.data.get(key) || [];
    const end = stop === -1 ? undefined : stop + 1;
    this.data.set(key, list.slice(start, end));
  }
}

export function getMockKv(): KVClient {
  return new MockKV();
}

let redisClientPromise: Promise<ReturnType<typeof createClient>> | null = null;
let kvPromise: Promise<KVClient> | null = null;

async function getRedisClient(): Promise<ReturnType<typeof createClient> | null> {
  const url = process.env.REDIS_URL;
  if (!url) return null;

  if (!redisClientPromise) {
    try {
      const client = createClient({
        url,
        socket: { connectTimeout: 5000 }
      });
      await client.connect();
      redisClientPromise = Promise.resolve(client);
    } catch (err) {
      console.warn('Redis connect failed, using in-memory fallback:', err);
      redisClientPromise = null;
      return null;
    }
  }

  return redisClientPromise;
}

export async function getKv(): Promise<KVClient> {
  if (!kvPromise) {
    kvPromise = (async () => {
      let client: ReturnType<typeof createClient> | null = null;
      try {
        client = await getRedisClient();
      } catch {
        // 已在上方 log，此处直接回退
      }
      if (!client) {
        return new MockKV();
      }

      return {
        async get(key: string) {
          const value = await client.get(key);
          if (!value) return null;
          const text = typeof value === 'string' ? value : value.toString();
          return JSON.parse(text);
        },
        async set(key: string, value: any) {
          await client.set(key, JSON.stringify(value));
        },
        async lrange(key: string, start: number, stop: number) {
          const values = await client.lRange(key, start, stop);
          return values.map((item) => {
            const text = typeof item === 'string' ? item : item.toString();
            return JSON.parse(text);
          });
        },
        async lpush(key: string, value: any) {
          await client.lPush(key, JSON.stringify(value));
        },
        async getMemoryUsage() {
          const raw = await client.info('memory');
          const info = typeof raw === 'string' ? raw : String(raw);
          const m = info.match(/used_memory:(\d+)/);
          return m ? parseInt(m[1], 10) : 0;
        },
        async del(key: string) {
          await client.del(key);
        },
        async llen(key: string): Promise<number> {
          const n = await client.lLen(key);
          return typeof n === 'number' ? n : parseInt(String(n), 10);
        },
        async ltrim(key: string, start: number, stop: number) {
          await client.lTrim(key, start, stop);
        }
      } satisfies KVClient;
    })();
  }

  return kvPromise;
}

const REDIS_PRUNE_THRESHOLD_BYTES = 29 * 1024 * 1024; // 29 MB
const OLDEST_WEEK_DAYS = 7;

/**
 * 当 Redis 内存 ≥ 29 MB 时，删除 history 中最旧一周的日期及其 report 数据
 */
export async function pruneOldestWeekIfNeeded(kv: KVClient): Promise<void> {
  const getUsage = kv.getMemoryUsage ?? (() => Promise.resolve(0));
  const del = kv.del ?? (() => Promise.resolve());
  const llen = kv.llen ?? (() => Promise.resolve(0));
  const lrange = kv.lrange.bind(kv);
  const ltrim = kv.ltrim ?? (() => Promise.resolve());

  try {
    const used = await getUsage();
    if (used < REDIS_PRUNE_THRESHOLD_BYTES) return;

    const len = await llen('history');
    const toRemove = Math.min(OLDEST_WEEK_DAYS, len);
    if (toRemove === 0) return;

    const lastDates = await lrange('history', -toRemove, -1);
    for (const date of lastDates) {
      if (date != null && typeof date === 'string') {
        await del(`report:${date}`);
      }
    }
    await ltrim('history', 0, -(toRemove + 1));
    console.log(`🧹 Pruned ${toRemove} oldest day(s) from Redis (used was ${Math.round(used / 1024 / 1024)} MB)`);
  } catch (err) {
    console.warn('pruneOldestWeekIfNeeded failed:', err);
  }
}
