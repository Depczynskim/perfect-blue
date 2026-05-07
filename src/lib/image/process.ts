/**
 * Utilities do przetwarzania obrazów po stronie klienta.
 * 
 * - Konwersja do WebP
 * - Resize do maksymalnych wymiarów
 * - Kompresja
 */

// Wymiary dla wersji DISPLAY (do strony szczegółów)
export const DISPLAY_MAX_WIDTH = 1600;
export const DISPLAY_MAX_HEIGHT = 1200;
export const DISPLAY_QUALITY = 0.85;

// Wymiary dla wersji THUMB (miniatury na listach)
export const THUMB_MAX_WIDTH = 600;
export const THUMB_MAX_HEIGHT = 450; // ratio 4:3
export const THUMB_QUALITY = 0.75;

// Kompatybilność wsteczna
export const MAX_IMAGE_WIDTH = DISPLAY_MAX_WIDTH;
export const MAX_IMAGE_HEIGHT = DISPLAY_MAX_HEIGHT;
export const WEBP_QUALITY = DISPLAY_QUALITY;

// Maksymalny rozmiar pliku po kompresji (5MB)
export const MAX_FILE_SIZE = 5 * 1024 * 1024;

// Dozwolone typy wejściowe
export const ALLOWED_INPUT_TYPES = [
  'image/jpeg',
  'image/png',
  'image/gif',
  'image/webp',
  'image/bmp',
];

/**
 * Sprawdza czy typ pliku jest dozwolony
 */
export function isAllowedImageType(file: File): boolean {
  return ALLOWED_INPUT_TYPES.includes(file.type);
}

/**
 * Ładuje obraz z pliku File
 */
function loadImage(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error('Failed to load image'));
    img.src = URL.createObjectURL(file);
  });
}

/**
 * Oblicza nowe wymiary zachowując proporcje
 */
function calculateDimensions(
  width: number,
  height: number,
  maxWidth: number,
  maxHeight: number
): { width: number; height: number } {
  // Jeśli obraz jest mniejszy niż max, nie zmieniamy
  if (width <= maxWidth && height <= maxHeight) {
    return { width, height };
  }

  const aspectRatio = width / height;

  if (width > maxWidth) {
    width = maxWidth;
    height = Math.round(width / aspectRatio);
  }

  if (height > maxHeight) {
    height = maxHeight;
    width = Math.round(height * aspectRatio);
  }

  return { width, height };
}

/**
 * Konwertuje obraz do WebP z resize
 */
export async function processImage(
  file: File,
  options: {
    maxWidth?: number;
    maxHeight?: number;
    quality?: number;
  } = {}
): Promise<{ blob: Blob; width: number; height: number }> {
  const {
    maxWidth = MAX_IMAGE_WIDTH,
    maxHeight = MAX_IMAGE_HEIGHT,
    quality = WEBP_QUALITY,
  } = options;

  // Ładowanie obrazu
  const img = await loadImage(file);
  
  // Obliczanie wymiarów
  const { width, height } = calculateDimensions(
    img.naturalWidth,
    img.naturalHeight,
    maxWidth,
    maxHeight
  );

  // Tworzenie canvas
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;

  const ctx = canvas.getContext('2d');
  if (!ctx) {
    throw new Error('Failed to get canvas context');
  }

  // Rysowanie obrazu
  ctx.drawImage(img, 0, 0, width, height);

  // Zwalnianie object URL
  URL.revokeObjectURL(img.src);

  // Konwersja do WebP
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (!blob) {
          reject(new Error('Failed to convert image to WebP'));
          return;
        }
        resolve({ blob, width, height });
      },
      'image/webp',
      quality
    );
  });
}

/**
 * Generuje miniaturkę
 */
export async function generateThumbnail(
  file: File,
  size: number = 200
): Promise<Blob> {
  const { blob } = await processImage(file, {
    maxWidth: size,
    maxHeight: size,
    quality: 0.7,
  });
  return blob;
}

/**
 * Waliduje plik przed uploadem
 */
export function validateImage(file: File): { valid: boolean; error?: string } {
  // Sprawdzenie typu
  if (!isAllowedImageType(file)) {
    return {
      valid: false,
      error: `Niedozwolony typ pliku. Dozwolone: JPEG, PNG, GIF, WebP, BMP`,
    };
  }

  // Sprawdzenie rozmiaru (przed kompresją - limit 50MB)
  if (file.size > 50 * 1024 * 1024) {
    return {
      valid: false,
      error: 'Plik jest zbyt duży (max 50MB przed kompresją)',
    };
  }

  return { valid: true };
}

/**
 * Przetwarza obraz i zwraca gotowy do uploadu (kompatybilność wsteczna)
 */
export async function prepareImageForUpload(
  file: File
): Promise<{
  blob: Blob;
  width: number;
  height: number;
  fileName: string;
  contentType: string;
}> {
  // Walidacja
  const validation = validateImage(file);
  if (!validation.valid) {
    throw new Error(validation.error);
  }

  // Przetwarzanie
  const { blob, width, height } = await processImage(file);

  // Sprawdzenie rozmiaru po kompresji
  if (blob.size > MAX_FILE_SIZE) {
    throw new Error(
      `Plik po kompresji jest zbyt duży (${(blob.size / 1024 / 1024).toFixed(1)}MB, max ${MAX_FILE_SIZE / 1024 / 1024}MB)`
    );
  }

  // Nazwa pliku z rozszerzeniem .webp
  const baseName = file.name.replace(/\.[^/.]+$/, '');
  const fileName = `${baseName}.webp`;

  return {
    blob,
    width,
    height,
    fileName,
    contentType: 'image/webp',
  };
}

/**
 * Wynik przetwarzania obrazu z wersją display i thumb
 */
export interface ProcessedImageSet {
  display: {
    blob: Blob;
    width: number;
    height: number;
  };
  thumb: {
    blob: Blob;
    width: number;
    height: number;
  };
  contentType: string;
}

/**
 * Przetwarza obraz i generuje dwie wersje: display + thumb
 * - display: do strony szczegółów (max 1600x1200)
 * - thumb: miniatura do list (max 600x450, ratio 4:3)
 */
export async function prepareImageVersions(file: File): Promise<ProcessedImageSet> {
  // Walidacja
  const validation = validateImage(file);
  if (!validation.valid) {
    throw new Error(validation.error);
  }

  // Generowanie wersji DISPLAY
  const display = await processImage(file, {
    maxWidth: DISPLAY_MAX_WIDTH,
    maxHeight: DISPLAY_MAX_HEIGHT,
    quality: DISPLAY_QUALITY,
  });

  // Sprawdzenie rozmiaru display
  if (display.blob.size > MAX_FILE_SIZE) {
    throw new Error(
      `Plik po kompresji jest zbyt duży (${(display.blob.size / 1024 / 1024).toFixed(1)}MB, max ${MAX_FILE_SIZE / 1024 / 1024}MB)`
    );
  }

  // Generowanie wersji THUMB
  const thumb = await processImage(file, {
    maxWidth: THUMB_MAX_WIDTH,
    maxHeight: THUMB_MAX_HEIGHT,
    quality: THUMB_QUALITY,
  });

  return {
    display: {
      blob: display.blob,
      width: display.width,
      height: display.height,
    },
    thumb: {
      blob: thumb.blob,
      width: thumb.width,
      height: thumb.height,
    },
    contentType: 'image/webp',
  };
}

