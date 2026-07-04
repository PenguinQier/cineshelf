-- 在movies表中添加VIP字段
ALTER TABLE movies
ADD COLUMN zj_vip BOOLEAN DEFAULT FALSE;

-- 更新已存在的热门电影为VIP电影（评分高于9.0的电影）
UPDATE movies
SET zj_vip = TRUE
WHERE zj_rating > 9.0;