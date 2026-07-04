const express = require('express');
const router = express.Router();
const commentController = require('../controllers/commentController');
const { authenticateToken, isCommentAuthorOrAdmin } = require('../middleware/auth');

// 获取电影评论
router.get('/movies/:movieId/comments', commentController.getCommentsByMovieId);

// 添加电影评论
router.post('/movies/:movieId/comments', authenticateToken, commentController.addComment);

// 删除评论
router.delete('/comments/:commentId', authenticateToken, isCommentAuthorOrAdmin, commentController.deleteComment);

// 更新评论
router.put('/comments/:commentId', authenticateToken, isCommentAuthorOrAdmin, commentController.updateComment);

module.exports = router;