import React, { createContext, useState, useEffect } from 'react';

// 创建认证上下文
export const AuthContext = createContext();

// 认证上下文提供者组件
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token') || '');
  const [loading, setLoading] = useState(true);

  // 初始化时检查是否有保存的token，如果有则获取用户信息
  useEffect(() => {
    const initAuth = async () => {
      if (token) {
        try {
          const response = await fetch('http://localhost:5000/api/user', {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          });

          if (response.ok) {
            const data = await response.json();
            setUser(data.user);
          } else {
            // token无效，清除本地存储
            logout();
          }
        } catch (error) {
          console.error('获取用户信息失败:', error);
          logout();
        }
      }
      setLoading(false);
    };

    initAuth();
  }, [token]);

  // 登录方法
  const login = (newToken, userData) => {
    localStorage.setItem('token', newToken);
    setToken(newToken);
    setUser(userData);
  };

  // 注销方法
  const logout = () => {
    localStorage.removeItem('token');
    setToken('');
    setUser(null);
  };

  // 更新用户信息
  const updateUser = (userData) => {
    setUser(userData);
  };

  // 检查用户是否已登录
  const isAuthenticated = !!user;

  // 提供的上下文值
  const contextValue = {
    user,
    token,
    loading,
    login,
    logout,
    updateUser,
    isAuthenticated
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthProvider;