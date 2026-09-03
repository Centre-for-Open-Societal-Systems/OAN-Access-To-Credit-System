# Project Structure & Conventions

> **For AI agents / contributors:** Read this before creating or moving files. It describes the *actual* layout and conventions of this repo (a Next.js App Router + Redux Toolkit frontend). When you add code, mirror the nearest existing feature — do not invent new folder shapes.

---

## Stack (as actually used)

| Concern            | Tool in this repo                                                            |
| ------------------ | --------------------------------------------------------------------------- |
| Framework          | Next.js (App Router, RSC)                                                    |
| Language           | TypeScript (strict), `.tsx` for components                                  |
| **Server + client state** | **Redux Toolkit** (`createSlice`, `createAsyncThunk`) — *not* Zustand/React Query, despite generic profile defaults |
| Data fetching      | Plain `service` objects in each feature's `api/`, called from thunks        |
| Styling            | Tailwind CSS; CSS Modules (`*.module.css`) only where Tailwind is insufficient |
| Validation         | Zod (see `schemas/`, `src/lib/api/api.schemas.ts`)                           |
| Path alias         | `@/*` → `./src/*` (always prefer over deep relative imports)                |

> ⚠️ The personal profile in [.claude/CLAUDE.md](../.claude/CLAUDE.md) lists Zustand/React Query and a different `components/features/services/stores` tree. That profile describes the engineer's general preferences, **not this codebase**. This file wins for structural decisions here.

---

## Top-level `src/` layout

```
src/
├── app/                    # Next.js App Router — routes, layouts, route groups, API routes
│   ├── (dashboard)/        # route group (parenthesized = no URL segment)
│   ├── (portal-account)/
│   └── api/                # Route handlers
├── features/               # Feature-sliced modules (the primary place new code goes)
├── components/             # SHARED cross-feature components only
│   ├── ui/                 # Design-system primitives (Button, TextField, SelectField…)
│   ├── header/
│   └── siderbar/
├── hooks/                  # Shared cross-feature hooks
├── lib/                    # Framework-agnostic utils, api client, auth, logger
│   ├── api/                # fetchApi, apiErrors, shared zod schemas (+ *.test.ts)
│   └── auth/               # rbac
├── store/                  # Root Redux store: index.ts (configureStore) + hooks.ts (typed useAppDispatch/useAppSelector)
├── mocks/                  # Mock data / handlers
├── types/                  # Truly global shared types
└── styles/                 # Global styles
```

---

## Feature slice anatomy (the important part)

Everything feature-specific lives in `src/features/<feature>/`. Use only the subfolders you need; mirror an existing feature (`leads` is the fullest example):

```
src/features/leads/
├── index.ts                # Barrel: public API of the feature (see rules below)
├── api/
│   └── lead.service.ts     # `export const leadService = { async getLeads(...) {...} }`
├── components/
│   └── LeadTable.tsx       # PascalCase; feature components prefixed with feature name
├── store/
│   └── leadSlice.ts        # createSlice + createAsyncThunk; exports reducer, actions, selectors
├── hooks/
│   └── useLeadInitialization.ts
├── constants/
│   └── leads.constants.ts
├── schemas/                # Zod schemas (see new-lead)
├── types/
│   └── leads.types.ts
└── utils/                  # feature-local pure helpers (see loans)
```

Route groups can appear as feature names too, e.g. `src/features/(bank-admin)/`, `src/features/(farmer-application)/`, matching App Router route groups.

---

## Naming conventions (observed)

| Kind                | Convention              | Example                       |
| ------------------- | ----------------------- | ----------------------------- |
| Component files     | `PascalCase.tsx`        | `LeadTable.tsx`, `LoginClient.tsx` |
| Feature components  | Prefixed with feature   | `Lead*`, `Loan*`              |
| Client components    | `…Client.tsx` suffix    | `LeadsDashboardClient.tsx`    |
| Services            | `<entity>.service.ts`, `const <entity>Service` | `lead.service.ts` → `leadService` |
| Slices              | `<entity>Slice.ts`, `<entity>Reducer` export | `leadSlice.ts` → `leadReducer` |
| Types               | `<feature>.types.ts`    | `leads.types.ts`              |
| Constants           | `<feature>.constants.ts`| `leads.constants.ts`          |
| Hooks               | `use…` camelCase        | `useLeadInitialization.ts`    |
| CSS Modules         | `<Component>.module.css`| `TimePickerField.module.css`  |
| Tests               | colocated `*.test.ts`   | `fetchApi.test.ts`            |

---

## Import & barrel rules

- **Use the `@/` alias** for anything outside the current folder: `import { logger } from '@/lib/logger'`. Relative imports are used for close siblings and (currently) for the root store (`../../../store`), but prefer `@/store` for new code.
- **Each feature exposes a barrel `index.ts`** re-exporting its public surface: the service, the slice's actions + selectors + thunks, and its public types. Import *across* features via the barrel (`@/features/new-lead`), not deep paths.
- Do not create barrels that cause circular deps — features already import each other's thunks via barrels (leads ← new-lead); keep that direction acyclic.

---

## State (Redux Toolkit) conventions

- Async work = `createAsyncThunk`. In the thunk, **re-throw `AbortError`**, otherwise `rejectWithValue(error.message)`. See `leadSlice.ts`.
- Register every feature reducer in [`src/store/index.ts`](../src/store/index.ts) `configureStore`.
- Consume state with the typed `useAppDispatch` / `useAppSelector` from [`src/store/hooks.ts`](../src/store/hooks.ts) — never bare `useDispatch`/`useSelector`.
- Cross-cutting behavior (session expiry on 401, sessionStorage persistence) lives in **middleware in `store/index.ts`**, not in slices/components.
- Export **selectors** from the slice (prefix `select…`) and use them; don't reach into state shape inline.

---

## API / service conventions

- One `service` object per entity in `features/<f>/api/<entity>.service.ts`, methods `async` returning typed responses, accepting an optional `AbortSignal`.
- Map backend errors through `httpStatusToErrorCode` / `ApiErrorCode` from [`src/lib/api/apiErrors.ts`](../src/lib/api/apiErrors.ts).
- Log with the shared `logger` from [`src/lib/logger.ts`](../src/lib/logger.ts) — no `console.*`.
- Document backend field-name quirks inline (see the `min_loan_amount` comment in `lead.service.ts`).

---

## Where do I put a new…?

| You're adding…                              | Put it in…                                              |
| ------------------------------------------- | ------------------------------------------------------- |
| A component used by one feature             | `features/<f>/components/`                               |
| A reusable primitive (button, input, modal) | `components/ui/`                                         |
| A component shared by 2+ features           | `components/`                                            |
| A data call                                 | `features/<f>/api/<entity>.service.ts` (+ barrel export)|
| Async state / mutations                     | a thunk + slice in `features/<f>/store/` (register in root store) |
| A feature-only hook                         | `features/<f>/hooks/`                                    |
| A cross-feature hook                        | `src/hooks/`                                             |
| A pure util with no framework deps          | `src/lib/` (or `features/<f>/utils/` if feature-local)  |
| A new route/page                            | `src/app/<route>/` (use route groups `(name)` to organize without URL segments) |
| A Zod schema                                | `features/<f>/schemas/` or `src/lib/api/api.schemas.ts` if shared |

---

## Docs index

- [docs/api-flow-frontend.md](../docs/api-flow-frontend.md) — frontend API flow
- [docs/seller-backend.md](../docs/seller-backend.md) — backend seller API contract
- [docs/frontend-development-guide.md](../docs/frontend-development-guide.md) — frontend development guide
- [.agents/.gemini/api-flow-backend.md](.gemini/api-flow-backend.md) — backend API flow (referenced by services)
- Code-authoring/quality rules for the engineer: [.claude/CLAUDE.md](../.claude/CLAUDE.md) (preferences), [.agents/code-review-agent/rules.md](code-review-agent/rules.md)
