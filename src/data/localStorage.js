import { Candidate, CANDIDATE_STAGES } from './candidateModel.js';

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
    if (!localStorage.getItem(STORAGE_KEYS.CANDIDATES)) {
      localStorage.setItem(STORAGE_KEYS.CANDIDATES, JSON.stringify([]));
    }
  }

  // 모든 지원자 데이터 가져오기
  getAllCandidates() {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.CANDIDATES);
      const candidates = JSON.parse(data || '[]');
      return candidates.map(candidate => new Candidate(candidate));
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
