#!/bin/bash
set -e

echo ""
echo "======================================"
echo "  АСУ СЦ «Сервис Климат» — Запуск"
echo "======================================"
echo ""

# 1. Базы данных
echo "▶ Запуск баз данных (Docker)..."
docker compose -f docker-compose.dev.yml up -d postgres redis rabbitmq
echo "✓ PostgreSQL, Redis, RabbitMQ запущены"
echo ""

# 2. Ждём готовности PostgreSQL
echo "⏳ Ожидание готовности PostgreSQL..."
until docker exec sk_postgres pg_isready -U servisklimat > /dev/null 2>&1; do
  sleep 1
done
echo "✓ PostgreSQL готов"
echo ""

# 3. Бэкенд в фоне
echo "▶ Запуск бэкенда (Spring Boot)..."
cd "$(dirname "$0")/../backend"
mvn spring-boot:run -q &
BACKEND_PID=$!
echo "✓ Бэкенд запускается (PID: $BACKEND_PID)..."
echo ""

# 4. Ждём бэкенд
echo "⏳ Ожидание готовности API (может занять до 2 минут)..."
until curl -s http://localhost:8090/actuator/health | grep -q '"status":"UP"'; do
  sleep 3
done
echo "✓ API готов: http://localhost:8090"
echo ""

# 5. Фронтенд
echo "▶ Запуск фронтенда (React + Vite)..."
cd "$(dirname "$0")/.."
npm run dev &
FRONTEND_PID=$!
echo ""
echo "======================================"
echo "  ✅ Всё запущено!"
echo "======================================"
echo ""
echo "  🌐 Интерфейс:      http://localhost:5173"
echo "  📡 API:            http://localhost:8090"
echo "  📖 Swagger UI:     http://localhost:8090/swagger-ui.html"
echo "  🐰 RabbitMQ UI:    http://localhost:15672"
echo "     (логин: admin / sk_rabbit_pass)"
echo ""
echo "  Для остановки нажмите Ctrl+C"
echo ""

# Держим скрипт живым
wait $BACKEND_PID $FRONTEND_PID
