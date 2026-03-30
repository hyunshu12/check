import { Student } from '../types';

interface MovementModalProps {
  student: Student | null;
  currentLocation?: string;
  mainLocations: string[];
  extraLocations: string[];
  showExtraLocations: boolean;
  onSelect: (location: string) => void;
  onReturn: () => void;
  onClose: () => void;
}

export function MovementModal({
  student,
  currentLocation,
  mainLocations,
  extraLocations,
  showExtraLocations,
  onSelect,
  onReturn,
  onClose
}: MovementModalProps) {
  const isOpen = Boolean(student);

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
              {mainLocations.map((location) => (
                <button
                  key={location}
                  type="button"
                  className={`movement-modal__quick${
                    location === '기타' && showExtraLocations ? ' is-active' : ''
                  }`}
                  onClick={() => onSelect(location)}
                >
                  {location}
                </button>
              ))}
            </div>

            {showExtraLocations ? (
              <div className="movement-modal__extras">
                <div className="movement-modal__extras-grid">
                  {extraLocations.map((location) => (
                    <button
                      key={location}
                      type="button"
                      className="movement-modal__extra"
                      onClick={() => onSelect(location)}
                    >
                      {location}
                    </button>
                  ))}
                </div>
              </div>
            ) : null}
          </div>
        </section>
      ) : null}
    </div>
  );
}
