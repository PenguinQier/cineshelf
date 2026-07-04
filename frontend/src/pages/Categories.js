import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import MovieList from '../components/MovieList';
import '../styles/Categories.css';

const Categories = () => {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedMainCategory, setSelectedMainCategory] = useState(null);
  const [selectedSubCategory, setSelectedSubCategory] = useState(null);
  const [movies, setMovies] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // 分类数据
  const categories = [
    { id: 'all', name: '全部' },
    { id: 'movie', name: '电影' },
    { id: 'series', name: '电视剧' },
    { id: 'anime', name: '动漫' },
    { id: 'variety', name: '综艺' },
    { id: 'documentary', name: '纪录片' },
    { id: 'children', name: '少儿' },
    { id: 'shortVideo', name: '短剧' }
  ];

  // 主分类
  const mainCategories = [
    { id: 'film', name: '影视推荐', subCategories: ['首页', 'VIP会员', '电视剧', '电影', '综艺', '动漫', '少儿', '纪录片', '短剧'] },
    { id: 'education', name: '就好这口', subCategories: ['中视频', '知识', '学堂'] },
    { id: 'sports', name: '体育游戏', subCategories: ['NBA', '体育', '小游戏', '游戏', '传奇游戏库', 'F1', 'NFL', 'WWE', 'WNBA', '棋牌游戏库'] },
    { id: 'news', name: '资讯前沿', subCategories: ['科技', '汽车'] },
    { id: 'lifestyle', name: '乐享生活', subCategories: ['音乐', '艺术', '生活', '时尚', '育儿'] }
  ];

  // 类别映射，将显示名称映射到API参数 - 使用useMemo缓存对象
  const categoryMapping = useMemo(() => ({
    '首页': 'home',
    'VIP会员': 'vip',
    '电视剧': 'series',
    '电影': 'movie',
    '综艺': 'variety',
    '动漫': 'anime',
    '少儿': 'children',
    '纪录片': 'documentary',
    '短剧': 'shortVideo',
    '中视频': 'shortVideo',
    '知识': 'knowledge',
    '学堂': 'education',
    'NBA': 'nba',
    '体育': 'sports',
    '小游戏': 'miniGame',
    '游戏': 'game',
    '传奇游戏库': 'legendGame',
    'F1': 'f1',
    'NFL': 'nfl',
    'WWE': 'wwe',
    'WNBA': 'wnba',
    '棋牌游戏库': 'chessGame',
    '科技': 'tech',
    '汽车': 'car',
    '音乐': 'music',
    '艺术': 'art',
    '生活': 'life',
    '时尚': 'fashion',
    '育儿': 'parenting'
  }), []);

  useEffect(() => {
    const fetchMoviesByCategory = async () => {
      setIsLoading(true);
      try {
        let apiUrl = `http://localhost:5000/api/movies?page=${currentPage}&limit=3`;

        // 如果不是"全部"分类，则添加分类筛选
        if (selectedCategory !== 'all') {
          apiUrl += `&type=${selectedCategory}`;
        }

        // 添加主分类筛选
        if (selectedMainCategory) {
          apiUrl += `&mainCategory=${selectedMainCategory}`;
        }

        // 添加子分类筛选
        if (selectedSubCategory) {
          const apiParam = categoryMapping[selectedSubCategory] || selectedSubCategory.toLowerCase();
          apiUrl += `&subCategory=${apiParam}`;
        }

        const response = await fetch(apiUrl);

        if (!response.ok) {
          throw new Error('获取电影分类失败');
        }

        const data = await response.json();
        setMovies(data.movies);
        setTotalPages(data.totalPages);
      } catch (err) {
        console.error('获取电影分类错误:', err);
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchMoviesByCategory();

    // 设置页面标题
    document.title = '电影分类 - MovieHub';

    return () => {
      document.title = 'MovieHub';
    };
  }, [selectedCategory, selectedMainCategory, selectedSubCategory, currentPage, categoryMapping]);

  const handleCategoryChange = (category) => {
    setSelectedCategory(category);
    setCurrentPage(1); // 切换分类时重置页码
  };

  const handleMainCategorySelect = (mainCatId) => {
    setSelectedMainCategory(mainCatId === selectedMainCategory ? null : mainCatId);
    setSelectedSubCategory(null); // 清除子分类选择
    setCurrentPage(1);
  };

  const handleSubCategorySelect = (subCat) => {
    setSelectedSubCategory(subCat === selectedSubCategory ? null : subCat);
    setCurrentPage(1);
  };

  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
    window.scrollTo(0, 0); // 滚动到页面顶部
  };

  if (error) {
    return <div className="error-message">错误: {error}</div>;
  }

  return (
    <div className="categories-page">
      <div className="categories-header">
        <h1 className="categories-title">电影分类</h1>
      </div>

      {/* 主分类导航 */}
      <div className="main-categories-container">
        {mainCategories.map((mainCat) => (
          <div key={mainCat.id} className="main-category-group">
            <h2
              className={`main-category-title ${selectedMainCategory === mainCat.id ? 'active' : ''}`}
              onClick={() => handleMainCategorySelect(mainCat.id)}
            >
              {mainCat.name}：
            </h2>
            <div className="sub-categories-list">
              {mainCat.subCategories.map((subCat, index) => (
                <span
                  key={index}
                  className={`sub-category-item ${selectedSubCategory === subCat ? 'active' : ''}`}
                  onClick={() => handleSubCategorySelect(subCat)}
                >
                  {subCat}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* 电影分类切换 */}
      <div className="category-tabs">
        {categories.map((category) => (
          <button
            key={category.id}
            className={`category-tab ${selectedCategory === category.id ? 'active' : ''}`}
            onClick={() => handleCategoryChange(category.id)}
          >
            {category.name}
          </button>
        ))}
      </div>

      {/* 当前筛选条件 */}
      {(selectedMainCategory || selectedSubCategory) && (
        <div className="current-filters">
          <span>当前筛选: </span>
          {selectedMainCategory && (
            <span className="filter-tag">
              {mainCategories.find(cat => cat.id === selectedMainCategory)?.name}
              <button onClick={() => setSelectedMainCategory(null)}>×</button>
            </span>
          )}
          {selectedSubCategory && (
            <span className="filter-tag">
              {selectedSubCategory}
              <button onClick={() => setSelectedSubCategory(null)}>×</button>
            </span>
          )}
          <button
            className="clear-filters"
            onClick={() => {
              setSelectedMainCategory(null);
              setSelectedSubCategory(null);
            }}
          >
            清除全部
          </button>
        </div>
      )}

      {isLoading ? (
        <div className="loading">加载中...</div>
      ) : movies.length > 0 ? (
        <>
          <MovieList movies={movies} />

          {totalPages > 1 && (
            <div className="pagination">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                <button
                  key={page}
                  onClick={() => handlePageChange(page)}
                  disabled={page === currentPage}
                  className={page === currentPage ? 'active' : ''}
                >
                  {page}
                </button>
              ))}
            </div>
          )}
        </>
      ) : (
        <div className="no-movies">
          <p>没有找到相关电影</p>
          <Link to="/upload" className="upload-link">上传新电影</Link>
        </div>
      )}
    </div>
  );
};

export default Categories;