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
          <p>{result.type_info.description}人格以务实稳健著称，是典型的现实主义者。他们注重事实与细节，具有强烈的责任感和可靠性，偏好结构化和有序的生活方式。ISTJ常给人以严肃、勤勉的印象，在处理工作和任务时一丝不苟，遵循既定规则和程序。作为内倾感觉型，他们倾向于从过去经验中获取信息，依赖可靠的数据和亲身观察来理解世界。</p>
          <p>ISTJ倾向于具体、实证的思维，擅长分析细节并将复杂问题分解为可执行的步骤。这种分析性和条理性使他们成为高效的问题解决者。</p>
        </div>
      </div>

      <div className="section top-right">
        <h3>Career</h3>
        <p>{result.type_info.career_recommendations}ISTJ以其精确、守信和秩序井然的特点，在许多需要严谨细致的领域表现。他们通常在会计、审计、财务管理等处理事实和数据的职业中如鱼得水，也适合软件开发、工程技术、科研等逻辑性强的工作。法律和执法领域（如法官、律师、警务）也是ISTJ常见的职业选择。</p>
        <p>工作方式上，ISTJ倾向于独立或在小团队中按照明确分工工作。他们擅长制定计划和遵循流程，喜欢稳定、有结构的工作环境。</p>
      </div>

      <div className="section bottom-left">
        <h3>Career Development</h3>
        <p>针对ISTJ的职业成长，技能提升应侧重于培养沟通和适应能力。由于ISTJ倾向于独立完成任务并遵循惯例，他们可以刻意练习团队沟通技巧，例如学习更主动地聆听同事反馈、表达自己的想法，以及在需要时适当妥协。</p>
      </div>

      <div className="section bottom-right">
        <h3>Recommended Films and Books</h3>
        <p>电影《十二怒汉》非常契合ISTJ对事实和逻辑的重视，片中的主人公坚守原则、注重细节，通过理性说服他人的情节可启发ISTJ思考如何在群体讨论中有效表达见解。</p>
        <p>史蒂芬·柯维的《高效能人士的七个习惯》非常适合ISTJ这类注重效率和责任的人阅读。</p>
      </div>

      {/* Button at the bottom */}
      <div className="button-container">
        <a href="/" className="link-btn">Go Home</a>
      </div>
    </div>
  );
};

export default TestResult;