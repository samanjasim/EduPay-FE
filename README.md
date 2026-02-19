# EduPay Frontend

A school payment management platform built for the Iraqi market. EduPay provides administrators with tools to manage users, roles, permissions, and school payment workflows — with full support for English, Arabic, and Kurdish (including RTL).

## Tech Stack

| Technology | Version | Purpose |
|---|---|---|
| Vite | 6 | Build tool (SWC compiler) |
| React | 19 | UI framework |
| TypeScript | 5.9 | Type safety |
| Tailwind CSS | 4 | Utility-first styling |
| Zustand | 5 | State management (auth + UI) |
| React Query | 5 | Server state & caching |
| React Router | 7 | Client-side routing |
| react-i18next | 15 | Internationalization |
| React Hook Form + Zod | 7 / 4 | Form handling & validation |
| Axios | 1.13 | HTTP client with interceptors |
| Lucide React | — | Icon library |
| Sonner | — | Toast notifications |

## Features

- **Authentication** — Login and registration with JWT (access + refresh tokens)
- **Dashboard** — Admin overview with user/role stats
- **User Management** — List and view user details
- **Roles & Permissions** — CRUD roles, assign permissions and users
- **Theme Toggle** — Light (default) and dark mode
- **i18n** — English, Arabic (RTL), and Kurdish (RTL)
- **Schools** — Placeholder (coming soon)
- **Payments** — Placeholder (coming soon)

## Project Structure

```
src/
├── app/                 App entry, providers (React Query, ErrorBoundary, Suspense)
├── components/
│   ├── common/          ErrorBoundary, LoadingScreen, EmptyState
│   ├── guards/          AuthGuard, GuestGuard
│   ├── layout/          AuthLayout, MainLayout (Sidebar, Header)
│   └── ui/              Button, Input, Card, Modal, Spinner, Badge, Avatar, Select, Textarea
├── config/              API endpoints, route paths, query defaults
├── features/
│   ├── auth/            Login, Register (API, forms, pages)
│   ├── dashboard/       Dashboard page with stats
│   ├── users/           User list & detail (API, queries, pages)
│   ├── roles/           Role CRUD (API, queries, pages)
│   ├── schools/         Placeholder page
│   └── payments/        Placeholder page
├── hooks/               useDebounce, useMediaQuery
├── i18n/                i18next config + locale files (en, ar, ku)
├── lib/
│   ├── axios/           Axios client + auth/refresh/error interceptors
│   ├── query/           React Query client + query keys
│   └── validation/      Zod schemas (auth, roles)
├── routes/              Route definitions, AppRouter, NotFoundPage
├── stores/              Zustand stores (auth, UI)
├── styles/              Tailwind theme (light/dark CSS variables)
├── types/               TypeScript types (auth, user, role, API)
└── utils/               Storage helpers, cn utility
```

## Getting Started

### Prerequisites

- Node.js 18+
- npm
- Backend API running (default: `http://localhost:5000`)

### Installation

```bash
git clone https://github.com/samanjasim/EduPay-FE.git
cd EduPay-FE
npm install
```

### Environment Setup

Copy the example env file and adjust values as needed:

```bash
cp .env.example .env
```

### Run Development Server

```bash
npm run dev
```

The app starts at [http://localhost:3000](http://localhost:3000).

## Available Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start dev server on port 3000 |
| `npm run build` | Type-check and build for production |
| `npm run lint` | Run ESLint |
| `npm run preview` | Preview production build locally |

## Environment Variables

| Variable | Description | Default |
|---|---|---|
| `VITE_API_BASE_URL` | Backend API base URL | `http://localhost:5000/api/v1` |
| `VITE_APP_NAME` | Application display name | `EduPay` |
