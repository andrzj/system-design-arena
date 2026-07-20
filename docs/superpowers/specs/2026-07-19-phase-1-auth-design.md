# Phase 1: Supabase Authentication & User Profiles — Design Spec

**Date:** 2026-07-19  
**Status:** Approved  
**Reference:** [`TASKS.md`](../../TASKS.md) Phase 1

## Goal

Wire real Supabase Auth (email/password) to the app, create Prisma `Profile` rows on sign-up, expose auth state to the UI, and add server-side daily sim counter helpers.

## Decisions

| Decision | Choice |
|---|---|
| Supabase hosting | Self-hosted (`supabase.local`) |
| Sign-in methods | Email/password only (OAuth deferred) |
| Profile creation | Server action immediately after `signUp` |
| Client auth state | Extend existing Zustand store + `AuthProvider` |
| OAuth callback (1.3) | Deferred |

## Architecture

```
Sign-up → signUpAction → supabase.auth.signUp + prisma.profile.create
Sign-in → signInAction → supabase.auth.signInWithPassword
Sign-out → signOutAction → supabase.auth.signOut

Middleware → session refresh + protect /dashboard/*, /session/*

AuthProvider → onAuthStateChange → fetchProfileAction → Zustand store
Header → anonymous CTAs OR UserMenu dropdown
```

## Components

### Server (`src/lib/auth/`)

- **`actions.ts`** — `signUpAction`, `signInAction`, `signOutAction`, `fetchProfileAction`
- **`profile.ts`** — `createProfileForUser`, `ensureProfile` (safety net)
- **`tier.ts`** — `getUserTier`, `isPaidTier`, `SubscriptionTier` type

### Client

- **`src/store/auth-store.ts`** — Real Supabase integration; expose `user`, `profile`, `isLoading`
- **`src/hooks/useAuth.ts`** — Thin selector wrapper
- **`src/components/shared/AuthProvider.tsx`** — Init session + listener
- **`src/components/shared/Header.tsx`** — Auth-aware navigation
- **`src/components/shared/UserMenu.tsx`** — Avatar dropdown (settings, sign out)

### Pages

- **`src/app/auth/sign-in/page.tsx`** — Email/password form, `redirect_url` support
- **`src/app/auth/sign-up/page.tsx`** — Registration form

### Rate limiting (`src/lib/utils/rate-limit.ts`)

Server-side only:

- `resetDailyCounterIfNeeded(profile)` — UTC date comparison
- `canStartSim(profile, tier)` — free: 1/day; paid: unlimited
- `incrementSimCount(userId)` — atomic Prisma update

### Task 1.1 — Self-hosted Supabase setup (documentation)

Document in README:

- Auth enabled, email provider on
- Site URL: `http://localhost:3030`
- Redirect URLs: `http://localhost:3030/**`

## Error handling

- Sign-up with duplicate email → show Supabase error message
- Profile create fails after auth user created → log error; `ensureProfile` on next request
- Unauthenticated access to protected routes → middleware redirect to `/auth/sign-in?redirect_url=...`

## Testing

- **Unit:** `getUserTier`, rate-limit helpers (Vitest)
- **Manual (1.9):** sign up → profile in DB → protected route → sign out

## Out of scope

- OAuth callback route
- `/settings` page implementation (link only)
- Stripe tier upgrades
- Playwright E2E (Phase 12)
