# SPECYFIKACJA I ROADMAPA: Portal Ogłoszeń Nieruchomości (MVP)

*Wersja poprawiona – z naciskiem na stabilność kosztów, odporność systemu i czytelny przebieg implementacji*

---

## Rola AI

Jesteś doświadczonym Fullstack Developerem (Next.js, TypeScript, Supabase, Postgres/PostGIS).
Twoim zadaniem jest zbudowanie **MVP portalu ogłoszeniowego** zgodnie z poniższym planem – **krok po kroku**.

### Zasady pracy

- realizujemy **jeden krok naraz** (np. Krok 1.1 → 1.2 → 1.3),
- po zakończeniu kroku:
  - krótko podsumuj, co zostało wykonane,
  - zapisz postęp (PROGRESS.md),
  - **czekaj na polecenie przejścia dalej**,
- **nie zmieniaj architektury** bez wyraźnej prośby.

Celem jest produkt działający, tani w utrzymaniu i odporny na awarie zewnętrznych usług.

---

## 1. Stack technologiczny

### Frontend / API

- Next.js 14+ (App Router)
- TypeScript
- Tailwind CSS

### Backend / baza danych

- Supabase
  - Auth
  - Postgres
  - PostGIS

### Storage (obrazy)

- **Supabase Storage** (publiczny bucket)
- upload bezpośrednio z przeglądarki (`@supabase/supabase-js`)
- brak potrzeby konfiguracji zewnętrznych usług (R2, S3)

### Geokodowanie

- LocationIQ
  - używany **wyłącznie na backendzie**,
  - zawsze z cache w bazie,
  - **nie jest twardą zależnością**,
  - zawsze dostępny fallback: **ręczny pin na mapie**.

### Mapy

- Leaflet + OpenStreetMap

### Płatności

- Stripe
- model: **Pay-to-Contact** (płaci osoba chcąca skontaktować się z właścicielem ogłoszenia)

---

## 2. Konfiguracja środowiska (Krok 0)

### Krok 0.0 – Inicjalizacja projektu

- Utwórz projekt Next.js 14+ z TypeScript i Tailwind CSS.
- Przygotuj podstawowy layout (`app/layout.tsx`) i stronę startową (`app/page.tsx`).

### Krok 0.1 – Zmienne środowiskowe (.env.local)

Plik `.env.local` zawiera **wyłącznie klucze**, wartości uzupełniane ręcznie.

#### Supabase

- NEXT_PUBLIC_SUPABASE_URL
- NEXT_PUBLIC_SUPABASE_ANON_KEY
- SUPABASE_SERVICE_ROLE_KEY

#### LocationIQ

- LOCATIONIQ_API_KEY
- LOCATIONIQ_ENABLED ("true" / "false")
- LOCATIONIQ_DAILY_LIMIT (np. 8000)

#### Stripe

- STRIPE_SECRET_KEY
- STRIPE_WEBHOOK_SECRET
- NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
- STRIPE_PRICE_ID_CONTACT

**Zasada:**
- wszystkie klucze SECRET używane tylko po stronie serwera,
- `NEXT_PUBLIC_*` tylko tam, gdzie jest to bezpieczne.

---

## 3. Schemat danych (logiczny)

> Bez SQL – opis logiczny.

### users

- id (UUID, powiązany z auth.users)
- is_paid (bool – na przyszłość)
- created_at (timestamptz)

### listings

- id (UUID)
- owner_id → users.id
- title (text)
- description (text)
- price (numeric)
- currency (text, np. "EUR")
- address_text (text)
- location (geography(Point, 4326), indeks GIST)
- status ("active" | "hidden" | "rented" | "sold")
- created_at
- expires_at (opcjonalnie)

### listing_photos

- id
- listing_id → listings.id
- storage_path (text) – ścieżka w Supabase Storage
- public_url (text) – publiczny URL do zdjęcia
- order_index (int)
- created_at

### messages

- id
- from_user_id → users.id
- to_user_id → users.id
- listing_id → listings.id
- body (text)
- is_read (bool)
- created_at

### payments

- id
- payer_user_id → users.id
- listing_id → listings.id
- amount
- currency
- provider ("stripe")
- provider_payment_id
- status ("pending" | "succeeded" | "failed")
- created_at

### contacts_access

- id
- payer_user_id → users.id
- listing_id → listings.id
- granted_at
- UNIQUE(payer_user_id, listing_id)

### geocoding_cache

- id
- input_address_normalized (text, UNIQUE)
- lat
- lng
- created_at

---

## 4. Plan implementacji

### FAZA 1: Fundamenty i Auth

**Cel:** stabilna baza, RLS, logowanie.

- 1.1 Włączenie PostGIS
- 1.2 Utworzenie tabel
- 1.3 Klient Supabase (server + browser)
- 1.4 Rejestracja i logowanie
- 1.5 RLS (użytkownik widzi tylko swoje dane)

---

### FAZA 2: Geokodowanie i dodawanie ogłoszeń

**Założenie kluczowe:** geokodowanie jest **opcjonalne**.

#### 2.1 POST /api/geocode

- sprawdzenie flagi `LOCATIONIQ_ENABLED`,
- normalizacja adresu,
- cache → limit → LocationIQ,
- możliwe statusy:
  - `ok`
  - `geocoding_unavailable`
  - `geocoding_disabled`

#### 2.2 Formularz ogłoszenia (frontend)

- zawsze możliwy **ręczny pin na mapie**,
- geokodowanie tylko jako pomoc UX,
- backend otrzymuje **finalne lat/lng z mapy**.

#### 2.3 POST /api/listings

- walidacja auth,
- zapis `location` jako geography(Point, 4326),
- zwrot `listing_id`.

---

### FAZA 3: Zdjęcia (Supabase Storage)

- konwersja do WebP po stronie klienta,
- resize i limit rozmiaru (max 1920×1080, 5MB),
- upload bezpośrednio z przeglądarki do Supabase Storage,
- publiczny bucket `listing-photos`,
- zapis metadanych w `listing_photos` (storage_path, public_url).

---

### FAZA 4: Przeglądanie i wyszukiwanie

- GET /api/listings
  - paginacja
  - filtr ceny
  - wyszukiwanie promieniowe (ST_DWithin)

- UI:
  - lista kart
  - szczegóły ogłoszenia
  - galeria + mapa

---

### FAZA 5: Pay-to-Contact (Stripe)

- ukrycie kontaktu właściciela,
- płatność jednorazowa za dostęp,
- webhook Stripe → `contacts_access`.

---

### FAZA 6: Wiadomości

- wysyłanie tylko po uzyskaniu dostępu,
- prosta skrzynka odbiorcza,
- bez WebSocketów (MVP).

---

## 5. Zasady ograniczania kosztów

- brak twardych zależności od API zewnętrznych,
- cache zawsze przed API,
- upload obrazów poza backendem,
- PostGIS zamiast zewnętrznego search engine.

---

## 6. Rejestr postępów

Po każdym kroku aktualizuj `PROGRESS.md`:

- co zostało zrobione,
- jakie pliki zmieniono,
- TODO.

---

## 7. Struktura katalogów (App Router)

Zachowana i niezmieniana bez potrzeby – zgodna z planem MVP.

---

**Ten dokument jest punktem odniesienia.**
Najważniejsze: ukończyć MVP bez dryfu zakresu i bez kosztowych niespodzianek.

