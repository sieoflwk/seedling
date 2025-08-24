import React, { useState, useEffect } from 'react';
import KanbanBoard from '../components/KanbanBoard';
import { loadCandidates, loadStatistics } from '../data/localStorage';
import './Candidates.css';

const Candidates = () => {
  const [allCandidates, setAllCandidates] = useState([]);
  const [statistics, setStatistics] = useState({});
  const [viewMode, setViewMode] = useState('kanban');

  useEffect(() => {
    loadCandidates().then(setAllCandidates);
    loadStatistics().then(setStatistics);
  }, []);

  const handleUpdateCandidate = (updatedCandidate) => {
    // localStorage에서 지원자 업데이트
    const updatedCandidates = allCandidates.map(candidate =>
      candidate.id === updatedCandidate.id ? updatedCandidate : candidate
    );
    setAllCandidates(updatedCandidates);
    
    // 통계 재계산
    loadStatistics().then(setStatistics);
  };

  return (
    <div className="candidates-page">
      <div className="page-header">
        <div className="header-content">
          <h1>지원자 관리</h1>
          <p>지원자들의 진행 상황을 관리하고 단계별로 이동할 수 있습니다.</p>
        </div>
        
        <div className="header-actions">
          <div className="view-toggle">
            <button
              className={`toggle-btn ${viewMode === 'kanban' ? 'active' : ''}`}
              onClick={() => setViewMode('kanban')}
            >
              칸반보드
            </button>
            <button
              className={`toggle-btn ${viewMode === 'table' ? 'active' : ''}`}
              onClick={() => setViewMode('table')}
            >
              테이블
            </button>
          </div>
        </div>
      </div>

      <div className="stats-summary">
        <div className="stat-item">
          <div className="stat-number">{statistics.total || 0}</div>
          <div className="stat-label">전체 지원자</div>
        </div>
        <div className="stat-item">
          <div className="stat-number">{statistics.applied || 0}</div>
          <div className="stat-label">접수</div>
        </div>
        <div className="stat-item">
          <div className="stat-number">{statistics.document_review || 0}</div>
          <div className="stat-label">서류평가</div>
        </div>
        <div className="stat-item">
          <div className="stat-number">{statistics.interview || 0}</div>
          <div className="stat-label">면접</div>
        </div>
      </div>

      {viewMode === 'kanban' && (
        <div className="kanban-section">
          <div className="section-header">
            <h2>칸반보드</h2>
            <p>지원자 카드를 드래그하여 단계를 변경할 수 있습니다.</p>
          </div>
          <KanbanBoard
            candidates={allCandidates}
            onUpdateCandidate={handleUpdateCandidate}
          />
        </div>
      )}

      {viewMode === 'table' && (
        <div className="table-section">
          <div className="section-header">
            <h2>테이블 뷰</h2>
            <p>지원자 정보를 테이블 형태로 확인할 수 있습니다.</p>
          </div>
          <div className="table-view">
            <div className="table-container">
              <table>
                <thead>
                  <tr>
                    <th>이름</th>
                    <th>직무</th>
                    <th>단계</th>
                    <th>점수</th>
                    <th>지원일</th>
                  </tr>
                </thead>
                <tbody>
                  {allCandidates.length > 0 ? (
                    allCandidates.map((candidate, index) => (
                      <tr key={candidate.id} className={`candidate-row ${index % 2 === 0 ? 'even-row' : 'odd-row'}`}>
                        <td>
                          <div className="candidate-name">
                            <strong>{candidate.name}</strong>
                          </div>
                        </td>
                        <td>{candidate.position}</td>
                        <td>
                          <span className="stage-badge">
                            {candidate.currentStage === 'applied' && '접수'}
                            {candidate.currentStage === 'document_review' && '서류평가'}
                            {candidate.currentStage === 'interview' && '면접'}
                            {candidate.currentStage === 'final_pass' && '최종합격'}
                          </span>
                        </td>
                        <td>
                          {candidate.score > 0 ? (
                            <span className="score">{candidate.score}점</span>
                          ) : (
                            <span className="no-score">평가 없음</span>
                          )}
                        </td>
                        <td>{new Date(candidate.appliedDate).toLocaleDateString('ko-KR')}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="5">
                        <div className="empty-table">
                          <div className="empty-table-content">
                            <div className="empty-icon">📋</div>
                            <h3>지원자가 없습니다</h3>
                            <p>첫 번째 지원자를 추가해보세요.</p>
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Candidates;
