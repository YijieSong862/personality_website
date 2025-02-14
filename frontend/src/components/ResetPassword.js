import React, { useState } from 'react';
import axios from 'axios';
import '../App.css';

const ResetPassword = () => {
  const [username, setUsername] = useState('');
  const [newPassword, setNewPassword] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('http://localhost:5000/reset_password', { username, new_password: newPassword });
      alert(response.data.message);
      window.location.href = '/';
    } catch (error) {
      alert('密码重置失败，请检查用户名');
    }
  };

  return (
    <div className="reset-password-box">
      <h2>找回密码</h2>
      <form onSubmit={handleSubmit}>
        <input type="text" placeholder="用户名" value={username} onChange={(e) => setUsername(e.target.value)} />
        <input type="password" placeholder="新密码" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} />
        <button type="submit">重置密码</button>
      </form>
      <div className="link">
        <span onClick={() => window.location.href = '/'}>返回登录</span>
      </div>
    </div>
  );
};

export default ResetPassword;