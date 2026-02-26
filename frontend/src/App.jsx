import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';

function App() {
  return (
    <Router>
      <div className='min-h-screen bg-gray-50'>
        <Routes>
          <Route path="/" element={<Navigate to ="/login" replace/>} />
          <Route path="login" element={<LoginPage/>}/>
          <Route path="/register" element={<RegisterPage/>}/>
          <Route path="*" element={<Navigate to ="/login" replace/>} />
        </Routes>
      </div>
    </Router>
 );
}
export default App
