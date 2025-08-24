import React, { useState, useEffect } from 'react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragOverlay,
} from '@dnd-kit/core';
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { candidateStorage } from '../data/localStorage';
import { CANDIDATE_STAGES, STAGE_LABELS } from '../data/candidateModel';
import SortableCandidateCard from './SortableCandidateCard';
import './KanbanBoard.css';

const KanbanBoard = ({ onCandidateClick, onDataUpdate }) => {
  const [candidatesByStage, setCandidatesByStage] = useState({});
  const [activeId, setActiveId] = useState(null);
  const [activeCandidate, setActiveCandidate] = useState(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  useEffect(() => {
    loadCandidates();
  }, []);

  const loadCandidates = () => {
    const stageData = {};
    Object.values(CANDIDATE_STAGES).forEach(stage => {
      stageData[stage] = candidateStorage.getCandidatesByStage(stage);
    });
    setCandidatesByStage(stageData);
  };

  const handleDragStart = (event) => {
    const { active } = event;
    setActiveId(active.id);
    
    // 드래그 중인 지원자 정보 찾기
    const candidate = findCandidateById(active.id);
    setActiveCandidate(candidate);
  };

  const handleDragEnd = (event) => {
    const { active, over } = event;
    setActiveId(null);
    setActiveCandidate(null);

    if (!over) return;

    const activeId = active.id;
    const overId = over.id;

    if (activeId === overId) return;

    // 지원자를 다른 단계로 이동
    if (overId.startsWith('stage-')) {
      const targetStage = overId.replace('stage-', '');
      const candidate = findCandidateById(activeId);
      
      if (candidate && candidate.currentStage !== targetStage) {
        const result = candidateStorage.moveCandidateToStage(activeId, targetStage);
        if (result.success) {
          loadCandidates();
          if (onDataUpdate) {
            onDataUpdate();
          }
        }
      }
    }
  };

  const handleDragOver = (event) => {
    const { active, over } = event;
    
    if (!over) return;

    const overId = over.id;
    
    // 드롭 영역에 시각적 피드백 제공
    if (overId.startsWith('stage-')) {
      const targetStage = overId.replace('stage-', '');
      // 여기서 드롭 영역의 스타일을 변경할 수 있습니다
    }
  };

  const findCandidateById = (id) => {
    for (const stage of Object.values(CANDIDATE_STAGES)) {
      const candidate = candidatesByStage[stage]?.find(c => c.id === id);
      if (candidate) return candidate;
    }
    return null;
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

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ko-KR', {
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div className="kanban-board">
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDragEnd={handleDragEnd}
      >
        {Object.values(CANDIDATE_STAGES).map((stage) => (
          <div key={stage} className="kanban-column">
            <div className="column-header" style={{ borderTopColor: getStageColor(stage) }}>
              <h3>{STAGE_LABELS[stage]}</h3>
              <span className="candidate-count">
                {candidatesByStage[stage]?.length || 0}
              </span>
            </div>
            
            <div className="column-content">
              <SortableContext
                items={candidatesByStage[stage]?.map(c => c.id) || []}
                strategy={verticalListSortingStrategy}
              >
                {candidatesByStage[stage]?.map((candidate) => (
                  <SortableCandidateCard
                    key={candidate.id}
                    candidate={candidate}
                    onClick={() => onCandidateClick(candidate)}
                    formatDate={formatDate}
                    getStageColor={getStageColor}
                  />
                ))}
              </SortableContext>
              
              {(!candidatesByStage[stage] || candidatesByStage[stage].length === 0) && (
                <div className="empty-column">
                  <p>지원자가 없습니다</p>
                  <small>새 지원자를 추가하거나 다른 단계에서 이동하세요</small>
                </div>
              )}
            </div>
            
            {/* 드롭 영역 */}
            <div 
              className="drop-zone"
              data-stage={stage}
              id={`stage-${stage}`}
            />
          </div>
        ))}

        {/* 드래그 오버레이 */}
        <DragOverlay>
          {activeCandidate ? (
            <div className="candidate-card dragging-overlay">
              <div className="candidate-header">
                <h4>{activeCandidate.name}</h4>
                {activeCandidate.score > 0 && (
                  <span className="score-badge">{activeCandidate.score}점</span>
                )}
              </div>
              <div className="candidate-info">
                <p className="position">{activeCandidate.position}</p>
                <p className="date">{formatDate(activeCandidate.appliedDate)}</p>
              </div>
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>
    </div>
  );
};

export default KanbanBoard;
