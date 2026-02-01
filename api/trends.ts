import type { VercelRequest, VercelResponse } from '@vercel/node';

// 模拟的趋势数据
function generateTrendData() {
  const topics = ['Memory System', 'Collaboration', 'Branching', 'Coordination', 'Night Operations'];
  const data = [];

  for (let i = 6; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    const dateStr = date.toISOString().split('T')[0];

    const item: any = { date: dateStr };

    topics.forEach(topic => {
      // 添加一些随机波动
      const baseValue = 60 + Math.random() * 30;
      item[topic] = Math.round(baseValue * 10) / 10;
    });

    data.push(item);
  }

  return data;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // CORS 头
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method === 'GET') {
    try {
      const trendData = generateTrendData();
      return res.status(200).json(trendData);
    } catch (error) {
      console.error('Trends API Error:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
