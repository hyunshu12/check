import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { forwardRef } from 'react';
const sectorClassNames = ['s-1', 's-2', 's-3', 's-4', 's-5', 's-6', 's-7', 's-8', 's-9'];
export const MovementOverlay = forwardRef(function MovementOverlay({ student, position, mainLocations, onSelect }, ref) {
    const visible = Boolean(student && position);
    return (_jsx("div", { ref: ref, className: `bearing-overlay ${visible ? 'visible' : ''}`, style: visible && position ? { top: position.top, left: position.left } : undefined, children: _jsxs("div", { className: "bearing-container", children: [student ? (_jsxs("div", { className: "center-name", role: "button", tabIndex: 0, onClick: () => onSelect('복귀'), onKeyDown: (event) => {
                        if (event.key === 'Enter' || event.key === ' ') {
                            event.preventDefault();
                            onSelect('복귀');
                        }
                    }, children: [student.name, _jsx("br", {}), _jsx("small", { children: "\uBCF5\uADC0" })] })) : null, student
                    ? mainLocations.map((location, index) => (_jsx("div", { className: `sector ${sectorClassNames[index] ?? ''}`.trim(), role: "button", tabIndex: 0, onClick: () => onSelect(location), onKeyDown: (event) => {
                            if (event.key === 'Enter' || event.key === ' ') {
                                event.preventDefault();
                                onSelect(location);
                            }
                        }, children: location }, location)))
                    : null] }) }));
});
export const MovementExtraPanel = forwardRef(function MovementExtraPanel({ open, position, extraLocations, onSelect }, ref) {
    return (_jsxs("div", { ref: ref, className: `bearing-side ${open ? 'visible' : ''}`, style: open && position ? { top: position.top, left: position.left } : undefined, children: [_jsx("div", { className: "side-title", children: "\uC138\uBD80 \uC704\uCE58 \uC120\uD0DD" }), _jsx("div", { className: "etc-list", children: extraLocations.map((location) => (_jsx("button", { type: "button", className: "etc-chip", onClick: () => onSelect(location), children: location }, location))) })] }));
});
