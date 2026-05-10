-- V003__refrigerant_tables.sql
-- Таблицы для учёта хладагентов АСУ СЦ «Сервис Климат»

-- ══════════════════════════════════════════════
-- ТИПЫ ХЛАДАГЕНТОВ
-- ══════════════════════════════════════════════

CREATE TABLE refrigerant_types (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL UNIQUE,
    gwp INT,
    ozone_depletion_potential DECIMAL(5,3),
    max_charge_kg DECIMAL(10,3),
    is_active BOOLEAN DEFAULT TRUE
);

-- ══════════════════════════════════════════════
-- БАЛЛОНЫ С ХЛАДАГЕНТОМ
-- ══════════════════════════════════════════════

CREATE TABLE refrigerant_cylinders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    serial_number VARCHAR(100) UNIQUE NOT NULL,
    refrigerant_type_id UUID NOT NULL REFERENCES refrigerant_types(id),
    initial_weight_kg DECIMAL(10,3) NOT NULL,
    current_weight_kg DECIMAL(10,3) NOT NULL,
    engineer_id UUID REFERENCES engineers(id),
    location_type VARCHAR(20) DEFAULT 'CENTRAL',
    purchase_price DECIMAL(12,2) DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ══════════════════════════════════════════════
-- ЖУРНАЛ ОПЕРАЦИЙ С ХЛАДАГЕНТОМ
-- ══════════════════════════════════════════════

CREATE TABLE refrigerant_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    work_order_id UUID REFERENCES work_orders(id),
    equipment_id UUID REFERENCES equipment(id),
    engineer_id UUID REFERENCES engineers(id),
    cylinder_id UUID NOT NULL REFERENCES refrigerant_cylinders(id),
    refrigerant_type_id UUID NOT NULL REFERENCES refrigerant_types(id),
    operation_type VARCHAR(20) NOT NULL CHECK (operation_type IN ('CHARGE', 'RECOVERY', 'TOP_UP', 'REPLACEMENT')),
    amount_kg DECIMAL(10,3) NOT NULL,
    unit_price DECIMAL(12,2) DEFAULT 0,
    notes TEXT,
    created_by UUID,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ══════════════════════════════════════════════
-- ИНДЕКСЫ
-- ══════════════════════════════════════════════

CREATE INDEX idx_refrigerant_cylinders_active ON refrigerant_cylinders(is_active) WHERE is_active = TRUE;
CREATE INDEX idx_refrigerant_cylinders_engineer ON refrigerant_cylinders(engineer_id);
CREATE INDEX idx_refrigerant_log_equipment ON refrigerant_log(equipment_id);
CREATE INDEX idx_refrigerant_log_work_order ON refrigerant_log(work_order_id);
CREATE INDEX idx_refrigerant_log_created_at ON refrigerant_log(created_at DESC);

-- ══════════════════════════════════════════════
-- НАЧАЛЬНЫЕ ДАННЫЕ: РАСПРОСТРАНЁННЫЕ ХЛАДАГЕНТЫ
-- ══════════════════════════════════════════════

INSERT INTO refrigerant_types (name, gwp, ozone_depletion_potential, max_charge_kg) VALUES
('R-410A', 2088, 0.000, NULL),
('R-32', 675, 0.000, NULL),
('R-22', 1810, 0.055, NULL),
('R-407C', 1774, 0.000, NULL),
('R-134a', 1430, 0.000, NULL),
('R-290', 3, 0.000, NULL),
('R-600a', 3, 0.000, NULL);
