export function formatListingLocation(parts: {
  city?: string | null;
  zone?: string | null;
  address_text?: string | null;
}): string | null {
  const cityZone = [parts.city, parts.zone]
    .map((value) => value?.trim())
    .filter((value): value is string => !!value);

  if (cityZone.length > 0) {
    return cityZone.join(', ');
  }

  const address = parts.address_text?.trim();
  return address && address.length > 0 ? address : null;
}
