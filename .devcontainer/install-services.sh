#!/bin/bash
# Устанавливает PostgreSQL 15, Redis, RabbitMQ нативно (без Docker)
set -e

echo "▶ Установка PostgreSQL, Redis, RabbitMQ..."
sudo apt-get update -q
sudo apt-get install -y -q postgresql postgresql-client redis-server rabbitmq-server

# ── PostgreSQL ────────────────────────────────────────────────────────────────
echo "▶ Настройка PostgreSQL..."
sudo service postgresql start
sleep 3

# Создаём пользователя и базу если ещё не существуют
sudo -u postgres psql -tc "SELECT 1 FROM pg_roles WHERE rolname='servisklimat'" | grep -q 1 || \
    sudo -u postgres psql -c "CREATE ROLE servisklimat WITH LOGIN PASSWORD 'sk_local_pass';"

sudo -u postgres psql -tc "SELECT 1 FROM pg_database WHERE datname='servisklimat'" | grep -q 1 || \
    sudo -u postgres createdb servisklimat -O servisklimat

echo "✓ PostgreSQL готов (порт 5432)"

# ── Redis ─────────────────────────────────────────────────────────────────────
echo "▶ Настройка Redis..."
sudo service redis-server start
echo "✓ Redis готов (порт 6379)"

# ── RabbitMQ ──────────────────────────────────────────────────────────────────
echo "▶ Настройка RabbitMQ..."
sudo service rabbitmq-server start
sleep 2

# Создаём пользователя admin если нет
sudo rabbitmqctl list_users 2>/dev/null | grep -q admin || \
    sudo rabbitmqctl add_user admin sk_rabbit_pass 2>/dev/null || true
sudo rabbitmqctl set_user_tags admin administrator 2>/dev/null || true
sudo rabbitmqctl set_permissions -p / admin ".*" ".*" ".*" 2>/dev/null || true

# Включаем management UI
sudo rabbitmq-plugins enable rabbitmq_management 2>/dev/null || true

echo "✓ RabbitMQ готов (порт 5672, UI: порт 15672)"
echo ""
echo "✅ Все сервисы установлены и запущены"
