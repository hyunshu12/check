import { MouseEvent } from 'react';

import { SPECIAL_STUDENTS, GHOST_STUDENT_HAKBUN } from '../config/appSettings';
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
  const activeStudents = students.filter((student) => student.hakbun !== GHOST_STUDENT_HAKBUN);
  const layout: Array<Student | null> = [];

  activeStudents.forEach((student, index) => {
    layout.push(student);
    if (index === 13) {
      layout.push(null);
    }
  });

  return (
    <section className="card seat-card" aria-labelledby="seats-title">
      <header className="card-header seat-header">
        <div>
          <h2 className="card-title" id="seats-title">
            좌석 배치
          </h2>
          <p className="card-subtitle">학생을 선택하면 이동 위치를 빠르게 기록할 수 있습니다.</p>
        </div>
        <div className="seat-stats" aria-label="출결 현황">
          <div className="stat-chip total">
            <span className="label">총원</span>
            <span className="value">{total}</span>
          </div>
          <div className="stat-chip present">
            <span className="label">현원</span>
            <span className="value">{present}</span>
          </div>
          <div className="stat-chip absent">
            <span className="label">결원</span>
            <span className="value">{absent}</span>
          </div>
        </div>
      </header>
      <div className="seat-grid">
        {layout.map((student, index) => {
          const row = Math.floor(index / 6);

          if (!student) {
            return <div key={`empty-${index}`} className="seat empty" aria-hidden="true" />;
          }

          const movement = movementMap[student.hakbun];
          const moved = Boolean(movement && movement.location);
          const special = SPECIAL_STUDENTS.includes(student.name);

          const handleClick = (event: MouseEvent<HTMLButtonElement>) => {
            const rect = event.currentTarget.getBoundingClientRect();
            onSelect(student, rect);
          };

          return (
            <button
              key={student.hakbun}
              className={`seat ${moved ? 'moved' : ''} ${special ? 'special' : ''}`.trim()}
              data-row={row}
              data-hakbun={student.hakbun}
              type="button"
              onClick={handleClick}
            >
              <div className="student-name">{student.name}</div>
              <small>{student.hakbun}</small>
            </button>
          );
        })}
      </div>
    </section>
  );
}

