import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../contexts/AuthContext';
import '../styles/UploadMovie.css';

const UploadMovie = () => {
  const { token } = useContext(AuthContext);
  const [formData, setFormData] = useState({
    title: '',
    year: '',
    imdbID: '',
    type: 'movie',
    poster: null,
    video: null,
    description: '',
    rating: '',
    genres: '',
    mainCategory: 'film',
    subCategory: '',
    vip: false
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [videoPreview, setVideoPreview] = useState(null);
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleFileChange = (e) => {
    const { name, files } = e.target;
    if (name === 'poster') {
      setFormData(prev => ({ ...prev, poster: files[0] }));
    } else if (name === 'video') {
      const videoFile = files[0];
      setFormData(prev => ({ ...prev, video: videoFile }));

      // 创建视频预览URL
      if (videoFile) {
        const videoURL = URL.createObjectURL(videoFile);
        setVideoPreview(videoURL);
      } else {
        setVideoPreview(null);
      }
    }
  };

  // 重置表单
  const resetForm = () => {
    setFormData({
      title: '',
      year: '',
      imdbID: '',
      type: 'movie',
      poster: null,
      video: null,
      description: '',
      rating: '',
      genres: '',
      mainCategory: 'film',
      subCategory: '',
      vip: false
    });
    if (videoPreview) {
      URL.revokeObjectURL(videoPreview);
      setVideoPreview(null);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const data = new FormData();
      data.append('title', formData.title);
      data.append('year', formData.year);
      data.append('imdbID', formData.imdbID);
      data.append('type', formData.type);
      data.append('description', formData.description);
      data.append('rating', formData.rating || '0');
      data.append('genres', formData.genres);
      data.append('mainCategory', formData.mainCategory);
      data.append('subCategory', formData.subCategory);
      data.append('vip', formData.vip);

      if (formData.poster) {
        data.append('poster', formData.poster);
      }
      if (formData.video) {
        data.append('video', formData.video);
      }

      if (!token) {
        throw new Error('未登录或登录已过期，请重新登录');
      }

      const response = await fetch('http://localhost:5000/api/movies', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: data
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || '上传失败');
      }

      const result = await response.json();
      // 重置表单和loading状态
      resetForm();
      setIsLoading(false);
      alert(`电影 "${result.movie.title}" 上传成功!`);
      // 立即跳转到首页
      navigate('/');
    } catch (err) {
      setError(err.message);
      setIsLoading(false);
    }
  };

  // 组件卸载时清理视频预览URL
  React.useEffect(() => {
    return () => {
      if (videoPreview) {
        URL.revokeObjectURL(videoPreview);
      }
    };
  }, [videoPreview]);

  return (
    <div className="upload-container">
      <h2>上传新电影</h2>
      <form onSubmit={handleSubmit} className="upload-form">
        {error && <div className="error-message">{error}</div>}

        <div className="form-group">
          <label>电影标题*</label>
          <input
            type="text"
            name="title"
            value={formData.title}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group">
          <label>上映年份*</label>
          <input
            type="number"
            name="year"
            value={formData.year}
            onChange={handleChange}
            min="1900"
            max={new Date().getFullYear()}
            required
          />
        </div>

        <div className="form-group">
          <label>IMDb ID</label>
          <input
            type="text"
            name="imdbID"
            value={formData.imdbID}
            onChange={handleChange}
          />
        </div>

        <div className="form-group">
          <label>类型*</label>
          <select
            name="type"
            value={formData.type}
            onChange={handleChange}
            required
          >
            <option value="movie">电影</option>
            <option value="series">电视剧</option>
            <option value="anime">动漫</option>
            <option value="variety">综艺</option>
            <option value="documentary">纪录片</option>
            <option value="children">少儿</option>
            <option value="shortVideo">短剧</option>
          </select>
        </div>

        <div className="form-group">
          <label>主分类*</label>
          <select
            name="mainCategory"
            value={formData.mainCategory}
            onChange={handleChange}
            required
          >
            <option value="film">影视推荐</option>
            <option value="education">就好这口</option>
            <option value="sports">体育游戏</option>
            <option value="news">资讯前沿</option>
            <option value="lifestyle">乐享生活</option>
          </select>
        </div>

        <div className="form-group">
          <label>子分类</label>
          <input
            type="text"
            name="subCategory"
            value={formData.subCategory}
            onChange={handleChange}
            placeholder="根据电影类型选择合适的子分类"
          />
          <small className="file-hint">例如：电影、NBA、音乐等，与主分类对应</small>
        </div>

        <div className="form-group">
          <label>评分 (0-10)</label>
          <input
            type="number"
            name="rating"
            value={formData.rating}
            onChange={handleChange}
            min="0"
            max="10"
            step="0.1"
            placeholder="例如: 8.3"
          />
        </div>

        <div className="form-group checkbox-group">
          <label>
            <input
              type="checkbox"
              name="vip"
              checked={formData.vip}
              onChange={handleChange}
            />
            VIP专享内容
          </label>
          <small className="file-hint">勾选此项表示该影片仅对VIP用户开放</small>
        </div>

        <div className="form-group">
          <label>电影分类</label>
          <input
            type="text"
            name="genres"
            value={formData.genres}
            onChange={handleChange}
            placeholder="例如: 科幻,冒险,动作 (多个分类用逗号分隔)"
          />
          <small className="file-hint">多个分类用逗号分隔，例如：科幻,冒险,动作</small>
        </div>

        <div className="form-group">
          <label>电影简介</label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            rows="4"
            placeholder="请输入电影简介..."
          ></textarea>
        </div>

        <div className="form-group">
          <label>海报图片</label>
          <input
            type="file"
            name="poster"
            onChange={handleFileChange}
            accept="image/*"
          />
        </div>

        <div className="form-group">
          <label>上传视频</label>
          <input
            type="file"
            name="video"
            onChange={handleFileChange}
            accept="video/*"
          />
          {videoPreview && (
            <div className="video-preview">
              <p>视频预览:</p>
              <video
                src={videoPreview}
                controls
                style={{ maxWidth: '100%', maxHeight: '200px' }}
              />
            </div>
          )}
          <small className="file-hint">支持 MP4, WebM, AVI 等视频格式</small>
        </div>

        <button type="submit" disabled={isLoading} className="submit-btn">
          {isLoading ? '上传中...' : '上传电影'}
        </button>
      </form>
    </div>
  );
};

export default UploadMovie;