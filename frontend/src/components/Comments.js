import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../contexts/AuthContext';
import '../styles/Comments.css';

const Comments = ({ movieId }) => {
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [newComment, setNewComment] = useState('');
  const [rating, setRating] = useState(5);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingComment, setEditingComment] = useState(null);
  const [editContent, setEditContent] = useState('');
  const [editRating, setEditRating] = useState(5);

  // 使用AuthContext获取用户信息和token
  const { user, token, isAuthenticated } = useContext(AuthContext);

  useEffect(() => {
    fetchComments();
  }, [movieId]);

  const fetchComments = async () => {
    setLoading(true);
    try {
      const response = await fetch(`http://localhost:5000/api/movies/${movieId}/comments`);

      if (!response.ok) {
        throw new Error('获取评论失败');
      }

      const data = await response.json();
      setComments(data);
    } catch (err) {
      console.error('获取评论错误:', err);
      setError('获取评论失败，请稍后再试');
    } finally {
      setLoading(false);
    }
  };

  const handleCommentChange = (e) => {
    setNewComment(e.target.value);
  };

  const handleRatingChange = (e) => {
    setRating(parseInt(e.target.value));
  };

  const handleEditContentChange = (e) => {
    setEditContent(e.target.value);
  };

  const handleEditRatingChange = (e) => {
    setEditRating(parseInt(e.target.value));
  };

  const handleSubmitComment = async (e) => {
    e.preventDefault();

    if (!isAuthenticated || !token) {
      alert('请先登录后再发表评论');
      return;
    }

    if (!newComment.trim()) {
      alert('评论内容不能为空');
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch(`http://localhost:5000/api/movies/${movieId}/comments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          content: newComment.trim(),
          rating
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || '发表评论失败');
      }

      const newCommentData = await response.json();

      // 将新评论添加到评论列表
      setComments(prevComments => [newCommentData, ...prevComments]);

      // 清空评论表单
      setNewComment('');
      setRating(5);

      alert('评论发表成功！');
    } catch (err) {
      console.error('发表评论错误:', err);
      alert(`发表评论失败: ${err.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteComment = async (commentId) => {
    if (!window.confirm('确定要删除此评论吗？')) {
      return;
    }

    try {
      const response = await fetch(`http://localhost:5000/api/comments/${commentId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || '删除评论失败');
      }

      // 从列表中移除被删除的评论
      setComments(prevComments =>
        prevComments.filter(comment => comment.zj_comment_id !== commentId)
      );

      alert('评论已成功删除');
    } catch (err) {
      console.error('删除评论错误:', err);
      alert(`删除评论失败: ${err.message}`);
    }
  };

  const handleEditComment = (comment) => {
    setEditingComment(comment.zj_comment_id);
    setEditContent(comment.zj_content);
    setEditRating(comment.zj_rating);
  };

  const handleCancelEdit = () => {
    setEditingComment(null);
    setEditContent('');
    setEditRating(5);
  };

  const handleSubmitEdit = async (commentId) => {
    if (!editContent.trim()) {
      alert('评论内容不能为空');
      return;
    }

    try {
      const response = await fetch(`http://localhost:5000/api/comments/${commentId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          content: editContent.trim(),
          rating: editRating
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || '更新评论失败');
      }

      const updatedComment = await response.json();

      // 更新评论列表
      setComments(prevComments =>
        prevComments.map(comment =>
          comment.zj_comment_id === commentId ? updatedComment : comment
        )
      );

      // 重置编辑状态
      setEditingComment(null);
      setEditContent('');
      setEditRating(5);

      alert('评论已成功更新');
    } catch (err) {
      console.error('更新评论错误:', err);
      alert(`更新评论失败: ${err.message}`);
    }
  };

  const formatDate = (dateString) => {
    const options = {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    };
    return new Date(dateString).toLocaleDateString('zh-CN', options);
  };

  const renderStars = (rating) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <span
          key={i}
          className={`star ${i <= rating ? 'filled' : 'empty'}`}
        >
          ★
        </span>
      );
    }
    return stars;
  };

  // 检查用户是否是评论的作者
  const isCommentAuthor = (comment) => {
    return isAuthenticated && user && user.id === comment.zj_user_id;
  };

  // 检查用户是否可以删除评论（作者或管理员）
  const canDeleteComment = (comment) => {
    return isAuthenticated && user && (
      user.id === comment.zj_user_id || // 是评论作者
      user.role === 'admin' // 是管理员
    );
  };

  // 检查用户是否可以编辑评论（仅作者可以）
  const canEditComment = (comment) => {
    return isAuthenticated && user && user.id === comment.zj_user_id;
  };

  // 渲染评论编辑表单
  const renderEditForm = (comment) => {
    return (
      <div className="comment-edit-form">
        <div className="rating-input">
          <label>您的评分:</label>
          <div className="rating-stars">
            {[1, 2, 3, 4, 5].map(value => (
              <label key={value} className="rating-star-label">
                <input
                  type="radio"
                  name="editRating"
                  value={value}
                  checked={editRating === value}
                  onChange={handleEditRatingChange}
                />
                <span className={`star ${value <= editRating ? 'filled' : 'empty'}`}>
                  ★
                </span>
              </label>
            ))}
          </div>
        </div>

        <textarea
          className="comment-textarea"
          value={editContent}
          onChange={handleEditContentChange}
          required
        />

        <div className="edit-actions">
          <button
            type="button"
            className="save-edit-btn"
            onClick={() => handleSubmitEdit(comment.zj_comment_id)}
          >
            保存修改
          </button>
          <button
            type="button"
            className="cancel-edit-btn"
            onClick={handleCancelEdit}
          >
            取消
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="comments-section">
      <h2 className="comments-title">观众评论</h2>

      {isAuthenticated ? (
        <form onSubmit={handleSubmitComment} className="comment-form">
          <div className="rating-input">
            <label>您的评分:</label>
            <div className="rating-stars">
              {[1, 2, 3, 4, 5].map(value => (
                <label key={value} className="rating-star-label">
                  <input
                    type="radio"
                    name="rating"
                    value={value}
                    checked={rating === value}
                    onChange={handleRatingChange}
                  />
                  <span className={`star ${value <= rating ? 'filled' : 'empty'}`}>
                    ★
                  </span>
                </label>
              ))}
            </div>
          </div>

          <textarea
            className="comment-textarea"
            placeholder="写下您对这部电影的看法..."
            value={newComment}
            onChange={handleCommentChange}
            required
          />

          <button
            type="submit"
            className="submit-comment-btn"
            disabled={isSubmitting}
          >
            {isSubmitting ? '提交中...' : '发表评论'}
          </button>
        </form>
      ) : (
        <div className="login-prompt">
          请<a href="/login">登录</a>后发表评论
        </div>
      )}

      <div className="comments-list">
        {loading ? (
          <div className="loading-comments">加载评论中...</div>
        ) : error ? (
          <div className="error-comments">{error}</div>
        ) : comments.length === 0 ? (
          <div className="no-comments">暂无评论，快来发表第一条评论吧！</div>
        ) : (
          comments.map(comment => (
            <div key={comment.zj_comment_id} className="comment-item">
              <div className="comment-header">
                <div className="comment-user">
                  <img
                    src={comment.avatar || '/default-avatar.svg'}
                    alt={comment.username}
                    className="user-avatar"
                    onError={(e) => {
                      e.target.src = '/default-avatar.svg';
                    }}
                  />
                  <span className="username">{comment.username}</span>
                </div>
                <div className="comment-meta">
                  <div className="comment-rating">
                    {renderStars(comment.zj_rating)}
                  </div>
                  <div className="comment-date">
                    {formatDate(comment.zj_created_at)}
                    {comment.zj_updated_at && comment.zj_updated_at !== comment.zj_created_at && (
                      <span className="edited-mark"> (修改于 {formatDate(comment.zj_updated_at)})</span>
                    )}
                  </div>
                </div>
              </div>

              {editingComment === comment.zj_comment_id ? (
                renderEditForm(comment)
              ) : (
                <>
                  <div className="comment-content">
                    {comment.zj_content}
                  </div>

                  <div className="comment-actions">
                    {canEditComment(comment) && (
                      <button
                        className="edit-comment-btn"
                        onClick={() => handleEditComment(comment)}
                      >
                        <i className="fas fa-edit"></i> 编辑
                      </button>
                    )}
                    {canDeleteComment(comment) && (
                      <button
                        className="delete-comment-btn"
                        onClick={() => handleDeleteComment(comment.zj_comment_id)}
                      >
                        <i className="fas fa-trash"></i> 删除
                      </button>
                    )}
                  </div>
                </>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Comments;