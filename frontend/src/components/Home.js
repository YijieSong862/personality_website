// frontend/src/components/Home.js
import React, { useState, useEffect }  from 'react';
import { Link } from 'react-router-dom';
import '../styles/Home.css'; 
import { useNavigate } from 'react-router-dom';

const Home = () => {
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const navigate = useNavigate();
  
    // 检查本地是否有 Token 来判断登录状态
    useEffect(() => {
        const validateToken = async () => {
          try {
            const response = await fetch('/api/validate-token', {
              headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
            });
            if (!response.ok) {
              localStorage.removeItem('token');
              setIsLoggedIn(false);
            }
          } catch (error) {
            localStorage.removeItem('token');
            setIsLoggedIn(false);
          }
        };
      
        const token = localStorage.getItem('token');
        if (token) {
          validateToken();
          const interval = setInterval(validateToken, 5 * 60 * 1000); // 每5分钟验证一次
          return () => clearInterval(interval);
        }
      }, []);
  
    // 登出逻辑
    const handleLogout = () => {
      localStorage.removeItem('token');
      setIsLoggedIn(false); // 更新状态
      navigate('/login');
    };
  
    // 处理顶部按钮点击（未登录跳转到登录页）
    const handleProtectedAction = (path) => {
        if (!isLoggedIn) {
          navigate('/login');
        } else {
          navigate(path); // 跳转到目标页面（需后续开发）
        }
      };
    

  return (
    <div className="home-container">
      {/* 全屏背景图 */}
      <div className="background-image"></div>
      
      {/* 顶部4个按钮 */}
      <div className="top-buttons">
  <button 
    className="main-btn"
    onClick={() => handleProtectedAction('/introduction-personality')}
  >
    Introduction to Personality
  </button>
  <button 
    className="main-btn"
    onClick={() => handleProtectedAction('/introduction-iching')}
  >
    Introduction to Iching
  </button>
  <button 
    className="main-btn"
    onClick={() => handleProtectedAction('/forum')}
  >
    Forum
  </button>
  <button 
    className="main-btn"
    onClick={() => handleProtectedAction('/historical-data')}
  >
    Historical Test Data
  </button>
</div>

      {/* 中间测试按钮 */}
      <div className="center-button">
        <button className="start-test-btn">Start Test</button>
      </div>

      {/* 底部导航按钮 */}
      <div className="bottom-nav">
  <Link to="/login" className="nav-btn" disabled={isLoggedIn}>Login</Link>
  <Link to="/register" className="nav-btn" disabled={isLoggedIn}>Register</Link>
  <button 
    className="nav-btn" 
    onClick={handleLogout}
    disabled={!isLoggedIn}
  >
    Logout
  </button>
</div>
    </div>
  );
};

export default Home;