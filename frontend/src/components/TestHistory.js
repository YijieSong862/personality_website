import React, { useEffect, useState } from 'react';
import axios from 'axios';
import '../styles/TestHistory.css';

const TestHistory = () => {
    const [testResults, setTestResults] = useState([]);
    const [loading, setLoading] = useState(true);
  
    useEffect(() => {
      const fetchTestResults = async () => {
        try {
          const response = await axios.get('/api/mbti-test/test_results', {
            headers: {
              Authorization: `Bearer ${localStorage.getItem('token')}`,  
            },
          });
          setTestResults(response.data);
        } catch (error) {
          console.error('Error fetching test results:', error);
        } finally {
          setLoading(false);
        }
      };
  
      fetchTestResults();
    }, []);
  
    if (loading) {
      return <div className="loading">Loading...</div>;
    }
  
    return (
      <div className="test-results-container">
        <h1 className="page-title">Your Test Results</h1>
        <table className="test-results-table">
          <thead>
            <tr>
              <th>Test Time</th>
              <th>MBTI Type</th>
            </tr>
          </thead>
          <tbody>
            {testResults.length === 0 ? (
              <tr>
                <td colSpan="2">No test results found.</td>
              </tr>
            ) : (
              testResults.map((result, index) => (
                <tr key={index}>
                  <a href={`/test-results/${result.id}`}>  
                    <td>{result.test_time}</td>
                  </a>
                  <td>{result.mbti_type}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
        <div className="button-container">
          <button className="go-to-home" onClick={() => window.location.href = '/'}>Go to Home</button>
        </div>
      </div>
    );
  };

export default TestHistory;
