CREATE TABLE comments (
    zj_comment_id INT AUTO_INCREMENT PRIMARY KEY,
    zj_movie_id INT NOT NULL,
    zj_user_id INT NOT NULL,
    zj_content TEXT NOT NULL,
    zj_rating DECIMAL(3,1) CHECK (zj_rating >= 0 AND zj_rating <= 10),
    zj_created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    zj_updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    zj_status ENUM('active', 'deleted', 'flagged') DEFAULT 'active',

    FOREIGN KEY (zj_movie_id) REFERENCES movies(zj_movies_id) ON DELETE CASCADE,
    FOREIGN KEY (zj_user_id) REFERENCES users(zj_Users_id) ON DELETE CASCADE,

    INDEX (zj_movie_id),
    INDEX (zj_user_id)
) COMMENT='电影评论表';