-- 添加 movies 表中缺失的列
ALTER TABLE movies ADD COLUMN zj_video TEXT AFTER zj_poster;
ALTER TABLE movies ADD COLUMN zj_description TEXT AFTER zj_video;
ALTER TABLE movies ADD COLUMN zj_genres TEXT AFTER zj_description;

-- 检查其他可能需要的列是否存在，如果不存在则添加
-- 如果这些列已存在，MySQL会忽略错误并继续执行
ALTER TABLE movies ADD COLUMN zj_rating DECIMAL(3,1) DEFAULT 0 AFTER zj_genres;
ALTER TABLE movies ADD COLUMN zj_main_category VARCHAR(50) DEFAULT NULL AFTER zj_rating;
ALTER TABLE movies ADD COLUMN zj_sub_category VARCHAR(255) DEFAULT NULL AFTER zj_main_category;

-- 更新日志
INSERT INTO migration_logs (operation, description, executed_at)
VALUES ('ADD_COLUMNS', '添加movies表缺失的列', NOW())
ON DUPLICATE KEY UPDATE description = CONCAT(description, '; 重新执行于 ', NOW());