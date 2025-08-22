import React, { useState, useEffect } from 'react';
import { Candidate, CANDIDATE_STAGES, STAGE_LABELS, validateCandidate } from '../data/candidateModel';
import { candidateStorage } from '../data/localStorage';
import './CandidateModal.css';

const CandidateModal = ({ isOpen, onClose, candidate = null, onSave }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    position: '',
    appliedDate: new Date().toISOString().split('T')[0],
    currentStage: CANDIDATE_STAGES.APPLIED,
    score: 0,
    comment: ''
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isEditMode = !!candidate;

  useEffect(() => {
    if (candidate) {
      setFormData({
        name: candidate.name || '',
        email: candidate.email || '',
        phone: candidate.phone || '',
        position: candidate.position || '',
        appliedDate: candidate.appliedDate ? new Date(candidate.appliedDate).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
        currentStage: candidate.currentStage || CANDIDATE_STAGES.APPLIED,
        score: candidate.score || 0,
        comment: candidate.comment || ''
      });
    }
  }, [candidate]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // 에러 메시지 제거
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // 폼 검증
    const validation = validateCandidate(formData);
    if (!validation.isValid) {
      const errorObj = {};
      validation.errors.forEach(error => {
        if (error.includes('이름')) errorObj.name = error;
        else if (error.includes('이메일')) errorObj.email = error;
        else if (error.includes('지원직무')) errorObj.position = error;
      });
      setErrors(errorObj);
      return;
    }

    setIsSubmitting(true);
    
    try {
      const candidateData = {
        ...formData,
        id: candidate?.id, // 편집 모드인 경우 기존 ID 유지
        appliedDate: new Date(formData.appliedDate).toISOString(),
        score: parseInt(formData.score) || 0
      };

      const result = candidateStorage.saveCandidate(candidateData);
      
      if (result.success) {
        onSave(result.candidate);
        onClose();
        setFormData({
          name: '',
          email: '',
          phone: '',
          position: '',
          appliedDate: new Date().toISOString().split('T')[0],
          currentStage: CANDIDATE_STAGES.APPLIED,
          score: 0,
          comment: ''
        });
        setErrors({});
      } else {
        alert('저장에 실패했습니다: ' + result.error);
      }
    } catch (error) {
      console.error('지원자 저장 오류:', error);
      alert('저장 중 오류가 발생했습니다.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{isEditMode ? '지원자 정보 수정' : '새 지원자 추가'}</h2>
          <button className="modal-close" onClick={onClose}>
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="candidate-form">
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="name">이름 *</label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                className={errors.name ? 'error' : ''}
                placeholder="지원자 이름을 입력하세요"
                required
              />
              {errors.name && <span className="error-message">{errors.name}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="email">이메일 *</label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                className={errors.email ? 'error' : ''}
                placeholder="이메일을 입력하세요"
                required
              />
              {errors.email && <span className="error-message">{errors.email}</span>}
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="phone">전화번호</label>
              <input
                type="tel"
                id="phone"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                placeholder="전화번호를 입력하세요"
              />
            </div>

            <div className="form-group">
              <label htmlFor="position">지원직무 *</label>
              <input
                type="text"
                id="position"
                name="position"
                value={formData.position}
                onChange={handleInputChange}
                className={errors.position ? 'error' : ''}
                placeholder="지원 직무를 입력하세요"
                required
              />
              {errors.position && <span className="error-message">{errors.position}</span>}
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="appliedDate">지원일자</label>
              <input
                type="date"
                id="appliedDate"
                name="appliedDate"
                value={formData.appliedDate}
                onChange={handleInputChange}
              />
            </div>

            <div className="form-group">
              <label htmlFor="currentStage">현재 단계</label>
              <select
                id="currentStage"
                name="currentStage"
                value={formData.currentStage}
                onChange={handleInputChange}
              >
                {Object.entries(STAGE_LABELS).map(([stage, label]) => (
                  <option key={stage} value={stage}>
                    {label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="score">평가점수</label>
              <input
                type="number"
                id="score"
                name="score"
                value={formData.score}
                onChange={handleInputChange}
                min="0"
                max="100"
                placeholder="0-100"
              />
            </div>

            <div className="form-group">
              <label htmlFor="comment">코멘트</label>
              <textarea
                id="comment"
                name="comment"
                value={formData.comment}
                onChange={handleInputChange}
                placeholder="지원자에 대한 평가나 메모를 입력하세요"
                rows="3"
              />
            </div>
          </div>

          <div className="form-actions">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={onClose}
              disabled={isSubmitting}
            >
              취소
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={isSubmitting}
            >
              {isSubmitting ? '저장 중...' : (isEditMode ? '수정' : '추가')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CandidateModal;
