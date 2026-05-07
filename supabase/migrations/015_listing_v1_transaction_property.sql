-- V1 listing schema: transaction_type, property fields, EUR-only currency, integer price, description length.
-- Replaces listings.category with transaction_type.

-- Indexes that reference category
DROP INDEX IF EXISTS public.idx_listings_category;
DROP INDEX IF EXISTS public.idx_listings_status_category;
DROP INDEX IF EXISTS public.idx_listings_status_city_category;

ALTER TABLE public.listings
  ADD COLUMN IF NOT EXISTS transaction_type TEXT,
  ADD COLUMN IF NOT EXISTS property_type TEXT,
  ADD COLUMN IF NOT EXISTS size_m2 NUMERIC,
  ADD COLUMN IF NOT EXISTS rooms NUMERIC,
  ADD COLUMN IF NOT EXISTS bathrooms NUMERIC;

UPDATE public.listings
SET transaction_type = CASE category
  WHEN 'long_term_rent' THEN 'rent_long'
  WHEN 'short_term_rent' THEN 'rent_short'
  WHEN 'sale' THEN 'sale'
  ELSE 'rent_long'
END
WHERE transaction_type IS NULL;

UPDATE public.listings SET transaction_type = 'rent_long' WHERE transaction_type IS NULL;

ALTER TABLE public.listings DROP COLUMN IF EXISTS category;

ALTER TABLE public.listings
  ADD CONSTRAINT listings_transaction_type_check
  CHECK (transaction_type IN ('sale', 'rent_long', 'rent_short'));

ALTER TABLE public.listings ALTER COLUMN transaction_type SET NOT NULL;

UPDATE public.listings SET property_type = 'apartment' WHERE property_type IS NULL;
UPDATE public.listings SET size_m2 = 1 WHERE size_m2 IS NULL;
UPDATE public.listings SET rooms = 0 WHERE rooms IS NULL;
UPDATE public.listings SET bathrooms = 0 WHERE bathrooms IS NULL;

ALTER TABLE public.listings
  ADD CONSTRAINT listings_property_type_check
  CHECK (property_type IN ('apartment', 'house', 'room', 'studio'));

ALTER TABLE public.listings
  ADD CONSTRAINT listings_size_m2_check
  CHECK (size_m2 > 0);

ALTER TABLE public.listings
  ADD CONSTRAINT listings_rooms_check
  CHECK (rooms >= 0);

ALTER TABLE public.listings
  ADD CONSTRAINT listings_bathrooms_check
  CHECK (bathrooms >= 0);

ALTER TABLE public.listings ALTER COLUMN property_type SET NOT NULL;
ALTER TABLE public.listings ALTER COLUMN size_m2 SET NOT NULL;
ALTER TABLE public.listings ALTER COLUMN rooms SET NOT NULL;
ALTER TABLE public.listings ALTER COLUMN bathrooms SET NOT NULL;

ALTER TABLE public.listings DROP CONSTRAINT IF EXISTS listings_currency_check;

UPDATE public.listings SET currency = 'EUR' WHERE currency IS DISTINCT FROM 'EUR';

ALTER TABLE public.listings ALTER COLUMN currency SET DEFAULT 'EUR';

ALTER TABLE public.listings
  ADD CONSTRAINT listings_currency_check
  CHECK (currency = 'EUR');

ALTER TABLE public.listings
  ALTER COLUMN price TYPE INTEGER USING round(price)::integer;

ALTER TABLE public.listings
  ADD CONSTRAINT listings_description_len_check
  CHECK (description IS NULL OR char_length(description) <= 500);

CREATE INDEX IF NOT EXISTS idx_listings_transaction_type ON public.listings (transaction_type);
CREATE INDEX IF NOT EXISTS idx_listings_status_city_transaction ON public.listings (status, city, transaction_type);
