import React from 'react';

const Pagination = ({ current, total, onPageChange }) => {
  return (
    <div className="pagination">
      {Array.from({ length: total }, (_, i) => (
        <button 
          key={i+1} 
          onClick={() => onPageChange(i+1)}
          disabled={current === i+1}
        >
          {i+1}
        </button>
      ))}
    </div>
  );
};

export default Pagination;