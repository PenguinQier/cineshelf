import React, { useContext } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import Search from './Search';
import '../styles/Header.css';
import { AuthContext } from '../contexts/AuthContext';

const Header = ({ onSearch }) => {
  const location = useLocation();
  const { pathname } = location;
  const { user, isAuthenticated, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  // 检查用户是否为管理员
  const isAdmin = isAuthenticated && user && user.role === 'admin';

  return (
    <header className="moviehub-header">
      <div className="header-container">
        <div className="header-left">
          <h1 className="logo">
            <Link to="/">MovieHub</Link>
          </h1>
          <nav className="main-nav">
            <Link to="/" className={`nav-link ${pathname === '/' ? 'active' : ''}`}>首页</Link>
            <Link to="/popular" className={`nav-link ${pathname === '/popular' ? 'active' : ''}`}>热门电影</Link>
            <Link to="/categories" className={`nav-link ${pathname === '/categories' ? 'active' : ''}`}>分类</Link>
            {isAuthenticated && (
              <Link to="/favorites" className={`nav-link ${pathname === '/favorites' ? 'active' : ''}`}>我的收藏</Link>
            )}
            {isAdmin && (
              <Link to="/upload" className={`nav-link ${pathname === '/upload' ? 'active' : ''}`}>上传电影</Link>
            )}
          </nav>
        </div>
        <div className="header-right">
          <div className="header-info">
            <Search onSearch={onSearch} />
          </div>
          <div className="auth-nav">
            {isAuthenticated ? (
              <div className="user-menu">
                <div className="user-avatar">
                  {user.avatar ? (
                    <img src={user.avatar} alt={user.username} />
                  ) : (
                    <div className="default-avatar">{user.username[0].toUpperCase()}</div>
                  )}
                  {user.viper && <span className="vip-indicator"><i className="fas fa-crown"></i></span>}
                  {isAdmin && <span className="admin-indicator"><i className="fas fa-shield-alt"></i></span>}
                </div>
                <div className="user-dropdown">
                  <div className="user-role">
                    {isAdmin && <span className="role-tag admin-tag">管理员</span>}
                    {!isAdmin && user.viper && <span className="role-tag vip-tag">VIP会员</span>}
                    {!isAdmin && !user.viper && <span className="role-tag user-tag">普通用户</span>}
                  </div>
                  <Link to="/profile" className="dropdown-item">个人资料</Link>
                  <Link to="/membership" className="dropdown-item">
                    会员中心
                    {user.viper && <span className="vip-tag">VIP</span>}
                  </Link>
                  <button onClick={handleLogout} className="dropdown-item logout-item">退出登录</button>
                </div>
              </div>
            ) : (
              <>
                <Link to="/login" className="auth-link">登录</Link>
                <Link to="/register" className="auth-button">注册</Link>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;