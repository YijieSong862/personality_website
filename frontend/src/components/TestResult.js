import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import api from '../api';

const TestResult = () => {
  const { resultId } = useParams();
  const [result, setResult] = useState(null);

  useEffect(() => {
    const loadResult = async () => {
      try {
        const response = await api.get(`/personality-test/results/${resultId}`);
        setResult(response.data);
      } catch (error) {
        console.error('Failed to load result:', error);
      }
    };
    loadResult();
  }, [resultId]);

  if (!result) return <div>加载结果中...</div>;

  return (
    <div className="result-container">
      <h1>你的性格类型：{result.trait}</h1>
      
      <div className="trait-description">
        <h2>基本描述</h2>
        <p>{result.description}</p>
      </div>

      <div className="trait-details">
        <div className="strengths">
          <h3>👍 优势</h3>
          <p>{result.strengths}</p>
        </div>
        <div className="weaknesses">
          <h3>👎 需要注意</h3>
          <p>{result.weaknesses}</p>
        </div>
      </div>

      <div className="score-radar">
        <h2>维度得分分布</h2>
        {/* 这里可以集成雷达图组件 */}
      </div>
    </div>
  );
};

export default TestResult;