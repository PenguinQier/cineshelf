const pool = require('../config/db');

// 获取电影的统计数据（收藏数和评论数）
const getMovieStats = async (req, res) => {
  try {
    const movieId = req.params.movieId;

    // 验证movieId是否存在
    if (!movieId) {
      return res.status(400).json({ error: '缺少电影ID' });
    }

    const connection = await pool.getConnection();

    try {
      // 获取收藏数
      const [[favoritesCount]] = await connection.query(
        'SELECT COUNT(*) as count FROM favorites WHERE zj_movie_id = ?',
        [movieId]
      );

      // 获取评论数
      const [[commentsCount]] = await connection.query(
        'SELECT COUNT(*) as count FROM comments WHERE zj_movie_id = ?',
        [movieId]
      );

      res.json({
        movieId,
        favorites: favoritesCount.count,
        comments: commentsCount.count
      });
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error('获取电影统计数据错误:', error);
    res.status(500).json({ error: '服务器错误' });
  }
};

// 批量获取多个电影的统计数据
const getBatchMovieStats = async (req, res) => {
  try {
    const { movieIds } = req.body;

    // 验证电影ID数组
    if (!movieIds || !Array.isArray(movieIds) || movieIds.length === 0) {
      return res.status(400).json({ error: '请提供有效的电影ID数组' });
    }

    const connection = await pool.getConnection();

    try {
      // 预处理查询语句的参数占位符
      const placeholders = movieIds.map(() => '?').join(',');

      // 获取收藏数
      const [favoritesData] = await connection.query(
        `SELECT zj_movie_id as movieId, COUNT(*) as count
         FROM favorites
         WHERE zj_movie_id IN (${placeholders})
         GROUP BY zj_movie_id`,
        movieIds
      );

      // 获取评论数
      const [commentsData] = await connection.query(
        `SELECT zj_movie_id as movieId, COUNT(*) as count
         FROM comments
         WHERE zj_movie_id IN (${placeholders})
         GROUP BY zj_movie_id`,
        movieIds
      );

      // 将结果转换为以电影ID为键的对象
      const favoritesMap = favoritesData.reduce((map, item) => {
        map[item.movieId] = item.count;
        return map;
      }, {});

      const commentsMap = commentsData.reduce((map, item) => {
        map[item.movieId] = item.count;
        return map;
      }, {});

      // 为每个电影ID构建统计数据对象
      const results = movieIds.map(id => ({
        movieId: id,
        favorites: favoritesMap[id] || 0,
        comments: commentsMap[id] || 0
      }));

      res.json({
        stats: results
      });
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error('批量获取电影统计数据错误:', error);
    res.status(500).json({ error: '服务器错误' });
  }
};

module.exports = {
  getMovieStats,
  getBatchMovieStats
};