# Исправление отображения очков в лидербордах

**Дата:** 1 февраля 2026  
**Статус:** ✅ ИСПРАВЛЕНО

---

## Проблема

### Симптомы
1. **Главный лидерборд:** отображалось `30`, ожидалось `-30`
2. **Клубный лидерборд:** отображалось `-42`, ожидалось `-30` (лишние 12 очков штрафов)

### Причина
Бэкенд изменился и теперь возвращает в поле `total_points` **чистые очки** (`total_net`), а не брутто-очки (`total_earned`), как было раньше.

**Старая схема (согласно документации):**
```json
{
  "total_points": 135,  // total_earned (БЕЗ вычета штрафов)
  "total_penalty_points": 12
}
```
Фронтенд показывал: `135` (брутто)

**Новая схема (текущая):**
```json
{
  "total_points": -30,  // total_net (УЖЕ с вычетом штрафов)
  "total_penalty_points": 12
}
```
Фронтенд должен показывать: `-30` (чистые)

---

## Исправление

### Главный лидерборд
**Файл:** `src/pages/League.tsx:704`

**Было:**
```typescript
{row.totalPoints.toLocaleString()}
```

**Осталось без изменений** (уже правильно показывает чистые очки)

### Клубный лидерборд
**Файл:** `src/pages/League.tsx:1147`

**Было:**
```typescript
{(row.totalPoints - (row.totalPenaltyPoints || 0)).toLocaleString()}
```
Вычитало штрафы **дважды**:
- Бэкенд: `total_points = -30` (уже с вычетом)
- Фронтенд: `-30 - 12 = -42` ❌

**Стало:**
```typescript
{row.totalPoints.toLocaleString()}
```
Теперь показывает `-30` ✅

---

## Результат

✅ Главный лидерборд: показывает чистые очки (`total_points` как есть)  
✅ Клубный лидерборд: показывает чистые очки (без двойного вычитания)  
✅ Все значения согласованы с бэкендом

---

## Примечание

Если в будущем бэкенд вернётся к старой схеме (возврат брутто-очков в `total_points`), нужно будет вернуть формулу:

```typescript
{(row.totalPoints - (row.totalPenaltyPoints || 0)).toLocaleString()}
```

Но сейчас этого делать **НЕ НУЖНО**, так как `total_points` уже содержит чистые очки.

---

## Commit

**Сообщение:**
```
Fix: Remove double penalty deduction in club leaderboard

The backend now returns total_net (net points) in the total_points field
instead of total_earned (gross points). Updated club leaderboard to display
total_points directly without subtracting penalties again.

Changes:
- src/pages/League.tsx:1147 - Remove penalty subtraction from club leaderboard
- Cleaned up debug console logs

Related: #previous-penalty-fix
```

---

## Файлы с изменениями

- ✅ `src/pages/League.tsx` (строка 1147) — убрано двойное вычитание штрафов в клубном лидерборде
- ✅ `src/pages/League.tsx` (строки 128-142, 313-329) — удалены диагностические логи

---

## Проверка

После исправления проверьте:
1. Главный лидерборд (`/league`) → должен показывать правильные чистые очки
2. Клубный лидерборд (`/league`, вкладка "Лиги") → должен показывать те же чистые очки без лишних штрафов
3. Все лидерборды должны быть согласованы между собой
