import { useEffect, useMemo, useRef, useState } from 'react';

interface GalleryProps {
  images: string[];
  intervalMs: number;
}

export function Gallery({ images, intervalMs }: GalleryProps) {
  const validImages = useMemo(() => images.filter(Boolean), [images]);
  const [index, setIndex] = useState(0);
  const timerRef = useRef<number>();

  const hasMultiple = validImages.length > 1;

  useEffect(() => {
    if (!validImages.length) return;

    const tick = () => {
      setIndex((prev) => (prev + 1) % validImages.length);
    };

    timerRef.current = window.setInterval(tick, intervalMs);
    return () => {
      if (timerRef.current) window.clearInterval(timerRef.current);
    };
  }, [intervalMs, validImages.length]);

  useEffect(() => {
    setIndex(0);
  }, [validImages.length]);

  const resetTimer = () => {
    if (!timerRef.current) return;
    window.clearInterval(timerRef.current);
    timerRef.current = window.setInterval(() => {
      setIndex((prev) => (prev + 1) % validImages.length);
    }, intervalMs);
  };

  const handlePrev = () => {
    if (!validImages.length) return;
    setIndex((prev) => (prev - 1 + validImages.length) % validImages.length);
    resetTimer();
  };

  const handleNext = () => {
    if (!validImages.length) return;
    setIndex((prev) => (prev + 1) % validImages.length);
    resetTimer();
  };

  if (!validImages.length) {
    return (
      <section className="card gallery-card" aria-labelledby="gallery-title">
        <header className="card-header">
          <div>
            <h2 className="card-title" id="gallery-title">
              오늘의 순간
            </h2>
            <p className="card-subtitle">사진을 등록하면 교실 분위기를 생생하게 보여드릴 수 있어요.</p>
          </div>
        </header>
        <div className="gallery-stage gallery-empty">
          <div className="gallery-placeholder">갤러리에 표시할 이미지를 추가해 주세요</div>
        </div>
      </section>
    );
  }

  return (
    <section className="card gallery-card" aria-labelledby="gallery-title">
      <header className="card-header">
        <div>
          <h2 className="card-title" id="gallery-title">
            이비 갤러리
          </h2>
          <p className="card-subtitle">갤러리가 자동으로 새 이미지를 순환합니다.</p>
        </div>
        {hasMultiple ? (
          <div className="gallery-controls" role="group" aria-label="갤러리 탐색">
            <button type="button" className="ghost-button" aria-label="이전 이미지" onClick={handlePrev}>
              ‹
            </button>
            <button type="button" className="ghost-button" aria-label="다음 이미지" onClick={handleNext}>
              ›
            </button>
          </div>
        ) : null}
      </header>

      <div className="gallery-stage">
        {validImages.map((src, i) => (
          <img
            key={src}
            src={src}
            alt={`갤러리 이미지 ${i + 1}`}
            className={`gallery-image ${i === index ? 'is-active' : ''}`}
          />
        ))}
      </div>

      {hasMultiple ? (
        <div className="gallery-dots" role="tablist" aria-label="갤러리 인디케이터">
          {validImages.map((_, i) => (
            <button
              key={i}
              type="button"
              role="tab"
              aria-selected={i === index}
              className={`dot ${i === index ? 'active' : ''}`}
              onClick={() => {
                setIndex(i);
                resetTimer();
              }}
              aria-label={`${i + 1}번째 이미지로 이동`}
            />
          ))}
        </div>
      ) : null}
    </section>
  );
}

