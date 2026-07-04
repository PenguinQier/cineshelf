import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import MovieList from '../components/MovieList';
import Search from '../components/Search';
import { fetchMovies } from '../services/movieApi';
import '../styles/Home.css';

const Home = () => {
  const [moviesData, setMoviesData] = useState({
    movies: [],
    totalResults: 0,
    totalPages: 0,
    currentPage: 1
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  // 使用 useCallback 缓存 loadMovies 函数
  const loadMovies = useCallback(async (query = '', page = 1) => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await fetchMovies(query, page);
      setMoviesData(data);

      if (query && data.movies.length === 0) {
        navigate('/not-found', { state: { searchQuery: query } });
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }, [navigate]); // 只依赖 navigate

  useEffect(() => {
    loadMovies();
  }, [loadMovies]); // 现在依赖 loadMovies

  const handleSearch = (query) => {
    setSearchQuery(query);
    loadMovies(query);
  };

  const handlePageChange = (newPage) => {
    loadMovies(searchQuery, newPage);
    // 滚动到页面顶部
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (error) {
    return <div className="error-message">Error: {error}</div>;
  }

  return (
    <div className="home-page">
      <h1>电影列表</h1>

      {isLoading ? (
        <div className="loading">
          <div className="loading-spinner"></div>
          <p>正在加载精彩电影...</p>
        </div>
      ) : moviesData.movies.length > 0 ? (
        <>
          <MovieList movies={moviesData.movies} />

          {moviesData.totalPages > 1 && (
            <div className="pagination">
              <button
                onClick={() => handlePageChange(Math.max(1, moviesData.currentPage - 1))}
                disabled={moviesData.currentPage === 1}
              >
                《
              </button>

              {/* 页码导航 */}
              {Array.from({ length: Math.min(5, moviesData.totalPages) }, (_, i) => {
                // 计算要显示的页码范围
                let pageNum;
                if (moviesData.totalPages <= 5) {
                  // 如果总页数小于等于5，显示所有页码
                  pageNum = i + 1;
                } else {
                  // 如果总页数大于5，根据当前页计算显示的页码
                  if (moviesData.currentPage <= 3) {
                    // 当前页靠近开始，显示1-5页
                    pageNum = i + 1;
                  } else if (moviesData.currentPage >= moviesData.totalPages - 2) {
                    // 当前页靠近结束，显示最后5页
                    pageNum = moviesData.totalPages - 4 + i;
                  } else {
                    // 当前页在中间，显示当前页及其前后2页
                    pageNum = moviesData.currentPage - 2 + i;
                  }
                }

                return (
                  <button
                    key={pageNum}
                    onClick={() => handlePageChange(pageNum)}
                    className={pageNum === moviesData.currentPage ? 'active' : ''}
                  >
                    {pageNum}
                  </button>
                );
              })}

              <button
                onClick={() => handlePageChange(Math.min(moviesData.totalPages, moviesData.currentPage + 1))}
                disabled={moviesData.currentPage === moviesData.totalPages}
              >
                》
              </button>
            </div>
          )}
        </>
      ) : searchQuery ? (
        <div className="no-movies">
          <p>没有找到与"{searchQuery}"相关的电影</p>
          <button onClick={() => loadMovies()}>显示全部电影</button>
        </div>
      ) : (
        <div className="no-movies">
          <p>没有找到任何电影</p>
        </div>
      )}
    </div>
  );
};

export default Home;