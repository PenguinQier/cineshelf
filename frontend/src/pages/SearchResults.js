import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import MovieList from '../components/MovieList';
import { fetchMovies } from '../services/movieApi';
import '../styles/Pagination.css';

const SearchResults = () => {
  const location = useLocation();
  const query = new URLSearchParams(location.search).get('q');
  const [movies, setMovies] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [totalResults, setTotalResults] = useState(0);
  const [pageSize, setPageSize] = useState(6);

  useEffect(() => {
    const loadSearchResults = async () => {
      if (query) {
        setIsLoading(true);
        try {
          const data = await fetchMovies(query, currentPage, pageSize);
          setMovies(data.movies);
          setTotalPages(data.totalPages);
          setTotalResults(data.totalResults);
          // 如果切换页码后没有数据且总页数大于0，返回第一页
          if (data.movies.length === 0 && data.totalPages > 0) {
            setCurrentPage(1);
          }
        } catch (error) {
          console.error('Search error:', error);
        } finally {
          setIsLoading(false);
        }
      }
    };

    loadSearchResults();
  }, [query, currentPage, pageSize]);

  // 处理页码变化
  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
      window.scrollTo(0, 0); // 回到页面顶部
    }
  };

  // 处理每页显示数量变化
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

  return (
    <div className="search-results">
      <div className="search-header">
        <h2>搜索结果: {query}</h2>
        <div className="search-info">
          {totalResults > 0 && (
            <>
              <span>共找到 {totalResults} 个结果</span>
              <p className="search-scope-info">
                搜索范围：电影标题、剧情描述、电影类型、IMDb ID
              </p>
            </>
          )}
        </div>
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
          )}
        </>
      ) : (
        <div className="no-results">没有找到与"{query}"相关的电影</div>
      )}
    </div>
  );
};

export default SearchResults;