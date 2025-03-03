import React, { useState } from 'react';
import api from '../api';
import { useNavigate } from 'react-router-dom';

const CreatePost = () => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/posts', { title, content });
      navigate('/forum');
    } catch (error) {
      alert('Failed to create post');
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