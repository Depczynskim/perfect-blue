'use client';

import { useState } from 'react';
import dynamic from 'next/dynamic';
// Dynamiczny import Lightbox (client-only)
const Lightbox = dynamic(() => import('./Lightbox'), { ssr: false });

interface Photo {
  id: string;
  displayUrl: string;
  thumbUrl: string;
}

interface PhotoGalleryProps {
  photos: Photo[];
  title: string;
}

export default function PhotoGallery({ photos, title }: PhotoGalleryProps) {
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);

  const openLightbox = (index: number) => {
    setCurrentIndex(index);
    setLightboxOpen(true);
  };

  if (photos.length === 0) {
    // Placeholder gdy brak zdjęć
    return (
      <div className="bg-gradient-to-br from-primary-100 to-primary-200 rounded-lg h-96 flex items-center justify-center">
        <svg className="w-24 h-24 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
        </svg>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-4">
        {/* Main image — stable-height container prevents layout shift when switching photos.
            aspect-[4/3] matches the max upload bounding box (1600×1200).
            max-h-[480px] caps it on very wide desktops.
            Height is determined by CSS, never by the image's intrinsic dimensions. */}
        <div
          className="relative w-full aspect-[4/3] max-h-[480px] rounded-lg overflow-hidden bg-slate-100 cursor-pointer group"
          onClick={() => openLightbox(currentIndex)}
        >
          {/* absolute inset-0 gives the img an explicit containing block so
              w-full h-full resolves unambiguously — same pattern as the lightbox. */}
          <div className="absolute inset-0">
            <img
              src={photos[currentIndex].displayUrl}
              alt={title}
              className="w-full h-full object-contain"
            />
          </div>
          
          {/* Overlay na hover */}
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center">
            <div className="opacity-0 group-hover:opacity-100 transition-opacity bg-black/50 rounded-full p-4">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
              </svg>
            </div>
          </div>

          {/* Photo count badge */}
          {photos.length > 1 && (
            <div className="absolute bottom-4 right-4 bg-black/70 text-white px-3 py-1 rounded-full text-sm">
              📷 {photos.length}
            </div>
          )}
        </div>
        
        {/* Thumbnail strip — all photos; clicking selects the preview, not opens lightbox */}
        {photos.length > 1 && (
          <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-7 gap-2">
            {photos.slice(0, 7).map((photo, index) => (
              <div
                key={photo.id}
                className={`relative aspect-square rounded-lg overflow-hidden bg-gray-100 cursor-pointer group${
                  index === currentIndex ? ' ring-2 ring-offset-1 ring-primary-500' : ''
                }`}
                onClick={() => setCurrentIndex(index)}
              >
                <img
                  src={photo.thumbUrl}
                  alt={`${title} ${index + 1}`}
                  className="w-full h-full object-cover group-hover:opacity-90 transition-opacity"
                />
                
                {/* "+X more" overlay on the last visible thumbnail when photos exceed 7 */}
                {index === 6 && photos.length > 7 && (
                  <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                    <span className="text-white font-semibold text-lg">
                      +{photos.length - 7}
                    </span>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Lightbox modal */}
      <Lightbox
        images={photos}
        currentIndex={currentIndex}
        isOpen={lightboxOpen}
        onClose={() => setLightboxOpen(false)}
        onNavigate={setCurrentIndex}
      />
    </>
  );
}

