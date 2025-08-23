import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import './Layout.css';

const Layout = ({ children }) => {
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isHamburgerMenuOpen, setIsHamburgerMenuOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const hamburgerMenuRef = useRef(null);
  const fileInputRef = useRef(null);

  const navItems = [
    { path: '/', label: '대시보드' },
    { path: '/candidates', label: '지원자 관리' },
    { path: '/schedule', label: '면접 일정' },
    { path: '/reports', label: '통계 리포트' }
  ];

  // 다크모드 상태 초기화
  useEffect(() => {
    const savedTheme = localStorage.getItem('seedling-theme');
    if (savedTheme === 'dark') {
      setIsDarkMode(true);
      document.documentElement.setAttribute('data-theme', 'dark');
    }
  }, []);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const toggleHamburgerMenu = () => {
    setIsHamburgerMenuOpen(!isHamburgerMenuOpen);
  };

  const closeHamburgerMenu = () => {
    setIsHamburgerMenuOpen(false);
  };

  // 외부 클릭 감지
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (hamburgerMenuRef.current && !hamburgerMenuRef.current.contains(event.target)) {
        setIsHamburgerMenuOpen(false);
      }
    };

    // ESC 키 감지
    const handleEscapeKey = (event) => {
      if (event.key === 'Escape') {
        setIsHamburgerMenuOpen(false);
      }
    };

    if (isHamburgerMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleEscapeKey);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscapeKey);
    };
  }, [isHamburgerMenuOpen]);

  // 다크모드/라이트모드 토글
  const toggleDarkMode = () => {
    const newDarkMode = !isDarkMode;
    setIsDarkMode(newDarkMode);
    
    if (newDarkMode) {
      document.documentElement.setAttribute('data-theme', 'dark');
      localStorage.setItem('seedling-theme', 'dark');
    } else {
      document.documentElement.setAttribute('data-theme', 'light');
      localStorage.setItem('seedling-theme', 'light');
    }
    
    // closeHamburgerMenu() 제거 - 메뉴가 닫히지 않도록
  };

  // 데이터 백업
  const backupData = () => {
    try {
      // 로컬스토리지의 모든 데이터 수집
      const backupData = {};
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key) {
          backupData[key] = localStorage.getItem(key);
        }
      }
      
      // 현재 날짜로 파일명 생성
      const today = new Date();
      const dateStr = today.toISOString().split('T')[0];
      const filename = `seedling-backup-${dateStr}.json`;
      
      // JSON 파일 다운로드
      const dataStr = JSON.stringify(backupData, null, 2);
      const dataBlob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(dataBlob);
      
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
      alert('데이터 백업이 완료되었습니다!');
      closeHamburgerMenu();
    } catch (error) {
      alert('백업 중 오류가 발생했습니다: ' + error.message);
    }
  };

  // 데이터 복원
  const restoreData = () => {
    fileInputRef.current?.click();
  };

  // 파일 업로드 처리
  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    if (file.type !== 'application/json') {
      alert('JSON 파일만 업로드 가능합니다.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target.result);
        
        // 사용자 확인
        if (confirm('기존 데이터가 모두 덮어써집니다. 계속하시겠습니까?')) {
          // 로컬스토리지 초기화 후 복원
          localStorage.clear();
          Object.keys(data).forEach(key => {
            localStorage.setItem(key, data[key]);
          });
          
          alert('데이터 복원이 완료되었습니다! 페이지를 새로고침합니다.');
          window.location.reload();
        }
      } catch (error) {
        alert('파일 형식이 올바르지 않습니다: ' + error.message);
      }
    };
    reader.readAsText(file);
    
    // 파일 입력 초기화
    event.target.value = '';
    closeHamburgerMenu();
  };

  // 데이터 내보내기
  const exportData = () => {
    try {
      // 지원자 데이터 가져오기
      const candidatesData = localStorage.getItem('candidates');
      let candidates = [];
      
      if (candidatesData) {
        candidates = JSON.parse(candidatesData);
      }
      
      if (candidates.length === 0) {
        alert('내보낼 지원자 데이터가 없습니다.');
        return;
      }
      
      // CSV 헤더
      const headers = ['이름', '이메일', '직무', '지원일', '현재단계', '평가점수'];
      
      // CSV 데이터 생성
      const csvContent = [
        headers.join(','),
        ...candidates.map(candidate => [
          candidate.name || '',
          candidate.email || '',
          candidate.position || '',
          candidate.applicationDate || '',
          candidate.stage || '',
          candidate.score || ''
        ].join(','))
      ].join('\n');
      
      // 현재 날짜로 파일명 생성
      const today = new Date();
      const dateStr = today.toISOString().split('T')[0];
      const filename = `candidates-${dateStr}.csv`;
      
      // CSV 파일 다운로드
      const dataBlob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(dataBlob);
      
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
      alert('데이터 내보내기가 완료되었습니다!');
      closeHamburgerMenu();
    } catch (error) {
      alert('내보내기 중 오류가 발생했습니다: ' + error.message);
    }
  };

  return (
    <div className="layout">
      {/* 숨겨진 파일 입력 */}
      <input
        type="file"
        ref={fileInputRef}
        accept=".json"
        onChange={handleFileUpload}
        style={{ display: 'none' }}
      />
      
      {/* 헤더 */}
      <header className="header">
        <div className="header-content">
          {/* 왼쪽: 로고 */}
          <div className="logo">
            <h1>🌱 Seedling</h1>
            <span className="subtitle">채용 관리 시스템</span>
          </div>
          
          {/* 중앙: 네비게이션 탭 */}
          <nav className="nav-tabs">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`nav-tab ${location.pathname === item.path ? 'active' : ''}`}
              >
                {item.label}
              </Link>
            ))}
          </nav>
          
          {/* 오른쪽: 햄버거 메뉴 */}
          <div className="header-right" ref={hamburgerMenuRef}>
            <button 
              className="hamburger-menu-toggle"
              onClick={toggleHamburgerMenu}
              aria-label="메뉴 열기"
            >
              ☰
            </button>
            
            {/* 햄버거 메뉴 드롭다운 */}
            {isHamburgerMenuOpen && (
              <div className="hamburger-menu-dropdown">
                <div className="menu-header">
                  <span>메뉴</span>
                  <button 
                    className="menu-close"
                    onClick={closeHamburgerMenu}
                    aria-label="메뉴 닫기"
                  >
                    ✕
                  </button>
                </div>
                
                {/* 단순화된 메뉴 항목들 */}
                <div className="menu-items-container">
                  <div className="menu-item toggle-item">
                    <span className="menu-icon">{isDarkMode ? '☀️' : '🌙'}</span>
                    <span className="toggle-label">{isDarkMode ? '라이트모드' : '다크모드'}</span>
                    <div className="toggle-switch">
                      <input
                        type="checkbox"
                        id="theme-toggle"
                        checked={isDarkMode}
                        onChange={toggleDarkMode}
                        className="toggle-input"
                      />
                      <label htmlFor="theme-toggle" className="toggle-slider"></label>
                    </div>
                  </div>
                  
                  <button className="menu-item" onClick={backupData}>
                    <span className="menu-icon">💾</span>
                    <span>데이터 백업</span>
                  </button>
                  
                  <button className="menu-item" onClick={restoreData}>
                    <span className="menu-icon">📥</span>
                    <span>데이터 복원</span>
                  </button>
                  
                  <button className="menu-item" onClick={exportData}>
                    <span className="menu-icon">📊</span>
                    <span>데이터 내보내기</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* 메인 컨테이너 */}
      <div className="main-container">
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
    </div>
  );
};

export default Layout;
