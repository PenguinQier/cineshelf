const multer = require('multer');
const path = require('path');
const fs = require('fs');

// 配置文件存储
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    let dir = './public/img';
    // 根据文件类型选择不同的存储目录
    if (file.fieldname === 'video') {
      dir = './public/videos';
    } else if (file.fieldname === 'avatar') {
      dir = './public/avatars';
    }

    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ storage: storage });

module.exports = upload;