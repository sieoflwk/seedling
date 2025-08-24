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
import './KanbanBoard.css';

const KanbanBoard = ({ candidates, onUpdateCandidate }) => {
  const [activeId, setActiveId] = useState(null);
  const [candidatesByStage, setCandidatesByStage] = useState({
    '접수': [],
    '서류평가': [],
    '면접': [],
    '최종합격': []
  });

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

  const stages = ['접수', '서류평가', '면접', '최종합격'];

  return (
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
          />
        ))}
      </div>
      
      <DragOverlay>
        {activeId ? (
          <CandidateCardOverlay candidate={getActiveCandidate()} />
        ) : null}
      </DragOverlay>
    </DndContext>
  );
};

const KanbanColumn = ({ stage, candidates }) => {
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

const SortableCandidateCard = ({ candidate }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: candidate.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 1000 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`candidate-card ${isDragging ? 'dragging' : ''}`}
      {...attributes}
      {...listeners} // 카드 전체에 드래그 리스너 적용
    >
      <div className="candidate-header">
        <h4>{candidate.name}</h4>
        {candidate.score > 0 && (
          <span className="score-badge">{candidate.score}점</span>
        )}
      </div>
      
      <div className="candidate-info">
        <p className="position">{candidate.position}</p>
        <p className="date">{new Date(candidate.appliedDate).toLocaleDateString('ko-KR')}</p>
      </div>
    </div>
  );
};

const CandidateCardOverlay = ({ candidate }) => {
  if (!candidate) return null;

  return (
    <div className="candidate-card dragging-overlay">
      <div className="candidate-header">
        <h4>{candidate.name}</h4>
        {candidate.score > 0 && (
          <span className="score-badge">{candidate.score}점</span>
        )}
      </div>
      
      <div className="candidate-info">
        <p className="position">{candidate.position}</p>
        <p className="date">{new Date(candidate.appliedDate).toLocaleDateString('ko-KR')}</p>
      </div>
    </div>
  );
};

export default KanbanBoard;
