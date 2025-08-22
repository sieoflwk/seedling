import React, { useState } from 'react';
import { CANDIDATE_STAGES, STAGE_LABELS } from '../data/candidateModel';
import { candidateStorage } from '../data/localStorage';
import './CandidateDetailModal.css';

const CandidateDetailModal = ({ isOpen, onClose, candidate, onUpdate }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({
    score: candidate?.score || 0,
    comment: candidate?.comment || '',
    currentStage: candidate?.currentStage || CANDIDATE_STAGES.APPLIED
  });

  if (!isOpen || !candidate) return null;

  const handleSave = () => {
    // 점수 업데이트
    if (editData.score !== candidate.score) {
      candidateStorage.updateCandidateScore(candidate.id, editData.score);
    }

    // 코멘트 업데이트
    if (editData.comment !== candidate.comment) {
      candidateStorage.updateCandidateComment(candidate.id, editData.comment);
    }

    // 단계 업데이트
    if (editData.currentStage !== candidate.currentStage) {
      candidateStorage.moveCandidateToStage(candidate.id, editData.currentStage);
    }

    // 부모 컴포넌트에 업데이트 알림
    if (onUpdate) {
      onUpdate();
    }

    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditData({
      score: candidate.score || 0,
      comment: candidate.comment || '',
      currentStage: candidate.currentStage || CANDIDATE_STAGES.APPLIED
    });
    setIsEditing(false);
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
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

  return (
    <div className="modal-overlay detail-modal" onClick={onClose}>
      <div className="modal-content detail-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>👤 지원자 상세 정보</h2>
          <button className="modal-close" onClick={onClose}>
            ✕
          </button>
        </div>

        <div className="candidate-detail">
          {/* 기본 정보 섹션 */}
          <div className="detail-section">
            <h3>📋 기본 정보</h3>
            <div className="info-grid">
              <div className="info-item">
                <label>이름</label>
                <span>{candidate.name}</span>
              </div>
              <div className="info-item">
                <label>이메일</label>
                <span>{candidate.email}</span>
              </div>
              <div className="info-item">
                <label>전화번호</label>
                <span>{candidate.phone || '미입력'}</span>
              </div>
              <div className="info-item">
                <label>지원직무</label>
                <span>{candidate.position}</span>
              </div>
              <div className="info-item">
                <label>지원일자</label>
                <span>{formatDate(candidate.appliedDate)}</span>
              </div>
              <div className="info-item">
                <label>현재 단계</label>
                <span 
                  className="stage-badge"
                  style={{ backgroundColor: getStageColor(candidate.currentStage) }}
                >
                  {STAGE_LABELS[candidate.currentStage]}
                </span>
              </div>
            </div>
          </div>

          {/* 평가 정보 섹션 */}
          <div className="detail-section">
            <div className="section-header">
              <h3>⭐ 평가 정보</h3>
              <button 
                className="edit-btn"
                onClick={() => setIsEditing(!isEditing)}
              >
                {isEditing ? '취소' : '편집'}
              </button>
            </div>

            {isEditing ? (
              <div className="edit-form">
                <div className="edit-row">
                  <div className="edit-group">
                    <label>평가점수</label>
                    <input
                      type="number"
                      value={editData.score}
                      onChange={(e) => setEditData(prev => ({ ...prev, score: parseInt(e.target.value) || 0 }))}
                      min="0"
                      max="100"
                    />
                  </div>
                  <div className="edit-group">
                    <label>현재 단계</label>
                    <select
                      value={editData.currentStage}
                      onChange={(e) => setEditData(prev => ({ ...prev, currentStage: e.target.value }))}
                    >
                      {Object.entries(STAGE_LABELS).map(([stage, label]) => (
                        <option key={stage} value={stage}>
                          {label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="edit-group">
                  <label>코멘트</label>
                  <textarea
                    value={editData.comment}
                    onChange={(e) => setEditData(prev => ({ ...prev, comment: e.target.value }))}
                    rows="4"
                    placeholder="지원자에 대한 평가나 메모를 입력하세요"
                  />
                </div>
                <div className="edit-actions">
                  <button className="btn btn-secondary" onClick={handleCancel}>
                    취소
                  </button>
                  <button className="btn btn-primary" onClick={handleSave}>
                    저장
                  </button>
                </div>
              </div>
            ) : (
              <div className="info-grid">
                <div className="info-item">
                  <label>평가점수</label>
                  <span className={candidate.score > 0 ? 'score' : 'no-score'}>
                    {candidate.score > 0 ? `${candidate.score}점` : '평가 대기'}
                  </span>
                </div>
                <div className="info-item">
                  <label>코멘트</label>
                  <span className="comment">
                    {candidate.comment || '코멘트가 없습니다.'}
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* 시스템 정보 섹션 */}
          <div className="detail-section">
            <h3>⚙️ 시스템 정보</h3>
            <div className="info-grid">
              <div className="info-item">
                <label>생성일</label>
                <span>{formatDate(candidate.createdAt)}</span>
              </div>
              <div className="info-item">
                <label>최종 수정일</label>
                <span>{formatDate(candidate.updatedAt)}</span>
              </div>
              <div className="info-item">
                <label>지원자 ID</label>
                <span className="candidate-id">{candidate.id}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CandidateDetailModal;
