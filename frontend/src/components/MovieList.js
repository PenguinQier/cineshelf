import React, { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../contexts/AuthContext';
import MovieCard from './MovieCard';
import '../styles/MovieList.css';

const MovieList = ({ movies }) => {
  const [favorites, setFavorites] = useState([]);
  const [loadingFavorites, setLoadingFavorites] = useState({});
  const [movieStats, setMovieStats] = useState({});
  const { isAuthenticated } = useContext(AuthContext);

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

  // 获取收藏列表
  useEffect(() => {
    const fetchFavorites = async () => {
      if (!isAuthenticated) {
        setFavorites([]);
        return;
      }

      try {
        const response = await fetch('http://localhost:5000/api/favorites', {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });

        if (!response.ok) {
          throw new Error('获取收藏列表失败');
        }

        const data = await response.json();
        // 确保我们存储的是收藏电影的数组
        setFavorites(data.favorites || []);
      } catch (error) {
        console.error('获取收藏列表失败:', error);
        setFavorites([]);
      }
    };

    fetchFavorites();
  }, [isAuthenticated]);

  // 批量获取电影统计数据
  useEffect(() => {
    const fetchMovieStats = async () => {
      if (!movies || movies.length === 0) return;

      try {
        // 提取所有电影ID
        const movieIds = movies.map(movie => movie.id);

        const response = await fetch('http://localhost:5000/api/stats/movies/batch', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ movieIds })
        });

        if (!response.ok) {
          throw new Error('批量获取电影统计数据失败');
        }

        const data = await response.json();

        // 将结果转换为以电影ID为键的对象
        const statsMap = {};
        if (data.stats && Array.isArray(data.stats)) {
          data.stats.forEach(stat => {
            statsMap[stat.movieId] = {
              favorites: stat.favorites,
              comments: stat.comments
            };
          });
        }

        setMovieStats(statsMap);
      } catch (error) {
        console.error('批量获取电影统计数据错误:', error);
      }
    };

    fetchMovieStats();
  }, [movies]);

  // 检查电影是否被收藏
  const isFavorited = (movieId) => {
    return Array.isArray(favorites) && favorites.some(fav => fav.id === movieId);
  };

  // 收藏/取消收藏电影
  const handleToggleFavorite = async (event, movieId, movieTitle) => {
    event.preventDefault(); // 阻止链接跳转
    event.stopPropagation(); // 阻止事件冒泡

    if (!isAuthenticated) {
      alert('请先登录后再收藏电影');
      return;
    }

    setLoadingFavorites(prev => ({ ...prev, [movieId]: true }));

    try {
      if (isFavorited(movieId)) {
        // 取消收藏
        const response = await fetch(`http://localhost:5000/api/favorites/${movieId}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });

        if (!response.ok) {
          throw new Error('取消收藏失败');
        }

        setFavorites(favorites.filter(fav => fav.id !== movieId));
        alert(`已成功取消收藏《${movieTitle}》`);
      } else {
        // 添加收藏
        const response = await fetch(`http://localhost:5000/api/favorites/${movieId}`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });

        if (!response.ok) {
          throw new Error('添加收藏失败');
        }

        // 获取最新收藏列表
        const favResponse = await fetch('http://localhost:5000/api/favorites', {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });

        if (favResponse.ok) {
          const data = await favResponse.json();
          setFavorites(data.favorites || []);
        }

        alert(`已成功收藏《${movieTitle}》`);
      }
    } catch (error) {
      console.error('收藏操作失败:', error);
      alert(error.message);
    } finally {
      setLoadingFavorites(prev => ({ ...prev, [movieId]: false }));
    }
  };

  if (!movies || movies.length === 0) {
    return <div className="no-movies-found">未找到电影</div>;
  }

  return (
    <div className="movie-grid">
      {movies.map(movie => (
        <div key={movie.id} className="movie-grid-item">
          <MovieCard
            movie={movie}
            stats={movieStats[movie.id] || { favorites: 0, comments: 0 }}
          />
              {isAuthenticated && (
            <button
              className={`favorite-btn ${isFavorited(movie.id) ? 'favorited' : ''}`}
                  onClick={(e) => handleToggleFavorite(e, movie.id, movie.title)}
              disabled={loadingFavorites[movie.id]}
                >
                  {loadingFavorites[movie.id] ? (
                    <i className="fas fa-spinner fa-spin"></i>
              ) : isFavorited(movie.id) ? (
                <><i className="fas fa-heart"></i> 已收藏</>
              ) : (
                <><i className="far fa-heart"></i> 收藏</>
              )}
            </button>
          )}
        </div>
      ))}
    </div>
  );
};

export default MovieList;