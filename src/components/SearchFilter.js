import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { memo, useMemo, useState, useCallback } from 'react';
export const SearchFilter = memo(function SearchFilter({ students, movementMap, onStudentSelect, onLocationFilter }) {
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedLocation, setSelectedLocation] = useState(null);
    const [isExpanded, setIsExpanded] = useState(false);
    // 모든 장소 목록 추출 (중복 제거)
    const allLocations = useMemo(() => {
        const locations = new Set();
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
            result = result.filter((student) => student.name.toLowerCase().includes(query) || student.hakbun.includes(query));
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
    const handleSearchChange = useCallback((e) => {
        setSearchQuery(e.target.value);
        setIsExpanded(true);
    }, []);
    const handleLocationChange = useCallback((location) => {
        setSelectedLocation(location);
        setIsExpanded(true);
        onLocationFilter?.(location);
    }, [onLocationFilter]);
    const handleStudentClick = useCallback((student) => {
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
    return (_jsxs("section", { className: "card search-filter-card", "aria-labelledby": "search-title", children: [_jsxs("header", { className: "card-header", children: [_jsxs("div", { children: [_jsx("h2", { className: "card-title", id: "search-title", children: "\uBE60\uB978 \uAC80\uC0C9" }), _jsx("p", { className: "card-subtitle", children: "\uD559\uC0DD \uC774\uB984\uC774\uB098 \uD559\uBC88\uC73C\uB85C \uAC80\uC0C9\uD558\uC138\uC694." })] }), hasActiveFilters && (_jsx("button", { type: "button", className: "clear-filters-button", onClick: clearFilters, "aria-label": "\uD544\uD130 \uCD08\uAE30\uD654", children: "\uCD08\uAE30\uD654" }))] }), _jsxs("div", { className: "search-filter-content", children: [_jsxs("div", { className: "search-input-wrapper", children: [_jsx("input", { type: "text", className: "search-input", placeholder: "\uC774\uB984 \uB610\uB294 \uD559\uBC88 \uC785\uB825...", value: searchQuery, onChange: handleSearchChange, onFocus: () => setIsExpanded(true), "aria-label": "\uD559\uC0DD \uAC80\uC0C9" }), searchQuery && (_jsx("button", { type: "button", className: "search-clear", onClick: () => setSearchQuery(''), "aria-label": "\uAC80\uC0C9\uC5B4 \uC9C0\uC6B0\uAE30", children: "\u00D7" }))] }), allLocations.length > 0 && (_jsxs("div", { className: "location-filters", children: [_jsx("div", { className: "location-filters-header", children: _jsx("span", { className: "location-filters-label", children: "\uC7A5\uC18C \uD544\uD130" }) }), _jsxs("div", { className: "location-chips", children: [_jsx("button", { type: "button", className: `location-chip ${selectedLocation === null ? 'active' : ''}`, onClick: () => handleLocationChange(null), children: "\uC804\uCCB4" }), allLocations.map((location) => (_jsx("button", { type: "button", className: `location-chip ${selectedLocation === location ? 'active' : ''}`, onClick: () => handleLocationChange(location), children: location }, location)))] })] })), isExpanded && filteredStudents.length > 0 && (_jsxs("div", { className: "search-results", children: [_jsx("div", { className: "search-results-header", children: _jsxs("span", { className: "search-results-count", children: [filteredStudents.length, "\uBA85"] }) }), _jsx("div", { className: "search-results-list", children: filteredStudents.map((student) => {
                                    const record = movementMap[student.hakbun];
                                    const isMoved = Boolean(record?.location);
                                    return (_jsxs("button", { type: "button", className: `search-result-item ${isMoved ? 'moved' : ''}`, onClick: () => handleStudentClick(student), children: [_jsxs("div", { className: "result-student-info", children: [_jsx("span", { className: "result-name", children: student.name }), _jsx("span", { className: "result-hakbun", children: student.hakbun })] }), isMoved && (_jsx("span", { className: "result-location", children: record.location }))] }, student.hakbun));
                                }) })] })), isExpanded && searchQuery.trim() !== '' && filteredStudents.length === 0 && (_jsx("div", { className: "search-empty", children: "\uAC80\uC0C9 \uACB0\uACFC\uAC00 \uC5C6\uC2B5\uB2C8\uB2E4." }))] })] }));
});
