// frontend/src/components/ProtectedRoute.js
import React from 'react';
import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ children }) => {
    const isAuthenticated = !!localStorage.getItem('access_token'); // 检查 access_token
    return isAuthenticated ? children : <Navigate to="/login" />;
  };
  
  export default ProtectedRoute;