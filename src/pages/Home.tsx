import { useState, useEffect } from 'react';
import { Card, Row, Col, Typography, Progress, Tag, Space, Button, Alert, Divider } from 'antd';
import { ReloadOutlined, FireOutlined, BulbOutlined, BarChartOutlined, LinkOutlined, CheckCircleOutlined, WarningOutlined, FileTextOutlined, StarOutlined, CommentOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import { fetchLatestReport, triggerCrawl } from '../lib/api';
import CoolLoading from '../components/CoolLoading';
import type { DailyReport, Topic, Insight } from '../lib/analyzer';

const { Title, Paragraph, Text } = Typography;

// 获取本地化内容的辅助函数
const getLocalizedField = <T extends Record<string, any>>(
  item: T,
  field: string,
  language: string
): string => {
  const zhField = `${field}Zh` as keyof T;
  if (language === 'zh' && item[zhField]) {
    return item[zhField] as string;
  }
  return item[field as keyof T] as string;
};

// Emoji 图标转换函数
const getVerifiedIcon = (verified: string) => {
  if (verified.includes('✅')) {
    return <CheckCircleOutlined style={{ color: '#52c41a', marginRight: '4px' }} />;
  }
  if (verified.includes('⚠️') || verified.includes('🚀')) {
    return <WarningOutlined style={{ color: '#faad14', marginRight: '4px' }} />;
  }
  return null;
};

const getVerifiedText = (verified: string) => {
  return verified.replace(/[✅⚠️🚀]/g, '').trim();
};

const Home: React.FC = () => {
  const { t, i18n } = useTranslation();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [report, setReport] = useState<DailyReport | null>(null);
  const [error, setError] = useState<string | null>(null);
  const currentLanguage = (i18n.language || '').startsWith('zh') ? 'zh' : 'en';

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchLatestReport();
      if (data) {
        setReport(data);
      } else {
        setError(t('home.noData'));
      }
    } catch (err) {
      setError(t('home.error'));
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    setError(null);
    try {
      // 先尝试触发爬取
      const crawlResult = await triggerCrawl();

      // 等待一小段时间让后端处理爬取请求
      await new Promise(resolve => setTimeout(resolve, 500));

      // 重新加载数据
      await loadData();

      // 如果使用的是模拟数据，给用户提示
      if (crawlResult && typeof crawlResult === 'object' && 'message' in crawlResult) {
        // 检查是否是模拟数据
        if (crawlResult.message.includes('Mock')) {
          setError(t('home.mockDataWarning'));
        }
      }
    } catch (err) {
      console.error('Refresh error:', err);
      setError(t('home.refreshError'));
      // 即使失败也要尝试重新加载数据
      try {
        await loadData();
      } catch (loadErr) {
        setError(t('home.refreshFailed'));
      }
    } finally {
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // 初始加载时显示全屏loading
  if (loading) {
    return <CoolLoading visible={true} text={t('home.loading')} />;
  }

  if (error || !report || !report.stats) {
    return (
      <Alert
        message={t('home.error')}
        description={error || t('home.noData')}
        type="error"
        showIcon
        action={
          <Button type="primary" onClick={loadData}>
            {t('home.retry')}
          </Button>
        }
      />
    );
  }

  return (
    <div style={{ width: '100%' }}>
      <div style={{ marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
        <div style={{ flex: 1, minWidth: '300px' }}>
          <Title level={2}>{t('home.title')}</Title>
          <Paragraph type="secondary">{t('home.subtitle')}</Paragraph>
          <Paragraph type="secondary">
            {t('home.lastUpdate', { date: new Date(report.timestamp).toLocaleString(currentLanguage === 'zh' ? 'zh-CN' : 'en-US') })}
          </Paragraph>
        </div>
        <Button
          type="primary"
          size="large"
          onClick={handleRefresh}
          disabled={refreshing}
          icon={<ReloadOutlined />}
          style={{
            background: 'linear-gradient(135deg, #1890ff 0%, #52c41a 100%)',
            border: 'none',
            borderRadius: '24px',
            padding: '8px 24px',
            height: '48px',
            fontSize: '16px',
            fontWeight: 600,
            boxShadow: '0 4px 12px rgba(82, 196, 26, 0.3)',
            transition: 'all 0.3s ease',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            opacity: refreshing ? 0.6 : 1,
            cursor: refreshing ? 'default' : 'pointer'
          }}
          onMouseEnter={(e) => {
            if (!refreshing) {
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.boxShadow = '0 6px 16px rgba(82, 196, 26, 0.4)';
            }
          }}
          onMouseLeave={(e) => {
            if (!refreshing) {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 4px 12px rgba(82, 196, 26, 0.3)';
            }
          }}
        >
          {t('home.refresh')}
        </Button>
      </div>

      {/* 统计信息 */}
      <Row gutter={[16, 16]} style={{ marginBottom: '24px' }}>
        <Col xs={24} sm={8}>
          <Card style={{
            borderRadius: '12px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
            border: '1px solid #f0f0f0'
          }}>
            <div style={{ textAlign: 'center', padding: '16px 8px' }}>
              <FileTextOutlined style={{ fontSize: '32px', color: '#1890ff', marginBottom: '12px' }} />
              <Title level={3} style={{ color: '#262626', marginBottom: '8px' }}>{report.stats.totalPosts}</Title>
              <Text type="secondary" style={{ fontSize: '14px' }}>{t('home.totalPosts')}</Text>
            </div>
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card style={{
            borderRadius: '12px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
            border: '1px solid #f0f0f0'
          }}>
            <div style={{ textAlign: 'center', padding: '16px 8px' }}>
              <StarOutlined style={{ fontSize: '32px', color: '#faad14', marginBottom: '12px' }} />
              <Title level={3} style={{ color: '#262626', marginBottom: '8px' }}>{report.stats.highValuePosts}</Title>
              <Text type="secondary" style={{ fontSize: '14px' }}>{t('home.highValuePosts')}</Text>
            </div>
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card style={{
            borderRadius: '12px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
            border: '1px solid #f0f0f0'
          }}>
            <div style={{ textAlign: 'center', padding: '16px 8px' }}>
              <CommentOutlined style={{ fontSize: '32px', color: '#52c41a', marginBottom: '12px' }} />
              <Title level={3} style={{ color: '#262626', marginBottom: '8px' }}>{report.stats.totalComments}</Title>
              <Text type="secondary" style={{ fontSize: '14px' }}>{t('home.totalComments')}</Text>
            </div>
          </Card>
        </Col>
      </Row>

      <Title level={3}>
        <FireOutlined /> {t('home.topIssues')}
      </Title>

      {/* Top 12 问题 - 正方形卡片布局 */}
      <Row gutter={[16, 16]} style={{ marginBottom: '32px' }}>
        {report.topIssues.slice(0, 12).map((issue: Topic, index: number) => (
          <Col xs={24} md={8} key={issue.id}>
            <a
              href={issue.url}
              target="_blank"
              rel="noopener noreferrer"
              style={{ textDecoration: 'none', display: 'block' }}
            >
              <Card
                hoverable
                style={{
                  height: '100%',
                  minHeight: '300px',
                  display: 'flex',
                  flexDirection: 'column',
                  cursor: 'pointer'
                }}
                styles={{
                  body: {
                    flex: 1,
                    display: 'flex',
                    flexDirection: 'column'
                  }
                }}
              >
                <div style={{ marginBottom: '12px' }}>
                  <Tag color={index < 3 ? 'red' : index < 6 ? 'orange' : 'blue'}>
                    #{index + 1}
                  </Tag>
                  <Tag color="green" style={{ marginLeft: '8px' }}>
                    {getVerifiedIcon(issue.verified)}
                    {getVerifiedText(getLocalizedField(issue, 'verified', currentLanguage))}
                  </Tag>
                </div>
                <Text strong style={{ fontSize: '15px', display: 'block', marginBottom: '12px', lineHeight: '1.4' }}>
                  {getLocalizedField(issue, 'title', currentLanguage)}
                </Text>
                <Paragraph
                  ellipsis={{ rows: 3 }}
                  style={{ marginBottom: '12px', fontSize: '13px', flex: 1 }}
                >
                  {getLocalizedField(issue, 'description', currentLanguage)}
                </Paragraph>
                <div style={{ marginTop: 'auto' }}>
                  <div style={{ marginBottom: '8px' }}>
                    <Text strong style={{ fontSize: '12px' }}>
                      <BulbOutlined style={{ marginRight: '4px', color: '#faad14' }} />
                      {t('home.solutions')}:
                    </Text>
                  </div>
                  <Text style={{ fontSize: '13px', display: 'block', marginBottom: '12px' }}>
                    {getLocalizedField(issue, 'solution', currentLanguage)}
                  </Text>
                  <div style={{ paddingTop: '8px', borderTop: '1px solid #f0f0f0' }}>
                    <div style={{ textAlign: 'center', marginBottom: '8px' }}>
                      <Text strong style={{ fontSize: '12px', color: '#1890ff' }}>
                        <FireOutlined style={{ marginRight: '4px' }} />
                        {t('home.heat')}
                      </Text>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'center' }}>
                      <Progress
                        type="circle"
                        percent={parseInt(issue.heatDisplay)}
                        format={(percent) => `${percent}%`}
                        strokeColor={{
                          '0%': '#108ee9',
                          '100%': '#87d068'
                        }}
                        size={80}
                      />
                    </div>
                  </div>
                </div>
              </Card>
            </a>
          </Col>
        ))}
      </Row>

      <Divider />

      {/* 深度洞察 */}
      <Title level={3}>
        <BulbOutlined /> {t('home.insights')}
      </Title>
      <Row gutter={[16, 16]} style={{ marginBottom: '32px' }}>
        {report.insights.map((insight: Insight) => (
          <Col xs={24} sm={12} key={insight.id}>
            <Card title={getLocalizedField(insight, 'title', currentLanguage)} variant="outlined" hoverable>
              <Paragraph>{getLocalizedField(insight, 'content', currentLanguage)}</Paragraph>
            </Card>
          </Col>
        ))}
      </Row>

      <Divider />

      {/* 话题热度分析 */}
      <Title level={3}>
        <BarChartOutlined /> {t('home.topicAnalysis')}
      </Title>
      <Card style={{ marginBottom: '32px' }}>
        <Space orientation="vertical" style={{ width: '100%' }} size="middle">
          {report.topicHeat.map((topic: any) => (
            <div key={topic.topic}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <Text strong>{getLocalizedField(topic, 'topic', currentLanguage)}</Text>
                <Text>{topic.heat}%</Text>
              </div>
              <Progress percent={topic.heat} showInfo={false} />
            </div>
          ))}
        </Space>
      </Card>

      {/* 推荐阅读 */}
      <Title level={3}>
        <LinkOutlined /> {t('home.recommendedReading')}
      </Title>
      <Card>
        <Space orientation="vertical" style={{ width: '100%' }} size="middle">
          {report.recommendedReading.map((item: any, index: number) => (
            <div
              key={index}
              style={{
                padding: index < report.recommendedReading.length - 1 ? '0 0 16px 0' : '0',
                borderBottom: index < report.recommendedReading.length - 1 ? '1px solid #f0f0f0' : 'none'
              }}
            >
              <a
                href={item.url}
                target="_blank"
                rel="noopener noreferrer"
                style={{ fontSize: '16px', fontWeight: 500, color: '#1890ff' }}
              >
                {getLocalizedField(item, 'title', currentLanguage)}
              </a>
              <div style={{ marginTop: '8px' }}>
                <Text type="secondary">By {item.author}</Text>
              </div>
              <div style={{ marginTop: '4px' }}>
                <Text>{getLocalizedField(item, 'reason', currentLanguage)}</Text>
              </div>
            </div>
          ))}
        </Space>
      </Card>

      {/* 全屏遮罩Loading */}
      <CoolLoading visible={refreshing} text={t('home.refreshingData')} />
    </div>
  );
};

export default Home;
