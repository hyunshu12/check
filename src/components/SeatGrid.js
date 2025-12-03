import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { SPECIAL_STUDENTS, GHOST_STUDENT_HAKBUN } from '../config/appSettings';
export function SeatGrid({ students, movementMap, onSelect, total, present, absent }) {
    const activeStudents = students.filter((student) => student.hakbun !== GHOST_STUDENT_HAKBUN);
    const layout = [];
    activeStudents.forEach((student, index) => {
        layout.push(student);
        if (index === 13) {
            layout.push(null);
        }
    });
    return (_jsxs("section", { className: "card seat-card", "aria-labelledby": "seats-title", children: [_jsxs("header", { className: "card-header seat-header", children: [_jsxs("div", { children: [_jsx("h2", { className: "card-title", id: "seats-title", children: "\uC88C\uC11D \uBC30\uCE58" }), _jsx("p", { className: "card-subtitle", children: "\uD559\uC0DD\uC744 \uC120\uD0DD\uD558\uBA74 \uC774\uB3D9 \uC704\uCE58\uB97C \uBE60\uB974\uAC8C \uAE30\uB85D\uD560 \uC218 \uC788\uC2B5\uB2C8\uB2E4." })] }), _jsxs("div", { className: "seat-stats", "aria-label": "\uCD9C\uACB0 \uD604\uD669", children: [_jsxs("div", { className: "stat-chip total", children: [_jsx("span", { className: "label", children: "\uCD1D\uC6D0" }), _jsx("span", { className: "value", children: total })] }), _jsxs("div", { className: "stat-chip present", children: [_jsx("span", { className: "label", children: "\uD604\uC6D0" }), _jsx("span", { className: "value", children: present })] }), _jsxs("div", { className: "stat-chip absent", children: [_jsx("span", { className: "label", children: "\uACB0\uC6D0" }), _jsx("span", { className: "value", children: absent })] })] })] }), _jsx("div", { className: "seat-grid", children: layout.map((student, index) => {
                    const row = Math.floor(index / 6);
                    if (!student) {
                        return _jsx("div", { className: "seat empty", "aria-hidden": "true" }, `empty-${index}`);
                    }
                    const movement = movementMap[student.hakbun];
                    const moved = Boolean(movement && movement.location);
                    const special = SPECIAL_STUDENTS.includes(student.name);
                    const handleClick = (event) => {
                        const rect = event.currentTarget.getBoundingClientRect();
                        onSelect(student, rect);
                    };
                    return (_jsxs("button", { className: `seat ${moved ? 'moved' : ''} ${special ? 'special' : ''}`.trim(), "data-row": row, type: "button", onClick: handleClick, children: [_jsx("div", { className: "student-name", children: student.name }), _jsx("small", { children: student.hakbun })] }, student.hakbun));
                }) })] }));
}
