import React, { useContext } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../contexts/AuthContext';

// 受保护的路由组件，用于限制未登录用户访问需要权限的页面
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useContext(AuthContext);
  const location = useLocation();

  // 正在加载认证状态时显示加载提示
  if (loading) {
    return <div className="loading-container">加载中...</div>;
  }

  // 未登录时重定向到登录页面，并记录当前位置以便登录后跳转回来
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // 已登录用户，显示子组件
  return children;
};

export default ProtectedRoute;