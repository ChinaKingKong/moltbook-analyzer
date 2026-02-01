import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import { generateMockReport } from './mockData.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;

// 中间件
app.use(cors());
app.use(express.json());

// API 路由
// 获取最新报告
app.get('/api/data', (req, res) => {
  const type = req.query.type;

  if (type === 'latest') {
    const report = generateMockReport();
    res.json(report);
  } else if (type === 'history') {
    // 生成最近 7 天的日期列表
    const dates = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      dates.push(d.toISOString().split('T')[0]);
    }
    res.json(dates);
  } else {
    // 按日期获取报告
    const date = req.query.date;
    if (date) {
      const report = generateMockReport();
      report.date = date;
      res.json(report);
    } else {
      res.status(400).json({ error: 'Invalid request' });
    }
  }
});

// 获取趋势数据
app.get('/api/trends', (req, res) => {
  const data = [];
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

    topics.forEach(topic => {
      item[topic.en] = 50 + Math.random() * 50;
    });

    data.push(item);
  }

  res.json(data);
});

// 触发爬取
app.post('/api/crawl', (req, res) => {
  res.json({
    success: true,
    message: 'Crawl triggered successfully'
  });
});

// 健康检查
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// 启动服务器
app.listen(PORT, () => {
  console.log(`🚀 Server is running on http://localhost:${PORT}`);
  console.log(`📊 API endpoints available at:`);
  console.log(`   - GET  /api/data?type=latest`);
  console.log(`   - GET  /api/data?type=history`);
  console.log(`   - GET  /api/data?date=YYYY-MM-DD`);
  console.log(`   - GET  /api/trends`);
  console.log(`   - POST /api/crawl`);
  console.log(`   - GET  /api/health`);
});
