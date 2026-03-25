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

  const groups = useMemo(() => {
    const extraSet = new Set(extraLocations);
    const result = new Map<string, { label: string; items: Array<{ student: Student; location: string }> }>();

    Object.entries(movementMap).forEach(([hakbun, record]) => {
      const student = studentMap.get(hakbun);
      if (!student || !record || !record.location) return;

      const groupKey = extraSet.has(record.location) ? '기타' : record.location;
      const label = groupKey === '기타' ? '기타' : record.location;
      if (!result.has(groupKey)) {
        result.set(groupKey, { label, items: [] });
      }

      result.get(groupKey)?.items.push({ student, location: record.location });
    });

    return result;
  }, [extraLocations, movementMap, studentMap]);

  const orderedGroupKeys = useMemo(() => {
    const keys: string[] = [];

    mainLocations.forEach((location) => {
      if (location === '기타') return;
      if (groups.has(location)) {
        keys.push(location);
      }
    });

    const otherGroups = Array.from(groups.keys()).filter((key) => key !== '기타' && !mainLocations.includes(key));
    otherGroups.sort();
    keys.push(...otherGroups);

    if (groups.has('기타')) {
      keys.push('기타');
    }

    return keys;
  }, [groups, mainLocations]);

  const movedCount = useMemo(
    () => Array.from(groups.values()).reduce((sum, group) => sum + group.items.length, 0),
    [groups]
  );

  return (
    <section className="card movement-card" aria-labelledby="movement-title">
      <header className="card-header">
        <div>
          <span className="section-eyebrow">Movement Summary</span>
          <h2 className="card-title" id="movement-title">
            이동 요약
          </h2>
          <p className="card-subtitle">교실 밖에 있는 학생만 현재 위치 기준으로 묶어 보여줍니다.</p>
        </div>
        <span className="badge subtle">{movedCount ? `${movedCount}명 이동 중` : '전원 재실'}</span>
      </header>

      {orderedGroupKeys.length === 0 ? (
        <div className="empty-state">현재 이동 중인 학생이 없습니다.</div>
      ) : (
        <div className="movement-groups">
          {orderedGroupKeys.map((groupKey) => {
            const group = groups.get(groupKey);
            if (!group) return null;
            const sortedItems = [...group.items].sort((a, b) => a.student.name.localeCompare(b.student.name, 'ko-KR'));

            return (
              <article key={groupKey} className="movement-group">
                <div className="group-header">
                  <div className="group-title-block">
                    <span className="group-label">{group.label}</span>
                    <span className="group-caption">현재 위치</span>
                  </div>
                  <span className="badge">{sortedItems.length}명</span>
                </div>
                <div className="group-body">
                  {sortedItems.map(({ student, location }) => {
                    const detail = groupKey === '기타' ? location : '—';

                    return (
                      <div key={student.hakbun} className="movement-chip" title={location}>
                        <div className="movement-chip__identity">
                          <span className="name">{student.name}</span>
                          <span className="meta">{student.hakbun}</span>
                        </div>
                        <span className="detail">{detail}</span>
                      </div>
                    );
                  })}
                </div>
              </article>
            );
          })}
        </div>
      )}
    </section>
  );
});

