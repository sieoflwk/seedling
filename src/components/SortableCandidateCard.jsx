import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

const SortableCandidateCard = ({ candidate, onClick, formatDate, getStageColor }) => {
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
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={`candidate-card ${isDragging ? 'dragging' : ''}`}
      onClick={onClick}
    >
      <div className="candidate-header">
        <h4>{candidate.name}</h4>
        {candidate.score > 0 && (
          <span className="score-badge">{candidate.score}점</span>
        )}
      </div>
      <div className="candidate-info">
        <p className="position">{candidate.position}</p>
        <p className="date">{formatDate(candidate.appliedDate)}</p>
      </div>
      {candidate.comment && (
        <div className="candidate-comment">
          <p>{candidate.comment}</p>
        </div>
      )}
      <div className="drag-handle">
        <span>⋮⋮</span>
      </div>
    </div>
  );
};

export default SortableCandidateCard;
