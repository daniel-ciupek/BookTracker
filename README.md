# BookTracker 📚

Cześć! Przed Tobą **BookTracker** – pełnoprawna aplikacja full-stack stworzona do katalogowania, oceniania i recenzowania książek. Projekt został zaprojektowany tak, aby z łatwością poradzić sobie ze zbiorem danych liczącym **nawet do 10 milionów rekordów**.

Aplikacja posiada nowoczesny, w pełni responsywny interfejs użytkownika w stylu *Ultra-Modern Glassmorphism* (z płynnymi animacjami i domyślnym trybem ciemnym).

---

## ⚡ Błyskawiczny start (Docker One-Click)

Aplikacja jest w pełni zautomatyzowana. Nie musisz instalować PHP, Node.js ani bazy danych na swoim systemie. **Wystarczy jedno polecenie**, które postawi całą infrastrukturę, zbuduje backend i frontend oraz zasili bazę danymi testowymi:

```bash
docker compose up -d --build
```

### Po uruchomieniu:
- **Aplikacja (Frontend + API):** dostępna pod adresem [http://localhost](http://localhost)
- **Konto demo:** `demo@example.com` / hasło: `password`
- **Dane:** Baza zostanie automatycznie zasilona zestawem ponad 10 000 książek.

---

## 🚀 Kluczowe funkcje

- **Zarządzanie książkami:** Dodawanie nowych pozycji (Tytuł, Autor, ISBN, Strony) z matematyczną walidacją numerów ISBN-10/13.
- **System społecznościowy:** Wspólny katalog, średnia ocen użytkowników, pisanie i edycja recenzji.
- **Statusy czytania:** Śledzenie postępów (Chcę przeczytać, Czytam, Przeczytane).
- **Zaawansowane wyszukiwanie:** Błyskawiczny Fuzzy Search (tytuł/autor) oparty na indeksach GIN, filtry gatunków oraz widok "Moje publikacje".
- **Ultra-Modern UI:** Przełączany tryb Jasny/Ciemny, efekt "szronionego szkła" (Glassmorphism) i płynna fizyka ruchu (Framer Motion).

---

## 🏗 Architektura dla 10M rekordów

To zadanie rekrutacyjne było wyzwaniem wydajnościowym, które rozwiązałem stosując techniki klasy Enterprise:

1. **Cursor-Based Pagination:** Eliminuje problem spowolnienia przy milionach rekordów (stały czas dostępu $O(1)$).
2. **Indeksy GIN (Trigramy):** PostgreSQL wyszukuje fragmenty tekstu w ułamku sekundy, nawet w tabeli liczącej 10 milionów wierszy.
3. **Redis Caching:** Agregacje (średnie ocen) są buforowane w pamięci RAM, co drastycznie odciąża procesor bazy danych.
4. **Wirtualizacja Listy:** Frontend renderuje tylko te elementy, które widzisz, dzięki czemu przeglądarka działa płynnie przy nieskończonym scrollowaniu.

---

## 🛠 Stos technologiczny

| Warstwa | Technologia |
|---|---|
| **Frontend** | React 18, TypeScript, Vite, Tailwind CSS, Framer Motion, Lucide |
| **Backend** | Laravel 13, PHP 8.3 |
| **Baza danych** | PostgreSQL 16 |
| **Cache** | Redis 7 |
| **Infrastruktura** | Docker, Nginx (jako Reverse Proxy i serwer statyczny) |

---

## ✅ Testy i Stabilność (CI/CD)

Projekt zawiera łącznie **134 testy automatyczne** (na wszystkich branchach łącznie), które gwarantują poprawność działania każdej funkcji:
- **Backend (Pest PHP):** 84 testy (Feature & Unit).
- **Frontend (Vitest):** 50 testów (Komponenty & Logika).

Każda zmiana jest weryfikowana przez **GitHub Actions**, który uruchamia lintery i testy w odizolowanym środowisku kontenerowym.

---

## 🤖 Wykorzystanie AI (Claude Code & Gemini)

W procesie tworzenia aplikacji wspierałem się narzędziami AI: **Claude Code** oraz **Gemini CLI**.

**Jak wyglądał proces?**
- AI pomagało mi w szybkiej konfiguracji infrastruktury Dockerowej oraz sugerowało optymalne podejście do paginacji kursorowej.
- **Ręczna weryfikacja:** Nigdy nie kopiowałem kodu "w ciemno". Każdą funkcję dokładnie **przeklikałem ręcznie**, testując błędy walidacji, zachowanie responsywne na telefonie oraz płynność animacji.
- **Dokumentacja:** Korzystałem z oficjalnych dokumentacji [React](https://react.dev/), [Laravel](https://laravel.com/docs), [PostgreSQL](https://www.postgresql.org/docs/current/pgtrgm.html) oraz [Framer Motion](https://www.framer.com/motion/).

---

## ⚙️ Wdrożenie produkcyjne (Real-world)

Aby przenieść tę aplikację z wersji demo na prawdziwy serwer:
1. Należy użyć `.env.prod` z bezpiecznymi hasłami i unikalnym `APP_KEY`.
2. Skonfigurować **SSL (HTTPS)** na poziomie Nginx lub Load Balancera.
3. Podpiąć serwer **SMTP** (np. Mailgun/AWS SES) dla obsługi resetowania haseł.
4. Dodać monitoring błędów (np. **Sentry**) oraz wydajności (Laravel Pulse).

---
*Projekt przygotowany z dbałością o detale i wydajność. Miłego testowania! ✌️*
