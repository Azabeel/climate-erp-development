#!/bin/bash
# Автоматически запускает тесты после редактирования файлов

FILES="$1"
PROJECT_ROOT="$(cd "$(dirname "$0")/.." && pwd)"

if echo "$FILES" | grep -q "\.java$"; then
  echo "🔵 [HOOK] Java файл изменён — запускаю spotless check..."
  cd "$PROJECT_ROOT/backend" && mvn spotless:check -q 2>&1 | tail -5
  
  # Определяем затронутый модуль и запускаем его тесты
  MODULE=$(echo "$FILES" | grep -o 'service/[A-Za-z]*Service' | head -1)
  if [ -n "$MODULE" ]; then
    TEST="${MODULE}Test"
    echo "🔵 [HOOK] Запускаю тест: $TEST"
    cd "$PROJECT_ROOT/backend" && mvn test -Dtest="$TEST" -q 2>&1 | tail -10
  fi
fi

if echo "$FILES" | grep -q "\.kt$"; then
  echo "🟢 [HOOK] Kotlin файл изменён — запускаю ktlint..."
  cd "$PROJECT_ROOT/mobile" && ./gradlew ktlintCheck -q 2>&1 | tail -5
fi

if echo "$FILES" | grep -q "\.\(tsx\|ts\)$"; then
  echo "🟡 [HOOK] TypeScript файл изменён — запускаю eslint..."
  cd "$PROJECT_ROOT/frontend" && npm run lint --silent 2>&1 | tail -5
fi

exit 0
