# Deprecated Endpoints Audit Report

**Date:** 1 февраля 2026  
**Status:** ✅ **ALL PRODUCTION CODE MIGRATED**

## 📋 Backend Deprecated Endpoints

### ❌ Deprecated (HTTP 410 Gone)

| Endpoint | Replacement | Status |
|----------|-------------|--------|
| `PUT /api/squads/update_players/{id}` | `POST /api/squad_tours/squad/{id}/replace_players` | Deprecated |
| `POST /api/squads/{id}/replace_players` | `POST /api/squad_tours/squad/{id}/replace_players` | Deprecated |
| `GET /api/squads/{id}/replacement_info` | `GET /api/squad_tours/squad/{id}/replacement_info` | Deprecated |
| `GET /api/squads/{id}/tours` | `GET /api/squad_tours/squad/{id}` | Deprecated |

**Location:** `app/squads/router.py`  
**Lines:** 94, 110, 128, 145

All deprecated endpoints return HTTP 410 Gone with redirect message.

---

## 🔍 Frontend Usage Audit

### ✅ Production Code - All Migrated

| File | Line | Method | Endpoint | Status |
|------|------|--------|----------|--------|
| `src/pages/TeamManagement.tsx` | 442 | `replacePlayers()` | ✅ NEW: `/api/squad_tours/squad/{id}/replace_players` | ✅ Migrated |
| `src/pages/Transfers.tsx` | 1826 | `replacePlayers()` | ✅ NEW: `/api/squad_tours/squad/{id}/replace_players` | ✅ Migrated |
| `src/pages/ViewTeam.tsx` | 65 | `getHistory()` | ✅ NEW: `/api/squad_tours/squad/{id}` | ✅ Migrated |
| `src/components/TourHistory.tsx` | 42 | `getHistory()` | ✅ NEW: `/api/squad_tours/squad/{id}` | ✅ Migrated |

### ⚠️ Test/Debug Code - Expected

| File | Line | Method | Status | Notes |
|------|------|--------|--------|-------|
| `src/pages/BackendTest.tsx` | 330 | `updatePlayers()` | ⚠️ Uses deprecated | OK - test page |
| `src/lib/api.ts` | 360 | `updatePlayers()` | `@deprecated` annotation | Marked for developers |

---

## 📊 Migration Summary

### What Changed

#### Old Architecture (Deprecated)
```
/api/squads/{id}/
├── update_players        ❌ HTTP 410
├── replace_players       ❌ HTTP 410  
├── replacement_info      ❌ HTTP 410
└── tours                 ❌ HTTP 410
```

#### New Architecture (Current)
```
/api/squad_tours/squad/{id}/
├── replace_players       ✅ Active
├── replacement_info      ✅ Active
└── (list all tours)      ✅ Active
```

### API Method Mapping

**Frontend API (`src/lib/api.ts`):**

| Old Method (Deprecated) | New Method | Endpoint |
|------------------------|------------|----------|
| `squadsApi.updatePlayers()` | `squadsApi.replacePlayers()` | POST /squad_tours/squad/{id}/replace_players |
| `squadsApi.getHistory()` | `squadsApi.getHistory()` | GET /squad_tours/squad/{id} ⭐ Already migrated |

---

## ✅ Verification Checklist

- [x] All production pages migrated to new endpoints
- [x] `TeamManagement.tsx` uses `replacePlayers()`
- [x] `Transfers.tsx` uses `replacePlayers()`
- [x] `ViewTeam.tsx` uses `getHistory()` (new endpoint)
- [x] `TourHistory.tsx` uses `getHistory()` (new endpoint)
- [x] Deprecated method marked with `@deprecated` in API
- [x] BackendTest page kept for testing (intentional)
- [x] No grep matches for old endpoint paths in production code

---

## 🔧 Recent Fixes

### 1. TeamManagement Save Error (Commit `caa4298`)
**Problem:** Page was calling deprecated `updatePlayers()` → HTTP 410  
**Fix:** Updated to `replacePlayers()` with new endpoint  

### 2. API Deprecation Annotation (Commit `3225a27`)
**Added:** JSDoc `@deprecated` to `updatePlayers()` method  
**Purpose:** Warn developers in IDE about deprecated method  

---

## 🎯 Conclusion

**Status:** ✅ **COMPLETE**

All production code has been migrated to use new `/squad_tours` endpoints.
No deprecated endpoints are used in production pages.

**Remaining deprecated usage:**
- `BackendTest.tsx` - Intentional (test page for both old/new APIs)
- `api.ts` declaration - Kept for backward compatibility with `@deprecated` warning

**No further action required.**

---

## 📝 Notes for Developers

If you see TypeScript warnings about deprecated methods, use the new equivalents:

```typescript
// ❌ DEPRECATED - Will get HTTP 410
await squadsApi.updatePlayers(squadId, data);

// ✅ NEW - Use this instead
await squadsApi.replacePlayers(
  squadId,
  {
    main_player_ids: data.main_player_ids || [],
    bench_player_ids: data.bench_player_ids || [],
  },
  data.captain_id,
  data.vice_captain_id
);
```

**Backend reference:** All squad player operations moved from `/squads` to `/squad_tours` module.
