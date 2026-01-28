# Проблема: Бэкенд не поддерживает платные трансферы

## Описание проблемы
Эндпоинт `/api/squads/{squadId}/replace_players` возвращает ошибку `"No replacements left"` (статус 400), когда `squad.replacements = 0`, блокируя пользователю возможность делать платные трансферы с вычетом очков.

## Текущее поведение (НЕПРАВИЛЬНОЕ)
```
POST /api/squads/{squadId}/replace_players
Body: {
  main_player_ids: [1, 2, 3, ...],
  bench_player_ids: [11, 12, 13, 14]
}

Response (squad.replacements = 0):
{
  "success": false,
  "status": 400,
  "data": {
    "detail": "No replacements left"
  }
}
```

## Ожидаемое поведение (ПРАВИЛЬНОЕ)

### Логика игры
- Каждый тур пользователь получает **2 бесплатных трансфера** (`squad.replacements = 2`)
- После использования бесплатных трансферов (`squad.replacements = 0`), каждый дополнительный трансфер должен:
  1. **Разрешаться бэкендом** (НЕ блокироваться)
  2. **Вычитать 4 очка** из общего зачета (`squad.total_points -= 4`)
  3. Очки могут **уходить в минус** (если `total_points = 0`, то после трансфера будет `-4`)

### Правильная реализация
```python
# Псевдокод серверной логики
def replace_players(squad_id, main_player_ids, bench_player_ids):
    squad = get_squad(squad_id)
    transfer_count = count_differences(squad.current_players, new_players)
    
    if transfer_count == 0:
        return success  # Нет изменений
    
    # Рассчитываем штраф
    if squad.replacements >= transfer_count:
        # Используем бесплатные трансферы
        squad.replacements -= transfer_count
        penalty = 0
    else:
        # Используем бесплатные + платные
        free_used = squad.replacements
        paid_transfers = transfer_count - free_used
        penalty = paid_transfers * 4
        
        squad.replacements = 0
        squad.total_points -= penalty  # Может уйти в минус!
    
    # Применяем изменения
    squad.main_player_ids = main_player_ids
    squad.bench_player_ids = bench_player_ids
    squad.save()
    
    return {
        "success": true,
        "transfers_applied": transfer_count,
        "free_transfers_used": free_used,
        "paid_transfers": paid_transfers,
        "penalty": penalty,
        "new_replacements": squad.replacements,
        "new_total_points": squad.total_points
    }
```

## Бусты
Если активирован буст "Трансферы +" (`transfers_plus`) или "Золотой тур" (`gold_tour`):
- **ВСЕ трансферы бесплатны** (не тратят `replacements` и не дают штраф)
- Проверка активности буста: `squad.active_boost_for_next_tour in ['transfers_plus', 'gold_tour']`

## Текущая реализация на фронтенде
Фронтенд правильно:
1. Рассчитывает штрафы (`src/lib/transferState.ts`)
2. Показывает пользователю количество платных трансферов и штраф
3. Записывает штрафы локально для UI

Но фронтенд **НЕ может** обойти серверную валидацию.

## Что нужно исправить на бэкенде

### 1. Убрать жесткую проверку `replacements > 0`
```python
# ❌ НЕПРАВИЛЬНО (текущая реализация)
if squad.replacements < transfer_count:
    raise HTTPException(status_code=400, detail="No replacements left")

# ✅ ПРАВИЛЬНО
# (логика выше - разрешать платные трансферы)
```

### 2. Добавить поле `penalty` в ответ
Чтобы фронтенд мог синхронизировать состояние:
```json
{
  "success": true,
  "id": 123,
  "main_player_ids": [...],
  "bench_player_ids": [...],
  "transfers_applied": 3,
  "free_transfers_used": 2,
  "paid_transfers": 1,
  "penalty": 4,
  "new_replacements": 0,
  "new_total_points": -4
}
```

### 3. Обновить типы (TypeScript)
```typescript
export interface ReplacePlayersResponse {
  id: number;
  main_player_ids: number[];
  bench_player_ids: number[];
  transfers_applied?: number;
  free_transfers_used?: number;
  paid_transfers?: number;
  penalty?: number;
  new_replacements?: number;
  new_total_points?: number;
}
```

## Тестовые сценарии

### Сценарий 1: Бесплатные трансферы
- `replacements = 2`, делаем 1 трансфер
- Ожидается: `replacements = 1`, `penalty = 0`

### Сценарий 2: Частично платные
- `replacements = 1`, делаем 3 трансфера
- Ожидается: `replacements = 0`, `penalty = 8` (2 × 4)

### Сценарий 3: Все платные
- `replacements = 0`, делаем 2 трансфера
- Ожидается: `replacements = 0`, `penalty = 8` (2 × 4), `total_points` уменьшены на 8

### Сценарий 4: Уход в минус
- `replacements = 0`, `total_points = 0`, делаем 1 трансфер
- Ожидается: `replacements = 0`, `penalty = 4`, `total_points = -4` ✅

### Сценарий 5: С бустом
- `replacements = 0`, активен `transfers_plus`, делаем 5 трансферов
- Ожидается: `replacements = 0`, `penalty = 0` (буст делает всё бесплатным)

## Приоритет
🔴 **КРИТИЧЕСКИЙ** — блокирует основную механику игры после использования бесплатных трансферов.

## Файлы для правки
- Backend: эндпоинт `/api/squads/{squadId}/replace_players`
- Frontend (уже готово): `src/pages/Transfers.tsx`, `src/lib/transferState.ts`, `src/lib/api.ts`
