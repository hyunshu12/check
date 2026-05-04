import { memo, useCallback } from 'react';

import returnIconSrc from '../assets/return-icon.svg';
import { AppBannerConfig, MovementMap, Student } from '../types';

interface SeatGridProps {
  students: Student[];
  movementMap: MovementMap;
  total: number;
  present: number;
  moved: number;
  quote: AppBannerConfig;
  onSelect: (student: Student) => void;
  onReturn: (student: Student) => void;
}

interface StudentCardProps {
  student: Student;
  isMoved: boolean;
  statusLabel: string;
  onSelect: (student: Student) => void;
  onReturn: (student: Student) => void;
}

const StudentCard = memo(function StudentCard({
  student,
  isMoved,
  statusLabel,
  onSelect,
  onReturn
}: StudentCardProps) {
  const handleOpen = useCallback(() => {
    onSelect(student);
  }, [onSelect, student]);

  const handleKeyDown = useCallback(
    (event: React.KeyboardEvent<HTMLDivElement>) => {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        onSelect(student);
      }
    },
    [onSelect, student]
  );

  const handleReturnClick = useCallback(
    (event: React.MouseEvent<HTMLButtonElement>) => {
      event.stopPropagation();
      onReturn(student);
    },
    [onReturn, student]
  );

  return (
    <article
      className={`student-card${isMoved ? ' is-moved' : ''}`}
      data-hakbun={student.hakbun}
      role="listitem"
    >
      <div
        className="student-card__main"
        role="button"
        tabIndex={0}
        onClick={handleOpen}
        onKeyDown={handleKeyDown}
        aria-label={`${student.name} 이동 위치 선택`}
      >
        <div className="student-card__copy">
          <span className="student-card__id">{student.hakbun}</span>
          <div className="student-card__identity">
            <strong className="student-card__name">{student.name}</strong>
            <span className="student-card__location">{statusLabel}</span>
          </div>
        </div>
      </div>

      {isMoved ? (
        <button
          type="button"
          className="student-card__return"
          onClick={handleReturnClick}
          aria-label={`${student.name} 돌아가기`}
        >
          <img src={returnIconSrc} alt="" className="student-card__return-icon" aria-hidden="true" />
        </button>
      ) : null}
    </article>
  );
});

export const SeatGrid = memo(function SeatGrid({
  students,
  movementMap,
  total,
  present,
  moved,
  quote,
  onSelect,
  onReturn
}: SeatGridProps) {
  return (
    <section className="status-board" aria-labelledby="status-board-title">
      <header className="status-board__header">
        <div className="status-board__stats" aria-label="출결 현황">
          <div className="status-chip">
            <span className="status-chip__label">학급 인원</span>
            <span className="status-chip__value">{total}</span>
          </div>
          <div className="status-chip">
            <span className="status-chip__label">재실</span>
            <span className="status-chip__value">{present}</span>
          </div>
          <div className="status-chip">
            <span className="status-chip__label">이동</span>
            <span className="status-chip__value">{moved}</span>
          </div>
        </div>

        <div className="status-board__title-wrap">
          <h2 className="status-board__title" id="status-board-title">
            학급 현황
          </h2>
        </div>

        <div className="status-board__quote" aria-label="오늘의 문구">
          <p className="status-board__quote-text">{quote.headline}</p>
          {quote.subline ? <p className="status-board__quote-author">{quote.subline}</p> : null}
        </div>
      </header>

      <div className="student-grid-shell" role="region" aria-label="학생 목록">
        <div className="student-grid" role="list">
          {students.map((student) => {
            const movement = movementMap[student.hakbun];
            const isMoved = Boolean(movement && movement.location);
            const statusLabel = movement?.location ?? '교실';
            return (
              <StudentCard
                key={student.hakbun}
                student={student}
                isMoved={isMoved}
                statusLabel={statusLabel}
                onSelect={onSelect}
                onReturn={onReturn}
              />
            );
          })}
        </div>
      </div>
    </section>
  );
});
