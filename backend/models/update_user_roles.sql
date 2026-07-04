-- 为已有的VIP用户设置角色
UPDATE users SET zj_role = 'vip' WHERE zj_viper = TRUE;

-- 设置管理员用户，使用已有的第一个用户作为管理员
UPDATE users SET zj_role = 'admin' WHERE zj_users_id = 1;