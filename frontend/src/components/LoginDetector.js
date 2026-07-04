import React, { useState, useEffect } from 'react';

// 此组件仅用于开发环境中调试登录状态
const LoginDetector = () => {
  const [loginStatus, setLoginStatus] = useState({
    isLoggedIn: false,
    userExists: false,
    tokenExists: false,
    storageKeys: [],
    userInfo: null,
    tokenInfo: null
  });

  useEffect(() => {
    const checkLoginStatus = () => {
      // 获取所有localStorage键
      const keys = [];
      for (let i = 0; i < localStorage.length; i++) {
        keys.push(localStorage.key(i));
      }

      // 检查用户和令牌
      const userString = localStorage.getItem('user');
      const tokenString = localStorage.getItem('token');
      const authString = localStorage.getItem('auth');

      let user = null;
      if (userString) {
        try {
          user = JSON.parse(userString);
        } catch (e) {
          console.error('解析用户信息失败:', e);
        }
      }

      let token = tokenString;
      let auth = null;
      if (authString) {
        try {
          auth = JSON.parse(authString);
          if (!token && auth.token) {
            token = auth.token;
          }
        } catch (e) {
          console.error('解析认证信息失败:', e);
        }
      }

      setLoginStatus({
        isLoggedIn: Boolean(user || token),
        userExists: Boolean(user),
        tokenExists: Boolean(token),
        storageKeys: keys,
        userInfo: user,
        tokenInfo: token ? (typeof token === 'string' ? '(令牌存在)' : token) : null
      });
    };

    checkLoginStatus();

    // 监听存储变化事件
    window.addEventListener('storage', checkLoginStatus);
    return () => {
      window.removeEventListener('storage', checkLoginStatus);
    };
  }, []);

  // 仅在开发环境中显示
  if (process.env.NODE_ENV !== 'development') {
    return null;
  }

  return (
    <div style={{
      position: 'fixed',
      bottom: '10px',
      right: '10px',
      backgroundColor: 'rgba(0, 0, 0, 0.7)',
      color: 'white',
      padding: '10px',
      borderRadius: '5px',
      fontSize: '12px',
      zIndex: 9999,
      maxWidth: '300px',
      maxHeight: '200px',
      overflow: 'auto'
    }}>
      <h4 style={{ margin: '0 0 5px 0' }}>登录状态调试器</h4>
      <p style={{ margin: '2px 0' }}>
        登录状态: {loginStatus.isLoggedIn ? '已登录✅' : '未登录❌'}
      </p>
      <p style={{ margin: '2px 0' }}>
        用户信息: {loginStatus.userExists ? '存在✅' : '不存在❌'}
      </p>
      <p style={{ margin: '2px 0' }}>
        令牌: {loginStatus.tokenExists ? '存在✅' : '不存在❌'}
      </p>
      <details>
        <summary>LocalStorage 键值</summary>
        <ul style={{ margin: '5px 0', paddingLeft: '20px' }}>
          {loginStatus.storageKeys.map(key => (
            <li key={key}>{key}</li>
          ))}
        </ul>
      </details>
      {loginStatus.userInfo && (
        <details>
          <summary>用户信息</summary>
          <pre style={{ fontSize: '10px', maxHeight: '100px', overflow: 'auto' }}>
            {JSON.stringify(loginStatus.userInfo, null, 2)}
          </pre>
        </details>
      )}
    </div>
  );
};

export default LoginDetector;