import { useState, useEffect } from 'react';
import { Card, DatePicker, Row, Col, Tag, Alert, Empty, Typography, Progress, Spin } from 'antd';
import { CalendarOutlined, FireOutlined, BulbOutlined, BarChartOutlined, CheckCircleOutlined, WarningOutlined, FileTextOutlined, StarOutlined, CommentOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import { fetchHistoryReports, fetchReportByDate } from '../lib/api';
import CoolLoading from '../components/CoolLoading';
import type { DailyReport, Topic } from '../lib/analyzer';
import dayjs from 'dayjs';

const { Title, Text, Paragraph } = Typography;

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

// 图标转换函数
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

const History: React.FC = () => {
  const { t, i18n } = useTranslation();
  const currentLanguage = i18n.language;
  const [loading, setLoading] = useState(true);
  const [reportLoading, setReportLoading] = useState(false);
  const [dates, setDates] = useState<string[]>([]);
  const [selectedReport, setSelectedReport] = useState<DailyReport | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadHistoryDates();
  }, []);

  const loadHistoryDates = async () => {
    setLoading(true);
    try {
      const history = await fetchHistoryReports();
      setDates(history);
    } catch (err) {
      setError(t('home.refreshError'));
    } finally {
      setLoading(false);
    }
  };

  const handleDateSelect = async (date: dayjs.Dayjs | null) => {
    if (!date) return;

    setReportLoading(true);
    setError(null);
    try {
      const dateStr = date.format('YYYY-MM-DD');
      const report = await fetchReportByDate(dateStr);
      if (report) {
        setSelectedReport(report);
      } else {
        setError(t('history.noData'));
        setSelectedReport(null);
      }
    } catch (err) {
      setError(t('home.refreshError'));
    } finally {
      setReportLoading(false);
    }
  };

  // 初始加载时显示全屏loading
  if (loading) {
    return <CoolLoading visible={true} text={currentLanguage === 'zh' ? '正在加载历史数据...' : 'Loading History...'} />;
  }

  return (
    <div style={{ width: '100%' }}>
      {/* 页面标题和日期选择器 */}
      <div style={{ marginBottom: '32px' }}>
        <Title level={2} style={{ marginBottom: '8px' }}>
          <CalendarOutlined style={{ marginRight: '12px', color: '#1890ff' }} />
          {t('history.title')}
        </Title>
        <Paragraph type="secondary" style={{ fontSize: '16px', marginBottom: '24px' }}>
          {t('history.selectDate')}
        </Paragraph>

        <Card
          style={{
            borderRadius: '12px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
            border: '1px solid #f0f0f0'
          }}
        >
          <DatePicker
            style={{
              width: '100%'
            }}
            size="large"
            placeholder={t('history.selectDate')}
            onChange={handleDateSelect}
            disabledDate={(current) => {
              return !dates.includes(current.format('YYYY-MM-DD'));
            }}
            format="YYYY-MM-DD"
            showToday={false}
            suffixIcon={reportLoading ? <Spin size="small" /> : undefined}
          />
        </Card>
      </div>

      {error && (
        <Alert
          message={error}
          type="warning"
          showIcon
          closable
          onClose={() => setError(null)}
          style={{ marginBottom: '24px', borderRadius: '8px' }}
        />
      )}

      {reportLoading && !selectedReport ? (
        <Card
          style={{
            borderRadius: '12px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
            border: '1px solid #f0f0f0',
            textAlign: 'center',
            padding: '60px 24px'
          }}
        >
          <Spin size="large" />
          <div style={{ marginTop: '16px', color: '#8c8c8c' }}>
            {currentLanguage === 'zh' ? '正在加载报告...' : 'Loading report...'}
          </div>
        </Card>
      ) : selectedReport ? (
        <>
          {/* 统计卡片 */}
          <Row gutter={[16, 16]} style={{ marginBottom: '32px' }}>
            <Col xs={24} sm={8}>
              <Card
                style={{
                  borderRadius: '12px',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
                  border: '1px solid #f0f0f0'
                }}
              >
                <div style={{ textAlign: 'center', padding: '16px 8px' }}>
                  <FileTextOutlined style={{ fontSize: '32px', color: '#1890ff', marginBottom: '12px' }} />
                  <Title level={3} style={{ color: '#262626', marginBottom: '8px' }}>
                    {selectedReport.stats.totalPosts}
                  </Title>
                  <Text type="secondary" style={{ fontSize: '14px' }}>
                    {t('home.totalPosts')}
                  </Text>
                </div>
              </Card>
            </Col>
            <Col xs={24} sm={8}>
              <Card
                style={{
                  borderRadius: '12px',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
                  border: '1px solid #f0f0f0'
                }}
              >
                <div style={{ textAlign: 'center', padding: '16px 8px' }}>
                  <StarOutlined style={{ fontSize: '32px', color: '#faad14', marginBottom: '12px' }} />
                  <Title level={3} style={{ color: '#262626', marginBottom: '8px' }}>
                    {selectedReport.stats.highValuePosts}
                  </Title>
                  <Text type="secondary" style={{ fontSize: '14px' }}>
                    {t('home.highValuePosts')}
                  </Text>
                </div>
              </Card>
            </Col>
            <Col xs={24} sm={8}>
              <Card
                style={{
                  borderRadius: '12px',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
                  border: '1px solid #f0f0f0'
                }}
              >
                <div style={{ textAlign: 'center', padding: '16px 8px' }}>
                  <CommentOutlined style={{ fontSize: '32px', color: '#52c41a', marginBottom: '12px' }} />
                  <Title level={3} style={{ color: '#262626', marginBottom: '8px' }}>
                    {selectedReport.stats.totalComments}
                  </Title>
                  <Text type="secondary" style={{ fontSize: '14px' }}>
                    {t('home.totalComments')}
                  </Text>
                </div>
              </Card>
            </Col>
          </Row>

          {/* 报告日期标题 */}
          <div style={{ marginBottom: '24px' }}>
            <Title level={3} style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <BarChartOutlined style={{ color: '#52c41a' }} />
              {selectedReport.date}
            </Title>
            <Paragraph type="secondary" style={{ fontSize: '14px', marginTop: '8px', marginLeft: '36px' }}>
              {t('home.title')}
            </Paragraph>
          </div>

          {/* 话题卡片列表 */}
          <Row gutter={[16, 16]}>
            {selectedReport.topIssues.map((issue: Topic, index: number) => (
              <Col xs={24} md={12} key={issue.id}>
                <Card
                  hoverable
                  style={{
                    height: '100%',
                    borderRadius: '12px',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
                    border: '1px solid #f0f0f0',
                    transition: 'all 0.3s ease'
                  }}
                  styles={{
                    body: {
                      padding: '20px'
                    }
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.boxShadow = '0 4px 16px rgba(24, 144, 255, 0.15)';
                    e.currentTarget.style.transform = 'translateY(-2px)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.06)';
                    e.currentTarget.style.transform = 'translateY(0)';
                  }}
                >
                  {/* 排名和验证标签 */}
                  <div style={{ marginBottom: '12px' }}>
                    <Tag
                      color={index < 3 ? 'red' : index < 6 ? 'orange' : 'blue'}
                      style={{
                        fontSize: '14px',
                        padding: '4px 12px',
                        borderRadius: '6px'
                      }}
                    >
                      #{index + 1}
                    </Tag>
                    <Tag
                      color="green"
                      style={{
                        marginLeft: '8px',
                        fontSize: '12px',
                        padding: '4px 10px',
                        borderRadius: '6px'
                      }}
                    >
                      {getVerifiedIcon(issue.verified)}
                      {getVerifiedText(getLocalizedField(issue, 'verified', currentLanguage))}
                    </Tag>
                  </div>

                  {/* 标题 */}
                  <Text
                    strong
                    style={{
                      fontSize: '16px',
                      display: 'block',
                      marginBottom: '12px',
                      lineHeight: '1.5',
                      color: '#262626'
                    }}
                  >
                    {getLocalizedField(issue, 'title', currentLanguage)}
                  </Text>

                  {/* 描述 */}
                  <Paragraph
                    ellipsis={{ rows: 3 }}
                    style={{
                      marginBottom: '16px',
                      fontSize: '14px',
                      color: '#595959',
                      minHeight: '60px'
                    }}
                  >
                    {getLocalizedField(issue, 'description', currentLanguage)}
                  </Paragraph>

                  {/* 解决方案 */}
                  <div style={{ marginBottom: '16px' }}>
                    <div style={{ marginBottom: '8px' }}>
                      <Text strong style={{ fontSize: '13px', color: '#1890ff' }}>
                        <BulbOutlined style={{ marginRight: '4px', color: '#faad14' }} />
                        {t('home.solutions')}:
                      </Text>
                    </div>
                    <Text style={{ fontSize: '14px', color: '#595959', display: 'block' }}>
                      {getLocalizedField(issue, 'solution', currentLanguage)}
                    </Text>
                  </div>

                  {/* 热度 */}
                  <div style={{
                    paddingTop: '12px',
                    borderTop: '1px solid #f0f0f0',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between'
                  }}>
                    <Text strong style={{ fontSize: '12px', color: '#1890ff' }}>
                      <FireOutlined style={{ marginRight: '4px' }} />
                      {t('home.heat')}
                    </Text>
                    <Progress
                      percent={parseInt(issue.heatDisplay)}
                      size="small"
                      strokeColor={{
                        '0%': '#108ee9',
                        '100%': '#87d068'
                      }}
                      style={{ flex: 1, marginLeft: '16px' }}
                      showInfo={false}
                    />
                    <Text style={{ fontSize: '14px', fontWeight: 600, color: '#262626', marginLeft: '8px' }}>
                      {issue.heatDisplay}
                    </Text>
                  </div>
                </Card>
              </Col>
            ))}
          </Row>
        </>
      ) : (
        <Card
          style={{
            borderRadius: '12px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
            border: '1px solid #f0f0f0',
            textAlign: 'center',
            padding: '60px 24px'
          }}
        >
          <Empty
            image={Empty.PRESENTED_IMAGE_SIMPLE}
            description={
              <span style={{ fontSize: '16px', color: '#8c8c8c' }}>
                {t('history.selectDate')}
              </span>
            }
          />
        </Card>
      )}
    </div>
  );
};

export default History;
