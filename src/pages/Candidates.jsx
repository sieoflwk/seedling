import React, { useState, useEffect } from 'react';
import { candidateStorage } from '../data/localStorage';
import { CANDIDATE_STAGES, STAGE_LABELS } from '../data/candidateModel';
import AddCandidateModal from '../components/AddCandidateModal';
import CandidateDetailModal from '../components/CandidateDetailModal';
import KanbanBoard from '../components/KanbanBoard';
import './Candidates.css';

const Candidates = () => {
  const [candidatesByStage, setCandidatesByStage] = useState({});
  const [statistics, setStatistics] = useState(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedCandidate, setSelectedCandidate] = useState(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [viewMode, setViewMode] = useState('kanban'); // 'kanban' or 'table'

  useEffect(() => {
    loadCandidates();
    loadStatistics();
  }, []);

  const loadCandidates = () => {
    const stageData = {};
    Object.values(CANDIDATE_STAGES).forEach(stage => {
      stageData[stage] = candidateStorage.getCandidatesByStage(stage);
    });
    setCandidatesByStage(stageData);
  };

  const loadStatistics = () => {
    const stats = candidateStorage.getStatistics();
    setStatistics(stats);
  };

  const handleAddCandidate = (candidate) => {
    loadCandidates();
    loadStatistics();
  };

  const handleCandidateClick = (candidate) => {
    setSelectedCandidate(candidate);
    setIsDetailModalOpen(true);
  };

  const handleDetailModalClose = () => {
    setIsDetailModalOpen(false);
    setSelectedCandidate(null);
  };

  const handleDetailUpdate = () => {
    loadCandidates();
    loadStatistics();
  };

  const handleDataUpdate = () => {
    loadCandidates();
    loadStatistics();
  };

  const getStageColor = (stage) => {
    const colors = {
      [CANDIDATE_STAGES.APPLIED]: '#3b82f6',
      [CANDIDATE_STAGES.DOCUMENT_REVIEW]: '#f59e0b',
      [CANDIDATE_STAGES.INTERVIEW]: '#8b5cf6',
      [CANDIDATE_STAGES.FINAL_PASS]: '#10b981'
    };
    return colors[stage] || '#6b7280';
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ko-KR', {
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div className="candidates-page">
      {/* 페이지 헤더 */}
      <div className="page-header">
        <div className="header-content">
          <h1>👥 지원자 관리</h1>
          <p>지원자들의 단계별 현황을 관리하고 진행 상황을 추적하세요</p>
        </div>
        <div className="header-actions">
          <div className="view-toggle">
            <button
              className={`toggle-btn ${viewMode === 'kanban' ? 'active' : ''}`}
              onClick={() => setViewMode('kanban')}
            >
              📋 칸반보드
            </button>
            <button
              className={`toggle-btn ${viewMode === 'table' ? 'active' : ''}`}
              onClick={() => setViewMode('table')}
            >
              📊 테이블
            </button>
          </div>
          <button 
            className="btn btn-primary"
            onClick={() => setIsAddModalOpen(true)}
          >
            👤 새 지원자 추가
          </button>
        </div>
      </div>

      {/* 통계 요약 */}
      {statistics && (
        <div className="stats-summary">
          <div className="stat-item">
            <span className="stat-number">{statistics.total}</span>
            <span className="stat-label">전체 지원자</span>
          </div>
          <div className="stat-item">
            <span className="stat-number">{statistics.recentApplications}</span>
            <span className="stat-label">최근 7일</span>
          </div>
          <div className="stat-item">
            <span className="stat-number">{statistics.averageScore}점</span>
            <span className="stat-label">평균 점수</span>
          </div>
          <div className="stat-item">
            <span className="stat-number">
              {statistics.total > 0 
                ? Math.round((statistics.byStage[CANDIDATE_STAGES.FINAL_PASS] / statistics.total) * 100)
                : 0}%
            </span>
            <span className="stat-label">최종합격률</span>
          </div>
        </div>
      )}

      {/* 칸반보드 뷰 */}
      {viewMode === 'kanban' && (
        <div className="kanban-section">
          <div className="section-header">
            <h2>📋 단계별 지원자 현황</h2>
            <p>드래그 앤 드롭으로 지원자 단계를 변경할 수 있습니다</p>
          </div>
          <KanbanBoard
            onCandidateClick={handleCandidateClick}
            onDataUpdate={handleDataUpdate}
          />
        </div>
      )}

      {/* 테이블 뷰 */}
      {viewMode === 'table' && (
        <div className="table-section">
          <div className="section-header">
            <h2>📊 지원자 목록</h2>
            <p>모든 지원자 정보를 테이블 형태로 확인하세요</p>
          </div>
          <div className="table-view">
            <div className="table-container">
              <table>
                <thead>
                  <tr>
                    <th>이름</th>
                    <th>이메일</th>
                    <th>지원직무</th>
                    <th>지원일자</th>
                    <th>현재단계</th>
                    <th>평가점수</th>
                    <th>코멘트</th>
                  </tr>
                </thead>
                <tbody>
                  {Object.values(candidatesByStage).flat().map((candidate) => (
                    <tr 
                      key={candidate.id}
                      className="candidate-row"
                      onClick={() => handleCandidateClick(candidate)}
                    >
                      <td>
                        <div className="candidate-name">
                          <strong>{candidate.name}</strong>
                        </div>
                      </td>
                      <td>{candidate.email}</td>
                      <td>{candidate.position}</td>
                      <td>{formatDate(candidate.appliedDate)}</td>
                      <td>
                        <span 
                          className="stage-badge"
                          style={{ backgroundColor: getStageColor(candidate.currentStage) }}
                        >
                          {STAGE_LABELS[candidate.currentStage]}
                        </span>
                      </td>
                      <td>
                        {candidate.score > 0 ? (
                          <span className="score">{candidate.score}점</span>
                        ) : (
                          <span className="no-score">평가 대기</span>
                        )}
                      </td>
                      <td>
                        <span className="comment-preview">
                          {candidate.comment ? 
                            (candidate.comment.length > 30 ? 
                              candidate.comment.substring(0, 30) + '...' : 
                              candidate.comment
                            ) : 
                            '코멘트 없음'
                          }
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* 지원자 추가 모달 */}
      <AddCandidateModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSuccess={handleAddCandidate}
      />

      {/* 지원자 상세 정보 모달 */}
      <CandidateDetailModal
        isOpen={isDetailModalOpen}
        onClose={handleDetailModalClose}
        candidate={selectedCandidate}
        onUpdate={handleDetailUpdate}
      />
    </div>
  );
};

export default Candidates;
