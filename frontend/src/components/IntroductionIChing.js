import React from 'react';
import '../styles/IChingIntroduction.css';

const IChingIntroduction = () => {
  return (
    <div className="container">
      <div className="content">
        <h1 className="title">The I Ching - Book of Changes</h1>
        <p className="description">
          The I Ching, also known as the Book of Changes, is one of the oldest and most influential Chinese classics, dating back over 3,000 years. It serves as both a divination system and a philosophical guide, deeply rooted in Chinese culture, Confucianism, Daoism, and traditional cosmology.
        </p>
        <p className="description">
          At the core of the I Ching are 64 hexagrams, each composed of six lines that can be either solid (yang) or broken (yin). These hexagrams symbolize different states, changes, and patterns of the universe. The text provides interpretations and insights into life, decision-making, and the natural cycles of change.
        </p>
        <p className="description">
          The philosophy behind the I Ching emphasizes the interplay of yin and yang, balance, and adaptation. It suggests that nothing in the world is static, and by understanding the patterns of change, one can navigate uncertainties and make wise choices.
        </p>
        <p className="description">
          Throughout history, scholars, emperors, and philosophers have consulted the I Ching for wisdom and strategic guidance. Even in modern times, it remains a valuable tool for self-reflection, leadership, and understanding the dynamics of life.
        </p>
        <a href="/introduction-personality" className="button">Go Test</a>
      </div>
    </div>
  );
};

export default IChingIntroduction;