import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { DashboardHero } from './components/DashboardHero';
import { Gallery } from './components/Gallery';
import { MovementModal } from './components/MovementOverlay';
import { ReasonBoard } from './components/ReasonBoard';
import { SeatMinimap } from './components/SeatMinimap';
import { galleryImages, galleryIntervalMs, TOTAL_STUDENTS } from './config/appSettings';
import { reasons, reasonForLocation } from './config/reasons';
import { students } from './config/students';
import { usePersistentState } from './hooks/usePersistentState';
import { MovementMap, MovementRecord, Student } from './types';
import { upsertMovement } from './utils/movement';

const MOVEMENT_STORAGE_KEY = 'movementMap';
const RETURN_DROP_KEY = '__present';

export default function App() {
  const [movementMap, setMovementMap] = usePersistentState<MovementMap>(MOVEMENT_STORAGE_KEY, {});
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const selectedStudentRef = useRef<Student | null>(null);
  useEffect(() => {
    selectedStudentRef.current = selectedStudent;
  }, [selectedStudent]);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isFullscreenSupported, setIsFullscreenSupported] = useState(true);

  const [dragHakbun, setDragHakbun] = useState<string | null>(null);
  const [hoverKey, setHoverKey] = useState<string | null>(null);

  const movementMapRef = useRef(movementMap);
  useEffect(() => {
    movementMapRef.current = movementMap;
  }, [movementMap]);

  const totalStudents = TOTAL_STUDENTS && TOTAL_STUDENTS > 0 ? TOTAL_STUDENTS : students.length;

  const { movedCount, absentCount } = useMemo(() => {
    let moved = 0;
    let absent = 0;
    students.forEach((student) => {
      const movement = movementMap[student.hakbun];
      const location = movement?.location;
      if (!location) return;
      moved += 1;
      if (reasonForLocation(location).isAbsent) absent += 1;
    });
    return { movedCount: moved, absentCount: absent };
  }, [movementMap]);

  const presentCount = Math.max(totalStudents - movedCount, 0);

  const selectedMovement = selectedStudent ? movementMap[selectedStudent.hakbun] : undefined;

  const closeModal = useCallback(() => {
    setSelectedStudent(null);
  }, []);

  const openStudentModal = useCallback((student: Student) => {
    setSelectedStudent(student);
  }, []);

  const applyMovement = useCallback(
    (student: Student, location: string) => {
      if (location === '복귀') {
        setMovementMap((prev) => upsertMovement(prev, student.hakbun, null));
        closeModal();
        return;
      }

      const record: MovementRecord = {
        location,
        timestamp: Date.now()
      };

      setMovementMap((prev) => upsertMovement(prev, student.hakbun, record));
      closeModal();
    },
    [closeModal, setMovementMap]
  );

  const handleLocationSelect = useCallback(
    (locationOrFreeText: string) => {
      const student = selectedStudentRef.current;
      if (!student) return;
      applyMovement(student, locationOrFreeText);
    },
    [applyMovement]
  );

  const handleReturnStudent = useCallback(
    (student: Student) => {
      setMovementMap((prev) => upsertMovement(prev, student.hakbun, null));
      if (selectedStudentRef.current?.hakbun === student.hakbun) {
        closeModal();
      }
    },
    [closeModal, setMovementMap]
  );

  const handleModalReturn = useCallback(() => {
    const student = selectedStudentRef.current;
    if (!student) return;
    handleReturnStudent(student);
  }, [handleReturnStudent]);

  const handleResetMovement = useCallback(() => {
    if (!movedCount) return;
    if (!window.confirm('모든 이동 기록을 초기화할까요?')) return;
    setMovementMap({});
    closeModal();
  }, [closeModal, movedCount, setMovementMap]);

  const handleToggleFullscreen = useCallback(() => {
    if (!isFullscreenSupported && !document.fullscreenElement) return;
    if (document.fullscreenElement) {
      void document.exitFullscreen().catch(() => undefined);
      return;
    }
    void document.documentElement.requestFullscreen().catch(() => undefined);
  }, [isFullscreenSupported]);

  const assignReason = useCallback(
    (hakbun: string, reasonKey: string) => {
      const student = students.find((s) => s.hakbun === hakbun);
      if (!student) return;

      if (reasonKey === RETURN_DROP_KEY) {
        setMovementMap((prev) => upsertMovement(prev, student.hakbun, null));
        return;
      }

      const reason = reasons.find((r) => r.key === reasonKey);
      if (!reason) return;

      const current = movementMapRef.current[hakbun];
      if (current && reasonForLocation(current.location).key === reason.key) return;

      setMovementMap((prev) =>
        upsertMovement(prev, student.hakbun, {
          location: reason.label,
          timestamp: Date.now()
        })
      );
    },
    [setMovementMap]
  );

  const onDragStartItem = useCallback(
    (event: React.DragEvent<HTMLElement>, hakbun: string) => {
      event.dataTransfer.effectAllowed = 'move';
      event.dataTransfer.setData('text/hakbun', hakbun);
      setDragHakbun(hakbun);
    },
    []
  );

  const onDragEndItem = useCallback(() => {
    setDragHakbun(null);
    setHoverKey(null);
  }, []);

  const onDragOverReason = useCallback((reasonKey: string) => {
    setHoverKey(reasonKey);
  }, []);

  const onDragLeaveReason = useCallback((reasonKey: string) => {
    setHoverKey((current) => (current === reasonKey ? null : current));
  }, []);

  const onDropReason = useCallback(
    (event: React.DragEvent<HTMLElement>, reasonKey: string) => {
      event.preventDefault();
      const hakbun = event.dataTransfer.getData('text/hakbun') || dragHakbun;
      if (hakbun) assignReason(hakbun, reasonKey);
      setDragHakbun(null);
      setHoverKey(null);
    },
    [assignReason, dragHakbun]
  );

  const onMinimapDragOver = useCallback(() => {
    setHoverKey(RETURN_DROP_KEY);
  }, []);

  const onMinimapDragLeave = useCallback(() => {
    setHoverKey((current) => (current === RETURN_DROP_KEY ? null : current));
  }, []);

  const onMinimapDrop = useCallback(
    (event: React.DragEvent<HTMLElement>) => {
      event.preventDefault();
      const hakbun = event.dataTransfer.getData('text/hakbun') || dragHakbun;
      if (hakbun) assignReason(hakbun, RETURN_DROP_KEY);
      setDragHakbun(null);
      setHoverKey(null);
    },
    [assignReason, dragHakbun]
  );

  useEffect(() => {
    if (!selectedStudent) return;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') closeModal();
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [closeModal, selectedStudent]);

  useEffect(() => {
    const syncFullscreenState = () => {
      setIsFullscreen(Boolean(document.fullscreenElement));
      setIsFullscreenSupported(
        document.fullscreenEnabled || 'requestFullscreen' in document.documentElement
      );
    };
    syncFullscreenState();
    document.addEventListener('fullscreenchange', syncFullscreenState);
    return () => document.removeEventListener('fullscreenchange', syncFullscreenState);
  }, []);

  useEffect(() => {
    const IDLE_MS = 60_000;
    let timerId: number | null = null;

    const scrollToTop = () => {
      const scroller = document.scrollingElement ?? document.documentElement;
      if (scroller.scrollTop > 0 || window.scrollY > 0) {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    };

    const reset = () => {
      if (timerId !== null) window.clearTimeout(timerId);
      timerId = window.setTimeout(scrollToTop, IDLE_MS);
    };

    const events: Array<keyof WindowEventMap> = [
      'pointerdown',
      'touchstart',
      'keydown',
      'wheel',
      'scroll'
    ];
    events.forEach((event) => window.addEventListener(event, reset, { passive: true }));
    reset();

    return () => {
      if (timerId !== null) window.clearTimeout(timerId);
      events.forEach((event) => window.removeEventListener(event, reset));
    };
  }, []);

  useEffect(() => {
    if (!import.meta.env.DEV) return;
    if (typeof performance === 'undefined') return;
    const sample = () => {
      const memInfo = (performance as unknown as { memory?: { usedJSHeapSize: number; totalJSHeapSize: number; jsHeapSizeLimit: number } }).memory;
      if (memInfo) {
        const used = (memInfo.usedJSHeapSize / 1048576).toFixed(1);
        const total = (memInfo.totalJSHeapSize / 1048576).toFixed(1);
        const limit = Math.round(memInfo.jsHeapSizeLimit / 1048576);
        console.info(`[heap-probe] used=${used}MB total=${total}MB limit=${limit}MB at ${new Date().toISOString()}`);
      }
      const measureFn = (performance as unknown as { measureUserAgentSpecificMemory?: () => Promise<{ bytes: number }> }).measureUserAgentSpecificMemory;
      if (typeof measureFn === 'function') {
        measureFn.call(performance).then((r) => {
          const mb = (r.bytes / 1048576).toFixed(1);
          console.info(`[heap-probe] uaSpecificMemory=${mb}MB`);
        }).catch(() => undefined);
      }
    };
    sample();
    const id = window.setInterval(sample, 30 * 60 * 1000);
    return () => window.clearInterval(id);
  }, []);

  return (
    <div id="app" className="va-root">
      <DashboardHero
        total={totalStudents}
        present={presentCount}
        moved={movedCount}
        absent={absentCount}
      />

      <main className="va-main" aria-label="사유 중심 대시보드">
        <ReasonBoard
          students={students}
          movementMap={movementMap}
          dragHakbun={dragHakbun}
          hoverKey={hoverKey}
          onDragOverReason={onDragOverReason}
          onDragLeaveReason={onDragLeaveReason}
          onDropReason={onDropReason}
          onDragStartItem={onDragStartItem}
          onDragEndItem={onDragEndItem}
          onSelectStudent={openStudentModal}
        />

        <aside className="va-side">
          <SeatMinimap
            students={students}
            movementMap={movementMap}
            dragHakbun={dragHakbun}
            isDropHover={hoverKey === RETURN_DROP_KEY}
            onDragStart={onDragStartItem}
            onDragEnd={onDragEndItem}
            onDragOver={onMinimapDragOver}
            onDragLeave={onMinimapDragLeave}
            onDrop={onMinimapDrop}
            onSelectStudent={openStudentModal}
          />
          <Gallery images={galleryImages} intervalMs={galleryIntervalMs} />
        </aside>
      </main>

      <div className="dashboard-actions">
        <button
          type="button"
          className="dashboard-action-button"
          onClick={handleToggleFullscreen}
          disabled={!isFullscreenSupported && !isFullscreen}
          aria-label={isFullscreen ? '전체 화면 종료' : '전체 화면'}
          aria-pressed={isFullscreen}
        >
          {isFullscreen ? '전체 화면 해제' : '전체 화면'}
        </button>
        <button
          type="button"
          className="dashboard-action-button dashboard-reset"
          onClick={handleResetMovement}
          disabled={!movedCount}
          aria-label="모든 이동 기록 전체 초기화"
        >
          전체 초기화
        </button>
      </div>

      <MovementModal
        student={selectedStudent}
        currentLocation={selectedMovement?.location}
        onSelect={handleLocationSelect}
        onReturn={handleModalReturn}
        onClose={closeModal}
      />
    </div>
  );
}
