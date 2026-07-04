-- 修改movies表
ALTER TABLE movies
  CHANGE id zj_movies_id INT AUTO_INCREMENT,
  CHANGE title zj_title TEXT NOT NULL,
  CHANGE year zj_year INTEGER NOT NULL,
  CHANGE imdbID zj_imdbID TEXT NOT NULL,
  CHANGE type zj_type TEXT NOT NULL,
  CHANGE poster zj_poster TEXT,
  CHANGE video zj_video TEXT,
  CHANGE description zj_description TEXT,
  CHANGE rating zj_rating DECIMAL(3,1) DEFAULT 0,
  CHANGE genres zj_genres TEXT,
  CHANGE main_category zj_main_category VARCHAR(50) DEFAULT NULL,
  CHANGE sub_category zj_sub_category VARCHAR(255) DEFAULT NULL;

-- 修改users表
ALTER TABLE users
  CHANGE id zj_users_id INT AUTO_INCREMENT,
  CHANGE username zj_username VARCHAR(50) NOT NULL,
  CHANGE email zj_email VARCHAR(100) NOT NULL,
  CHANGE password zj_password VARCHAR(255) NOT NULL,
  CHANGE avatar zj_avatar TEXT DEFAULT NULL,
  CHANGE created_at zj_created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CHANGE updated_at zj_updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP;

-- 修改评论表
ALTER TABLE comments
  CHANGE id zj_id INT AUTO_INCREMENT,
  CHANGE user_id zj_user_id INT NOT NULL,
  CHANGE movie_id zj_movie_id INT NOT NULL,
  CHANGE content zj_content TEXT NOT NULL,
  CHANGE rating zj_rating INT,
  CHANGE created_at zj_created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CHANGE updated_at zj_updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP;

-- 修改favorites表
ALTER TABLE favorites
  CHANGE id zj_favorites_id INT AUTO_INCREMENT,
  CHANGE user_id zj_user_id INT NOT NULL,
  CHANGE movie_id zj_movie_id INT NOT NULL,
  CHANGE created_at zj_created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;

-- 修改索引
DROP INDEX idx_username ON users;
DROP INDEX idx_email ON users;
CREATE INDEX idx_username ON users(zj_username);
CREATE INDEX idx_email ON users(zj_email);

-- 修改评论表索引
DROP INDEX idx_comment_user ON comments;
DROP INDEX idx_comment_movie ON comments;
DROP INDEX idx_comment_created ON comments;
CREATE INDEX idx_comment_user ON comments(zj_user_id);
CREATE INDEX idx_comment_movie ON comments(zj_movie_id);
CREATE INDEX idx_comment_created ON comments(zj_created_at);

-- 修改外键约束
ALTER TABLE favorites DROP FOREIGN KEY favorites_ibfk_1;
ALTER TABLE favorites DROP FOREIGN KEY favorites_ibfk_2;
ALTER TABLE favorites ADD CONSTRAINT favorites_ibfk_1 FOREIGN KEY (zj_user_id) REFERENCES users(zj_users_id) ON DELETE CASCADE;
ALTER TABLE favorites ADD CONSTRAINT favorites_ibfk_2 FOREIGN KEY (zj_movie_id) REFERENCES movies(zj_movies_id) ON DELETE CASCADE;

ALTER TABLE comments DROP FOREIGN KEY comments_ibfk_1;
ALTER TABLE comments DROP FOREIGN KEY comments_ibfk_2;
ALTER TABLE comments ADD CONSTRAINT comments_ibfk_1 FOREIGN KEY (zj_user_id) REFERENCES users(zj_users_id) ON DELETE CASCADE;
ALTER TABLE comments ADD CONSTRAINT comments_ibfk_2 FOREIGN KEY (zj_movie_id) REFERENCES movies(zj_movies_id) ON DELETE CASCADE;

-- 修改唯一键约束
ALTER TABLE favorites DROP INDEX unique_favorite;
ALTER TABLE favorites ADD UNIQUE KEY unique_favorite (zj_user_id, zj_movie_id);