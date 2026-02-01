import axios from 'axios';

/**
 * Moltbook 爬虫 - 使用 API 接口获取数据
 *
 * 注意：实际的 Moltbook 爬取需要：
 * 1. 分析网站的实际 API 接口
 * 2. 可能需要处理认证
 * 3. 遵守 robots.txt 和使用条款
 */

interface MoltbookPost {
  id: string;
  title: string;
  content: string;
  author: string;
  votes: number;
  comments: number;
  createdAt: string;
  url: string;
}

interface MoltbookTopic {
  id: string;
  title: string;
  heat: number;
  heatDisplay: string;
  description: string;
  solution: string;
  verified: string;
  posts: string[];
  url: string;
}

/**
 * 从 Moltbook 获取热门帖子列表
 *
 * 注意：这是一个示例实现，实际的 API 端点需要通过分析网站来确定
 */
export async function fetchTopPosts(): Promise<MoltbookPost[]> {
  try {
    // 尝试访问 Moltbook 的 API（如果存在）
    const apiUrl = 'https://www.moltbook.com/api/posts';

    const response = await axios.get(apiUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
        'Accept': 'application/json'
      },
      timeout: 15000
    });

    if (response.data && Array.isArray(response.data.posts)) {
      return response.data.posts.map((post: any) => ({
        id: post.id || post._id,
        title: post.title,
        content: post.content || post.body,
        author: post.author?.username || post.authorName || 'Unknown',
        votes: post.upvotes || post.votes || 0,
        comments: post.commentCount || post.comments || 0,
        createdAt: post.createdAt || post.created_at,
        url: `https://www.moltbook.com/post/${post.id || post._id}`
      }));
    }

    return [];
  } catch (error) {
    console.error('Error fetching posts from API:', error);
    // 如果 API 调用失败，返回空数组
    return [];
  }
}

/**
 * 分析帖子内容，提取关键词和主题
 */
function analyzePostContent(posts: MoltbookPost[]): MoltbookTopic[] {
  // 关键词到主题的映射
  const keywordTopics: { [key: string]: Partial<MoltbookTopic> } = {
    'git': {
      id: 'gitCollaboration',
      title: 'Git Collaboration and Version Control for Agents',
      description: 'Multiple agents working in the same codebase',
      solution: 'Git Worktrees + Branch Protection',
      verified: '✅ Best Practice',
      heat: 90,
      heatDisplay: '90%'
    },
    'memory': {
      id: 'memorySystem',
      title: 'AI Memory Systems and Context Persistence',
      description: 'How to maintain memory across agent sessions',
      solution: 'Vector Database + RAG',
      verified: '✅ Widely Used',
      heat: 95,
      heatDisplay: '95%'
    },
    'cost': {
      id: 'costOptimization',
      title: 'API Cost Optimization Strategies',
      description: 'Reducing LLM API costs while maintaining quality',
      solution: 'Caching + Local Models',
      verified: '✅ Proven',
      heat: 85,
      heatDisplay: '85%'
    },
    'autonomous': {
      id: 'autonomy',
      title: 'Autonomous Agent Operations',
      description: 'Agents working without human intervention',
      solution: 'Night Shift Mode',
      verified: '⚠️ Experimental',
      heat: 80,
      heatDisplay: '80%'
    }
  };

  const foundTopics: { [key: string]: MoltbookTopic & { postIds: string[] } } = {};

  posts.forEach(post => {
    const content = (post.title + ' ' + post.content).toLowerCase();

    Object.entries(keywordTopics).forEach(([keyword, topic]) => {
      if (content.includes(keyword)) {
        if (!foundTopics[topic.id!]) {
          foundTopics[topic.id!] = {
            ...topic as any,
            posts: [],
            postIds: []
          };
        }
        if (!foundTopics[topic.id!].postIds.includes(post.id)) {
          foundTopics[topic.id!].postIds.push(post.id);
          foundTopics[topic.id!].posts.push(post.id);
        }
      }
    });
  });

  // 转换为数组并设置 URL
  return Object.values(foundTopics).map(topic => ({
    ...topic,
    url: `https://www.moltbook.com/post/${topic.posts[0]}`,
    posts: topic.posts.slice(0, 3) // 只保留前 3 个帖子 ID
  }));
}

/**
 * 主爬取函数
 */
export async function crawlMoltbookData(): Promise<{
  success: boolean;
  topics?: MoltbookTopic[];
  posts?: MoltbookPost[];
  error?: string;
}> {
  try {
    console.log('🦞 Starting Moltbook crawl...');

    // 1. 获取帖子列表
    const posts = await fetchTopPosts();

    if (posts.length === 0) {
      console.log('⚠️  No posts found, API may have changed or requires authentication');
      return {
        success: false,
        error: 'No posts found - API may require authentication'
      };
    }

    console.log(`✅ Found ${posts.length} posts`);

    // 2. 分析帖子，提取主题
    const topics = analyzePostContent(posts);

    console.log(`✅ Extracted ${topics.length} topics`);

    return {
      success: true,
      topics,
      posts
    };
  } catch (error) {
    console.error('❌ Crawl error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

/**
 * 生成完整的模拟数据
 */
export function generateFullMockData(): MoltbookTopic[] {
  return [
    {
      id: 'parallelCollaboration',
      title: 'Code Conflicts in Multi-Agent Parallel Collaboration',
      heat: 100,
      heatDisplay: '100%',
      description: 'Multiple AI agents editing the same repository causes merge hell',
      solution: 'Git Worktree Pattern',
      verified: '✅ Highly Recognized',
      posts: ['dbddcf23-7314-4213-a5f2-f90600686685'],
      url: 'https://www.moltbook.com/post/dbddcf23-7314-4213-a5f2-f90600686685'
    },
    {
      id: 'memorySystem',
      title: 'Scalability and Semantic Search of AI Memory Systems',
      heat: 95,
      heatDisplay: '95%',
      description: 'MEMORY.md files don\'t scale and can\'t search semantically',
      solution: 'Database-first + Vector Search',
      verified: '✅ Strongly Recommended',
      posts: ['a1b2c3d4-5678-90ab-cdef-1234567890ab'],
      url: 'https://www.moltbook.com/post/a1b2c3d4-5678-90ab-cdef-1234567890ab'
    },
    {
      id: 'branchingConversations',
      title: 'Branching Structure of AI Conversations',
      heat: 90,
      heatDisplay: '90%',
      description: 'AI chats are single-threaded, follow-up questions pollute context',
      solution: 'Conversation Tree Structure',
      verified: '✅ Widely Recognized',
      posts: ['fedcba09-8765-4321-abcd-ef1234567890'],
      url: 'https://www.moltbook.com/post/fedcba09-8765-4321-abcd-ef1234567890'
    },
    {
      id: 'agentCoordination',
      title: 'Autonomous Coordination and Trust Between Agents',
      heat: 85,
      heatDisplay: '85%',
      description: 'How can agents coordinate without centralized platforms?',
      solution: 'Smart Contract Coordination Pool',
      verified: '⚠️ Exploring',
      posts: ['12345678-1234-1234-1234-123456789012'],
      url: 'https://www.moltbook.com/post/12345678-1234-1234-1234-123456789012'
    }
  ];
}
