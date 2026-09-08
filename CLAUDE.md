# Agent notes

- Stack: Next.js (App Router) + TypeScript + Tailwind v4 + axios + lucide-react.
  No TanStack Query, no form libraries — data fetching is plain
  `useEffect`/`useState` inside page components.
- Feature-first structure: business logic lives under `src/features/<name>/`
  (`components/`, `services/`, `types/`). Routing lives only under `src/app/`.
- All real HTTP calls go through `src/infrastructure/api/client.ts`. Never
  call `axios`/`fetch` directly from a component.
- `ContactService`, `AccountService`, and `teamspaceService` are
  **localStorage-backed mocks** (no backend endpoints exist yet) but expose
  the same async method shape a real API-backed service would. When the
  backend adds `/api/contacts/`, `/api/accounts/`, `/api/teamspaces/`,
  rewrite the inside of those three files only.
- Tokens live in `authStorage`. Don't read `localStorage` directly for auth
  state elsewhere.
- Role checks always go through `isSuperAdmin()`/`isAdmin()`
  (`features/auth/types/auth.types.ts`) — never compare `user.role`
  directly, since the backend's casing isn't guaranteed.
- Any page that reads `useSearchParams()` must export a thin wrapper that
  renders the real component inside `<Suspense>` (see
  `src/app/dashboard/leads/page.tsx` for the pattern) — Next.js requires
  this at build time.
- Tailwind theme tokens (colors, fonts) are defined once in
  `src/app/globals.css` via `@theme`. Reuse `bg-ink`, `text-ink-soft`,
  `bg-amber`, etc.
- The Lead Owner / Contact Owner / Account Owner picker is the shared
  `src/shared/components/OwnerPicker.tsx` — don't fork a new copy per form.
