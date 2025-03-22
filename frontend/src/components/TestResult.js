import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import api from '../api'; 
import '../styles/TestResult.css';

// MBTI类型到八卦的映射
const mbtiToHexagram = {
  INTJ: { hexagram: "☰", name: "Qián", meaning: "Heaven" },
  ENTJ: { hexagram: "☰", name: "Qián", meaning: "Heaven" },
  INTP: { hexagram: "☵", name: "Kǎn", meaning: "Water" },
  ENTP: { hexagram: "☵", name: "Kǎn", meaning: "Water" },
  INFJ: { hexagram: "☶", name: "Gèn", meaning: "Mountain" },
  ENFJ: { hexagram: "☶", name: "Gèn", meaning: "Mountain" },
  ISTJ: { hexagram: "☷", name: "Kūn", meaning: "Earth" },
  ESTJ: { hexagram: "☷", name: "Kūn", meaning: "Earth" },
  ISFJ: { hexagram: "☴", name: "Xùn", meaning: "Wind" },
  ESFJ: { hexagram: "☴", name: "Xùn", meaning: "Wind" },
  ISTP: { hexagram: "☳", name: "Zhèn", meaning: "Thunder" },
  ESTP: { hexagram: "☳", name: "Zhèn", meaning: "Thunder" },
  ISFP: { hexagram: "☲", name: "Lí", meaning: "Fire" },
  ESFP: { hexagram: "☲", name: "Lí", meaning: "Fire" },
  INFP: { hexagram: "☱", name: "Duì", meaning: "Lake" },
  ENFP: { hexagram: "☱", name: "Duì", meaning: "Lake" },
};


const TestResult = () => {
  const { resultId } = useParams();
  const [result, setResult] = useState(null);
  const [baguaResult, setBaguaResult] = useState(null);
  const [hexagramImage, setHexagramImage] = useState(null);

  useEffect(() => {
    const loadResult = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          console.error('Token not found in localStorage');
          return;
        }

        const headers = { 'Authorization': `Bearer ${token}` };
        const response = await api.get(`/mbti-test/results/${resultId}`, { headers });
        setResult(response.data);
      } catch (error) {
        console.error('Failed to load result:', error);
      }
    };

    const loadBaguaResult = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) return;

        const headers = { 'Authorization': `Bearer ${token}` };
        const response = await api.get(`/mbti-test/bagua_results/${resultId}`, { headers });
        setBaguaResult(response.data);
        generateHexagramImage(response.data.hexagram_code);
      } catch (error) {
        console.error('Failed to load Bagua result:', error);
      }
    };

    loadResult();
    loadBaguaResult();
  }, [resultId]);

  const generateHexagramImage = (hexagramCode) => {
    if (!hexagramCode) return;
    const canvas = document.createElement('canvas');
    canvas.width = 100;
    canvas.height = 150;
    const ctx = canvas.getContext('2d');

    for (let i = 0; i < 3; i++) {
      const y = 20 + i * 40;
      if (hexagramCode[i] === '1') {
        ctx.fillRect(10, y, 80, 10);
      } else {
        ctx.fillRect(10, y, 30, 10);
        ctx.fillRect(60, y, 30, 10);
      }
    }

    setHexagramImage(canvas.toDataURL());
  };

  if (!result) return <div>加载结果中...</div>;

  // 获取当前 MBTI 类型对应的卦象
  const hexagram = mbtiToHexagram[result.mbti_type] || { name: "uncertain", symbol: "?" };

  return (
    <div className='result-container'>
      
      {/* 动态标题 */}
      <div className="title-bar">
        Personality: {result.mbti_type} <br /> 
        Hexagram: {hexagram.name} {hexagram.hexagram} {hexagram.meaning}
      </div>

      {/* 八卦解析 */}
      {baguaResult && (
        <div className="section bagua-section">
          <h3>Bagua Analysis</h3>

          {hexagramImage && (
            <div className="hexagram-container">
              <img src={hexagramImage} alt="Hexagram" className="hexagram-img" />
            </div>
          )}

          <div className="bagua-content">
            {Object.entries(baguaResult).map(([key, value]) => (
              <p key={key}>
                <strong className="bagua-key">{key}:</strong> 
                <span className="bagua-value">{value}</span>
              </p>
            ))}
          </div>
        </div>
      )}

      <div className="section top-left">
        <h3>Description</h3>
        <p>{result.type_info.description}</p>
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


      {/* 按钮 */}
      <div className="button-container">
        <a href="/" className="link-btn">Go Home</a>
      </div>
    </div>
  );
};

export default TestResult;
