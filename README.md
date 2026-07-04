# CineShelf（影架）

CineShelf（影架）是一个前后端分离的电影展示平台，像一个可以持续整理、收藏和展示影片的小型片库。它包含电影列表、分类筛选、搜索、详情播放、用户注册登录、收藏、评论、会员状态和后台上传等功能。项目使用 React 构建前端页面，Express + MySQL 提供后端 API。

## 功能特性

- 首页电影推荐与热门电影展示
- 电影搜索、分页和分类筛选
- 电影详情页，支持海报、简介、视频地址和评论区
- 用户注册、登录、资料编辑和头像上传
- JWT 登录鉴权
- 收藏电影与取消收藏
- 评论发布、编辑和删除
- VIP/会员状态管理
- 管理员上传电影海报和视频
- 后端统计接口，用于展示电影收藏/评论等数据

## 技术栈

### 前端

- React 19
- React Router DOM
- Create React App / react-scripts
- CSS
- Fetch / Axios

### 后端

- Node.js
- Express
- MySQL / mysql2
- JWT
- bcryptjs
- multer
- dotenv

## 项目结构

```text
.
|-- backend/
|   |-- config/          # 数据库配置
|   |-- controllers/     # 业务控制器
|   |-- middleware/      # 鉴权和上传中间件
|   |-- models/          # SQL 建表和迁移脚本
|   |-- public/          # 后端静态资源目录
|   |-- routes/          # API 路由
|   |-- server.js        # Express 入口
|   `-- package.json
|-- frontend/
|   |-- public/          # 前端静态资源
|   |-- src/
|   |   |-- components/  # 通用组件
|   |   |-- contexts/    # 登录状态上下文
|   |   |-- pages/       # 页面组件
|   |   |-- services/    # API 请求封装
|   |   `-- styles/      # 页面样式
|   `-- package.json
|-- .gitignore
`-- README.md
```

## 快速开始

### 1. 准备 MySQL 数据库

创建数据库：

```sql
CREATE DATABASE movie_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

按需执行后端 SQL 文件：

```bash
mysql -u root -p movie_db < backend/models/movies.sql
mysql -u root -p movie_db < backend/models/users.sql
mysql -u root -p movie_db < backend/models/comments.sql
mysql -u root -p movie_db < backend/models/migrations.sql
```

如果你已有课程数据库，可以根据 `backend/models/` 中的迁移脚本逐个补字段。

### 2. 配置后端环境变量

复制示例配置：

```bash
cd backend
copy .env.example .env
```

macOS/Linux：

```bash
cp .env.example .env
```

根据本机 MySQL 修改 `.env`：

```env
PORT=5000
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=123456
DB_NAME=movie_db
JWT_SECRET=replace_with_your_secret
```

### 3. 安装依赖

后端：

```bash
cd backend
npm install
```

前端：

```bash
cd ../frontend
npm install
```

### 4. 启动后端

```bash
cd backend
npm start
```

后端默认运行在：

```text
http://localhost:5000
```

### 5. 启动前端

```bash
cd frontend
npm start
```

浏览器打开：

```text
http://localhost:3000
```

## 常用命令

后端：

```bash
npm start        # 启动 Express 服务
npm run dev      # 开发启动，当前等同于 npm start
```

前端：

```bash
npm start        # 启动 CRA 开发服务
npm run build    # 构建生产版本
npm test         # 运行测试
```

## 主要 API

| Method | Path | 说明 |
| --- | --- | --- |
| POST | `/api/register` | 用户注册 |
| POST | `/api/login` | 用户登录 |
| GET | `/api/user` | 获取当前用户 |
| PUT | `/api/user` | 更新用户资料 |
| PUT | `/api/change-password` | 修改密码 |
| PUT | `/api/update-vip` | 更新会员状态 |
| GET | `/api/movies` | 获取电影列表 |
| GET | `/api/movies/:id` | 获取电影详情 |
| POST | `/api/movies` | 管理员上传电影 |
| PUT | `/api/movies/:id` | 管理员更新电影 |
| DELETE | `/api/movies/:id` | 管理员删除电影 |
| GET | `/api/popular` | 获取热门电影 |
| GET | `/api/favorites` | 获取收藏列表 |
| POST | `/api/favorites/:movieId` | 添加收藏 |
| DELETE | `/api/favorites/:movieId` | 取消收藏 |
| GET | `/api/movies/:movieId/comments` | 获取评论 |
| POST | `/api/movies/:movieId/comments` | 发布评论 |
| PUT | `/api/comments/:commentId` | 更新评论 |
| DELETE | `/api/comments/:commentId` | 删除评论 |
| GET | `/api/stats/movie/:movieId` | 获取单部电影统计 |
| POST | `/api/stats/movies/batch` | 批量获取电影统计 |

## 本地媒体文件

项目本地包含一些上传视频、头像和图片资源。为了避免 GitHub 仓库过大，也避免上传课程/本地运行时产生的媒体文件，以下内容默认不会提交：

- `backend/public/videos/`
- `backend/public/avatars/`
- `frontend/public/videos/`
- `frontend/public/avatars/`
- 前后端 `node_modules/`
- 前端 `build/`

目录会通过 `.gitkeep` 保留。需要演示视频时，把本地文件重新放回对应目录即可。

## 验证状态

已在本地执行：

```bash
# 后端 JS 语法检查
node --check backend/**/*.js

# 前端生产构建
cd frontend
npm run build
```

说明：前端构建成功，但 CRA/ESLint 会提示少量 warning，主要是 Hook 依赖和未使用变量；这些不影响构建产物。

## 后续优化

- 将前端 API Base URL 抽成环境变量
- 补充统一的一键启动脚本
- 增加数据库初始化脚本顺序说明
- 增加管理员账号初始化说明
- 优化上传文件大小和类型校验
