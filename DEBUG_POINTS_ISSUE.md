# Диагностика проблемы с отображением очков

## Описание проблемы

**Главный лидерборд:**
- Отображается: 30
- Ожидается: -30

**Клубный лидерборд:**
- Отображается: -42
- Ожидается: -30 (учитывает лишние 12 штрафных очков)

---

## Как диагностировать

### Шаг 1: Запустите приложение

```bash
npm run dev
```

### Шаг 2: Откройте консоль браузера

- **Windows/Linux**: `F12` или `Ctrl+Shift+I`
- **Mac**: `Cmd+Option+I`

### Шаг 3: Перейдите на страницу League

Откройте главную страницу лиги (`/league`) и переключитесь на вкладку "Console" в DevTools.

### Шаг 4: Найдите логи отладки

В консоли появятся логи с данными:

```
=== ГЛАВНЫЙ ЛИДЕРБОРД (Main Leaderboard) ===
tour_points: XX
total_points: XX
penalty_points: XX
total_penalty_points: XX
Текущее отображение Total: XX
С вычетом штрафов: XX

=== КЛУБНЫЙ ЛИДЕРБОРД (Club Leaderboard) ===
tour_points: XX
total_points: XX
penalty_points: XX
total_penalty_points: XX
Текущее отображение Total: XX
С вычетом штрафов: XX
```

### Шаг 5: Скопируйте значения

Скопируйте все значения из консоли и отправьте их мне.

---

## Возможные причины

### Проблема 1: Знак числа

Если `total_points = 30`, а ожидается `-30`, возможно:
- Бэкенд возвращает абсолютное значение
- Логика расчёта изменилась
- Используется неправильное поле

### Проблема 2: Штрафы следующего тура

Если `total_penalty_points = 42`, а ожидается `30`, возможно:
- В `total_penalty_points` попадают штрафы следующего тура (12 очков)
- Бэкенд суммирует не только финализированные туры
- Логика расчёта штрафов изменилась

---

## Возможные решения

### Решение 1: Изменить знак

Если бэкенд возвращает положительное значение вместо отрицательного:

```typescript
// Вместо
{row.totalPoints.toLocaleString()}

// Использовать
{(-row.totalPoints).toLocaleString()}
```

### Решение 2: Использовать только penalty_points текущего тура

Если проблема в том, что `total_penalty_points` включает штрафы следующего тура:

```typescript
// Вместо
{(row.totalPoints - (row.totalPenaltyPoints || 0)).toLocaleString()}

// Использовать
{(row.totalPoints - (row.penaltyPoints || 0)).toLocaleString()}
```

### Решение 3: Использовать чистые очки из бэкенда

Если бэкенд добавит поле `total_net`:

```typescript
{row.totalNet.toLocaleString()}
```

---

## Текущее состояние кода

### Главный лидерборд (League.tsx:681)

```typescript
{row.totalPoints.toLocaleString()}
```

### Клубный лидерборд (через League.tsx → clubLeaderboardData)

```typescript
totalPoints: entry.total_points,
totalPenaltyPoints: entry.total_penalty_points || 0,
```

---

## След steps

1. Проверьте логи в консоли
2. Отправьте значения
3. Я подскажу точное решение на основе реальных данных

---

## Файлы для проверки

- `src/pages/League.tsx` — главный лидерборд (строка 681)
- `src/pages/League.tsx` — клубный лидерборд (строки 128-143)
- `src/lib/api.ts` — типы данных (LeaderboardEntry, CustomLeagueLeaderboardEntry)
