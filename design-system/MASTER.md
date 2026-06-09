# Anchor Design System (MASTER)

Source: ui-ux-pro-max + Copilot Dashboard DNA (`src/lib/copilotTheme.js`, `src/index.css`).

## Pattern
- **Asymmetric bento grid** — hero full-width, wide left (review + timeline), narrow right (goals + streaks)
- **Bento / card-first** — information in tinted glass cards, not flat tables
- **Future-forward** — hero shows *Säkert att spendera*, not guilt metrics
- **Active control** — swipe/approve flows (Excel & kuvertmetoden), not passive lists

## Style
- **Dark OLED fintech** — deep blue gradient, glass cards, green positive indicators
- **Avoid:** white `#fff` boxes, `#F4F6F8` backgrounds, thin black dividers, teal `#0D7377` business chrome

## Colors
| Role | Token |
|------|-------|
| Background | `--copilot-bg-deep` → gradient `#0a0f6b` → `#1228cc` |
| Card | `--copilot-bg-card` `rgba(255,255,255,0.07)` |
| CTA / positive | `--copilot-accent-green` `#22d97a` |
| Action | `--copilot-accent-blue` `#4a7aff` |
| Text | `--copilot-text-primary` / secondary / muted |

## Typography
- **Inter** (app) — headings bold 22–26px, body 13–15px, meta 11px uppercase tracking

## Components (canonical)
- `PageShell` + `GlassSection` / `CopilotCard`
- `TintIconCard` — list rows
- `StreakBadge` — motivation loops
- `CopilotProgressRing` / `VisualSavingsGoalRing` — goals
- `CopilotFreeMoneyHero` — "Dina fria pengar"
- `AnchorSheet` — bottom sheets (no pop-in modals)
- `TransactionActiveReview` — swipe/approve import & history

## Radius & depth
- Cards/panels: **16–24px** (`rounded-[16px]` … `rounded-[24px]`)
- Pills (buttons, badges, inputs): **9999px**
- **No hard borders** — use `organic-surface` + `--organic-shadow-float`
- Badges/chips: min **12px** radius or pill

## Motion
- Page enter: spring `springPop` or `opacity + y:12`
- Sheets: spring slide-up (`AnchorSheet`)
- All clickables: `active:scale-[0.97]`–`[0.98]`, min touch **48×48**

## Anti-patterns
- No emojis as icons (Lucide only)
- No generic "AI white card" layouts on sub-pages
- No passive transaction tables without approve interaction

## Pre-delivery
- [ ] Same tokens as Dashboard on every sub-page
- [ ] Free money visible on money views
- [ ] Streaks on strategic surfaces
- [ ] Savings goals use image/icon + progress ring
- [ ] `prefers-reduced-motion` respected
