import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import AddCandidateModal from './AddCandidateModal';
import './Layout.css';

const Layout = ({ children }) => {
  const location = useLocation();
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  const navItems = [
    { path: '/', label: '대시보드', icon: '📊' },
    { path: '/candidates', label: '지원자 관리', icon: '👥' },
    { path: '/schedule', label: '면접 일정', icon: '📅' },
    { path: '/reports', label: '통계 리포트', icon: '📈' },
    { path: '/settings', label: '설정', icon: '⚙️' }
  ];

  const handleAddCandidateSuccess = (newCandidate) => {
    // 새 지원자 추가 성공 시 처리
    console.log('새 지원자가 추가되었습니다:', newCandidate);
    // 여기서 필요한 경우 부모 컴포넌트에 알림을 보낼 수 있습니다
  };

  return (
    <div className="layout">
      {/* 헤더 */}
      <header className="header">
        <div className="header-content">
          <div className="logo">
            <h1>🌱 Seedling</h1>
            <span className="subtitle">채용 관리 시스템</span>
          </div>
          <div className="header-actions">
            <button className="btn btn-secondary">
              📤 데이터 내보내기
            </button>
            <button 
              className="btn btn-primary"
              onClick={() => setIsAddModalOpen(true)}
            >
              👤 새 지원자 추가
            </button>
          </div>
        </div>
      </header>

      {/* 메인 컨테이너 */}
      <div className="main-container">
        {/* 사이드바 네비게이션 */}
        <nav className="sidebar">
          <ul className="nav-list">
            {navItems.map((item) => (
              <li key={item.path} className="nav-item">
                <Link
                  to={item.path}
                  className={`nav-link ${location.pathname === item.path ? 'active' : ''}`}
                >
                  <span className="nav-icon">{item.icon}</span>
                  <span className="nav-label">{item.label}</span>
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        {/* 메인 콘텐츠 영역 */}
        <main className="main-content">
          {children}
        </main>
      </div>

      {/* 푸터 */}
      <footer className="footer">
        <div className="footer-content">
          <p>&copy; 2025 Seedling ATS. 무한한 성장 가능성을 함께합니다.</p>
        </div>
      </footer>

      {/* 지원자 추가 모달 */}
      <AddCandidateModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSuccess={handleAddCandidateSuccess}
      />
    </div>
  );
};

export default Layout;
