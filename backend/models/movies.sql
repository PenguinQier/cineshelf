-- 创建 movies 表
CREATE TABLE movies (
    zj_movies_id INT AUTO_INCREMENT PRIMARY KEY,  -- 使用 INT 并设置为自动递增
    zj_title TEXT NOT NULL,
    zj_year INTEGER NOT NULL,
    zj_imdbID TEXT NOT NULL,
    zj_type TEXT NOT NULL,
    zj_poster TEXT
);

-- 然后插入数据（如之前所示）

-- 插入数据
INSERT INTO movies (zj_movies_id, zj_title, zj_year, zj_imdbID, zj_type, zj_poster) VALUES
('1', 'Interstellar1', 2014, 'tt0816692', 'movie', 'http://localhost:5000/img/1.jpg'),
('2', 'Interstellar2', 2014, 'tt0816692', 'movie', 'http://localhost:5000/img/2.jpg'),
('3', 'Interstellar3', 2014, 'tt0816692', 'movie', 'http://localhost:5000/img/3.jpg'),
('4', 'Interstellar4', 2014, 'tt0816692', 'movie', 'http://localhost:5000/img/4.jpg'),
('5', 'Interstellar5', 2014, 'tt0816692', 'movie', 'http://localhost:5000/img/5.jpg'),
('6', 'Interstellar6', 2014, 'tt0816692', 'movie', 'http://localhost:5000/img/6.jpg'),
('7', 'Interstellar7', 2014, 'tt0816692', 'movie', 'http://localhost:5000/img/7.jpg'),
('8', 'Interstellar8', 2014, 'tt0816692', 'movie', 'http://localhost:5000/img/8.jpg'),
('9', 'Interstellar9', 2014, 'tt0816692', 'movie', 'http://localhost:5000/img/9.jpg'),
('10', 'Interstellar10', 2014, 'tt0816692', 'movie', 'http://localhost:5000/img/10.jpg'),
('11', 'Interstellar11', 2014, 'tt0816692', 'movie', 'http://localhost:5000/img/11.jpg'),
('12', 'Interstellar12', 2014, 'tt0816692', 'movie', 'http://localhost:5000/img/12.jpg'),
('13', 'Interstellar13', 2014, 'tt0816692', 'movie', 'http://localhost:5000/img/13.jpg');