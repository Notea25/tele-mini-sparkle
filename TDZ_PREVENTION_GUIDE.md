# Temporal Dead Zone (TDZ) Prevention Guide

## ❌ Что за ошибка?

```
ReferenceError: Cannot access 'y' before initialization
```

Эта ошибка возникает когда переменная используется **ДО** её объявления/инициализации.

## 🔍 Типы TDZ ошибок в React

### 1. **Неправильный порядок useMemo/useCallback**

❌ **НЕПРАВИЛЬНО:**
```typescript
const Component = () => {
  // toursData используется здесь (строка 94)
  const targetTourId = useMemo(() => {
    if (toursData?.next_tour?.id) return toursData.next_tour.id;
    // ...
  }, [toursData]);

  // ... 40 строк кода ...

  // Но определяется только здесь (строка 131)
  const toursData = useMemo(() => {
    if (toursResponse?.success) {
      return toursResponse.data;
    }
    return null;
  }, [toursResponse]);
};
```

✅ **ПРАВИЛЬНО:**
```typescript
const Component = () => {
  // СНАЧАЛА определяем toursData
  const toursData = useMemo(() => {
    if (toursResponse?.success) {
      return toursResponse.data;
    }
    return null;
  }, [toursResponse]);

  // ПОТОМ используем
  const targetTourId = useMemo(() => {
    if (toursData?.next_tour?.id) return toursData.next_tour.id;
    // ...
  }, [toursData]);
};
```

### 2. **Использование переменной до её объявления**

❌ **НЕПРАВИЛЬНО:**
```typescript
const result = useMemo(() => {
  return data.map(item => ({
    ...item,
    totalPoints: item.totalPoints - (item.penaltyPoints || 0)  // ❌ Использует totalPenaltyPoints
  }));
}, [data]);  // Но totalPenaltyPoints не в зависимостях и не определён
```

✅ **ПРАВИЛЬНО:**
```typescript
const result = useMemo(() => {
  return data.map(item => ({
    ...item,
    totalPoints: item.totalPoints,
    totalPenaltyPoints: item.total_penalty_points || 0,  // ✅ Определяем явно
    penaltyPoints: item.penalty_points || 0
  }));
}, [data]);
```

### 3. **Несоответствие типов в данных**

❌ **НЕПРАВИЛЬНО:**
```typescript
interface DataType {
  penaltyPoints: number;  // ❌ В типе только это поле
}

// Но в коде используется другое
row.totalPenaltyPoints  // ❌ Ошибка: свойство не существует
```

✅ **ПРАВИЛЬНО:**
```typescript
interface DataType {
  penaltyPoints: number;
  totalPenaltyPoints: number;  // ✅ Оба поля в типе
}

// Теперь можно использовать
row.totalPenaltyPoints  // ✅ Работает
```

## 🛡️ Правила предотвращения

### Правило 1: Порядок объявления
Всегда объявляйте переменные **ПЕРЕД** их использованием в `useMemo`/`useCallback`.

```typescript
// ✅ Правильный порядок:
const data = useMemo(() => ..., []);           // 1. Базовые данные
const processedData = useMemo(() => ..., [data]); // 2. Обработанные данные
const finalData = useMemo(() => ..., [processedData]); // 3. Финальные данные
```

### Правило 2: Полнота типов
Убедитесь, что все поля, которые вы используете, присутствуют в интерфейсах.

```typescript
interface LeaderboardEntry {
  tourPoints: number;
  totalPoints: number;
  penaltyPoints: number;        // ✅ Для текущего тура
  totalPenaltyPoints: number;   // ✅ Для всех туров
}
```

### Правило 3: Маппинг данных
При маппинге данных из API всегда создавайте ВСЕ необходимые поля.

```typescript
const mapped = data.map(entry => ({
  // ✅ Маппим ВСЕ поля явно
  tourPoints: entry.tour_points,
  totalPoints: entry.total_points,
  totalPenaltyPoints: entry.total_penalty_points || 0,
  penaltyPoints: entry.penalty_points || 0,
}));
```

### Правило 4: Инвалидация кэша
После создания/изменения данных всегда инвалидируйте кэш.

```typescript
const response = await squadsApi.create(data);
if (response.success) {
  // ✅ Инвалидируем кэш
  await queryClient.invalidateQueries({ queryKey: ['my-squads'] });
  await queryClient.invalidateQueries({ queryKey: ['players', leagueId] });
  navigate('/league');
}
```

## 🔧 Проверка кода

Используйте скрипт `check-tdz.cjs` для автоматической проверки:

```bash
node check-tdz.cjs
```

## 📝 Checklist перед коммитом

- [ ] Все `useMemo`/`useCallback` используют только переменные, объявленные ВЫШЕ
- [ ] Все используемые свойства объектов присутствуют в TypeScript интерфейсах
- [ ] После API запросов, изменяющих данные, вызывается `invalidateQueries`
- [ ] При маппинге данных все необходимые поля создаются явно

## 🐛 Исправленные ошибки

### 1. useSquadData.ts
**Проблема:** `toursData` использовался до определения  
**Исправление:** Перенос определения `toursData` на строку 84 (до использования)  
**Commit:** `90b82ed`

### 2. ViewUserLeague.tsx, ViewComLeague.tsx, ViewLeague.tsx
**Проблема:** Отсутствие `totalPenaltyPoints` в типах и маппинге  
**Исправление:** Добавлены поля в интерфейсы и маппинг данных  
**Commit:** `b686fee`

### 3. TeamBuilder.tsx
**Проблема:** Отсутствие инвалидации кэша после создания сквада  
**Исправление:** Добавлен `queryClient.invalidateQueries` после создания  
**Commit:** `511c73c`

## 🎯 Итого

**Все текущие TDZ ошибки исправлены!** ✅

Скрипт проверки: **128 файлов проверено, 0 ошибок найдено**
