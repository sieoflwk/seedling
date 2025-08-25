import React, { useState } from 'react';
import {
  DndContext,
  DragOverlay,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { CANDIDATE_STAGES, STAGE_LABELS } from '../data/candidateModel';
import CandidateDetailModal from './CandidateDetailModal';
import './KanbanBoard.css';

const KanbanBoard = ({ candidates, onUpdateCandidate }) => {
  const [activeId, setActiveId] = useState(null);
  const [candidatesByStage, setCandidatesByStage] = useState({
    '접수': [],
    '서류평가': [],
    '면접': [],
    '최종합격': []
  });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCandidate, setSelectedCandidate] = useState(null);

  // 면접 예정일이 다가오는지 확인하는 함수
  const isInterviewUpcoming = (candidate) => {
    if (!candidate.interviewSchedule?.date) return false;
    
    const interviewDate = new Date(candidate.interviewSchedule.date);
    const today = new Date();
    const diffTime = interviewDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    return diffDays >= 0 && diffDays <= 3;
  };

  // 날짜 포맷팅 함수
  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('ko-KR');
  };

  // candidates가 변경될 때마다 candidatesByStage 업데이트
  React.useEffect(() => {
    if (candidates && candidates.length > 0) {
      const stages = {
        '접수': [],
        '서류평가': [],
        '면접': [],
        '최종합격': []
      };

      candidates.forEach(candidate => {
        const stage = STAGE_LABELS[candidate.currentStage] || candidate.currentStage;
        if (stages[stage]) {
          const candidateWithStage = { ...candidate, stage: stage };
          stages[stage].push(candidateWithStage);
        }
      });

      setCandidatesByStage(stages);
    }
  }, [candidates]);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5, // 드래그 시작 거리를 줄여서 더 민감하게
      },
    }),
    useSensor(KeyboardSensor)
  );

  const handleDragStart = (event) => {
    setActiveId(event.active.id);
  };

  const handleDragOver = (event) => {
    const { active, over } = event;
    
    if (!over) return;

    const activeId = active.id;
    const overId = over.id;
    
    if (activeId === overId) return;

    // 컬럼 간 이동인지 확인
    const isOverColumn = over.data.current?.type === 'column';
    if (isOverColumn) {
      const activeStage = findStageByCandidateId(activeId);
      const targetStage = overId;
      
      if (activeStage !== targetStage) {
        setCandidatesByStage(prev => {
          const newState = { ...prev };
          
          // 이전 단계에서 제거
          newState[activeStage] = newState[activeStage].filter(
            candidate => candidate.id !== activeId
          );
          
          // 새 단계에 추가
          const candidate = candidates.find(c => c.id === activeId);
          if (candidate) {
            const candidateWithStage = { ...candidate, stage: targetStage };
            newState[targetStage].push(candidateWithStage);
          }
          
          return newState;
        });
      }
    }
  };

  const handleDragEnd = (event) => {
    const { active, over } = event;
    
    if (!over) {
      // 드롭 영역이 없으면 원래 위치로 복귀
      setCandidatesByStage(prev => {
        // 원래 데이터로 재설정
        const stages = {
          '접수': [],
          '서류평가': [],
          '면접': [],
          '최종합격': []
        };

        candidates.forEach(candidate => {
          const stage = STAGE_LABELS[candidate.currentStage] || candidate.currentStage;
          if (stages[stage]) {
            const candidateWithStage = { ...candidate, stage: stage };
            stages[stage].push(candidateWithStage);
          }
        });

        return stages;
      });
      setActiveId(null);
      return;
    }

    const activeId = active.id;
    const overId = over.id;
    
    if (activeId === overId) {
      setActiveId(null);
      return;
    }

    // 컬럼 간 이동 처리
    const isOverColumn = over.data.current?.type === 'column';
    if (isOverColumn) {
      const activeStage = findStageByCandidateId(activeId);
      const targetStage = overId;
      
      if (activeStage !== targetStage) {
        // 지원자 데이터 업데이트
        const candidate = candidates.find(c => c.id === activeId);
        if (candidate) {
          const stageKey = Object.keys(STAGE_LABELS).find(key => STAGE_LABELS[key] === targetStage);
          const updatedCandidate = { ...candidate, currentStage: stageKey };
          onUpdateCandidate(updatedCandidate);
        }
      }
    }

    setActiveId(null);
  };

  const findStageByCandidateId = (candidateId) => {
    for (const [stage, stageCandidates] of Object.entries(candidatesByStage)) {
      if (stageCandidates.find(c => c.id === candidateId)) {
        return stage;
      }
    }
    return null;
  };

  const getActiveCandidate = () => {
    if (!activeId) return null;
    
    for (const stageCandidates of Object.values(candidatesByStage)) {
      const candidate = stageCandidates.find(c => c.id === activeId);
      if (candidate) return candidate;
    }
    return null;
  };

  const handleCardClick = (candidate) => {
    setSelectedCandidate(candidate);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedCandidate(null);
  };

  const handleUpdateCandidate = (updatedCandidate) => {
    onUpdateCandidate(updatedCandidate);
    setIsModalOpen(false);
    setSelectedCandidate(null);
  };

  const handleDeleteCandidate = (candidateId) => {
    onUpdateCandidate({ id: candidateId, isDeleted: true });
    setIsModalOpen(false);
    setSelectedCandidate(null);
  };

  const stages = ['접수', '서류평가', '면접', '최종합격'];

  return (
    <>
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDragEnd={handleDragEnd}
      >
        <div className="kanban-board">
          {stages.map((stage) => (
            <KanbanColumn
              key={stage}
              stage={stage}
              candidates={candidatesByStage[stage] || []}
              onCardClick={handleCardClick}
              isInterviewUpcoming={isInterviewUpcoming}
              formatDate={formatDate}
            />
          ))}
        </div>
        
        <DragOverlay>
          {activeId ? (
            <CandidateCardOverlay 
              candidate={getActiveCandidate()} 
              isInterviewUpcoming={isInterviewUpcoming}
              formatDate={formatDate}
            />
          ) : null}
        </DragOverlay>
      </DndContext>

      {/* 지원자 상세 정보 모달 */}
      <CandidateDetailModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        candidate={selectedCandidate}
        onUpdate={handleUpdateCandidate}
        onDelete={handleDeleteCandidate}
      />
    </>
  );
};

const KanbanColumn = ({ stage, candidates, onCardClick, isInterviewUpcoming, formatDate }) => {
  const { setNodeRef } = useSortable({
    id: stage,
    data: {
      type: 'column',
      stage,
    },
  });

  return (
    <div className="kanban-column" ref={setNodeRef}>
      <div className="column-header">
        <h3>{stage}</h3>
        <span className="candidate-count">{candidates.length}명</span>
      </div>
      <div className="column-content">
        <SortableContext
          items={candidates.map(c => c.id)}
          strategy={verticalListSortingStrategy}
        >
          {candidates.map((candidate) => (
            <SortableCandidateCard
              key={candidate.id}
              candidate={candidate}
              onCardClick={onCardClick}
              isInterviewUpcoming={isInterviewUpcoming}
              formatDate={formatDate}
            />
          ))}
        </SortableContext>
        
        {candidates.length === 0 && (
          <div className="empty-column">
            <p>지원자가 없습니다</p>
          </div>
        )}
      </div>
    </div>
  );
};

const SortableCandidateCard = ({ candidate, onCardClick, isInterviewUpcoming, formatDate }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({ id: candidate.id });

  const [isClickable, setIsClickable] = useState(true);
  const [mouseDownTime, setMouseDownTime] = useState(0);
  const [mouseDownPosition, setMouseDownPosition] = useState({ x: 0, y: 0 });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 1000 : 1,
  };

  const handleMouseDown = (e) => {
    setMouseDownTime(Date.now());
    setMouseDownPosition({ x: e.clientX, y: e.clientY });
    setIsClickable(true);
  };

  const handleMouseMove = (e) => {
    if (mouseDownTime > 0) {
      const distance = Math.sqrt(
        Math.pow(e.clientX - mouseDownPosition.x, 2) + 
        Math.pow(e.clientY - mouseDownPosition.y, 2)
      );
      
      // 5px 이상 움직이면 드래그로 간주
      if (distance > 5) {
        setIsClickable(false);
      }
    }
  };

  const handleMouseUp = (e) => {
    if (isClickable && mouseDownTime > 0) {
      const clickDuration = Date.now() - mouseDownTime;
      
      // 300ms 이내의 짧은 클릭만 처리
      if (clickDuration < 300) {
        onCardClick(candidate);
      }
    }
    
    setMouseDownTime(0);
    setMouseDownPosition({ x: 0, y: 0 });
  };

  return (
    <div 
      className={`candidate-card ${isDragging ? 'dragging' : ''} ${isClickable ? 'clickable' : ''} ${isInterviewUpcoming(candidate) ? 'interview-upcoming' : ''}`}
      {...attributes} 
      ref={setNodeRef}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
    >
      <div className="candidate-header">
        <h4>{candidate.name}</h4>
        {candidate.interviewSchedule?.date && (
          <span className="interview-icon" title="면접 일정 등록됨">
            🕐
          </span>
        )}
      </div>
      <div className="candidate-info">
        <p className="position">{candidate.position}</p>
        <p className="date">{formatDate(candidate.appliedDate)}</p>
        {candidate.score > 0 && (
          <span className="score-badge">{candidate.score}점</span>
        )}
      </div>
    </div>
  );
};

const CandidateCardOverlay = ({ candidate, isInterviewUpcoming, formatDate }) => {
  if (!candidate) return null;

  return (
    <div className={`candidate-card dragging-overlay ${isInterviewUpcoming(candidate) ? 'interview-upcoming' : ''}`}>
      <div className="candidate-header">
        <h4>{candidate.name}</h4>
        {candidate.interviewSchedule?.date && (
          <span className="interview-icon" title="면접 일정 등록됨">
            🕐
          </span>
        )}
      </div>
      <div className="candidate-info">
        <p className="position">{candidate.position}</p>
        <p className="date">{formatDate(candidate.appliedDate)}</p>
        {candidate.score > 0 && (
          <span className="score-badge">{candidate.score}점</span>
        )}
      </div>
    </div>
  );
};

export default KanbanBoard;
