import { memo, useMemo } from 'react';
import { MovementMap, Student } from '../types';

interface StatsDashboardProps {
  movementMap: MovementMap;
  students: Student[];
  totalStudents: number;
}

interface LocationStats {
  location: string;
  count: number;
  students: Student[];
}

export const StatsDashboard = memo(function StatsDashboard({ movementMap, students, totalStudents }: StatsDashboardProps) {
  const studentMap = useMemo(() => {
    const map = new Map<string, Student>();
    students.forEach((student) => map.set(student.hakbun, student));
    return map;
  }, [students]);

  // 장소별 통계
  const locationStats = useMemo(() => {
    const statsMap = new Map<string, { count: number; students: Student[] }>();

    Object.entries(movementMap).forEach(([hakbun, record]) => {
      if (!record?.location) return;

      const student = studentMap.get(hakbun);
      if (!student) return;

      if (!statsMap.has(record.location)) {
        statsMap.set(record.location, { count: 0, students: [] });
      }

      const stat = statsMap.get(record.location)!;
      stat.count++;
      stat.students.push(student);
    });

    return Array.from(statsMap.entries())
      .map(([location, data]) => ({ location, ...data }))
      .sort((a, b) => b.count - a.count) as LocationStats[];
  }, [movementMap, studentMap]);

  // 전체 통계
  const stats = useMemo(() => {
    const movedCount = students.reduce((count, student) => count + (movementMap[student.hakbun]?.location ? 1 : 0), 0);
    const presentCount = totalStudents - movedCount;
    const movedPercentage = totalStudents > 0 ? (movedCount / totalStudents) * 100 : 0;
    const presentPercentage = totalStudents > 0 ? (presentCount / totalStudents) * 100 : 0;

    // 평균 이동 시간 계산 (timestamp가 있는 경우)
    const movementsWithTime = Object.values(movementMap).filter(
      (r) => r?.location && r.timestamp
    );
    const now = Date.now();
    const avgDuration =
      movementsWithTime.length > 0
        ? movementsWithTime.reduce((sum, r) => {
            const duration = now - (r.timestamp || now);
            return sum + duration;
          }, 0) / movementsWithTime.length
        : 0;

    return {
      movedCount,
      presentCount,
      movedPercentage,
      presentPercentage,
      avgDuration: Math.round(avgDuration / 1000 / 60), // 분 단위
      topLocation: locationStats[0]?.location || null,
      topLocationCount: locationStats[0]?.count || 0,
    };
  }, [movementMap, totalStudents, locationStats, students]);

  // 시간대별 통계 (현재 시간 기준)
  const timeStats = useMemo(() => {
    const hour = new Date().getHours();
    const period =
      hour < 9 ? '오전' : hour < 12 ? '오전' : hour < 18 ? '오후' : '저녁';

    return {
      currentHour: hour,
      period,
    };
  }, []);

  const formatDuration = (minutes: number) => {
    if (minutes < 1) return '< 1분';
    if (minutes < 60) return `${Math.round(minutes)}분`;
    const hours = Math.floor(minutes / 60);
    const mins = Math.round(minutes % 60);
    return mins > 0 ? `${hours}시간 ${mins}분` : `${hours}시간`;
  };

  return (
    <section className="card stats-card" aria-labelledby="stats-title">
      <header className="card-header">
        <div>
          <h2 className="card-title" id="stats-title">
            통계 대시보드
          </h2>
          <p className="card-subtitle">현재 이동 현황을 한눈에 확인하세요.</p>
        </div>
      </header>

      <div className="stats-content">
        {/* 주요 통계 카드 */}
        <div className="stats-grid">
          <div className="stat-card primary">
            <div className="stat-card-icon">👥</div>
            <div className="stat-card-content">
              <div className="stat-card-label">현원</div>
              <div className="stat-card-value">{stats.presentCount}</div>
              <div className="stat-card-subvalue">/{totalStudents}명</div>
            </div>
            <div className="stat-card-progress">
              <div
                className="stat-card-progress-fill"
                style={{ width: `${stats.presentPercentage}%` }}
              />
            </div>
          </div>

          <div className="stat-card secondary">
            <div className="stat-card-icon">🚶</div>
            <div className="stat-card-content">
              <div className="stat-card-label">이동 중</div>
              <div className="stat-card-value">{stats.movedCount}</div>
              <div className="stat-card-subvalue">
                {stats.movedPercentage.toFixed(1)}%
              </div>
            </div>
            <div className="stat-card-progress">
              <div
                className="stat-card-progress-fill secondary"
                style={{ width: `${stats.movedPercentage}%` }}
              />
            </div>
          </div>

          {stats.topLocation && (
            <div className="stat-card accent">
              <div className="stat-card-icon">📍</div>
              <div className="stat-card-content">
                <div className="stat-card-label">인기 장소</div>
                <div className="stat-card-value-small">{stats.topLocation}</div>
                <div className="stat-card-subvalue">{stats.topLocationCount}명</div>
              </div>
            </div>
          )}

          {stats.avgDuration > 0 && (
            <div className="stat-card info">
              <div className="stat-card-icon">⏱️</div>
              <div className="stat-card-content">
                <div className="stat-card-label">평균 이동 시간</div>
                <div className="stat-card-value-small">{formatDuration(stats.avgDuration)}</div>
              </div>
            </div>
          )}
        </div>

        {/* 장소별 상세 통계 */}
        {locationStats.length > 0 && (
          <div className="location-stats-section">
            <h3 className="location-stats-title">장소별 분포</h3>
            <div className="location-stats-list">
              {locationStats.slice(0, 5).map((stat) => {
                const percentage = totalStudents > 0 ? (stat.count / totalStudents) * 100 : 0;

                return (
                  <div key={stat.location} className="location-stat-item">
                    <div className="location-stat-header">
                      <span className="location-stat-name">{stat.location}</span>
                      <span className="location-stat-count">{stat.count}명</span>
                    </div>
                    <div className="location-stat-bar">
                      <div
                        className="location-stat-bar-fill"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                    <div className="location-stat-percentage">
                      {percentage.toFixed(1)}%
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {locationStats.length === 0 && (
          <div className="empty-state subtle">현재 이동 중인 학생이 없습니다.</div>
        )}
      </div>
    </section>
  );
});

