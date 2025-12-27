import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { memo, useMemo } from 'react';
export const StatsDashboard = memo(function StatsDashboard({ movementMap, students, totalStudents }) {
    const studentMap = useMemo(() => {
        const map = new Map();
        students.forEach((student) => map.set(student.hakbun, student));
        return map;
    }, [students]);
    // 장소별 통계
    const locationStats = useMemo(() => {
        const statsMap = new Map();
        Object.entries(movementMap).forEach(([hakbun, record]) => {
            if (!record?.location)
                return;
            const student = studentMap.get(hakbun);
            if (!student)
                return;
            if (!statsMap.has(record.location)) {
                statsMap.set(record.location, { count: 0, students: [] });
            }
            const stat = statsMap.get(record.location);
            stat.count++;
            stat.students.push(student);
        });
        return Array.from(statsMap.entries())
            .map(([location, data]) => ({ location, ...data }))
            .sort((a, b) => b.count - a.count);
    }, [movementMap, studentMap]);
    // 전체 통계
    const stats = useMemo(() => {
        const movedCount = Object.values(movementMap).filter((r) => r?.location).length;
        const presentCount = totalStudents - movedCount;
        const movedPercentage = totalStudents > 0 ? (movedCount / totalStudents) * 100 : 0;
        const presentPercentage = totalStudents > 0 ? (presentCount / totalStudents) * 100 : 0;
        // 평균 이동 시간 계산 (timestamp가 있는 경우)
        const movementsWithTime = Object.values(movementMap).filter((r) => r?.location && r.timestamp);
        const now = Date.now();
        const avgDuration = movementsWithTime.length > 0
            ? movementsWithTime.reduce((sum, r) => {
                const duration = now - (r.timestamp || now);
                return sum + duration;
            }, 0) / movementsWithTime.length
            : 0;
        return {
            movedCount,
            presentCount,
            movedPercentage,
            presentPercentage,
            avgDuration: Math.round(avgDuration / 1000 / 60), // 분 단위
            topLocation: locationStats[0]?.location || null,
            topLocationCount: locationStats[0]?.count || 0,
        };
    }, [movementMap, totalStudents, locationStats]);
    // 시간대별 통계 (현재 시간 기준)
    const timeStats = useMemo(() => {
        const hour = new Date().getHours();
        const period = hour < 9 ? '오전' : hour < 12 ? '오전' : hour < 18 ? '오후' : '저녁';
        return {
            currentHour: hour,
            period,
        };
    }, []);
    const formatDuration = (minutes) => {
        if (minutes < 1)
            return '< 1분';
        if (minutes < 60)
            return `${Math.round(minutes)}분`;
        const hours = Math.floor(minutes / 60);
        const mins = Math.round(minutes % 60);
        return mins > 0 ? `${hours}시간 ${mins}분` : `${hours}시간`;
    };
    return (_jsxs("section", { className: "card stats-card", "aria-labelledby": "stats-title", children: [_jsx("header", { className: "card-header", children: _jsxs("div", { children: [_jsx("h2", { className: "card-title", id: "stats-title", children: "\uD1B5\uACC4 \uB300\uC2DC\uBCF4\uB4DC" }), _jsx("p", { className: "card-subtitle", children: "\uD604\uC7AC \uC774\uB3D9 \uD604\uD669\uC744 \uD55C\uB208\uC5D0 \uD655\uC778\uD558\uC138\uC694." })] }) }), _jsxs("div", { className: "stats-content", children: [_jsxs("div", { className: "stats-grid", children: [_jsxs("div", { className: "stat-card primary", children: [_jsx("div", { className: "stat-card-icon", children: "\uD83D\uDC65" }), _jsxs("div", { className: "stat-card-content", children: [_jsx("div", { className: "stat-card-label", children: "\uD604\uC6D0" }), _jsx("div", { className: "stat-card-value", children: stats.presentCount }), _jsxs("div", { className: "stat-card-subvalue", children: ["/", totalStudents, "\uBA85"] })] }), _jsx("div", { className: "stat-card-progress", children: _jsx("div", { className: "stat-card-progress-fill", style: { width: `${stats.presentPercentage}%` } }) })] }), _jsxs("div", { className: "stat-card secondary", children: [_jsx("div", { className: "stat-card-icon", children: "\uD83D\uDEB6" }), _jsxs("div", { className: "stat-card-content", children: [_jsx("div", { className: "stat-card-label", children: "\uC774\uB3D9 \uC911" }), _jsx("div", { className: "stat-card-value", children: stats.movedCount }), _jsxs("div", { className: "stat-card-subvalue", children: [stats.movedPercentage.toFixed(1), "%"] })] }), _jsx("div", { className: "stat-card-progress", children: _jsx("div", { className: "stat-card-progress-fill secondary", style: { width: `${stats.movedPercentage}%` } }) })] }), stats.topLocation && (_jsxs("div", { className: "stat-card accent", children: [_jsx("div", { className: "stat-card-icon", children: "\uD83D\uDCCD" }), _jsxs("div", { className: "stat-card-content", children: [_jsx("div", { className: "stat-card-label", children: "\uC778\uAE30 \uC7A5\uC18C" }), _jsx("div", { className: "stat-card-value-small", children: stats.topLocation }), _jsxs("div", { className: "stat-card-subvalue", children: [stats.topLocationCount, "\uBA85"] })] })] })), stats.avgDuration > 0 && (_jsxs("div", { className: "stat-card info", children: [_jsx("div", { className: "stat-card-icon", children: "\u23F1\uFE0F" }), _jsxs("div", { className: "stat-card-content", children: [_jsx("div", { className: "stat-card-label", children: "\uD3C9\uADE0 \uC774\uB3D9 \uC2DC\uAC04" }), _jsx("div", { className: "stat-card-value-small", children: formatDuration(stats.avgDuration) })] })] }))] }), locationStats.length > 0 && (_jsxs("div", { className: "location-stats-section", children: [_jsx("h3", { className: "location-stats-title", children: "\uC7A5\uC18C\uBCC4 \uBD84\uD3EC" }), _jsx("div", { className: "location-stats-list", children: locationStats.slice(0, 5).map((stat) => {
                                    const percentage = totalStudents > 0 ? (stat.count / totalStudents) * 100 : 0;
                                    return (_jsxs("div", { className: "location-stat-item", children: [_jsxs("div", { className: "location-stat-header", children: [_jsx("span", { className: "location-stat-name", children: stat.location }), _jsxs("span", { className: "location-stat-count", children: [stat.count, "\uBA85"] })] }), _jsx("div", { className: "location-stat-bar", children: _jsx("div", { className: "location-stat-bar-fill", style: { width: `${percentage}%` } }) }), _jsxs("div", { className: "location-stat-percentage", children: [percentage.toFixed(1), "%"] })] }, stat.location));
                                }) })] })), locationStats.length === 0 && (_jsx("div", { className: "empty-state subtle", children: "\uD604\uC7AC \uC774\uB3D9 \uC911\uC778 \uD559\uC0DD\uC774 \uC5C6\uC2B5\uB2C8\uB2E4." }))] })] }));
});
