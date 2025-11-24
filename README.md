# Budget Tracker

Aplikacja webowa do planowania budżetu i zarządzania oszczędnościami. Umożliwia tworzenie planów budżetowych, śledzenie kont oszczędnościowych oraz monitorowanie stanu finansów w czasie rzeczywistym.

## Funkcjonalności

- **Autentykacja użytkownika** - Rejestracja, logowanie, reset hasła z JWT
- **Plany budżetowe** - Tworzenie i zarządzanie kategoriami wydatków (jedzenie, transport, mieszkanie)
- **Konta oszczędnościowe** - Zarządzanie kontami bieżącymi, oprocentowanymi oraz celami oszczędnościowymi
- **Dashboard** - Przegląd sumy wydatków, oszczędności oraz alerty budżetowe
- **Profil użytkownika** - Zarządzanie danymi konta i preferencjami walutowymi

## Technologie

- **Frontend**: Next.js 14 (App Router), React 19, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes, Prisma ORM
- **Baza danych**: PostgreSQL
- **Autentykacja**: JWT (jsonwebtoken), bcrypt
- **Walidacja**: Zod
- **Deployment**: Vercel, Supabase/Railway

## Struktura projektu

```
budget-tracker/
├── app/
│   ├── api/              # API routes (auth, plans, savings, dashboard)
│   ├── (dashboard)/      # Chronione strony aplikacji
│   └── auth/             # Strony logowania i rejestracji
├── components/            # Komponenty React
├── lib/                  # Utilities (auth, db, api-client)
├── types/                # TypeScript definitions
└── prisma/               # Schema bazy danych
```

## Model danych

- **Users** - Dane użytkowników, preferencje walutowe
- **BudgetPlans** - Plany budżetowe z kategoriami i kwotami miesięcznymi
- **SavingsAccounts** - Konta oszczędnościowe (bieżące, oprocentowane, cele)
- **Sessions** - Sesje użytkowników (JWT tokens)

## Instalacja

```bash
# Klonowanie repozytorium
git clone https://github.com/username/budget-tracker.git
cd budget-tracker

# Instalacja zależności
npm install

# Konfiguracja zmiennych środowiskowych
cp .env.example .env.local
# Edytuj .env.local i uzupełnij:
# DATABASE_URL="postgresql://..."
# JWT_SECRET="your-secret-key"

# Inicjalizacja bazy danych
npx prisma migrate dev
npx prisma generate

# Uruchomienie w trybie deweloperskim
npm run dev
```

Aplikacja będzie dostępna pod adresem `http://localhost:3000`

## API Endpoints

### Autentykacja
- `POST /api/auth/register` - Rejestracja
- `POST /api/auth/login` - Logowanie
- `POST /api/auth/logout` - Wylogowanie
- `GET /api/auth/me` - Informacje o zalogowanym użytkowniku

### Plany budżetowe
- `GET /api/plans` - Lista planów
- `POST /api/plans` - Utworzenie planu
- `PATCH /api/plans/:id` - Aktualizacja planu
- `DELETE /api/plans/:id` - Usunięcie planu

### Konta oszczędnościowe
- `GET /api/savings` - Lista kont
- `POST /api/savings` - Utworzenie konta
- `PATCH /api/savings/:id` - Aktualizacja konta
- `DELETE /api/savings/:id` - Usunięcie konta

### Dashboard
- `GET /api/dashboard/summary` - Podsumowanie finansowe

## Status projektu

MVP - Wersja minimalna z podstawowymi funkcjonalnościami zarządzania budżetem i oszczędnościami.

## Licencja

MIT

