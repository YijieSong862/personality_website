import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom'; // 用于页面跳转
import '../styles/PersonalityTest.css'; 

const PersonalityTest = () => {
  const navigate = useNavigate(); // 用于跳转
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
  const [selectedAnswers, setSelectedAnswers] = useState([]);

  // 获取测试题目
  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch('/api/mbti-test/questions', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (!response.ok) throw new Error('获取题目失败');
        const data = await response.json();
        
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
        setSelectedAnswers(new Array(formattedQuestions.length).fill(null)); // 初始化选择数组
        setLoading(false);
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    };

    fetchQuestions();
  }, []);

  // 处理选项选择
  const handleAnswer = (choiceIndex) => {
    console.log("当前题目:", currentQuestion, "选择选项索引:", choiceIndex);

    const selectedOption = questions[currentQuestion].options[choiceIndex];
    const selectedTrait = selectedOption.trait;
    const weight = selectedOption.weight;

    setScores(prev => ({
      ...prev,
      [selectedTrait]: prev[selectedTrait] + weight
    }));

    // 更新 selectedAnswers 数组
    setSelectedAnswers(prev => {
      const newSelected = [...prev];
      newSelected[currentQuestion] = choiceIndex;
      return newSelected;
    });

    // 等待 selectedAnswers 更新完成后再执行下一步
    setTimeout(() => {
      if (currentQuestion < questions.length - 1) {
        setCurrentQuestion(prev => prev + 1);
      } else {
        setTimeout(calculateFinalResult, 200); // 确保 selectedAnswers 被更新
      }
    }, 100);
  };

  // 计算最终结果
  const calculateFinalResult = async () => {
    if (selectedAnswers.includes(null)) {   
      console.log("==>error! not all questions answered:", selectedAnswers);
      //setError("请先完成所有题目");
      // return;
    }

    const mbtiType = [
      scores.E >= scores.I ? 'E' : 'I',
      scores.S >= scores.N ? 'S' : 'N',
      scores.T >= scores.F ? 'T' : 'F',
      scores.J >= scores.P ? 'J' : 'P'
    ].join('');

    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/mbti-test/submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          answers: questions.map((q, index) => ({
            question_id: q.id,
            choice_index: selectedAnswers[index]
          }))
        })
      });

      if (!response.ok) throw new Error('提交结果失败');
      const resultData = await response.json();
      console.log("=====> result.id", resultData.result_id);
      navigate(`/test-results/${resultData.result_id}`);
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
        <button onClick={() => window.location.reload()}>re-test</button>
      </div>
    );
  }

  // 渲染测试结果
  if (result) {
    return (
      <div className="result-container">
        <h2>你的MBTI类型是：{result.mbti_type}</h2>
 
        <button onClick={() => window.location.reload()}>test again</button>
      </div>
    );
  }

  // 渲染当前问题
  const currentQ = questions[currentQuestion];
  return (
    <div className="test-container">
      <div className="progress-bar">
        <div style={{ width: `${(currentQuestion + 1) / questions.length * 100}%` }}></div>
        <span>Question: {currentQuestion + 1}/{questions.length}</span>
      </div>
      
      <div className="question-card">
        <h3>{currentQ.text}</h3>
        <div className="options">
          {currentQ.options.map((option, index) => (
            <button
              key={index}
              onClick={() => handleAnswer(index)}
              className={selectedAnswers[currentQuestion] === index ? 'selected' : ''}
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
