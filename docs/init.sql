-- PostgreSQL initialization script
-- Creates required schemas and extensions before Flyway migrations run

CREATE SCHEMA IF NOT EXISTS keycloak;

CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
