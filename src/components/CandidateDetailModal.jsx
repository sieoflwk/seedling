import React, { useEffect, useState } from 'react';
import './CandidateDetailModal.css';

const CandidateDetailModal = ({ isOpen, onClose, candidate, onUpdate, onDelete }) => {
  const [editData, setEditData] = useState({
    score: 0,
    comment: '',
    currentStage: 'applied',
    interviewSchedule: {
      date: '',
      time: '',
      location: ''
    }
  });
  const [isEditing, setIsEditing] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // ESC 키로 모달 닫기
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') {
        if (showDeleteConfirm) {
          setShowDeleteConfirm(false);
        } else {
          onClose();
        }
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      // 모달이 열리면 body 스크롤 방지
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      // 모달이 닫히면 body 스크롤 복원
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose, showDeleteConfirm]);

  // candidate가 변경될 때마다 editData 초기화
  useEffect(() => {
    if (candidate) {
      setEditData({
        score: candidate.score || 0,
        comment: candidate.comment || '',
        currentStage: candidate.currentStage || 'applied',
        interviewSchedule: candidate.interviewSchedule || {
          date: '',
          time: '',
          location: ''
        }
      });
      setIsEditing(false);
      setHasChanges(false);
      setShowDeleteConfirm(false);
    }
  }, [candidate]);

  // 변경사항 감지
  useEffect(() => {
    if (candidate && isEditing) {
      const hasScoreChanged = editData.score !== (candidate.score || 0);
      const hasCommentChanged = editData.comment !== (candidate.comment || '');
      const hasStageChanged = editData.currentStage !== (candidate.currentStage || 'applied');
      const hasInterviewScheduleChanged = JSON.stringify(editData.interviewSchedule) !== JSON.stringify(candidate.interviewSchedule || {
        date: '',
        time: '',
        location: ''
      });
      
      setHasChanges(hasScoreChanged || hasCommentChanged || hasStageChanged || hasInterviewScheduleChanged);
    }
  }, [editData, candidate, isEditing]);

  // 모달이 닫혀있으면 렌더링하지 않음
  if (!isOpen) return null;

  const handleOverlayClick = (e) => {
    // 오버레이 클릭 시에만 모달 닫기 (모달 내부 클릭은 제외)
    if (e.target === e.currentTarget) {
      if (showDeleteConfirm) {
        setShowDeleteConfirm(false);
      } else {
        onClose();
      }
    }
  };

  // 단계별 색상과 라벨
  const getStageInfo = (stage) => {
    const stageMap = {
      'applied': { label: '접수', color: '#3b82f6' },
      'document_review': { label: '서류평가', color: '#f59e0b' },
      'interview': { label: '면접', color: '#8b5cf6' },
      'final_pass': { label: '최종합격', color: '#10b981' }
    };
    return stageMap[stage] || { label: '알 수 없음', color: '#6b7280' };
  };

  // 단계 옵션 배열
  const stageOptions = [
    { value: 'applied', label: '접수' },
    { value: 'document_review', label: '서류평가' },
    { value: 'interview', label: '면접' },
    { value: 'final_pass', label: '최종합격' }
  ];

  // 날짜 포맷팅
  const formatDate = (dateString) => {
    if (!dateString) return '정보 없음';
    const date = new Date(dateString);
    return date.toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  // 점수 입력 처리
  const handleScoreChange = (e) => {
    const value = parseInt(e.target.value) || 0;
    const clampedValue = Math.max(0, Math.min(100, value));
    setEditData(prev => ({ ...prev, score: clampedValue }));
  };

  // 코멘트 입력 처리
  const handleCommentChange = (e) => {
    setEditData(prev => ({ ...prev, comment: e.target.value }));
  };

  // 단계 변경 처리
  const handleStageChange = (e) => {
    setEditData(prev => ({ ...prev, currentStage: e.target.value }));
  };

  // 면접 일정 변경 처리
  const handleInterviewScheduleChange = (e) => {
    const { name, value } = e.target;
    setEditData(prev => ({
      ...prev,
      interviewSchedule: {
        ...prev.interviewSchedule,
        [name]: value
      }
    }));

    // 면접 일정이 등록되면 자동으로 면접 단계로 변경
    if (name === 'date' && value && editData.currentStage !== 'interview') {
      setEditData(prev => ({
        ...prev,
        currentStage: 'interview'
      }));
    }
  };

  // 편집 모드 토글
  const toggleEditing = () => {
    setIsEditing(!isEditing);
  };

  // 삭제 확인 다이얼로그 표시
  const showDeleteDialog = () => {
    setShowDeleteConfirm(true);
  };

  // 삭제 확인 다이얼로그 숨기기
  const hideDeleteDialog = () => {
    setShowDeleteConfirm(false);
  };

  // 삭제 실행
  const handleDelete = () => {
    if (onDelete && candidate) {
      onDelete(candidate.id);
      setShowDeleteConfirm(false);
      onClose();
    }
  };

  // 저장 처리
  const handleSave = () => {
    if (onUpdate && candidate) {
      const updatedCandidate = {
        ...candidate,
        score: editData.score,
        comment: editData.comment,
        currentStage: editData.currentStage,
        interviewSchedule: editData.interviewSchedule
      };
      onUpdate(updatedCandidate);
      setIsEditing(false);
      setHasChanges(false);
      onClose();
    }
  };

  // 취소 처리
  const handleCancel = () => {
    setEditData({
      score: candidate.score || 0,
      comment: candidate.comment || '',
      currentStage: candidate.currentStage || 'applied',
      interviewSchedule: candidate.interviewSchedule || {
        date: '',
        time: '',
        location: ''
      }
    });
    setIsEditing(false);
    setHasChanges(false);
  };

  const stageInfo = getStageInfo(candidate?.currentStage);

  return (
    <div className="modal-overlay" onClick={handleOverlayClick}>
      <div className="modal-container">
        {/* 모달 헤더 */}
        <div className="modal-header">
          <h2 className="modal-title">지원자 상세 정보</h2>
          <button 
            className="modal-close-btn"
            onClick={onClose}
            aria-label="모달 닫기"
          >
            ✕
          </button>
        </div>

        {/* 모달 바디 */}
        <div className="modal-body">
          {/* 기본 정보 섹션 */}
          <div className="info-section">
            <h3 className="section-title">기본 정보</h3>
            <div className="info-grid">
              <div className="info-item">
                <label className="info-label">이름</label>
                <span className="info-value candidate-name">{candidate?.name || '정보 없음'}</span>
              </div>
              <div className="info-item">
                <label className="info-label">이메일</label>
                <span className="info-value">{candidate?.email || '정보 없음'}</span>
              </div>
              <div className="info-item">
                <label className="info-label">지원 직무</label>
                <span className="info-value">{candidate?.position || '정보 없음'}</span>
              </div>
              <div className="info-item">
                <label className="info-label">지원 일자</label>
                <span className="info-value">{formatDate(candidate?.appliedDate)}</span>
              </div>
            </div>
          </div>

          {/* 현재 상태 섹션 */}
          <div className="info-section">
            <h3 className="section-title">현재 상태</h3>
            <div className="info-grid">
              <div className="info-item">
                <label className="info-label">현재 단계</label>
                {isEditing ? (
                  <select
                    className="stage-select"
                    value={editData.currentStage}
                    onChange={handleStageChange}
                  >
                    {stageOptions.map(option => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                ) : (
                  <span 
                    className="stage-badge"
                    style={{ backgroundColor: stageInfo.color }}
                  >
                    {stageInfo.label}
                  </span>
                )}
              </div>
              <div className="info-item">
                <label className="info-label">평가 점수</label>
                {isEditing ? (
                  <div className="score-input-container">
                    <input
                      type="number"
                      className="score-input"
                      value={editData.score}
                      onChange={handleScoreChange}
                      min="0"
                      max="100"
                      placeholder="0-100"
                    />
                    <span className="score-unit">점</span>
                  </div>
                ) : (
                  <span className={`info-value ${candidate?.score > 0 ? 'score-value' : 'no-score'}`}>
                    {candidate?.score > 0 ? `${candidate.score}점` : '평가 없음'}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* 평가 의견 섹션 */}
          <div className="info-section">
            <h3 className="section-title">평가 의견</h3>
            {isEditing ? (
              <textarea
                className="comment-textarea"
                value={editData.comment}
                onChange={handleCommentChange}
                placeholder="지원자에 대한 평가 의견을 작성해주세요"
                rows="4"
              />
            ) : (
              <div className="comment-content">
                <p>{candidate?.comment || '평가 의견이 없습니다.'}</p>
              </div>
            )}
          </div>

          {/* 면접 일정 섹션 */}
          <div className="info-section">
            <h3 className="section-title">면접 일정</h3>
            {isEditing ? (
              <div className="interview-schedule-inputs">
                <div className="input-group">
                  <label>면접 날짜</label>
                  <input
                    type="date"
                    name="date"
                    value={editData.interviewSchedule.date}
                    onChange={handleInterviewScheduleChange}
                  />
                </div>
                <div className="input-group">
                  <label>면접 시간</label>
                  <input
                    type="time"
                    name="time"
                    value={editData.interviewSchedule.time}
                    onChange={handleInterviewScheduleChange}
                  />
                </div>
                <div className="input-group">
                  <label>면접 장소</label>
                  <input
                    type="text"
                    name="location"
                    value={editData.interviewSchedule.location}
                    onChange={handleInterviewScheduleChange}
                    placeholder="예: 서울시 강남구 테헤란로 123"
                  />
                </div>
              </div>
            ) : (
              <div className="interview-schedule-display">
                <p>면접 날짜: {formatDate(candidate?.interviewSchedule?.date)}</p>
                <p>면접 시간: {candidate?.interviewSchedule?.time || '정보 없음'}</p>
                <p>면접 장소: {candidate?.interviewSchedule?.location || '정보 없음'}</p>
              </div>
            )}
          </div>

          {/* 변경사항 알림 */}
          {isEditing && hasChanges && (
            <div className="changes-notice">
              <span className="changes-icon">⚠️</span>
              <span className="changes-text">변경사항이 있습니다</span>
            </div>
          )}
        </div>

        {/* 모달 푸터 */}
        <div className="modal-footer">
          {isEditing ? (
            <>
              <button 
                className="btn btn-secondary"
                onClick={handleCancel}
              >
                취소
              </button>
              <button 
                className={`btn btn-primary ${hasChanges ? 'btn-primary-highlight' : ''}`}
                onClick={handleSave}
                disabled={!hasChanges}
              >
                저장
              </button>
            </>
          ) : (
            <>
              <button 
                className="btn btn-danger"
                onClick={showDeleteDialog}
              >
                삭제
              </button>
              <div className="footer-actions">
                <button 
                  className="btn btn-secondary"
                  onClick={onClose}
                >
                  닫기
                </button>
                <button 
                  className="btn btn-primary"
                  onClick={toggleEditing}
                >
                  편집
                </button>
              </div>
            </>
          )}
        </div>

        {/* 삭제 확인 다이얼로그 */}
        {showDeleteConfirm && (
          <div className="delete-confirm-overlay">
            <div className="delete-confirm-dialog">
              <div className="delete-confirm-header">
                <h3>지원자 삭제</h3>
              </div>
              <div className="delete-confirm-body">
                <p>
                  정말로 <strong>{candidate?.name}</strong>을(를) 삭제하시겠습니까?
                </p>
                <p className="delete-warning">
                  이 작업은 되돌릴 수 없습니다.
                </p>
              </div>
              <div className="delete-confirm-footer">
                <button 
                  className="btn btn-secondary"
                  onClick={hideDeleteDialog}
                >
                  취소
                </button>
                <button 
                  className="btn btn-danger"
                  onClick={handleDelete}
                >
                  삭제
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CandidateDetailModal;
