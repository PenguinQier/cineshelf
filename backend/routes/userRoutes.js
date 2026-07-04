const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { authenticateToken } = require('../middleware/auth');
const upload = require('../middleware/upload');

// 用户注册
router.post('/register', upload.single('avatar'), userController.register);

// 用户登录
router.post('/login', userController.login);

// 获取当前用户信息
router.get('/user', authenticateToken, userController.getCurrentUser);

// 更新用户信息
router.put('/user', authenticateToken, upload.single('avatar'), userController.updateUser);

// 修改密码
router.put('/change-password', authenticateToken, userController.changePassword);

// 更新用户VIP状态
router.put('/update-vip', authenticateToken, userController.updateVipStatus);

module.exports = router;
