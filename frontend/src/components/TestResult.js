import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import api from '../api'; 
import '../styles/TestResult.css';

const TestResult = () => {
  const { resultId } = useParams();
  const [result, setResult] = useState(null);

  useEffect(() => {
    const loadResult = async () => {
      try {
        // 从 localStorage 获取 token
        const token = localStorage.getItem('token'); // 替换为实际的 token 键名

        // 确保 token 存在
        if (!token) {
          console.error('Token not found in localStorage');
          // 可以选择在这里处理 token 不存在的情况，比如重定向到登录页面
          return;
        }

        // 组装请求头
        const headers = {
          'Authorization': `Bearer ${token}`,
          // 可以添加其他需要的头部信息
        };

        // 发起请求，并传递 headers 配置
        const response = await api.get(`/mbti-test/results/${resultId}`, { headers });
        console.log("test result api response===>",response.data.type_info);
        setResult(response.data);
      } catch (error) {
        console.error('Failed to load result:', error);
      }
    };

    loadResult();
  }, [resultId]);

  if (!result) return <div>加载结果中...</div>;

  return (
    <div className='result-container'>
      {/* Title Bar */}
      <div className="title-bar">
        Personality: {result.mbti_type} <br /> Hexagram: Qián (Heaven ☰)
      </div>

      <div className="section top-left">
        <div className="section-description">
          <h3>Description</h3>
          <p>{result.type_info.description}</p>
        </div>
      </div>

      <div className="section top-right">
        <h3>Career</h3>
        <p>{result.type_info.career_recommendations}</p>
      </div>

      <div className="section bottom-left">
        <h3>Career Development</h3>
        <p>{result.type_info.development}</p>
      </div>

      <div className="section bottom-right">
        <h3>Recommended Films and Books</h3>
        <p>{result.type_info.books}</p>
      </div>

      {/* Button at the bottom */}
      <div className="button-container">
        <a href="/" className="link-btn">Go Home</a>
      </div>
    </div>
  );
};

export default TestResult;