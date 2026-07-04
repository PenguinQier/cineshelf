-- 在users表中添加VIP字段
ALTER TABLE users
ADD COLUMN zj_viper BOOLEAN DEFAULT FALSE;

-- 更新用户表中的说明
COMMENT ON COLUMN users.zj_viper IS '用户是否为VIP会员';