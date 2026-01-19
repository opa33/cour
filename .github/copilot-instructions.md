# Courier Finance AI Coding Instructions

## Project Overview

**Courier Finance** — Telegram Mini App for couriers to track earnings, calculate net profit considering fuel costs, and participate in earnings leaderboards. This is a startup-style product in MVP phase with localStorage, scaling to Supabase backend.

## Architecture & Data Flow

### Frontend Stack

- **React + TypeScript + Vite** — Fast dev experience, tree-shaking
- **Tailwind CSS** — Utility-first styling, mobile-first responsive design
- **Telegram WebApp SDK** — Auto-auth via `user.id`, no login/password needed
- **Chart.js/Recharts** — Analytics visualization
- **Zustand/Redux Toolkit** — State management for shift data & user settings
- **Custom UI Components** — Button, Input, NumberInput, Card, Modal, Tabs, Select, DatePicker, StatCard

### Data Model

Single shift record structure:

```javascript
{
  date: "2026-01-17",
  minutes: 480,
  zone1: 5, zone2: 3, zone3: 2,
  kilometers: 82,
  fuelCost: 1000,
  totalWithTax: 3500,
  totalWithoutTax: 3045,
  netProfit: 2045
}
```

### Calculation Pipeline (Critical Logic)

1. **timeIncome** = `minutes × ratePerMinute`
2. **ordersIncome** = `(zone1 × priceZone1) + (zone2 × priceZone2) + (zone3 × priceZone3)`
3. **totalWithTax** = `timeIncome + ordersIncome`
4. **totalWithoutTax** = `totalWithTax × taxCoefficient`
5. **netProfit** = `totalWithoutTax − fuelCost`

**Key constraint**: All tariffs in UI are pre-tax values; `taxCoefficient` (default 0.87) is applied to show actual earnings.

## User Workflows

### Primary UX Flow (Shift Calculation Screen)

1. Input: date, minutes, zone order counts, kilometers, fuel cost
2. Click "Calculate" → Shows 3 income figures (with tax, without tax, net profit)
3. Click "Save" → Persists to storage (localStorage now, Supabase later)

### Secondary Screens

- **Statistics**: Day/Week/Month/Custom period with calendar, color-coded by income level, shift cards on day-click
- **Leaderboard**: Top-5 couriers by daily/weekly/monthly earnings (no PII, Telegram username only)
- **Profile**: Edit `rate_per_minute`, zone prices, `taxCoefficient`, currency, earnings goal, fuel tracking toggle, leaderboard opt-in

## Current Implementation Status

- **Phase 0-3 completed** (Design → Infrastructure → UI Library → Shift Calculation)
- **Phase 4 in progress** (localStorage integration)
- **Phases 5-10 pending** (Statistics, Backend, Leaderboards, Profile, Polish, Deploy)

## Developer Patterns & Conventions

### Component Patterns

- **Custom components** live in isolated files (Button.tsx, Input.tsx, etc.)
- **Mobile-first design**: Optimize for one-handed use, large tap targets
- **Tailwind-only styling**: No CSS modules, avoid external UI libraries (shadcn, MUI)

### State Management

- Use Zustand/Redux for:
  - User profile settings (rates, tax coefficient, currency)
  - All historical shifts
  - Current shift being edited
- Sync localStorage on state changes (simple approach for MVP)

### Routing

- Likely tab-based navigation (Shift Calc, Statistics, Leaderboard, Profile) using React Router or custom Tabs component
- No complex nested routes needed

### Testing & Build

- Vite build: `npm run build` (minified, tree-shook)
- Dev server: `npm run dev`
- No explicit test command in spec, but prepare for Jest/Vitest when needed

## Integration Points & External Dependencies

### Telegram WebApp SDK

```javascript
// Auto-auth happens here
const user = window.Telegram.WebApp.initData;
// Use user.id as unique identifier for Supabase later
```

### Supabase (Phase 6+)

- PostgreSQL tables: `users` (profile), `shifts` (earnings records)
- Schema uses `telegram_id` as PK in users table
- Sync shifts before showing statistics/leaderboards

### External Data (Future)

- Leaderboard aggregation: Sum earnings by courier per period (day/week/month)
- No external APIs currently (weather, location, etc.)

## File Structure (Expected)

```
src/
  components/        # UI: Button, Input, Card, Modal, etc.
  screens/           # Page-level: ShiftCalc, Statistics, Leaderboard, Profile
  store/             # Zustand/Redux state
  utils/             # Calculation logic, date helpers, formatting
  App.tsx            # Main router/layout
  main.tsx           # Vite entry
public/              # Telegram assets, favicon
```

## Key Gotchas & Decisions

1. **Tax coefficient is applied once** — Users see post-tax earnings; avoid double-applying tax in calculations
2. **Fuel cost is optional** — Toggle in settings; stats show both with & without fuel impact
3. **No user signup flow** — Telegram ID is auto-identifier; first visit creates user profile with defaults
4. **Currency flexibility** — Support multiple currencies in display (not conversion, just symbol)
5. **Leaderboard privacy** — Never expose personal earnings outside leaderboard context; only username + total earnings
6. **Mobile constraints** — No hover states in design; use tap feedback & animations instead

## Getting Started (Next Phases)

- **Phase 4**: Implement localStorage hooks (useShifts, useUserSettings)
- **Phase 5**: Build Statistics screen with Chart.js calendar & period filters
- **Phase 6**: Supabase setup (create tables, auth via user.id, sync logic)
- **Phase 7**: Leaderboard aggregation SQL queries
- **Phase 8**: Settings UI to edit all user preferences

---

**Last Updated**: January 2026 | Based on Technical Specification v1.0
