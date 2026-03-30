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
  const previewIndices = useMemo(() => {
    const previewCount = Math.min(3, validImages.length);
    return Array.from({ length: previewCount }, (_, offset) => (index + offset) % validImages.length);
  }, [index, validImages.length]);

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
      <section className="gallery-panel gallery-panel--single" aria-labelledby="gallery-title">
        <div className="gallery-panel__main gallery-panel__main--empty">
          <div className="gallery-panel__meta">
            <h2 className="gallery-panel__title" id="gallery-title">
              사진을 기다리는 중
            </h2>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className={`gallery-panel${hasMultiple ? '' : ' gallery-panel--single'}`} aria-labelledby="gallery-title">
      <div className="gallery-panel__main">
        <img src={validImages[index]} alt={`갤러리 이미지 ${index + 1}`} className="gallery-panel__main-image" />
        <div className="gallery-panel__main-glow" aria-hidden="true" />

        <div className="gallery-panel__meta">
          <h2 className="gallery-panel__title" id="gallery-title">
            교실 스케치
          </h2>
          <p className="gallery-panel__caption">
            {index + 1} / {validImages.length}
          </p>
        </div>

        {hasMultiple ? (
          <div className="gallery-panel__thumbs" role="tablist" aria-label="갤러리 인디케이터">
            {previewIndices.map((previewIndex) => (
              <button
                key={`${previewIndex}-${validImages[previewIndex]}`}
                type="button"
                role="tab"
                aria-selected={previewIndex === index}
                className={`gallery-thumb${previewIndex === index ? ' is-active' : ''}`}
                onClick={() => {
                  setIndex(previewIndex);
                  resetTimer();
                }}
                aria-label={`${previewIndex + 1}번째 이미지로 이동`}
              >
                <img src={validImages[previewIndex]} alt={`갤러리 미리보기 ${previewIndex + 1}`} />
              </button>
            ))}
          </div>
        ) : null}

        {hasMultiple ? (
          <div className="gallery-panel__controls" role="group" aria-label="갤러리 탐색">
            <button type="button" className="gallery-panel__control" aria-label="이전 이미지" onClick={handlePrev}>
              Prev
            </button>
            <button type="button" className="gallery-panel__control" aria-label="다음 이미지" onClick={handleNext}>
              Next
            </button>
          </div>
        ) : null}
      </div>
    </section>
  );
}
