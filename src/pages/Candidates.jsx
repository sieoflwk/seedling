import React, { useState, useEffect } from 'react';
import { candidateStorage } from '../data/localStorage';
import { CANDIDATE_STAGES, STAGE_LABELS } from '../data/candidateModel';
import CandidateModal from '../components/CandidateModal';
import CandidateDetailModal from '../components/CandidateDetailModal';
import './Candidates.css';

const Candidates = () => {
  const [candidatesByStage, setCandidatesByStage] = useState({});
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedCandidate, setSelectedCandidate] = useState(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [viewMode, setViewMode] = useState('kanban'); // 'kanban' or 'table'

  useEffect(() => {
    loadCandidates();
  }, []);

  const loadCandidates = () => {
    const stageData = {};
    Object.values(CANDIDATE_STAGES).forEach(stage => {
      stageData[stage] = candidateStorage.getCandidatesByStage(stage);
    });
    setCandidatesByStage(stageData);
  };

  const handleAddCandidate = (candidate) => {
    loadCandidates();
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
  };

  const handleDragStart = (e, candidate) => {
    e.dataTransfer.setData('candidateId', candidate.id);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = (e, targetStage) => {
    e.preventDefault();
    const candidateId = e.dataTransfer.getData('candidateId');
    
    if (candidateId) {
      const result = candidateStorage.moveCandidateToStage(candidateId, targetStage);
      if (result.success) {
        loadCandidates();
      }
    }
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

      {/* 칸반보드 뷰 */}
      {viewMode === 'kanban' && (
        <div className="kanban-board">
          {Object.values(CANDIDATE_STAGES).map((stage) => (
            <div 
              key={stage} 
              className="kanban-column"
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, stage)}
            >
              <div className="column-header" style={{ borderTopColor: getStageColor(stage) }}>
                <h3>{STAGE_LABELS[stage]}</h3>
                <span className="candidate-count">
                  {candidatesByStage[stage]?.length || 0}
                </span>
              </div>
              
              <div className="column-content">
                {candidatesByStage[stage]?.map((candidate) => (
                  <div
                    key={candidate.id}
                    className="candidate-card"
                    draggable
                    onDragStart={(e) => handleDragStart(e, candidate)}
                    onClick={() => handleCandidateClick(candidate)}
                  >
                    <div className="candidate-header">
                      <h4>{candidate.name}</h4>
                      {candidate.score > 0 && (
                        <span className="score-badge">{candidate.score}점</span>
                      )}
                    </div>
                    <div className="candidate-info">
                      <p className="position">{candidate.position}</p>
                      <p className="date">{formatDate(candidate.appliedDate)}</p>
                    </div>
                    {candidate.comment && (
                      <div className="candidate-comment">
                        <p>{candidate.comment}</p>
                      </div>
                    )}
                  </div>
                ))}
                
                {(!candidatesByStage[stage] || candidatesByStage[stage].length === 0) && (
                  <div className="empty-column">
                    <p>지원자가 없습니다</p>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 테이블 뷰 */}
      {viewMode === 'table' && (
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
      )}

      {/* 지원자 추가 모달 */}
      <CandidateModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSave={handleAddCandidate}
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
