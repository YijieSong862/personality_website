import React from 'react';
import '../styles/MbtiIntroduction.css';

const MbtiIntroduction = () => {
  return (
    <div className="container">
      <div className="card">
        <h1>Understanding Personality</h1>
        <p>
          Personality is the distinct set of traits, behaviors, and emotional patterns that define an individual’s way of thinking and interacting with the world. It shapes how people respond to different situations, build relationships, and make decisions.
        </p>
        <p>
          While some aspects of personality are influenced by genetics, life experiences and environmental factors also play a crucial role in shaping who we are.
        </p>
        <p>
          Psychologists have developed various theories to explain personality, with one of the most widely recognized being the <strong>Myers-Briggs Type Indicator (MBTI)</strong>. This model categorizes individuals into 16 personality types based on cognitive functions, helping people better understand their tendencies, strengths, and areas for growth.
        </p>
        <p>
          Understanding personality can offer valuable insights into self-awareness, communication styles, and personal development. It helps individuals recognize their natural inclinations, improve interactions with others, and make informed decisions about their careers and relationships.
        </p>
        <a href="/introduction-personality" className="button">
          Go Test
        </a>
      </div>
    </div>
  );
};

export default MbtiIntroduction;