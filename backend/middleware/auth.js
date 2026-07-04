const jwt = require('jsonwebtoken');
const pool = require('../config/db');

// JWT 密钥。生产环境必须通过环境变量覆盖。
const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret_key';

// 验证JWT token的中间件
const authenticateToken = async (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: '未提供访问令牌' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);

    // 从数据库获取用户信息，确保用户存在
    const connection = await pool.getConnection();
    try {
      const [users] = await connection.query(
        'SELECT zj_users_id, zj_username, zj_email, zj_avatar, zj_viper, zj_role FROM users WHERE zj_users_id = ?',
        [decoded.userId]
      );

      if (users.length === 0) {
        return res.status(403).json({ error: '无效的用户' });
      }

      req.user = {
        id: users[0].zj_users_id,
        username: users[0].zj_username,
        email: users[0].zj_email,
        avatar: users[0].zj_avatar,
        viper: users[0].zj_viper || false,
        role: users[0].zj_role || 'user'
      };
      next();
    } finally {
      connection.release();
    }
  } catch (error) {
    return res.status(403).json({ error: '无效的访问令牌' });
  }
};

// 验证用户是否为管理员的中间件
const isAdmin = (req, res, next) => {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({ error: '权限不足，需要管理员权限' });
  }
  next();
};

// 验证用户是否为评论作者或管理员的中间件
const isCommentAuthorOrAdmin = async (req, res, next) => {
  // 从请求参数中获取评论ID
  const commentId = req.params.commentId;
  const userId = req.user.id;

  // 如果是管理员，直接放行
  if (req.user.role === 'admin') {
    return next();
  }

  try {
    const connection = await pool.getConnection();
    try {
      // 查询评论是否属于当前用户
      const [comments] = await connection.query(
        'SELECT * FROM comments WHERE zj_comment_id = ?',
        [commentId]
      );

      if (comments.length === 0) {
        return res.status(404).json({ error: '评论不存在' });
      }

      // 检查评论是否属于当前用户
      if (comments[0].zj_user_id !== userId) {
        return res.status(403).json({ error: '权限不足，您只能修改或删除自己的评论' });
      }

      next();
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error('验证评论作者错误:', error);
    res.status(500).json({ error: '服务器错误' });
  }
};

module.exports = {
  JWT_SECRET,
  authenticateToken,
  isAdmin,
  isCommentAuthorOrAdmin
};
