# UX/UI Revamp — Roadmap & TODO

Goal
- Rework the entire frontend UX: not just colors but component structure, layout, forms, interaction patterns, accessibility, and developer ergonomics. Deliver a consistent, token-driven design system and migrate pages incrementally with minimal user disruption.

Changelog (recent changes)
- [done] Added centralized theme tokens: `src/styles/theme.ts`.
- [done] Implemented Card primitive and added default export: `src/components/UI/Card.tsx`.
- [done] Button primitive stabilized (multiple edits; reconcile manual edits): `src/components/UI/Button.tsx`.
- [done] Skeleton primitive created: `src/components/UI/Skeleton.tsx` (linter flagged a small inline style).
- [done] ToastProvider and `useToast` implemented and mounted at app root: `src/components/Feedback/ToastProvider.tsx`, `src/frontend/src/main.tsx`.
- [done] Input primitive scaffolded: `src/components/UI/Input.tsx`.
- [done] Replaced loading placeholders with `Skeleton` in `src/pages/Dashboard.tsx` and `src/pages/ClaimAlias.tsx`.
- [done] Preserved redirect and auth gating changes (authReady/sessionStorage) already implemented earlier.

Phases (high level)

Phase 0 — Foundation (tokens + primitives)
- Create centralized theme tokens (colors, spacing, radii, shadows, motion) in `src/styles/theme.ts` (done).
- Add Tailwind config mapping or CSS variables to expose tokens to utilities.
- Implement core UI primitives that consume tokens:
  - Button (done), Card (done), Input (done), Text, Icon, Skeleton (done), Tooltip, Avatar.
  - Feedback primitives: ToastProvider + useToast (done), Inline validation messages.
- Acceptance: all primitives exported from `src/components/UI/*` and documented in `src/components/UI/README.md`.

Phase 1 — Page shell & navigation
- Stabilize app shell: `Layout`, `Sidebar`, `Topbar` with responsive behavior.
- Ensure loading states never hide shell; use `Skeleton` for page content placeholders. (Skeleton wired into Dashboard & ClaimAlias — partial)
- Implement consistent page header pattern (title, subtitle, primary action on the right).
- Acceptance: navigating between pages keeps sidebar visible and shows skeletons for content regions.

Phase 2 — Forms & flows (UX-first)
- Standardize form primitives: `Input`, `Select`, `Switch`, `Radio`, `FormRow`, `FormGroup`.
- Build accessible modal and slide-over primitives for create/edit flows.
- Redesign critical flows with UX improvements:
  - Claim Alias (one-time flow): prominent affixed header, clear CTA, confirmation modal, copy affordance. (form and flow implemented; needs modal confirm + toast)
  - Create Rule: guided multi-step modal or slide-over; preview of rule effect; validation and examples.
  - Channel Connect: provider-specific connectors (email, webhook, telegram) with inline diagnostics.
- Acceptance: forms are keyboard-accessible, have clear validation UI, and use reusable primitives.

Phase 3 — Data surfaces & interactions
- Rework list, table, and card patterns:
  - Message Activity: improved charts, stacked bars, per-item actions (view, retry, inspect), inline filters.
  - Rules list: sortable, searchable, bulk actions, per-row quick toggle for active/inactive.
  - Channels page: connect, test connection, show status, quick disconnect.
- Add optimistic UI for actions where possible (toggle rule active, create channel) with undo snackbars.
- Acceptance: interactions feel instantaneous; error pathways clearly surfaced and recoverable.

Phase 4 — Visual polish & branding
- Apply final tokens to gradients, elevations, typography, micro-interactions.
- Align visuals with Landing page aesthetic (hero gradients, glass panels, large rounded cards).
- Ensure dark-mode contrast and legibility.
- Acceptance: visual QA pass vs. design tokens and screenshots for core pages.

Phase 5 — Accessibility, testing & release
- Keyboard navigation end-to-end; ARIA attributes on modals/menus; color contrast checks.
- Add unit tests for primitives and key integrations; integration/e2e for flows (login, claim alias, create rule, connect channel).
- Rollout plan: feature-flagged or staged PRs; smoke test on local replica and dev environment.
- Acceptance: automated accessibility checks pass; e2e smoke tests pass on CI.

Detailed TODO (Actionable items)

1. Tokenization & setup
- [ ] Finalize `src/styles/theme.ts` tokens and export CSS variables.
- [ ] Add `tailwind.config.js` (or extend) to read tokens (colors, radii) or generate CSS variables at build.
- [ ] Create `src/components/UI/README.md` documenting primitives and usage examples.

2. Primitives to implement (order)
- [done] Button (variants + sizes) — stabilize API (done; reconcile manual edits).
- [done] Card (default + glass) — default export added (done).
- [ ] Text / Typography component.
- [done] Input (with label, helper text, error state).
- [done] Skeleton (height, lines, block) — implemented; move inline styles to CSS if linter needed.
- [ ] Modal & SlideOver (trap focus, anims, accessible close).
- [ ] Table/List primitives with virtualized option for long lists.
- [done] ToastProvider & useToast — implemented, mount at app root.

3. Layout & navigation
- [ ] Standardize `Layout` to always render shell, expose `pageLoading` region for skeletons.
- [done] Ensure `useAuth` exposes `authReady` broadly; gate redirects on it.
- [done] Persist intended route across external auth redirects using `sessionStorage`.

4. Forms & flows (prioritized pages)
- ClaimAlias: polish UI, use Input primitive + modal confirm flow, add success/feedback toast. ([done] form + one-time flow; [next] add confirm modal + success toast)
- Create Rule: replace with SlideOver multi-step flow with preview and validation. (TODO)
- Channels: add connection test, inline diagnostics; show connected state. (TODO)

5. UX patterns & rules
- Primary CTA placement: page header right-aligned for list pages; inline sticky action for wizards.
- Secondary actions: grouped under compact kebab menu or inline small buttons.
- Forms: trailing CTA (right) + clear cancel on left; primary action consistent color.
- Validation: show errors inline under input, accumulate non-field errors in toast or card banner.

6. Performance & network
- Avoid owner-only calls on non-owner sessions; handle `NotAuthorized` gracefully (done in useClypr).
- Lazy-load heavy components (charts, editors) with code-splitting.
- Ensure single ClyprService init (singleton) to avoid duplicate logs and double calls.

7. QA & rollout
- Create PR checklist: component tests, snapshot for visual diffs, accessibility audit, smoke test steps.
- Stage migration per-page: replace primitives on one page at a time; validate in dev; merge.
- Monitor errors/UX metrics after each merge.

Files to touch (priority mapping)
- src/frontend/src/styles/theme.ts (tokens) — existing
- src/frontend/tailwind.config.js or `tailwind.config.ts` — new/extend
- src/frontend/src/components/UI/* — primitives (Button, Card, Input, Skeleton, Modal, SlideOver, Toast)
- src/frontend/src/components/Layout/* — Layout, Sidebar, Topbar tweaks
- src/frontend/src/pages/* — Dashboard, ClaimAlias, Rules, Channels, Messages updates
- src/frontend/src/hooks/useClypr.tsx — ensure graceful handling (already improved)
- src/frontend/src/services/ClyprService.ts — implement singleton init guard

Acceptance criteria (release-ready)
- All new primitives have TypeScript-compatible public APIs and are documented.
- Critical flows (login, claim alias, create rule, connect channel) are functional, accessible, and have no visual flicker on reload.
- No duplicate agent/canister calls or duplicate React instances causing React errors.

Rollout plan
- Work in feature branches per-phase (e.g., `feat/ux/phase-0-primitives`).
- Small PRs: each primitive + a single-page migration.
- Add visual review step; optional design review branch for screenshots.
- Merge to `main` only after CI (lint, tests, e2e smoke) and manual smoke on local replica.

Notes & constraints
- Your dev IDE may show TSX type errors; ignore if they are editor-only and do not break builds. Long-term, fix TypeScript config (`tsconfig`) and React types.
- For Internet Computer-specific builds, keep `vite.config.ic.ts` and `dfx.json` rules in mind; avoid changing output dir from `dist/`.

Quick next actions I will implement next
- [ ] Move `Skeleton` inline style to a small CSS module to satisfy linter.
- [ ] Implement Modal & SlideOver primitives (accessible, animated, focus-trap).
- [ ] Implement `src/frontend/src/services/ClyprService.ts` singleton init guard.
- [ ] Replace one create flow with SlideOver (Create Rule) as a demo migration.
- [ ] Run a dev build and address any runtime TypeScript/React typing issues.

If you want, I will start implementing the Modal/SlideOver primitives next (recommended).
