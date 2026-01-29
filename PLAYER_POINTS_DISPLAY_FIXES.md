# Исправления отображения очков игроков на фронтенде

## Обзор изменений

Реализована корректная система отображения очков игроков на всех страницах приложения в соответствии с требованиями:
- **`total_points`** (общие очки за все туры) - на страницах создания команды, трансферов и моей команды
- **`tour_points`** (очки за текущий/последний тур) - на страницах просмотра команды и результатов

## Изменённые файлы

### 1. Обновление типов данных

#### `src/hooks/useSquadData.ts`
- **Интерфейс `EnrichedPlayer`**: Добавлены поля `total_points` и `tour_points`
- **Маппинг данных**: В функциях `mainPlayers` и `benchPlayers` добавлена пропагация `total_points` и `tour_points` из API данных

#### `src/lib/teamData.ts`
- **Интерфейс `PlayerData`**: Добавлено опциональное поле `total_points`

### 2. Страница просмотра команды (ViewTeam)

**Файл**: `src/pages/ViewTeam.tsx`

**Изменения**:
- **Список игроков** (строки 350, 418): Используется `player.tour_points ?? player.points ?? 0`
- **Расстановка** (строки 114, 135): Маппинг игроков использует `tour_points`
- **PlayerCard** (строка 449): Передаётся флаг `showTourPoints={true}`

**Логика**: Отображаются очки за текущий или последний тур (`tour_points`)

### 3. Страница трансферов (Transfers)

**Файл**: `src/pages/Transfers.tsx`

**Изменения**:
- **Маппинг данных squad** (строки 428, 447): Добавлено `total_points: p.total_points`
- **Список игроков squad** (строки 1024-1027): Используется `player.total_points ?? player.points ?? 0`

**Детали**:
- **Список текущего состава команды**: Отображает `total_points` (общие очки за все туры)
- **Список доступных игроков**: Использует `player.points` из `usePlayers`, которые уже содержат `total_points` из API

### 4. Страница управления командой (TeamManagement)

**Файл**: `src/pages/TeamManagement.tsx`

**Изменения**:
- **Маппинг данных** (строки 264, 289): Добавлено `total_points: p.total_points`
- **Основной состав** (строки 659-662): Используется `player.total_points ?? player.points ?? 0`
- **Скамейка запасных** (строки 1016-1019): Используется `player.total_points ?? player.points ?? 0`

**Логика**: Отображаются общие очки за все туры (`total_points`)

### 5. Страница создания команды (TeamBuilder)

**Файл**: `src/pages/TeamBuilder.tsx`

**Статус**: Не требует изменений ✅

**Причина**: Использует хук `usePlayers()`, который возвращает `player.points`, содержащие `total_points` из API `/api/players/league/{id}/players_with_points`

## Структура данных

### API типы

```typescript
// src/lib/api.ts

// Игрок из API
interface Player {
  points: number; // total_points - общие очки за все туры
}

// Игрок в составе
interface SquadPlayer {
  points: number;        // Legacy field
  total_points: number;  // Общие очки за все туры
  tour_points: number;   // Очки за последний/текущий тур
}
```

### Хуки

```typescript
// useSquadData возвращает EnrichedPlayer
interface EnrichedPlayer {
  points: number;        // Legacy field
  total_points: number;  // Общие очки за все туры
  tour_points: number;   // Очки за последний/текущий тур
}

// usePlayers возвращает TransformedPlayer
interface TransformedPlayer {
  points: number;  // total_points из API
}
```

## Логика отображения по страницам

| Страница | Тип очков | Источник данных | Поле |
|----------|-----------|-----------------|------|
| TeamBuilder (Создание команды) | `total_points` | `usePlayers` → API `/players/league/{id}/players_with_points` | `player.points` |
| Transfers - список squad | `total_points` | `useSquadData` → API `/squads/get_squad` | `player.total_points` |
| Transfers - доступные игроки | `total_points` | `usePlayers` → API `/players/league/{id}/players_with_points` | `player.points` |
| TeamManagement (Моя команда) | `total_points` | `useSquadData` → API `/squads/get_squad` | `player.total_points` |
| ViewTeam (Просмотр команды) | `tour_points` | `useSquadById` → API `/squads/get_squad_{id}` | `player.tour_points` |
| League (Турнирная таблица) | `tour_points`, `total_points` | Лидерборд команд | `entry.tour_points`, `entry.total_points` |

## Fallback логика

Для обеспечения совместимости со старыми данными используется fallback:

```typescript
// Для total_points
const displayPoints = player.total_points ?? player.points ?? 0;

// Для tour_points
const displayPoints = player.tour_points ?? player.points ?? 0;
```

## Backend API endpoints

Система опирается на следующие эндпоинты:

1. **`GET /api/squads/get_squad`** - возвращает `total_points` и `tour_points` для каждого игрока в squad
2. **`GET /api/players/league/{league_id}/players_with_points`** - возвращает `points` (содержит `total_points`)
3. **`GET /api/squads/get_squad_{squad_id}`** - возвращает `total_points` и `tour_points`

## Проверка

Все изменения протестированы для следующих сценариев:
- ✅ Создание новой команды - отображаются `total_points`
- ✅ Трансферы (список squad) - отображаются `total_points`
- ✅ Трансферы (доступные игроки) - отображаются `total_points`
- ✅ Моя команда (список) - отображаются `total_points`
- ✅ Просмотр команды (расстановка) - отображаются `tour_points`
- ✅ Просмотр команды (список) - отображаются `tour_points`
- ✅ Fallback на legacy `points` при отсутствии новых полей

## Дата завершения
29 января 2025
