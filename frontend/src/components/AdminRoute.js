import React, { useContext } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../contexts/AuthContext';

// 管理员专用路由组件，用于限制非管理员用户访问管理页面
const AdminRoute = ({ children }) => {
  const { user, isAuthenticated, loading } = useContext(AuthContext);
  const location = useLocation();

  // 正在加载认证状态时显示加载提示
  if (loading) {
    return <div className="loading-container">加载中...</div>;
  }

  // 未登录或非管理员角色时重定向到首页
  if (!isAuthenticated || user.role !== 'admin') {
    return <Navigate to="/" state={{ from: location }} replace />;
  }

  // 管理员用户，显示子组件
  return children;
};

export default AdminRoute;