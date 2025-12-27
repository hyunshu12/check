import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Gallery } from './components/Gallery';
import { MovementOverlay, MovementExtraPanel } from './components/MovementOverlay';
import { MovementPanel } from './components/MovementPanel';
import { SearchFilter } from './components/SearchFilter';
import { SeatGrid } from './components/SeatGrid';
import { StatsDashboard } from './components/StatsDashboard';
import { TopBar } from './components/TopBar';
import { bannerConfig, galleryImages, galleryIntervalMs, GHOST_STUDENT_HAKBUN, TOTAL_STUDENTS } from './config/appSettings';
import { classroomSettings } from './config/classrooms';
import { sundaySchedule, weekdaySchedule } from './config/schedule';
import { students } from './config/students';
import { useClock } from './hooks/useClock';
import { usePersistentState } from './hooks/usePersistentState';
import { upsertMovement } from './utils/movement';
import { getCurrentScheduleSlot, getSlotProgress } from './utils/schedule';
const MOVEMENT_STORAGE_KEY = 'movementMap';
const OVERLAY_SIZE = 200;
const EXTRA_PANEL_WIDTH = 280;
const VIEWPORT_MARGIN = 16;
function clamp(value, min, max) {
    return Math.min(Math.max(value, min), max);
}
export default function App() {
    const now = useClock();
    const { main: rawMainLocations, extra: extraLocations } = classroomSettings;
    const mainLocations = useMemo(() => rawMainLocations.filter((location) => location.trim().length > 0), [rawMainLocations]);
    const mainLocationsForOverlay = useMemo(() => mainLocations.filter((location) => location !== '복귀'), [mainLocations]);
    const activeStudentCount = students.filter((student) => student.hakbun !== GHOST_STUDENT_HAKBUN).length;
    const totalStudents = TOTAL_STUDENTS > 0 ? TOTAL_STUDENTS : activeStudentCount;
    const [movementMap, setMovementMap] = usePersistentState(MOVEMENT_STORAGE_KEY, {});
    const [selectedStudent, setSelectedStudent] = useState(null);
    const [overlayPosition, setOverlayPosition] = useState(null);
    const [isExtraOpen, setExtraOpen] = useState(false);
    const overlayRef = useRef(null);
    const extraRef = useRef(null);
    const scheduleForToday = useMemo(() => {
        const day = now.getDay();
        if (day === 0)
            return sundaySchedule;
        if (day >= 1 && day <= 5)
            return weekdaySchedule;
        return [];
    }, [now]);
    const currentSlot = useMemo(() => getCurrentScheduleSlot(scheduleForToday, now), [scheduleForToday, now]);
    const slotProgress = currentSlot ? getSlotProgress(currentSlot, now) : undefined;
    const absentCount = useMemo(() => Object.values(movementMap).reduce((count, record) => {
        if (record && record.location) {
            return count + 1;
        }
        return count;
    }, 0), [movementMap]);
    const presentCount = useMemo(() => clamp(totalStudents - absentCount, 0, totalStudents), [totalStudents, absentCount]);
    const extraPosition = useMemo(() => {
        if (!overlayPosition)
            return null;
        const viewportWidth = window.innerWidth;
        const viewportHeight = window.innerHeight;
        const margin = VIEWPORT_MARGIN;
        const desiredTop = clamp(overlayPosition.top, margin, viewportHeight - VIEWPORT_MARGIN - OVERLAY_SIZE);
        const leftCandidate = overlayPosition.left - EXTRA_PANEL_WIDTH - margin;
        if (leftCandidate >= margin) {
            return { top: desiredTop, left: leftCandidate };
        }
        const rightCandidate = overlayPosition.left + OVERLAY_SIZE + margin;
        const maxLeft = viewportWidth - EXTRA_PANEL_WIDTH - margin;
        return {
            top: desiredTop,
            left: clamp(rightCandidate, margin, Math.max(margin, maxLeft))
        };
    }, [overlayPosition]);
    const closeOverlay = useCallback(() => {
        setSelectedStudent(null);
        setOverlayPosition(null);
        setExtraOpen(false);
    }, []);
    const handleSeatSelect = useCallback((student, rect) => {
        const margin = VIEWPORT_MARGIN;
        const overlayWidth = OVERLAY_SIZE;
        const overlayHeight = OVERLAY_SIZE;
        const viewportWidth = window.innerWidth;
        const viewportHeight = window.innerHeight;
        const baseTop = rect.top + window.scrollY + rect.height / 2 - overlayHeight / 2;
        const baseLeft = rect.left + window.scrollX + rect.width / 2 - overlayWidth / 2;
        const clampedTop = clamp(baseTop, margin, Math.max(margin, viewportHeight - overlayHeight - margin));
        const clampedLeft = clamp(baseLeft, margin, Math.max(margin, viewportWidth - overlayWidth - margin));
        setSelectedStudent(student);
        setOverlayPosition({ top: clampedTop, left: clampedLeft });
        setExtraOpen(false);
    }, []);
    const handleSearchStudentSelect = useCallback((student) => {
        // 검색에서 학생 선택 시 좌석 위치를 찾아서 오버레이 표시
        const seatElement = document.querySelector(`[data-hakbun="${student.hakbun}"]`);
        if (seatElement) {
            const rect = seatElement.getBoundingClientRect();
            handleSeatSelect(student, rect);
        }
        else {
            // 좌석을 찾을 수 없으면 화면 중앙에 표시
            const viewportWidth = window.innerWidth;
            const viewportHeight = window.innerHeight;
            setSelectedStudent(student);
            setOverlayPosition({
                top: viewportHeight / 2 - OVERLAY_SIZE / 2,
                left: viewportWidth / 2 - OVERLAY_SIZE / 2
            });
            setExtraOpen(false);
        }
    }, [handleSeatSelect]);
    const applyMovement = useCallback((student, location) => {
        if (location === '복귀') {
            setMovementMap((prev) => upsertMovement(prev, student.hakbun, null));
            closeOverlay();
            return;
        }
        const record = {
            location,
            timestamp: Date.now() // 이동 시작 시간 기록
        };
        setMovementMap((prev) => upsertMovement(prev, student.hakbun, record));
        closeOverlay();
    }, [closeOverlay]);
    const handleLocationSelect = useCallback((location) => {
        if (!selectedStudent)
            return;
        if (location === '기타') {
            setExtraOpen(true);
            return;
        }
        applyMovement(selectedStudent, location);
    }, [selectedStudent, applyMovement]);
    const handleExtraLocationSelect = useCallback((location) => {
        if (!selectedStudent)
            return;
        applyMovement(selectedStudent, location);
    }, [selectedStudent, applyMovement]);
    const handleResetMovement = useCallback(() => {
        const shouldReset = window.confirm('초기화 하겠습니까?');
        if (!shouldReset) {
            return;
        }
        setMovementMap({});
        closeOverlay();
    }, [closeOverlay]);
    useEffect(() => {
        if (!selectedStudent)
            return;
        const handleMouseDown = (event) => {
            const target = event.target;
            if (overlayRef.current?.contains(target))
                return;
            if (extraRef.current?.contains(target))
                return;
            if (target.closest('.seat'))
                return;
            closeOverlay();
        };
        document.addEventListener('mousedown', handleMouseDown);
        return () => document.removeEventListener('mousedown', handleMouseDown);
    }, [selectedStudent, closeOverlay]);
    useEffect(() => {
        if (!selectedStudent)
            return;
        const handleKeyDown = (event) => {
            if (event.key === 'Escape') {
                closeOverlay();
            }
        };
        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, [selectedStudent, closeOverlay]);
    return (_jsxs("div", { id: "app", children: [_jsx(TopBar, { banner: bannerConfig, now: now, currentSlot: currentSlot ?? undefined, progress: slotProgress }), _jsxs("main", { className: "dashboard", "aria-label": "\uAD50\uC2E4 \uBAA8\uB2C8\uD130\uB9C1 \uB300\uC2DC\uBCF4\uB4DC", children: [_jsx("section", { className: "dashboard-main", children: _jsx(SeatGrid, { students: students, movementMap: movementMap, onSelect: handleSeatSelect, total: totalStudents, present: presentCount, absent: absentCount }) }), _jsxs("aside", { className: "dashboard-side", children: [_jsx(MovementPanel, { movementMap: movementMap, students: students, mainLocations: mainLocations, extraLocations: extraLocations }), _jsx(Gallery, { images: galleryImages, intervalMs: galleryIntervalMs }), _jsx(SearchFilter, { students: students, movementMap: movementMap, onStudentSelect: handleSearchStudentSelect }), _jsx(StatsDashboard, { movementMap: movementMap, students: students, totalStudents: totalStudents })] })] }), _jsx(MovementOverlay, { ref: overlayRef, student: selectedStudent, position: overlayPosition, mainLocations: mainLocationsForOverlay, onSelect: handleLocationSelect }), _jsx(MovementExtraPanel, { ref: extraRef, open: Boolean(selectedStudent && isExtraOpen), position: extraPosition, extraLocations: extraLocations, onSelect: handleExtraLocationSelect }), _jsx("button", { type: "button", className: "reset-button", onClick: handleResetMovement, "aria-label": "\uC774\uB3D9\uD55C \uD559\uC0DD\uB4E4\uC744 \uCD08\uAE30\uD654", children: "\uCD08\uAE30\uD654" })] }));
}
