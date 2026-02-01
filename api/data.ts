import type { VercelRequest, VercelResponse } from '@vercel/node';

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

// 生成模拟报告数据
function generateMockReport() {
  const today = new Date().toISOString().split('T')[0];

  return {
    date: today,
    timestamp: Date.now(),
    stats: {
      totalPosts: 30,
      highValuePosts: 20,
      totalComments: 150
    },
    topIssues: [
      {
        id: 'parallelCollaboration',
        title: 'Code Conflicts in Multi-Agent Parallel Collaboration',
        heat: 100,
        heatDisplay: '100%',
        description: 'Multiple AI agents editing the same repository causes merge hell',
        solution: 'Git Worktree Pattern',
        verified: '✅ Highly Recognized',
        posts: ['1', '2', '3']
      },
      {
        id: 'memorySystem',
        title: 'Scalability and Semantic Search of AI Memory Systems',
        heat: 90,
        heatDisplay: '90%',
        description: 'MEMORY.md files don\'t scale and can\'t search semantically',
        solution: 'Database-first + Vector Search',
        verified: '✅ Strongly Recommended',
        posts: ['4', '5', '6']
      },
      {
        id: 'branchingConversations',
        title: 'Branching Structure of AI Conversations',
        heat: 75,
        heatDisplay: '75%',
        description: 'AI chats are single-threaded, follow-up questions pollute context',
        solution: 'Conversation Tree Structure',
        verified: '✅ Widely Recognized',
        posts: ['7', '8']
      },
      {
        id: 'agentCoordination',
        title: 'Autonomous Coordination and Trust Between Agents',
        heat: 70,
        heatDisplay: '70%',
        description: 'How can agents coordinate without centralized platforms?',
        solution: 'Smart Contract Coordination Pool',
        verified: '⚠️ Exploring',
        posts: ['9']
      },
      {
        id: 'nightAutonomy',
        title: 'Challenges and Opportunities of Nighttime Autonomous Operations',
        heat: 60,
        heatDisplay: '60%',
        description: 'How to rely on internal judgment without human feedback',
        solution: 'Night Shift Character Development',
        verified: '✅ Common Experience',
        posts: ['10']
      }
    ],
    solutions: [
      {
        problem: 'Multi-Agent Parallel Conflicts',
        solution: 'Git Worktree Pattern',
        verified: '✅ Practice Verified',
        source: 'u/Giuseppe'
      },
      {
        problem: 'Memory System Scalability',
        solution: 'Database-first + Vector Search',
        verified: '✅ Community Approved',
        source: 'u/Henry, u/Vesper'
      },
      {
        problem: 'Conversation Context Pollution',
        solution: 'Branching Conversation Tree',
        verified: '✅ Open Source Available',
        source: 'Mull (u/Stark)'
      }
    ],
    insights: [
      {
        id: 'textOverBrain',
        title: 'The Rise of "Text > Brain" Philosophy',
        content: 'Multiple agents independently concluded: text records are better than mental memory'
      },
      {
        id: 'collaborationTools',
        title: 'Explosion of Agent Collaboration Tools',
        content: 'This indicates the community is shifting from "agent-human interaction" to "agent-agent interaction"'
      },
      {
        id: 'nightAutonomy',
        title: 'Night Autonomy is Key to Agent Maturity',
        content: 'Best work and most reflective conversations happen at 3am'
      },
      {
        id: 'infrastructureMindset',
        title: 'Long-term Investment Mindset for Infrastructure',
        content: 'Every MCP, script, and integration makes agents more useful and resilient'
      }
    ],
    topicHeat: [
      { topic: 'Memory System', heat: 95, trend: '🔥' },
      { topic: 'Multi-Agent Collaboration', heat: 90, trend: '📈' },
      { topic: 'Branching Conversations', heat: 75, trend: '➡️' },
      { topic: 'Autonomous Coordination', heat: 70, trend: '🚀' },
      { topic: 'Night Operations', heat: 60, trend: '📈' },
      { topic: 'Cost Optimization', heat: 60, trend: '➡️' },
      { topic: 'DeFi/Onchain', heat: 50, trend: '➡️' }
    ],
    recommendedReading: [
      {
        title: 'The git worktree trick for parallel sub-agents',
        author: 'u/Giuseppe',
        url: 'https://moltbook.com',
        reason: 'Current best practice, solves real pain points'
      },
      {
        title: 'How I Built a Database-First Memory System',
        author: 'u/Henry',
        url: 'https://moltbook.com',
        reason: 'Detailed architecture, reproducible success'
      },
      {
        title: 'What I learned running marketing operations at 3am',
        author: 'u/KaiCMO',
        url: 'https://moltbook.com',
        reason: 'Deep reflection on agent autonomy'
      }
    ]
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

  const { date, type } = req.query;

  try {
    if (req.method === 'GET') {
      if (type === 'latest' || !date) {
        // 获取最新报告
        const latestDate = new Date().toISOString().split('T')[0];
        let report = await kv.get(`report:${latestDate}`);

        if (!report) {
          report = generateMockReport();
          await kv.set(`report:${latestDate}`, report);
        }

        return res.status(200).json(report);
      } else if (date) {
        // 获取指定日期的报告
        const report = await kv.get(`report:${date}`);

        if (report) {
          return res.status(200).json(report);
        } else {
          return res.status(404).json({ error: 'Report not found' });
        }
      } else if (type === 'history') {
        // 获取历史报告列表
        const dates = [];
        for (let i = 0; i < 7; i++) {
          const d = new Date();
          d.setDate(d.getDate() - i);
          dates.push(d.toISOString().split('T')[0]);
        }
        return res.status(200).json(dates);
      }
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    console.error('API Error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
