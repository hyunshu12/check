import { memo, useCallback, useEffect, useMemo, useRef, useState } from 'react';

import type { GalleryImageAsset, GalleryImageVariant } from '../types';

interface GalleryProps {
  images: GalleryImageAsset[];
  intervalMs: number;
}

const renderPicture = (
  variant: GalleryImageVariant,
  alt: string,
  imageClassName: string,
  pictureClassName: string,
  options?: {
    loading?: 'eager' | 'lazy';
    fetchPriority?: 'high' | 'auto' | 'low';
    decoding?: 'async' | 'sync' | 'auto';
    sizes?: string;
  }
) => {
  const webpSrcSet = variant.webpSrc
    ? variant.webpSrcSmall && variant.widthSmall
      ? `${variant.webpSrcSmall} ${variant.widthSmall}w, ${variant.webpSrc} ${variant.width}w`
      : variant.webpSrc
    : null;
  return (
    <picture className={pictureClassName}>
      {webpSrcSet ? (
        <source srcSet={webpSrcSet} sizes={options?.sizes} type="image/webp" />
      ) : null}
      <img
        src={variant.jpegSrc}
        alt={alt}
        className={imageClassName}
        width={variant.width}
        height={variant.height}
        decoding={options?.decoding ?? 'async'}
        loading={options?.loading}
        fetchPriority={options?.fetchPriority}
      />
    </picture>
  );
};

export const Gallery = memo(function Gallery({ images, intervalMs }: GalleryProps) {
  const validImages = useMemo(() => images.filter((image) => image.main?.jpegSrc), [images]);
  const [index, setIndex] = useState(0);
  const timerRef = useRef<number>();
  const preloadLinkRef = useRef<HTMLLinkElement | null>(null);

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

    const start = () => {
      if (timerRef.current) return;
      timerRef.current = window.setInterval(tick, intervalMs);
    };
    const stop = () => {
      if (timerRef.current) {
        window.clearInterval(timerRef.current);
        timerRef.current = undefined;
      }
    };

    if (!document.hidden) {
      start();
    }

    const handleVisibility = () => {
      if (document.hidden) {
        stop();
      } else {
        start();
      }
    };
    document.addEventListener('visibilitychange', handleVisibility);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibility);
      stop();
    };
  }, [intervalMs, validImages.length]);

  useEffect(() => {
    setIndex(0);
  }, [validImages.length]);

  useEffect(() => {
    if (validImages.length < 2) return;
    const nextImage = validImages[(index + 1) % validImages.length];
    const nextWebp = nextImage.main.webpSrc ?? nextImage.main.jpegSrc;

    // Remove the previous preload (Chromium ignores href mutations on existing preload links).
    if (preloadLinkRef.current) {
      preloadLinkRef.current.remove();
      preloadLinkRef.current = null;
    }

    const link = document.createElement('link');
    link.rel = 'preload';
    link.as = 'image';
    link.href = nextWebp;
    if (nextImage.main.webpSrcSmall && nextImage.main.widthSmall) {
      link.setAttribute(
        'imagesrcset',
        `${nextImage.main.webpSrcSmall} ${nextImage.main.widthSmall}w, ${nextImage.main.webpSrc} ${nextImage.main.width}w`
      );
      link.setAttribute('imagesizes', '(max-width: 1024px) 960px, 1600px');
    }
    link.setAttribute('fetchpriority', 'low');
    document.head.appendChild(link);
    preloadLinkRef.current = link;

    return () => {
      if (preloadLinkRef.current === link) {
        link.remove();
        preloadLinkRef.current = null;
      }
    };
  }, [index, validImages]);

  const resetTimer = useCallback(() => {
    if (timerRef.current) {
      window.clearInterval(timerRef.current);
      timerRef.current = undefined;
    }
    if (!validImages.length || document.hidden) return;
    timerRef.current = window.setInterval(() => {
      setIndex((prev) => (prev + 1) % validImages.length);
    }, intervalMs);
  }, [intervalMs, validImages.length]);

  const handlePrev = useCallback(() => {
    if (!validImages.length) return;
    setIndex((prev) => (prev - 1 + validImages.length) % validImages.length);
    resetTimer();
  }, [resetTimer, validImages.length]);

  const handleNext = useCallback(() => {
    if (!validImages.length) return;
    setIndex((prev) => (prev + 1) % validImages.length);
    resetTimer();
  }, [resetTimer, validImages.length]);

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
        {renderPicture(validImages[index].main, `갤러리 이미지 ${index + 1}`, 'gallery-panel__main-image', 'gallery-panel__main-picture', {
          decoding: 'async',
          loading: 'eager',
          fetchPriority: index === 0 ? 'high' : 'auto',
          sizes: '(max-width: 1024px) 960px, 1600px'
        })}
        <div className="gallery-panel__main-glow" aria-hidden="true" />

        <div className="gallery-panel__meta">
          <h2 className="gallery-panel__title" id="gallery-title">
            EB 갤러리
          </h2>
          <p className="gallery-panel__caption">
            {index + 1} / {validImages.length}
          </p>
        </div>

        {hasMultiple ? (
          <div className="gallery-panel__thumbs" role="tablist" aria-label="갤러리 인디케이터">
            {previewIndices.map((previewIndex) => (
              <button
                key={`${previewIndex}-${validImages[previewIndex].id}`}
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
                {renderPicture(
                  validImages[previewIndex].thumb,
                  `갤러리 미리보기 ${previewIndex + 1}`,
                  'gallery-thumb__image',
                  'gallery-thumb__picture',
                  {
                    decoding: 'async',
                    loading: 'lazy',
                    fetchPriority: 'low'
                  }
                )}
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
});
