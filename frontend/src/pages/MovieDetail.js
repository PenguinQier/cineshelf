import React, { useState, useEffect, useMemo, useContext } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../contexts/AuthContext';
import Comments from '../components/Comments';
import '../styles/MovieDetail.css';

const MovieDetail = () => {
  const { id } = useParams();
  const [movie, setMovie] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editFormData, setEditFormData] = useState({});
  const [isFavorite, setIsFavorite] = useState(false);
  const [favoriteLoading, setFavoriteLoading] = useState(false);
  const navigate = useNavigate();
  const { user, isAuthenticated } = useContext(AuthContext);

  // 电影类型映射表 - 中英文对照，使用useMemo避免重新创建
  const typeMapping = useMemo(() => ({
    'movie': '电影',
    'series': '剧集',
    'episode': '单集',
    'anime': '动漫',
    'variety': '综艺',
    'documentary': '纪录片',
    'children': '少儿',
    'shortVideo': '短剧'
  }), []);

  // 检查用户是否有权限观看视频
  const canWatchVideo = useMemo(() => {
    if (!movie || !movie.video) return false;
    if (!movie.vip) return true; // 非VIP电影所有人都可以看
    return isAuthenticated && user && user.viper; // VIP电影只有VIP用户可以看
  }, [movie, user, isAuthenticated]);

  // 检查用户是否为管理员
  const isAdmin = useMemo(() => {
    return isAuthenticated && user && user.role === 'admin';
  }, [user, isAuthenticated]);

  useEffect(() => {
    const fetchMovieDetail = async () => {
      // 如果id不存在或无效，则返回首页
      if (!id || id === 'undefined') {
        console.error('无效的电影ID');
        setError('无效的电影ID');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        // 请求后端API，后端会使用此id查询数据库中的id字段
        const response = await fetch(`http://localhost:5000/api/movies/${id}`);

        if (!response.ok) {
          throw new Error('电影详情获取失败');
        }

        const data = await response.json();
        if (!data) {
          throw new Error('未找到电影数据');
        }

        setMovie(data);
        setEditFormData(data);

        // 设置页面标题
        document.title = `${data.title} (${data.year}) - 电影详情`;
      } catch (err) {
        console.error('获取电影详情错误:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchMovieDetail();

    // 组件卸载时重置页面标题
    return () => {
      document.title = 'MovieHub';
    };
  }, [id]);

  // 检查电影是否在收藏列表中
  useEffect(() => {
    const checkFavoriteStatus = async () => {
      if (!isAuthenticated || !id) return;

      try {
        const response = await fetch('http://localhost:5000/api/favorites', {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });

        if (!response.ok) {
          throw new Error('获取收藏状态失败');
        }

        const data = await response.json();
        // 确保我们使用正确的数据结构，后端返回的是{favorites: [...]}
        const favorites = data.favorites || [];
        // 使用电影ID进行匹配，注意API返回的电影ID字段是id而不是_id
        const isFav = Array.isArray(favorites) && favorites.some(fav => fav.id === Number(id));
        setIsFavorite(isFav);
      } catch (err) {
        console.error('检查收藏状态失败:', err);
      }
    };

    checkFavoriteStatus();
  }, [id, isAuthenticated]);

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmitEdit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`http://localhost:5000/api/movies/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(editFormData)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || '更新电影失败');
      }

      const updatedMovie = await response.json();
      setMovie(updatedMovie);
      setIsEditing(false);
      alert('电影信息更新成功!');
    } catch (err) {
      alert(`更新失败: ${err.message}`);
    }
  };

  const handleDeleteMovie = async () => {
    if (window.confirm('确定要删除这部电影吗？此操作不可撤销。')) {
      try {
        const response = await fetch(`http://localhost:5000/api/movies/${id}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || '删除电影失败');
        }

        alert('电影已成功删除!');
        navigate('/'); // 删除后返回首页
      } catch (err) {
        alert(`删除失败: ${err.message}`);
      }
    }
  };

  // 添加收藏功能
  const handleToggleFavorite = async () => {
    if (!isAuthenticated) {
      // 如果用户未登录，重定向到登录页面
      navigate('/login', { state: { from: `/movie/${id}` } });
      return;
    }

    setFavoriteLoading(true);
    try {
      if (isFavorite) {
        // 取消收藏
        const response = await fetch(`http://localhost:5000/api/favorites/${id}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });

        if (!response.ok) {
          throw new Error('取消收藏失败');
        }

        setIsFavorite(false);
        alert(`已成功取消收藏《${movie.title}》`);
      } else {
        // 添加收藏
        const response = await fetch(`http://localhost:5000/api/favorites/${id}`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });

        if (!response.ok) {
          throw new Error('添加收藏失败');
        }

        setIsFavorite(true);
        alert(`已成功收藏《${movie.title}》`);
      }
    } catch (err) {
      console.error('收藏操作失败:', err);
      alert(err.message);
    } finally {
      setFavoriteLoading(false);
    }
  };

  // 修改电影标签的渲染，确保使用唯一的key
  const renderGenres = (genres) => {
    if (!genres) return null;

    if (typeof genres === 'string') {
      return genres.split(',').map((genre, index) => (
        <span key={`genre-${id}-${index}-${genre.trim()}`} className="movie-tag">{genre.trim()}</span>
      ));
    } else {
      return genres.map((genre, index) => (
        <span key={`genre-${id}-${index}-${genre}`} className="movie-tag">{genre}</span>
      ));
    }
  };

  if (loading) {
    return <div className="loading">加载中...</div>;
  }

  if (error) {
    return <div className="error">错误: {error}</div>;
  }

  if (!movie) {
    return <div className="not-found">电影未找到</div>;
  }

  // 编辑表单
  if (isEditing) {
    return (
      <div className="movie-edit-container">
        <h2 className="edit-title">编辑电影: {movie.title}</h2>
        <form onSubmit={handleSubmitEdit} className="edit-form">
          <div className="form-group">
            <label>电影标题</label>
            <input
              type="text"
              name="title"
              value={editFormData.title || ''}
              onChange={handleEditChange}
              required
            />
          </div>

          <div className="form-group">
            <label>上映年份</label>
            <input
              type="number"
              name="year"
              value={editFormData.year || ''}
              onChange={handleEditChange}
              min="1900"
              max={new Date().getFullYear()}
              required
            />
          </div>

          <div className="form-group">
            <label>IMDb ID</label>
            <input
              type="text"
              name="imdbID"
              value={editFormData.imdbID || ''}
              onChange={handleEditChange}
            />
          </div>

          <div className="form-group">
            <label>评分 (0-10)</label>
            <input
              type="number"
              name="rating"
              value={editFormData.rating || '0'}
              onChange={handleEditChange}
              min="0"
              max="10"
              step="0.1"
            />
          </div>

          <div className="form-group">
            <label>类型</label>
            <select
              name="type"
              value={editFormData.type || 'movie'}
              onChange={handleEditChange}
              required
            >
              <option value="movie">电影</option>
              <option value="series">剧集</option>
              <option value="episode">单集</option>
              <option value="anime">动漫</option>
              <option value="variety">综艺</option>
              <option value="documentary">纪录片</option>
              <option value="children">少儿</option>
              <option value="shortVideo">短剧</option>
            </select>
          </div>

          <div className="form-group">
            <label>电影分类</label>
            <input
              type="text"
              name="genres"
              value={editFormData.genres || ''}
              onChange={handleEditChange}
              placeholder="例如: 科幻,冒险,动作 (多个分类用逗号分隔)"
            />
            <small className="hint-text">多个分类用逗号分隔，例如：科幻,冒险,动作</small>
          </div>

          <div className="form-group">
            <label>电影简介</label>
            <textarea
              name="description"
              value={editFormData.description || ''}
              onChange={handleEditChange}
              rows="6"
              placeholder="请输入电影简介..."
            ></textarea>
          </div>

          <div className="form-group">
            <label>VIP专享</label>
            <select
              name="vip"
              value={editFormData.vip ? 'true' : 'false'}
              onChange={handleEditChange}
            >
              <option value="false">否</option>
              <option value="true">是</option>
            </select>
          </div>

          <div className="form-actions">
            <button type="submit" className="save-btn">保存更改</button>
            <button type="button" className="cancel-btn" onClick={() => setIsEditing(false)}>取消</button>
          </div>
        </form>
      </div>
    );
  }

  // 电影详情页面
  return (
    <div className="movie-detail-container">
      <div className="movie-detail-header">
        <div className="movie-poster">
          <img src={movie.poster} alt={movie.title} />
          <div className="movie-poster-badges">
            {movie.video && (
              <span className="movie-poster-badge">
                <i className="fa fa-play-circle"></i> 可播放
              </span>
            )}
            {movie.vip && (
              <span className="movie-poster-badge vip-badge">
                <i className="fas fa-crown"></i> VIP
              </span>
            )}
          </div>
        </div>
        <div className="movie-info">
          <h1 className="movie-title">{movie.title}</h1>

          <div className="movie-tags">
            <span className="movie-tag">{movie.year}</span>
            <span className="movie-tag">{typeMapping[movie.type] || movie.type}</span>
            {movie.imdbID && <span className="movie-tag">IMDb: {movie.imdbID}</span>}
            {movie.genres && renderGenres(movie.genres)}
          </div>

          <div className="movie-meta">
            <span className="movie-meta-item">
              <i className="fa fa-calendar"></i> 上映年份: {movie.year}
            </span>
            <span className="movie-meta-item">
              <i className="fa fa-film"></i> 类型: {typeMapping[movie.type] || movie.type}
            </span>
            {movie.rating && parseFloat(movie.rating) > 0 && (
              <span className="movie-meta-item movie-rating">
                <i className="fa fa-star"></i> 评分: {movie.rating}
              </span>
            )}
            <span className="movie-meta-item">
              <i className="fa fa-id-card"></i> IMDb ID: {movie.imdbID || 'N/A'}
            </span>
            {movie.genres && (
              <span className="movie-meta-item">
                <i className="fa fa-tags"></i> 分类: {typeof movie.genres === 'string' ? movie.genres : movie.genres.join(', ')}
              </span>
            )}
            {movie.vip && (
              <span className="movie-meta-item vip-meta">
                <i className="fas fa-crown"></i> VIP专享
              </span>
            )}
          </div>

          {movie.description && (
            <div className="movie-description-box">
              <h3 className="movie-section-subtitle">简介</h3>
              <p className="movie-description-text">{movie.description}</p>
            </div>
          )}

          <div className="movie-actions">
            <Link to="/" className="movie-back-button">
              <i className="fa fa-arrow-left"></i> 返回列表
            </Link>
            {isAuthenticated && (
              <button
                onClick={handleToggleFavorite}
                className={`movie-favorite-button ${isFavorite ? 'is-favorite' : ''}`}
                disabled={favoriteLoading}
              >
                <i className={`${isFavorite ? 'fas' : 'far'} fa-heart`}></i>
                {favoriteLoading ? '处理中...' : isFavorite ? '已收藏' : '收藏'}
              </button>
            )}
            {movie.video && canWatchVideo && (
              <a href="#watch-movie" className="movie-watch-button">
                <i className="fa fa-play"></i> 立即观看
              </a>
            )}
            {movie.video && movie.vip && !canWatchVideo && (
              <Link to="/membership" className="movie-vip-button">
                <i className="fas fa-crown"></i> 开通VIP即可观看
              </Link>
            )}
            {isAdmin && (
              <>
                <button onClick={() => setIsEditing(true)} className="movie-edit-button">
                  <i className="fa fa-edit"></i> 编辑电影
                </button>
                <button onClick={handleDeleteMovie} className="movie-delete-button">
                  <i className="fa fa-trash"></i> 删除电影
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {movie.video && canWatchVideo && (
        <div id="watch-movie" className="movie-video-section">
          <h2 className="movie-section-title">
            <i className="fa fa-film"></i> 观看 "{movie.title}"
          </h2>
          <div className="video-container">
            <video
              src={movie.video}
              controls
              poster={movie.poster}
              className="movie-video-player"
              preload="metadata"
            >
              您的浏览器不支持视频播放
            </video>
          </div>
        </div>
      )}

      {movie.video && movie.vip && !canWatchVideo && (
        <div className="vip-upgrade-section">
          <div className="vip-upgrade-content">
            <i className="fas fa-crown vip-crown-icon"></i>
            <h2>VIP专享内容</h2>
            <p>该视频仅对VIP会员开放观看</p>
            <Link to="/membership" className="vip-upgrade-btn">立即开通VIP</Link>
            <p className="vip-benefits-hint">开通VIP即可享受全站无限畅看特权</p>
          </div>
        </div>
      )}

      {/* 评论区 */}
      <Comments movieId={id} />

      <div className="movie-detail-footer">
        <Link to="/" className="btn movie-back-button-alt">
          <i className="fa fa-home"></i> 返回首页
        </Link>
      </div>
    </div>
  );
};

export default MovieDetail;