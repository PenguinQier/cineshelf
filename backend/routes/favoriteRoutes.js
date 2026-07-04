const express = require('express');
const router = express.Router();
const favoriteController = require('../controllers/favoriteController');
const { authenticateToken } = require('../middleware/auth');

// 获取用户收藏的电影列表
router.get('/favorites', authenticateToken, favoriteController.getFavorites);

// 添加电影到收藏
router.post('/favorites/:movieId', authenticateToken, favoriteController.addFavorite);

// 从收藏中删除电影
router.delete('/favorites/:movieId', authenticateToken, favoriteController.removeFavorite);

module.exports = router;
