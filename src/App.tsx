import { useCallback, useEffect, useMemo, useState } from 'react';

import { DashboardHero } from './components/DashboardHero';
import { Gallery } from './components/Gallery';
import { MovementModal } from './components/MovementOverlay';
import { MovementPanel } from './components/MovementPanel';
import { SeatGrid } from './components/SeatGrid';
import { bannerConfig, galleryImages, galleryIntervalMs, TOTAL_STUDENTS } from './config/appSettings';
import { classroomSettings } from './config/classrooms';
import { students } from './config/students';
import { usePersistentState } from './hooks/usePersistentState';
import { MovementMap, MovementRecord, Student } from './types';
import { upsertMovement } from './utils/movement';

const MOVEMENT_STORAGE_KEY = 'movementMap';

export default function App() {
  const [movementMap, setMovementMap] = usePersistentState<MovementMap>(MOVEMENT_STORAGE_KEY, {});
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [showExtraLocations, setShowExtraLocations] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isFullscreenSupported, setIsFullscreenSupported] = useState(true);

  const mainLocations = useMemo(
    () => classroomSettings.main.filter((location) => location.trim().length > 0),
    []
  );
  const extraLocations = useMemo(
    () => [...classroomSettings.extra].sort((a, b) => a.localeCompare(b, 'ko-KR')),
    []
  );
  const modalLocations = useMemo(
    () => mainLocations.filter((location) => location !== '복귀'),
    [mainLocations]
  );

  const totalStudents = TOTAL_STUDENTS && TOTAL_STUDENTS > 0 ? TOTAL_STUDENTS : students.length;

  const movedCount = useMemo(
    () => students.reduce((count, student) => count + (movementMap[student.hakbun]?.location ? 1 : 0), 0),
    [movementMap]
  );

  const presentCount = useMemo(() => Math.max(totalStudents - movedCount, 0), [movedCount, totalStudents]);

  const selectedMovement = selectedStudent ? movementMap[selectedStudent.hakbun] : undefined;

  const closeModal = useCallback(() => {
    setSelectedStudent(null);
    setShowExtraLocations(false);
  }, []);

  const openStudentModal = useCallback((student: Student) => {
    setSelectedStudent(student);
    setShowExtraLocations(false);
  }, []);

  const applyMovement = useCallback((student: Student, location: string) => {
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
  }, [closeModal, setMovementMap]);

  const handleLocationSelect = useCallback((location: string) => {
    if (!selectedStudent) return;
    if (location === '기타') {
      setShowExtraLocations((prev) => !prev);
      return;
    }
    applyMovement(selectedStudent, location);
  }, [applyMovement, selectedStudent]);

  const handleReturnStudent = useCallback((student: Student) => {
    setMovementMap((prev) => upsertMovement(prev, student.hakbun, null));
    if (selectedStudent?.hakbun === student.hakbun) {
      closeModal();
    }
  }, [closeModal, selectedStudent?.hakbun, setMovementMap]);

  const handleResetMovement = useCallback(() => {
    if (!movedCount) return;

    const shouldReset = window.confirm('모든 이동 기록을 초기화할까요?');
    if (!shouldReset) return;

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

  useEffect(() => {
    if (!selectedStudent) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        closeModal();
      }
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

  return (
    <div id="app" className="skrr-app">
      <DashboardHero />

      <main className="skrr-shell" aria-label="교실 모니터링 대시보드">
        <SeatGrid
          students={students}
          movementMap={movementMap}
          total={totalStudents}
          present={presentCount}
          moved={movedCount}
          quote={bannerConfig}
          onSelect={openStudentModal}
          onReturn={handleReturnStudent}
        />

        <div className="dashboard-bottom">
          <MovementPanel
            movementMap={movementMap}
            students={students}
            mainLocations={mainLocations}
            extraLocations={extraLocations}
          />
          <Gallery images={galleryImages} intervalMs={galleryIntervalMs} />
        </div>

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
      </main>

      <MovementModal
        student={selectedStudent}
        currentLocation={selectedMovement?.location}
        mainLocations={modalLocations}
        extraLocations={extraLocations}
        showExtraLocations={showExtraLocations}
        onSelect={handleLocationSelect}
        onReturn={() => {
          if (!selectedStudent) return;
          handleReturnStudent(selectedStudent);
        }}
        onClose={closeModal}
      />
    </div>
  );
}
