# UI standards — apply to every interface

**Canonical standard:** `docs/UI_UX_STANDARDS.md:1` — single source. This file is the runtime enforcement of that doc. Every developer (human or AI) must adopt it — no custom styling, ever. Violating PR = rejected.

**Reference implementations to copy:** `apps/web/src/features/auth/login-form.tsx:1` (Auth) + `apps/web/src/features/platform/overview-panel.tsx:1` (Dashboard) + `apps/web/src/app/globals.css:1` (tokens) + `packages/ui/src:1` (components). See `docs/UI_UX_STANDARDS.md:4`.

These are strict, non-negotiable rules for all UI built in this workspace. They
are applied once at the design-system level (see
`apps/web/src/app/globals.css`) and every new component/page must inherit and
respect them.

**Enforced by:** `AGENTS.md:42` `apple-ui-expert` (every UI build/review) + `accessibility-auditor` + `docs/UI_UX_STANDARDS.md:7`. Any UI PR without `apple-ui-expert` invocation is rejected — even if code-architect wrote it.

## 1. Overlay / thin scrollbars everywhere

The app uses native scrollbars restyled as thin overlay scrollbars. This applies
to **every** scrollable region: main app, side panels, content areas, tables,
dropdowns, popovers, command menus. Never leave a default fat scrollbar, and
never style scrollbars per-component — the global layer already covers all
scroll containers.

- Global implementation (already present in `globals.css`):
  - `* { scrollbar-width: thin; scrollbar-color: var(--scrollbar-thumb) transparent; }`
  - `::-webkit-scrollbar { width: 8px; height: 8px; }`
  - track `transparent`, thumb `var(--scrollbar-thumb)` rounded, 2px inset
    (`background-clip: content-box`), hover `var(--scrollbar-thumb-hover)`.
  - no scrollbar buttons, transparent corner.
- Do NOT add per-component scrollbar CSS; if a component needs a scroll area it
  simply scrolls and inherits the global styling.

## 2. Responsive — mobile, tablet, desktop (strict)

Every screen must work natively on small phones, tablets, and large desktops.

- Use Tailwind breakpoints (mobile-first): base = phone, `sm`, `md`, `lg`, `xl`.
- Layout shells: sidebar collapses to a drawer/sheet on small screens; tables
  degrade gracefully (cards on mobile or horizontal scroll inside a container
  that uses the global overlay scrollbar).
- Touch targets >= 40px. Never require hover-only interaction to reach a feature.
- Test with the overlay scrollbar rule in mind: nested scroll areas must never
  trap the user — keep `overscroll-behavior` contained at the app level
  (already set on `body`).

## 3. Design tokens only

- Colors, radii, fonts come exclusively from the `@theme` tokens in
  `globals.css` (neutral + ink-blue palette, ≤ 4 hues). No hardcoded hex/oklch
  in components.
- Icons: Solar (`@solar-icons/react`) only. See `icon-protection.instructions.md`.