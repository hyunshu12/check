import { MouseEvent } from 'react';

import { Student, MovementMap } from '../types';

interface SeatGridProps {
  students: Student[];
  movementMap: MovementMap;
  onSelect: (student: Student, rect: DOMRect) => void;
  total: number;
  present: number;
  absent: number;
}

export function SeatGrid({ students, movementMap, onSelect, total, present, absent }: SeatGridProps) {
  return (
    <section className="card seat-card" aria-labelledby="seats-title">
      <header className="card-header seat-header">
        <div>
          <span className="section-eyebrow">Class Live View</span>
          <h2 className="card-title" id="seats-title">
            학급 현황
          </h2>
          <p className="card-subtitle">학생 카드를 선택하면 현재 위치를 바로 기록할 수 있습니다.</p>
        </div>
        <div className="seat-stats" aria-label="출결 현황">
          <div className="stat-chip total">
            <span className="label">학급 인원</span>
            <span className="value">{total}</span>
          </div>
          <div className="stat-chip present">
            <span className="label">재실</span>
            <span className="value">{present}</span>
          </div>
          <div className="stat-chip absent">
            <span className="label">이동</span>
            <span className="value">{absent}</span>
          </div>
        </div>
      </header>
      <div className="seat-grid">
        {students.map((student, index) => {
          const movement = movementMap[student.hakbun];
          const moved = Boolean(movement && movement.location);
          const statusLabel = movement?.location ?? '재실';

          const handleClick = (event: MouseEvent<HTMLButtonElement>) => {
            const rect = event.currentTarget.getBoundingClientRect();
            onSelect(student, rect);
          };

          return (
            <button
              key={student.hakbun}
              className={`seat ${moved ? 'moved' : 'present'}`.trim()}
              data-hakbun={student.hakbun}
              type="button"
              onClick={handleClick}
            >
              <div className="seat-topline">
                <span className="seat-order">{String(index + 1).padStart(2, '0')}</span>
                <span className={`seat-status ${moved ? 'moved' : 'present'}`}>{statusLabel}</span>
              </div>

              <div className="seat-texts">
                <div className="student-name">{student.name}</div>
                <small>ID {student.hakbun}</small>
              </div>

              <div className="seat-footer">
                <span>{moved ? '이동 위치 기록됨' : '교실 재실 중'}</span>
              </div>
            </button>
          );
        })}
      </div>
    </section>
  );
}
