'use client';

import { useEffect, useCallback, useRef } from 'react';
import { useTranslations } from 'next-intl';

interface LightboxProps {
  images: { id: string; displayUrl: string; thumbUrl: string }[];
  currentIndex: number;
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (index: number) => void;
}

export default function Lightbox({
  images,
  currentIndex,
  isOpen,
  onClose,
  onNavigate,
}: LightboxProps) {
  const t = useTranslations('common');
  const touchStartX = useRef<number | null>(null);
  const thumbsRef = useRef<HTMLDivElement>(null);

  const hasPrev = currentIndex > 0;
  const hasNext = currentIndex < images.length - 1;

  const goPrev = useCallback(() => {
    if (hasPrev) onNavigate(currentIndex - 1);
  }, [hasPrev, currentIndex, onNavigate]);

  const goNext = useCallback(() => {
    if (hasNext) onNavigate(currentIndex + 1);
  }, [hasNext, currentIndex, onNavigate]);

  // Keyboard navigation
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (!isOpen) return;
      switch (e.key) {
        case 'Escape':
          onClose();
          break;
        case 'ArrowLeft':
          goPrev();
          break;
        case 'ArrowRight':
          goNext();
          break;
      }
    },
    [isOpen, onClose, goPrev, goNext],
  );

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  // Prevent body scroll while open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  // Scroll active thumbnail into view
  useEffect(() => {
    if (!isOpen || !thumbsRef.current) return;
    const active = thumbsRef.current.querySelector('[data-active="true"]');
    if (active) {
      active.scrollIntoView({ inline: 'center', behavior: 'smooth', block: 'nearest' });
    }
  }, [currentIndex, isOpen]);

  // Touch swipe handlers
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null) return;
    const dx = e.changedTouches[0].clientX - touchStartX.current;
    if (Math.abs(dx) > 48) {
      if (dx < 0) goNext();
      else goPrev();
    }
    touchStartX.current = null;
  };

  if (!isOpen || images.length === 0) return null;

  const currentImage = images[currentIndex];

  return (
    // Full-viewport overlay; clicking backdrop closes
    <div
      className="fixed inset-0 z-[2000] bg-black flex flex-col select-none"
      onClick={onClose}
    >
      {/* ── Top bar ─────────────────────────────────────────────── */}
      <div
        className="flex-none flex items-center justify-between px-4 sm:px-6 h-14 bg-black/60 backdrop-blur-sm"
        onClick={(e) => e.stopPropagation()}
      >
        {images.length > 1 ? (
          <span className="text-white/80 text-sm font-medium tabular-nums">
            {currentIndex + 1} / {images.length}
          </span>
        ) : (
          <span />
        )}

        <button
          onClick={onClose}
          className="w-10 h-10 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 transition-colors"
          aria-label={t('close')}
        >
          <svg
            className="w-5 h-5 text-white"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
      </div>

      {/* ── Image area ──────────────────────────────────────────── */}
      {/*
        flex-1 min-h-0: fills remaining height between top bar and thumb strip.
        relative: positioning context for the absolute children below.

        The inner `absolute inset-0` wrapper derives its pixel dimensions
        directly from inset: 0 (i.e. it matches the parent exactly), which
        gives the <img> an unambiguous containing block for w-full / h-full.
        `max-w/h-full` on a bare <img> only caps — it never expands the image
        beyond its intrinsic size. `w-full h-full object-contain` on an <img>
        inside a box with explicit dimensions fills the box and letterboxes the
        image content correctly.

        Padding on the wrapper (px-14/px-20) clears the nav buttons without
        touching the img element itself.
      */}
      <div
        className="flex-1 min-h-0 relative"
        onClick={onClose}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        {/* Prev button — vertically centred via top-1/2 */}
        {hasPrev && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              goPrev();
            }}
            className="absolute left-3 sm:left-5 top-1/2 -translate-y-1/2 z-10 w-11 h-11 sm:w-14 sm:h-14 bg-black/40 hover:bg-black/60 rounded-full flex items-center justify-center transition-colors backdrop-blur-sm"
            aria-label={t('back')}
          >
            <svg
              className="w-6 h-6 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2.5}
                d="M15 19l-7-7 7-7"
              />
            </svg>
          </button>
        )}

        {/*
          absolute inset-0 gives this wrapper explicit width + height derived
          from its positioned parent (the flex-1 div above).
          px-14/px-20 reserves space for the nav buttons; py-4 adds breathing
          room. The <img> then fills this content box with object-contain.
        */}
        <div
          className="absolute inset-0 flex items-center justify-center px-14 sm:px-20 py-4"
          onClick={(e) => e.stopPropagation()}
        >
          <img
            key={currentImage.id}
            src={currentImage.displayUrl}
            alt={`Photo ${currentIndex + 1}`}
            className="w-full h-full object-contain"
            draggable={false}
          />
        </div>

        {/* Next button — vertically centred via top-1/2 */}
        {hasNext && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              goNext();
            }}
            className="absolute right-3 sm:right-5 top-1/2 -translate-y-1/2 z-10 w-11 h-11 sm:w-14 sm:h-14 bg-black/40 hover:bg-black/60 rounded-full flex items-center justify-center transition-colors backdrop-blur-sm"
            aria-label={t('next')}
          >
            <svg
              className="w-6 h-6 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2.5}
                d="M9 5l7 7-7 7"
              />
            </svg>
          </button>
        )}
      </div>

      {/* ── Thumbnail strip ─────────────────────────────────────── */}
      {images.length > 1 && (
        <div
          ref={thumbsRef}
          className="flex-none flex items-center gap-2 px-4 py-3 overflow-x-auto bg-black/60 backdrop-blur-sm"
          onClick={(e) => e.stopPropagation()}
        >
          {images.map((img, idx) => (
            <button
              key={img.id}
              data-active={idx === currentIndex ? 'true' : 'false'}
              onClick={(e) => {
                e.stopPropagation();
                onNavigate(idx);
              }}
              className={[
                'flex-shrink-0 w-14 h-14 rounded overflow-hidden border-2 transition-all',
                idx === currentIndex
                  ? 'border-white opacity-100 scale-105'
                  : 'border-transparent opacity-50 hover:opacity-80',
              ].join(' ')}
            >
              <img
                src={img.thumbUrl}
                alt={`Thumbnail ${idx + 1}`}
                className="w-full h-full object-cover"
                draggable={false}
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
