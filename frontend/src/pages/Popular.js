import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import MovieList from '../components/MovieList';
import '../styles/Popular.css';
import '../styles/Pagination.css';

const Popular = () => {
  const [movies, setMovies] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [sortBy, setSortBy] = useState('combined');
  const [pageSize, setPageSize] = useState(6);
  const [totalResults, setTotalResults] = useState(0);

  // 排序选项
  const sortOptions = [
    { value: 'combined', label: '综合排序', description: '评分、收藏数和评论数的综合考量' },
    { value: 'rating', label: '按评分', description: '仅按电影评分排序' },
    { value: 'favorites', label: '按收藏', description: '按用户收藏数量排序' },
    { value: 'comments', label: '按热度', description: '按评论数量排序' }
  ];

  useEffect(() => {
    const loadPopularMovies = async () => {
      setIsLoading(true);
      try {
        // 从后端获取热门电影数据
        const response = await fetch(`http://localhost:5000/api/popular?page=${currentPage}&limit=${pageSize}&sortBy=${sortBy}`);

        if (!response.ok) {
          throw new Error('获取热门电影失败');
        }

        const data = await response.json();
        setMovies(data.movies);
        setTotalPages(data.totalPages);
        setTotalResults(data.totalResults);
      } catch (err) {
        console.error('获取热门电影错误:', err);
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    loadPopularMovies();

    // 设置页面标题
    document.title = '热门电影 - MovieHub';

    return () => {
      document.title = 'MovieHub';
    };
  }, [currentPage, sortBy, pageSize]);

  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
    window.scrollTo(0, 0); // 滚动到页面顶部
  };

  const handleSortChange = (newSortBy) => {
    setSortBy(newSortBy);
    setCurrentPage(1); // 重置为第一页
  };

  const handlePageSizeChange = (event) => {
    const newSize = parseInt(event.target.value);
    setPageSize(newSize);
    setCurrentPage(1); // 重置为第一页
  };

  // 生成页码数组
  const getPageNumbers = () => {
    const pageNumbers = [];
    const maxVisiblePages = 5; // 最多显示5个页码按钮

    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

    // 调整开始页，确保显示足够的页码按钮
    if (endPage - startPage + 1 < maxVisiblePages && startPage > 1) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      pageNumbers.push(i);
    }

    return pageNumbers;
  };

  if (error) {
    return <div className="error-message">错误: {error}</div>;
  }

  return (
    <div className="popular-page">
      <div className="popular-header">
        <h1 className="popular-title">
          <i className="fa fa-fire"></i> 热门电影
          <span className="rating-filter">评分 7.0+ 精选</span>
        </h1>

        <div className="popular-filters">
          <div className="sort-options">
            {sortOptions.map(option => (
              <button
                key={option.value}
                onClick={() => handleSortChange(option.value)}
                className={`sort-option ${sortBy === option.value ? 'active' : ''}`}
                title={option.description}
              >
                {option.label}
              </button>
            ))}
          </div>

          <div className="page-size-selector">
            <label htmlFor="pageSize">每页显示：</label>
            <select
              id="pageSize"
              value={pageSize}
              onChange={handlePageSizeChange}
            >
              <option value="3">3</option>
              <option value="6">6</option>
              <option value="9">9</option>
              <option value="12">12</option>
            </select>
          </div>
        </div>

        {totalResults > 0 && (
          <div className="results-info">
            共 {totalResults} 部热门电影
          </div>
        )}
      </div>

      {isLoading ? (
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <div>加载中...</div>
        </div>
      ) : movies.length > 0 ? (
        <>
          <MovieList movies={movies} />

          {totalPages > 1 && (
            <div className="pagination-container">
              <div className="pagination-controls">
                <button
                  onClick={() => handlePageChange(1)}
                  disabled={currentPage === 1}
                  className="pagination-button"
                >
                  &laquo;
                </button>

                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="pagination-button"
                >
                  &lsaquo;
                </button>

                {getPageNumbers().map(number => (
                  <button
                    key={number}
                    onClick={() => handlePageChange(number)}
                    className={`pagination-button ${currentPage === number ? 'active' : ''}`}
                  >
                    {number}
                  </button>
                ))}

                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="pagination-button"
                >
                  &rsaquo;
                </button>

                <button
                  onClick={() => handlePageChange(totalPages)}
                  disabled={currentPage === totalPages}
                  className="pagination-button"
                >
                  &raquo;
                </button>
              </div>
            </div>
          )}
        </>
      ) : (
        <div className="no-movies">
          <p>没有找到符合条件的热门电影</p>
          <Link to="/upload" className="upload-link">上传新电影</Link>
        </div>
      )}
    </div>
  );
};

export default Popular;