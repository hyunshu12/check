import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { Gallery } from './components/Gallery';
import { MovementOverlay, MovementExtraPanel } from './components/MovementOverlay';
import { MovementPanel } from './components/MovementPanel';
import { SeatGrid } from './components/SeatGrid';
import { TopBar } from './components/TopBar';
import { bannerConfig, galleryImages, galleryIntervalMs, GHOST_STUDENT_HAKBUN, TOTAL_STUDENTS } from './config/appSettings';
import { classroomSettings } from './config/classrooms';
import { sundaySchedule, weekdaySchedule } from './config/schedule';
import { students } from './config/students';
import { useClock } from './hooks/useClock';
import { usePersistentState } from './hooks/usePersistentState';
import { MovementMap, MovementRecord, Student } from './types';
import { upsertMovement } from './utils/movement';
import { getCurrentScheduleSlot, getSlotProgress } from './utils/schedule';

type OverlayPosition = { top: number; left: number };

const MOVEMENT_STORAGE_KEY = 'movementMap';
const OVERLAY_SIZE = 200;
const EXTRA_PANEL_WIDTH = 280;
const VIEWPORT_MARGIN = 16;

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

export default function App() {
  const now = useClock();
  const { main: rawMainLocations, extra: extraLocations } = classroomSettings;
  const mainLocations = useMemo(() => rawMainLocations.filter((location) => location.trim().length > 0), [rawMainLocations]);
  const mainLocationsForOverlay = useMemo(
    () => mainLocations.filter((location) => location !== '복귀'),
    [mainLocations]
  );

  const activeStudentCount = students.filter((student) => student.hakbun !== GHOST_STUDENT_HAKBUN).length;
  const totalStudents = TOTAL_STUDENTS > 0 ? TOTAL_STUDENTS : activeStudentCount;

  const [movementMap, setMovementMap] = usePersistentState<MovementMap>(MOVEMENT_STORAGE_KEY, {});

  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [overlayPosition, setOverlayPosition] = useState<OverlayPosition | null>(null);
  const [isExtraOpen, setExtraOpen] = useState(false);

  const overlayRef = useRef<HTMLDivElement | null>(null);
  const extraRef = useRef<HTMLDivElement | null>(null);

  const scheduleForToday = useMemo(() => {
    const day = now.getDay();
    if (day === 0) return sundaySchedule;
    if (day >= 1 && day <= 5) return weekdaySchedule;
    return [];
  }, [now]);

  const currentSlot = useMemo(() => getCurrentScheduleSlot(scheduleForToday, now), [scheduleForToday, now]);
  const slotProgress = currentSlot ? getSlotProgress(currentSlot, now) : undefined;

  const absentCount = useMemo(
    () =>
      Object.values(movementMap).reduce((count, record) => {
        if (record && record.location) {
          return count + 1;
        }
        return count;
      }, 0),
    [movementMap]
  );

  const presentCount = useMemo(() => clamp(totalStudents - absentCount, 0, totalStudents), [totalStudents, absentCount]);

  const extraPosition = useMemo(() => {
    if (!overlayPosition) return null;

    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    const margin = VIEWPORT_MARGIN;

    const desiredTop = clamp(overlayPosition.top, margin, viewportHeight - VIEWPORT_MARGIN - OVERLAY_SIZE);
    const leftCandidate = overlayPosition.left - EXTRA_PANEL_WIDTH - margin;

    if (leftCandidate >= margin) {
      return { top: desiredTop, left: leftCandidate } satisfies OverlayPosition;
    }

    const rightCandidate = overlayPosition.left + OVERLAY_SIZE + margin;
    const maxLeft = viewportWidth - EXTRA_PANEL_WIDTH - margin;
    return {
      top: desiredTop,
      left: clamp(rightCandidate, margin, Math.max(margin, maxLeft))
    } satisfies OverlayPosition;
  }, [overlayPosition]);

  const closeOverlay = useCallback(() => {
    setSelectedStudent(null);
    setOverlayPosition(null);
    setExtraOpen(false);
  }, []);

  const handleSeatSelect = useCallback((student: Student, rect: DOMRect) => {
    const margin = VIEWPORT_MARGIN;
    const overlayWidth = OVERLAY_SIZE;
    const overlayHeight = OVERLAY_SIZE;
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;

    // getBoundingClientRect()는 이미 뷰포트 기준 좌표를 반환하므로 스크롤 오프셋을 더하지 않음
    const baseTop = rect.top + rect.height / 2 - overlayHeight / 2;
    const baseLeft = rect.left + rect.width / 2 - overlayWidth / 2;

    const clampedTop = clamp(baseTop, margin, Math.max(margin, viewportHeight - overlayHeight - margin));
    const clampedLeft = clamp(baseLeft, margin, Math.max(margin, viewportWidth - overlayWidth - margin));

    setSelectedStudent(student);
    setOverlayPosition({ top: clampedTop, left: clampedLeft });
    setExtraOpen(false);
  }, []);

  const applyMovement = useCallback((student: Student, location: string) => {
    if (location === '복귀') {
      setMovementMap((prev) => upsertMovement(prev, student.hakbun, null));
      closeOverlay();
      return;
    }

    const record: MovementRecord = {
      location
    };

    setMovementMap((prev) => upsertMovement(prev, student.hakbun, record));
    closeOverlay();
  }, [closeOverlay, setMovementMap]);

  const handleLocationSelect = useCallback((location: string) => {
    if (!selectedStudent) return;
    if (location === '기타') {
      setExtraOpen(true);
      return;
    }
    applyMovement(selectedStudent, location);
  }, [selectedStudent, applyMovement]);

  const handleExtraLocationSelect = useCallback((location: string) => {
    if (!selectedStudent) return;
    applyMovement(selectedStudent, location);
  }, [selectedStudent, applyMovement]);

  const handleResetMovement = useCallback(() => {
    const shouldReset = window.confirm('초기화 하겠습니까?');
    if (!shouldReset) {
      return;
    }

    setMovementMap({});
    closeOverlay();
  }, [closeOverlay, setMovementMap]);

  useEffect(() => {
    if (!selectedStudent) return;

    const handleMouseDown = (event: MouseEvent) => {
      const target = event.target as Node;
      if (overlayRef.current?.contains(target)) return;
      if (extraRef.current?.contains(target)) return;
      if ((target as HTMLElement).closest('.seat')) return;
      closeOverlay();
    };

    document.addEventListener('mousedown', handleMouseDown);
    return () => document.removeEventListener('mousedown', handleMouseDown);
  }, [selectedStudent, closeOverlay]);

  useEffect(() => {
    if (!selectedStudent) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        closeOverlay();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [selectedStudent, closeOverlay]);

  // 모달이 열려있을 때 body 스크롤 방지
  useEffect(() => {
    if (!selectedStudent) return;

    const originalStyle = window.getComputedStyle(document.body).overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      document.body.style.overflow = originalStyle;
    };
  }, [selectedStudent]);

  return (
    <div id="app">
      <TopBar banner={bannerConfig} now={now} currentSlot={currentSlot ?? undefined} progress={slotProgress} />

      <main className="dashboard" aria-label="교실 모니터링 대시보드">
        <section className="dashboard-main">
          <SeatGrid
            students={students}
            movementMap={movementMap}
            onSelect={handleSeatSelect}
            total={totalStudents}
            present={presentCount}
            absent={absentCount}
          />
        </section>

        <aside className="dashboard-side">
          <MovementPanel
            movementMap={movementMap}
            students={students}
            mainLocations={mainLocations}
            extraLocations={extraLocations}
          />
          <Gallery images={galleryImages} intervalMs={galleryIntervalMs} />
        </aside>
      </main>

      <MovementOverlay
        ref={overlayRef}
        student={selectedStudent}
        position={overlayPosition}
        mainLocations={mainLocationsForOverlay}
        onSelect={handleLocationSelect}
      />

      <MovementExtraPanel
        ref={extraRef}
        open={Boolean(selectedStudent && isExtraOpen)}
        position={extraPosition}
        extraLocations={extraLocations}
        onSelect={handleExtraLocationSelect}
      />

      <button
        type="button"
        className="reset-button"
        onClick={handleResetMovement}
        aria-label="이동한 학생들을 초기화"
      >
        초기화
      </button>
    </div>
  );
}



