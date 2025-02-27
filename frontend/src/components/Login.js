import React, { useState } from 'react';
import axios from 'axios';
import '../App.css';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('http://localhost:5000/login', { username, password });
      alert(response.data.message);
      if (response.status === 200) {
        window.location.href = '/home';
      }
    } catch (error) {
      alert('login failed');
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