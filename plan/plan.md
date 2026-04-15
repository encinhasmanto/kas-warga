## Plan: Performance & Security Refactor — DompetWarga

TL;DR — What, Why, How

- What: A prioritized implementation plan to fix immediate bugs, eliminate security risks (notably XSS), and improve performance (reduce large client-side aggregations, prevent subscription leaks, add pagination and indexing).
- Why: The app currently renders unsanitized rich HTML, creates realtime subscriptions without consistent cleanup, performs heavy client-side aggregation and full-table reads, and has at least one runtime bug causing crashes. These reduce reliability, open XSS and data-leak risks, and harm UX on large datasets.
- How: Apply short-term fixes (sanitization, safe JSON parsing, subscription cleanup, bug fix), medium improvements (DB-side aggregation/RPC, centralized subscription composable, query limits), and long-term refactors (store for shared data, virtualization, CI/tests, DB indexing). Each task is written for a junior dev or AI agent to implement.

**Steps**

1. MVP (Small, immediate; block = none)
   1. Fix runtime crash in DashboardView: remove or fix references to undefined `transactions` and move the derived calculations into the appropriate dashboard component or use `recentTransactions` that already exists. (_files:_ [src/views/DashboardView.vue](src/views/DashboardView.vue), [src/components/dashboard/AdminDashboard.vue](src/components/dashboard/AdminDashboard.vue)) — Effort: S (30–90m)
   2. Prevent XSS: sanitize all HTML rendered with `v-html`. Add a display-time sanitization wrapper (DOMPurify) and enforce server-side sanitization in bulletin creation. Update components that use `v-html` to bind to a sanitized computed string rather than raw content. (_files:_ [src/components/common/BulletinDetailModal.vue](src/components/common/BulletinDetailModal.vue), [src/components/dashboard/AdminDashboard.vue](src/components/dashboard/AdminDashboard.vue), [src/components/dashboard/ResidentDashboard.vue](src/components/dashboard/ResidentDashboard.vue), [src/views/BulletinView.vue](src/views/BulletinView.vue), [src/services/bulletinService.js](src/services/bulletinService.js)) — Effort: S (1–2h)
   3. Protect JSON parsing: wrap `JSON.parse` usages with try/catch and fall back to clearing `sessionStorage` or returning a safe default. Files: [src/services/supabaseClient.js](src/services/supabaseClient.js), [src/composables/useAuth.js](src/composables/useAuth.js), [src/components/layout/AdminLayout.vue](src/components/layout/AdminLayout.vue) — Effort: S (15–45m)
   4. Fix missing unsubscription in `TrackerView` and any components that create realtime channels without cleanup: store the `channel` object, call `supabase.removeChannel(channel)` on unmount or reuse the cleanup helper from `notificationService`. (_files:_ [src/views/TrackerView.vue](src/views/TrackerView.vue)) — Effort: S (30–90m)
   5. Enforce query size limits & lightweight selects: add `.range()` / `.limit()` and explicit select columns in list endpoints to avoid transferring full rows where not needed (bulletin list, transaction lists). (_files:_ services under [src/services](src/services)) — Effort: S (30–90m)

2. Medium (M; recommended after MVP)
   1. Centralize realtime subscription lifecycle: add a small composable (e.g., `useRealtime()` or reuse `subscribeToRealtimeNotifications`) that returns `{ subscribe, unsubscribe }` and update all components to call it. This avoids duplicated subscribe/unsubscribe code and race conditions. (_files:_ [src/services/notificationService.js](src/services/notificationService.js), components that subscribe: [src/views/TrackerView.vue](src/views/TrackerView.vue), [src/views/HistoryView.vue](src/views/HistoryView.vue), [src/components/dashboard/AdminDashboard.vue](src/components/dashboard/AdminDashboard.vue), [src/components/dashboard/ResidentDashboard.vue](src/components/dashboard/ResidentDashboard.vue)) — Effort: M (3–6h)
   2. Move heavy aggregations to DB: replace client-side `reduce` over full `transactions` pulls (e.g., `getKasBalance`) with a single DB aggregate (SUM) via Postgres SQL or a Supabase RPC. Add server-side endpoints (RPC) for `getKasBalance`, `monthly_performance` and similar. (_files:_ [src/services/transactionService.js](src/services/transactionService.js), [src/services/expenseService.js](src/services/expenseService.js)) — Effort: M (4–8h including DB RPC + testing)
   3. Introduce query/index guidelines and small DB changes: ensure indexes exist on `transactions(transaction_date)`, `transactions(unit_id)`, `payment_obligations(unit_id)`, `payment_transactions(unit_id)` — request DBA or run migrations in Supabase. This yields major query speed-ups for date filters and unit-scoped queries. — Effort: M (coordination + DB time)
   4. Improve bulletin payload for lists: for list endpoints return a trimmed `content_preview` and only full `content` on detail view. Update `getBulletins` to select limited fields for feeds. (_files:_ [src/services/bulletinService.js](src/services/bulletinService.js), bulletin components) — Effort: S–M (1–3h)
   5. Lazy-load heavy dashboard components: change `DashboardView` to async import `AdminDashboard` and `ResidentDashboard` to avoid bundling both on initial load. (_files:_ [src/views/DashboardView.vue](src/views/DashboardView.vue)) — Effort: S (15–60m)

3. Deep (L; medium-term refactor)
   1. Add a small shared store (Pinia or a simple composable) for shared state like `transactions`, `notifications`, and `session`. This prevents repeated fetching and reduces component re-renders. Replace ad-hoc multiple fetches with single-sourced data. — Effort: L (1–3 days)
   2. Introduce virtualization for large tables (e.g., `vue-virtual-scroller`) or server-side pagination and on-demand loading for history and reports. — Effort: L (2–5 days)
   3. Add CI (GitHub Actions): run lint, build, and tests on PRs; add dependabot for dependency updates. Add unit tests (Vitest) for core services and integration smoke tests for critical flows (bulletin create, transaction record). — Effort: L (1–3 days)
   4. Security hardening: implement CSP on deployment, ensure `rel=\"noopener noreferrer\"` for user-opened links, audit Supabase RLS / policies, rotate keys and ensure no service-role keys in clients. — Effort: L (varies)

**What / Why / How — Key Issues & Fixes**

- Unsanitized HTML (What): the app uses `v-html` to render `bulletin.content` and other stored HTML without sanitization. (
  **Why**: Stored HTML can include scripts, event handlers, or malicious attributes leading to XSS attacks and account/session compromise.)
  **How**: Add DOMPurify (or similar) and sanitize at display-time and sanitize/validate on creation (server-side). Steps: install `dompurify`, create a small helper `sanitizeHtml()` used by bulletin components and the server-side `createBulletin` flow. Prefer allowlist of tags and attributes.

- Subscription leaks & duplicate handlers (What): some views (e.g., `TrackerView`) open realtime channels without consistent cleanup, causing multiple subscriptions and repeated re-fetches.
  **Why**: Duplicate subscriptions cause wasted CPU/network, duplicate UI updates, memory leaks.
  **How**: Track channel objects and always call `supabase.removeChannel(channel)` on unmount or reuse a central `subscribe`/`unsubscribe` helper returned by `notificationService.subscribeToRealtimeNotifications()` (it already returns a cleanup function). Update `TrackerView` and any other ad-hoc subscriptions to use that pattern.

- Client-side aggregation (What): services like `getKasBalance` fetch all transactions and compute sums in JS.
  **Why**: Full-table reads become slow and bandwidth-heavy as data grows.
  **How**: Use DB-side aggregates or RPCs: `SELECT COALESCE(SUM(amount),0) AS balance FROM transactions` exposed via supabase RPC or `.select('sum(amount)')` pattern. Use DB indices for date/unit filters.

- Runtime bug: undefined variable in `DashboardView` (What): computed props reference `transactions` which is not defined in the file.
  **Why**: Causes runtime ReferenceError/crash, blocking dashboard render.
  **How**: Replace `transactions` references with `recentTransactions` or move the computed logic into the dashboard components that own the transactions data. Add a unit test or simple runtime guard to prevent crash (e.g., `if (!transactions) return 0`).

- Fragile JSON parsing (What): `JSON.parse(sessionStorage.getItem('dw_session')...)` without try/catch.
  **Why**: Corrupted session storage will throw and break components.
  **How**: Wrap `JSON.parse` with try/catch and on error clear the session, log, and return a fallback session object.

- Supabase keys & RLS (What): client-side uses Vite env variables for supabase anon key (expected). Ensure no service-role key is used client-side.
  **Why**: Service-role keys in clients allow full DB access and data leaks.
  **How**: Audit `.env` and deployment secrets; verify no `SUPABASE_SERVICE_ROLE` exposed in build. Move privileged actions to server-side endpoints.

**Verification**

1. Local dev smoke tests:
   - Start: `npm run dev` (Vite).
   - Open app and exercise: login, dashboard, bulletin create & view, tracker, history.
2. Performance profiling:
   - Chrome DevTools CPU profile and Memory snapshots during page load and while receiving realtime updates.
   - Lighthouse run and comparison before/after changes.
3. Functional checks:
   - Verify `v-html` content is rendered but scripts/event handlers removed.
   - Validate unsubscribes: navigate to pages that subscribe and ensure only a single channel exists (monitor network websocket/WS messages).
4. Unit tests & integration:
   - Add Vitest tests for `transactionService.getKasBalance()` (mock supabase to return small data and test RPC result path).
5. Security checklist:
   - Confirm no service role keys are committed and build artifacts do not contain them.
   - Confirm RLS policies permit only allowed operations for anon client tokens.

**Relevant files** (Top priorities)

- [src/services/supabaseClient.js](src/services/supabaseClient.js)
- [src/composables/useAuth.js](src/composables/useAuth.js)
- [src/components/forms/RichTextEditor.vue](src/components/forms/RichTextEditor.vue)
- [src/components/common/BulletinDetailModal.vue](src/components/common/BulletinDetailModal.vue)
- [src/views/BulletinView.vue](src/views/BulletinView.vue)
- [src/services/bulletinService.js](src/services/bulletinService.js)
- [src/services/transactionService.js](src/services/transactionService.js)
- [src/services/expenseService.js](src/services/expenseService.js)
- [src/services/notificationService.js](src/services/notificationService.js)
- [src/views/TrackerView.vue](src/views/TrackerView.vue)
- [src/views/HistoryView.vue](src/views/HistoryView.vue)
- [src/components/dashboard/AdminDashboard.vue](src/components/dashboard/AdminDashboard.vue)
- [src/components/dashboard/ResidentDashboard.vue](src/components/dashboard/ResidentDashboard.vue)
- [src/views/DashboardView.vue](src/views/DashboardView.vue)
- [src/components/layout/AdminLayout.vue](src/components/layout/AdminLayout.vue)
- [src/router/index.js](src/router/index.js)
- [src/main.js](src/main.js)
- [src/services/paymentService.js](src/services/paymentService.js)
- [src/components/modals/PaymentModal.vue](src/components/modals/PaymentModal.vue)
- [src/services/expenseService.js](src/services/expenseService.js)

**Verification commands & tools**

- Dev server: `npm run dev`
- Build preview: `npm run build` then `npm run preview`
- Profiling: Chrome DevTools CPU/Mem + Lighthouse (Performance & Best Practices)
- Add unit tests: install `vitest` and run `npx vitest` (plan to add tests in CI later)

**Decisions / Assumptions**

- Supabase is used as the backend; anon key is intentionally client-side. Privileged operations must be rerouted to server-side RPCs.
- We will prefer display-time sanitization plus server-side validation on create/update for stored HTML.
- Short-term changes should not change database schema except adding indexes or small RPCs; deeper refactor may require DB migrations.

**Further considerations**

1. Do you want me to draft the exact code change checklist (file-by-file diff + example snippets) for the MVP items so a junior dev or AI agent can implement them step-by-step? (I can produce patch-ready edits.)
2. If you have control over the Supabase project, I can also produce the SQL for recommended indexes and RPCs.
3. Recommend scheduling the work in two-week sprints: Week 1 = MVP fixes + tests; Week 2 = Medium improvements + DB changes.

---

If you approve, I'll (a) produce a prioritized PR-style checklist with exact file edits for the MVP fixes, or (b) produce the step-by-step code patches you can apply directly. Let me know which you'd prefer.
