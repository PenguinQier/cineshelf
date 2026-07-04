const express = require('express');
const router = express.Router();
const statsController = require('../controllers/statsController');

// 获取单部电影的统计数据
router.get('/stats/movie/:movieId', statsController.getMovieStats);

// 批量获取多部电影的统计数据
router.post('/stats/movies/batch', statsController.getBatchMovieStats);

module.exports = router;