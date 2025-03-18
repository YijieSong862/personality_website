import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/PersonalityTest.css'; 

const PersonalityTest = () => {
  const navigate = useNavigate();
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
  const [birthday, setBirthday] = useState(''); // 存储生日

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
        setSelectedAnswers(new Array(formattedQuestions.length).fill(null)); 
        setLoading(false);
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    };

    fetchQuestions();
  }, []);

  const handleAnswer = (choiceIndex) => {
    const selectedOption = questions[currentQuestion].options[choiceIndex];
    const selectedTrait = selectedOption.trait;
    const weight = selectedOption.weight;

    if (!birthday) {
      alert("please fill in your birthday"); // forbit fill in
      return; // 如果没有填写生日，阻止切换到下一题
    }

    setScores(prev => ({
      ...prev,
      [selectedTrait]: prev[selectedTrait] + weight
    }));

    setSelectedAnswers(prev => {
      const newSelected = [...prev];
      newSelected[currentQuestion] = choiceIndex;
      return newSelected;
    });

    setTimeout(() => {
      if (currentQuestion < questions.length - 1) {
        setCurrentQuestion(prev => prev + 1);
      } else {
        setTimeout(calculateFinalResult, 200); 
      }
    }, 100);
  };

  const calculateFinalResult = async () => {
    if (selectedAnswers.includes(null)) {   
      console.log("questions not completed");
      //setError("请先完成所有题目");
      //return;
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
          })),
          birthday: birthday // 发送生日信息
        })
      });

      if (!response.ok) throw new Error('提交结果失败');
      const resultData = await response.json();
      navigate(`/test-results/${resultData.result_id}`);
    } catch (err) {
      setError('提交结果失败');
    }
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loader"></div>
        <p>正在加载测试题目...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-container">
        <h3>发生错误</h3>
        <p>{error}</p>
        <button onClick={() => window.location.reload()}>re-test</button>
      </div>
    );
  }

  if (result) {
    return (
      <div className="result-container">
        <h2>你的MBTI类型是：{result.mbti_type}</h2>
        <button onClick={() => window.location.reload()}>test again</button>
      </div>
    );
  }

  const currentQ = questions[currentQuestion];
  return (
    <div className="test-container">
      <div className="progress-bar">
        <div style={{ width: `${(currentQuestion + 1) / questions.length * 100}%` }}></div>
        <span>Question: {currentQuestion + 1}/{questions.length}</span>
      </div>
      
      <div className="question-card">
        {currentQuestion === 0 && (
          <div className="birthday-input-container">
            <label htmlFor="birthday">Please input your birthday:</label>
            <input
              type="date"
              id="birthday"
              value={birthday}
              onChange={(e) => setBirthday(e.target.value)}
              required
            />
          </div>
        )}

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
