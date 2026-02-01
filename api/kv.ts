import { createClient } from 'redis';

interface KVClient {
  get(key: string): Promise<any>;
  set(key: string, value: any): Promise<void>;
  lrange(key: string, start: number, stop: number): Promise<any[]>;
  lpush(key: string, value: any): Promise<void>;
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
        }
      } satisfies KVClient;
    })();
  }

  return kvPromise;
}
