import { memo, useEffect, useMemo, useState } from 'react';
import { reasons } from '../config/reasons';
import { RoutineRule, Student } from '../types';
import { getScheduleForWeekday, slotIdOf } from '../utils/schedule';

interface MovementModalProps {
  student: Student | null;
  currentLocation?: string;
  initialEtcOpen?: boolean;
  routineRules: RoutineRule[];
  onSelect: (locationOrFreeText: string) => void;
  onReturn: () => void;
  onClose: () => void;
  onAddRoutine: (hakbun: string, weekday: number, slotId: string, location: string) => void;
  onDeleteRoutine: (hakbun: string, ruleId: string) => void;
}

type TabKey = 'movement' | 'routine';

const WEEKDAY_LABELS = ['일', '월', '화', '수', '목', '금', '토'];

export const MovementModal = memo(function MovementModal({
  student,
  currentLocation,
  initialEtcOpen = false,
  routineRules,
  onSelect,
  onReturn,
  onClose,
  onAddRoutine,
  onDeleteRoutine
}: MovementModalProps) {
  const isOpen = Boolean(student);
  const [tab, setTab] = useState<TabKey>('movement');
  const [showEtcForm, setShowEtcForm] = useState(false);
  const [etcText, setEtcText] = useState('');

  const [routineWeekday, setRoutineWeekday] = useState<number>(1);
  const [routineSlotId, setRoutineSlotId] = useState<string>('');
  const [routineLocation, setRoutineLocation] = useState<string>('');

  useEffect(() => {
    if (student) {
      setTab('movement');
      setShowEtcForm(initialEtcOpen);
      setEtcText('');
      const today = new Date().getDay();
      const defaultWeekday = getScheduleForWeekday(today).length > 0 ? today : 1;
      setRoutineWeekday(defaultWeekday);
    } else {
      setShowEtcForm(false);
      setEtcText('');
    }
  }, [student, initialEtcOpen]);

  const slotOptions = useMemo(() => {
    const schedule = getScheduleForWeekday(routineWeekday);
    return schedule.map((slot) => ({
      id: slotIdOf(slot),
      label: `${slot.name} (${String(slot.start.hour).padStart(2, '0')}:${String(slot.start.minute).padStart(2, '0')})`
    }));
  }, [routineWeekday]);

  const locationOptions = useMemo(
    () => reasons.filter((r) => !r.isEtc).map((r) => r.label),
    []
  );

  useEffect(() => {
    if (!slotOptions.length) {
      setRoutineSlotId('');
      return;
    }
    setRoutineSlotId((prev) => (slotOptions.some((s) => s.id === prev) ? prev : slotOptions[0].id));
  }, [slotOptions]);

  useEffect(() => {
    if (!locationOptions.length) return;
    setRoutineLocation((prev) => (locationOptions.includes(prev) ? prev : locationOptions[0]));
  }, [locationOptions]);

  const sortedRoutines = useMemo(() => {
    const slotIndexFor = (weekday: number, slotId: string) => {
      const schedule = getScheduleForWeekday(weekday);
      const idx = schedule.findIndex((slot) => slotIdOf(slot) === slotId);
      return idx < 0 ? Number.POSITIVE_INFINITY : idx;
    };
    return [...routineRules].sort((a, b) => {
      if (a.weekday !== b.weekday) return a.weekday - b.weekday;
      return slotIndexFor(a.weekday, a.slotId) - slotIndexFor(b.weekday, b.slotId);
    });
  }, [routineRules]);

  const slotLabelFor = (weekday: number, slotId: string) => {
    const schedule = getScheduleForWeekday(weekday);
    const slot = schedule.find((s) => slotIdOf(s) === slotId);
    if (!slot) {
      const [name] = slotId.split('|');
      return `${name || slotId} (변경됨)`;
    }
    return `${slot.name} ${String(slot.start.hour).padStart(2, '0')}:${String(slot.start.minute).padStart(2, '0')}`;
  };

  const handleReasonClick = (reasonLabel: string, isEtc: boolean) => {
    if (isEtc) {
      setShowEtcForm((prev) => !prev);
      return;
    }
    onSelect(reasonLabel);
  };

  const handleEtcSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const trimmed = etcText.trim();
    if (!trimmed) return;
    onSelect(trimmed);
  };

  const handleAddRoutine = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!student || !routineSlotId || !routineLocation) return;
    onAddRoutine(student.hakbun, routineWeekday, routineSlotId, routineLocation);
  };

  return (
    <div className={`movement-modal${isOpen ? ' is-open' : ''}`} aria-hidden={!isOpen}>
      <button
        type="button"
        className="movement-modal__backdrop"
        onClick={onClose}
        aria-label="이동 모달 닫기"
        tabIndex={isOpen ? 0 : -1}
      />

      {student ? (
        <section
          className="movement-modal__panel"
          role="dialog"
          aria-modal="true"
          aria-labelledby="movement-modal-title"
        >
          <header className="movement-modal__header">
            <div className="movement-modal__identity">
              <span className="movement-modal__hakbun">{student.hakbun}</span>
              <h2 className="movement-modal__title" id="movement-modal-title">
                {student.name}
              </h2>
              <p className="movement-modal__status">{currentLocation ?? '교실 재실 중'}</p>
            </div>

            <button type="button" className="movement-modal__close" onClick={onClose} aria-label="모달 닫기">
              닫기
            </button>
          </header>

          <div className="movement-modal__tabs" role="tablist">
            <button
              type="button"
              role="tab"
              aria-selected={tab === 'movement'}
              className={`movement-modal__tab${tab === 'movement' ? ' is-active' : ''}`}
              onClick={() => setTab('movement')}
            >
              이동
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={tab === 'routine'}
              className={`movement-modal__tab${tab === 'routine' ? ' is-active' : ''}`}
              onClick={() => setTab('routine')}
            >
              루틴 {routineRules.length ? `(${routineRules.length})` : ''}
            </button>
          </div>

          <div className="movement-modal__body">
            {tab === 'movement' ? (
              <>
                {currentLocation ? (
                  <button type="button" className="movement-modal__return" onClick={onReturn}>
                    돌아가기
                  </button>
                ) : null}

                <div className="movement-modal__quick-grid">
                  {reasons.map((reason) => (
                    <button
                      key={reason.key}
                      type="button"
                      className={`movement-modal__quick${
                        reason.isEtc && showEtcForm ? ' is-active' : ''
                      }`}
                      onClick={() => handleReasonClick(reason.label, Boolean(reason.isEtc))}
                    >
                      {reason.label}
                    </button>
                  ))}
                </div>

                {showEtcForm ? (
                  <form className="movement-modal__etc-form" onSubmit={handleEtcSubmit}>
                    <input
                      className="movement-modal__etc-input"
                      type="text"
                      value={etcText}
                      onChange={(e) => setEtcText(e.target.value)}
                      placeholder="사유를 입력해 주세요"
                      autoFocus
                      maxLength={30}
                    />
                    <button
                      type="submit"
                      className="movement-modal__etc-save"
                      disabled={!etcText.trim()}
                    >
                      저장
                    </button>
                  </form>
                ) : null}
              </>
            ) : (
              <>
                <ul className="routine-list">
                  {sortedRoutines.length === 0 ? (
                    <li className="routine-list__empty">등록된 루틴이 없습니다.</li>
                  ) : (
                    sortedRoutines.map((rule) => (
                      <li key={rule.id} className="routine-list__item">
                        <div className="routine-list__info">
                          <span className="routine-list__weekday">{WEEKDAY_LABELS[rule.weekday]}요일</span>
                          <span className="routine-list__slot">{slotLabelFor(rule.weekday, rule.slotId)}</span>
                          <span className="routine-list__arrow">→</span>
                          <span className="routine-list__location">{rule.location}</span>
                        </div>
                        <button
                          type="button"
                          className="routine-list__delete"
                          onClick={() => onDeleteRoutine(student.hakbun, rule.id)}
                          aria-label="루틴 삭제"
                        >
                          삭제
                        </button>
                      </li>
                    ))
                  )}
                </ul>

                <form className="routine-form" onSubmit={handleAddRoutine}>
                  <div className="routine-form__row">
                    <label className="routine-form__field">
                      <span className="routine-form__label">요일</span>
                      <select
                        className="routine-form__select"
                        value={routineWeekday}
                        onChange={(e) => setRoutineWeekday(Number(e.target.value))}
                      >
                        {WEEKDAY_LABELS.map((label, idx) => (
                          <option key={idx} value={idx} disabled={getScheduleForWeekday(idx).length === 0}>
                            {label}
                          </option>
                        ))}
                      </select>
                    </label>

                    <label className="routine-form__field">
                      <span className="routine-form__label">시간</span>
                      <select
                        className="routine-form__select"
                        value={routineSlotId}
                        onChange={(e) => setRoutineSlotId(e.target.value)}
                        disabled={!slotOptions.length}
                      >
                        {slotOptions.length === 0 ? (
                          <option value="">슬롯 없음</option>
                        ) : (
                          slotOptions.map((opt) => (
                            <option key={opt.id} value={opt.id}>
                              {opt.label}
                            </option>
                          ))
                        )}
                      </select>
                    </label>

                    <label className="routine-form__field">
                      <span className="routine-form__label">사유</span>
                      <select
                        className="routine-form__select"
                        value={routineLocation}
                        onChange={(e) => setRoutineLocation(e.target.value)}
                      >
                        {locationOptions.map((loc) => (
                          <option key={loc} value={loc}>
                            {loc}
                          </option>
                        ))}
                      </select>
                    </label>
                  </div>

                  <button
                    type="submit"
                    className="routine-form__submit"
                    disabled={!routineSlotId || !routineLocation}
                  >
                    루틴 추가
                  </button>
                </form>

                <p className="routine-form__hint">
                  해당 요일·시간이 시작되면 자동으로 사유가 적용됩니다. 같은 시간에 수동으로 다른 사유로 바꾼 경우는 그대로 유지됩니다.
                </p>
              </>
            )}
          </div>
        </section>
      ) : null}
    </div>
  );
});
