# Meridian CRM — Frontend

A Zoho-CRM-style lead management frontend built with Next.js (App Router),
TypeScript, and Tailwind CSS v4, talking to the Django + DRF backend
described in the project's backend handoff doc.

## Stack

- Next.js 15 (App Router) + React 19 + TypeScript
- Tailwind CSS v4 (theme tokens in `src/app/globals.css`)
- axios, with a request/response interceptor that attaches the access token
  and silently refreshes it on a 401
- lucide-react for icons

## Project structure

```
src/
├── app/
│   ├── login/page.tsx
│   ├── dashboard/
│   │   ├── layout.tsx        → Sidebar + top bar + auth guard for everything below
│   │   ├── page.tsx          → Home (KPIs + recent leads)
│   │   ├── leads/
│   │   │   ├── page.tsx      → Leads list (search, paginate, 3-dot menu)
│   │   │   ├── new/page.tsx
│   │   │   └── [id]/
│   │   │       ├── page.tsx       → Lead detail (status pipeline, Show/Hide Details)
│   │   │       └── edit/page.tsx
│   │   ├── contacts/         → same list/create/detail pattern
│   │   └── accounts/         → same list/create/detail pattern
│   └── layout.tsx / page.tsx (redirects to /login or /dashboard)
├── features/
│   ├── auth/        → LoginForm, authService, authStorage, auth.types
│   ├── dashboard/    → Sidebar, DashboardHeader (top bar), dashBoardStats
│   ├── teamspace/    → Super-Admin-only teamspace switcher (see note below)
│   ├── leads/        → LeadList, LeadForm, LeadDetail, LeadService, lead.types
│   ├── contacts/     → mirrors leads, backed by ContactService (see note below)
│   ├── accounts/     → mirrors leads, backed by AccountService (see note below)
│   └── users/        → userService (users list + GET /lead-owners/)
├── shared/components/OwnerPicker.tsx  → searchable "assign owner" combobox
└── infrastructure/api/client.ts       → shared axios instance + token refresh
```

## 1. Run the frontend

```bash
npm install
cp .env.example .env.local
npm run dev
```

`.env.local`:

```
NEXT_PUBLIC_API_URL=http://127.0.0.1:8000/api
```

## 2. Endpoints this frontend calls

| Call | Method & path | Notes |
|---|---|---|
| Login | `POST /auth/login/` | `{ email, password }` → `{ access_token, refresh_token, token_type }` |
| Current user | `GET /users/me/` | `{ id, name, email, role }`. Drives the Super Admin gate (`role` is compared case/format-insensitively — `"SUPERADMIN"` matches). |
| Token refresh | `POST /auth/refresh/` | Body is `{ refresh_token }` (confirmed against your Postman collection — **not** SimpleJWT's default `refresh` key). |
| Lead owners | `GET /lead-owners/` | `[{ id, name, email }]` — powers the Lead Owner picker on create/edit. |
| Leads | `GET/POST /leads/`, `GET/PATCH/DELETE /leads/{id}/` | See field list below. |

### Lead fields

`Lead` mirrors the domain enums you supplied (`lead_source.py`, `lead_status.py`,
`lead_rating.py`, `lead_industry.py`) value-for-value — the dropdowns can't
send anything the API would reject.

**Only `email` and `owner_id` are required** to create a lead; every other
field (`name`, `company_name`, `title`, `phone`, `mobile_number`, `fax`,
`website`, `lead_source`, `lead_status`, `industry`, `rating`,
`number_of_employees`, `annual_revenue`, `address`, `city`, `state`,
`country`, `postal_code`, `description`) is optional. Your backend's
`CreateLeadDTO` / domain entity / `DjangoLeadModel` need to accept this
same shape — the migration for the extra columns from the previous round
plus `lead_status`, `rating`, `industry`, `fax`, `title` still needs to land
if it hasn't already.

### CORS

```python
CORS_ALLOWED_ORIGINS = ["http://localhost:3000"]
```

## 3. What's built

- **Login** with JWT storage + silent refresh on 401.
- **Sidebar** (Zoho-style): Home, a Teamspace switcher, and Leads / Contacts
  / Accounts navigation.
- **Leads**: paginated list (10/page) with a row-hover 3-dot menu
  (Edit/Delete), full create/edit form matching the Zoho field layout
  (Lead Owner combobox showing name + email, sourced from
  `GET /lead-owners/`, defaulting to the signed-in user on create), and a
  detail page with the status pipeline strip and a Show Details/Hide
  Details toggle — all matching the two screen recordings.
- **Contacts** and **Accounts**: same list/create/detail UX as Leads.

### Note: Contacts, Accounts, and Teamspace are frontend-only for now

Your backend doc only defines a `leads` module — there's no
`/api/contacts/`, `/api/accounts/`, or `/api/teamspaces/` yet. So:

- `ContactService` and `AccountService` (`src/features/contacts/services`,
  `src/features/accounts/services`) persist to `localStorage` using the
  **exact same async method names** (`getX`, `createX`, `updateX`,
  `deleteX`) a real `apiClient`-backed service would use. Swapping them
  over later means changing the inside of those two files only — no page
  or component needs to change.
- `teamspaceService` (`src/features/teamspace/services`) is the same story:
  Super Admins can create a teamspace from the sidebar switcher, but it's
  stored locally rather than shared across users/devices until there's a
  backend endpoint for it.

### Note: role gating

There's no fixed `UserRole` union anymore — `isSuperAdmin(user)` /
`isAdmin(user)` (in `features/auth/types/auth.types.ts`) normalize
whatever string `GET /users/me/` returns (`"SUPERADMIN"`, `"Super Admin"`,
`"super_admin"` all match) rather than hardcoding one casing.

## Troubleshooting

- **Stuck on "Checking your session…":** no access token in the browser —
  log in again.
- **401 loop right after logging in:** check the `/auth/refresh/` request
  in the Network tab — the body key must be `refresh_token`, and the
  response must include `access_token`.
- **Lead Owner picker is empty:** confirm `GET /lead-owners/` is reachable
  and returns `[{ id, name, email }]`.
