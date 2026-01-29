# Изменения на фронтенде для отображения очков игроков

## Описание
Обновлены компоненты и типы для отображения двух видов очков игроков:
- `total_points` - общее количество очков за все туры
- `tour_points` - очки за последний/текущий тур

## Изменённые файлы

### 1. `src/lib/api.ts`
**Обновлен интерфейс `SquadPlayer`:**
```typescript
export interface SquadPlayer {
  id: number;
  name: string;
  team_id: number;
  team_name: string;
  team_logo: string;
  position: string;
  market_value: number;
  photo: string;
  points: number; // Оставлено для обратной совместимости
  total_points: number; // Общие очки за все туры
  tour_points: number; // Очки за последний/текущий тур
}
```

### 2. `src/components/PlayerCard.tsx`
**Обновлен интерфейс `PlayerData`:**
```typescript
interface PlayerData {
  id: number;
  name: string;
  team: string;
  position: string;
  points: number; // Оставлено для обратной совместимости
  price: number;
  total_points?: number; // Общие очки за все туры
  tour_points?: number; // Очки за последний/текущий тур
}
```

**Добавлен новый проп `showTourPoints`:**
```typescript
interface PlayerCardProps {
  // ... существующие пропсы
  showTourPoints?: boolean; // true = показывать tour_points, false/undefined = показывать total_points
}
```

**Логика выбора очков:**
```typescript
const displayPoints = showTourPoints 
  ? (player.tour_points ?? 0) 
  : (player.total_points ?? player.points ?? 0);
```

### 3. `src/hooks/useSquadById.ts`
**Обновлен интерфейс `EnrichedPlayer`:**
```typescript
export interface EnrichedPlayer {
  id: number;
  name: string;
  // ... другие поля
  points: number; // Оставлено для обратной совместимости
  total_points?: number; // Общие очки за все туры
  tour_points?: number; // Очки за последний/текущий тур
  // ... другие поля
}
```

**Обновлена логика обработки игроков:**
- При создании `mainPlayers` и `benchPlayers` теперь передаются `total_points` и `tour_points` из API

### 4. `src/pages/ViewTeam.tsx`
**Обновлен компонент для отображения очков за тур:**
```typescript
<PlayerCard
  player={{
    // ... остальные поля
    total_points: selectedPlayer.total_points,
    tour_points: selectedPlayer.tour_points,
  }}
  showTourPoints={true} // Показываем очки за тур
  variant="view"
/>
```

## Как использовать в других страницах

### Для страниц с total_points (создание команды, трансферы, моя команда):
```typescript
<PlayerCard
  player={{
    id: player.id,
    name: player.name,
    // ... остальные поля
    total_points: player.total_points,
    tour_points: player.tour_points,
  }}
  showTourPoints={false} // или не указывать вообще (по умолчанию false)
/>
```

### Для страниц с tour_points (просмотр команды, результаты):
```typescript
<PlayerCard
  player={{
    id: player.id,
    name: player.name,
    // ... остальные поля
    total_points: player.total_points,
    tour_points: player.tour_points,
  }}
  showTourPoints={true} // Показываем очки за тур
/>
```

## Обратная совместимость
- Поле `points` сохранено во всех интерфейсах
- Если `total_points` или `tour_points` не указаны, используется значение `points`
- Существующий код продолжит работать без изменений

## Оставшаяся работа
Необходимо обновить следующие страницы для передачи новых полей:

### TeamManagement (Моя команда) - showTourPoints=false
```typescript
// Найти использование PlayerCard и добавить:
<PlayerCard
  player={{
    // ... существующие поля
    total_points: player.total_points,
    tour_points: player.tour_points,
  }}
  showTourPoints={false}
/>
```

### TeamBuilder (Создание команды) - showTourPoints=false
```typescript
// Найти использование PlayerCard и добавить:
<PlayerCard
  player={{
    // ... существующие поля
    total_points: player.total_points,
    tour_points: player.tour_points,
  }}
  showTourPoints={false}
/>
```

### Transfers (Трансферы) - showTourPoints=false
```typescript
// Найти использование PlayerCard и добавить:
<PlayerCard
  player={{
    // ... существующие поля
    total_points: player.total_points,
    tour_points: player.tour_points,
  }}
  showTourPoints={false}
/>
```

## Тестирование
1. Запустите фронтенд: `npm run dev`
2. Убедитесь, что API бэкенда запущен
3. Откройте страницу ViewTeam - должны отображаться очки за тур (`tour_points`)
4. Откройте страницы создания команды/трансферов/моя команда - должны отображаться общие очки (`total_points`)

## Примечания
- API бэкенда уже обновлен и возвращает оба поля (`total_points` и `tour_points`)
- Если бэкенд не возвращает эти поля, компонент использует fallback на `points`
- Все изменения обратно совместимы
