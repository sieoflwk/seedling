import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Candidates from './pages/Candidates';
import './App.css';

function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/candidates" element={<Candidates />} />
          <Route path="/schedule" element={<div>면접 일정 페이지 (준비 중)</div>} />
          <Route path="/reports" element={<div>통계 리포트 페이지 (준비 중)</div>} />
          <Route path="/settings" element={<div>설정 페이지 (준비 중)</div>} />
        </Routes>
      </Layout>
    </Router>
  );
}

export default App;
