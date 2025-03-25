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
  const [selectedAnswers, setSelectedAnswers] = useState([]);
  const [birthday, setBirthday] = useState('');
  const [firstWord, setFirstWord] = useState('');
  const [lifePriority, setLifePriority] = useState('健康'); 
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showSubmitButton, setShowSubmitButton] = useState(false); // 控制提交按钮的显示
  const [testStarted, setTestStarted] = useState(false); // 控制是否开始测试

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
            trait: q.dimension[index],
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

    setScores(prev => ({
      ...prev,
      [selectedTrait]: prev[selectedTrait] + weight
    }));

    setSelectedAnswers(prev => {
      const newSelected = [...prev];
      newSelected[currentQuestion] = choiceIndex;
      return newSelected;
    });

    // 题目答完后显示提交按钮
    if (currentQuestion === questions.length - 1) {
      setShowSubmitButton(true);
    } else {
      setCurrentQuestion(prev => prev + 1);
    }
  };

  const calculateFinalResult = async () => {
    if (selectedAnswers.includes(null)) {
      alert("请完成所有题目！");
      return;
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
          birthday,
          first_word: firstWord,
          life_priority: lifePriority
        })
      });

      if (!response.ok) throw new Error('提交结果失败');
      const resultData = await response.json();
      navigate(`/test-results/${resultData.result_id}`);
    } catch (err) {
      setError('提交结果失败');
    }
  };

  const handleStartTest = () => {
    // 确保所有必填项已填写
    if (!birthday || !firstWord || !lifePriority) {
      alert("请填写所有必填信息！");
      return;
    }

    setTestStarted(true); // 开始测试
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
        <button onClick={() => window.location.reload()}>重新测试</button>
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
        {!testStarted ? (
          <div className="intro-section">
            <div className="input-group">
              <label htmlFor="birthday">请输入你的生日：</label>
              <input
                type="date"
                id="birthday"
                value={birthday}
                onChange={(e) => setBirthday(e.target.value)}
                required
              />
            </div>
            <div className="input-group">
              <label htmlFor="firstWord">眼前脑海里出现的第一个词：</label>
              <input
                type="text"
                id="firstWord"
                value={firstWord}
                onChange={(e) => setFirstWord(e.target.value)}
                required
              />
            </div>
            <div className="input-group">
              <label htmlFor="lifePriority">请选择测试类别:</label>
              <select
                id="lifePriority"
                value={lifePriority}
                onChange={(e) => setLifePriority(e.target.value)}
                className="styled-select"
              >
                <option value="健康">健康</option>
                <option value="性格">性格</option>
                <option value="职业">职业</option>
              </select>
            </div>
            <div className="start-test-button-container">
              <button onClick={handleStartTest} className="start-test-btn">
                开始测试
              </button>
            </div>
          </div>
        ) : (
          <>
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

            {showSubmitButton && (
              <div className="submit-container">
                <button className="submit-btn" onClick={calculateFinalResult}>
                  提交
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default PersonalityTest;
