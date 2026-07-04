# 电影展示平台后端

这是一个电影展示平台的后端服务，提供用户认证、电影管理、收藏管理和评论等功能。

## 项目结构

```
backend/
├── config/             # 配置文件
│   └── db.js           # 数据库配置
├── controllers/        # 控制器
│   ├── userController.js     # 用户相关控制器
│   ├── movieController.js    # 电影相关控制器
│   ├── favoriteController.js # 收藏相关控制器
│   └── commentController.js  # 评论相关控制器
├── middleware/         # 中间件
│   ├── auth.js         # 认证中间件
│   └── upload.js       # 文件上传中间件
├── models/             # 数据库模型和迁移文件
├── public/             # 静态资源
│   ├── img/            # 电影海报图片
│   ├── videos/         # 电影视频文件
│   └── avatars/        # 用户头像
├── routes/             # 路由
│   ├── userRoutes.js   # 用户相关路由
│   ├── movieRoutes.js  # 电影相关路由
│   ├── favoriteRoutes.js # 收藏相关路由
│   └── commentRoutes.js # 评论相关路由
├── server.js           # 主服务器文件
└── package.json        # 项目依赖
```

## 功能模块

### 用户模块
- 用户注册
- 用户登录
- 获取用户信息
- 更新用户信息
- 修改密码
- VIP会员管理

### 电影模块
- 添加电影
- 获取电影列表
- 获取电影详情
- 更新电影信息
- 删除电影
- 获取热门电影

### 收藏模块
- 添加收藏
- 获取收藏列表
- 删除收藏

### 评论模块
- 添加评论
- 获取评论列表
- 更新评论
- 删除评论

## 启动服务

```bash
npm install
npm start
```

服务器默认在 http://localhost:5000 运行。