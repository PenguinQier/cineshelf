import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import '../styles/MovieCard.css';

const MovieCard = ({ movie, stats }) => {
  const [movieStats, setMovieStats] = useState({ favorites: 0, comments: 0 });
  const [isLoading, setIsLoading] = useState(false);

  // 电影类型映射表 - 中英文对照
  const typeMapping = {
    'movie': '电影',
    'series': '剧集',
    'episode': '单集',
    'anime': '动漫',
    'variety': '综艺',
    'documentary': '纪录片',
    'children': '少儿',
    'shortVideo': '短剧'
  };

  // 如果外部传入了stats，则使用外部数据，否则单独请求
  useEffect(() => {
    if (stats) {
      setMovieStats(stats);
    } else {
      fetchMovieStats();
    }
  }, [stats, movie]);

  // 获取电影的统计数据
  const fetchMovieStats = async () => {
    if (!movie || !movie.id) return;

    setIsLoading(true);
    try {
      const response = await fetch(`http://localhost:5000/api/stats/movie/${movie.id}`);

      if (!response.ok) {
        throw new Error('获取电影统计数据失败');
      }

      const data = await response.json();
      setMovieStats({
        favorites: data.favorites || 0,
        comments: data.comments || 0
      });
    } catch (error) {
      console.error('获取电影统计数据错误:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // 格式化数字显示（大于1000显示为1k+等）
  const formatNumber = (num) => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M';
    }
    if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K';
    }
    return num;
  };

  return (
    <div className="movie-card">
      <Link to={`/movie/${movie.id}`} className="movie-link">
        <div className="movie-poster-container">
          {/* VIP标记 */}
          {movie.vip && (
            <div className="vip-badge">
              <i className="fas fa-crown"></i> VIP
            </div>
          )}

          <img
            src={movie.poster}
            alt={movie.title}
            className="movie-poster"
            onError={(e) => {
              e.target.src = '/default-poster.svg';
            }}
          />

          {/* 评分显示 */}
          {movie.rating > 0 && (
            <div className="movie-rating">
              {movie.rating}
            </div>
          )}

          {/* 可播放标记 */}
          {movie.video && (
            <span className="movie-video-badge">
              <i className="fas fa-play-circle"></i> 可播放
            </span>
          )}

          {/* 悬停遮罩 */}
          <div className="movie-poster-overlay">
            <div className="poster-overlay-bottom">
              <span className="view-details-btn">
                <i className="fas fa-info-circle"></i> 查看详情
              </span>
            </div>
          </div>
        </div>

        <div className="movie-info">
          <div className="movie-title-row">
            <h3 className="movie-title">{movie.title}</h3>
            <span className="movie-type-dot">•</span>
            <span className="movie-type">{typeMapping[movie.type] || movie.type}</span>
          </div>

          {movie.description && (
            <p className="movie-description">{movie.description.length > 60
              ? `${movie.description.substring(0, 60)}...`
              : movie.description}
            </p>
          )}

          <div className="movie-meta">
          {movie.genres && (
            <div className="movie-tags">
              {(typeof movie.genres === 'string' ?
                movie.genres.split(',').slice(0, 2).map((genre, index, array) => (
                    <React.Fragment key={`${movie.id}-genre-${index}-${genre}`}>
                    <span className="movie-tag">{genre.trim()}</span>
                    {index < array.length - 1 && <span className="tag-separator">/</span>}
                  </React.Fragment>
                ))
                :
                movie.genres.slice(0, 2).map((genre, index, array) => (
                    <React.Fragment key={`${movie.id}-genre-${index}-${genre}`}>
                    <span className="movie-tag">{genre}</span>
                    {index < array.length - 1 && <span className="tag-separator">/</span>}
                  </React.Fragment>
                ))
              )}
            </div>
          )}

            {/* 收藏数和评论数 */}
            <div className="movie-stats">
              <span className="stat-item" title="收藏数">
                <i className="fas fa-heart"></i> {!isLoading ? formatNumber(movieStats.favorites) : '-'}
              </span>
              <span className="stat-item" title="评论数">
                <i className="fas fa-comment"></i> {!isLoading ? formatNumber(movieStats.comments) : '-'}
              </span>
            </div>
          </div>
        </div>
      </Link>
    </div>
  );
};

export default MovieCard;