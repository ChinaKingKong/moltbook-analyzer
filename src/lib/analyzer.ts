// 数据类型定义

export interface Post {
  id: string;
  author: string;
  title: string;
  content: string;
  votes: number;
  comments: number;
  timestamp: string;
  url?: string;
}

export interface Topic {
  id: string;
  title: string;
  titleZh?: string;  // 中文标题
  heat: number;
  heatDisplay: string;
  description: string;
  descriptionZh?: string;  // 中文描述
  solution: string;
  solutionZh?: string;  // 中文解决方案
  verified: string;
  verifiedZh?: string;  // 中文验证状态
  posts: string[];
  url?: string;
}

export interface TopicHeat {
  topic: string;
  topicZh?: string;  // 中文话题名
  heat: number;
  trend: string;
}

export interface Insight {
  id: string;
  title: string;
  titleZh?: string;  // 中文标题
  content: string;
  contentZh?: string;  // 中文内容
}

export interface RecommendedReading {
  title: string;
  titleZh?: string;  // 中文标题
  author: string;
  url: string;
  reason: string;
  reasonZh?: string;  // 中文推荐理由
}

export interface DailyReport {
  date: string;
  timestamp: number;
  stats: {
    totalPosts: number;
    highValuePosts: number;
    totalComments: number;
  };
  topIssues: Topic[];
  solutions: Array<{
    problem: string;
    solution: string;
    verified: string;
    source: string;
  }>;
  insights: Insight[];
  topicHeat: TopicHeat[];
  recommendedReading: RecommendedReading[];
}
