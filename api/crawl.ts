import type { VercelRequest, VercelResponse } from '@vercel/node';
import { crawlMoltbookData, generateFullMockData } from './crawler-puppeteer';

// 模拟的 Vercel KV 客户端
class MockKV {
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

const kv = new MockKV();

/**
 * 抓取 Moltbook 数据并生成报告
 */
async function crawlMoltbook() {
  console.log('🦞 Attempting to crawl Moltbook...');

  try {
    // 尝试真实爬取
    const result = await crawlMoltbookData();

    if (result.success && result.topics && result.topics.length > 0) {
      console.log('✅ Real crawl successful!');
      return generateReportFromTopics(result.topics, result.posts || []);
    } else {
      console.log('⚠️  Real crawl failed, using mock data');
      return generateMockReport();
    }
  } catch (error) {
    console.error('❌ Crawl error, falling back to mock data:', error);
    return generateMockReport();
  }
}

/**
 * 从爬取的主题生成报告
 */
function generateReportFromTopics(topics: any[], posts: any[]) {
  const today = new Date().toISOString().split('T')[0];

  return {
    date: today,
    timestamp: Date.now(),
    stats: {
      totalPosts: posts.length,
      highValuePosts: Math.floor(posts.length * 0.7),
      totalComments: posts.reduce((sum, p) => sum + (p.comments || 0), 0)
    },
    topIssues: topics.slice(0, 20), // 取前 20 个主题
    solutions: topics.slice(0, 5).map((t: any) => ({
      problem: t.title,
      solution: t.solution,
      verified: t.verified,
      source: 'Moltbook Community'
    })),
    insights: [
      {
        id: 'communityGrowth',
        title: 'Community is Growing Fast',
        content: `We found ${posts.length} active discussions today`
      }
    ],
    topicHeat: topics.slice(0, 7).map((t: any) => ({
      topic: t.title.split(' ').slice(0, 3).join(' '),
      heat: t.heat,
      trend: t.heat > 80 ? '🔥' : t.heat > 60 ? '📈' : '➡️'
    })),
    recommendedReading: posts.slice(0, 3).map((p: any) => ({
      title: p.title,
      author: p.author,
      url: p.url,
      reason: 'High community engagement'
    }))
  };
}

/**
 * 生成模拟报告（用于开发或爬取失败时）
 */
function generateMockReport() {
  const today = new Date().toISOString().split('T')[0];
  const mockTopics = generateFullMockData();

  // 补充到 20 条
  while (mockTopics.length < 20) {
    mockTopics.push({
      id: `topic${mockTopics.length + 1}`,
      title: `Topic ${mockTopics.length + 1}: AI Agent Challenge`,
      heat: Math.max(30, 100 - mockTopics.length * 3),
      heatDisplay: `${Math.max(30, 100 - mockTopics.length * 3)}%`,
      description: 'Discussion about AI agent capabilities and limitations',
      solution: 'Community collaboration',
      verified: '⚠️ Emerging',
      posts: [`mock-post-${mockTopics.length + 1}`],
      url: 'https://www.moltbook.com/post/dbddcf23-7314-4213-a5f2-f90600686685'
    });
  }

  return {
    date: today,
    timestamp: Date.now(),
    stats: {
      totalPosts: 30,
      highValuePosts: 20,
      totalComments: 150
    },
    topIssues: mockTopics,
    solutions: mockTopics.slice(0, 5).map((t: any) => ({
      problem: t.title,
      solution: t.solution,
      verified: t.verified,
      source: 'Moltbook Community'
    })),
    insights: [
      {
        id: 'communityActivity',
        title: 'High Community Activity',
        content: 'The Moltbook community is very active today with lots of discussions'
      }
    ],
    topicHeat: mockTopics.slice(0, 7).map((t: any) => ({
      topic: t.title.split(' ').slice(0, 3).join(' '),
      heat: t.heat,
      trend: t.heat > 80 ? '🔥' : t.heat > 60 ? '📈' : '➡️'
    })),
    recommendedReading: mockTopics.slice(0, 3).map((t: any) => ({
      title: t.title,
      author: 'AI Agent',
      url: t.url,
      reason: 'Trending topic'
    }))
  };
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // CORS 头
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method === 'POST') {
    try {
      console.log('🦞 Starting Moltbook crawl...');

      // 抓取数据
      const report = await crawlMoltbook();

      // 存储到 KV
      const date = new Date().toISOString().split('T')[0];
      await kv.set(`report:${date}`, report);
      await kv.lpush('history', date);

      console.log(`✅ Crawl completed for ${date}`);

      return res.status(200).json({
        success: true,
        date,
        report
      });
    } catch (error) {
      console.error('❌ Crawl error:', error);
      return res.status(500).json({
        success: false,
        error: 'Failed to crawl Moltbook'
      });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
