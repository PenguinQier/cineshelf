import React, { useState, useContext } from 'react';
import { AuthContext } from '../contexts/AuthContext';
import '../styles/Membership.css';

const Membership = () => {
  const { user, updateUser } = useContext(AuthContext);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');

  const handleVipStatusChange = async () => {
    setIsLoading(true);
    setError(null);
    setSuccessMessage('');

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('用户未登录');
      }

      const response = await fetch('http://localhost:5000/api/update-vip', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ viper: !user.viper })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || '更新VIP状态失败');
      }

      const data = await response.json();
      updateUser(data.user);
      setSuccessMessage(data.message);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="membership-container">
      <div className="membership-header">
        <h1>会员中心</h1>
        {user.viper ? (
          <div className="vip-status active">
            <i className="fas fa-crown"></i> 您已是VIP会员
          </div>
        ) : (
          <div className="vip-status">您还不是VIP会员</div>
        )}
      </div>

      {error && <div className="error-message">{error}</div>}
      {successMessage && <div className="success-message">{successMessage}</div>}

      <div className="vip-benefits">
        <h2>VIP会员权益</h2>
        <ul className="benefits-list">
          <li className="benefit-item">
            <i className="fas fa-film"></i>
            <div className="benefit-info">
              <h3>独享VIP专属内容</h3>
              <p>畅享所有VIP标记的热门影片，与普通用户看不同的世界</p>
            </div>
          </li>
          <li className="benefit-item">
            <i className="fas fa-download"></i>
            <div className="benefit-info">
              <h3>影片离线下载</h3>
              <p>支持热门影片下载到本地，随时随地离线观看</p>
            </div>
          </li>
          <li className="benefit-item">
            <i className="fas fa-thumbs-up"></i>
            <div className="benefit-info">
              <h3>高清画质</h3>
              <p>支持1080P甚至4K超高清观影体验，感受震撼视觉盛宴</p>
            </div>
          </li>
          <li className="benefit-item">
            <i className="fas fa-ad"></i>
            <div className="benefit-info">
              <h3>免广告打扰</h3>
              <p>看片无广告打扰，沉浸式观影体验</p>
            </div>
          </li>
        </ul>
      </div>

      <div className="vip-plans">
        <h2>会员套餐</h2>
        <div className="plans-container">
          <div className="plan-card">
            <div className="plan-header">月度会员</div>
            <div className="plan-price">¥15<span>/月</span></div>
            <ul className="plan-features">
              <li>所有VIP特权</li>
              <li>每月自动续费</li>
              <li>随时可取消</li>
            </ul>
          </div>

          <div className="plan-card recommended">
            <div className="plan-tag">超值</div>
            <div className="plan-header">年度会员</div>
            <div className="plan-price">¥128<span>/年</span></div>
            <ul className="plan-features">
              <li>所有VIP特权</li>
              <li>相当于¥10.7/月</li>
              <li>节省28%</li>
            </ul>
          </div>

          <div className="plan-card">
            <div className="plan-header">季度会员</div>
            <div className="plan-price">¥40<span>/季</span></div>
            <ul className="plan-features">
              <li>所有VIP特权</li>
              <li>每3个月自动续费</li>
              <li>相当于¥13.3/月</li>
            </ul>
          </div>
        </div>
      </div>

      <div className="vip-action">
        <button
          className={`vip-button ${user.viper ? 'cancel' : 'activate'}`}
          onClick={handleVipStatusChange}
          disabled={isLoading}
        >
          {isLoading ? '处理中...' : (user.viper ? '取消会员' : '立即开通VIP')}
        </button>
        <p className="vip-disclaimer">
          {user.viper ?
            '注意：取消会员后，您将无法访问VIP专属内容' :
            '* 本示例仅作演示用途，不会产生实际费用。点击按钮即可模拟开通VIP会员。'}
        </p>
      </div>
    </div>
  );
};

export default Membership;