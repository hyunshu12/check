import { memo, useCallback, useMemo } from 'react';

import { reasons, reasonForLocation, type ReasonDef } from '../config/reasons';
import { MovementMap, Student } from '../types';

interface ReasonBoardProps {
  students: Student[];
  movementMap: MovementMap;
  dragHakbun: string | null;
  hoverKey: string | null;
  onDragOverReason: (reasonKey: string) => void;
  onDragLeaveReason: (reasonKey: string) => void;
  onDropReason: (event: React.DragEvent<HTMLElement>, reasonKey: string) => void;
  onDragStartItem: (event: React.DragEvent<HTMLElement>, hakbun: string) => void;
  onDragEndItem: () => void;
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
  hoverKey,
  onDragOverReason,
  onDragLeaveReason,
  onDropReason,
  onDragStartItem,
  onDragEndItem,
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

    return Array.from(map.values()).sort((a, b) => {
      if (a.items.length === 0 && b.items.length > 0) return 1;
      if (b.items.length === 0 && a.items.length > 0) return -1;
      return b.items.length - a.items.length;
    });
  }, [movementMap, students]);

  const isDragging = Boolean(dragHakbun);

  return (
    <section className="va-board" aria-labelledby="reason-board-title">
      <div className="va-board__head">
        <h2 className="va-board__title" id="reason-board-title">
          사유별 이동 현황
        </h2>
        <span className="va-board__hint">미니맵의 학생을 사유 카드로 끌어 놓으세요</span>
      </div>
      <div className="va-board__grid">
        {groups.map((group) => (
          <ReasonCard
            key={group.key}
            group={group}
            isHover={hoverKey === group.key}
            isDragging={isDragging}
            onDragOver={onDragOverReason}
            onDragLeave={onDragLeaveReason}
            onDrop={onDropReason}
            onDragStartItem={onDragStartItem}
            onDragEndItem={onDragEndItem}
            onSelectStudent={onSelectStudent}
          />
        ))}
      </div>
    </section>
  );
});

interface ReasonCardProps {
  group: Group;
  isHover: boolean;
  isDragging: boolean;
  onDragOver: (reasonKey: string) => void;
  onDragLeave: (reasonKey: string) => void;
  onDrop: (event: React.DragEvent<HTMLElement>, reasonKey: string) => void;
  onDragStartItem: (event: React.DragEvent<HTMLElement>, hakbun: string) => void;
  onDragEndItem: () => void;
  onSelectStudent: (student: Student) => void;
}

const ReasonCard = memo(function ReasonCard({
  group,
  isHover,
  isDragging,
  onDragOver,
  onDragLeave,
  onDrop,
  onDragStartItem,
  onDragEndItem,
  onSelectStudent
}: ReasonCardProps) {
  const empty = group.items.length === 0;
  const isEtc = Boolean(group.isEtc);
  const reasonKey = group.key;

  const handleDragOver = useCallback(
    (event: React.DragEvent<HTMLElement>) => {
      if (!isDragging) return;
      event.preventDefault();
      onDragOver(reasonKey);
    },
    [isDragging, onDragOver, reasonKey]
  );

  const handleDragLeave = useCallback(() => {
    onDragLeave(reasonKey);
  }, [onDragLeave, reasonKey]);

  const handleDrop = useCallback(
    (event: React.DragEvent<HTMLElement>) => {
      onDrop(event, reasonKey);
    },
    [onDrop, reasonKey]
  );

  const className = [
    'vr-card',
    empty ? 'is-empty' : '',
    isEtc ? 'vr-card--etc' : '',
    isDragging ? 'is-droppable' : '',
    isHover ? 'is-hover' : ''
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <article
      className={className}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <header className="vr-card__head">
        <h3 className="vr-card__title">{group.label}</h3>
        <div className="vr-card__count">
          <span className="vr-card__count-num">{group.items.length}</span>
          <span className="vr-card__count-unit">명</span>
        </div>
      </header>
      <div className="vr-card__body">
        {empty ? (
          <div className="vr-card__empty">{isHover ? '여기에 놓기' : '해당 없음'}</div>
        ) : isEtc ? (
          <ul className="vr-list">
            {group.items.map(({ student, detail }) => (
              <ReasonRow
                key={student.hakbun}
                student={student}
                detail={detail}
                onDragStart={onDragStartItem}
                onDragEnd={onDragEndItem}
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
                onDragStart={onDragStartItem}
                onDragEnd={onDragEndItem}
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
  onDragStart: (event: React.DragEvent<HTMLElement>, hakbun: string) => void;
  onDragEnd: () => void;
  onSelect: (student: Student) => void;
}

const ReasonRow = memo(function ReasonRow({ student, detail, onDragStart, onDragEnd, onSelect }: ReasonRowProps) {
  const handleDragStart = useCallback(
    (event: React.DragEvent<HTMLElement>) => onDragStart(event, student.hakbun),
    [onDragStart, student.hakbun]
  );
  const handleClick = useCallback(() => onSelect(student), [onSelect, student]);

  return (
    <li
      className="vr-row"
      draggable
      onDragStart={handleDragStart}
      onDragEnd={onDragEnd}
      onClick={handleClick}
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
  onDragStart: (event: React.DragEvent<HTMLElement>, hakbun: string) => void;
  onDragEnd: () => void;
  onSelect: (student: Student) => void;
}

const ReasonName = memo(function ReasonName({ student, onDragStart, onDragEnd, onSelect }: ReasonNameProps) {
  const handleDragStart = useCallback(
    (event: React.DragEvent<HTMLElement>) => onDragStart(event, student.hakbun),
    [onDragStart, student.hakbun]
  );
  const handleClick = useCallback(() => onSelect(student), [onSelect, student]);

  return (
    <li
      className="vr-name"
      draggable
      onDragStart={handleDragStart}
      onDragEnd={onDragEnd}
      onClick={handleClick}
    >
      <span className="vr-name__hakbun">{student.hakbun}</span>
      <span className="vr-name__label">{student.name}</span>
    </li>
  );
});
