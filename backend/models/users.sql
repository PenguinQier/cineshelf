-- 创建users表
CREATE TABLE users (
    zj_users_id INT AUTO_INCREMENT PRIMARY KEY,
    zj_username VARCHAR(50) NOT NULL UNIQUE,
    zj_email VARCHAR(100) NOT NULL UNIQUE,
    zj_password VARCHAR(255) NOT NULL,
    zj_avatar TEXT DEFAULT NULL,
    zj_created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    zj_updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- 添加索引提高查询效率
CREATE INDEX idx_username ON users(zj_username);
CREATE INDEX idx_email ON users(zj_email);

-- 创建用户收藏表，用于存储用户收藏的电影
CREATE TABLE favorites (
    zj_favorites_id INT AUTO_INCREMENT PRIMARY KEY,
    zj_user_id INT NOT NULL,
    zj_movie_id INT NOT NULL,
    zj_created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (zj_user_id) REFERENCES users(zj_users_id) ON DELETE CASCADE,
    FOREIGN KEY (zj_movie_id) REFERENCES movies(zj_movies_id) ON DELETE CASCADE,
    UNIQUE KEY unique_favorite (zj_user_id, zj_movie_id)
);