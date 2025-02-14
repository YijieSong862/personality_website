import React, { useState } from 'react';
import axios from 'axios';
import '../App.css';

const Register = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [email, setEmail] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('http://localhost:5000/register', { username, password, email });
      alert(response.data.message);
      window.location.href = '/';
    } catch (error) {
      alert('注册失败，请检查输入信息');
    }
  };

  return (
    <div className="register-box">
      <h2>注册</h2>
      <form onSubmit={handleSubmit}>
        <input type="text" placeholder="用户名" value={username} onChange={(e) => setUsername(e.target.value)} />
        <input type="password" placeholder="密码" value={password} onChange={(e) => setPassword(e.target.value)} />
        <input type="email" placeholder="邮箱" value={email} onChange={(e) => setEmail(e.target.value)} />
        <button type="submit">注册</button>
      </form>
      <div className="link">
        <span onClick={() => window.location.href = '/'}>返回登录</span>
      </div>
    </div>
  );
};

export default Register;