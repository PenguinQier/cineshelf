import React from 'react';
import '../styles/Footer.css';

const Footer = () => {
  return (
    <footer className="moviehub-footer">
      <div className="footer-content">
        <div className="footer-section about-section">
          <h3 className="footer-title">关于我们</h3>
          <p className="footer-text">
            MoveHub 是一个电影和视频平台，提供翻译、整合的电影资讯服务。
          </p>
        </div>

        <div className="footer-section links-section">
          <h3 className="footer-title">快速链接</h3>
          <ul className="footer-links">
            <li><a href="/">首页</a></li>
            <li><a href="/popular">热门电影</a></li>
            <li><a href="/upcoming">即将上线</a></li>
            <li><a href="/top">排行榜</a></li>
          </ul>
        </div>

        <div className="footer-section contact-section">
          <h3 className="footer-title">联系我们</h3>
          <ul className="contact-info">
            <li>contact@movishub.com</li>
            <li>+1 (123) 456-7890</li>
            <li>北京市朝阳区仙游广场西</li>
          </ul>
        </div>
      </div>

      <div className="footer-bottom">
        <p>&copy; {new Date().getFullYear()} MoveHub. 保留所有权利。</p>
      </div>
    </footer>
  );
};

export default Footer;