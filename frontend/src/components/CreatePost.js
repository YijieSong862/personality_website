import React, { useState } from 'react';
import api from '../api';
import { useNavigate } from 'react-router-dom';
import '../styles/CreatePost.css';

const CreatePost = () => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // 从 localStorage 中获取 Token
      const token = localStorage.getItem('token'); // 假设 Token 存储在 localStorage 中，键为 'token'
      if (!token) {
        throw new Error('Token not found');
      }

      // 添加 Token 到请求头部
      const response = await api.post('/posts', { title, content }, {
        headers: {
          Authorization: `Bearer ${token}`, // 添加 Authorization 头部
        },
      });

      navigate('/forum');
    } catch (error) {
      alert('Failed to create post: ' + error.message);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="create-post">
      <input
        type="text"
        placeholder="Title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        required
      />
      <textarea
        placeholder="Content"
        value={content}
        onChange={(e) => setContent(e.target.value)}
        required
      />
      <button type="submit">Publish</button>
    </form>
  );
};

export default CreatePost;