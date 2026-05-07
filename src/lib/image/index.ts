export {
  processImage,
  generateThumbnail,
  validateImage,
  prepareImageForUpload,
  prepareImageVersions,
  isAllowedImageType,
  // Display (strona szczegółów)
  DISPLAY_MAX_WIDTH,
  DISPLAY_MAX_HEIGHT,
  DISPLAY_QUALITY,
  // Thumb (miniatury)
  THUMB_MAX_WIDTH,
  THUMB_MAX_HEIGHT,
  THUMB_QUALITY,
  // Kompatybilność wsteczna
  MAX_IMAGE_WIDTH,
  MAX_IMAGE_HEIGHT,
  MAX_FILE_SIZE,
  WEBP_QUALITY,
  ALLOWED_INPUT_TYPES,
} from './process';

export type { ProcessedImageSet } from './process';

