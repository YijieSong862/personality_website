import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../api';
import '../styles/Forum.css'; 

// 新增分页和点赞逻辑
const Forum = () => {
    const [data, setData] = useState({ posts: [], total_pages: 1, current_page: 1 });
  
    const fetchPosts = async (page = 1) => {
      const response = await api.get(`/posts?page=${page}`);
      setData(response.data);
    };
  
    const handleVote = async (postId) => {
      try {
        const response = await api.post(`/posts/${postId}/vote`);
        setData(prev => ({
          ...prev,
          posts: prev.posts.map(post => 
            post.id === postId ? { ...post, votes: response.data.votes } : post
          )
        }));
      } catch (error) {
        console.error('Vote failed:', error);
      }
    };
  
    return (
      <div className="forum-container">
        <Link to="/create-post" className="new-post-btn">New Post</Link>
        
        {data.posts.map(post => (
          <div key={post.id} className="post-item">
            <div className="post-header">
              <img src={post.avatar} alt="avatar" className="user-avatar" />
              <span>{post.username}</span>
            </div>
            <Link to={`/posts/${post.id}`} className="post-title">{post.title}</Link>
            <button onClick={() => handleVote(post.id)}>👍 {post.votes}</button>
            {/* 其他内容保持不变 */}
          </div>
        ))}
  
        <Pagination 
          current={data.current_page}
          total={data.total_pages}
          onPageChange={fetchPosts}
        />
      </div>
    );
  };