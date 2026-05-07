'use client';

import { useState, useRef, useCallback } from 'react';
import { useTranslations } from 'next-intl';
import { prepareImageVersions, isAllowedImageType, MAX_FILE_SIZE } from '@/lib/image';
import { createClient } from '@/lib/supabase/client';

// Nazwa bucketu w Supabase Storage
const STORAGE_BUCKET = 'listing-photos';

interface PhotoItem {
  id: string;
  file: File;
  preview: string;
  status: 'pending' | 'processing' | 'uploading' | 'done' | 'error';
  progress: number;
  error?: string;
  // Wersja display (pełne zdjęcie)
  displayPath?: string;
  displayUrl?: string;
  // Wersja thumb (miniatura)
  thumbPath?: string;
  thumbUrl?: string;
}

interface PhotoUploadProps {
  listingId?: string | null;
  maxPhotos?: number;
  onPhotosChange?: (photos: PhotoItem[]) => void;
  className?: string;
}

export default function PhotoUpload({
  listingId = null,
  maxPhotos = 10,
  onPhotosChange,
  className = '',
}: PhotoUploadProps) {
  const t = useTranslations('photoUpload');
  const [photos, setPhotos] = useState<PhotoItem[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const maxSizeMb = Math.round(MAX_FILE_SIZE / 1024 / 1024);

  // Update parent component when photos change
  const updatePhotos = useCallback((newPhotos: PhotoItem[]) => {
    setPhotos(newPhotos);
    onPhotosChange?.(newPhotos);
  }, [onPhotosChange]);

  /**
   * Dodaje pliki do listy
   */
  const addFiles = useCallback(async (files: FileList | File[]) => {
    const fileArray = Array.from(files);
    
    // Sprawdzenie limitu
    const remainingSlots = maxPhotos - photos.length;
    if (remainingSlots <= 0) {
      alert(t('maxPhotosReached', { max: maxPhotos }));
      return;
    }

    const filesToAdd = fileArray.slice(0, remainingSlots);

    // Tworzenie obiektów PhotoItem
    const newPhotos: PhotoItem[] = filesToAdd
      .filter(file => isAllowedImageType(file))
      .map(file => ({
        id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        file,
        preview: URL.createObjectURL(file),
        status: 'pending' as const,
        progress: 0,
      }));

    if (newPhotos.length < filesToAdd.length) {
      alert(t('invalidFileType'));
    }

    const updatedPhotos = [...photos, ...newPhotos];
    updatePhotos(updatedPhotos);

    // Automatyczne przetwarzanie i upload
    for (const photo of newPhotos) {
      await processAndUpload(photo.id, updatedPhotos);
    }
  }, [photos, maxPhotos, updatePhotos]);

  /**
   * Przetwarza i uploaduje pojedyncze zdjęcie do Supabase Storage
   * Generuje dwie wersje: display (pełne) i thumb (miniatura)
   */
  const processAndUpload = async (photoId: string, currentPhotos: PhotoItem[]) => {
    const photoIndex = currentPhotos.findIndex(p => p.id === photoId);
    if (photoIndex === -1) return;

    const photo = currentPhotos[photoIndex];

    // Status: przetwarzanie
    const updateStatus = (updates: Partial<PhotoItem>) => {
      setPhotos(prev => {
        const newPhotos = [...prev];
        const idx = newPhotos.findIndex(p => p.id === photoId);
        if (idx !== -1) {
          newPhotos[idx] = { ...newPhotos[idx], ...updates };
          onPhotosChange?.(newPhotos);
        }
        return newPhotos;
      });
    };

    try {
      updateStatus({ status: 'processing', progress: 10 });

      // Przetwarzanie obrazu - generowanie obu wersji (display + thumb)
      const versions = await prepareImageVersions(photo.file);
      updateStatus({ progress: 30 });

      // Inicjalizacja klienta Supabase
      const supabase = createClient();

      // Sprawdzenie autoryzacji
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (authError || !user) {
        throw new Error(t('loginRequired'));
      }

      updateStatus({ status: 'uploading', progress: 40 });

      // Generowanie ścieżek plików
      // Struktura: {user_id}/{uuid}_display.webp i {user_id}/{uuid}_thumb.webp
      const uuid = crypto.randomUUID();
      const displayPath = `${user.id}/${uuid}_display.webp`;
      const thumbPath = `${user.id}/${uuid}_thumb.webp`;

      // Upload wersji DISPLAY
      const { error: displayError } = await supabase.storage
        .from(STORAGE_BUCKET)
        .upload(displayPath, versions.display.blob, {
          contentType: 'image/webp',
          cacheControl: '3600',
          upsert: false,
        });

      if (displayError) {
        throw new Error(displayError.message || t('uploadFailed'));
      }

      updateStatus({ progress: 60 });

      // Upload wersji THUMB
      const { error: thumbError } = await supabase.storage
        .from(STORAGE_BUCKET)
        .upload(thumbPath, versions.thumb.blob, {
          contentType: 'image/webp',
          cacheControl: '3600',
          upsert: false,
        });

      if (thumbError) {
        throw new Error(thumbError.message || t('uploadFailed'));
      }

      updateStatus({ progress: 80 });

      // Pobierz publiczne URL
      const { data: displayUrlData } = supabase.storage
        .from(STORAGE_BUCKET)
        .getPublicUrl(displayPath);

      const { data: thumbUrlData } = supabase.storage
        .from(STORAGE_BUCKET)
        .getPublicUrl(thumbPath);

      updateStatus({ progress: 90 });

      // Sukces
      updateStatus({
        status: 'done',
        progress: 100,
        displayPath: displayPath,
        displayUrl: displayUrlData?.publicUrl || undefined,
        thumbPath: thumbPath,
        thumbUrl: thumbUrlData?.publicUrl || undefined,
      });

    } catch (error) {
      console.error('Error uploading photo:', error);
      updateStatus({
        status: 'error',
        error: error instanceof Error ? error.message : t('uploadFailed'),
      });
    }
  };

  /**
   * Usuwa zdjęcie z listy
   */
  const removePhoto = (photoId: string) => {
    setPhotos(prev => {
      const photo = prev.find(p => p.id === photoId);
      if (photo?.preview) {
        URL.revokeObjectURL(photo.preview);
      }
      const newPhotos = prev.filter(p => p.id !== photoId);
      onPhotosChange?.(newPhotos);
      return newPhotos;
    });
  };

  /**
   * Ponowna próba uploadu
   */
  const retryUpload = (photoId: string) => {
    const photo = photos.find(p => p.id === photoId);
    if (photo) {
      processAndUpload(photoId, photos);
    }
  };

  // Drag & Drop handlers
  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const files = e.dataTransfer.files;
    if (files.length > 0) {
      addFiles(files);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      addFiles(files);
    }
    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const getStatusColor = (status: PhotoItem['status']) => {
    switch (status) {
      case 'done': return 'bg-green-500';
      case 'error': return 'bg-red-500';
      case 'processing': return 'bg-blue-500';
      case 'uploading': return 'bg-primary-500';
      default: return 'bg-gray-400';
    }
  };

  const getStatusText = (status: PhotoItem['status']): string => {
    switch (status) {
      case 'done': return t('status.done');
      case 'error': return t('status.error');
      case 'processing': return t('status.processing');
      case 'uploading': return t('status.uploading');
      default: return t('status.pending');
    }
  };

  return (
    <div className={className}>
      {/* Dropzone */}
      <div
        className={`
          relative border-2 border-dashed rounded-lg p-8 text-center transition-colors cursor-pointer
          ${isDragging 
            ? 'border-primary-500 bg-primary-50' 
            : 'border-gray-300 hover:border-primary-400 hover:bg-gray-50'
          }
          ${photos.length >= maxPhotos ? 'opacity-50 pointer-events-none' : ''}
        `}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/gif,image/webp"
          multiple
          className="hidden"
          onChange={handleFileSelect}
          disabled={photos.length >= maxPhotos}
        />

        <svg
          className="mx-auto h-12 w-12 text-gray-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
          />
        </svg>

        <p className="mt-4 text-sm text-gray-600">
          <span className="font-semibold text-primary-600">{t('clickToSelect')}</span>
          {` ${t('orDrag')}`}
        </p>
        <p className="mt-1 text-xs text-gray-500">
          {t('fileTypes', { size: maxSizeMb, max: maxPhotos })}
        </p>
        <p className="mt-1 text-xs text-gray-500">
          {t('added', { current: photos.length, max: maxPhotos })}
        </p>
      </div>

      {/* Preview grid */}
      {photos.length > 0 && (
        <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {photos.map((photo, index) => (
            <div
              key={photo.id}
              className="relative aspect-square rounded-lg overflow-hidden bg-gray-100 group"
            >
              {/* Image preview - użyj thumb jeśli dostępny */}
              <img
                src={photo.thumbUrl || photo.preview}
                alt={`Photo ${index + 1}`}
                className="w-full h-full object-cover"
              />

              {/* Overlay with status/progress */}
              {photo.status !== 'done' && (
                <div className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center">
                  {photo.status === 'error' ? (
                    <>
                      <svg className="w-8 h-8 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span className="text-xs text-white mt-1 px-2 text-center">{photo.error}</span>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          retryUpload(photo.id);
                        }}
                        className="mt-2 text-xs text-white underline hover:text-primary-300"
                      >
                        {t('retry')}
                      </button>
                    </>
                  ) : (
                    <>
                      <div className="w-16 bg-gray-700 rounded-full h-2 overflow-hidden">
                        <div
                          className={`h-full transition-all duration-300 ${getStatusColor(photo.status)}`}
                          style={{ width: `${photo.progress}%` }}
                        />
                      </div>
                      <span className="text-xs text-white mt-2">
                        {getStatusText(photo.status)}
                      </span>
                    </>
                  )}
                </div>
              )}

              {/* Done checkmark */}
              {photo.status === 'done' && (
                <div className="absolute top-2 left-2 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                  <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
              )}

              {/* Order number */}
              <div className="absolute bottom-2 left-2 w-6 h-6 bg-black/70 rounded-full flex items-center justify-center">
                <span className="text-xs text-white font-medium">{index + 1}</span>
              </div>

              {/* Remove button */}
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  removePhoto(photo.id);
                }}
                className="absolute top-2 right-2 w-7 h-7 bg-red-500 hover:bg-red-600 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export type { PhotoItem };
