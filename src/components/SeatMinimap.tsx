import { memo, useCallback } from 'react';

import { reasonForLocation } from '../config/reasons';
import { MovementMap, Student } from '../types';

interface SeatMinimapProps {
  students: Student[];
  movementMap: MovementMap;
  dragHakbun: string | null;
  isDropHover: boolean;
  onDragStart: (event: React.DragEvent<HTMLElement>, hakbun: string) => void;
  onDragEnd: () => void;
  onDragOver: () => void;
  onDragLeave: () => void;
  onDrop: (event: React.DragEvent<HTMLElement>) => void;
  onSelectStudent: (student: Student) => void;
}

type SeatState = 'present' | 'away' | 'absent';

function seatState(location: string | undefined): SeatState {
  if (!location) return 'present';
  return reasonForLocation(location).isAbsent ? 'absent' : 'away';
}

export const SeatMinimap = memo(function SeatMinimap({
  students,
  movementMap,
  dragHakbun,
  isDropHover,
  onDragStart,
  onDragEnd,
  onDragOver,
  onDragLeave,
  onDrop,
  onSelectStudent
}: SeatMinimapProps) {
  const isDragging = Boolean(dragHakbun);

  const handleDragOver = useCallback(
    (event: React.DragEvent<HTMLElement>) => {
      if (!isDragging) return;
      event.preventDefault();
      onDragOver();
    },
    [isDragging, onDragOver]
  );

  return (
    <section
      className={`va-mini${isDropHover ? ' is-drop' : ''}`}
      aria-labelledby="seat-mini-title"
      onDragOver={handleDragOver}
      onDragLeave={onDragLeave}
      onDrop={onDrop}
    >
      <div className="va-mini__head">
        <h3 className="va-mini__title" id="seat-mini-title">
          좌석 미니맵
        </h3>
        <span className="va-mini__legend">
          <span className="va-mini__legend-item">
            <i className="va-mini__chip va-mini__chip--present" />
            재실
          </span>
          <span className="va-mini__legend-item">
            <i className="va-mini__chip va-mini__chip--away" />
            이동
          </span>
          <span className="va-mini__legend-item">
            <i className="va-mini__chip va-mini__chip--absent" />
            결석
          </span>
        </span>
      </div>
      <div className="va-mini__grid">
        {students.map((student) => {
          const movement = movementMap[student.hakbun];
          const state = seatState(movement?.location);
          const detail = movement?.location;
          return (
            <Seat
              key={student.hakbun}
              student={student}
              state={state}
              detail={detail}
              isDragging={dragHakbun === student.hakbun}
              onDragStart={onDragStart}
              onDragEnd={onDragEnd}
              onSelect={onSelectStudent}
            />
          );
        })}
      </div>
    </section>
  );
});

interface SeatProps {
  student: Student;
  state: SeatState;
  detail: string | undefined;
  isDragging: boolean;
  onDragStart: (event: React.DragEvent<HTMLElement>, hakbun: string) => void;
  onDragEnd: () => void;
  onSelect: (student: Student) => void;
}

const Seat = memo(function Seat({ student, state, detail, isDragging, onDragStart, onDragEnd, onSelect }: SeatProps) {
  const handleDragStart = useCallback(
    (event: React.DragEvent<HTMLElement>) => onDragStart(event, student.hakbun),
    [onDragStart, student.hakbun]
  );
  const handleClick = useCallback(() => onSelect(student), [onSelect, student]);
  const handleKeyDown = useCallback(
    (event: React.KeyboardEvent<HTMLDivElement>) => {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        onSelect(student);
      }
    },
    [onSelect, student]
  );

  return (
    <div
      className={`va-seat va-seat--${state}${isDragging ? ' is-dragging' : ''}`}
      title={`${student.hakbun} ${student.name}${detail ? ` · ${detail}` : ''}`}
      draggable
      onDragStart={handleDragStart}
      onDragEnd={onDragEnd}
      onClick={handleClick}
      role="button"
      tabIndex={0}
      onKeyDown={handleKeyDown}
    >
      <span className="va-seat__hakbun">{student.hakbun}</span>
      <span className="va-seat__name">{student.name}</span>
    </div>
  );
});
