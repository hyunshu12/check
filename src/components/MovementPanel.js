import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { memo, useMemo } from 'react';
export const MovementPanel = memo(function MovementPanel({ movementMap, students, mainLocations, extraLocations }) {
    const studentMap = useMemo(() => {
        const entries = new Map();
        students.forEach((student) => entries.set(student.hakbun, student));
        return entries;
    }, [students]);
    const groups = useMemo(() => {
        const extraSet = new Set(extraLocations);
        const result = new Map();
        Object.entries(movementMap).forEach(([hakbun, record]) => {
            const student = studentMap.get(hakbun);
            if (!student || !record || !record.location)
                return;
            const groupKey = extraSet.has(record.location) ? '기타' : record.location;
            const label = groupKey === '기타' ? '기타' : record.location;
            if (!result.has(groupKey)) {
                result.set(groupKey, { label, items: [] });
            }
            result.get(groupKey)?.items.push({ student, location: record.location });
        });
        return result;
    }, [extraLocations, movementMap, studentMap]);
    const orderedGroupKeys = useMemo(() => {
        const keys = [];
        mainLocations.forEach((location) => {
            if (location === '기타')
                return;
            if (groups.has(location)) {
                keys.push(location);
            }
        });
        const otherGroups = Array.from(groups.keys()).filter((key) => key !== '기타' && !mainLocations.includes(key));
        otherGroups.sort();
        keys.push(...otherGroups);
        if (groups.has('기타')) {
            keys.push('기타');
        }
        return keys;
    }, [groups, mainLocations]);
    return (_jsxs("section", { className: "card movement-card", "aria-labelledby": "movement-title", children: [_jsxs("header", { className: "card-header", children: [_jsxs("div", { children: [_jsx("h2", { className: "card-title", id: "movement-title", children: "\uC774\uB3D9 \uD604\uD669" }), _jsx("p", { className: "card-subtitle", children: "\uD604\uC7AC \uC774\uB3D9 \uC911\uC778 \uD559\uC0DD\uB4E4\uC758 \uC704\uCE58\uB97C \uD55C\uB208\uC5D0 \uD655\uC778\uD558\uC138\uC694." })] }), _jsx("span", { className: "badge subtle", children: groups.size ? `${orderedGroupKeys.length}개 위치` : '이동 없음' })] }), orderedGroupKeys.length === 0 ? (_jsx("div", { className: "empty-state", children: "\uD604\uC7AC \uC774\uB3D9 \uC911\uC778 \uD559\uC0DD\uC774 \uC5C6\uC2B5\uB2C8\uB2E4." })) : (_jsx("div", { className: "movement-groups", children: orderedGroupKeys.map((groupKey) => {
                    const group = groups.get(groupKey);
                    if (!group)
                        return null;
                    const sortedItems = [...group.items].sort((a, b) => a.student.name.localeCompare(b.student.name, 'ko-KR'));
                    return (_jsxs("article", { className: "movement-group", children: [_jsxs("div", { className: "group-header", children: [_jsx("span", { className: "group-label", children: group.label }), _jsxs("span", { className: "badge", children: [sortedItems.length, "\uBA85"] })] }), _jsx("div", { className: "group-body", children: sortedItems.map(({ student, location }) => {
                                    const detail = groupKey === '기타' ? location : '—';
                                    return (_jsxs("div", { className: "movement-chip", title: location, children: [_jsx("span", { className: "name", children: student.name }), _jsx("span", { className: "detail", children: detail })] }, student.hakbun));
                                }) })] }, groupKey));
                }) }))] }));
});
