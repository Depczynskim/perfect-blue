export type ParsedLocation = {
  latitude: number;
  longitude: number;
} | null;

/**
 * Parse WKB (Well-Known Binary) hex string from PostGIS
 * Format: 0101000020E6100000[16 hex chars for longitude][16 hex chars for latitude]
 * - 01 = little endian
 * - 01000020 = Point with SRID
 * - E6100000 = SRID 4326 (little endian)
 * - Next 8 bytes = longitude (double, little endian)
 * - Next 8 bytes = latitude (double, little endian)
 */
function parseWKBHex(hex: string): ParsedLocation {
  // WKB Point with SRID 4326 starts with this prefix (little endian)
  // 01 (byte order) + 01000020 (point with SRID) + E6100000 (SRID 4326)
  if (!hex.match(/^0101000020E6100000/i)) {
    return null;
  }

  try {
    // Extract coordinate bytes (after the 18-char prefix)
    const coordsHex = hex.slice(18);
    if (coordsHex.length < 32) return null;

    const lonHex = coordsHex.slice(0, 16);
    const latHex = coordsHex.slice(16, 32);

    const longitude = parseDoubleLE(lonHex);
    const latitude = parseDoubleLE(latHex);

    if (Number.isFinite(latitude) && Number.isFinite(longitude)) {
      return { latitude, longitude };
    }
  } catch {
    return null;
  }

  return null;
}

/**
 * Parse a little-endian double from hex string
 */
function parseDoubleLE(hex: string): number {
  const bytes = new Uint8Array(8);
  for (let i = 0; i < 8; i++) {
    bytes[i] = parseInt(hex.slice(i * 2, i * 2 + 2), 16);
  }
  const buffer = bytes.buffer;
  const view = new DataView(buffer);
  return view.getFloat64(0, true); // true = little endian
}

export function parseLocation(location: unknown): ParsedLocation {
  if (!location) {
    return null;
  }

  if (typeof location === 'string') {
    // Try WKB hex format first (PostGIS returns this by default)
    if (location.match(/^[0-9A-Fa-f]+$/) && location.length >= 50) {
      const wkbResult = parseWKBHex(location);
      if (wkbResult) return wkbResult;
    }

    // Try JSON (Supabase may return GeoJSON as string)
    try {
      const parsed = JSON.parse(location);
      return parseLocation(parsed);
    } catch {
      // Fall through to WKT parsing
    }

    // Try WKT format: POINT(longitude latitude)
    const match = location.match(/POINT\s*\(\s*([-0-9.]+)\s+([-0-9.]+)\s*\)/i);
    if (match) {
      const longitude = Number(match[1]);
      const latitude = Number(match[2]);
      if (Number.isFinite(latitude) && Number.isFinite(longitude)) {
        return { latitude, longitude };
      }
    }

    return null;
  }

  if (typeof location === 'object') {
    const coords = (location as { coordinates?: unknown }).coordinates;
    if (Array.isArray(coords) && coords.length === 2) {
      const longitude = Number(coords[0]);
      const latitude = Number(coords[1]);
      if (Number.isFinite(latitude) && Number.isFinite(longitude)) {
        return { latitude, longitude };
      }
    }
  }

  return null;
}
