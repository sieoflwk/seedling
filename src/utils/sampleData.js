import { Candidate, CANDIDATE_STAGES } from '../data/candidateModel';

// 샘플 지원자 데이터 생성
export const generateSampleCandidates = () => {
  const sampleData = [
    // 접수 단계
    {
      name: '김민수',
      email: 'kim.minsu@email.com',
      phone: '010-1234-5678',
      position: '프론트엔드 개발자',
      appliedDate: new Date(2025, 0, 15).toISOString(),
      currentStage: CANDIDATE_STAGES.APPLIED,
      score: 0,
      comment: 'React 경험이 풍부하고 포트폴리오가 인상적입니다.'
    },
    {
      name: '정현우',
      email: 'jung.hyunwoo@email.com',
      phone: '010-5678-9012',
      position: '데이터 엔지니어',
      appliedDate: new Date(2025, 0, 25).toISOString(),
      currentStage: CANDIDATE_STAGES.APPLIED,
      score: 0,
      comment: '빅데이터 처리와 머신러닝 파이프라인 구축 경험이 있습니다.'
    },
    {
      name: '강동훈',
      email: 'kang.donghun@email.com',
      phone: '010-9012-3456',
      position: '안드로이드 개발자',
      appliedDate: new Date(2025, 1, 5).toISOString(),
      currentStage: CANDIDATE_STAGES.APPLIED,
      score: 0,
      comment: 'Kotlin과 Jetpack Compose 경험이 있으며, 앱 성능 최적화에 능숙합니다.'
    },
    {
      name: '이준영',
      email: 'lee.joonyoung@email.com',
      phone: '010-1111-2222',
      position: 'iOS 개발자',
      appliedDate: new Date(2025, 1, 10).toISOString(),
      currentStage: CANDIDATE_STAGES.APPLIED,
      score: 0,
      comment: 'SwiftUI와 Combine 프레임워크 경험이 풍부합니다.'
    },
    {
      name: '박소연',
      email: 'park.soyeon@email.com',
      phone: '010-3333-4444',
      position: 'UX 디자이너',
      appliedDate: new Date(2025, 1, 12).toISOString(),
      currentStage: CANDIDATE_STAGES.APPLIED,
      score: 0,
      comment: '사용자 리서치와 프로토타이핑에 능숙합니다.'
    },

    // 서류평가 단계
    {
      name: '이지은',
      email: 'lee.jieun@email.com',
      phone: '010-2345-6789',
      position: '백엔드 개발자',
      appliedDate: new Date(2025, 0, 18).toISOString(),
      currentStage: CANDIDATE_STAGES.DOCUMENT_REVIEW,
      score: 85,
      comment: 'Node.js와 Python 경험이 풍부하며, 시스템 설계 능력이 우수합니다.'
    },
    {
      name: '한소영',
      email: 'han.soyoung@email.com',
      phone: '010-6789-0123',
      position: '프론트엔드 개발자',
      appliedDate: new Date(2025, 0, 28).toISOString(),
      currentStage: CANDIDATE_STAGES.DOCUMENT_REVIEW,
      score: 78,
      comment: 'Vue.js와 TypeScript 경험이 있으며, 컴포넌트 설계 능력이 좋습니다.'
    },
    {
      name: '송미라',
      email: 'song.mira@email.com',
      phone: '010-0123-4567',
      position: 'QA 엔지니어',
      appliedDate: new Date(2025, 1, 8).toISOString(),
      currentStage: CANDIDATE_STAGES.DOCUMENT_REVIEW,
      score: 82,
      comment: '자동화 테스트와 CI/CD 파이프라인 구축 경험이 있습니다.'
    },
    {
      name: '최준호',
      email: 'choi.junho@email.com',
      phone: '010-5555-6666',
      position: 'DevOps 엔지니어',
      appliedDate: new Date(2025, 1, 14).toISOString(),
      currentStage: CANDIDATE_STAGES.DOCUMENT_REVIEW,
      score: 88,
      comment: 'AWS와 Terraform 경험이 풍부하며, 인프라 자동화에 능숙합니다.'
    },
    {
      name: '김수진',
      email: 'kim.sujin@email.com',
      phone: '010-7777-8888',
      position: '프로덕트 매니저',
      appliedDate: new Date(2025, 1, 16).toISOString(),
      currentStage: CANDIDATE_STAGES.DOCUMENT_REVIEW,
      score: 75,
      comment: '애자일 방법론과 사용자 중심 설계에 대한 이해가 깊습니다.'
    },

    // 면접 단계
    {
      name: '박준호',
      email: 'park.junho@email.com',
      phone: '010-3456-7890',
      position: 'DevOps 엔지니어',
      appliedDate: new Date(2025, 0, 20).toISOString(),
      currentStage: CANDIDATE_STAGES.INTERVIEW,
      score: 92,
      comment: 'AWS, Docker, Kubernetes 경험이 풍부하고 인프라 자동화에 능숙합니다.'
    },
    {
      name: '윤도현',
      email: 'yoon.dohyun@email.com',
      phone: '010-7890-1234',
      position: '백엔드 개발자',
      appliedDate: new Date(2025, 1, 1).toISOString(),
      currentStage: CANDIDATE_STAGES.INTERVIEW,
      score: 88,
      comment: 'Java Spring과 마이크로서비스 아키텍처 경험이 풍부합니다.'
    },
    {
      name: '이민지',
      email: 'lee.minji@email.com',
      phone: '010-9999-0000',
      position: '프론트엔드 개발자',
      appliedDate: new Date(2025, 1, 18).toISOString(),
      currentStage: CANDIDATE_STAGES.INTERVIEW,
      score: 90,
      comment: 'Next.js와 React Native 경험이 있으며, 성능 최적화에 능숙합니다.'
    },
    {
      name: '정태현',
      email: 'jung.taehyeon@email.com',
      phone: '010-1111-3333',
      position: '백엔드 개발자',
      appliedDate: new Date(2025, 1, 20).toISOString(),
      currentStage: CANDIDATE_STAGES.INTERVIEW,
      score: 85,
      comment: 'Go와 Rust 언어에 능숙하며, 고성능 시스템 개발 경험이 있습니다.'
    },

    // 최종합격 단계
    {
      name: '최수진',
      email: 'choi.sujin@email.com',
      phone: '010-4567-8901',
      position: 'UI/UX 디자이너',
      appliedDate: new Date(2025, 0, 22).toISOString(),
      currentStage: CANDIDATE_STAGES.FINAL_PASS,
      score: 95,
      comment: '사용자 중심의 디자인 사고와 프로토타이핑 능력이 뛰어납니다.'
    },
    {
      name: '임서연',
      email: 'lim.seoyeon@email.com',
      phone: '010-8901-2345',
      position: '프로덕트 매니저',
      appliedDate: new Date(2025, 1, 3).toISOString(),
      currentStage: CANDIDATE_STAGES.FINAL_PASS,
      score: 90,
      comment: '사용자 리서치와 데이터 기반 의사결정 능력이 뛰어납니다.'
    },
    {
      name: '박지훈',
      email: 'park.jihun@email.com',
      phone: '010-2222-4444',
      position: '풀스택 개발자',
      appliedDate: new Date(2025, 1, 22).toISOString(),
      currentStage: CANDIDATE_STAGES.FINAL_PASS,
      score: 93,
      comment: 'React, Node.js, PostgreSQL을 활용한 풀스택 개발 경험이 풍부합니다.'
    }
  ];

  return sampleData.map(data => new Candidate(data));
};

// 샘플 데이터를 로컬스토리지에 저장
export const initializeSampleData = () => {
  const existingData = localStorage.getItem('seedling_candidates');
  
  if (!existingData || JSON.parse(existingData).length === 0) {
    const sampleCandidates = generateSampleCandidates();
    localStorage.setItem('seedling_candidates', JSON.stringify(sampleCandidates));
    console.log('샘플 데이터가 초기화되었습니다.');
    return true;
  }
  
  return false;
};

// 샘플 데이터 초기화 여부 확인
export const hasSampleData = () => {
  const existingData = localStorage.getItem('seedling_candidates');
  return existingData && JSON.parse(existingData).length > 0;
};
