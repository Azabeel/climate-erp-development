# 🚀 START.md — Как запустить автономную разработку

## Шаг 1 — Установить Claude Code
```bash
npm install -g @anthropic-ai/claude-code
claude --version
```

## Шаг 2 — Войти
```bash
claude login
```

## Шаг 3 — Открыть папку проекта
```bash
cd servis-klimat-dev
```

## Шаг 4 — Запустить Docker зависимости
```bash
docker-compose -f docker-compose.dev.yml up -d
# Подождать ~30 секунд
docker-compose -f docker-compose.dev.yml ps
```

## Шаг 5 — Запустить Claude Code

### Вариант А — Интерактивный режим (рекомендуется для начала)
```bash
claude
```
Затем вставить эту команду:
```
Прочитай CLAUDE.md полностью. Затем прочитай docs/full-spec.md.
Выполни Sprint 01 из CLAUDE.md полностью.
Создай Spring Boot проект, примени Flyway миграцию V001,
убедись что curl http://localhost:8090/actuator/health возвращает UP.
Запусти все тесты Sprint 01. Все должны быть зелёными.
Обнови PROGRESS.md отметив завершённые пункты.
```

### Вариант Б — Полностью автономный (без подтверждений)
```bash
claude --dangerously-skip-permissions
```
Затем вставить:
```
Прочитай CLAUDE.md. Начни автономную разработку с Sprint 01.
Работай непрерывно: выполняй задачи, исправляй ошибки сам,
запускай тесты, обновляй PROGRESS.md.
Не останавливайся пока все тесты Sprint 01 не будут зелёными.
Используй subagents для параллельных задач где возможно.
```

### Вариант В — Параллельные агенты (максимальная скорость)
```bash
# Терминал 1 — Backend Sprint 03 (FSM)
claude --dangerously-skip-permissions "Прочитай CLAUDE.md. Выполни Sprint 03 (FSM Наряды). TDD. Все тесты зелёные."

# Терминал 2 — Backend Sprint 05 (Склад) — независим от Sprint 03
claude --dangerously-skip-permissions "Прочитай CLAUDE.md. Выполни Sprint 05 (Склад и Хладагенты). TDD. Все тесты зелёные."
```

## Порядок спринтов (оптимальный)

### Последовательные (зависят друг от друга):
```
Sprint 01 → Sprint 02 → Sprint 03 → Sprint 04
```

### Параллельные (можно запускать одновременно):
```
Sprint 05 (Склад) ║ Sprint 10 (CRM)
Sprint 06 (ЗИП)   ║ Sprint 11 (EAM)
Sprint 07 (Finance)║ Sprint 09 (Android)
Sprint 08 (HR)     ║ Sprint 15 (Frontend)
```

### Финальные (после всех):
```
Sprint 12 → Sprint 13 → Sprint 14 → Sprint 16
```

## Мониторинг прогресса
```bash
# Что сделано
grep "\[x\]" PROGRESS.md | wc -l

# Что осталось
grep "\[ \]" PROGRESS.md | head -10

# Последние действия
tail -20 PROGRESS.md

# Статус тестов
cd backend && mvn test 2>&1 | grep "Tests run:"
```

## Если что-то пошло не так
```bash
# Показать ошибки
cd backend && mvn test 2>&1 | grep "FAILED\|ERROR" | head -20

# Сказать Claude Code
"Прочитай PROGRESS.md. Запусти mvn test. Покажи все ошибки и исправь их."
```

## Ожидаемое время выполнения
- Sprint 01-04: 10-14 дней (активных сессий ~5-7 часов каждая)
- Sprint 05-12: 30-45 дней
- Sprint 13-16: 15-20 дней
- **Итого: 55-80 дней активной работы**
- **С параллельными агентами: 30-45 дней**
