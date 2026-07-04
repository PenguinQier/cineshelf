import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import '../styles/Search.css';

const Search = ({ onSearch, resultsCount }) => {
  const [query, setQuery] = useState('');
  const [searchHistory, setSearchHistory] = useState([]);
  const [showHistory, setShowHistory] = useState(false);
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const searchRef = useRef(null);
  const debounceTimeout = useRef(null);
  const [lastNavigatedQuery, setLastNavigatedQuery] = useState('');

  // Load search history from localStorage on component mount
  useEffect(() => {
    const history = localStorage.getItem('searchHistory');
    if (history) {
      setSearchHistory(JSON.parse(history));
    }

    // 从URL获取查询参数
    const urlParams = new URLSearchParams(location.search);
    const queryParam = urlParams.get('q');
    if (queryParam) {
      setQuery(queryParam);
      setDebouncedQuery(queryParam);
      setLastNavigatedQuery(queryParam);
    }
  }, [location.search]);

  // 防抖处理
  useEffect(() => {
    // 清除之前的定时器
    if (debounceTimeout.current) {
      clearTimeout(debounceTimeout.current);
    }

    // 设置新的定时器，300ms后更新debouncedQuery
    debounceTimeout.current = setTimeout(() => {
      setDebouncedQuery(query);
      if (query.trim()) {
        setIsSearching(true);
      }
    }, 300);

    // 组件卸载时清除定时器
    return () => {
      if (debounceTimeout.current) {
        clearTimeout(debounceTimeout.current);
      }
    };
  }, [query]);

  // 当debouncedQuery变化且不为空时自动搜索
  useEffect(() => {
    if (debouncedQuery.trim()) {
      // 只执行搜索操作，不修改URL
      onSearch(debouncedQuery);

      // 防止短时间内重复添加相同的搜索词到历史记录
      if (isSearching) {
        // 只保存到历史，不导航
        saveToHistory(debouncedQuery.trim(), false);
        setIsSearching(false);
      }
    }
  }, [debouncedQuery, onSearch, isSearching]);

  // Handle clicks outside of search component to close history dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowHistory(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const saveToHistory = (searchTerm, navigateToResults = true) => {
    const newItem = {
      term: searchTerm,
      type: 'search',
      timestamp: new Date().toISOString()
    };

    // Check if the term already exists in history
    const existingIndex = searchHistory.findIndex(item =>
      typeof item === 'string'
        ? item === searchTerm
        : item.term === searchTerm
    );

    let newHistory;
    if (existingIndex !== -1) {
      // Move to the top if it exists
      newHistory = [
        newItem,
        ...searchHistory.filter((item, index) => index !== existingIndex)
      ];
    } else {
      // Add new term and keep only the latest 10 items
      newHistory = [newItem, ...searchHistory].slice(0, 10);
    }

    setSearchHistory(newHistory);
    localStorage.setItem('searchHistory', JSON.stringify(newHistory));

    // 只有在需要导航时才执行
    if (navigateToResults && searchTerm !== lastNavigatedQuery) {
      navigate(`/search?q=${encodeURIComponent(searchTerm)}`);
      setLastNavigatedQuery(searchTerm);
    }
  };

  const handleNavigateToSearch = () => {
    if (query.trim() && query !== lastNavigatedQuery) {
      navigate(`/search?q=${encodeURIComponent(query)}`);
      saveToHistory(query.trim(), false);
      setLastNavigatedQuery(query);
    }
  };

  const handleHistoryItemClick = (item) => {
    const term = typeof item === 'string' ? item : item.term;
    setQuery(term);
    onSearch(term);

    // 只在点击历史记录时导航
    if (term !== lastNavigatedQuery) {
    navigate(`/search?q=${encodeURIComponent(term)}`);
      saveToHistory(term, false);
      setLastNavigatedQuery(term);
    }

    setShowHistory(false);
  };

  const clearHistory = (e) => {
    e.stopPropagation();
    setSearchHistory([]);
    localStorage.removeItem('searchHistory');
  };

  const handleQueryChange = (e) => {
    setQuery(e.target.value);
    // 显示历史记录（当输入为空时）
    if (e.target.value.trim() === '') {
    setShowHistory(true);
    } else {
      // 输入时隐藏历史记录
      setShowHistory(false);
    }
  };

  const handleKeyDown = (e) => {
    // 当用户按下回车键时导航到搜索页面
    if (e.key === 'Enter' && query.trim()) {
      handleNavigateToSearch();
    }
  };

  // Helper function to get the term from a history item
  const getItemTerm = (item) => {
    return typeof item === 'string' ? item : item.term;
  };

  // 高亮显示搜索历史中匹配当前输入的部分
  const highlightMatch = (text) => {
    if (!query.trim()) return text;

    const regex = new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
    const parts = text.split(regex);

    return parts.map((part, index) =>
      regex.test(part) ? <span key={index} className="highlight">{part}</span> : part
    );
  };

  // 显示最近的搜索时间
  const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.round(diffMs / 60000);
    const diffHours = Math.round(diffMs / 3600000);
    const diffDays = Math.round(diffMs / 86400000);

    if (diffMins < 60) return `${diffMins} 分钟前`;
    if (diffHours < 24) return `${diffHours} 小时前`;
    return `${diffDays} 天前`;
  };

  return (
    <div className="search-container" ref={searchRef}>
      <div className="search-box">
        <input
          type="text"
          value={query}
          onChange={handleQueryChange}
          onKeyDown={handleKeyDown}
          onFocus={() => setShowHistory(query.trim() === '')}
          placeholder="搜索电影标题、描述、类型或IMDb ID..."
          className="search-input"
        />
        <button
          type="button"
          className="search-button"
          onClick={handleNavigateToSearch}
        >
          🔍
        </button>
      </div>

      {showHistory && searchHistory.length > 0 && (
        <div className="search-history-dropdown">
          <div className="search-history-header">
            <span>搜索历史</span>
            <button onClick={clearHistory} className="clear-history-btn">清除</button>
          </div>
          <ul className="search-history-list">
            {searchHistory.map((item, index) => (
              <li
                key={index}
                onClick={() => handleHistoryItemClick(item)}
                className="search-history-item"
              >
                <div className="history-item-content">
                  <i className="fas fa-clock"></i>
                  <span className="history-term">{highlightMatch(getItemTerm(item))}</span>
                </div>
                {item.timestamp && (
                  <span className="history-timestamp">{formatTimestamp(item.timestamp)}</span>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}

      {debouncedQuery && resultsCount !== undefined && resultsCount === 0 && (
        <div className="no-results-message">
          未找到与 "{debouncedQuery}" 相关的电影，请尝试其他关键词
        </div>
      )}
    </div>
  );
};

export default Search;