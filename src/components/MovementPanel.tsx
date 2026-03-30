import { memo, useMemo } from 'react';

import { MovementMap, Student } from '../types';

interface MovementPanelProps {
  movementMap: MovementMap;
  students: Student[];
  mainLocations: string[];
  extraLocations: string[];
}

export const MovementPanel = memo(function MovementPanel({ movementMap, students, mainLocations, extraLocations }: MovementPanelProps) {
  const studentMap = useMemo(() => {
    const entries = new Map<string, Student>();
    students.forEach((student) => entries.set(student.hakbun, student));
    return entries;
  }, [students]);

  const studentOrder = useMemo(() => {
    const entries = new Map<string, number>();
    students.forEach((student, index) => entries.set(student.hakbun, index));
    return entries;
  }, [students]);

  const groups = useMemo(() => {
    const result = new Map<string, { label: string; items: Array<{ student: Student; location: string }> }>();

    Object.entries(movementMap).forEach(([hakbun, record]) => {
      const student = studentMap.get(hakbun);
      if (!student || !record || !record.location) return;

      const groupKey = record.location;
      const label = record.location;
      if (!result.has(groupKey)) {
        result.set(groupKey, { label, items: [] });
      }

      result.get(groupKey)?.items.push({ student, location: record.location });
    });

    return result;
  }, [movementMap, studentMap]);

  const orderedGroupKeys = useMemo(() => {
    const keys: string[] = [];
    const seen = new Set<string>();

    [...mainLocations, ...extraLocations].forEach((location) => {
      if (location === '복귀' || seen.has(location)) return;
      seen.add(location);
      if (groups.has(location)) {
        keys.push(location);
      }
    });

    const otherGroups = Array.from(groups.keys()).filter((key) => !seen.has(key)).sort((a, b) => a.localeCompare(b, 'ko-KR'));
    keys.push(...otherGroups);

    return keys;
  }, [extraLocations, groups, mainLocations]);

  const movedCount = useMemo(
    () => Array.from(groups.values()).reduce((sum, group) => sum + group.items.length, 0),
    [groups]
  );

  return (
    <section className="movement-summary" aria-labelledby="movement-title">
      <header className="movement-summary__header">
        <h2 className="movement-summary__title" id="movement-title">
          인원 이동 요약
        </h2>
        <span className="movement-summary__badge">{movedCount ? `${movedCount}명 이동 중` : '전원 재실'}</span>
      </header>

      <div className="movement-summary__viewport" role="region" aria-label="이동 학생 위치별 요약">
        {orderedGroupKeys.length === 0 ? (
          <div className="movement-summary__empty">현재 이동 중인 학생이 없습니다.</div>
        ) : (
          <div className="movement-summary__track">
            {orderedGroupKeys.map((groupKey) => {
              const group = groups.get(groupKey);
              if (!group) return null;
              const sortedItems = [...group.items].sort(
                (a, b) => (studentOrder.get(a.student.hakbun) ?? 0) - (studentOrder.get(b.student.hakbun) ?? 0)
              );

              return (
                <article key={groupKey} className="movement-lane">
                  <div className="movement-lane__header">
                    <span className="movement-lane__label">{group.label}</span>
                    <span className="movement-lane__count">{sortedItems.length}명</span>
                  </div>
                  <div className="movement-lane__cards">
                    {sortedItems.map(({ student, location }) => {
                      return (
                        <div key={student.hakbun} className="movement-lane__card" title={location}>
                          <div className="movement-lane__identity">
                            <span className="movement-lane__hakbun">{student.hakbun}</span>
                            <strong className="movement-lane__name">{student.name}</strong>
                          </div>
                          <span className="movement-lane__detail">{location}</span>
                        </div>
                      );
                    })}
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
});
