import React from 'react'; 
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './components/Login';
import Register from './components/Register';
import ResetPassword from './components/ResetPassword';
import ForgotPassword from './components/ForgotPassword';  
import Home from './components/Home'; 
import ProtectedRoute from './components/ProtectedRoute';
import IntroductionPersonality from './components/IntroductionPersonality';
import Forum from './components/Forum'; 
import PostDetail from './components/PostDetail';
import CreatePost from './components/CreatePost';
import PersonalityTest from './components/PersonalityTest';
import TestResult from './components/TestResult';
import KKKK from './components/KKKK';

function App() {
  return (
    <BrowserRouter>
      <Routes>   
        <Route path="/kkkk" element={<KKKK />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/" element={<Home />} />
        <Route path="/introduction-personality" element={
            <IntroductionPersonality />
        } />
        
        <Route path="/forum" element={
         // <ProtectedRoute>
          <Forum />
         // </ProtectedRoute>
        } />
        <Route path="/createpost" element={
         // <ProtectedRoute>
          <CreatePost />
         // </ProtectedRoute>
        } />
        <Route path="/posts/:postId" element={
         // <ProtectedRoute>
          <PostDetail />
         // </ProtectedRoute>
        } />
        <Route path="/create-post" element={
         // <ProtectedRoute>
            <CreatePost />
         // </ProtectedRoute>
        } />
        <Route path="/personality-test" element={
         // <ProtectedRoute>
            <PersonalityTest />
         // </ProtectedRoute>
        } />
        <Route path="/test-results/:resultId" element={
         // <ProtectedRoute>
            <TestResult />
         // </ProtectedRoute>
        } />
      </Routes>
    </BrowserRouter>
  );
}

export default App;