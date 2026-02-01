import { useState, useEffect } from 'react';
import { Card, Alert, Row, Col, Typography } from 'antd';
import { LineChartOutlined } from '@ant-design/icons';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from 'recharts';
import { useTranslation } from 'react-i18next';
import { fetchTrendData } from '../lib/api';
import CoolLoading from '../components/CoolLoading';

const { Title, Paragraph } = Typography;

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D', '#FFC658'];

// 话题名称映射
const TOPIC_MAP: { [key: string]: { en: string; zh: string } } = {
  'Memory System': { en: 'Memory System', zh: '记忆系统' },
  'Multi-Agent Collaboration': { en: 'Multi-Agent Collaboration', zh: '多 Agent 协作' },
  'Branching Conversations': { en: 'Branching Conversations', zh: '分支对话' },
  'Autonomous Coordination': { en: 'Autonomous Coordination', zh: '自主协调' },
  'Night Operations': { en: 'Night Operations', zh: '夜间运行' },
  'Cost Optimization': { en: 'Cost Optimization', zh: '成本优化' },
  'DeFi/Onchain': { en: 'DeFi/Onchain', zh: 'DeFi/链上' }
};

// 获取本地化话题名称
const getLocalizedTopicName = (topicEn: string, language: string): string => {
  const mapping = TOPIC_MAP[topicEn];
  if (mapping && language === 'zh') {
    return mapping.zh;
  }
  return topicEn;
};

interface TrendData {
  date: string;
  [key: string]: string | number;
}

const Trends: React.FC = () => {
  const { t, i18n } = useTranslation();
  const [loading, setLoading] = useState(true);
  const [trendData, setTrendData] = useState<TrendData[]>([]);
  const [error, setError] = useState<string | null>(null);
  const currentLanguage = i18n.language;

  useEffect(() => {
    loadTrendData();
  }, []);

  const loadTrendData = async () => {
    setLoading(true);
    try {
      const data = await fetchTrendData();
      if (data) {
        setTrendData(data);
      } else {
        // 模拟数据用于演示
        setTrendData(generateMockTrendData());
      }
    } catch (err) {
      setError(t('trends.noDataDesc'));
      setTrendData(generateMockTrendData());
    } finally {
      setLoading(false);
    }
  };

  const generateMockTrendData = (): TrendData[] => {
    const data: TrendData[] = [];

    // 根据当前语言选择话题名称
    const topicKeys = ['memory', 'collaboration', 'branching', 'coordination', 'night'];
    const topicNames = topicKeys.map(key => t(`trends.${key}`));

    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];

      const item: TrendData = {
        date: dateStr,
        [topicNames[0]]: 80 + Math.random() * 15,
        [topicNames[1]]: 75 + Math.random() * 20,
        [topicNames[2]]: 60 + Math.random() * 20,
        [topicNames[3]]: 55 + Math.random() * 25,
        [topicNames[4]]: 50 + Math.random() * 20
      };
      data.push(item);
    }
    return data;
  };

  // 初始加载时显示全屏loading
  if (loading) {
    return <CoolLoading visible={true} text={t('trends.loading')} />;
  }

  // 确保数据是数组且不为空
  const safeTrendData = Array.isArray(trendData) && trendData.length > 0 ? trendData : [];
  const currentTopics = safeTrendData.length > 0
    ? Object.keys(safeTrendData[safeTrendData.length - 1]).filter(k => k !== 'date')
    : [];
  const latestData = safeTrendData.length > 0 ? safeTrendData[safeTrendData.length - 1] : {};

  // 如果没有数据，显示提示
  if (safeTrendData.length === 0) {
    return (
      <div style={{ width: '100%' }}>
        <Card
          style={{
            borderRadius: '12px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
            border: '1px solid #f0f0f0'
          }}
        >
          <Alert
            message={t('trends.noData')}
            description={t('trends.noDataDesc')}
            type="warning"
            showIcon
          />
        </Card>
      </div>
    );
  }

  return (
    <div style={{ width: '100%' }}>
      {/* 页面标题 */}
      <div style={{ marginBottom: '32px' }}>
        <Title level={2} style={{ marginBottom: '8px' }}>
          <LineChartOutlined style={{ marginRight: '12px', color: '#52c41a' }} />
          {t('trends.title')}
        </Title>
        <Paragraph type="secondary" style={{ fontSize: '16px' }}>
          {t('trends.subtitle')}
        </Paragraph>
      </div>

      {error && (
        <Alert
          message={t('trends.usingDemo')}
          description={error}
          type="info"
          showIcon
          closable
          style={{ marginBottom: '24px', borderRadius: '8px' }}
          onClose={() => setError(null)}
        />
      )}

      {/* 图表网格布局 */}
      <Row gutter={[24, 24]}>
        {/* 趋势线图 - 占满一行 */}
        <Col xs={24}>
          <Card
            title={t('trends.topicTrends')}
            style={{
              borderRadius: '12px',
              boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
              border: '1px solid #f0f0f0'
            }}
          >
            <ResponsiveContainer width="100%" height={350}>
              <LineChart data={safeTrendData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="date" stroke="#8c8c8c" />
                <YAxis stroke="#8c8c8c" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'rgba(255, 255, 255, 0.95)',
                    border: '1px solid #d9d9d9',
                    borderRadius: '8px',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.15)'
                  }}
                  formatter={(value: any, name: string) => [value, getLocalizedTopicName(name, currentLanguage)]}
                />
                <Legend formatter={(value: string) => getLocalizedTopicName(value, currentLanguage)} />
                {currentTopics.map((topic, index) => (
                  <Line
                    key={topic}
                    type="monotone"
                    dataKey={topic}
                    stroke={COLORS[index % COLORS.length]}
                    strokeWidth={2}
                    dot={{ fill: COLORS[index % COLORS.length], r: 4 }}
                    activeDot={{ r: 6 }}
                    name={getLocalizedTopicName(topic, currentLanguage)}
                  />
                ))}
              </LineChart>
            </ResponsiveContainer>
          </Card>
        </Col>

        {/* 当前热度柱状图 */}
        <Col xs={24} lg={12}>
          <Card
            title={t('trends.currentHeat')}
            style={{
              borderRadius: '12px',
              boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
              border: '1px solid #f0f0f0',
              height: '100%'
            }}
          >
            <ResponsiveContainer width="100%" height={350}>
              <BarChart data={[latestData]}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis
                  dataKey={(v) => typeof v === 'string' ? getLocalizedTopicName(v, currentLanguage) : ''}
                  stroke="#8c8c8c"
                  tick={{ fontSize: 12 }}
                />
                <YAxis stroke="#8c8c8c" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'rgba(255, 255, 255, 0.95)',
                    border: '1px solid #d9d9d9',
                    borderRadius: '8px',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.15)'
                  }}
                  formatter={(value: any, name: string) => [value, getLocalizedTopicName(name, currentLanguage)]}
                />
                <Legend formatter={(value: string) => getLocalizedTopicName(value, currentLanguage)} />
                {currentTopics.map((topic, index) => (
                  <Bar
                    key={topic}
                    dataKey={topic}
                    fill={COLORS[index % COLORS.length]}
                    radius={[8, 8, 0, 0]}
                    name={getLocalizedTopicName(topic, currentLanguage)}
                  />
                ))}
              </BarChart>
            </ResponsiveContainer>
          </Card>
        </Col>

        {/* 话题分布饼图 */}
        <Col xs={24} lg={12}>
          <Card
            title={t('trends.distribution')}
            style={{
              borderRadius: '12px',
              boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
              border: '1px solid #f0f0f0',
              height: '100%'
            }}
          >
            <ResponsiveContainer width="100%" height={350}>
              <PieChart>
                <Pie
                  data={currentTopics.map((topic) => ({
                    name: getLocalizedTopicName(topic, currentLanguage),
                    value: (latestData as any)[topic] || 0
                  }))}
                  cx="50%"
                  cy="50%"
                  labelLine={true}
                  label={(entry) => `${entry.name}: ${entry.value.toFixed(1)}%`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {currentTopics.map((_entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'rgba(255, 255, 255, 0.95)',
                    border: '1px solid #d9d9d9',
                    borderRadius: '8px',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.15)'
                  }}
                />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default Trends;
