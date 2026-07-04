const pool = require('../config/db');

// 添加电影
const addMovie = async (req, res) => {
  try {
    const { title, year, imdbID, type, description, rating, genres, mainCategory, subCategory, vip } = req.body;

    // 处理海报和视频文件
    const poster = req.files.poster ? `http://localhost:5000/img/${req.files.poster[0].filename}` : null;
    const video = req.files.video ? `http://localhost:5000/videos/${req.files.video[0].filename}` : null;

    // 验证必填字段
    if (!title || !year || !type) {
      return res.status(400).json({ error: '缺少必填字段: title, year, type' });
    }

    // 转换VIP字段为布尔值
    const isVip = vip === 'true' || vip === true;

    const connection = await pool.getConnection();
    try {
      // 修改插入语句，包含VIP字段
      const [result] = await connection.query(
        'INSERT INTO movies (zj_title, zj_year, zj_imdbID, zj_type, zj_poster, zj_video, zj_description, zj_rating, zj_genres, zj_main_category, zj_sub_category, zj_vip) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
        [title, year, imdbID || null, type, poster, video, description || null, rating || 0, genres || null, mainCategory || null, subCategory || null, isVip]
      );

      // 获取刚插入的电影，同时添加字段映射
      const [movies] = await connection.query(
        `SELECT
          zj_movies_id as id,
          zj_title as title,
          zj_year as year,
          zj_imdbID as imdbID,
          zj_type as type,
          zj_poster as poster,
          zj_video as video,
          zj_description as description,
          zj_rating as rating,
          zj_genres as genres,
          zj_vip as vip
        FROM movies WHERE zj_movies_id = ?`,
        [result.insertId]
      );

      res.status(201).json({
        message: '电影添加成功',
        movie: movies[0]
      });
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error('添加电影失败:', error);
    res.status(500).json({ error: '服务器错误' });
  }
};

// 获取热门电影
const getPopularMovies = async (req, res) => {
  try {
    // 获取查询参数
    const { page = 1, limit = 8, sortBy = 'combined' } = req.query;
    const pageInt = parseInt(page);
    const limitInt = parseInt(limit);
    const offset = (pageInt - 1) * limitInt;

    // 获取连接
    const connection = await pool.getConnection();

    try {
      // 先查询一下favorites表的结构，确定主键名称
      const [favoriteColumns] = await connection.query(`SHOW COLUMNS FROM favorites`);
      const [commentColumns] = await connection.query(`SHOW COLUMNS FROM comments`);

      // 找出favorites表的主键列名
      let favoritePrimaryKey = 'id'; // 默认值
      for (const column of favoriteColumns) {
        if (column.Key === 'PRI') {
          favoritePrimaryKey = column.Field;
          break;
        }
      }

      // 找出comments表的主键列名
      let commentPrimaryKey = 'id'; // 默认值
      for (const column of commentColumns) {
        if (column.Key === 'PRI') {
          commentPrimaryKey = column.Field;
          break;
        }
      }

      let sql;
      let countSql;
      let params = [];

      if (sortBy === 'combined') {
        // 综合排序：基于评分、收藏数和评论数的加权排序
        sql = `
          SELECT
            m.zj_movies_id as id,
            m.zj_title as title,
            m.zj_year as year,
            m.zj_imdbID as imdbID,
            m.zj_type as type,
            m.zj_poster as poster,
            m.zj_video as video,
            m.zj_description as description,
            m.zj_rating as rating,
            m.zj_genres as genres,
            m.zj_main_category as main_category,
            m.zj_sub_category as sub_category,
            m.zj_vip as vip,
            COUNT(DISTINCT f.${favoritePrimaryKey}) as favorite_count,
            COUNT(DISTINCT c.${commentPrimaryKey}) as comment_count,
            (m.zj_rating * 10) + (COUNT(DISTINCT f.${favoritePrimaryKey}) * 2) + (COUNT(DISTINCT c.${commentPrimaryKey})) as popularity_score
          FROM
            movies m
            LEFT JOIN favorites f ON m.zj_movies_id = f.zj_movie_id
            LEFT JOIN comments c ON m.zj_movies_id = c.zj_movie_id
          WHERE
            m.zj_rating >= 7.0
          GROUP BY
            m.zj_movies_id, m.zj_title, m.zj_year, m.zj_imdbID, m.zj_type, m.zj_poster,
            m.zj_video, m.zj_description, m.zj_rating, m.zj_genres, m.zj_main_category,
            m.zj_sub_category, m.zj_vip
          ORDER BY
            popularity_score DESC, m.zj_rating DESC
          LIMIT ? OFFSET ?
        `;

        countSql = `
          SELECT COUNT(*) as total FROM (
            SELECT m.zj_movies_id
            FROM movies m
            WHERE m.zj_rating >= 7.0
          ) as movie_count
        `;
      } else if (sortBy === 'rating') {
        // 仅按评分排序
        sql = `
          SELECT
            zj_movies_id as id,
            zj_title as title,
            zj_year as year,
            zj_imdbID as imdbID,
            zj_type as type,
            zj_poster as poster,
            zj_video as video,
            zj_description as description,
            zj_rating as rating,
            zj_genres as genres,
            zj_main_category as main_category,
            zj_sub_category as sub_category,
            zj_vip as vip
          FROM movies
          WHERE zj_rating >= 7.0
          ORDER BY zj_rating DESC
          LIMIT ? OFFSET ?
        `;

        countSql = 'SELECT COUNT(*) as total FROM movies WHERE zj_rating >= 7.0';
      } else if (sortBy === 'favorites') {
        // 按收藏数排序
        sql = `
          SELECT
            m.zj_movies_id as id,
            m.zj_title as title,
            m.zj_year as year,
            m.zj_imdbID as imdbID,
            m.zj_type as type,
            m.zj_poster as poster,
            m.zj_video as video,
            m.zj_description as description,
            m.zj_rating as rating,
            m.zj_genres as genres,
            m.zj_main_category as main_category,
            m.zj_sub_category as sub_category,
            m.zj_vip as vip,
            COUNT(f.${favoritePrimaryKey}) as favorite_count
          FROM
            movies m
            LEFT JOIN favorites f ON m.zj_movies_id = f.zj_movie_id
          WHERE
            m.zj_rating >= 7.0
          GROUP BY
            m.zj_movies_id, m.zj_title, m.zj_year, m.zj_imdbID, m.zj_type, m.zj_poster,
            m.zj_video, m.zj_description, m.zj_rating, m.zj_genres, m.zj_main_category,
            m.zj_sub_category, m.zj_vip
          ORDER BY
            favorite_count DESC, m.zj_rating DESC
          LIMIT ? OFFSET ?
        `;

        countSql = `
          SELECT COUNT(*) as total FROM (
            SELECT m.zj_movies_id
            FROM movies m
            WHERE m.zj_rating >= 7.0
          ) as movie_count
        `;
      } else if (sortBy === 'comments') {
        // 按评论数排序
        sql = `
          SELECT
            m.zj_movies_id as id,
            m.zj_title as title,
            m.zj_year as year,
            m.zj_imdbID as imdbID,
            m.zj_type as type,
            m.zj_poster as poster,
            m.zj_video as video,
            m.zj_description as description,
            m.zj_rating as rating,
            m.zj_genres as genres,
            m.zj_main_category as main_category,
            m.zj_sub_category as sub_category,
            m.zj_vip as vip,
            COUNT(c.${commentPrimaryKey}) as comment_count
          FROM
            movies m
            LEFT JOIN comments c ON m.zj_movies_id = c.zj_movie_id
          WHERE
            m.zj_rating >= 7.0
          GROUP BY
            m.zj_movies_id, m.zj_title, m.zj_year, m.zj_imdbID, m.zj_type, m.zj_poster,
            m.zj_video, m.zj_description, m.zj_rating, m.zj_genres, m.zj_main_category,
            m.zj_sub_category, m.zj_vip
          ORDER BY
            comment_count DESC, m.zj_rating DESC
          LIMIT ? OFFSET ?
        `;

        countSql = `
          SELECT COUNT(*) as total FROM (
            SELECT m.zj_movies_id
            FROM movies m
            WHERE m.zj_rating >= 7.0
          ) as movie_count
        `;
      }

      params = [limitInt, offset];

      // 执行查询
      const [movies] = await connection.query(sql, params);
      const [[{ total }]] = await connection.query(countSql);

      // 返回结果
      res.json({
        movies,
        totalResults: total,
        totalPages: Math.ceil(total / limitInt),
        currentPage: pageInt
      });
    } finally {
      // 释放连接
      connection.release();
    }
  } catch (error) {
    console.error('获取热门电影失败:', error);
    res.status(500).json({ error: '服务器错误' });
  }
};

// 获取电影列表
const getMovies = async (req, res) => {
  try {
    // 获取查询参数
    const {
      search = '',
      genre = '',
      type = '',
      mainCategory = '',
      subCategory = '',
      page = 1,
      limit = 4,
      vipOnly = 'false'
    } = req.query;
    const pageInt = parseInt(page);
    const limitInt = parseInt(limit);
    const offset = (pageInt - 1) * limitInt;

    // 构建基础SQL查询
    let sql = `SELECT
      zj_movies_id as id,
      zj_title as title,
      zj_year as year,
      zj_imdbID as imdbID,
      zj_type as type,
      zj_poster as poster,
      zj_video as video,
      zj_description as description,
      zj_rating as rating,
      zj_genres as genres,
      zj_main_category as main_category,
      zj_sub_category as sub_category,
      zj_vip as vip
    FROM movies WHERE 1=1`;

    let countSql = 'SELECT COUNT(*) as total FROM movies WHERE 1=1';
    const params = [];
    const countParams = [];

    // 添加搜索条件
    if (search) {
      sql += ' AND (zj_title LIKE ? OR zj_description LIKE ? OR zj_genres LIKE ? OR zj_imdbID LIKE ?)';
      countSql += ' AND (zj_title LIKE ? OR zj_description LIKE ? OR zj_genres LIKE ? OR zj_imdbID LIKE ?)';
      const searchParam = `%${search}%`;
      params.push(searchParam, searchParam, searchParam, searchParam);
      countParams.push(searchParam, searchParam, searchParam, searchParam);
    }

    // 添加类型条件
    if (genre) {
      sql += ' AND zj_genres LIKE ?';
      countSql += ' AND zj_genres LIKE ?';
      params.push(`%${genre}%`);
      countParams.push(`%${genre}%`);
    }

    // 添加影片类型筛选（电影、电视剧等）
    if (type && type !== 'all') {
      sql += ' AND zj_type = ?';
      countSql += ' AND zj_type = ?';
      params.push(type);
      countParams.push(type);
    }

    // 添加主分类筛选
    if (mainCategory) {
      sql += ' AND zj_main_category = ?';
      countSql += ' AND zj_main_category = ?';
      params.push(mainCategory);
      countParams.push(mainCategory);
    }

    // 添加子分类筛选
    if (subCategory) {
      sql += ' AND zj_sub_category LIKE ?';
      countSql += ' AND zj_sub_category LIKE ?';
      params.push(`%${subCategory}%`);
      countParams.push(`%${subCategory}%`);
    }

    // 添加VIP筛选
    if (vipOnly === 'true') {
      sql += ' AND zj_vip = TRUE';
      countSql += ' AND zj_vip = TRUE';
    }

    // 添加分页
    sql += ' LIMIT ? OFFSET ?';
    params.push(limitInt, offset);

    // 获取连接
    const connection = await pool.getConnection();

    try {
      // 执行查询
      const [movies] = await connection.query(sql, params);
      const [[{ total }]] = await connection.query(countSql, countParams);

      // 返回结果
      res.json({
        movies,
        totalResults: total,
        totalPages: Math.ceil(total / limitInt),
        currentPage: pageInt
      });
    } finally {
      // 释放连接
      connection.release();
    }
  } catch (error) {
    console.error('Database error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// 获取单个电影详情
const getMovieById = async (req, res) => {
  try {
    const { id } = req.params;
    const connection = await pool.getConnection();

    try {
      const [movies] = await connection.query(
        `SELECT
          zj_movies_id as id,
          zj_title as title,
          zj_year as year,
          zj_imdbID as imdbID,
          zj_type as type,
          zj_poster as poster,
          zj_video as video,
          zj_description as description,
          zj_rating as rating,
          zj_genres as genres,
          zj_main_category as main_category,
          zj_sub_category as sub_category,
          zj_vip as vip
        FROM movies WHERE zj_movies_id = ?`,
        [id]
      );

      if (movies.length === 0) {
        return res.status(404).json({ error: '未找到该电影' });
      }

      res.json(movies[0]);
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error('获取电影详情失败:', error);
    res.status(500).json({ error: '服务器错误' });
  }
};

// 更新电影
const updateMovie = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, year, imdbID, type, description, rating, genres, vip } = req.body;

    const connection = await pool.getConnection();
    try {
      // 检查电影是否存在
      const [movies] = await connection.query(
        'SELECT * FROM movies WHERE zj_movies_id = ?',
        [id]
      );

      if (movies.length === 0) {
        return res.status(404).json({ error: '电影不存在' });
      }

      // 构建更新字段
      const updateFields = {};
      if (title !== undefined) updateFields.zj_title = title;
      if (year !== undefined) updateFields.zj_year = year;
      if (imdbID !== undefined) updateFields.zj_imdbID = imdbID;
      if (type !== undefined) updateFields.zj_type = type;
      if (description !== undefined) updateFields.zj_description = description;
      if (rating !== undefined) updateFields.zj_rating = rating;
      if (genres !== undefined) updateFields.zj_genres = genres;
      if (vip !== undefined) updateFields.zj_vip = vip === true || vip === 'true';

      if (Object.keys(updateFields).length === 0) {
        return res.status(400).json({ error: '没有提供需要更新的字段' });
      }

      // 更新电影
      await connection.query(
        'UPDATE movies SET ? WHERE zj_movies_id = ?',
        [updateFields, id]
      );

      // 获取更新后的电影
      const [updatedMovies] = await connection.query(
        `SELECT
          zj_movies_id as id,
          zj_title as title,
          zj_year as year,
          zj_imdbID as imdbID,
          zj_type as type,
          zj_poster as poster,
          zj_video as video,
          zj_description as description,
          zj_rating as rating,
          zj_genres as genres,
          zj_vip as vip
        FROM movies WHERE zj_movies_id = ?`,
        [id]
      );

      res.json(updatedMovies[0]);
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error('更新电影失败:', error);
    res.status(500).json({ error: '服务器错误' });
  }
};

// 删除电影
const deleteMovie = async (req, res) => {
  try {
    const { id } = req.params;

    const connection = await pool.getConnection();
    try {
      // 检查电影是否存在
      const [movies] = await connection.query(
        'SELECT * FROM movies WHERE zj_movies_id = ?',
        [id]
      );

      if (movies.length === 0) {
        return res.status(404).json({ error: '电影不存在' });
      }

      // 删除电影
      await connection.query(
        'DELETE FROM movies WHERE zj_movies_id = ?',
        [id]
      );

      res.json({ message: '电影删除成功' });
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error('删除电影失败:', error);
    res.status(500).json({ error: '服务器错误' });
  }
};

module.exports = {
  addMovie,
  getPopularMovies,
  getMovies,
  getMovieById,
  updateMovie,
  deleteMovie
};