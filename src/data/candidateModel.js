// 지원자 여정 단계 상수
export const CANDIDATE_STAGES = {
  APPLIED: 'applied',
  DOCUMENT_REVIEW: 'document_review',
  INTERVIEW: 'interview',
  FINAL_PASS: 'final_pass'
};

// 지원자 여정 단계별 한글명
export const STAGE_LABELS = {
  [CANDIDATE_STAGES.APPLIED]: '접수',
  [CANDIDATE_STAGES.DOCUMENT_REVIEW]: '서류평가',
  [CANDIDATE_STAGES.INTERVIEW]: '면접',
  [CANDIDATE_STAGES.FINAL_PASS]: '최종합격'
};

// 지원자 데이터 모델
export class Candidate {
  constructor(data = {}) {
    this.id = data.id || this.generateId();
    this.name = data.name || '';
    this.email = data.email || '';
    this.phone = data.phone || '';
    this.position = data.position || '';
    this.appliedDate = data.appliedDate || new Date().toISOString();
    this.currentStage = data.currentStage || CANDIDATE_STAGES.APPLIED;
    this.score = data.score || 0;
    this.comment = data.comment || '';
    this.createdAt = data.createdAt || new Date().toISOString();
    this.updatedAt = data.updatedAt || new Date().toISOString();
  }

  // 고유 ID 생성
  generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }

  // 지원자 정보 업데이트
  update(data) {
    Object.assign(this, data);
    this.updatedAt = new Date().toISOString();
    return this;
  }

  // 단계 이동
  moveToStage(newStage) {
    if (Object.values(CANDIDATE_STAGES).includes(newStage)) {
      this.currentStage = newStage;
      this.updatedAt = new Date().toISOString();
      return true;
    }
    return false;
  }

  // 평가 점수 설정
  setScore(score) {
    this.score = Math.max(0, Math.min(100, score));
    this.updatedAt = new Date().toISOString();
    return this;
  }

  // 코멘트 추가
  addComment(comment) {
    this.comment = comment;
    this.updatedAt = new Date().toISOString();
    return this;
  }

  // 지원자 데이터를 일반 객체로 변환
  toJSON() {
    return {
      id: this.id,
      name: this.name,
      email: this.email,
      phone: this.phone,
      position: this.position,
      appliedDate: this.appliedDate,
      currentStage: this.currentStage,
      score: this.score,
      comment: this.comment,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt
    };
  }
}

// 지원자 데이터 검증 함수
export const validateCandidate = (data) => {
  const errors = [];
  
  if (!data.name || data.name.trim() === '') {
    errors.push('이름은 필수입니다.');
  }
  
  if (!data.email || data.email.trim() === '') {
    errors.push('이메일은 필수입니다.');
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
    errors.push('올바른 이메일 형식이 아닙니다.');
  }
  
  if (!data.position || data.position.trim() === '') {
    errors.push('지원직무는 필수입니다.');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};
