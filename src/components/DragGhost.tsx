import { memo } from 'react';

import type { Student } from '../types';

interface DragGhostProps {
  student: Student;
  detail?: string;
}

export const DragGhost = memo(function DragGhost({ student, detail }: DragGhostProps) {
  return (
    <div className="va-drag-ghost" role="presentation">
      <span className="va-drag-ghost__hakbun">{student.hakbun}</span>
      <span className="va-drag-ghost__name">{student.name}</span>
      {detail ? <span className="va-drag-ghost__detail">{detail}</span> : null}
    </div>
  );
});
