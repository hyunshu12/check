import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent
} from '@dnd-kit/core';

import { DashboardHero } from './components/DashboardHero';
import { Gallery } from './components/Gallery';
import { MovementModal } from './components/MovementOverlay';
import { ReasonBoard } from './components/ReasonBoard';
import { SeatMinimap } from './components/SeatMinimap';
import { DragGhost } from './components/DragGhost';
import { galleryImages, galleryIntervalMs, TOTAL_STUDENTS } from './config/appSettings';
import { reasons, reasonForLocation } from './config/reasons';
import { students } from './config/students';
import { usePersistentState } from './hooks/usePersistentState';
import { MovementMap, MovementRecord, RoutineMap, RoutineRule, Student } from './types';
import { upsertMovement } from './utils/movement';
import { getCurrentScheduleSlot, getScheduleForWeekday, slotIdOf } from './utils/schedule';

const MOVEMENT_STORAGE_KEY = 'movementMap';
const ROUTINE_STORAGE_KEY = 'routineMap';
const ROUTINE_LAST_APPLIED_KEY = 'routineLastApplied';
const ROUTINE_SUPPRESS_DATE_KEY = 'routineSuppressDate';
const RETURN_DROP_KEY = '__present';
const ROUTINE_FALLBACK_INTERVAL_MS = 30 * 60 * 1000;

const generateRuleId = () => {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  return `r_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
};

const dateKeyOf = (date: Date) =>
  `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`;

const isRoutineRule = (value: unknown): value is RoutineRule => {
  if (!value || typeof value !== 'object') return false;
  const r = value as Record<string, unknown>;
  return (
    typeof r.id === 'string' &&
    typeof r.weekday === 'number' &&
    r.weekday >= 0 &&
    r.weekday <= 6 &&
    typeof r.slotId === 'string' &&
    typeof r.location === 'string'
  );
};

export default function App() {
  const [movementMap, setMovementMap] = usePersistentState<MovementMap>(MOVEMENT_STORAGE_KEY, {});
  const [routineMap, setRoutineMap] = usePersistentState<RoutineMap>(ROUTINE_STORAGE_KEY, {});
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const selectedStudentRef = useRef<Student | null>(null);
  useEffect(() => {
    selectedStudentRef.current = selectedStudent;
  }, [selectedStudent]);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isFullscreenSupported, setIsFullscreenSupported] = useState(true);

  const [dragHakbun, setDragHakbun] = useState<string | null>(null);
  const [modalEtcOpen, setModalEtcOpen] = useState(false);

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
    setModalEtcOpen(false);
  }, []);

  const openStudentModal = useCallback((student: Student) => {
    setSelectedStudent(student);
    setModalEtcOpen(false);
  }, []);

  const openStudentModalForEtc = useCallback((student: Student) => {
    setSelectedStudent(student);
    setModalEtcOpen(true);
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

  const handleAddRoutine = useCallback(
    (hakbun: string, weekday: number, slotId: string, location: string) => {
      setRoutineMap((prev) => {
        const existing = prev[hakbun] ?? [];
        const duplicate = existing.find(
          (r) => r.weekday === weekday && r.slotId === slotId
        );
        const filtered = duplicate ? existing.filter((r) => r.id !== duplicate.id) : existing;
        const next: RoutineRule = { id: generateRuleId(), weekday, slotId, location };
        return { ...prev, [hakbun]: [...filtered, next] };
      });
    },
    [setRoutineMap]
  );

  const handleDeleteRoutine = useCallback(
    (hakbun: string, ruleId: string) => {
      setRoutineMap((prev) => {
        const existing = prev[hakbun] ?? [];
        const filtered = existing.filter((r) => r.id !== ruleId);
        const clone = { ...prev };
        if (filtered.length === 0) {
          delete clone[hakbun];
        } else {
          clone[hakbun] = filtered;
        }
        return clone;
      });
    },
    [setRoutineMap]
  );

  const selectedRoutineRules = useMemo(
    () => (selectedStudent ? routineMap[selectedStudent.hakbun] ?? [] : []),
    [routineMap, selectedStudent]
  );

  const routineMapRef = useRef(routineMap);
  useEffect(() => {
    routineMapRef.current = routineMap;
  }, [routineMap]);

  useEffect(() => {
    const validHakbun = new Set(students.map((s) => s.hakbun));
    setRoutineMap((prev) => {
      if (!prev || typeof prev !== 'object' || Array.isArray(prev)) return {};
      let dirty = false;
      const next: RoutineMap = {};
      Object.entries(prev).forEach(([hakbun, rules]) => {
        if (!validHakbun.has(hakbun) || !Array.isArray(rules)) {
          dirty = true;
          return;
        }
        const cleaned = rules.filter(isRoutineRule);
        if (cleaned.length !== rules.length) dirty = true;
        if (cleaned.length === 0) {
          dirty = true;
          return;
        }
        next[hakbun] = cleaned;
      });
      return dirty ? next : prev;
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleResetMovement = useCallback(() => {
    if (!movedCount) return;
    if (!window.confirm('모든 이동 기록을 초기화하고 오늘은 루틴 자동 적용을 멈출까요?')) return;
    setMovementMap({});
    try {
      window.localStorage.setItem(ROUTINE_SUPPRESS_DATE_KEY, dateKeyOf(new Date()));
    } catch {
      /* ignore */
    }
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

      // 이미 같은 사유 그룹에 속해 있으면 아무 것도 하지 않음
      // (특히 기타 그룹 안에서 다른 학생 위로 드롭해도 자유입력 모달이 뜨지 않도록).
      const current = movementMapRef.current[hakbun];
      if (current && reasonForLocation(current.location).key === reason.key) return;

      // 기타로 드롭한 경우: 모달을 띄워 자유 사유를 입력받는다.
      if (reason.isEtc) {
        openStudentModalForEtc(student);
        return;
      }

      setMovementMap((prev) =>
        upsertMovement(prev, student.hakbun, {
          location: reason.label,
          timestamp: Date.now()
        })
      );
    },
    [openStudentModalForEtc, setMovementMap]
  );

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(TouchSensor, { activationConstraint: { distance: 8 } })
  );

  const extractHakbun = (activeId: string) => {
    const idx = activeId.indexOf(':');
    return idx >= 0 ? activeId.slice(idx + 1) : activeId;
  };

  const handleDragStart = useCallback((event: DragStartEvent) => {
    setDragHakbun(extractHakbun(String(event.active.id)));
  }, []);

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      setDragHakbun(null);
      const hakbun = extractHakbun(String(event.active.id));
      const overId = event.over?.id;
      // 어떤 droppable 에도 떨어뜨리지 않은 경우 → 좌석 미니맵으로 복귀
      if (overId == null) {
        assignReason(hakbun, RETURN_DROP_KEY);
        return;
      }
      const overStr = String(overId);
      if (overStr === 'seat-return') {
        assignReason(hakbun, RETURN_DROP_KEY);
        return;
      }
      if (overStr.startsWith('reason:')) {
        assignReason(hakbun, overStr.slice('reason:'.length));
      }
    },
    [assignReason]
  );

  const handleDragCancel = useCallback(() => {
    setDragHakbun(null);
  }, []);

  const draggedStudent = useMemo(
    () => (dragHakbun ? students.find((s) => s.hakbun === dragHakbun) ?? null : null),
    [dragHakbun]
  );
  const draggedDetail = dragHakbun ? movementMap[dragHakbun]?.location : undefined;

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

  // 페이지 가시성이 hidden 으로 전환될 때 드래그 진행 상태를 정리.
  // dnd-kit 이 자동으로 onDragCancel 을 발동하지 않을 수 있어 잔여 하이라이트가 남는 것 방지.
  useEffect(() => {
    const handleVisibility = () => {
      if (document.hidden) setDragHakbun(null);
    };
    document.addEventListener('visibilitychange', handleVisibility);
    return () => document.removeEventListener('visibilitychange', handleVisibility);
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

    // pointermove/touchmove 도 포함해야 드래그 중 60초 idle 자동 스크롤 방지
    const events: Array<keyof WindowEventMap> = [
      'pointerdown',
      'pointermove',
      'touchstart',
      'touchmove',
      'keydown',
      'wheel'
    ];
    events.forEach((event) => window.addEventListener(event, reset, { passive: true }));
    reset();

    return () => {
      if (timerId !== null) window.clearTimeout(timerId);
      events.forEach((event) => window.removeEventListener(event, reset));
    };
  }, []);

  useEffect(() => {
    const readKey = (k: string) => {
      try {
        return window.localStorage.getItem(k);
      } catch {
        return null;
      }
    };
    const writeKey = (k: string, v: string) => {
      try {
        window.localStorage.setItem(k, v);
      } catch {
        /* ignore */
      }
    };

    let lastAppliedKey = readKey(ROUTINE_LAST_APPLIED_KEY);
    let timeoutId: number | null = null;
    let cancelled = false;

    const tick = () => {
      if (cancelled) return;
      const now = new Date();
      const ts = now.getTime();
      const weekday = now.getDay();
      const schedule = getScheduleForWeekday(weekday);
      const slot = getCurrentScheduleSlot(schedule, now);
      const todayKey = dateKeyOf(now);
      const suppressDate = readKey(ROUTINE_SUPPRESS_DATE_KEY);
      if (suppressDate && suppressDate !== todayKey) {
        try {
          window.localStorage.removeItem(ROUTINE_SUPPRESS_DATE_KEY);
        } catch {
          /* ignore */
        }
      }

      if (slot && suppressDate !== todayKey) {
        const slotKey = `${todayKey}|${weekday}|${slotIdOf(slot)}`;
        if (lastAppliedKey !== slotKey) {
          lastAppliedKey = slotKey;
          writeKey(ROUTINE_LAST_APPLIED_KEY, slotKey);

          const targetSlotId = slotIdOf(slot);
          const routines = routineMapRef.current;

          setMovementMap((prev) => {
            let next = prev;
            let changed = false;
            students.forEach((student) => {
              const rules = routines[student.hakbun];
              if (!rules || rules.length === 0) return;
              const match = rules.find((r) => r.weekday === weekday && r.slotId === targetSlotId);
              if (!match) return;
              const current = next[student.hakbun];
              // 비어 있을 때만 루틴을 자동 적용. 사용자가 수동으로 다른 사유(또는
              // 같은 사유)로 바꿔둔 경우 그대로 보존해 덮어쓰지 않는다.
              // (좌석 복귀는 upsertMovement 가 entry 자체를 delete 하므로
              //  current 가 undefined → 정상 적용된다.)
              if (current?.location) return;
              next = upsertMovement(next, student.hakbun, {
                location: match.location,
                timestamp: ts
              });
              changed = true;
            });
            return changed ? next : prev;
          });
        }
      }

      // Schedule next wakeup at the next slot boundary (start or end), or fallback.
      const minutesNow = now.getHours() * 60 + now.getMinutes();
      let nextBoundaryMin: number | null = null;
      schedule.forEach((s) => {
        const start = s.start.hour * 60 + s.start.minute;
        const end = s.end.hour * 60 + s.end.minute;
        [start, end].forEach((m) => {
          if (m > minutesNow && (nextBoundaryMin === null || m < nextBoundaryMin)) {
            nextBoundaryMin = m;
          }
        });
      });

      let delayMs: number;
      if (nextBoundaryMin !== null) {
        const target = new Date(now);
        target.setHours(Math.floor(nextBoundaryMin / 60), nextBoundaryMin % 60, 0, 200);
        delayMs = Math.max(target.getTime() - ts, 1000);
      } else {
        delayMs = ROUTINE_FALLBACK_INTERVAL_MS;
      }

      timeoutId = window.setTimeout(tick, delayMs);
    };

    tick();
    return () => {
      cancelled = true;
      if (timeoutId !== null) window.clearTimeout(timeoutId);
    };
  }, [setMovementMap]);

  useEffect(() => {
    if (!import.meta.env.DEV) return;
    if (typeof performance === 'undefined') return;
    let cancelled = false;
    const sample = () => {
      if (cancelled) return;
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
          if (cancelled) return;
          const mb = (r.bytes / 1048576).toFixed(1);
          console.info(`[heap-probe] uaSpecificMemory=${mb}MB`);
        }).catch(() => undefined);
      }
    };
    sample();
    const id = window.setInterval(sample, 6 * 60 * 60 * 1000);
    return () => {
      cancelled = true;
      window.clearInterval(id);
    };
  }, []);

  return (
    <div id="app" className="va-root">
      <DashboardHero
        total={totalStudents}
        present={presentCount}
        moved={movedCount}
        absent={absentCount}
      />

      <DndContext
        sensors={sensors}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
        onDragCancel={handleDragCancel}
      >
        <main className="va-main" aria-label="사유 중심 대시보드">
          <ReasonBoard
            students={students}
            movementMap={movementMap}
            dragHakbun={dragHakbun}
            onSelectStudent={openStudentModal}
          />

          <aside className="va-side">
            <SeatMinimap
              students={students}
              movementMap={movementMap}
              dragHakbun={dragHakbun}
              onSelectStudent={openStudentModal}
            />
            <Gallery images={galleryImages} intervalMs={galleryIntervalMs} />
          </aside>
        </main>

        <DragOverlay dropAnimation={null}>
          {draggedStudent ? (
            <DragGhost student={draggedStudent} detail={draggedDetail} />
          ) : null}
        </DragOverlay>
      </DndContext>

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
        initialEtcOpen={modalEtcOpen}
        routineRules={selectedRoutineRules}
        onSelect={handleLocationSelect}
        onReturn={handleModalReturn}
        onClose={closeModal}
        onAddRoutine={handleAddRoutine}
        onDeleteRoutine={handleDeleteRoutine}
      />
    </div>
  );
}
