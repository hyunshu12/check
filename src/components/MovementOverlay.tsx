import { ForwardedRef, forwardRef } from 'react';

import { Student } from '../types';

interface OverlayPosition {
  top: number;
  left: number;
}

interface MovementOverlayProps {
  student: Student | null;
  position: OverlayPosition | null;
  mainLocations: string[];
  onSelect: (location: string) => void;
}

const sectorClassNames = ['s-1', 's-2', 's-3', 's-4', 's-5', 's-6', 's-7', 's-8', 's-9'];

export const MovementOverlay = forwardRef(function MovementOverlay(
  { student, position, mainLocations, onSelect }: MovementOverlayProps,
  ref: ForwardedRef<HTMLDivElement>
) {
  const visible = Boolean(student && position);

  return (
    <div
      ref={ref}
      className={`bearing-overlay ${visible ? 'visible' : ''}`}
      style={visible && position ? { top: position.top, left: position.left } : undefined}
    >
      <div className="bearing-container">
        {student ? (
          <div
            className="center-name"
            role="button"
            tabIndex={0}
            onClick={() => onSelect('복귀')}
            onKeyDown={(event) => {
              if (event.key === 'Enter' || event.key === ' ') {
                event.preventDefault();
                onSelect('복귀');
              }
            }}
          >
            {student.name}
            <br />
            <small>복귀</small>
          </div>
        ) : null}

        {student
          ? mainLocations.map((location, index) => (
              <div
                key={location}
                className={`sector ${sectorClassNames[index] ?? ''}`.trim()}
                role="button"
                tabIndex={0}
                onClick={() => onSelect(location)}
                onKeyDown={(event) => {
                  if (event.key === 'Enter' || event.key === ' ') {
                    event.preventDefault();
                    onSelect(location);
                  }
                }}
              >
                {location}
              </div>
            ))
          : null}
      </div>
    </div>
  );
});

interface MovementExtraPanelProps {
  open: boolean;
  position: OverlayPosition | null;
  extraLocations: string[];
  onSelect: (location: string) => void;
}

export const MovementExtraPanel = forwardRef(function MovementExtraPanel(
  { open, position, extraLocations, onSelect }: MovementExtraPanelProps,
  ref: ForwardedRef<HTMLDivElement>
) {
  return (
    <div
      ref={ref}
      className={`bearing-side ${open ? 'visible' : ''}`}
      style={open && position ? { top: position.top, left: position.left } : undefined}
    >
      <div className="side-title">세부 위치 선택</div>
      <div className="etc-list">
        {extraLocations.map((location) => (
          <button key={location} type="button" className="etc-chip" onClick={() => onSelect(location)}>
            {location}
          </button>
        ))}
      </div>
    </div>
  );
});


