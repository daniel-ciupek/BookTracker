# BookTracker 📚

Cześć! Przed Tobą **BookTracker** – pełnoprawna aplikacja full-stack stworzona do katalogowania, oceniania i recenzowania książek. Projekt został zaprojektowany tak, aby z łatwością poradzić sobie ze zbiorem danych liczącym **nawet do 10 milionów rekordów**.

Aplikacja posiada nowoczesny, w pełni responsywny interfejs użytkownika w stylu *Ultra-Modern Glassmorphism* (z płynnymi animacjami i domyślnym trybem ciemnym).

---

## ⚡ Szybki start (One-Click)

Jeśli chcesz błyskawicznie zobaczyć aplikację w akcji bez ręcznej konfiguracji, użyj Dockera. Jedno polecenie postawi całą infrastrukturę, backend, frontend oraz zasili bazę danymi testowymi:

```bash
docker compose up -d --build
```
Po zakończeniu budowania:
- **Aplikacja (Frontend + API):** dostępna pod adresem [http://localhost](http://localhost)
- **Konto demo:** `demo@example.com` / hasło: `password`

---

## 🚀 Jakie funkcje posiada aplikacja?

- **Zarządzanie książkami:** Dodawanie nowych książek z uwzględnieniem tytułu, autora, liczby stron, gatunku i numeru ISBN (z rygorystyczną matematyczną walidacją dla formatów ISBN-10 i ISBN-13).
- **Interakcje społecznościowe:** Możliwość oceniania (od 1 do 5 gwiazdek), pisania edytowalnych recenzji oraz oznaczania statusu czytania (Chcę przeczytać, Czytam, Przeczytane).
- **Zaawansowane filtrowanie i wyszukiwanie:** Błyskawiczna wyszukiwarka po tytule i autorze (działająca płynnie na wielkich zbiorach danych), filtrowanie po gatunkach oraz opcja "Moje publikacje".
- **System kont (Auth):** Rejestracja, logowanie, zmiana danych profilowych oraz pełny proces resetowania hasła.
- **Wybitny UX/UI:** Płynne animacje (Framer Motion), szklane panele (Glassmorphism) i pełne wsparcie dla urządzeń mobilnych.

---

## 🛠 Stos technologiczny

### Frontend
- **React 18** + **TypeScript** (zbudowane za pomocą Vite)
- **Styling:** Tailwind CSS, Framer Motion (animacje), Lucide React (ikony)
- **Formularze & Walidacja:** React Hook Form + Zod
- **Data Fetching:** TanStack Query v5
- **Wydajność:** `@tanstack/react-virtual` (wirtualizacja nieskończonej listy dla zapewnienia płynności przy tysiącach załadowanych rekordów)

### Backend
- **Laravel 13** + **PHP 8.3**
- **Baza danych:** PostgreSQL 16 (idealna do ciężkich zapytań i indeksowania)
- **Cache:** Redis 7 (buforowanie najcięższych zapytań)
- **Autoryzacja:** Laravel Sanctum (Bearer Tokens)

---

## 🏎 Lokalne uruchomienie (Development)

Jeśli chcesz uruchomić projekt w trybie deweloperskim (z Hot Module Replacement):

1. **Uruchom infrastrukturę (Baza + Cache):**
   ```bash
   docker compose up -d postgres redis
   ```
2. **Zbuduj Backend:**
   ```bash
   cd backend
   composer install
   cp .env.example .env
   php artisan key:generate
   php artisan migrate:fresh --seed
   php artisan serve
   # Backend działa pod adresem http://localhost:8000
   ```

3. **Zbuduj Frontend:**
   ```bash
   cd frontend
   npm install
   cp .env.example .env
   npm run dev
   # Frontend działa pod adresem http://localhost:5173
   ```

---

## 🏗 Gotowość na 10 milionów rekordów

Aplikacja została zaprojektowana od podstaw, aby nie dławić się przy gigantycznych zbiorach danych. Główne optymalizacje to:

1. **Cursor-Based Pagination (Keyset Pagination):** Zamiast powolnego `OFFSET/LIMIT`, przechodzimy po indeksach bazy danych (w czasie $O(1)$).
2. **Indeksy GIN (Fuzzy Search):** Wyszukiwanie po tytule i autorze korzysta z algorytmu trigramów (`pg_trgm`) w PostgreSQL, co eliminuje mordercze skanowanie całej tabeli przy zapytaniach `LIKE`.
3. **Redis Caching:** Ciężkie zapytania wyliczające średnie oceny są zamrażane w Redis, drastycznie odciążając główną bazę danych przy dużym ruchu.
4. **Wirtualizacja UI:** Przeglądarka renderuje w HTML tylko te książki, które aktualnie widać na ekranie, chroniąc RAM użytkownika.

---

## ✅ Testy i proces CI/CD

Bardzo duży nacisk położono na stabilność. W całym projekcie znajduje się łącznie **134 testów automatycznych**:
- **Backend:** 84 testy Feature/Unit z wykorzystaniem frameworka **Pest PHP**.
- **Frontend:** 50 testów komponentów i logiki biznesowej przy użyciu **Vitest** oraz **React Testing Library**.

Aplikacja korzysta z rygorystycznego procesu **CI/CD na GitHub Actions**. Każdy push na brancha jest automatycznie sprawdzany przez lintery (PHPStan lvl 6, Laravel Pint, ESLint) oraz puszczany przez pełen zestaw testów z podłączoną testową bazą PostgreSQL i Redisem.

---

## 🚢 Wdrożenie na Produkcję

Aplikacja posiada gotową konfigurację pod produkcję (Docker). Aby projekt faktycznie zadziałał w środowisku produkcyjnym, należy wykonać kilka kroków:
1. Skopiować `.env.prod.example` do `.env.prod` i uzupełnić prawdziwymi hasłami i kluczami produkcyjnymi.
2. **Certyfikaty SSL:** Zabezpieczyć komunikację przez HTTPS (np. z użyciem certyfikatu Let's Encrypt na reverse proxy / nginx).
3. **Konfiguracja SMTP:** Uzupełnić zmienne środowiskowe `MAIL_*`, aby resetowanie haseł wysyłało prawdziwe wiadomości e-mail (obecnie loguje je do pliku).
4. **Monitoring:** Ze względów bezpieczeństwa i monitorowania wydajności, na produkcji warto zintegrować narzędzia takie jak Sentry (śledzenie błędów JS/PHP) oraz Laravel Telescope/Pulse.

---

## 🤖 Wykorzystanie AI (Claude Code & Gemini)

Przy tworzeniu tego projektu wykorzystywałem asystentów AI: **Claude Code** (na wczesnym etapie budowy infrastruktury) oraz **Gemini CLI** (do skomplikowanych refaktoryzacji, budowy zaawansowanego UI i optymalizacji zapytań).

**Jak to wyglądało w praktyce?**
Nigdy nie ufałem ślepo wygenerowanemu kodowi. Proces wyglądał następująco:
1. Podawałem AI problem biznesowy (np. "zoptymalizuj paginację dla 10M rekordów").
2. AI proponowało rozwiązanie (np. Cursor Pagination).
3. Wspólnie implementowaliśmy zmiany, po czym prosiłem AI o dopisanie zestawu ścisłych testów jednostkowych dla nowego kodu.
4. Na koniec **zawsze ręcznie weryfikowałem** działanie funkcji – przeklikiwałem formularze, testowałem dziwne przypadki (np. wpisywanie liter w pola liczbowe, psucie okładek książek) i podglądałem dev-toolsy w poszukiwaniu błędów, by upewnić się, że interfejs (szczególnie ten animowany) działa dokładnie tak, jak to sobie zaplanowałem.

**Podczas pracy posiłkowałem się świetnymi dokumentacjami, m.in.:**
- [Dokumentacja React](https://react.dev/)
- [Dokumentacja Laravel 11/13](https://laravel.com/docs)
- [PostgreSQL pg_trgm](https://www.postgresql.org/docs/current/pgtrgm.html)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [Framer Motion](https://www.framer.com/motion/)

Mam nadzieję, że projekt przypadnie do gustu. Miłego przeglądania kodu! ✌️
