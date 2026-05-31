# Autor
Daniel Ciupek
dciupek0@gmail.com
tel: 798277925


# BookTracker

Aplikacja full-stack do katalogowania, oceniania i recenzowania książek. Zaprojektowana z myślą o zbiorach danych liczących **do 10 milionów rekordów**.

---

## Błyskawiczny start (Docker)

Nie wymaga lokalnej instalacji PHP, Node.js ani PostgreSQL. Jedno polecenie stawia całą infrastrukturę, buduje backend i frontend oraz zasila bazę danych:

```bash
docker compose up -d --build
```

**Po uruchomieniu:**
- Aplikacja: [http://localhost](http://localhost)
- Konto demo: `demo@example.com` / `password`
- Baza jest automatycznie zasilana zestawem 10 000+ książek

---

## Zaimplementowane funkcje

### Wymagania z zadania
- **Dodawanie książek** — formularz z polami Tytuł, Autor, ISBN (walidacja formatu ISBN-10/13), Liczba stron, Ocena (1–5); walidacja po stronie klienta (Zod + React Hook Form) i serwera (Laravel Form Requests) z komunikatami błędów przy każdym polu
- **Lista książek** — infinite scroll z paginacją kursorową, wirtualizacja listy (tylko widoczne elementy w DOM)
- **Skalowalność do 10M rekordów** — szczegóły w sekcji architektury poniżej
- **Wyszukiwanie** *(bonus)* — po tytule i autorze jednocześnie, oparty na indeksach GIN, debounce 300ms, minimalna długość frazy: 3 znaki

### Poza zakresem zadania (zaimplementowane dodatkowo)
- **Uwierzytelnianie** — rejestracja, logowanie, reset hasła (Laravel Sanctum, Bearer tokens)
- **System ocen per-użytkownik** — każdy użytkownik ocenia każdą książkę niezależnie; wyświetlana jest średnia wszystkich ocen
- **Recenzje** — dodawanie, edycja i usuwanie własnych; lista z paginacją kursorową
- **Statusy czytania** — Chcę przeczytać / Czytam / Przeczytane per użytkownik
- **Filtry** — gatunek literacki, widok "Moje książki"

---

## Architektura dla 10M rekordów

| Technika | Uzasadnienie |
|----------|-------------|
| **Cursor-based pagination** | Stały czas zapytania O(1) niezależnie od głębokości strony; `OFFSET` degraduje do O(n) przy dużych zbiorach |
| **Indeksy GIN (pg_trgm)** | Wyszukiwanie ILIKE na 10M wierszach w < 50ms; bez indeksu: pełny sekwencyjny skan tabeli |
| **Redis cache** | Agregaty (średnia ocen, liczba recenzji) obliczane raz i buforowane z TTL 60s; odciąża CPU bazy danych |
| **Wirtualizacja listy** | `@tanstack/react-virtual` renderuje tylko ~10 kart w DOM niezależnie od liczby rekordów |

---

## Stos technologiczny

| Warstwa | Technologia |
|---------|-------------|
| Frontend | React 18, TypeScript, Vite |
| Formularze | React Hook Form + Zod |
| Data fetching | TanStack Query v5 |
| Style | Tailwind CSS v3, Framer Motion |
| Backend | Laravel 13, PHP 8.3 |
| Baza danych | PostgreSQL 16 |
| Cache | Redis 7 |
| Uwierzytelnianie | Laravel Sanctum |
| Infrastruktura | Docker, Nginx |

---

## Testy i CI/CD

**134 testy automatyczne** — 84 backendowe (Pest PHP) + 50 frontendowych (Vitest).

**Backend** pokrywa: wszystkie endpointy API (Feature tests z prawdziwą bazą danych, bez mocków), walidację żądań, reguły biznesowe (`ValidIsbn`), autoryzację Sanctum.

**Frontend** pokrywa: renderowanie komponentów, walidację formularzy, stany loading/error, interakcje użytkownika (kliknięcia, wpisywanie, hover).

Każdy commit jest weryfikowany przez **pre-commit hook** (`pint → phpstan → eslint → testy`), a każdy push przez **GitHub Actions** uruchamiający pełny pipeline w odizolowanym środowisku kontenerowym.

---

## Uwaga o interfejsie użytkownika

Interfejs jest funkcjonalny i responsywny, ale nie jest wizualnie dopracowany. Był to świadomy wybór — w ramach ograniczonego czasu skupiłem się na tym, co uważam za ważniejsze z perspektywy oceny kodu: **solidnej architekturze backendowej, pokryciu testami i konfiguracji CI/CD**. Dopracowanie UI (animacje, spójność stylów) było na liście, ale nie zmieściło się w priorytecie.

---

## Ograniczenia i możliwe usprawnienia

- **Brak moderacji treści** — recenzje nie są moderowane; w produkcji: kolejka moderacji lub integracja z zewnętrznym API
- **Reset hasła** — działa lokalnie (logi), wymaga konfiguracji SMTP w produkcji (Mailgun / AWS SES)
- **Cache invalidation** — uproszczony TTL 60s; w produkcji warto rozważyć precyzyjne unieważnianie przez zdarzenia domenowe
- **Brak monitoringu** — Monolog → stderr; w produkcji: Sentry + Laravel Telescope

---

## Wykorzystanie AI

W procesie tworzenia korzystałem z **Claude Code** i **Gemini CLI** jako narzędzi wspomagających.

AI pomagało przy: konfiguracji boilerplate Dockera i Nginx, generowaniu migracji i seedera, sugestiach struktury kodu. Każdy wygenerowany fragment weryfikowałem ręcznie — czytając diff przed commitem, przeklikując funkcje i uruchamiając testy. Decyzje architektoniczne (cursor pagination, GIN indexy, Redis cache, struktura API) podejmowałem samodzielnie.
