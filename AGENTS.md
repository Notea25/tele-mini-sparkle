# AGENTS.md

This file provides guidance to WARP (warp.dev) when working with code in this repository.

## Project Overview

Fantasy Sports Telegram Mini App - a fantasy football application for Belarusian Premier League. Built with React + TypeScript + Vite, uses Supabase Edge Functions as API proxy to FastAPI backend.

**Tech Stack:**
- Frontend: React 18, TypeScript, Vite, TailwindCSS
- UI: shadcn/ui components (Radix UI primitives)
- State: @tanstack/react-query for server state, localStorage for client state
- Telegram: @telegram-apps/sdk-react for Telegram Mini App integration
- Routing: react-router-dom
- Backend proxy: Supabase Edge Functions (Deno)

## Development Commands

### Setup
```bash
npm install                    # Install dependencies
npm run dev                    # Start dev server on port 8080
```

### Build & Deploy
```bash
npm run build                  # Production build (outputs to dist/)
npm run build:dev             # Development build
npm run preview               # Preview production build locally
```

### Code Quality
```bash
npm run lint                  # Run ESLint
```

**Note:** This is a Lovable project. Changes pushed to git are automatically deployed. The project URL is tracked in README.md.

## Architecture

### API Communication Pattern

**Critical:** All backend requests go through Supabase Edge Functions proxy (`supabase.functions.invoke("api-proxy")`), NOT direct HTTP calls.

```typescript
// src/lib/api.ts - Central API layer
apiRequest<T>(endpoint, options) 
  → callBackend() 
  → supabase.functions.invoke("api-proxy") 
  → FastAPI backend
```

**Authentication flow:**
1. Access tokens stored in localStorage via `authStorage.ts`
2. `apiRequest()` auto-includes Bearer token
3. On 401/403, attempts token refresh via `/api/users/refresh`
4. Retries original request with new token

**API structure:**
- All APIs exported as namespaced objects: `squadsApi`, `boostsApi`, `playersApi`, etc.
- Consistent `ApiResponse<T>` interface: `{ success, status, data?, error? }`

### State Management

**Three-layer state pattern:**

1. **Server State** (@tanstack/react-query)
   - Squad data, players, tours, boosts
   - Cached with staleTime/gcTime settings
   - `queryClient.invalidateQueries()` for cache updates

2. **Client State** (localStorage)
   - Managed via utility modules in `src/lib/`
   - `boostState.ts` - Boost activation/pending states (shared between TeamManagement & Transfers)
   - `transferState.ts` - Transfer tracking & penalties
   - `authStorage.ts` - Access/refresh tokens

3. **Component State** (React useState)
   - UI-only state (tabs, modals, selected players)

**Critical pattern:** Boost state uses hybrid approach:
- `pending` status: localStorage (via `boostState.ts`)
- `used` status: Backend API (via `boostsApi.getAvailable()`)
- This prevents double-activation bugs across page navigation

### Formation System

**8 Valid Formations** (always includes 1 GK in main squad):
- 4-3-3, 4-4-2, 3-5-2, 5-4-1, 3-4-3, 4-5-1, 5-2-3, 5-3-2

**Position Codes:**
- Russian codes used throughout: `ВР` (GK), `ЗЩ` (DEF), `ПЗ` (MID), `НП` (FWD)
- Backend expects counts: `{ DEF: 4, MID: 4, FWD: 2 }`
- Frontend validates using Russian position codes

**Squad Structure:**
- Main squad: 11 players (1 GK + formation)
- Bench: 4 players (1 GK + 1 DEF + 1 MID + 1 FWD)
- Total: 15 players, 100 million budget

**Key utilities:**
- `src/lib/formationUtils.ts` - Formation detection, validation, swap logic
- `getFormationSlots()` - Calculates field positioning with equal horizontal spacing
- `detectFormation()` - Auto-detects formation from player positions
- `isSwapValid()` - Validates if swap maintains valid formation

### Squad Creation Flow

1. **CreateTeam** (`/create-team`): Name + favorite team → localStorage
2. **TeamBuilder** (`/team-builder`): Select 15 players → API `POST /api/squads/create`
3. Backend creates Squad + SquadPlayers + auto-joins leagues
4. Returns `squad_id` → stored in localStorage
5. Navigate to `/league`

### Page-Specific Patterns

**TeamManagement** (`/team-management`):
- Loads squad via `useSquadData()` hook
- Swap mode: No drawer, direct field/list highlighting
- Boost confirmation: Only shows if boost state changed (new/removed), not re-saving existing
- Captain/vice-captain: Auto-assigned to most expensive if not set

**Transfers** (`/transfers`):
- Transfer tracking via `transferState.ts`
- Free transfers: 2 per tour (or unlimited with `transfers_plus` boost)
- Golden Tour boost: Creates backup, allows unrestricted changes for one tour

**TeamBuilder** (`/team-builder`):
- Special `1-5-5-3` formation mode (allows 2 GKs for selection UI)
- Budget tracking: Real-time validation
- Uses `benchSlotIndices` to separate main (11) from bench (4)

## Common Patterns

### Declaring React State with useEffect Dependencies

**Critical bug pattern to avoid:**
```typescript
// ❌ WRONG - using state before declaration
useEffect(() => {
  if (someCondition && myState === null) { 
    setMyState(value);
  }
}, [myState]); // myState referenced before declared

const [myState, setMyState] = useState(null);
```

```typescript
// ✅ CORRECT - declare state before use
const [myState, setMyState] = useState(null);

useEffect(() => {
  if (someCondition && myState === null) {
    setMyState(value);
  }
}, [myState]);
```

This causes `ReferenceError: Cannot access 'X' before initialization` in production builds.

### Russian Text Conventions

- UI text is in Russian
- Position codes: `ВР`, `ЗЩ`, `ПЗ`, `НП`
- Error messages: Toast notifications via `sonner`
- Comments: Often in Russian, explaining business logic

### Modal/Drawer Pattern

- Use `vaul` Drawer component for bottom sheets
- Standard pattern: `isOpen` + `onOpenChange` + `onClose`
- Confirmation modals: Separate state for pending confirmation vs actual action

## Backend Integration

**Backend is separate repository/deployment.** Frontend communicates via:

```
Frontend → Supabase Edge Function (api-proxy) → FastAPI Backend
```

**Edge function location:** `supabase/functions/api-proxy/index.ts`

**Allowlisted paths** in edge function:
- `/api/leagues/`, `/api/tours/`, `/api/teams/`, `/api/players/`
- `/api/squads/`, `/api/boosts/`, `/api/users/`
- `/api/custom_leagues/`, `/api/user_leagues/`, `/api/commercial_leagues/`

**Auth-required paths:** Most `/api/squads/*` and `/api/boosts/*` endpoints

## Key Files & Locations

**Core API:** `src/lib/api.ts` - All backend communication
**State Management:**
- `src/lib/boostState.ts` - Boost activation tracking
- `src/lib/transferState.ts` - Transfer penalties
- `src/lib/authStorage.ts` - Token management

**Formation Logic:** `src/lib/formationUtils.ts`
**Custom Hooks:**
- `src/hooks/useSquadData.ts` - Squad loading with enriched player data
- `src/hooks/usePlayers.ts` - Player list for league
- `src/hooks/useDeadline.ts` - Countdown timer

**Main Pages:**
- `src/pages/TeamManagement.tsx` - Main squad editing
- `src/pages/Transfers.tsx` - Player trading
- `src/pages/TeamBuilder.tsx` - Initial squad creation

## Troubleshooting

### Black Screen / Blank Page
- Check browser console for `ReferenceError: Cannot access 'X' before initialization`
- Likely useState/useEffect ordering issue (see Common Patterns above)
- Rebuild required: `npm run build`

### API Errors
- Verify Supabase Edge Function is deployed and accessible
- Check `BACKEND_URL` environment variable in edge function
- Inspect Network tab for `api-proxy` invocation response

### Boost Not Applying
- Check `localStorage` key `fantasyBoostState` for pending boost
- Verify backend boost API returns correct availability
- Ensure boost not already used via `boostsApi.getAvailable()`

### Formation Validation Fails
- Must be one of 8 valid formations
- Use Russian position codes (`ЗЩ`, `ПЗ`, `НП`)
- Check `mainPositionCounts` matches `validFormations` array

## Project-Specific Conventions

- **Formation codes:** String format `"1-4-4-2"` (includes GK)
- **Player budget:** Always in millions (e.g., 5.5 = 5.5M)
- **Tour IDs:** Sequential integers, retrieved from backend
- **League ID:** Default 116 (stored in localStorage as `fantasySelectedLeagueId`)
- **Boost types:** Backend uses snake_case (`bench_boost`), frontend uses IDs (`bench`)
- **Reset button:** Top-right "Reset App" button (dev only, clears localStorage)
