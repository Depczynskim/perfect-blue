import { buildListingJsonLd } from '@/lib/listings/buildListingJsonLd';
import type { ListingDetailPhoto, ListingDetailRow } from '@/lib/listings/getListingDetailData';

interface ListingJsonLdProps {
  listing: ListingDetailRow;
  photos: ListingDetailPhoto[];
  locale: string;
  id: string;
}

export default function ListingJsonLd({ listing, photos, locale, id }: ListingJsonLdProps) {
  const data = buildListingJsonLd({ listing, photos, locale, id });
  if (!data) {
    return null;
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
