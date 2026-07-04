const express = require('express');
const router = express.Router();
const movieController = require('../controllers/movieController');
const { authenticateToken, isAdmin } = require('../middleware/auth');
const upload = require('../middleware/upload');

// 获取热门电影
router.get('/popular', movieController.getPopularMovies);

// 获取电影列表
router.get('/movies', movieController.getMovies);

// 获取单个电影详情
router.get('/movies/:id', movieController.getMovieById);

// 添加电影
router.post(
  '/movies',
  authenticateToken,
  isAdmin,
  upload.fields([
    { name: 'poster', maxCount: 1 },
    { name: 'video', maxCount: 1 }
  ]),
  movieController.addMovie
);

// 更新电影
router.put('/movies/:id', authenticateToken, isAdmin, movieController.updateMovie);

// 删除电影
router.delete('/movies/:id', authenticateToken, isAdmin, movieController.deleteMovie);

module.exports = router;