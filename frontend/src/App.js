import React from 'react'; 
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './components/Login';
import Register from './components/Register';
import ResetPassword from './components/ResetPassword';
import ForgotPassword from './components/ForgotPassword';  
import Home from './components/Home'; 
import ProtectedRoute from './components/ProtectedRoute';
import IntroductionPersonality from './components/IntroductionPersonality';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/" element={<Home />} />
        <Route path="/introduction-personality" element={
          <ProtectedRoute>
            <IntroductionPersonality />
          </ProtectedRoute>
        } />
        <Route path="/forum" element={
          <ProtectedRoute>
          <Forum />
          </ProtectedRoute>
        } />
        <Route path="/posts/:postId" element={
          <ProtectedRoute>
          <PostDetail />
          </ProtectedRoute>
        } />
        <Route path="/create-post" element={
          <ProtectedRoute>
            <CreatePost />
          </ProtectedRoute>
        } />
      </Routes>
    </BrowserRouter>
  );
}

export default App;