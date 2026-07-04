const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

// 导入路由
const userRoutes = require('./routes/userRoutes');
const favoriteRoutes = require('./routes/favoriteRoutes');
const movieRoutes = require('./routes/movieRoutes');
const commentRoutes = require('./routes/commentRoutes');
const statsRoutes = require('./routes/statsRoutes');

const app = express();

// 中间件
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 静态文件
app.use('/img', express.static(path.join(__dirname, 'public', 'img')));
app.use('/videos', express.static(path.join(__dirname, 'public', 'videos')));
app.use('/avatars', express.static(path.join(__dirname, 'public', 'avatars')));

// 设置端口
const PORT = process.env.PORT || 5000;

// 使用路由
app.use('/api', userRoutes);
app.use('/api', favoriteRoutes);
app.use('/api', movieRoutes);
app.use('/api', commentRoutes);
app.use('/api', statsRoutes);

// 启动服务器
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
