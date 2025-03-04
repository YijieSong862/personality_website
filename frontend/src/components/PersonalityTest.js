import React, { useState, useEffect } from 'react';
import '../styles/PersonalityTest.css'; 

const PersonalityTest = () => {
  // 状态管理
  const [questions, setQuestions] = useState([]);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [scores, setScores] = useState({
    E: 0, I: 0,
    S: 0, N: 0,
    T: 0, F: 0,
    J: 0, P: 0
  });
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // 获取测试题目
  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        const response = await fetch('/api/mbti-test/questions');
        if (!response.ok) throw new Error('获取题目失败');
        const data = await response.json();
        
        // 转换API数据结构
        const formattedQuestions = data.questions.map(q => ({
          id: q.id,
          text: q.text,
          dimension: q.dimension,
          options: q.options.map((opt, index) => ({
            text: opt.text,
            trait: q.dimension[index], // E/I/S/N等
            weight: opt.weight || 1
          }))
        }));

        setQuestions(formattedQuestions);
        setLoading(false);
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    };

    fetchQuestions();
  }, []);

  // 处理选项选择
  const handleAnswer = (selectedTrait, weight) => {
    // 更新分数
    setScores(prev => ({
      ...prev,
      [selectedTrait]: prev[selectedTrait] + weight
    }));

    // 跳转下一题或计算结果
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      calculateFinalResult();
    }
  };

  // 计算结果
  const calculateFinalResult = async () => {
    const mbtiType = [
      scores.E >= scores.I ? 'E' : 'I',
      scores.S >= scores.N ? 'S' : 'N',
      scores.T >= scores.F ? 'T' : 'F',
      scores.J >= scores.P ? 'J' : 'P'
    ].join('');

    try {
      // 提交结果到后端
      const response = await fetch('/api/mbti-test/submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          answers: questions.map((q, index) => ({
            question_id: q.id,
            choice_index: 0 // 这里需要根据实际选择记录
          }))
        })
      });

      const resultData = await response.json();
      setResult(resultData);
    } catch (err) {
      setError('提交结果失败');
    }
  };

  // 渲染加载状态
  if (loading) {
    return (
      <div className="loading-container">
        <div className="loader"></div>
        <p>正在加载测试题目...</p>
      </div>
    );
  }

  // 渲染错误状态
  if (error) {
    return (
      <div className="error-container">
        <h3>发生错误</h3>
        <p>{error}</p>
        <button onClick={() => window.location.reload()}>重试</button>
      </div>
    );
  }

  // 渲染测试结果
  if (result) {
    return (
      <div className="result-container">
        <h2>你的MBTI类型是：{result.mbti_type}</h2>
        <div className="radar-chart">
          {/* 这里可以集成图表库 */}
        </div>
        <div className="dimension-scores">
          {Object.entries(result.dimension_ratios).map(([dim, score]) => (
            <div key={dim} className="dimension">
              <span>{dim}</span>
              <div className="score-bar" style={{ width: `${Math.abs(score)*10}%` }}>
                {score > 0 ? dim[0] : dim[1]}
              </div>
            </div>
          ))}
        </div>
        <button onClick={() => window.location.reload()}>重新测试</button>
      </div>
    );
  }

  // 渲染当前问题
  const currentQ = questions[currentQuestion];
  return (
    <div className="test-container">
      <div className="progress-bar">
        <div style={{ width: `${(currentQuestion+1)/questions.length*100}%` }}></div>
        <span>问题 {currentQuestion + 1}/{questions.length}</span>
      </div>
      
      <div className="question-card">
        <h3>{currentQ.text}</h3>
        <div className="options">
          {currentQ.options.map((option, index) => (
            <button
              key={index}
              onClick={() => handleAnswer(option.trait, option.weight)}
            >
              {option.text}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default PersonalityTest;