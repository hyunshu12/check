import { memo, useCallback, useMemo } from 'react';
import { useDraggable, useDroppable } from '@dnd-kit/core';

import { reasons, reasonForLocation, type ReasonDef } from '../config/reasons';
import { MovementMap, Student } from '../types';

interface ReasonBoardProps {
  students: Student[];
  movementMap: MovementMap;
  dragHakbun: string | null;
  onSelectStudent: (student: Student) => void;
}

interface GroupItem {
  student: Student;
  detail: string;
}

interface Group extends ReasonDef {
  items: GroupItem[];
}

export const ReasonBoard = memo(function ReasonBoard({
  students,
  movementMap,
  dragHakbun,
  onSelectStudent
}: ReasonBoardProps) {
  const groups = useMemo<Group[]>(() => {
    const map = new Map<string, Group>();
    reasons.forEach((reason) => map.set(reason.key, { ...reason, items: [] }));

    const orderIndex = new Map<string, number>();
    students.forEach((student, index) => orderIndex.set(student.hakbun, index));

    students.forEach((student) => {
      const movement = movementMap[student.hakbun];
      if (!movement || !movement.location) return;
      const reason = reasonForLocation(movement.location);
      map.get(reason.key)?.items.push({ student, detail: movement.location });
    });

    map.forEach((group) => {
      group.items.sort(
        (a, b) => (orderIndex.get(a.student.hakbun) ?? 0) - (orderIndex.get(b.student.hakbun) ?? 0)
      );
    });

    return reasons.map((reason) => map.get(reason.key)!);
  }, [movementMap, students]);

  const isDragging = Boolean(dragHakbun);

  return (
    <section className="va-board" aria-labelledby="reason-board-title">
      <div className="va-board__head">
        <h2 className="va-board__title" id="reason-board-title">
          사유별 이동 현황
        </h2>
      </div>
      <div className="va-board__grid">
        {groups.map((group) => (
          <ReasonCard
            key={group.key}
            group={group}
            isDragging={isDragging}
            onSelectStudent={onSelectStudent}
          />
        ))}
      </div>
    </section>
  );
});

interface ReasonCardProps {
  group: Group;
  isDragging: boolean;
  onSelectStudent: (student: Student) => void;
}

const ReasonCard = memo(function ReasonCard({
  group,
  isDragging,
  onSelectStudent
}: ReasonCardProps) {
  const empty = group.items.length === 0;
  const isEtc = Boolean(group.isEtc);
  const reasonKey = group.key;

  const { setNodeRef, isOver } = useDroppable({ id: `reason:${reasonKey}` });

  const className = [
    'vr-card',
    empty ? 'is-empty' : '',
    isEtc ? 'vr-card--etc' : '',
    isDragging ? 'is-droppable' : '',
    isOver && isDragging ? 'is-hover' : ''
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <article ref={setNodeRef} className={className}>
      <header className="vr-card__head">
        <h3 className="vr-card__title">{group.label}</h3>
        <div className="vr-card__count">
          <span className="vr-card__count-num">{group.items.length}</span>
          <span className="vr-card__count-unit">명</span>
        </div>
      </header>
      <div className="vr-card__body">
        {empty ? (
          <div className="vr-card__empty">{isOver && isDragging ? '여기에 놓기' : '해당 없음'}</div>
        ) : isEtc ? (
          <ul className="vr-list">
            {group.items.map(({ student, detail }) => (
              <ReasonRow
                key={student.hakbun}
                student={student}
                detail={detail}
                onSelect={onSelectStudent}
              />
            ))}
          </ul>
        ) : (
          <ul className="vr-names">
            {group.items.map(({ student }) => (
              <ReasonName
                key={student.hakbun}
                student={student}
                onSelect={onSelectStudent}
              />
            ))}
          </ul>
        )}
      </div>
    </article>
  );
});

interface ReasonRowProps {
  student: Student;
  detail: string;
  onSelect: (student: Student) => void;
}

const ReasonRow = memo(function ReasonRow({ student, detail, onSelect }: ReasonRowProps) {
  const { setNodeRef, attributes, listeners, isDragging } = useDraggable({ id: `item:${student.hakbun}` });
  const handleClick = useCallback(() => onSelect(student), [onSelect, student]);

  return (
    <li
      ref={setNodeRef}
      className={`vr-row${isDragging ? ' is-dragging' : ''}`}
      onClick={handleClick}
      {...listeners}
      {...attributes}
    >
      <span className="vr-row__name">
        <span className="vr-row__hakbun">{student.hakbun}</span>
        {student.name}
      </span>
      <span className="vr-row__reason">{detail}</span>
    </li>
  );
});

interface ReasonNameProps {
  student: Student;
  onSelect: (student: Student) => void;
}

const ReasonName = memo(function ReasonName({ student, onSelect }: ReasonNameProps) {
  const { setNodeRef, attributes, listeners, isDragging } = useDraggable({ id: `item:${student.hakbun}` });
  const handleClick = useCallback(() => onSelect(student), [onSelect, student]);

  return (
    <li
      ref={setNodeRef}
      className={`vr-name${isDragging ? ' is-dragging' : ''}`}
      onClick={handleClick}
      {...listeners}
      {...attributes}
    >
      <span className="vr-name__hakbun">{student.hakbun}</span>
      <span className="vr-name__label">{student.name}</span>
    </li>
  );
});
