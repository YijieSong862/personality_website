
import React, { useState, useEffect }  from 'react';
import { Link } from 'react-router-dom';
import '../styles/Home.css'; 
import { useNavigate } from 'react-router-dom';

const avatars = {
  default: "https://www.gravatar.com/avatar/00000000000000000000000000000000?d=mp&f=y",
  robo: "https://www.gravatar.com/avatar/00000000000000000000000000000000?d=robohash",
  retro: "https://www.gravatar.com/avatar/00000000000000000000000000000000?d=retro",
  monster: "https://www.gravatar.com/avatar/00000000000000000000000000000000?d=monsterid",
  identicon: "https://www.gravatar.com/avatar/00000000000000000000000000000000?d=identicon",
  wavatar: "https://www.gravatar.com/avatar/00000000000000000000000000000000?d=wavatar"
};

const Home = () => {
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [avatarType, setAvatarType] = useState("default");
    const navigate = useNavigate();
  
    // 检查本地是否有 Token 来判断登录状态
    useEffect(() => {
        const validateToken = async () => {
          try {
            const response = await fetch('/api/validate-token', {
              headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
            });
            
            if (!response.ok) {
              console.log("token is wrong!");
              localStorage.removeItem('token');
              setIsLoggedIn(false);
              setAvatarType("default");
            }else{
              setIsLoggedIn(true);
              const avatarOptions = ["robo", "retro", "monster", "identicon", "wavatar"];
              const randomAvatar = avatarOptions[Math.floor(Math.random() * avatarOptions.length)];
              setAvatarType(randomAvatar);
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
      navigate('/');
    };
  
    // 处理顶部按钮点击（未登录跳转到登录页）
    const handleProtectedAction = (path) => {
        if (!isLoggedIn) {
          console.log('User is not logged in');
          navigate('/login');
        } else {
          console.log('User is logged in, navigating to:', path);
          navigate(path); 
        }
      };
    

  return (
      <div className="v36_2">
        <span className="v36_42">I Ching & Personality</span>
  
        <button className="avatar" onClick={() => handleProtectedAction('/test-history')}>
            <img src={avatars[avatarType] } alt="User Avatar" />
        </button>
  
        <button className="v36_47" onClick={() => navigate('/introduction-personality')}>Introduction to Personality</button>
        <button className="v36_50" onClick={() => navigate('/introduction-iching')}>Introduction to I Ching</button>
        <button className="v36_53" onClick={() => handleProtectedAction('/forum')}>Forum</button>
  
        <div className="v36_84"></div>
  
        <button className="v36_86" onClick={() => handleProtectedAction('/personality-test')}>Start your test</button>
  
        <div className="v88" style={{ display: "flex", justifyContent: "center", gap: "10px" }}>
          <button className="v36_89"  onClick={() => handleProtectedAction('/login')} disabled={isLoggedIn}>Login</button>
          <button className="v36_91"  onClick={handleLogout} disabled={!isLoggedIn}>Log out</button>
          <button className="v36_93"  onClick={() => handleProtectedAction('/register')} disabled={isLoggedIn}>Sign up</button>
        </div>
      </div>
    );
};

export default Home;