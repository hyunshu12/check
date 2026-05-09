import { memo, useEffect, useState } from 'react';
import { reasons } from '../config/reasons';
import { Student } from '../types';

interface MovementModalProps {
  student: Student | null;
  currentLocation?: string;
  onSelect: (locationOrFreeText: string) => void;
  onReturn: () => void;
  onClose: () => void;
}

export const MovementModal = memo(function MovementModal({
  student,
  currentLocation,
  onSelect,
  onReturn,
  onClose
}: MovementModalProps) {
  const isOpen = Boolean(student);
  const [showEtcForm, setShowEtcForm] = useState(false);
  const [etcText, setEtcText] = useState('');

  useEffect(() => {
    if (!student) {
      setShowEtcForm(false);
      setEtcText('');
    }
  }, [student]);

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

          <div className="movement-modal__body">
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
          </div>
        </section>
      ) : null}
    </div>
  );
});
