-- ══════════════════════════════════════════════
-- SPRINT 08: HR and Payroll tables
-- Note: engineer_day_logs already exists in V001 with basic columns
-- We add payroll_periods, payroll_items, payslips
-- ══════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS payroll_periods (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    period_start DATE NOT NULL,
    period_end DATE NOT NULL,
    status VARCHAR(20) DEFAULT 'OPEN',
    closed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS payroll_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    period_id UUID NOT NULL REFERENCES payroll_periods(id) ON DELETE CASCADE,
    engineer_id UUID NOT NULL REFERENCES engineers(id),
    piece_rate_earnings DECIMAL(12,2) DEFAULT 0,
    gsm_compensation DECIMAL(12,2) DEFAULT 0,
    bonuses DECIMAL(12,2) DEFAULT 0,
    deductions DECIMAL(12,2) DEFAULT 0,
    total_gross DECIMAL(12,2) DEFAULT 0,
    period_start DATE,
    period_end DATE
);

CREATE TABLE IF NOT EXISTS payslips (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    payroll_item_id UUID NOT NULL REFERENCES payroll_items(id),
    engineer_id UUID NOT NULL REFERENCES engineers(id),
    period VARCHAR(10) NOT NULL,
    total_gross DECIMAL(12,2) NOT NULL,
    details_json TEXT,
    is_visible BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_payroll_items_period ON payroll_items(period_id);
CREATE INDEX IF NOT EXISTS idx_payroll_items_engineer ON payroll_items(engineer_id);
CREATE INDEX IF NOT EXISTS idx_payslips_engineer ON payslips(engineer_id);
