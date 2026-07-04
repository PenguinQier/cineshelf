import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import MovieCard from '../components/MovieCard';
import '../styles/Favorites.css';

const Favorites = () => {
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalResults: 0
  });

  useEffect(() => {
    const fetchFavorites = async () => {
      try {
        setLoading(true);
        const response = await fetch(`http://localhost:5000/api/favorites?page=${pagination.currentPage}`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });

        if (!response.ok) {
          throw new Error('获取收藏列表失败');
        }

        const data = await response.json();
        // 从响应中提取收藏数组和分页信息
        setFavorites(data.favorites || []);
        setPagination({
          currentPage: data.currentPage || 1,
          totalPages: data.totalPages || 1,
          totalResults: data.totalResults || 0
        });
        setLoading(false);
      } catch (err) {
        setError('获取收藏列表失败，请稍后再试');
        setLoading(false);
        console.error('Error fetching favorites:', err);
      }
    };

    fetchFavorites();
  }, [pagination.currentPage]);

  const handleRemoveFavorite = async (movieId) => {
    try {
      const response = await fetch(`http://localhost:5000/api/favorites/${movieId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (!response.ok) {
        throw new Error('移除收藏失败');
      }

      // 找到要移除的电影标题
      const movieToRemove = favorites.find(movie => movie.id === movieId);
      const movieTitle = movieToRemove ? movieToRemove.title : '';

      // 从收藏列表中移除电影
      setFavorites(favorites.filter(movie => movie.id !== movieId));

      // 显示成功提示
      alert(`已成功从收藏中移除《${movieTitle}》`);
    } catch (err) {
      setError('移除收藏失败，请稍后再试');
      console.error('Error removing favorite:', err);

      // 显示错误提示
      alert('移除收藏失败，请稍后再试');
    }
  };

  const handlePageChange = (newPage) => {
    setPagination(prev => ({
      ...prev,
      currentPage: newPage
    }));
  };

  if (loading) {
    return (
      <div className="favorites-container">
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>加载中...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="favorites-container">
        <div className="error-message">
          <p>{error}</p>
          <button onClick={() => window.location.reload()}>重试</button>
        </div>
      </div>
    );
  }

  return (
    <div className="favorites-container">
      <div className="favorites-header">
        <h1>我的收藏</h1>
        <p>{pagination.totalResults > 0 ? `共${pagination.totalResults}部影片` : '暂无收藏'}</p>
      </div>

      {favorites.length === 0 ? (
        <div className="empty-favorites">
          <div className="empty-icon">
            <i className="far fa-heart"></i>
          </div>
          <h3>你还没有收藏任何电影</h3>
          <p>浏览电影并点击收藏按钮，将你喜欢的电影添加到这里</p>
          <Link to="/popular" className="browse-movies-btn">浏览热门电影</Link>
        </div>
      ) : (
        <>
          <div className="favorites-grid">
            {favorites.map(movie => (
              <div key={movie.id} className="favorite-item">
                <MovieCard movie={movie} />
                <button
                  className="remove-favorite-btn"
                  onClick={() => handleRemoveFavorite(movie.id)}
                >
                  <i className="fas fa-trash"></i> 取消收藏
                </button>
              </div>
            ))}
          </div>

          {pagination.totalPages > 1 && (
            <div className="pagination">
              <button
                onClick={() => handlePageChange(pagination.currentPage - 1)}
                disabled={pagination.currentPage === 1}
                className="pagination-btn"
              >
                上一页
              </button>
              <span className="pagination-info">
                {pagination.currentPage} / {pagination.totalPages}
              </span>
              <button
                onClick={() => handlePageChange(pagination.currentPage + 1)}
                disabled={pagination.currentPage === pagination.totalPages}
                className="pagination-btn"
              >
                下一页
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default Favorites;