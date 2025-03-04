import React, { useState } from 'react';

const PersonalityTest = () => {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [scores, setScores] = useState({
    E: 0, I: 0,
    S: 0, N: 0,
    T: 0, F: 0,
    J: 0, P: 0
  });
  const [result, setResult] = useState(null);

  // 标准MBTI测试问题（精简版）
  const questions = [
    // E-I 维度
    { 
      question: "你通常喜欢",
      dimension: 'E-I',
      options: [
        { text: "和大家一起交流", score: { E: 1 } },
        { text: "独自思考或与少数人深入交流", score: { I: 1 } }
      ]
    },
    // S-N 维度
    {
      question: "你更倾向于相信",
      dimension: 'S-N',
      options: [
        { text: "具体的事实和数据", score: { S: 1 } },
        { text: "灵感和想象力", score: { N: 1 } }
      ]
    },
    // T-F 维度
    {
      question: "做决定时，你更注重",
      dimension: 'T-F',
      options: [
        { text: "客观逻辑和公平性", score: { T: 1 } },
        { text: "人情和睦与同理心", score: { F: 1 } }
      ]
    },
    // J-P 维度
    {
      question: "你更喜欢的生活方式是",
      dimension: 'J-P',
      options: [
        { text: "有计划、有组织的", score: { J: 1 } },
        { text: "灵活、随性的", score: { P: 1 } }
      ]
    },
    // 可继续添加更多问题...
  ];

  const handleAnswer = (selectedScore) => {
    const newScores = { ...scores };
    Object.entries(selectedScore).forEach(([key, value]) => {
      newScores[key] += value;
    });
    setScores(newScores);

    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      calculateResult(newScores);
    }
  };

  const calculateResult = (finalScores) => {
    const type = [
      finalScores.E >= finalScores.I ? 'E' : 'I',
      finalScores.S >= finalScores.N ? 'S' : 'N',
      finalScores.T >= finalScores.F ? 'T' : 'F',
      finalScores.J >= finalScores.P ? 'J' : 'P'
    ].join('');

    // MBTI类型描述
    const typeDescriptions = {
      'ISTJ': '严谨的检查者',
      'ISFJ': '忠诚的保护者',
      'INFJ': '博爱的倡导者',
      'INTJ': '智谋的战略家',
      'ISTP': '务实的探险家',
      'ISFP': '艺术家的创作者',
      'INFP': '哲学的理想家',
      'INTP': '逻辑的发明家',
      'ESTP': '灵活的实干家',
      'ESFP': '热情的表演者',
      'ENFP': '灵感的激发者',
      'ENTP': '智慧的挑战者',
      'ESTJ': '高效的执行者',
      'ESFJ': '和谐的助人者',
      'ENFJ': '魅力的领导者',
      'ENTJ': '果断的指挥官'
    };

    setResult({
      type,
      description: typeDescriptions[type] || '独特的个性类型'
    });
  };

  return (
    <div className="mbti-test">
      {!result ? (
        <div className="question-container">
          <h3>问题 {currentQuestion + 1}/{questions.length}</h3>
          <p>{questions[currentQuestion].question}</p>
          <div className="options">
            {questions[currentQuestion].options.map((option, index) => (
              <button 
                key={index}
                onClick={() => handleAnswer(option.score)}
              >
                {option.text}
              </button>
            ))}
          </div>
        </div>
      ) : (
        <div className="result">
          <h2>你的MBTI类型是：{result.type}</h2>
          <p>{result.description}</p>
          <div className="type-detail">
            <p>维度解析：</p>
            <ul>
              <li>{scores.E >= scores.I ? 'E 外向' : 'I 内向'} ({Math.abs(scores.E - scores.I)})</li>
              <li>{scores.S >= scores.N ? 'S 实感' : 'N 直觉'} ({Math.abs(scores.S - scores.N)})</li>
              <li>{scores.T >= scores.F ? 'T 思考' : 'F 情感'} ({Math.abs(scores.T - scores.F)})</li>
              <li>{scores.J >= scores.P ? 'J 判断' : 'P 知觉'} ({Math.abs(scores.J - scores.P)})</li>
            </ul>
          </div>
        </div>
      )}
    </div>
  );
};

export default PersonalityTest;