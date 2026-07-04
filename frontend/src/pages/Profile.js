import React, { useState, useContext, useEffect } from 'react';
import { AuthContext } from '../contexts/AuthContext';
import '../styles/Profile.css';

const Profile = () => {
  const { user, token, updateUser, logout } = useContext(AuthContext);
  const [activeTab, setActiveTab] = useState('info');
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    avatar: null
  });
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [favorites, setFavorites] = useState([]);
  const [isFetching, setIsFetching] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // 初始化表单数据
  useEffect(() => {
    if (user) {
      setFormData({
        username: user.username || '',
        email: user.email || '',
        avatar: null
      });
      if (user.avatar) {
        setAvatarPreview(user.avatar);
      }
    }
  }, [user]);

  // 获取收藏的电影
  useEffect(() => {
    const fetchFavorites = async () => {
      if (!token) return;

      setIsFetching(true);
      try {
        const response = await fetch(`http://localhost:5000/api/favorites?page=${page}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (!response.ok) {
          throw new Error('获取收藏电影失败');
        }

        const data = await response.json();
        setFavorites(data.favorites);
        setTotalPages(data.totalPages);
      } catch (err) {
        setError(err.message);
      } finally {
        setIsFetching(false);
      }
    };

    if (activeTab === 'favorites') {
      fetchFavorites();
    }
  }, [token, activeTab, page]);

  // 处理表单输入变化
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // 处理密码表单输入变化
  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // 处理头像文件选择
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData(prev => ({
        ...prev,
        avatar: file
      }));
      setAvatarPreview(URL.createObjectURL(file));
    }
  };

  // 提交个人信息更新
  const handleInfoSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');

    const data = new FormData();
    if (formData.username !== user.username) {
      data.append('username', formData.username);
    }
    if (formData.email !== user.email) {
      data.append('email', formData.email);
    }
    if (formData.avatar) {
      data.append('avatar', formData.avatar);
    }

    // 如果没有任何更改，不提交请求
    if ([...data.entries()].length === 0) {
      setMessage('没有更改任何信息');
      return;
    }

    try {
      const response = await fetch('http://localhost:5000/api/user', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: data
      });

      const responseData = await response.json();

      if (!response.ok) {
        throw new Error(responseData.error || '更新个人信息失败');
      }

      // 更新用户信息
      updateUser(responseData.user);
      setMessage('个人信息更新成功');
    } catch (err) {
      setError(err.message);
    }
  };

  // 提交密码更新
  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');

    // 验证密码是否匹配
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setError('两次输入的新密码不一致');
      return;
    }

    // 验证新密码长度
    if (passwordData.newPassword.length < 6) {
      setError('新密码长度不能少于6个字符');
      return;
    }

    try {
      const response = await fetch('http://localhost:5000/api/change-password', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          currentPassword: passwordData.currentPassword,
          newPassword: passwordData.newPassword
        })
      });

      const responseData = await response.json();

      if (!response.ok) {
        throw new Error(responseData.error || '修改密码失败');
      }

      // 清空密码表单
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });

      setMessage('密码修改成功');
    } catch (err) {
      setError(err.message);
    }
  };

  // 取消收藏电影
  const handleRemoveFavorite = async (movieId) => {
    try {
      const response = await fetch(`http://localhost:5000/api/favorites/${movieId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || '取消收藏失败');
      }

      // 从列表中移除该电影
      setFavorites(favorites.filter(movie => movie.id !== parseInt(movieId)));
    } catch (err) {
      setError(err.message);
    }
  };

  // 组件卸载时清理头像预览URL
  React.useEffect(() => {
    return () => {
      if (avatarPreview && avatarPreview.startsWith('blob:')) {
        URL.revokeObjectURL(avatarPreview);
      }
    };
  }, [avatarPreview]);

  if (!user) {
    return <div className="loading-container">加载中...</div>;
  }

  return (
    <div className="profile-container">
      <div className="profile-header">
        <div className="profile-avatar">
          {avatarPreview ? (
            <img src={avatarPreview} alt="用户头像" />
          ) : (
            <div className="default-avatar">{user.username[0].toUpperCase()}</div>
          )}
        </div>
        <div className="profile-info">
          <h2>{user.username}</h2>
          <p>{user.email}</p>
        </div>
      </div>

      <div className="profile-tabs">
        <button
          className={activeTab === 'info' ? 'active' : ''}
          onClick={() => setActiveTab('info')}
        >
          个人信息
        </button>
        <button
          className={activeTab === 'password' ? 'active' : ''}
          onClick={() => setActiveTab('password')}
        >
          修改密码
        </button>
        <button
          className={activeTab === 'favorites' ? 'active' : ''}
          onClick={() => setActiveTab('favorites')}
        >
          我的收藏
        </button>
      </div>

      {error && <div className="profile-error">{error}</div>}
      {message && <div className="profile-message">{message}</div>}

      {activeTab === 'info' && (
        <div className="profile-content">
          <form onSubmit={handleInfoSubmit} className="profile-form">
            <div className="form-group">
              <label htmlFor="username">用户名</label>
              <input
                type="text"
                id="username"
                name="username"
                value={formData.username}
                onChange={handleChange}
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="email">邮箱</label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="avatar">更换头像</label>
              <input
                type="file"
                id="avatar"
                name="avatar"
                onChange={handleFileChange}
                accept="image/*"
              />
            </div>
            <div className="form-buttons">
              <button type="submit" className="save-button">保存更改</button>
              <button type="button" className="logout-button" onClick={logout}>退出登录</button>
            </div>
          </form>
        </div>
      )}

      {activeTab === 'password' && (
        <div className="profile-content">
          <form onSubmit={handlePasswordSubmit} className="profile-form">
            <div className="form-group">
              <label htmlFor="currentPassword">当前密码</label>
              <input
                type="password"
                id="currentPassword"
                name="currentPassword"
                value={passwordData.currentPassword}
                onChange={handlePasswordChange}
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="newPassword">新密码</label>
              <input
                type="password"
                id="newPassword"
                name="newPassword"
                value={passwordData.newPassword}
                onChange={handlePasswordChange}
                required
                placeholder="至少6个字符"
              />
            </div>
            <div className="form-group">
              <label htmlFor="confirmPassword">确认新密码</label>
              <input
                type="password"
                id="confirmPassword"
                name="confirmPassword"
                value={passwordData.confirmPassword}
                onChange={handlePasswordChange}
                required
              />
            </div>
            <div className="form-buttons">
              <button type="submit" className="save-button">修改密码</button>
            </div>
          </form>
        </div>
      )}

      {activeTab === 'favorites' && (
        <div className="profile-content">
          {isFetching ? (
            <div className="loading-container">加载中...</div>
          ) : favorites.length > 0 ? (
            <>
              <div className="favorites-grid">
                {favorites.map(movie => (
                  <div key={movie.id} className="favorite-card">
                    <div className="favorite-poster">
                      <img
                        src={movie.poster}
                        alt={movie.title}
                        onError={(e) => {
                          e.target.src = 'https://via.placeholder.com/150x225?text=No+Poster';
                        }}
                      />
                      <button
                        className="remove-favorite"
                        onClick={() => handleRemoveFavorite(movie.id)}
                        title="取消收藏"
                      >
                        ×
                      </button>
                    </div>
                    <h4 className="favorite-title">{movie.title}</h4>
                    <p className="favorite-year">{movie.year}</p>
                  </div>
                ))}
              </div>

              {totalPages > 1 && (
                <div className="pagination">
                  <button
                    onClick={() => setPage(prev => Math.max(prev - 1, 1))}
                    disabled={page === 1}
                  >
                    上一页
                  </button>
                  <span>{page} / {totalPages}</span>
                  <button
                    onClick={() => setPage(prev => Math.min(prev + 1, totalPages))}
                    disabled={page === totalPages}
                  >
                    下一页
                  </button>
                </div>
              )}
            </>
          ) : (
            <div className="no-favorites">
              <p>您还没有收藏任何电影</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Profile;