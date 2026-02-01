# Schema Validation Report: Backend ↔ Frontend

**Дата проверки:** 31 января 2026  
**Проверенные компоненты:** Squads API endpoints

## ❌ Найденная проблема

### 1. Missing fields in `/api/squads/{squad_id}/tours` response

**Статус:** ✅ **ИСПРАВЛЕНО**

#### Описание
Эндпоинт `GET /api/squads/{squad_id}/tours` возвращал неполные данные, отсутствовали 3 обязательных поля.

#### Ошибка
```
fastapi.exceptions.ResponseValidationError: 3 validation errors:
- {'type': 'missing', 'loc': ('response', 0, 'budget'), 'msg': 'Field required'}
- {'type': 'missing', 'loc': ('response', 0, 'replacements'), 'msg': 'Field required'}
- {'type': 'missing', 'loc': ('response', 0, 'is_finalized'), 'msg': 'Field required'}
```

#### Детали несоответствия

**Backend Schema** (`app/squads/schemas.py:91-106`):
```python
class SquadTourHistorySchema(BaseModel):
    tour_id: int
    tour_number: int
    points: int
    penalty_points: int
    used_boost: Optional[str]
    captain_id: Optional[int]
    vice_captain_id: Optional[int]
    budget: int                    # ❌ НЕ ВОЗВРАЩАЛОСЬ
    replacements: int              # ❌ НЕ ВОЗВРАЩАЛОСЬ
    is_finalized: bool             # ❌ НЕ ВОЗВРАЩАЛОСЬ
    main_players: list[PlayerInSquadSchema]
    bench_players: list[PlayerInSquadSchema]
```

**Backend Service** (`app/squads/services.py:1362-1372` - ДО ИСПРАВЛЕНИЯ):
```python
history.append({
    "tour_id": squad_tour.tour_id,
    "tour_number": squad_tour.tour.number,
    "points": squad_tour.points,
    "penalty_points": squad_tour.penalty_points,
    "used_boost": squad_tour.used_boost,
    "captain_id": squad_tour.captain_id,
    "vice_captain_id": squad_tour.vice_captain_id,
    # ❌ budget - ОТСУТСТВУЕТ
    # ❌ replacements - ОТСУТСТВУЕТ
    # ❌ is_finalized - ОТСУТСТВУЕТ
    "main_players": main_players_data,
    "bench_players": bench_players_data,
})
```

**Frontend Type** (`src/lib/api.ts:319-332`):
```typescript
export interface TourHistorySnapshot {
  tour_id: number;
  tour_number: number;
  budget: number;           // ✅ ОЖИДАЕТСЯ
  replacements: number;     // ✅ ОЖИДАЕТСЯ
  points: number;
  penalty_points: number;
  used_boost: string | null;
  captain_id: number | null;
  vice_captain_id: number | null;
  main_players?: TourHistoryPlayer[];
  bench_players?: TourHistoryPlayer[];
  is_finalized: boolean;    // ✅ ОЖИДАЕТСЯ
}
```

#### Исправление

**Commit:** `738d542`  
**Файл:** `app/squads/services.py`  
**Изменение:**

```python
history.append({
    "tour_id": squad_tour.tour_id,
    "tour_number": squad_tour.tour.number,
    "points": squad_tour.points,
    "penalty_points": squad_tour.penalty_points,
    "used_boost": squad_tour.used_boost,
    "captain_id": squad_tour.captain_id,
    "vice_captain_id": squad_tour.vice_captain_id,
    "budget": squad_tour.budget,              # ✅ ДОБАВЛЕНО
    "replacements": squad_tour.replacements,  # ✅ ДОБАВЛЕНО
    "is_finalized": squad_tour.is_finalized,  # ✅ ДОБАВЛЕНО
    "main_players": main_players_data,
    "bench_players": bench_players_data,
})
```

#### Затронутые компоненты
- **Backend:** `SquadService.get_squad_tour_history_with_players()`
- **Endpoint:** `GET /api/squads/{squad_id}/tours`
- **Frontend:** `squadsApi.getHistory()` → используется в истории команды

---

## ✅ Проверенные эндпоинты без проблем

### 2. Leaderboard endpoints

#### `GET /api/squads/leaderboard/{tour_id}`

**Backend Schema:** `PublicLeaderboardEntrySchema` (schemas.py:121-142)
```python
class PublicLeaderboardEntrySchema(BaseModel):
    place: int
    squad_id: int
    squad_name: str
    user_id: int
    username: str
    tour_points: int
    total_points: int
    penalty_points: int
    total_penalty_points: int
```

**Backend Service:** `SquadService.get_leaderboard()` (services.py:923-933)
```python
leaderboard.append({
    "place": index,
    "squad_id": squad.id,
    "squad_name": squad.name,
    "user_id": squad.user.id,
    "username": squad.user.username,
    "tour_points": points.tour_net,           # ✅ СООТВЕТСТВУЕТ
    "total_points": points.total_earned,      # ✅ СООТВЕТСТВУЕТ
    "penalty_points": points.tour_penalty,    # ✅ СООТВЕТСТВУЕТ
    "total_penalty_points": points.total_penalty, # ✅ СООТВЕТСТВУЕТ
})
```

**Frontend Type:** `LeaderboardEntry` (api.ts:265-275)
```typescript
export interface LeaderboardEntry {
  place: number;
  squad_id: number;
  squad_name: string;
  user_id: number;
  username: string;
  tour_points: number;
  total_points: number;
  penalty_points: number;
  total_penalty_points: number;
}
```

**Статус:** ✅ Полное соответствие

---

#### `GET /api/squads/leaderboard/{tour_id}/by-fav-team/{fav_team_id}`

**Backend Schema:** `PublicClubLeaderboardEntrySchema` (schemas.py:145-164)
```python
class PublicClubLeaderboardEntrySchema(BaseModel):
    place: int
    squad_id: int
    squad_name: str
    user_id: int
    username: str
    tour_points: int
    total_points: int
    penalty_points: int
    total_penalty_points: int
    fav_team_id: int
    fav_team_name: str | None = None
```

**Backend Service:** `SquadService.get_leaderboard_by_fav_team()` (services.py:1438-1451)
```python
leaderboard.append({
    "place": index,
    "squad_id": squad.id,
    "squad_name": squad.name,
    "user_id": squad.user.id,
    "username": squad.user.username,
    "tour_points": points.tour_net,
    "total_points": points.total_earned,
    "penalty_points": points.tour_penalty,
    "total_penalty_points": points.total_penalty,
    "fav_team_id": squad.fav_team_id,
    "fav_team_name": fav_team.name if fav_team else None,
})
```

**Статус:** ✅ Полное соответствие

---

### 3. Squad metadata endpoints

#### `GET /api/squads/my_squads`
**Schema:** `SquadReadSchema` (schemas.py:23-32)  
**Статус:** ✅ Только метаданные, соответствие подтверждено

#### `GET /api/squads/get_squad_{squad_id}`
**Schema:** `SquadReadSchema`  
**Статус:** ✅ Только метаданные, соответствие подтверждено

---

## 📋 Рекомендации

### 1. Автоматическая валидация схем

Создать unit-тесты для проверки соответствия response_model и возвращаемых данных:

```python
# tests/test_schemas.py
def test_squad_tour_history_schema_matches_service():
    """Verify that get_squad_tour_history_with_players returns all required fields."""
    # Mock data
    history_item = {
        "tour_id": 1,
        "tour_number": 1,
        "points": 50,
        "penalty_points": 0,
        "used_boost": None,
        "captain_id": 123,
        "vice_captain_id": 456,
        "budget": 95000,
        "replacements": 2,
        "is_finalized": False,
        "main_players": [],
        "bench_players": [],
    }
    
    # This should not raise ValidationError
    validated = SquadTourHistorySchema(**history_item)
    assert validated.budget == 95000
    assert validated.replacements == 2
    assert validated.is_finalized == False
```

### 2. Type checking на этапе разработки

Использовать Pydantic для валидации **ДО** возврата из сервиса:

```python
# ПЕРЕД:
history.append({...})  # Возвращает dict, валидация только на уровне FastAPI

# ПОСЛЕ:
history_item = SquadTourHistorySchema(
    tour_id=squad_tour.tour_id,
    tour_number=squad_tour.tour.number,
    points=squad_tour.points,
    penalty_points=squad_tour.penalty_points,
    used_boost=squad_tour.used_boost,
    captain_id=squad_tour.captain_id,
    vice_captain_id=squad_tour.vice_captain_id,
    budget=squad_tour.budget,
    replacements=squad_tour.replacements,
    is_finalized=squad_tour.is_finalized,
    main_players=main_players_data,
    bench_players=bench_players_data,
)
history.append(history_item)  # Валидация на уровне сервиса
```

### 3. Синхронизация типов Frontend ↔ Backend

Рассмотреть генерацию TypeScript типов из Pydantic схем:
- `pydantic-to-typescript`
- `datamodel-code-generator`

---

## 📊 Итоговая статистика

| Проверено эндпоинтов | Найдено проблем | Исправлено | Без проблем |
|---------------------|----------------|-----------|-------------|
| 7                   | 1              | 1         | 6           |

### Проверенные эндпоинты:
1. ✅ `GET /api/squads/my_squads`
2. ✅ `GET /api/squads/get_squad_{squad_id}`
3. ✅ `GET /api/squads/get_squad_by_id/{squad_id}`
4. 🔧 `GET /api/squads/{squad_id}/tours` - **ИСПРАВЛЕНО**
5. ✅ `GET /api/squads/leaderboard/{tour_id}`
6. ✅ `GET /api/squads/leaderboard/{tour_id}/by-fav-team/{fav_team_id}`
7. ✅ `PATCH /api/squads/{squad_id}/rename`

### Статус: ✅ **ВСЕ ПРОБЛЕМЫ УСТРАНЕНЫ**

**Commit с исправлением:** `738d542`  
**Pushed to:** `origin/main`
