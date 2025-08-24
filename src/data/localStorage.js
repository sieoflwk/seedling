import { Candidate, CANDIDATE_STAGES } from './candidateModel.js';
import { initializeSampleData } from '../utils/sampleData.js';

// 로컬스토리지 키 상수
const STORAGE_KEYS = {
  CANDIDATES: 'seedling_candidates',
  SETTINGS: 'seedling_settings'
};

// 지원자 데이터 관리 클래스
export class CandidateStorage {
  constructor() {
    this.initializeStorage();
  }

  // 스토리지 초기화
  initializeStorage() {
    console.log('=== 스토리지 초기화 시작 ===');
    
    if (!localStorage.getItem(STORAGE_KEYS.CANDIDATES)) {
      console.log('캔디데이트 키가 없어서 빈 배열로 초기화');
      localStorage.setItem(STORAGE_KEYS.CANDIDATES, JSON.stringify([]));
    }
    
    // 샘플 데이터가 없으면 초기화
    const existingData = localStorage.getItem(STORAGE_KEYS.CANDIDATES);
    console.log('기존 데이터:', existingData);
    
    if (!existingData || JSON.parse(existingData).length === 0) {
      console.log('샘플 데이터 초기화 중...');
      initializeSampleData();
      
      // 초기화 후 데이터 확인
      const newData = localStorage.getItem(STORAGE_KEYS.CANDIDATES);
      console.log('샘플 데이터 초기화 후:', newData);
      console.log('샘플 데이터 초기화 완료');
    } else {
      console.log('기존 데이터가 있어서 샘플 데이터 초기화 건너뜀');
    }
    
    console.log('=== 스토리지 초기화 완료 ===');
  }

  // 모든 지원자 데이터 가져오기
  getAllCandidates() {
    try {
      console.log('=== getAllCandidates 호출 ===');
      const data = localStorage.getItem(STORAGE_KEYS.CANDIDATES);
      console.log('로컬스토리지에서 가져온 원본 데이터:', data);
      
      const candidates = JSON.parse(data || '[]');
      console.log('파싱된 후보자 데이터:', candidates);
      console.log('후보자 수:', candidates.length);
      
      // 데이터가 비어있으면 샘플 데이터 초기화 시도
      if (candidates.length === 0) {
        console.log('데이터가 비어있어 샘플 데이터를 초기화합니다.');
        initializeSampleData();
        
        const newData = localStorage.getItem(STORAGE_KEYS.CANDIDATES);
        console.log('샘플 데이터 초기화 후 새 데이터:', newData);
        
        const newCandidates = JSON.parse(newData || '[]');
        console.log('샘플 데이터 후보자 수:', newCandidates.length);
        
        const result = newCandidates.map(candidate => new Candidate(candidate));
        console.log('최종 반환할 후보자 객체들:', result);
        return result;
      }
      
      const result = candidates.map(candidate => new Candidate(candidate));
      console.log('기존 데이터에서 반환할 후보자 객체들:', result);
      return result;
    } catch (error) {
      console.error('지원자 데이터 로드 실패:', error);
      return [];
    }
  }

  // 단계별 지원자 데이터 가져오기
  getCandidatesByStage(stage) {
    const allCandidates = this.getAllCandidates();
    return allCandidates.filter(candidate => candidate.currentStage === stage);
  }

  // 특정 지원자 데이터 가져오기
  getCandidateById(id) {
    const allCandidates = this.getAllCandidates();
    return allCandidates.find(candidate => candidate.id === id);
  }

  // 지원자 데이터 저장
  saveCandidate(candidateData) {
    try {
      const candidate = new Candidate(candidateData);
      const allCandidates = this.getAllCandidates();
      
      // 기존 지원자인지 확인
      const existingIndex = allCandidates.findIndex(c => c.id === candidate.id);
      
      if (existingIndex >= 0) {
        // 기존 지원자 업데이트
        allCandidates[existingIndex] = candidate;
      } else {
        // 새 지원자 추가
        allCandidates.push(candidate);
      }
      
      localStorage.setItem(STORAGE_KEYS.CANDIDATES, JSON.stringify(allCandidates));
      return { success: true, candidate };
    } catch (error) {
      console.error('지원자 데이터 저장 실패:', error);
      return { success: false, error: error.message };
    }
  }

  // 지원자 데이터 삭제
  deleteCandidate(id) {
    try {
      const allCandidates = this.getAllCandidates();
      const filteredCandidates = allCandidates.filter(c => c.id !== id);
      
      localStorage.setItem(STORAGE_KEYS.CANDIDATES, JSON.stringify(filteredCandidates));
      return { success: true };
    } catch (error) {
      console.error('지원자 데이터 삭제 실패:', error);
      return { success: false, error: error.message };
    }
  }

  // 지원자 단계 이동
  moveCandidateToStage(id, newStage) {
    try {
      const allCandidates = this.getAllCandidates();
      const candidateIndex = allCandidates.findIndex(c => c.id === id);
      
      if (candidateIndex >= 0) {
        const candidate = allCandidates[candidateIndex];
        if (candidate.moveToStage(newStage)) {
          localStorage.setItem(STORAGE_KEYS.CANDIDATES, JSON.stringify(allCandidates));
          return { success: true, candidate };
        }
      }
      
      return { success: false, error: '지원자를 찾을 수 없거나 단계 이동에 실패했습니다.' };
    } catch (error) {
      console.error('지원자 단계 이동 실패:', error);
      return { success: false, error: error.message };
    }
  }

  // 지원자 정보 업데이트
  updateCandidate(updatedCandidate) {
    try {
      const allCandidates = this.getAllCandidates();
      const candidateIndex = allCandidates.findIndex(c => c.id === updatedCandidate.id);
      
      if (candidateIndex >= 0) {
        // 기존 지원자 정보를 업데이트된 정보로 교체
        allCandidates[candidateIndex] = new Candidate(updatedCandidate);
        localStorage.setItem(STORAGE_KEYS.CANDIDATES, JSON.stringify(allCandidates));
        return { success: true, candidate: allCandidates[candidateIndex] };
      }
      
      return { success: false, error: '업데이트할 지원자를 찾을 수 없습니다.' };
    } catch (error) {
      console.error('지원자 정보 업데이트 실패:', error);
      return { success: false, error: error.message };
    }
  }

  // 지원자 평가 점수 업데이트
  updateCandidateScore(id, score) {
    try {
      const allCandidates = this.getAllCandidates();
      const candidateIndex = allCandidates.findIndex(c => c.id === id);
      
      if (candidateIndex >= 0) {
        const candidate = allCandidates[candidateIndex];
        candidate.setScore(score);
        localStorage.setItem(STORAGE_KEYS.CANDIDATES, JSON.stringify(allCandidates));
        return { success: true, candidate };
      }
      
      return { success: false, error: '지원자를 찾을 수 없습니다.' };
    } catch (error) {
      console.error('지원자 점수 업데이트 실패:', error);
      return { success: false, error: error.message };
    }
  }

  // 지원자 코멘트 업데이트
  updateCandidateComment(id, comment) {
    try {
      const allCandidates = this.getAllCandidates();
      const candidateIndex = allCandidates.findIndex(c => c.id === id);
      
      if (candidateIndex >= 0) {
        const candidate = allCandidates[candidateIndex];
        candidate.addComment(comment);
        localStorage.setItem(STORAGE_KEYS.CANDIDATES, JSON.stringify(allCandidates));
        return { success: true, candidate };
      }
      
      return { success: false, error: '지원자를 찾을 수 없습니다.' };
    } catch (error) {
      console.error('지원자 코멘트 업데이트 실패:', error);
      return { success: false, error: error.message };
    }
  }

  // 데이터 백업 (JSON 형태로 내보내기)
  exportData() {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.CANDIDATES);
      const blob = new Blob([data], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      
      const a = document.createElement('a');
      a.href = url;
      a.download = `seedling_candidates_${new Date().toISOString().split('T')[0]}.json`;
      a.click();
      
      URL.revokeObjectURL(url);
      return { success: true };
    } catch (error) {
      console.error('데이터 내보내기 실패:', error);
      return { success: false, error: error.message };
    }
  }

  // 데이터 복원 (JSON 파일에서 가져오기)
  importData(jsonData) {
    try {
      const candidates = JSON.parse(jsonData);
      
      if (!Array.isArray(candidates)) {
        throw new Error('올바른 데이터 형식이 아닙니다.');
      }
      
      // 데이터 검증
      const validCandidates = candidates.filter(candidate => {
        return candidate.id && candidate.name && candidate.email;
      });
      
      localStorage.setItem(STORAGE_KEYS.CANDIDATES, JSON.stringify(validCandidates));
      return { success: true, count: validCandidates.length };
    } catch (error) {
      console.error('데이터 가져오기 실패:', error);
      return { success: false, error: error.message };
    }
  }

  // 스토리지 초기화 (모든 데이터 삭제)
  clearAllData() {
    try {
      localStorage.removeItem(STORAGE_KEYS.CANDIDATES);
      this.initializeStorage();
      return { success: true };
    } catch (error) {
      console.error('데이터 초기화 실패:', error);
      return { success: false, error: error.message };
    }
  }

  // 통계 데이터 가져오기
  getStatistics() {
    try {
      const allCandidates = this.getAllCandidates();
      const stats = {
        total: allCandidates.length,
        byStage: {},
        averageScore: 0,
        recentApplications: 0
      };

      // 단계별 통계
      Object.values(CANDIDATE_STAGES).forEach(stage => {
        stats.byStage[stage] = allCandidates.filter(c => c.currentStage === stage).length;
      });

      // 평균 점수
      const candidatesWithScore = allCandidates.filter(c => c.score > 0);
      if (candidatesWithScore.length > 0) {
        stats.averageScore = Math.round(
          candidatesWithScore.reduce((sum, c) => sum + c.score, 0) / candidatesWithScore.length
        );
      }

      // 최근 지원자 수 (7일 내)
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      stats.recentApplications = allCandidates.filter(c => 
        new Date(c.appliedDate) >= weekAgo
      ).length;

      return stats;
    } catch (error) {
      console.error('통계 데이터 로드 실패:', error);
      return null;
    }
  }
}

// 기본 스토리지 인스턴스 생성
export const candidateStorage = new CandidateStorage();

// Candidates.jsx에서 사용할 수 있는 간단한 함수들
export const loadCandidates = async () => {
  return candidateStorage.getAllCandidates();
};

export const loadStatistics = async () => {
  const stats = candidateStorage.getStatistics();
  if (!stats) return {};
  
  return {
    total: stats.total || 0,
    applied: stats.byStage?.applied || 0,
    document_review: stats.byStage?.document_review || 0,
    interview: stats.byStage?.interview || 0,
    final_pass: stats.byStage?.final_pass || 0
  };
};
