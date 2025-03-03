import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import api from '../api';

const PostDetail = () => {
  const { postId } = useParams();
  const [post, setPost] = useState(null);
  const [commentContent, setCommentContent] = useState('');

  useEffect(() => {
    const fetchPost = async () => {
      try {
        const response = await api.get(`/posts/${postId}`);
        setPost(response.data);
      } catch (error) {
        console.error('Failed to fetch post:', error);
      }
    };
    fetchPost();
  }, [postId]);

  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post(`/posts/${postId}/comments`, { content: commentContent });
      setCommentContent('');
      // Refresh comments
      const response = await api.get(`/posts/${postId}`);
      setPost(response.data);
    } catch (error) {
      console.error('Failed to submit comment:', error);
    }
  };

  if (!post) return <div>Loading...</div>;

  return (
    <div className="post-detail">
      <h1>{post.title}</h1>
      <div className="post-content">
        <p>{post.content}</p>
        <div className="author-info">
          Posted by {post.username} on {new Date(post.created_at).toLocaleString()}
        </div>
      </div>
      
      <div className="comments-section">
        <h2>Comments ({post.comments.length})</h2>
        <form onSubmit={handleCommentSubmit}>
          <textarea
            value={commentContent}
            onChange={(e) => setCommentContent(e.target.value)}
            placeholder="Write your comment..."
            required
          />
          <button type="submit">Add Comment</button>
        </form>
        <div className="comments-list">
          {post.comments.map(comment => (
            <div key={comment.id} className="comment-item">
              <div className="comment-meta">
                <span>{comment.username}</span>
                <span>{new Date(comment.created_at).toLocaleString()}</span>
              </div>
              <p>{comment.content}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default PostDetail;