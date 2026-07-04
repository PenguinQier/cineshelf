const pool = require('../config/db');

// 获取电影评论
const getCommentsByMovieId = async (req, res) => {
  try {
    const { movieId } = req.params;
    const connection = await pool.getConnection();

    try {
      // 获取电影的所有评论，同时获取用户信息（如用户名和头像）
      const [comments] = await connection.query(
        `SELECT c.*, u.zj_username as username, u.zj_avatar as avatar
         FROM comments c
         JOIN users u ON c.zj_user_id = u.zj_users_id
         WHERE c.zj_movie_id = ?
         ORDER BY c.zj_created_at DESC`,
        [movieId]
      );

      res.json(comments);
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error('获取评论失败:', error);
    res.status(500).json({ error: '服务器错误' });
  }
};

// 添加电影评论
const addComment = async (req, res) => {
  try {
    const { movieId } = req.params;
    const { content, rating } = req.body;
    const userId = req.user.id;

    // 验证请求数据
    if (!content) {
      return res.status(400).json({ error: '评论内容不能为空' });
    }

    // 验证评分范围
    if (rating !== undefined && (rating < 1 || rating > 5)) {
      return res.status(400).json({ error: '评分必须在1到5之间' });
    }

    const connection = await pool.getConnection();
    try {
      // 检查电影是否存在
      const [movies] = await connection.query(
        'SELECT * FROM movies WHERE zj_movies_id = ?',
        [movieId]
      );

      if (movies.length === 0) {
        return res.status(404).json({ error: '未找到该电影' });
      }

      // 添加评论
      const [result] = await connection.query(
        'INSERT INTO comments (zj_user_id, zj_movie_id, zj_content, zj_rating) VALUES (?, ?, ?, ?)',
        [userId, movieId, content, rating]
      );

      // 获取新添加的评论（包含用户信息）
      const [newComments] = await connection.query(
        `SELECT c.*, u.zj_username as username, u.zj_avatar as avatar
         FROM comments c
         JOIN users u ON c.zj_user_id = u.zj_users_id
         WHERE c.zj_comment_id = ?`,
        [result.insertId]
      );

      res.status(201).json(newComments[0]);
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error('添加评论失败:', error);
    res.status(500).json({ error: '服务器错误' });
  }
};

// 删除评论
const deleteComment = async (req, res) => {
  try {
    const { commentId } = req.params;

    const connection = await pool.getConnection();
    try {
      // 删除评论
      await connection.query(
        'DELETE FROM comments WHERE zj_comment_id = ?',
        [commentId]
      );

      res.json({ message: '评论已成功删除' });
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error('删除评论失败:', error);
    res.status(500).json({ error: '服务器错误' });
  }
};

// 更新评论
const updateComment = async (req, res) => {
  try {
    const { commentId } = req.params;
    const { content, rating } = req.body;

    if (!content || !rating) {
      return res.status(400).json({ error: '评论内容和评分为必填项' });
    }

    const connection = await pool.getConnection();
    try {
      // 更新评论
      await connection.query(
        'UPDATE comments SET zj_content = ?, zj_rating = ? WHERE zj_comment_id = ?',
        [content, rating, commentId]
      );

      // 查询更新后的评论
      const [updatedComments] = await connection.query(
        `SELECT c.*, u.zj_username AS username, u.zj_avatar AS avatar
         FROM comments c
         JOIN users u ON c.zj_user_id = u.zj_users_id
         WHERE c.zj_comment_id = ?`,
        [commentId]
      );

      res.json(updatedComments[0]);
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error('更新评论失败:', error);
    res.status(500).json({ error: '服务器错误' });
  }
};

module.exports = {
  getCommentsByMovieId,
  addComment,
  deleteComment,
  updateComment
};