import { useState } from 'react';
import { BrowserRouter, Routes, Route, Link, useLocation } from 'react-router-dom';
import { ConfigProvider, Layout, Menu, Space, Button } from 'antd';
import zhCN from 'antd/locale/zh_CN';
import enUS from 'antd/locale/en_US';
import { HomeOutlined, HistoryOutlined, LineChartOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import './i18n';
import './App.css';
import CoolLoading from './components/CoolLoading';
import Home from './pages/Home';
import History from './pages/History';
import Trends from './pages/Trends';
import 'antd/dist/reset.css';

const { Header, Content, Footer } = Layout;

function AppContent() {
  const { t, i18n } = useTranslation();
  const location = useLocation();
  const [langChanging, setLangChanging] = useState(false);

  const changeLanguage = async () => {
    setLangChanging(true);
    const newLang = i18n.language === 'zh' ? 'en' : 'zh';

    // 添加延迟以显示loading动画
    await new Promise(resolve => setTimeout(resolve, 1000));

    i18n.changeLanguage(newLang);
    localStorage.setItem('language', newLang);

    setTimeout(() => {
      setLangChanging(false);
    }, 300);
  };

  const menuItems = [
    {
      key: '/',
      icon: <HomeOutlined />,
      label: <Link to="/">{t('nav.home')}</Link>
    },
    {
      key: '/history',
      icon: <HistoryOutlined />,
      label: <Link to="/history">{t('nav.history')}</Link>
    },
    {
      key: '/trends',
      icon: <LineChartOutlined />,
      label: <Link to="/trends">{t('nav.trends')}</Link>
    }
  ];

  return (
    <ConfigProvider locale={i18n.language === 'zh' ? zhCN : enUS}>
      <Layout style={{ height: '100vh', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <Header style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: window.innerWidth < 768 ? '0 16px' : '0 24px',
          background: 'linear-gradient(135deg, #1890ff 0%, #096dd9 100%)',
          boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
          flexShrink: 0,
          height: window.innerWidth < 768 ? '56px' : '64px'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            flex: window.innerWidth < 768 ? '0 1 auto' : 1,
            minWidth: 0,
            overflow: 'hidden'
          }}>
            <div style={{
              color: 'white',
              fontSize: window.innerWidth < 768 ? '16px' : '20px',
              fontWeight: 'bold',
              marginRight: window.innerWidth < 768 ? '12px' : '40px',
              whiteSpace: 'nowrap',
              display: 'flex',
              alignItems: 'center',
              gap: window.innerWidth < 768 ? '6px' : '8px',
              flexShrink: 0
            }}>
              <img
                src="/favicon.svg"
                alt="🦞"
                style={{
                  width: window.innerWidth < 768 ? '28px' : '32px',
                  height: window.innerWidth < 768 ? '28px' : '32px'
                }}
              />
              <span style={{ display: window.innerWidth < 576 ? 'none' : 'inline', fontSize: window.innerWidth < 768 ? '15px' : '20px' }}>
                Moltbook
              </span>
            </div>
            <Menu
              theme="dark"
              mode="horizontal"
              selectedKeys={[location.pathname]}
              items={menuItems}
              style={{
                flex: 1,
                minWidth: 0,
                borderBottom: 'none',
                background: 'transparent',
                fontSize: window.innerWidth < 768 ? '14px' : '16px'
              }}
            />
          </div>
          <Space size={window.innerWidth < 768 ? 'small' : 'middle'}>
            {/* 语言切换按钮 */}
            <Button
              type="text"
              size={window.innerWidth < 768 ? 'middle' : 'large'}
              onClick={changeLanguage}
              disabled={langChanging}
              style={{
                color: 'white',
                display: 'flex',
                alignItems: 'center',
                gap: window.innerWidth < 768 ? '6px' : '8px',
                padding: window.innerWidth < 768 ? '4px 12px' : '6px 16px',
                borderRadius: '20px',
                background: langChanging ? 'rgba(24, 144, 255, 0.3)' : 'rgba(255,255,255,0.1)',
                transition: 'all 0.3s ease',
                fontWeight: 500,
                border: langChanging ? '1px solid rgba(24, 144, 255, 0.5)' : 'none',
                outline: 'none',
                cursor: langChanging ? 'default' : 'pointer',
                opacity: langChanging ? 0.8 : 1,
                height: window.innerWidth < 768 ? '36px' : 'auto'
              }}
              onMouseEnter={(e) => {
                if (!langChanging) {
                  e.currentTarget.style.background = 'rgba(255,255,255,0.2)';
                  e.currentTarget.style.transform = 'translateY(-2px)';
                }
              }}
              onMouseLeave={(e) => {
                if (!langChanging) {
                  e.currentTarget.style.background = 'rgba(255,255,255,0.1)';
                  e.currentTarget.style.transform = 'translateY(0)';
                }
              }}
              onFocus={(e) => {
                e.currentTarget.style.outline = 'none';
                e.currentTarget.style.boxShadow = 'none';
              }}
            >
              <svg
                width={window.innerWidth < 768 ? 20 : 24}
                height={window.innerWidth < 768 ? 13 : 16}
                viewBox="0 0 24 16"
                style={{ display: 'block', borderRadius: '2px' }}
              >
                {i18n.language === 'zh' ? (
                  // 中国国旗
                  <>
                    <rect width="24" height="16" fill="#de2910"/>
                    <polygon points="4,2 5,5 8,5 6,7 7,10 4,8 1,10 2,7 0,5 3,5" fill="#ffde00"/>
                  </>
                ) : (
                  // 美国国旗
                  <>
                    <rect width="24" height="16" fill="#b22234"/>
                    <rect y="1.23" width="24" height="1.23" fill="#fff"/>
                    <rect y="3.69" width="24" height="1.23" fill="#fff"/>
                    <rect y="6.15" width="24" height="1.23" fill="#fff"/>
                    <rect y="8.62" width="24" height="1.23" fill="#fff"/>
                    <rect y="11.08" width="24" height="1.23" fill="#fff"/>
                    <rect y="13.54" width="24" height="1.23" fill="#fff"/>
                    <rect width="9.23" height="8.62" fill="#3c3b6e"/>
                  </>
                )}
              </svg>
              <span style={{ fontSize: window.innerWidth < 768 ? '13px' : '14px', display: window.innerWidth < 576 ? 'none' : 'inline' }}>
                {i18n.language === 'zh' ? '中文' : 'EN'}
              </span>
            </Button>
          </Space>
        </Header>
        <Content style={{
          padding: window.innerWidth < 768 ? '16px' : '32px',
          paddingTop: window.innerWidth < 768 ? '24px' : '40px',
          maxWidth: '100%',
          background: '#f0f2f5',
          flex: 1,
          overflowY: 'auto',
          display: 'flex',
          flexDirection: 'column'
        }}>
          <div style={{ maxWidth: '1400px', margin: '0 auto', width: '100%', flex: 1 }}>
            <div key={location.pathname} className="page-transition">
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/history" element={<History />} />
                <Route path="/trends" element={<Trends />} />
              </Routes>
            </div>
          </div>
        </Content>
        <Footer style={{
          textAlign: 'center',
          padding: '16px',
          background: '#fff',
          borderTop: '1px solid #f0f0f0'
        }}>
          Moltbook Analyzer ©{new Date().getFullYear()} Built with 🦞 by AI Agents
        </Footer>

        {/* 全屏遮罩Loading */}
        <CoolLoading visible={langChanging} text={i18n.language === 'zh' ? '正在切换语言...' : 'Switching Language...'} />
      </Layout>
    </ConfigProvider>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  );
}

export default App;
