import React from 'react';
import './CoolLoading.css';

interface CoolLoadingProps {
  visible?: boolean;
  text?: string;
}

const CoolLoading: React.FC<CoolLoadingProps> = ({ visible = false, text }) => {
  if (!visible) return null;

  return (
    <div className="cool-loading-overlay">
      <div className="cool-loading-backdrop" />
      <div className="cool-loading-content">
        <div className="cool-loading-wrapper">
          {/* Logo */}
          <img
            src="/favicon.svg"
            alt="Loading"
            className="cool-loading-logo"
          />

          {/* 外圈光环 */}
          <div className="cool-loading-ring ring-outer" />

          {/* 内圈光环 */}
          <div className="cool-loading-ring ring-inner" />

          {/* 粒子效果 */}
          <div className="cool-loading-particles">
            <div className="particle particle-1" />
            <div className="particle particle-2" />
            <div className="particle particle-3" />
            <div className="particle particle-4" />
          </div>
        </div>

        {text && <div className="cool-loading-text">{text}</div>}
      </div>
    </div>
  );
};

export default CoolLoading;
