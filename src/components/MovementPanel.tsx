import { useMemo } from 'react';

import { MovementMap, Student } from '../types';

interface MovementPanelProps {
  movementMap: MovementMap;
  students: Student[];
  mainLocations: string[];
  extraLocations: string[];
}

export function MovementPanel({ movementMap, students, mainLocations, extraLocations }: MovementPanelProps) {
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

  const orderedGroupKeys: string[] = [];

  mainLocations.forEach((location) => {
    if (location === '기타') return;
    if (groups.has(location)) {
      orderedGroupKeys.push(location);
    }
  });

  const otherGroups = Array.from(groups.keys()).filter((key) => key !== '기타' && !mainLocations.includes(key));
  otherGroups.sort();
  orderedGroupKeys.push(...otherGroups);

  if (groups.has('기타')) {
    orderedGroupKeys.push('기타');
  }

  return (
    <section className="card movement-card" aria-labelledby="movement-title">
      <header className="card-header">
        <div>
          <h2 className="card-title" id="movement-title">
            이동 현황
          </h2>
          <p className="card-subtitle">현재 이동 중인 학생들의 위치를 한눈에 확인하세요.</p>
        </div>
        <span className="badge subtle">{groups.size ? `${orderedGroupKeys.length}개 위치` : '이동 없음'}</span>
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
                  <span className="group-label">{group.label}</span>
                  <span className="badge">{sortedItems.length}명</span>
                </div>
                <div className="group-body">
                  {sortedItems.map(({ student, location }) => {
                    const detail = groupKey === '기타' ? location : '—';

                    return (
                      <div key={student.hakbun} className="movement-chip" title={location}>
                        <span className="name">{student.name}</span>
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
}


