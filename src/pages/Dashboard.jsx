import React, { useState, useEffect } from 'react';
import { candidateStorage } from '../data/localStorage';
import { CANDIDATE_STAGES, STAGE_LABELS } from '../data/candidateModel';
import { initializeSampleData } from '../utils/sampleData';
import CandidateModal from '../components/CandidateModal';
import CandidateDetailModal from '../components/CandidateDetailModal';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title } from 'chart.js';
import { Doughnut, Bar } from 'react-chartjs-2';
import './Dashboard.css';

// Chart.js 컴포넌트 등록
ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title);

const Dashboard = () => {
  const [statistics, setStatistics] = useState(null);
  const [candidatesByStage, setCandidatesByStage] = useState({});
  const [recentCandidates, setRecentCandidates] = useState([]);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedCandidate, setSelectedCandidate] = useState(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

  useEffect(() => {
    // 샘플 데이터 초기화 (데이터가 없을 경우)
    initializeSampleData();
    loadDashboardData();
  }, []);

  const loadDashboardData = () => {
    // 통계 데이터 로드
    const stats = candidateStorage.getStatistics();
    setStatistics(stats);

    // 단계별 지원자 데이터 로드
    const stageData = {};
    Object.values(CANDIDATE_STAGES).forEach(stage => {
      stageData[stage] = candidateStorage.getCandidatesByStage(stage);
    });
    setCandidatesByStage(stageData);

    // 최근 지원자 데이터 로드 (최근 5명)
    const allCandidates = candidateStorage.getAllCandidates();
    const sortedCandidates = allCandidates
      .sort((a, b) => new Date(b.appliedDate) - new Date(a.appliedDate))
      .slice(0, 5);
    setRecentCandidates(sortedCandidates);
  };

  const handleAddCandidate = (candidate) => {
    // 새 지원자가 추가되면 대시보드 데이터 새로고침
    loadDashboardData();
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
    // 상세 정보가 업데이트되면 대시보드 데이터 새로고침
    loadDashboardData();
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ko-KR', {
      month: 'short',
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

  // 도넛 차트 데이터
  const getDoughnutChartData = () => {
    if (!statistics) return null;

    const labels = Object.values(CANDIDATE_STAGES).map(stage => STAGE_LABELS[stage]);
    const data = Object.values(CANDIDATE_STAGES).map(stage => statistics.byStage[stage] || 0);
    const backgroundColor = Object.values(CANDIDATE_STAGES).map(stage => getStageColor(stage));

    return {
      labels,
      datasets: [
        {
          data,
          backgroundColor,
          borderWidth: 0,
          hoverOffset: 4,
        },
      ],
    };
  };

  // 바 차트 데이터 (월별 지원자 추이)
  const getBarChartData = () => {
    if (!statistics || statistics.total === 0) return null;

    const allCandidates = candidateStorage.getAllCandidates();
    const monthlyData = {};
    
    // 최근 6개월 데이터 수집
    for (let i = 5; i >= 0; i--) {
      const date = new Date();
      date.setMonth(date.getMonth() - i);
      const monthKey = date.toLocaleDateString('ko-KR', { year: 'numeric', month: 'short' });
      monthlyData[monthKey] = 0;
    }

    // 지원자 데이터로 월별 카운트
    allCandidates.forEach(candidate => {
      const candidateDate = new Date(candidate.appliedDate);
      const monthKey = candidateDate.toLocaleDateString('ko-KR', { year: 'numeric', month: 'short' });
      if (monthlyData[monthKey] !== undefined) {
        monthlyData[monthKey]++;
      }
    });

    return {
      labels: Object.keys(monthlyData),
      datasets: [
        {
          label: '지원자 수',
          data: Object.values(monthlyData),
          backgroundColor: 'rgba(59, 130, 246, 0.8)',
          borderColor: 'rgba(59, 130, 246, 1)',
          borderWidth: 2,
          borderRadius: 8,
          borderSkipped: false,
        },
      ],
    };
  };

  // 차트 옵션
  const doughnutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          padding: 20,
          usePointStyle: true,
          font: {
            size: 12,
            family: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
          }
        }
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        titleColor: '#fff',
        bodyColor: '#fff',
        borderColor: 'rgba(255, 255, 255, 0.1)',
        borderWidth: 1,
        cornerRadius: 8,
        displayColors: true,
        callbacks: {
          label: function(context) {
            const total = context.dataset.data.reduce((a, b) => a + b, 0);
            const percentage = ((context.parsed / total) * 100).toFixed(1);
            return `${context.label}: ${context.parsed}명 (${percentage}%)`;
          }
        }
      }
    }
  };

  const barOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        titleColor: '#fff',
        bodyColor: '#fff',
        borderColor: 'rgba(255, 255, 255, 0.1)',
        borderWidth: 1,
        cornerRadius: 8
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: {
          color: 'rgba(0, 0, 0, 0.05)',
          drawBorder: false
        },
        ticks: {
          font: {
            size: 12,
            family: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
          },
          color: '#64748b'
        }
      },
      x: {
        grid: {
          display: false
        },
        ticks: {
          font: {
            size: 12,
            family: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
          },
          color: '#64748b'
        }
      }
    }
  };

  if (!statistics) {
    return (
      <div className="dashboard-loading">
        <div className="loading-spinner"></div>
        <p>데이터를 불러오는 중...</p>
      </div>
    );
  }

  return (
    <div className="dashboard">
      {/* 대시보드 헤더 */}
      <div className="dashboard-header">
        <h1>📊 대시보드</h1>
        <p>지원자 현황과 채용 통계를 한눈에 확인하세요</p>
      </div>

      {/* 통계 카드 섹션 */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon">👥</div>
          <div className="stat-content">
            <h3>전체 지원자</h3>
            <p className="stat-number">{statistics.total}</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">📅</div>
          <div className="stat-content">
            <h3>최근 7일 지원</h3>
            <p className="stat-number">{statistics.recentApplications}</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">⭐</div>
          <div className="stat-content">
            <h3>평균 평가점수</h3>
            <p className="stat-number">{statistics.averageScore}점</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">🎯</div>
          <div className="stat-content">
            <h3>진행률</h3>
            <p className="stat-number">
              {statistics.total > 0 
                ? Math.round((statistics.byStage[CANDIDATE_STAGES.FINAL_PASS] / statistics.total) * 100)
                : 0}%
            </p>
          </div>
        </div>
      </div>

      {/* 차트 섹션 */}
      <div className="charts-section">
        <div className="charts-grid">
          {/* 도넛 차트 - 단계별 현황 */}
          <div className="chart-container">
            <h3>📊 단계별 지원자 현황</h3>
            <div style={{ height: '300px' }}>
              {getDoughnutChartData() && (
                <Doughnut data={getDoughnutChartData()} options={doughnutOptions} />
              )}
            </div>
          </div>

          {/* 바 차트 - 월별 지원자 추이 */}
          <div className="chart-container">
            <h3>📈 월별 지원자 추이</h3>
            <div style={{ height: '300px' }}>
              {getBarChartData() && (
                <Bar data={getBarChartData()} options={barOptions} />
              )}
            </div>
          </div>
        </div>
      </div>

      {/* 단계별 현황 섹션 */}
      <div className="stages-overview">
        <h2>📋 단계별 지원자 현황</h2>
        <div className="stages-grid">
          {Object.values(CANDIDATE_STAGES).map((stage) => (
            <div 
              key={stage} 
              className="stage-card" 
              style={{ '--stage-color': getStageColor(stage) }}
            >
              <div className="stage-header">
                <h3>{STAGE_LABELS[stage]}</h3>
                <span className="stage-count">{candidatesByStage[stage]?.length || 0}</span>
              </div>
              <div className="stage-candidates">
                {candidatesByStage[stage]?.slice(0, 3).map((candidate) => (
                  <div key={candidate.id} className="candidate-preview">
                    <div className="candidate-info">
                      <strong>{candidate.name}</strong>
                      <span>{candidate.position}</span>
                    </div>
                    <div className="candidate-score">
                      {candidate.score > 0 && (
                        <span className="score-badge">{candidate.score}점</span>
                      )}
                    </div>
                  </div>
                ))}
                {candidatesByStage[stage]?.length > 3 && (
                  <div className="more-candidates">
                    +{candidatesByStage[stage].length - 3}명 더보기
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 최근 지원자 섹션 */}
      <div className="recent-candidates">
        <h2>🆕 최근 지원자</h2>
        <div className="candidates-table">
          <table>
            <thead>
              <tr>
                <th>이름</th>
                <th>지원직무</th>
                <th>지원일자</th>
                <th>현재단계</th>
                <th>평가점수</th>
              </tr>
            </thead>
            <tbody>
              {recentCandidates.map((candidate) => (
                <tr 
                  key={candidate.id} 
                  className="candidate-row"
                  onClick={() => handleCandidateClick(candidate)}
                >
                  <td>
                    <div className="candidate-name">
                      <strong>{candidate.name}</strong>
                      <span className="candidate-email">{candidate.email}</span>
                    </div>
                  </td>
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
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* 빠른 액션 섹션 */}
      <div className="quick-actions">
        <h2>⚡ 빠른 액션</h2>
        <div className="actions-grid">
          <button 
            className="action-btn"
            onClick={() => setIsAddModalOpen(true)}
          >
            <span className="action-icon">👤</span>
            <span>새 지원자 추가</span>
          </button>
          <button className="action-btn">
            <span className="action-icon">📅</span>
            <span>면접 일정 등록</span>
          </button>
          <button className="action-btn">
            <span className="action-icon">📊</span>
            <span>상세 리포트 보기</span>
          </button>
          <button className="action-btn">
            <span className="action-icon">📤</span>
            <span>데이터 백업</span>
          </button>
        </div>
      </div>

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

export default Dashboard;
