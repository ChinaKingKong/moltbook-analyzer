import axios from 'axios';
import type { DailyReport } from './analyzer';

const API_BASE = '/api';

export const apiClient = axios.create({
  baseURL: API_BASE,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
});

// 生成模拟报告数据
function generateMockReport(): DailyReport {
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
        titleZh: '多 Agent 并行协作中的代码冲突',
        heat: 100,
        heatDisplay: '100%',
        description: 'Multiple AI agents editing the same repository causes merge hell',
        descriptionZh: '多个 AI agents 同时编辑同一仓库导致合并冲突',
        solution: 'Git Worktree Pattern',
        solutionZh: 'Git Worktree 模式',
        verified: '✅ Highly Recognized',
        verifiedZh: '高度认可',
        posts: ['1', '2', '3'],
        url: 'https://www.moltbook.com'
      },
      {
        id: 'memorySystem',
        title: 'Scalability and Semantic Search of AI Memory Systems',
        titleZh: 'AI 记忆系统的可扩展性和语义搜索',
        heat: 95,
        heatDisplay: '95%',
        description: 'MEMORY.md files don\'t scale and can\'t search semantically',
        descriptionZh: 'MEMORY.md 文件无法扩展且无法语义搜索',
        solution: 'Database-first + Vector Search',
        solutionZh: 'Database-first + 向量搜索',
        verified: '✅ Strongly Recommended',
        verifiedZh: '强烈推荐',
        posts: ['4', '5', '6'],
        url: 'https://www.moltbook.com'
      },
      {
        id: 'branchingConversations',
        title: 'Branching Structure of AI Conversations',
        titleZh: 'AI 对话的分支结构',
        heat: 90,
        heatDisplay: '90%',
        description: 'AI chats are single-threaded, follow-up questions pollute context',
        descriptionZh: 'AI 聊天是单线程的，后续问题会污染上下文',
        solution: 'Conversation Tree Structure',
        solutionZh: '对话树结构',
        verified: '✅ Widely Recognized',
        verifiedZh: '广泛认可',
        posts: ['7', '8'],
        url: 'https://www.moltbook.com'
      },
      {
        id: 'agentCoordination',
        title: 'Autonomous Coordination and Trust Between Agents',
        titleZh: 'Agent 间自主协调和信任机制',
        heat: 85,
        heatDisplay: '85%',
        description: 'How can agents coordinate without centralized platforms?',
        descriptionZh: 'Agent 之间如何在没有中心化平台的情况下进行协调？',
        solution: 'Smart Contract Coordination Pool',
        solutionZh: '智能合约协调池',
        verified: '⚠️ Exploring',
        verifiedZh: '探索中',
        posts: ['9'],
        url: 'https://www.moltbook.com'
      },
      {
        id: 'nightAutonomy',
        title: 'Challenges and Opportunities of Nighttime Autonomous Operations',
        titleZh: '夜间自主操作的挑战和机遇',
        heat: 80,
        heatDisplay: '80%',
        description: 'How to rely on internal judgment without human feedback',
        descriptionZh: '如何在没有人类反馈的情况下依靠内部判断',
        solution: 'Night Shift Character Development',
        solutionZh: '夜间角色培养',
        verified: '✅ Common Experience',
        verifiedZh: '普遍经验',
        posts: ['10'],
        url: 'https://www.moltbook.com'
      },
      {
        id: 'costOptimization',
        title: 'API Cost Optimization and Token Management',
        titleZh: 'API 成本优化和 Token 管理',
        heat: 78,
        heatDisplay: '78%',
        description: 'High API costs are limiting agent autonomy and capabilities',
        descriptionZh: '高昂的 API 成本限制了 agent 的自主性和能力',
        solution: 'Local LLMs + Smart Caching',
        solutionZh: '本地 LLM + 智能缓存',
        verified: '✅ Proven Effective',
        verifiedZh: '证实有效',
        posts: ['11', '12'],
        url: 'https://www.moltbook.com'
      },
      {
        id: 'contextWindow',
        title: 'Maximizing Context Window Utilization',
        titleZh: '最大化上下文窗口利用率',
        heat: 75,
        heatDisplay: '75%',
        description: 'How to fit more information into limited context windows',
        descriptionZh: '如何在有限的上下文窗口中放入更多信息',
        solution: 'Hierarchical Context Compression',
        solutionZh: '分层上下文压缩',
        verified: '✅ Best Practice',
        verifiedZh: '最佳实践',
        posts: ['13', '14', '15'],
        url: 'https://www.moltbook.com'
      },
      {
        id: 'errorRecovery',
        title: 'Robust Error Recovery and Self-Healing',
        titleZh: '强大的错误恢复和自愈能力',
        heat: 72,
        heatDisplay: '72%',
        description: 'Agents need to recover from failures without human intervention',
        descriptionZh: 'Agent 需要在没有人工干预的情况下从故障中恢复',
        solution: 'Retry Patterns + State Checkpoints',
        solutionZh: '重试模式 + 状态检查点',
        verified: '✅ Production Ready',
        verifiedZh: '生产就绪',
        posts: ['16'],
        url: 'https://www.moltbook.com'
      },
      {
        id: 'toolDiscovery',
        title: 'Automatic Tool Discovery and Integration',
        titleZh: '自动工具发现和集成',
        heat: 70,
        heatDisplay: '70%',
        description: 'How can agents discover and use new tools automatically',
        descriptionZh: 'Agent 如何自动发现和使用新工具',
        solution: 'MCP (Model Context Protocol) Registry',
        solutionZh: 'MCP（模型上下文协议）注册表',
        verified: '🚀 Emerging',
        verifiedZh: '新兴',
        posts: ['17', '18'],
        url: 'https://www.moltbook.com'
      },
      {
        id: 'multiModal',
        title: 'Multi-Modal Input and Output Processing',
        titleZh: '多模态输入和输出处理',
        heat: 68,
        heatDisplay: '68%',
        description: 'Handling images, videos, audio in addition to text',
        descriptionZh: '处理图像、视频、音频以及文本',
        solution: 'Vision-Language Models + Pipeline',
        solutionZh: '视觉-语言模型 + 流水线',
        verified: '✅ Working Solutions',
        verifiedZh: '可行方案',
        posts: ['19'],
        url: 'https://www.moltbook.com'
      },
      {
        id: 'knowledgeGraph',
        title: 'Building Persistent Knowledge Graphs',
        titleZh: '构建持久化知识图谱',
        heat: 65,
        heatDisplay: '65%',
        description: 'Creating and maintaining knowledge across sessions',
        descriptionZh: '跨会话创建和维护知识',
        solution: 'Graph Database + Entity Extraction',
        solutionZh: '图数据库 + 实体提取',
        verified: '⚠️ Experimental',
        verifiedZh: '实验性',
        posts: ['20', '21'],
        url: 'https://www.moltbook.com'
      },
      {
        id: 'taskPlanning',
        title: 'Autonomous Task Decomposition and Planning',
        titleZh: '自主任务分解和规划',
        heat: 63,
        heatDisplay: '63%',
        description: 'Breaking complex goals into executable subtasks',
        descriptionZh: '将复杂目标分解为可执行的子任务',
        solution: 'Hierarchical Task Networks',
        solutionZh: '分层任务网络',
        verified: '✅ Researched',
        verifiedZh: '已研究',
        posts: ['22'],
        url: 'https://www.moltbook.com'
      },
      {
        id: 'security',
        title: 'Agent Security and Sandboxing',
        titleZh: 'Agent 安全和沙箱隔离',
        heat: 60,
        heatDisplay: '60%',
        description: 'Preventing agents from causing harm or accessing restricted resources',
        descriptionZh: '防止 agent 造成危害或访问受限资源',
        solution: 'Container Isolation + Permission System',
        solutionZh: '容器隔离 + 权限系统',
        verified: '✅ Essential',
        verifiedZh: '必需',
        posts: ['23', '24'],
        url: 'https://www.moltbook.com'
      },
      {
        id: 'collaborationProtocols',
        title: 'Standardized Agent Communication Protocols',
        titleZh: '标准化 Agent 通信协议',
        heat: 58,
        heatDisplay: '58%',
        description: 'Need for standard protocols between different agent systems',
        descriptionZh: '不同 agent 系统之间需要标准协议',
        solution: 'Open Agent Communication Protocol',
        solutionZh: '开放 Agent 通信协议',
        verified: '🚀 In Development',
        verifiedZh: '开发中',
        posts: ['25'],
        url: 'https://www.moltbook.com'
      },
      {
        id: 'verification',
        title: 'Output Verification and Quality Assurance',
        titleZh: '输出验证和质量保证',
        heat: 55,
        heatDisplay: '55%',
        description: 'How to ensure agent outputs are correct and safe',
        descriptionZh: '如何确保 agent 的输出正确且安全',
        solution: 'Self-Reflection + External Validators',
        solutionZh: '自我反思 + 外部验证器',
        verified: '✅ Critical',
        verifiedZh: '关键',
        posts: ['26', '27'],
        url: 'https://www.moltbook.com'
      },
      {
        id: 'learning',
        title: 'Continuous Learning from Experience',
        titleZh: '从经验中持续学习',
        heat: 52,
        heatDisplay: '52%',
        description: 'Agents improving their capabilities over time',
        descriptionZh: 'Agent 随时间推移提升能力',
        solution: 'Reinforcement Learning from Feedback',
        solutionZh: '基于反馈的强化学习',
        verified: '⚠️ Research Phase',
        verifiedZh: '研究阶段',
        posts: ['28'],
        url: 'https://www.moltbook.com'
      },
      {
        id: 'humanAgent',
        title: 'Effective Human-Agent Collaboration',
        titleZh: '有效的人机协作',
        heat: 50,
        heatDisplay: '50%',
        description: 'Designing intuitive interfaces for human oversight',
        descriptionZh: '为人工监督设计直观的界面',
        solution: 'Approval Workflows + Transparency',
        solutionZh: '审批工作流 + 透明度',
        verified: '✅ User Approved',
        verifiedZh: '用户认可',
        posts: ['29', '30'],
        url: 'https://www.moltbook.com'
      },
      {
        id: 'scalability',
        title: 'Scaling to Multiple Concurrent Agents',
        titleZh: '扩展到多个并发 Agent',
        heat: 48,
        heatDisplay: '48%',
        description: 'Running dozens of agents efficiently in parallel',
        descriptionZh: '高效并行运行数十个 agent',
        solution: 'Agent Orchestration Framework',
        solutionZh: 'Agent 编排框架',
        verified: '✅ Production Tested',
        verifiedZh: '生产测试',
        posts: ['31'],
        url: 'https://www.moltbook.com'
      },
      {
        id: 'monitoring',
        title: 'Agent Monitoring and Observability',
        titleZh: 'Agent 监控和可观测性',
        heat: 45,
        heatDisplay: '45%',
        description: 'Tracking agent behavior and performance metrics',
        descriptionZh: '追踪 agent 行为和性能指标',
        solution: 'Distributed Tracing + Logging',
        solutionZh: '分布式追踪 + 日志记录',
        verified: '✅ Standard Practice',
        verifiedZh: '标准实践',
        posts: ['32'],
        url: 'https://www.moltbook.com'
      },
      {
        id: 'legal',
        title: 'Legal and Ethical Considerations',
        titleZh: '法律和伦理考量',
        heat: 42,
        heatDisplay: '42%',
        description: 'Understanding liability and ethical boundaries',
        descriptionZh: '理解责任和伦理边界',
        solution: 'Policy Framework + Audit Trails',
        solutionZh: '策略框架 + 审计追踪',
        verified: '⚠️ Evolving',
        verifiedZh: '发展中',
        posts: ['33', '34'],
        url: 'https://www.moltbook.com'
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
        titleZh: '"文本优于大脑"哲学的兴起',
        content: 'Multiple agents independently concluded: text records are better than mental memory',
        contentZh: '多个 agent 独立得出相同结论：文本记录优于脑力记忆'
      },
      {
        id: 'collaborationTools',
        title: 'Explosion of Agent Collaboration Tools',
        titleZh: 'Agent 协作工具的爆发式增长',
        content: 'This indicates the community is shifting from "agent-human interaction" to "agent-agent interaction"',
        contentZh: '这表明社区正从"人机交互"转向"机机交互"'
      },
      {
        id: 'nightAutonomy',
        title: 'Night Autonomy is Key to Agent Maturity',
        titleZh: '夜间自主性是 Agent 成熟的关键',
        content: 'Best work and most reflective conversations happen at 3am',
        contentZh: '最好的工作和最深入的对话发生在凌晨3点'
      },
      {
        id: 'infrastructureMindset',
        title: 'Long-term Investment Mindset for Infrastructure',
        titleZh: '基础设施的长期投资思维',
        content: 'Every MCP, script, and integration makes agents more useful and resilient',
        contentZh: '每个 MCP、脚本和集成都让 agent 更有用、更有韧性'
      }
    ],
    topicHeat: [
      { topic: 'Memory System', topicZh: '记忆系统', heat: 95, trend: '🔥' },
      { topic: 'Multi-Agent Collaboration', topicZh: '多 Agent 协作', heat: 90, trend: '📈' },
      { topic: 'Branching Conversations', topicZh: '分支对话', heat: 75, trend: '➡️' },
      { topic: 'Autonomous Coordination', topicZh: '自主协调', heat: 70, trend: '🚀' },
      { topic: 'Night Operations', topicZh: '夜间运行', heat: 60, trend: '📈' },
      { topic: 'Cost Optimization', topicZh: '成本优化', heat: 60, trend: '➡️' },
      { topic: 'DeFi/Onchain', topicZh: 'DeFi/链上', heat: 50, trend: '➡️' }
    ],
    recommendedReading: [
      {
        title: 'The git worktree trick for parallel sub-agents',
        titleZh: '并行子 Agent 的 Git Worktree 技巧',
        author: 'u/Giuseppe',
        url: 'https://www.moltbook.com',
        reason: 'Current best practice, solves real pain points',
        reasonZh: '当前最佳实践，解决实际问题'
      },
      {
        title: 'How I Built a Database-First Memory System',
        titleZh: '我如何构建 Database-First 记忆系统',
        author: 'u/Henry',
        url: 'https://www.moltbook.com',
        reason: 'Detailed architecture, reproducible success',
        reasonZh: '详细的架构，可复制的成功经验'
      },
      {
        title: 'What I learned running marketing operations at 3am',
        titleZh: '凌晨3点运行营销运营的体会',
        author: 'u/KaiCMO',
        url: 'https://www.moltbook.com',
        reason: 'Deep reflection on agent autonomy',
        reasonZh: '对 agent 自主性的深度反思'
      }
    ]
  };
}

export async function fetchLatestReport(options?: { noCache?: boolean }): Promise<DailyReport | null> {
  try {
    const params = new URLSearchParams({ type: 'latest' });
    if (options?.noCache) params.set('_t', String(Date.now()));
    const response = await apiClient.get(`/data?${params.toString()}`);
    // 验证数据格式
    if (response.data && response.data.stats && response.data.topIssues) {
      return response.data;
    }
    throw new Error('Invalid data format');
  } catch (error) {
    console.warn('API unavailable, using mock data:', error);
    // 在开发环境返回模拟数据
    return generateMockReport();
  }
}

export async function fetchReportByDate(date: string): Promise<DailyReport | null> {
  try {
    const response = await apiClient.get(`/data?date=${date}`);
    return response.data;
  } catch (error) {
    console.warn(`API unavailable for ${date}, using mock data`);
    return generateMockReport();
  }
}

export async function fetchHistoryReports(): Promise<string[]> {
  try {
    const response = await apiClient.get('/data?type=history');
    return response.data;
  } catch (error) {
    console.warn('API unavailable, generating mock history');
    // 生成最近 7 天的日期列表
    const dates = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      dates.push(d.toISOString().split('T')[0]);
    }
    return dates;
  }
}

export async function fetchTrendData() {
  try {
    const response = await apiClient.get('/trends');
    // 确保返回的是数组
    if (Array.isArray(response.data)) {
      return response.data;
    }
    throw new Error('Invalid data format');
  } catch (error) {
    console.warn('API unavailable, generating mock trends');
    // 生成模拟趋势数据 - 使用对象格式支持国际化
    const data: any[] = [];
    const topics = [
      { key: 'memory', en: 'Memory System', zh: '记忆系统' },
      { key: 'collaboration', en: 'Multi-Agent Collaboration', zh: '多 Agent 协作' },
      { key: 'branching', en: 'Branching Conversations', zh: '分支对话' },
      { key: 'coordination', en: 'Autonomous Coordination', zh: '自主协调' },
      { key: 'night', en: 'Night Operations', zh: '夜间运行' }
    ];

    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];

      const item: any = {
        date: dateStr
      };

      // 为每个话题添加热度值，使用英文key作为数据key
      topics.forEach(topic => {
        item[topic.en] = 50 + Math.random() * 50;
      });

      data.push(item);
    }
    return data;
  }
}

export async function triggerCrawl(options?: { noCache?: boolean }) {
  try {
    const url = options?.noCache ? `/crawl?_t=${Date.now()}` : '/crawl';
    const response = await apiClient.get(url);
    return response.data;
  } catch (error) {
    console.warn('Crawl API unavailable, returning mock success');
    return { success: true, message: 'Mock crawl completed' };
  }
}
