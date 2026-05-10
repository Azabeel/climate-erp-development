#!/bin/bash
set -e

echo ""
echo "======================================"
echo "  АСУ СЦ «Сервис Климат» — Запуск"
echo "======================================"
echo ""

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"

# ── Запуск сервисов ───────────────────────────────────────────────────────────
echo "▶ Запуск баз данных..."

if command -v docker &>/dev/null && docker info &>/dev/null 2>&1; then
    # Docker доступен — используем compose
    docker compose -f "$PROJECT_DIR/docker-compose.dev.yml" up -d postgres redis rabbitmq
    echo "✓ PostgreSQL, Redis, RabbitMQ запущены (Docker)"
else
    # Нативные сервисы (Codespaces без Docker)
    sudo service postgresql start 2>/dev/null || true
    sudo service redis-server start 2>/dev/null || true
    sudo service rabbitmq-server start 2>/dev/null || true
    echo "✓ PostgreSQL, Redis, RabbitMQ запущены (нативно)"
fi

echo ""

# ── Ожидание PostgreSQL ───────────────────────────────────────────────────────
echo "⏳ Ожидание готовности PostgreSQL..."
for i in $(seq 1 30); do
    if pg_isready -U servisklimat -d servisklimat -q 2>/dev/null || \
       pg_isready -h localhost -U servisklimat -q 2>/dev/null; then
        break
    fi
    sleep 2
done
echo "✓ PostgreSQL готов"
echo ""

# ── Бэкенд ───────────────────────────────────────────────────────────────────
echo "▶ Запуск бэкенда (Spring Boot)..."
echo "  (первый запуск занимает ~2 минуты — скачиваются зависимости Maven)"
echo ""
cd "$PROJECT_DIR/backend"
mvn spring-boot:run -q &
BACKEND_PID=$!

echo "⏳ Ожидание готовности API..."
for i in $(seq 1 60); do
    if curl -s http://localhost:8090/actuator/health 2>/dev/null | grep -q '"status":"UP"'; then
        break
    fi
    sleep 5
    echo "  ... ожидаем ($((i * 5)) сек)"
done
echo "✓ API готов: http://localhost:8090"
echo ""

# ── Фронтенд ─────────────────────────────────────────────────────────────────
echo "▶ Запуск фронтенда (React)..."
cd "$PROJECT_DIR"
npm run dev &
FRONTEND_PID=$!
sleep 3

echo ""
echo "======================================"
echo "  ✅ Всё запущено!"
echo "======================================"
echo ""
echo "  🌐 Интерфейс:   http://localhost:5173"
echo "  📖 Swagger UI:  http://localhost:8090/swagger-ui.html"
echo "  🐰 RabbitMQ UI: http://localhost:15672"
echo "     (логин: admin / sk_rabbit_pass)"
echo ""
echo "  Для остановки нажмите Ctrl+C"
echo ""

wait $BACKEND_PID $FRONTEND_PID
