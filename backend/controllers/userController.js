const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const path = require('path');
const fs = require('fs');
const pool = require('../config/db');
const { JWT_SECRET } = require('../middleware/auth');

// 用户注册
const register = async (req, res) => {
  try {
    const { username, email, password } = req.body;

    // 验证请求数据
    if (!username || !email || !password) {
      return res.status(400).json({ error: '用户名、邮箱和密码为必填项' });
    }

    // 验证邮箱格式
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ error: '邮箱格式不正确' });
    }

    // 验证密码长度
    if (password.length < 6) {
      return res.status(400).json({ error: '密码长度不能少于6个字符' });
    }

    const connection = await pool.getConnection();
    try {
      // 检查用户名是否已存在
      const [existingUsers] = await connection.query(
        'SELECT * FROM users WHERE zj_username = ? OR zj_email = ?',
        [username, email]
      );

      if (existingUsers.length > 0) {
        return res.status(409).json({ error: '用户名或邮箱已被注册' });
      }

      // 加密密码
      const hashedPassword = await bcrypt.hash(password, 10);

      // 处理头像
      let avatarPath = null;
      if (req.file) {
        avatarPath = `http://localhost:5000/avatars/${req.file.filename}`;
      }

      // 创建新用户
      const [result] = await connection.query(
        'INSERT INTO users (zj_username, zj_email, zj_password, zj_avatar) VALUES (?, ?, ?, ?)',
        [username, email, hashedPassword, avatarPath]
      );

      // 生成JWT令牌
      const token = jwt.sign(
        { userId: result.insertId, username },
        JWT_SECRET,
        { expiresIn: '24h' }
      );

      res.status(201).json({
        message: '注册成功',
        token,
        user: {
          id: result.insertId,
          username,
          email,
          avatar: avatarPath
        }
      });
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error('注册失败:', error);
    res.status(500).json({ error: '服务器错误' });
  }
};

// 用户登录
const login = async (req, res) => {
  try {
    const { username, password } = req.body;

    // 验证请求数据
    if (!username || !password) {
      return res.status(400).json({ error: '用户名和密码为必填项' });
    }

    const connection = await pool.getConnection();
    try {
      // 查询用户
      const [users] = await connection.query(
        'SELECT * FROM users WHERE zj_username = ? OR zj_email = ?',
        [username, username]
      );

      // 用户不存在
      if (users.length === 0) {
        return res.status(401).json({ error: '用户名或密码不正确' });
      }

      const user = users[0];

      // 验证密码
      const isPasswordValid = await bcrypt.compare(password, user.zj_password);
      if (!isPasswordValid) {
        return res.status(401).json({ error: '用户名或密码不正确' });
      }

      // 生成JWT令牌
      const token = jwt.sign(
        { userId: user.zj_users_id, username: user.zj_username },
        JWT_SECRET,
        { expiresIn: '24h' }
      );

      // 返回用户信息和token
      res.json({
        token,
        user: {
          id: user.zj_users_id,
          username: user.zj_username,
          email: user.zj_email,
          avatar: user.zj_avatar,
          viper: user.zj_viper || false,
          role: user.zj_role || 'user'
        }
      });
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error('登录失败:', error);
    res.status(500).json({ error: '服务器错误' });
  }
};

// 获取当前用户信息
const getCurrentUser = (req, res) => {
  // 由于已经通过验证并获取了用户信息，直接返回
  res.json({
    user: req.user
  });
};

// 更新用户信息
const updateUser = async (req, res) => {
  try {
    const { username, email } = req.body;
    const userId = req.user.id;

    // 构建更新数据
    const updateData = {};
    if (username) updateData.zj_username = username;
    if (email) updateData.zj_email = email;

    // 处理头像
    if (req.file) {
      updateData.zj_avatar = `http://localhost:5000/avatars/${req.file.filename}`;

      // 如果用户有旧头像，删除它
      if (req.user.avatar && req.user.avatar.startsWith('http://localhost:5000/avatars/')) {
        const oldAvatarPath = path.join(__dirname, '..', 'public', 'avatars', path.basename(req.user.avatar));
        if (fs.existsSync(oldAvatarPath)) {
          fs.unlinkSync(oldAvatarPath);
        }
      }
    }

    // 没有更新数据
    if (Object.keys(updateData).length === 0) {
      return res.status(400).json({ error: '没有提供更新数据' });
    }

    const connection = await pool.getConnection();
    try {
      // 如果要更新用户名或邮箱，检查是否已被使用
      if (username || email) {
        let checkQuery = 'SELECT * FROM users WHERE zj_users_id != ? AND (';
        const checkParams = [userId];

        if (username) {
          checkQuery += 'zj_username = ?';
          checkParams.push(username);
        }

        if (email) {
          if (username) checkQuery += ' OR ';
          checkQuery += 'zj_email = ?';
          checkParams.push(email);
        }

        checkQuery += ')';

        const [existingUsers] = await connection.query(checkQuery, checkParams);

        if (existingUsers.length > 0) {
          return res.status(409).json({ error: '用户名或邮箱已被使用' });
        }
      }

      // 生成更新SQL
      let updateQuery = 'UPDATE users SET ';
      const updateParams = [];

      Object.entries(updateData).forEach(([key, value], index) => {
        if (index > 0) updateQuery += ', ';
        updateQuery += `${key} = ?`;
        updateParams.push(value);
      });

      updateQuery += ' WHERE zj_users_id = ?';
      updateParams.push(userId);

      // 执行更新
      await connection.query(updateQuery, updateParams);

      // 获取更新后的用户信息
      const [updatedUsers] = await connection.query(
        'SELECT zj_users_id, zj_username, zj_email, zj_avatar FROM users WHERE zj_users_id = ?',
        [userId]
      );

      if (updatedUsers.length === 0) {
        return res.status(404).json({ error: '用户不存在' });
      }

      res.json({
        message: '用户信息更新成功',
        user: {
          id: updatedUsers[0].zj_users_id,
          username: updatedUsers[0].zj_username,
          email: updatedUsers[0].zj_email,
          avatar: updatedUsers[0].zj_avatar
        }
      });
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error('更新用户信息失败:', error);
    res.status(500).json({ error: '服务器错误' });
  }
};

// 修改密码
const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const userId = req.user.id;

    // 验证请求数据
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ error: '当前密码和新密码为必填项' });
    }

    // 验证新密码长度
    if (newPassword.length < 6) {
      return res.status(400).json({ error: '新密码长度不能少于6个字符' });
    }

    const connection = await pool.getConnection();
    try {
      // 获取用户信息（包含密码）
      const [users] = await connection.query(
        'SELECT * FROM users WHERE zj_users_id = ?',
        [userId]
      );

      if (users.length === 0) {
        return res.status(404).json({ error: '用户不存在' });
      }

      const user = users[0];

      // 验证当前密码
      const isPasswordValid = await bcrypt.compare(currentPassword, user.zj_password);
      if (!isPasswordValid) {
        return res.status(401).json({ error: '当前密码不正确' });
      }

      // 加密新密码
      const hashedNewPassword = await bcrypt.hash(newPassword, 10);

      // 更新密码
      await connection.query(
        'UPDATE users SET zj_password = ? WHERE zj_users_id = ?',
        [hashedNewPassword, userId]
      );

      res.json({ message: '密码修改成功' });
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error('修改密码失败:', error);
    res.status(500).json({ error: '服务器错误' });
  }
};

// 更新用户VIP状态
const updateVipStatus = async (req, res) => {
  try {
    const { viper } = req.body;
    const userId = req.user.id;

    // 验证VIP状态是布尔值
    if (typeof viper !== 'boolean') {
      return res.status(400).json({ error: 'VIP状态必须是布尔值' });
    }

    const connection = await pool.getConnection();
    try {
      // 更新VIP状态
      await connection.query(
        'UPDATE users SET zj_viper = ? WHERE zj_users_id = ?',
        [viper, userId]
      );

      // 获取更新后的用户信息
      const [users] = await connection.query(
        'SELECT zj_users_id, zj_username, zj_email, zj_avatar, zj_viper FROM users WHERE zj_users_id = ?',
        [userId]
      );

      if (users.length === 0) {
        return res.status(404).json({ error: '用户不存在' });
      }

      res.json({
        message: viper ? 'VIP会员开通成功' : 'VIP会员已取消',
        user: {
          id: users[0].zj_users_id,
          username: users[0].zj_username,
          email: users[0].zj_email,
          avatar: users[0].zj_avatar,
          viper: users[0].zj_viper || false
        }
      });
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error('更新VIP状态失败:', error);
    res.status(500).json({ error: '服务器错误' });
  }
};

module.exports = {
  register,
  login,
  getCurrentUser,
  updateUser,
  changePassword,
  updateVipStatus
};