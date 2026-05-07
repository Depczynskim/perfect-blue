ALTER TABLE public.listings
ADD COLUMN IF NOT EXISTS city_id UUID NULL;

DO $$
BEGIN
IF NOT EXISTS (
SELECT 1
FROM pg_constraint
WHERE conname = 'listings_city_id_fkey'
) THEN
ALTER TABLE public.listings
ADD CONSTRAINT listings_city_id_fkey
FOREIGN KEY (city_id)
REFERENCES public.cities(id)
ON DELETE RESTRICT;
END IF;
END
$$;

CREATE INDEX IF NOT EXISTS idx_listings_city_id
ON public.listings (city_id);
