import { memo, useMemo, useState, useCallback } from 'react';
import { Student, MovementMap } from '../types';

interface SearchFilterProps {
  students: Student[];
  movementMap: MovementMap;
  onStudentSelect?: (student: Student) => void;
  onLocationFilter?: (location: string | null) => void;
}

export const SearchFilter = memo(function SearchFilter({ students, movementMap, onStudentSelect, onLocationFilter }: SearchFilterProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLocation, setSelectedLocation] = useState<string | null>(null);
  const [isExpanded, setIsExpanded] = useState(false);

  // 모든 장소 목록 추출 (중복 제거)
  const allLocations = useMemo(() => {
    const locations = new Set<string>();
    Object.values(movementMap).forEach((record) => {
      if (record?.location) {
        locations.add(record.location);
      }
    });
    return Array.from(locations).sort();
  }, [movementMap]);

  // 검색 필터링된 학생 목록
  const filteredStudents = useMemo(() => {
    if (!searchQuery.trim() && !selectedLocation) {
      return [];
    }

    let result = students;

    // 검색어 필터링
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (student) =>
          student.name.toLowerCase().includes(query) || student.hakbun.includes(query)
      );
    }

    // 장소 필터링
    if (selectedLocation) {
      result = result.filter((student) => {
        const record = movementMap[student.hakbun];
        return record?.location === selectedLocation;
      });
    }

    return result.slice(0, 10); // 최대 10개만 표시
  }, [students, movementMap, searchQuery, selectedLocation]);

  const handleSearchChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    setIsExpanded(true);
  }, []);

  const handleLocationChange = useCallback((location: string | null) => {
    setSelectedLocation(location);
    setIsExpanded(true);
    onLocationFilter?.(location);
  }, [onLocationFilter]);

  const handleStudentClick = useCallback((student: Student) => {
    onStudentSelect?.(student);
    setSearchQuery('');
    setIsExpanded(false);
  }, [onStudentSelect]);

  const clearFilters = useCallback(() => {
    setSearchQuery('');
    setSelectedLocation(null);
    setIsExpanded(false);
    onLocationFilter?.(null);
  }, [onLocationFilter]);

  const hasActiveFilters = searchQuery.trim() !== '' || selectedLocation !== null;

  return (
    <section className="card search-filter-card" aria-labelledby="search-title">
      <header className="card-header">
        <div>
          <h2 className="card-title" id="search-title">
            빠른 검색
          </h2>
          <p className="card-subtitle">학생 이름이나 학번으로 검색하세요.</p>
        </div>
        {hasActiveFilters && (
          <button
            type="button"
            className="clear-filters-button"
            onClick={clearFilters}
            aria-label="필터 초기화"
          >
            초기화
          </button>
        )}
      </header>

      <div className="search-filter-content">
        <div className="search-input-wrapper">
          <input
            type="text"
            className="search-input"
            placeholder="이름 또는 학번 입력..."
            value={searchQuery}
            onChange={handleSearchChange}
            onFocus={() => setIsExpanded(true)}
            aria-label="학생 검색"
          />
          {searchQuery && (
            <button
              type="button"
              className="search-clear"
              onClick={() => setSearchQuery('')}
              aria-label="검색어 지우기"
            >
              ×
            </button>
          )}
        </div>

        {allLocations.length > 0 && (
          <div className="location-filters">
            <div className="location-filters-header">
              <span className="location-filters-label">장소 필터</span>
            </div>
            <div className="location-chips">
              <button
                type="button"
                className={`location-chip ${selectedLocation === null ? 'active' : ''}`}
                onClick={() => handleLocationChange(null)}
              >
                전체
              </button>
              {allLocations.map((location) => (
                <button
                  key={location}
                  type="button"
                  className={`location-chip ${selectedLocation === location ? 'active' : ''}`}
                  onClick={() => handleLocationChange(location)}
                >
                  {location}
                </button>
              ))}
            </div>
          </div>
        )}

        {isExpanded && filteredStudents.length > 0 && (
          <div className="search-results">
            <div className="search-results-header">
              <span className="search-results-count">{filteredStudents.length}명</span>
            </div>
            <div className="search-results-list">
              {filteredStudents.map((student) => {
                const record = movementMap[student.hakbun];
                const isMoved = Boolean(record?.location);

                return (
                  <button
                    key={student.hakbun}
                    type="button"
                    className={`search-result-item ${isMoved ? 'moved' : ''}`}
                    onClick={() => handleStudentClick(student)}
                  >
                    <div className="result-student-info">
                      <span className="result-name">{student.name}</span>
                      <span className="result-hakbun">{student.hakbun}</span>
                    </div>
                    {isMoved && (
                      <span className="result-location">{record.location}</span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {isExpanded && searchQuery.trim() !== '' && filteredStudents.length === 0 && (
          <div className="search-empty">검색 결과가 없습니다.</div>
        )}
      </div>
    </section>
  );
});

