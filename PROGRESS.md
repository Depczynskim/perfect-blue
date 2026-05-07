# PROGRESS – Portal Ogłoszeń Nieruchomości (MVP)

---

## ✅ Krok 0.0 – Inicjalizacja projektu (ZAKOŃCZONY)

**Data:** 2025-12-29

### Co zostało wykonane:
- Utworzono projekt Next.js 14 z TypeScript
- Skonfigurowano Tailwind CSS 3 z custom color palette (primary)
- Dodano fonty Inter + JetBrains Mono przez next/font/google
- Przygotowano podstawowy layout (`src/app/layout.tsx`)
- Utworzono stronę główną z hero section i sekcją funkcjonalności (`src/app/page.tsx`)
- Skonfigurowano ESLint z eslint-config-next
- Aplikacja buduje się poprawnie i działa na localhost:3000

### Zmienione pliki:
- `package.json` – zależności i skrypty
- `tailwind.config.ts` – konfiguracja Tailwind z custom fonts i colors
- `postcss.config.js` – PostCSS z Tailwind i Autoprefixer
- `tsconfig.json` – konfiguracja TypeScript z path aliases (@/*)
- `next.config.js` – konfiguracja Next.js
- `eslint.config.mjs` – ESLint flat config
- `src/app/layout.tsx` – główny layout z fontami i metadanymi
- `src/app/page.tsx` – strona główna (hero, features, footer)
- `src/app/globals.css` – globalne style z Tailwind directives
- `.gitignore` – ignorowane pliki

### Stack:
- Next.js 14.2.35
- React 18.3.1
- TypeScript 5.9.3
- Tailwind CSS 3.4.x

---

## ✅ Krok 0.1 – Konfiguracja zmiennych środowiskowych (ZAKOŃCZONY)

**Data:** 2026-01-02

### Co zostało wykonane:
- Utworzono plik `.env.local` z placeholderami dla wszystkich wymaganych zmiennych
- Dodano komentarze opisujące przeznaczenie każdej zmiennej
- Zachowano zasadę rozdziału kluczy: SECRET tylko po stronie serwera, NEXT_PUBLIC_* dla przeglądarki

### Zmienne środowiskowe:

#### Supabase:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`

#### LocationIQ:
- `LOCATIONIQ_API_KEY`
- `LOCATIONIQ_ENABLED` (domyślnie: false)
- `LOCATIONIQ_DAILY_LIMIT` (domyślnie: 8000)

#### Cloudflare R2:
- `CLOUDFLARE_R2_ACCOUNT_ID`
- `CLOUDFLARE_R2_ACCESS_KEY_ID`
- `CLOUDFLARE_R2_SECRET_ACCESS_KEY`
- `CLOUDFLARE_R2_BUCKET_NAME`
- `NEXT_PUBLIC_CLOUDFLARE_R2_PUBLIC_BASE_URL`

#### Stripe:
- `STRIPE_SECRET_KEY`
- `STRIPE_WEBHOOK_SECRET`
- `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
- `STRIPE_PRICE_ID_CONTACT`

### Zmienione pliki:
- `.env.local` – plik ze zmiennymi środowiskowymi (nowy)

---

## ✅ Krok 1.1 – Włączenie PostGIS (ZAKOŃCZONY)

**Data:** 2026-01-02

### Co zostało wykonane:
- Utworzono strukturę folderów `supabase/migrations/`
- Przygotowano skrypt SQL `001_enable_postgis.sql` do włączenia PostGIS
- Skrypt zawiera weryfikację instalacji i test funkcji geograficznych

### Zmienione pliki:
- `supabase/migrations/001_enable_postgis.sql` – skrypt włączający PostGIS (nowy)

### Instrukcja dla użytkownika:
1. Otwórz [Supabase Dashboard](https://supabase.com/dashboard)
2. Przejdź do projektu → SQL Editor
3. Wklej zawartość pliku `supabase/migrations/001_enable_postgis.sql`
4. Kliknij "Run"
5. Sprawdź czy zwrócono wynik: `POINT(21.0122 52.2297)`

---

## ✅ Krok 1.2 – Utworzenie tabel (ZAKOŃCZONY)

**Data:** 2026-01-02

### Co zostało wykonane:
- Przygotowano skrypt SQL `002_create_tables.sql` tworzący wszystkie tabele MVP
- Dodano odpowiednie indeksy (GIST dla lokalizacji, B-tree dla filtrów)
- Dodano komentarze do tabel
- Skonfigurowano relacje między tabelami (foreign keys z CASCADE)

### Utworzone tabele:
| Tabela | Opis |
|--------|------|
| `users` | Profile użytkowników (powiązane z auth.users) |
| `listings` | Ogłoszenia nieruchomości z lokalizacją geograficzną |
| `listing_photos` | Zdjęcia ogłoszeń (klucze R2) |
| `messages` | Wiadomości między użytkownikami |
| `payments` | Historia płatności Pay-to-Contact |
| `contacts_access` | Rejestr wykupionych dostępów do kontaktu |
| `geocoding_cache` | Cache wyników geokodowania |

### Zmienione pliki:
- `supabase/migrations/002_create_tables.sql` – skrypt tworzący tabele (nowy)

### Instrukcja dla użytkownika:
1. Najpierw uruchom `001_enable_postgis.sql` (jeśli jeszcze nie)
2. Otwórz Supabase Dashboard → SQL Editor
3. Wklej zawartość `002_create_tables.sql` i uruchom
4. Sprawdź czy wszystkie 7 tabel zostało utworzonych

---

## ✅ Krok 1.3 – Klient Supabase (ZAKOŃCZONY)

**Data:** 2026-01-02

### Co zostało wykonane:
- Zainstalowano `@supabase/supabase-js` i `@supabase/ssr`
- Utworzono klient dla przeglądarki (`client.ts`)
- Utworzono klient dla serwera (`server.ts`)
- Utworzono middleware do odświeżania sesji (`middleware.ts`)
- Dodano podstawowe typy bazy danych (`types.ts`)
- Skonfigurowano Next.js middleware (`src/middleware.ts`)

### Zmienione pliki:
- `package.json` – dodano zależności Supabase
- `src/lib/supabase/client.ts` – klient dla Client Components (nowy)
- `src/lib/supabase/server.ts` – klient dla Server Components (nowy)
- `src/lib/supabase/middleware.ts` – helper middleware (nowy)
- `src/lib/supabase/types.ts` – typy bazy danych (nowy)
- `src/lib/supabase/index.ts` – re-eksporty (nowy)
- `src/middleware.ts` – Next.js middleware (nowy)

### Użycie:
```typescript
// Client Component
import { createBrowserClient } from '@/lib/supabase'
const supabase = createBrowserClient()

// Server Component / Route Handler
import { createServerClient } from '@/lib/supabase'
const supabase = await createServerClient()
```

---

## ✅ Krok 1.4 – Rejestracja i logowanie (ZAKOŃCZONY)

**Data:** 2026-01-02

### Co zostało wykonane:
- Przygotowano trigger SQL do automatycznego tworzenia profilu użytkownika
- Utworzono komponent `LoginForm` (formularz logowania)
- Utworzono komponent `RegisterForm` (formularz rejestracji z potwierdzeniem email)
- Utworzono komponent `LogoutButton` (przycisk wylogowania)
- Utworzono stronę `/auth/login`
- Utworzono stronę `/auth/register`
- Utworzono route handler `/auth/callback` (obsługa linku z email)
- Zaktualizowano linki na stronie głównej

### Zmienione pliki:
- `supabase/migrations/003_auth_trigger.sql` – trigger tworzenia profilu (nowy)
- `src/components/auth/LoginForm.tsx` – formularz logowania (nowy)
- `src/components/auth/RegisterForm.tsx` – formularz rejestracji (nowy)
- `src/components/auth/LogoutButton.tsx` – przycisk wylogowania (nowy)
- `src/components/auth/index.ts` – eksporty (nowy)
- `src/app/auth/login/page.tsx` – strona logowania (nowy)
- `src/app/auth/register/page.tsx` – strona rejestracji (nowy)
- `src/app/auth/callback/route.ts` – callback OAuth (nowy)
- `src/app/page.tsx` – zaktualizowane linki auth

### Instrukcja dla użytkownika:
1. Uruchom `003_auth_trigger.sql` w Supabase SQL Editor
2. W Supabase Dashboard → Authentication → URL Configuration:
   - Site URL: `http://localhost:3000`
   - Redirect URLs: `http://localhost:3000/auth/callback`

---

## ✅ Krok 1.5 – RLS (Row Level Security) (ZAKOŃCZONY)

**Data:** 2026-01-02

### Co zostało wykonane:
- Włączono RLS dla wszystkich tabel
- Skonfigurowano polityki bezpieczeństwa zgodnie z wymaganiami MVP

### Polityki:

| Tabela | SELECT | INSERT | UPDATE | DELETE |
|--------|--------|--------|--------|--------|
| `users` | własny profil | trigger | własny | - |
| `listings` | publiczne + własne | właściciel | właściciel | właściciel |
| `listing_photos` | publiczne + własne | właściciel listing | właściciel | właściciel |
| `messages` | wysłane/odebrane | nadawca | odbiorca | - |
| `payments` | własne | system | - | - |
| `contacts_access` | własne + właściciel | system | - | - |
| `geocoding_cache` | zalogowani | system | - | - |

### Zmienione pliki:
- `supabase/migrations/004_rls_policies.sql` – polityki RLS (nowy)

### Instrukcja dla użytkownika:
1. Uruchom `004_rls_policies.sql` w Supabase SQL Editor
2. Sprawdź czy wszystkie polityki zostały utworzone

---

## ✅ FAZA 1 ZAKOŃCZONA: Fundamenty i Auth

**Podsumowanie Fazy 1:**
- PostGIS włączony
- Wszystkie tabele utworzone z odpowiednimi indeksami
- Klienci Supabase (browser + server) skonfigurowani
- Middleware odświeżający sesję
- Rejestracja, logowanie, wylogowanie
- Trigger automatycznego tworzenia profilu
- Pełna konfiguracja RLS

**Wymagane kroki w Supabase Dashboard:**
1. Uruchom kolejno migracje SQL: 001, 002, 003, 004
2. Skonfiguruj URL-e w Authentication → URL Configuration

---

## ✅ Krok 2.1 – Geokodowanie (POST /api/geocode) (ZAKOŃCZONY)

**Data:** 2026-01-02

### Co zostało wykonane:
- Utworzono endpoint API `POST /api/geocode`
- Zaimplementowano normalizację adresów (lowercase, trim, usunięcie wielokrotnych spacji)
- Dodano sprawdzanie cache w bazie danych przed wywołaniem LocationIQ
- Zaimplementowano sprawdzanie flagi `LOCATIONIQ_ENABLED`
- Dodano kontrolę dziennego limitu zapytań `LOCATIONIQ_DAILY_LIMIT`
- Integracja z LocationIQ API
- Automatyczny zapis wyników do cache
- Obsługa błędów z odpowiednimi statusami

### Możliwe statusy odpowiedzi:
- `ok` – geokodowanie udane, zwrócono lat/lng
- `geocoding_disabled` – LocationIQ wyłączony w konfiguracji
- `geocoding_unavailable` – przekroczono limit, błąd API, lub nie znaleziono adresu
- `error` – błąd serwera lub brak autoryzacji

### Logika działania:
1. Weryfikacja autoryzacji użytkownika
2. Walidacja adresu wejściowego
3. Normalizacja adresu
4. Sprawdzenie cache w bazie danych
5. Weryfikacja flagi LOCATIONIQ_ENABLED
6. Sprawdzenie dziennego limitu zapytań
7. Wywołanie LocationIQ API
8. Zapis wyniku do cache
9. Zwrot koordynatów lub odpowiedniego błędu

### Zmienione pliki:
- `src/app/api/geocode/route.ts` – endpoint geokodowania (nowy)

### Użycie:
```typescript
// POST /api/geocode
{
  "address": "Warszawa, Plac Defilad 1"
}

// Odpowiedź (sukces):
{
  "status": "ok",
  "lat": 52.2297,
  "lng": 21.0122,
  "message": "Geocoded successfully"
}

// Odpowiedź (cache):
{
  "status": "ok",
  "lat": 52.2297,
  "lng": 21.0122,
  "message": "From cache"
}

// Odpowiedź (geokodowanie wyłączone):
{
  "status": "geocoding_disabled",
  "message": "Geocoding service is disabled. Please set location manually on map."
}
```

---

## ✅ Krok 2.2 – Formularz ogłoszenia (frontend) (ZAKOŃCZONY)

**Data:** 2026-01-02

### Co zostało wykonane:
- Zainstalowano biblioteki Leaflet (`leaflet`, `react-leaflet@^4.2.1`, `@types/leaflet`)
- Dodano style Leaflet do `globals.css`
- Utworzono komponent `LocationPicker` z interaktywną mapą OpenStreetMap
- Utworzono komponent `CreateListingForm` z pełnym formularzem dodawania ogłoszenia
- Zaimplementowano opcjonalne geokodowanie adresu (z fallback na ręczne ustawienie)
- Dodano możliwość ręcznego ustawienia lokalizacji przez kliknięcie na mapie
- Utworzono stronę `/listings/new` dla zalogowanych użytkowników

### Funkcjonalności formularza:
- **Pola podstawowe:** tytuł, opis, cena, waluta
- **Geokodowanie:** pole adresu z przyciskiem "Znajdź" → wywołuje `/api/geocode`
- **Mapa interaktywna:** Leaflet + OpenStreetMap z markerem
- **Ręczne ustawienie:** kliknięcie na mapie zmienia lokalizację
- **Walidacja:** sprawdzanie wymaganych pól przed wysłaniem
- **Statusy geokodowania:** komunikaty sukcesu/ostrzeżenia/błędu
- **Responsywność:** formularz działa na urządzeniach mobilnych i desktop

### Zmienione pliki:
- `package.json` – dodano zależności: leaflet, react-leaflet, @types/leaflet
- `src/app/globals.css` – import stylów Leaflet
- `src/components/listings/LocationPicker.tsx` – komponent mapy (nowy)
- `src/components/listings/CreateListingForm.tsx` – formularz ogłoszenia (nowy)
- `src/components/listings/index.ts` – eksporty komponentów (nowy)
- `src/app/listings/new/page.tsx` – strona dodawania ogłoszenia (nowy)

### Szczegóły techniczne:
- `LocationPicker` renderowany dynamicznie (`next/dynamic`) z wyłączonym SSR
- Fix dla domyślnych ikon Leaflet (CDN Unpkg)
- Mapa z widokiem domyślnym na Warszawę (52.2297, 21.0122)
- Współrzędne wyświetlane na bieżąco pod mapą
- Formularz wysyła dane do `/api/listings` (POST)

---

## ✅ Krok 2.3 – POST /api/listings (ZAKOŃCZONY)

**Data:** 2026-01-02

### Co zostało wykonane:
- Utworzono endpoint API `POST /api/listings`
- Zaimplementowano autoryzację użytkownika
- Dodano walidację wszystkich wymaganych pól
- Zapis lokalizacji w formacie PostGIS WKT: `POINT(longitude latitude)`
- Obsługa błędów z odpowiednimi kodami HTTP

### Walidacja:
- Tytuł: wymagany, niepusty string
- Opis: wymagany, niepusty string
- Cena: wymagana, liczba > 0
- Waluta: wymagany string
- Latitude: liczba w zakresie -90 do 90
- Longitude: liczba w zakresie -180 do 180

### Zwracane kody HTTP:
- `201` – ogłoszenie utworzone pomyślnie
- `400` – błąd walidacji
- `401` – brak autoryzacji
- `500` – błąd serwera

### Zmienione pliki:
- `src/app/api/listings/route.ts` – endpoint tworzenia ogłoszeń (nowy)

### Użycie:
```typescript
// POST /api/listings
{
  "title": "Mieszkanie 50m2",
  "description": "Piękne mieszkanie w centrum",
  "price": 500000,
  "currency": "PLN",
  "address_text": "Warszawa, ul. Marszałkowska 1",
  "latitude": 52.2297,
  "longitude": 21.0122
}

// Odpowiedź (sukces):
{
  "message": "Listing created successfully",
  "listing_id": "uuid-here"
}
```

---

## ✅ FAZA 2 ZAKOŃCZONA: Geokodowanie i dodawanie ogłoszeń

**Podsumowanie Fazy 2:**
- Endpoint geokodowania z cache i kontrolą kosztów
- Pełny formularz dodawania ogłoszeń
- Integracja z Leaflet + OpenStreetMap
- Możliwość geokodowania adresu lub ręcznego ustawienia lokalizacji
- Endpoint API do zapisywania ogłoszeń
- Strona `/listings/new` dla zalogowanych użytkowników

**Kluczowe założenia zrealizowane:**
✅ Geokodowanie jest opcjonalne (nie jest twardą zależnością)
✅ Zawsze można ustawić lokalizację ręcznie na mapie
✅ Cache w bazie danych minimalizuje koszty
✅ Kontrola dziennego limitu zapytań
✅ Możliwość wyłączenia geokodowania przez flagę

---

## ✅ Krok 4.1 – GET /api/listings (ZAKOŃCZONY)

**Data:** 2026-01-08

### Co zostało wykonane:
- Utworzono endpoint API `GET /api/listings`
- Zaimplementowano paginację (page, limit)
- Filtrowanie po statusie (`status = 'active'`)
- Sortowanie po dacie utworzenia (DESC)
- Zwracanie meta-informacji (total, totalPages)

### Zmienione pliki:
- `src/app/api/listings/route.ts` – dodano handler GET obok POST

### Użycie:
```typescript
// GET /api/listings?page=1&limit=20
{
  "listings": [...],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 2,
    "totalPages": 1
  }
}
```

---

## ✅ Krok 4.2 – GET /api/listings/[id] (ZAKOŃCZONY)

**Data:** 2026-01-08

### Co zostało wykonane:
- Utworzono endpoint API `GET /api/listings/[id]`
- Pobieranie szczegółów pojedynczego ogłoszenia
- Obsługa błędu 404 dla nieistniejących ogłoszeń
- RLS automatycznie sprawdza dostęp

### Zmienione pliki:
- `src/app/api/listings/[id]/route.ts` – endpoint szczegółów (nowy)

---

## ✅ Krok 4.3 – Strona /listings (ZAKOŃCZONY)

**Data:** 2026-01-08

### Co zostało wykonane:
- Utworzono stronę `/listings` (lista ogłoszeń)
- Wyświetlanie ogłoszeń w formie kart (grid responsive)
- Placeholder dla zdjęć (gradient + ikona domu)
- Wyświetlanie: tytuł, opis (clamp-2), cena, lokalizacja
- Header z nawigacją i wykrywaniem sesji
- Komunikat "Brak ogłoszeń" gdy lista pusta

### Zmienione pliki:
- `src/app/listings/page.tsx` – strona listy ogłoszeń (nowy)

### Funkcjonalności:
- Automatyczne pobieranie ogłoszeń z bazy (Server Component)
- Link do każdej karty prowadzi do `/listings/[id]`
- Licznik aktywnych ogłoszeń

---

## ✅ Krok 4.4 – Strona /listings/[id] (ZAKOŃCZONY)

**Data:** 2026-01-08

### Co zostało wykonane:
- Utworzono stronę `/listings/[id]` (szczegóły ogłoszenia)
- Layout dwukolumnowy (desktop: 2/3 treść + 1/3 sidebar)
- Placeholder dla galerii zdjęć
- Sekcja opisu ogłoszenia
- Sekcja lokalizacji z mapą Leaflet (statyczna, marker)
- Sidebar z ceną i przyciskiem kontaktu
- Informacja "To Twoje ogłoszenie" dla właściciela
- Data dodania ogłoszenia

### Zmienione pliki:
- `src/app/listings/[id]/page.tsx` – strona szczegółów (nowy)

### Funkcjonalności:
- Parsowanie lokalizacji PostGIS (GeoJSON format)
- Dynamiczny import mapy (bez SSR)
- Wykrywanie właściciela ogłoszenia
- 404 dla nieistniejących ogłoszeń

---

## ✅ Krok 4.5 – Komponent ListingMap (ZAKOŃCZONY)

**Data:** 2026-01-08

### Co zostało wykonane:
- Utworzono komponent `ListingMap` (statyczna mapa)
- Leaflet + OpenStreetMap
- Pojedynczy marker na współrzędnych
- Popup z opisem
- Walidacja współrzędnych
- Fallback dla błędnych danych

### Zmienione pliki:
- `src/components/listings/ListingMap.tsx` – komponent mapy (nowy)
- `src/components/listings/index.ts` – eksport ListingMap

### Szczegóły techniczne:
- Fix dla ikon Leaflet (CDN Unpkg)
- `scrollWheelZoom={false}` – mapa statyczna
- Zoom 13 dla widoku okolicy

---

## ✅ FAZA 4 ZAKOŃCZONA: Przeglądanie ogłoszeń

**Podsumowanie Fazy 4:**
- Endpoint GET /api/listings (paginacja, filtracja)
- Endpoint GET /api/listings/[id] (szczegóły)
- Strona `/listings` (lista kart ogłoszeń)
- Strona `/listings/[id]` (szczegóły + mapa)
- Komponent ListingMap (statyczna mapa Leaflet)

**Funkcjonalności zrealizowane:**
✅ Przeglądanie listy ogłoszeń
✅ Wyświetlanie szczegółów pojedynczego ogłoszenia
✅ Mapa z markerem lokalizacji
✅ Responsive layout
✅ Wykrywanie właściciela ogłoszenia
✅ Placeholder dla zdjęć (gotowy na Fazę 3)

**Uwaga:**
- Galeria zdjęć (placeholder) – realizacja w Fazie 3
- Przycisk "Pokaż kontakt" (nieklikany) – realizacja w Fazie 5
- Wyszukiwanie promieniowe – realizacja w przyszłości

---

## ⚠️ DECYZJA PROJEKTOWA: Zmiana storage z Cloudflare R2 na Supabase Storage

**Data:** 2026-01-10

### Decyzja:
Świadomie porzucono Cloudflare R2 na rzecz **Supabase Storage**.

### Uzasadnienie:
- Supabase już używany do bazy danych i autoryzacji
- Prostsza konfiguracja – brak potrzeby zewnętrznego konta Cloudflare
- Upload bezpośrednio z frontendu przez `@supabase/supabase-js`
- Publiczny bucket wystarczający dla MVP
- Mniej zmiennych środowiskowych do zarządzania

### Co zostaje:
- ✅ Konwersja do WebP po stronie klienta
- ✅ Resize do max 1920×1080
- ✅ Limit 5MB na plik
- ✅ Komponent PhotoUpload z drag & drop
- ✅ Zapis metadanych w `listing_photos`

### Co się zmienia:
- ❌ Cloudflare R2, AWS SDK, Signed URLs
- ✅ Supabase Storage, `supabase.storage.from().upload()`

---

## ✅ Krok 3.1 – Refaktor na Supabase Storage (ZAKOŃCZONY)

**Data:** 2026-01-10

### Co zostało wykonane:
- Usunięto kod R2 (`src/lib/r2/`, `api/upload/signed-url`)
- Usunięto zależności AWS SDK (106 pakietów)
- Zaktualizowano `PhotoUpload` na Supabase Storage
- Zaktualizowano API photos endpoint (`storage_path`, `public_url`)
- Utworzono migrację SQL `005_update_listing_photos_storage.sql`
- Zaktualizowano strony listings do nowego schematu

### Zmienione pliki:
- `package.json` – usunięto AWS SDK
- `src/components/listings/PhotoUpload.tsx` – Supabase Storage upload
- `src/components/listings/CreateListingForm.tsx` – `storagePath` zamiast `r2Key`
- `src/app/api/listings/[id]/photos/route.ts` – nowy schemat
- `src/app/listings/page.tsx` – `public_url` zamiast R2
- `src/app/listings/[id]/page.tsx` – `public_url` zamiast R2
- `supabase/migrations/005_update_listing_photos_storage.sql` – migracja (nowy)

### Usunięte pliki:
- `src/lib/r2/client.ts`
- `src/lib/r2/index.ts`
- `src/app/api/upload/signed-url/route.ts`

---

## ✅ Krok 3.2 – Wersje zdjęć: display + thumb + lightbox (ZAKOŃCZONY)

**Data:** 2026-01-10

### Co zostało wykonane:
- Generowanie dwóch wersji zdjęć podczas uploadu:
  - **display.webp** (max 1600×1200) – do strony szczegółów
  - **thumb.webp** (max 600×450) – miniatury na listach
- Dodano komponent **Lightbox** z nawigacją klawiaturą (←→, ESC)
- Dodano komponent **PhotoGallery** z pełnymi zdjęciami (object-contain)
- Lista ogłoszeń używa miniatur w stałym ratio 4:3 (object-cover)
- Migracja bazy danych na kolumny `display_url`, `thumb_url`

### Zmienione pliki:
- `src/lib/image/process.ts` – nowa funkcja `prepareImageVersions()`
- `src/lib/image/index.ts` – eksporty nowych stałych
- `src/components/listings/PhotoUpload.tsx` – upload 2 wersji
- `src/components/listings/PhotoGallery.tsx` – galeria z lightboxem (nowy)
- `src/components/listings/Lightbox.tsx` – modal lightbox (nowy)
- `src/components/listings/CreateListingForm.tsx` – nowe pola
- `src/app/api/listings/[id]/photos/route.ts` – display/thumb URL
- `src/app/listings/page.tsx` – miniatury z thumb_url, ratio 4:3
- `src/app/listings/[id]/page.tsx` – galeria z lightboxem
- `supabase/migrations/007_photo_versions.sql` – nowe kolumny (nowy)

### Nowe kolumny w `listing_photos`:
| Kolumna | Typ | Opis |
|---------|-----|------|
| display_path | TEXT | Ścieżka display w Storage |
| display_url | TEXT | Publiczny URL display |
| thumb_path | TEXT | Ścieżka thumb w Storage |
| thumb_url | TEXT | Publiczny URL thumb |

### Wymiary zdjęć:
| Wersja | Max wymiary | Jakość | Użycie |
|--------|-------------|--------|--------|
| display | 1600×1200 | 85% | Strona szczegółów, lightbox |
| thumb | 600×450 | 75% | Lista ogłoszeń, miniaturki |

### Lightbox (MVP):
- ✅ Otwieranie po kliknięciu zdjęcia
- ✅ Zamknięcie: X, klik tła, ESC
- ✅ Nawigacja: strzałki na ekranie + ← →
- ✅ Licznik zdjęć
- ✅ Miniaturki na dole

---

## ✅ FAZA 3 ZAKOŃCZONA: Zdjęcia (Supabase Storage)

**Podsumowanie Fazy 3:**
- Upload bezpośrednio z przeglądarki do Supabase Storage
- Konwersja do WebP po stronie klienta
- Dwie wersje: display (pełne) + thumb (miniatury)
- Lightbox z nawigacją
- Spójny grid na liście (ratio 4:3, object-cover)
- Pełne zdjęcia na szczegółach (object-contain)

---

## ✅ FAZA 5 ZAKOŃCZONA: Pay-to-Contact (Stripe)

**Data:** 2026-01-16

### Co zostało wykonane:

#### 5.1 – Instalacja Stripe SDK
- Zainstalowano `stripe` (server-side) i `@stripe/stripe-js` (client-side)
- Utworzono helper `src/lib/stripe/index.ts` z lazy initialization
- Utworzono helper `src/lib/stripe/client.ts` dla komponentów klienckich

#### 5.2 – Endpoint POST /api/payments/create-checkout
- Tworzenie sesji Stripe Checkout
- Obsługa metod płatności: card, BLIK, P24
- Walidacja: autoryzacja, istnienie ogłoszenia, brak dostępu do własnego
- Sprawdzanie czy użytkownik już ma dostęp
- Zapis rekordu płatności w statusie `pending`

#### 5.3 – Endpoint POST /api/webhooks/stripe
- Weryfikacja sygnatury webhook
- Obsługa `checkout.session.completed` → sukces płatności
- Obsługa `checkout.session.expired` → płatność nieudana
- Używa `SUPABASE_SERVICE_ROLE_KEY` (omija RLS)

#### 5.4 – Logika contacts_access
- Po udanej płatności automatyczne przyznanie dostępu
- Aktualizacja statusu płatności na `succeeded`
- Zapis do tabeli `contacts_access`

#### 5.5 – UI - Przycisk "Pokaż kontakt"
- Komponent `ContactButton` z obsługą stanów
- Przekierowanie do Stripe Checkout
- Obsługa błędów i loadingu
- Wymóg logowania przed zakupem

#### 5.6 – Wyświetlanie danych kontaktowych
- Po płatności użytkownik widzi dane kontaktowe właściciela
- Wyświetlanie telefonu i email
- Linki `tel:` i `mailto:`

### Zmienione/dodane pliki:
- `package.json` – dodano stripe, @stripe/stripe-js
- `src/lib/stripe/index.ts` – server-side Stripe helper (nowy)
- `src/lib/stripe/client.ts` – client-side Stripe helper (nowy)
- `src/app/api/payments/create-checkout/route.ts` – endpoint checkout (nowy)
- `src/app/api/webhooks/stripe/route.ts` – webhook handler (nowy)
- `src/components/listings/ContactButton.tsx` – komponent kontaktu (nowy)
- `src/components/listings/index.ts` – eksport ContactButton
- `src/app/listings/[id]/page.tsx` – integracja ContactButton
- `supabase/migrations/008_user_contact_info.sql` – pola kontaktowe users (nowy)

### Instrukcja dla użytkownika:

1. **Uruchom migrację SQL** `008_user_contact_info.sql` w Supabase Dashboard

2. **Skonfiguruj Stripe Dashboard:**
   - Utwórz produkt "Dostęp do kontaktu" z ceną 9.99 PLN
   - Skopiuj `STRIPE_PRICE_ID_CONTACT` (opcjonalnie)

3. **Skonfiguruj Webhook w Stripe Dashboard:**
   - URL: `https://your-domain.com/api/webhooks/stripe`
   - Wydarzenia: `checkout.session.completed`, `checkout.session.expired`
   - Skopiuj `STRIPE_WEBHOOK_SECRET` do `.env.local`

4. **Uzupełnij zmienne środowiskowe:**
   - `STRIPE_SECRET_KEY`
   - `STRIPE_WEBHOOK_SECRET`
   - `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`

5. **Testowanie lokalne (Stripe CLI):**
   ```bash
   stripe listen --forward-to localhost:3000/api/webhooks/stripe
   ```

---

## ✅ FAZA 6 ZAKOŃCZONA: Wiadomości + Subskrypcja

**Data:** 2026-01-16

### Zmiana modelu biznesowego:
- ~~Pay-to-Contact (jednorazowo 9.99 PLN za 1 ogłoszenie)~~
- **Subskrypcja 5€/miesiąc** za możliwość kontaktu ze wszystkimi ogłoszeniodawcami

### Co zostało wykonane:

#### System wiadomości:
- Endpoint `POST /api/messages` - wysyłanie wiadomości (z obsługą odpowiedzi)
- Endpoint `GET /api/messages` - pobieranie wiadomości
- Strona `/messages` - lista konwersacji (zgrupowane po ogłoszeniach)
- Strona `/messages/[userId]/[listingId]` - pełna historia konwersacji
- Formularz odpowiedzi w konwersacji
- Automatyczne oznaczanie jako przeczytane
- Właściciel może odpowiadać BEZ subskrypcji
- Komponent `ContactButton` - formularz wysyłania wiadomości po subskrypcji

#### Subskrypcja Stripe:
- Zmiana z `mode: 'payment'` na `mode: 'subscription'`
- Obsługa webhooków: `customer.subscription.created/updated/deleted`
- Sprawdzanie `users.is_paid` zamiast `contacts_access`
- Nowe pola w users: `stripe_customer_id`, `stripe_subscription_id`, `subscription_status`

#### Strona profilu:
- `/profile` - edycja danych kontaktowych (telefon, email)
- Link do profilu w nawigacji (kliknięcie na email)

### Zmienione/dodane pliki:
- `src/lib/stripe/index.ts` – konfiguracja na EUR i subscription
- `src/app/api/payments/create-checkout/route.ts` – subscription mode
- `src/app/api/webhooks/stripe/route.ts` – obsługa subscription events
- `src/app/api/messages/route.ts` – endpoint wiadomości z odpowiedziami
- `src/app/messages/page.tsx` – lista konwersacji
- `src/app/messages/[odbiorca]/[listing]/page.tsx` – historia konwersacji (nowy)
- `src/app/messages/[odbiorca]/[listing]/ConversationForm.tsx` – formularz odpowiedzi (nowy)
- `src/app/profile/page.tsx` – strona profilu (nowy)
- `src/app/profile/ProfileForm.tsx` – formularz profilu (nowy)
- `src/components/listings/ContactButton.tsx` – zmiana na formularz wiadomości
- `supabase/migrations/009_payments_insert_policy.sql` – polityka RLS
- `supabase/migrations/010_subscription_fields.sql` – pola subskrypcji

### Konfiguracja webhooków Stripe (produkcja):
- `checkout.session.completed`
- `customer.subscription.created`
- `customer.subscription.updated`
- `customer.subscription.deleted`
- `invoice.payment_failed`

---

## 🎉 MVP ZAKOŃCZONY!

**Zrealizowane fazy:**
- ✅ Faza 1: Fundamenty i Auth
- ✅ Faza 2: Geokodowanie i dodawanie ogłoszeń
- ✅ Faza 3: Zdjęcia (Supabase Storage)
- ✅ Faza 4: Przeglądanie ogłoszeń
- ✅ Faza 5: Płatności (Stripe Subscription)
- ✅ Faza 6: Wiadomości

**Model biznesowy:**
- Dodawanie ogłoszeń: **bezpłatne**
- Kontakt z ogłoszeniodawcami: **subskrypcja 5€/miesiąc**

---

## ✅ REFAKTORYZACJA 2026-01 (ZAKOŃCZONA)

**Data rozpoczęcia:** 2026-01-18
**Data zakończenia:** 2026-01-18

### Cel refaktoryzacji:
Zmniejszenie duplikacji kodu, poprawa maintainability i przygotowanie bazy do dalszego rozwoju aplikacji.

### Zrealizowane elementy:

#### ✅ Faza R1: Przygotowanie i analiza
- [x] Dodanie sekcji refaktoryzacji do PROGRESS.md
- [x] Aktualizacja typów Supabase (listing_photos: display/thumb URL)
- [x] Ujednolicenie importów klienta Supabase

#### ✅ Faza R2: Layout i wspólne komponenty UI
- [x] Wydzielenie wspólnego komponentu `Header` (`src/components/layout/Header.tsx`)
- [x] Komponent `LanguageSelector` dla i18n
- [x] Używany na wszystkich stronach aplikacji

#### ✅ Faza R3: Wspólne helpery biznesowe
- [x] Utworzenie `lib/api/auth.ts` z `requireAuth()` i klasami błędów
- [x] Utworzenie `lib/api/subscription.ts` z `checkSubscription()`
- [x] Utworzenie `lib/api/errors.ts` z `handleApiError()`
- [x] Refaktor wszystkich API routes do użycia helperów

#### ✅ Faza R4: Wspólne funkcje UI i hooki
- [x] Wydzielenie konfiguracji ikon Leaflet do `lib/map/icon.ts`
- [x] Hook `useGeocoding` w `src/hooks/`
- [x] Formatery w `lib/format/` (formatPrice, formatDate, formatDateTime)

#### ✅ Faza R5: Typy i eksporty
- [x] Zaktualizowane typy w `src/lib/supabase/types.ts`
- [x] Spójne eksporty przez pliki `index.ts`

### Zrefaktoryzowane pliki API:

| Plik | Zmiany |
|------|--------|
| `api/listings/route.ts` | `requireAuth()`, `ValidationError`, `handleApiError()` |
| `api/listings/[id]/route.ts` | `NotFoundError`, `handleApiError()` |
| `api/listings/[id]/photos/route.ts` | Pełna refaktoryzacja wszystkich metod |
| `api/messages/route.ts` | Już używał helperów (bez zmian) |

### Architektura po refaktoryzacji:

```
src/lib/api/
├── auth.ts          - requireAuth(), klasy błędów (Auth, Forbidden, Validation, NotFound)
├── errors.ts        - handleApiError() - centralna obsługa błędów
├── subscription.ts  - checkSubscription(), requireSubscription()
└── index.ts         - re-eksporty
```

---
