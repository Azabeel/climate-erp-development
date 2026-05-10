-- ══════════════════════════════════════════════
-- Sprint 11: EAM — Maintenance Plans
-- (equipment, equipment_types, service_locations already in V001)
-- ══════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS maintenance_plans (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    equipment_id UUID NOT NULL REFERENCES equipment(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    frequency_months INT NOT NULL DEFAULT 6,
    last_done_date DATE,
    next_due_date DATE,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS maintenance_plan_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    maintenance_plan_id UUID NOT NULL REFERENCES maintenance_plans(id) ON DELETE CASCADE,
    service_id UUID REFERENCES services(id),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    sort_order INT DEFAULT 0,
    is_mandatory BOOLEAN DEFAULT TRUE
);

CREATE INDEX IF NOT EXISTS idx_maintenance_plans_equipment ON maintenance_plans(equipment_id);
CREATE INDEX IF NOT EXISTS idx_maintenance_plans_next_due ON maintenance_plans(next_due_date) WHERE is_active = TRUE;
