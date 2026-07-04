-- 在users表中添加角色字段
ALTER TABLE users
ADD COLUMN zj_role ENUM('admin', 'vip', 'user') DEFAULT 'user';

-- 更新用户表中的说明
COMMENT ON COLUMN users.zj_role IS '用户角色: admin(管理员), vip(VIP用户), user(普通用户)';

-- 为已有的VIP用户设置角色
UPDATE users SET zj_role = 'vip' WHERE zj_viper = TRUE;

-- 设置管理员用户，使用已有的第一个用户作为管理员
UPDATE users SET zj_role = 'admin' WHERE zj_users_id = 1;