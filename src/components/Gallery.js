import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useMemo, useRef, useState } from 'react';
export function Gallery({ images, intervalMs }) {
    const validImages = useMemo(() => images.filter(Boolean), [images]);
    const [index, setIndex] = useState(0);
    const timerRef = useRef();
    const hasMultiple = validImages.length > 1;
    useEffect(() => {
        if (!validImages.length)
            return;
        const tick = () => {
            setIndex((prev) => (prev + 1) % validImages.length);
        };
        timerRef.current = window.setInterval(tick, intervalMs);
        return () => {
            if (timerRef.current)
                window.clearInterval(timerRef.current);
        };
    }, [intervalMs, validImages.length]);
    useEffect(() => {
        setIndex(0);
    }, [validImages.length]);
    const resetTimer = () => {
        if (!timerRef.current)
            return;
        window.clearInterval(timerRef.current);
        timerRef.current = window.setInterval(() => {
            setIndex((prev) => (prev + 1) % validImages.length);
        }, intervalMs);
    };
    const handlePrev = () => {
        if (!validImages.length)
            return;
        setIndex((prev) => (prev - 1 + validImages.length) % validImages.length);
        resetTimer();
    };
    const handleNext = () => {
        if (!validImages.length)
            return;
        setIndex((prev) => (prev + 1) % validImages.length);
        resetTimer();
    };
    if (!validImages.length) {
        return (_jsxs("section", { className: "card gallery-card", "aria-labelledby": "gallery-title", children: [_jsx("header", { className: "card-header", children: _jsxs("div", { children: [_jsx("h2", { className: "card-title", id: "gallery-title", children: "\uC624\uB298\uC758 \uC21C\uAC04" }), _jsx("p", { className: "card-subtitle", children: "\uC0AC\uC9C4\uC744 \uB4F1\uB85D\uD558\uBA74 \uAD50\uC2E4 \uBD84\uC704\uAE30\uB97C \uC0DD\uC0DD\uD558\uAC8C \uBCF4\uC5EC\uB4DC\uB9B4 \uC218 \uC788\uC5B4\uC694." })] }) }), _jsx("div", { className: "gallery-stage gallery-empty", children: _jsx("div", { className: "gallery-placeholder", children: "\uAC24\uB7EC\uB9AC\uC5D0 \uD45C\uC2DC\uD560 \uC774\uBBF8\uC9C0\uB97C \uCD94\uAC00\uD574 \uC8FC\uC138\uC694" }) })] }));
    }
    return (_jsxs("section", { className: "card gallery-card", "aria-labelledby": "gallery-title", children: [_jsxs("header", { className: "card-header", children: [_jsxs("div", { children: [_jsx("h2", { className: "card-title", id: "gallery-title", children: "\uC774\uBE44 \uAC24\uB7EC\uB9AC" }), _jsx("p", { className: "card-subtitle", children: "\uAC24\uB7EC\uB9AC\uAC00 \uC790\uB3D9\uC73C\uB85C \uC0C8 \uC774\uBBF8\uC9C0\uB97C \uC21C\uD658\uD569\uB2C8\uB2E4." })] }), hasMultiple ? (_jsxs("div", { className: "gallery-controls", role: "group", "aria-label": "\uAC24\uB7EC\uB9AC \uD0D0\uC0C9", children: [_jsx("button", { type: "button", className: "ghost-button", "aria-label": "\uC774\uC804 \uC774\uBBF8\uC9C0", onClick: handlePrev, children: "\u2039" }), _jsx("button", { type: "button", className: "ghost-button", "aria-label": "\uB2E4\uC74C \uC774\uBBF8\uC9C0", onClick: handleNext, children: "\u203A" })] })) : null] }), _jsx("div", { className: "gallery-stage", children: validImages.map((src, i) => (_jsx("img", { src: src, alt: `갤러리 이미지 ${i + 1}`, className: `gallery-image ${i === index ? 'is-active' : ''}` }, src))) }), hasMultiple ? (_jsx("div", { className: "gallery-dots", role: "tablist", "aria-label": "\uAC24\uB7EC\uB9AC \uC778\uB514\uCF00\uC774\uD130", children: validImages.map((_, i) => (_jsx("button", { type: "button", role: "tab", "aria-selected": i === index, className: `dot ${i === index ? 'active' : ''}`, onClick: () => {
                        setIndex(i);
                        resetTimer();
                    }, "aria-label": `${i + 1}번째 이미지로 이동` }, i))) })) : null] }));
}
