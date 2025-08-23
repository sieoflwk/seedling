import React, { useState } from 'react';
import { candidateStorage } from '../data/localStorage';
import { validateCandidate } from '../data/candidateModel';
import './AddCandidateModal.css';

const AddCandidateModal = ({ isOpen, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    position: '',
    appliedDate: new Date().toISOString().split('T')[0]
  });
  
  const [errors, setErrors] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // 에러가 있으면 해당 필드 에러 제거
    if (errors.length > 0) {
      setErrors([]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // 폼 검증
    const validation = validateCandidate(formData);
    if (!validation.isValid) {
      setErrors(validation.errors);
      return;
    }

    setIsSubmitting(true);
    
    try {
      const result = candidateStorage.saveCandidate(formData);
      
      if (result.success) {
        // 성공 시 폼 초기화
        setFormData({
          name: '',
          email: '',
          phone: '',
          position: '',
          appliedDate: new Date().toISOString().split('T')[0]
        });
        setErrors([]);
        onSuccess(result.candidate);
        onClose();
      } else {
        setErrors([result.error || '지원자 추가에 실패했습니다.']);
      }
    } catch (error) {
      setErrors(['알 수 없는 오류가 발생했습니다.']);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      setFormData({
        name: '',
        email: '',
        phone: '',
        position: '',
        appliedDate: new Date().toISOString().split('T')[0]
      });
      setErrors([]);
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={handleClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>새 지원자 추가</h2>
          <button 
            className="modal-close" 
            onClick={handleClose}
            disabled={isSubmitting}
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="modal-form">
          {errors.length > 0 && (
            <div className="error-messages">
              {errors.map((error, index) => (
                <div key={index} className="error-message">
                  {error}
                </div>
              ))}
            </div>
          )}

          <div className="form-group">
            <label htmlFor="name">이름 *</label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              placeholder="지원자 이름을 입력하세요"
              required
              disabled={isSubmitting}
            />
          </div>

          <div className="form-group">
            <label htmlFor="email">이메일 *</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              placeholder="example@company.com"
              required
              disabled={isSubmitting}
            />
          </div>

          <div className="form-group">
            <label htmlFor="phone">전화번호</label>
            <input
              type="tel"
              id="phone"
              name="phone"
              value={formData.phone}
              onChange={handleInputChange}
              placeholder="010-1234-5678"
              disabled={isSubmitting}
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
              placeholder="예: 프론트엔드 개발자"
              required
              disabled={isSubmitting}
            />
          </div>

          <div className="form-group">
            <label htmlFor="appliedDate">지원일자</label>
            <input
              type="date"
              id="appliedDate"
              name="appliedDate"
              value={formData.appliedDate}
              onChange={handleInputChange}
              disabled={isSubmitting}
            />
          </div>

          <div className="modal-actions">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={handleClose}
              disabled={isSubmitting}
            >
              취소
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={isSubmitting}
            >
              {isSubmitting ? '추가 중...' : '지원자 추가'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddCandidateModal;
