import React from 'react';
import Navbar from './Navbar';
import MbtiIntroduction from './MbtiIntroduction';
import IChingIntroduction from './IChingIntroduction';
import '../styles/Home.css'; // 确保只引入 Home 页面的样式

const Home = () => {
  const username = 'Steven'; // 假设用户已登录，用户名为 'Steven'
  return (
    <div className="home-container">
      <Navbar username={username} />
      <div className="home-content">
        <h1>欢迎来到主页</h1>
        <div className="introduction-section">
          <MbtiIntroduction />
          <IChingIntroduction />
        </div>
      </div>
    </div>
  );
};

export default Home;