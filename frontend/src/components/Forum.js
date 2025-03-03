import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../api';
import '../styles/Forum.css'; 


const Forum = () => {
    const [data, setData] = useState({
      posts: [],
      total_pages: 1,
      current_page: 1
    });
  
    // 获取帖子列表（带分页）
    const fetchPosts = async (page = 1) => {
      try {
        const response = await api.get(`/posts?page=${page}`);
        setData({
          posts: response.data.posts,
          total_pages: response.data.total_pages,
          current_page: response.data.current_page
        });
      } catch (error) {
        console.error('Failed to fetch posts:', error);
      }
    };
  
    // 首次加载和分页切换
    useEffect(() => {
      fetchPosts();
    }, []);
  
    // 处理点赞
    const handleVote = async (postId) => {
      try {
        const response = await api.post(`/posts/${postId}/vote`);
        
        // 局部更新点赞数
        setData(prev => ({
          ...prev,
          posts: prev.posts.map(post => 
            post.id === postId ? { ...post, votes: response.data.votes } : post
          )
        }));
      } catch (error) {
        console.error('Vote failed:', error);
        alert('Please login to vote'); // 未登录提示
      }
    };
  
    return (
      <div className="forum-container">
        <Link to="/create-post" className="new-post-btn">New Post</Link>
        
        <div className="posts-list">
          {data.posts.map(post => (
            <div key={post.id} className="post-item">
              <div className="post-header">
                <img 
                  src={post.avatar || 'https://ui-avatars.com/api/?name=User'} 
                  alt="avatar" 
                  className="user-avatar"
                />
                <span>{post.username}</span>
              </div>
              
              <Link to={`/posts/${post.id}`} className="post-title">
                {post.title}
              </Link>
              
              <div className="post-meta">
                <span>{new Date(post.created_at).toLocaleDateString()}</span>
                <span>💬 {post.comment_count}</span>
                <button 
                  className="vote-btn"
                  onClick={() => handleVote(post.id)}
                >
                  👍 {post.votes || 0}
                </button>
              </div>
            </div>
          ))}
        </div>
  
        {/* 分页组件 */}
        {data.total_pages > 1 && (
          <Pagination
            current={data.current_page}
            total={data.total_pages}
            onPageChange={fetchPosts}
          />
        )}
      </div>
    );
  };
  
  export default Forum;