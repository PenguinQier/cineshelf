-- 向movies表添加分类相关字段
ALTER TABLE movies ADD COLUMN zj_main_category VARCHAR(50) DEFAULT NULL;
ALTER TABLE movies ADD COLUMN zj_sub_category VARCHAR(255) DEFAULT NULL;

-- 更新现有数据，设置默认值
-- 电影类型设置为film主分类，并根据现有type设置子分类
UPDATE movies SET zj_main_category = 'film' WHERE 1=1;
UPDATE movies SET zj_sub_category = '电影' WHERE zj_type = 'movie';
UPDATE movies SET zj_sub_category = '电视剧' WHERE zj_type = 'series';
UPDATE movies SET zj_sub_category = '动漫' WHERE zj_type = 'anime';
UPDATE movies SET zj_sub_category = '综艺' WHERE zj_type = 'variety';
UPDATE movies SET zj_sub_category = '纪录片' WHERE zj_type = 'documentary';
UPDATE movies SET zj_sub_category = '少儿' WHERE zj_type = 'children';
UPDATE movies SET zj_sub_category = '短剧' WHERE zj_type = 'shortVideo';

-- 创建评论表
CREATE TABLE IF NOT EXISTS comments (
    zj_id INT AUTO_INCREMENT PRIMARY KEY,
    zj_user_id INT NOT NULL,
    zj_movie_id INT NOT NULL,
    zj_content TEXT NOT NULL,
    zj_rating INT,
    zj_created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    zj_updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (zj_user_id) REFERENCES users(zj_users_id) ON DELETE CASCADE,
    FOREIGN KEY (zj_movie_id) REFERENCES movies(zj_movies_id) ON DELETE CASCADE
);

-- 添加索引提高查询效率
CREATE INDEX IF NOT EXISTS idx_comment_user ON comments(zj_user_id);
CREATE INDEX IF NOT EXISTS idx_comment_movie ON comments(zj_movie_id);
CREATE INDEX IF NOT EXISTS idx_comment_created ON comments(zj_created_at);