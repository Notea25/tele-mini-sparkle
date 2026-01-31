# Руководство по обновлению фронтенда для penalty_points

## Обзор изменений

Добавлено поле `penalty_points` во все интерфейсы и компоненты, связанные с очками команд.

## ✅ Завершено

### 1. Обновлены типы в `src/lib/api.ts`

```typescript
export interface UserSquad {
  // ... существующие поля
  points: number;
  penalty_points: number;  // ✅ ДОБАВЛЕНО
  // ...
}

export interface LeaderboardEntry {
  // ... существующие поля
  tour_points: number;
  total_points: number;
  penalty_points: number;  // ✅ ДОБАВЛЕНО
}

export interface TourHistorySnapshot {
  // ... существующие поля
  points: number;
  penalty_points: number;  // ✅ ДОБАВЛЕНО
  // ...
}
```

### 2. Создан компонент `PointsDisplay.tsx`

Новый компонент для унифицированного отображения очков с штрафами:

```typescript
import { PointsDisplay, LeaderboardPoints } from "@/components/PointsDisplay";

// Компактный режим
<PointsDisplay points={1250} penaltyPoints={12} mode="compact" />
// Отобразится: "1238 (-12)"

// Детальный режим
<PointsDisplay points={1250} penaltyPoints={12} mode="detailed" />
// Отобразится:
// Заработано: 1250
// Штрафы: -12
// ──────────────
// Итого: 1238

// Для лидербордов
<LeaderboardPoints totalPoints={1250} penaltyPoints={12} />
```

## 📋 TODO: Необходимые обновления

### 3. League.tsx

**Что обновить:**

#### 3.1. Добавить импорт компонента
```typescript
import { LeaderboardPoints } from "@/components/PointsDisplay";
```

#### 3.2. Обновить отображение в статистике (строка ~520-560)
```typescript
// Найти блок статистики команды
<div className="mb-4">
  <span className="text-sm text-muted-foreground">Очки</span>
  <span className="text-2xl font-bold">
    {currentSquad?.points ?? 0}
  </span>
</div>

// Заменить на:
<div className="mb-4">
  <span className="text-sm text-muted-foreground">Очки</span>
  <PointsDisplay 
    points={currentSquad?.points ?? 0}
    penaltyPoints={currentSquad?.penalty_points ?? 0}
    mode="compact"
  />
</div>
```

#### 3.3. Обновить турнирную таблицу (строка ~650-653)
```typescript
// Найти:
<span className={`col-span-2 text-right font-bold text-sm`}>
  {row.totalPoints.toLocaleString()}
</span>

// Заменить на:
<div className="col-span-2">
  <LeaderboardPoints 
    totalPoints={row.totalPoints}
    penaltyPoints={row.penaltyPoints ?? 0}
  />
</div>
```

#### 3.4. Обновить clubLeaderboardData (строка ~135-148)
```typescript
return rawData.map((entry: CustomLeagueLeaderboardEntry) => ({
  id: entry.squad_id,
  position: entry.place,
  name: entry.squad_name,
  tourPoints: entry.tour_points,
  totalPoints: entry.total_points,
  penaltyPoints: entry.penalty_points ?? 0,  // ✅ ДОБАВИТЬ
  isUser: entry.squad_id === mySquadId,
  change: "same" as "up" | "down" | "same",
}));
```

#### 3.5. Обновить tableData (строка ~312-336)
```typescript
const top3 = leaderboard.slice(0, 3).map((entry: LeaderboardEntry) => ({
  id: entry.squad_id,
  position: entry.place,
  name: entry.squad_name,
  tourPoints: entry.tour_points,
  totalPoints: entry.total_points,
  penaltyPoints: entry.penalty_points ?? 0,  // ✅ ДОБАВИТЬ
  isUser: entry.squad_id === mySquadId,
  change: "same" as "up" | "down" | "same",
}));
```

### 4. ViewTeam.tsx

**Что обновить:**

#### 4.1. Добавить импорт
```typescript
import { PointsDisplay } from "@/components/PointsDisplay";
```

#### 4.2. Обновить отображение очков команды (строка ~243-245)
```typescript
// Найти:
const displayPoints = selectedTourId ? viewTourPoints : tourPoints;

// Добавить:
const displayPenaltyPoints = selectedSnapshot?.penalty_points ?? squad?.penalty_points ?? 0;

// Обновить UI (строка ~280-290):
<PointsDisplay 
  points={displayPoints}
  penaltyPoints={displayPenaltyPoints}
  mode="compact"
  className="text-2xl"
/>
```

### 5. TournamentTable.tsx

**Что обновить:**

#### 5.1. Добавить импорт
```typescript
import { LeaderboardPoints } from "@/components/PointsDisplay";
```

#### 5.2. Обновить таблицу лидерборда (строка ~67-72)
```typescript
// Найти отображение total_points
// Заменить на:
<LeaderboardPoints 
  totalPoints={entry.total_points}
  penaltyPoints={entry.penalty_points ?? 0}
/>
```

### 6. ViewLeague.tsx, ViewUserLeague.tsx, ViewComLeague.tsx

**Что обновить в каждом:**

#### 6.1. Добавить импорт
```typescript
import { LeaderboardPoints } from "@/components/PointsDisplay";
```

#### 6.2. Обновить отображение в таблице
```typescript
// Найти места отображения total_points
// Заменить на:
<LeaderboardPoints 
  totalPoints={entry.total_points}
  penaltyPoints={entry.penalty_points ?? 0}
/>
```

### 7. TourHistory.tsx (компонент)

**Что обновить:**

#### 7.1. Добавить импорт
```typescript
import { PointsDisplay } from "@/components/PointsDisplay";
```

#### 7.2. Обновить отображение очков за тур
```typescript
// В компоненте TourHistory, где отображаются очки:
<PointsDisplay 
  points={snapshot.points}
  penaltyPoints={snapshot.penalty_points ?? 0}
  mode="compact"
/>
```

### 8. Обновить типы для CustomLeagueLeaderboardEntry

В `src/lib/api.ts` найти и добавить:
```typescript
export interface CustomLeagueLeaderboardEntry {
  place: number;
  squad_id: number;
  squad_name: string;
  user_id: number;
  username: string;
  tour_points: number;
  total_points: number;
  penalty_points: number;  // ✅ ДОБАВИТЬ
  fav_team_id: number;
  fav_team_name: string | null;
}
```

## 🎨 Рекомендации по UI/UX

1. **Цветовая схема для штрафов:**
   - Используйте `text-red-500` для отображения штрафных очков
   - Штрафы всегда показывайте со знаком минус: `(-12)`

2. **Размер шрифта:**
   - Основные очки: `text-lg` или `text-2xl` (в зависимости от контекста)
   - Штрафы: `text-xs` или `text-sm`

3. **Позиционирование:**
   - В компактном режиме штрафы справа от основных очков
   - В детальном режиме — вертикальный список с разделителем

4. **Тултипы (опционально):**
   - При наведении на штрафы можно показывать причину
   - "Штраф за 3 платных трансфера"

## 🧪 Тестирование

После внедрения проверьте:

1. **League.tsx:**
   - [ ] Статистика команды показывает штрафы
   - [ ] Турнирная таблица показывает штрафы
   - [ ] Клубная лига показывает штрафы

2. **ViewTeam.tsx:**
   - [ ] Очки команды показывают штрафы
   - [ ] История туров показывает штрафы за каждый тур

3. **Лидерборды:**
   - [ ] TournamentTable показывает штрафы
   - [ ] ViewLeague показывает штрафы
   - [ ] ViewUserLeague показывает штрафы
   - [ ] ViewComLeague показывает штрафы

4. **Разные сценарии:**
   - [ ] Команда без штрафов (penalty_points = 0)
   - [ ] Команда со штрафами
   - [ ] Исторические туры со штрафами

## 📝 Пример изменений

### До:
```typescript
<span className="font-bold">{totalPoints}</span>
```

### После:
```typescript
<LeaderboardPoints 
  totalPoints={totalPoints}
  penaltyPoints={penaltyPoints ?? 0}
/>
```

## 🔍 Поиск по файлам

Используйте поиск для быстрого обновления:

**Найти:** `total_points`
**Контекст:** Везде, где отображается в UI
**Действие:** Заменить на компонент `LeaderboardPoints` или `PointsDisplay`

**Найти:** `tour_points`
**Контекст:** В таблицах лидербордов
**Действие:** Убедиться, что penalty_points тоже добавлен

## ⚠️ Важные замечания

1. **Обратная совместимость:** Всегда используйте `?? 0` для penalty_points на случай, если бэкенд вернет null/undefined
2. **Типизация:** TypeScript автоматически подскажет места, где нужны изменения после обновления интерфейсов
3. **Миграция данных:** Старые данные могут не иметь penalty_points - обработайте это
