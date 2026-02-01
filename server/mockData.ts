// 生成模拟报告数据
export function generateMockReport() {
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
