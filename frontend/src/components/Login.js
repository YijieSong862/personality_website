import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import '../App.css';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

 // frontend/src/components/Login.js
const handleSubmit = async (e) => {
  e.preventDefault();
  try {
    const response = await fetch('http://localhost:5000/api/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    });

    if (!response.ok) {
      throw new Error('Login failed');
    }

    const data = await response.json();
    
    // ✅ 保存 Token 到 localStorage
    localStorage.setItem('token', data.token);
    
    // 跳转到首页或其他页面
    navigate('/');
  } catch (error) {
    alert(error.message);
  }
};

  return (
    <div className="login-box">
      <h2>Sign On</h2>
      <form onSubmit={handleSubmit}>
        <input type="text" placeholder="用户名" value={username} onChange={(e) => setUsername(e.target.value)} />
        <input type="password" placeholder="密码" value={password} onChange={(e) => setPassword(e.target.value)} />
        <button type="submit">Sign On</button>
      </form>
      <div className="link">
        <span onClick={() => window.location.href = '/register'}>Register</span> |
        <span onClick={() => window.location.href = '/reset-password'}>Forgot Password</span>
      </div>
    </div>
  );
};

export default Login;