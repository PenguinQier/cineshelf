const pool = require('../config/db');

// 获取用户收藏的电影列表
const getFavorites = async (req, res) => {
  try {
    const userId = req.user.id;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 8;
    const offset = (page - 1) * limit;

    const connection = await pool.getConnection();

    try {
      // 先获取总数
      const [[{ total }]] = await connection.query(
        'SELECT COUNT(*) as total FROM favorites WHERE zj_user_id = ?',
        [userId]
      );

      // 从收藏表和电影表联合查询，获取完整的电影信息
      const [favorites] = await connection.query(
        `SELECT m.*, f.zj_created_at as favorited_at
         FROM favorites f
         JOIN movies m ON f.zj_movie_id = m.zj_movies_id
         WHERE f.zj_user_id = ?
         ORDER BY f.zj_created_at DESC
         LIMIT ? OFFSET ?`,
        [userId, limit, offset]
      );

      // 格式化返回的电影数据
      const formattedFavorites = favorites.map(movie => ({
        id: movie.zj_movies_id,
        title: movie.zj_title,
        year: movie.zj_year,
        type: movie.zj_type,
        poster: movie.zj_poster,
        imdbID: movie.zj_imdbID,
        description: movie.zj_description,
        director: movie.zj_director,
        genres: movie.zj_genres ? movie.zj_genres.split(',') : [],
        language: movie.zj_language,
        rating: movie.zj_rating,
        video: movie.zj_video,
        vip: movie.zj_vip === 1,
        favorited_at: movie.favorited_at
      }));

      // 按照前端期望的数据结构返回
      res.json({
        favorites: formattedFavorites,
        totalPages: Math.ceil(total / limit),
        currentPage: page,
        totalResults: total
      });
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error('获取收藏列表错误:', error);
    res.status(500).json({ error: '服务器错误' });
  }
};

// 添加电影到收藏
const addFavorite = async (req, res) => {
  try {
    const userId = req.user.id;
    const movieId = req.params.movieId;

    const connection = await pool.getConnection();
    try {
      // 检查电影是否存在
      const [movies] = await connection.query(
        'SELECT * FROM movies WHERE zj_movies_id = ?',
        [movieId]
      );

      if (movies.length === 0) {
        return res.status(404).json({ error: '电影不存在' });
      }

      // 检查是否已经收藏
      const [existingFavorites] = await connection.query(
        'SELECT * FROM favorites WHERE zj_user_id = ? AND zj_movie_id = ?',
        [userId, movieId]
      );

      if (existingFavorites.length > 0) {
        return res.status(409).json({ error: '已收藏此电影' });
      }

      // 添加到收藏
      await connection.query(
        'INSERT INTO favorites (zj_user_id, zj_movie_id) VALUES (?, ?)',
        [userId, movieId]
      );

      res.status(201).json({ message: '已添加到收藏' });
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error('添加收藏错误:', error);
    res.status(500).json({ error: '服务器错误' });
  }
};

// 从收藏中删除电影
const removeFavorite = async (req, res) => {
  try {
    const userId = req.user.id;
    const movieId = req.params.movieId;

    const connection = await pool.getConnection();
    try {
      // 检查是否已收藏
      const [existingFavorites] = await connection.query(
        'SELECT * FROM favorites WHERE zj_user_id = ? AND zj_movie_id = ?',
        [userId, movieId]
      );

      if (existingFavorites.length === 0) {
        return res.status(404).json({ error: '未找到收藏记录' });
      }

      // 从收藏中删除
      await connection.query(
        'DELETE FROM favorites WHERE zj_user_id = ? AND zj_movie_id = ?',
        [userId, movieId]
      );

      res.json({ message: '已从收藏中移除' });
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error('删除收藏错误:', error);
    res.status(500).json({ error: '服务器错误' });
  }
};

module.exports = {
  getFavorites,
  addFavorite,
  removeFavorite
};