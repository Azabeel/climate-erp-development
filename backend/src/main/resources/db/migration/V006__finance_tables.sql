-- Sprint 07: Finance tables — invoices, invoice_lines, acts

CREATE TABLE IF NOT EXISTS invoices (
    id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    work_order_id UUID REFERENCES work_orders(id),
    client_id    UUID REFERENCES clients(id),
    number       VARCHAR(50) UNIQUE NOT NULL,
    total_amount DECIMAL(12, 2) DEFAULT 0,
    status       VARCHAR(20)   DEFAULT 'DRAFT',
    issued_at    TIMESTAMPTZ,
    due_date     DATE,
    paid_at      TIMESTAMPTZ,
    created_at   TIMESTAMPTZ   DEFAULT NOW(),
    updated_at   TIMESTAMPTZ   DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS invoice_lines (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    invoice_id  UUID         NOT NULL REFERENCES invoices(id) ON DELETE CASCADE,
    description VARCHAR(500) NOT NULL,
    quantity    DECIMAL(10, 3) DEFAULT 1,
    unit_price  DECIMAL(12, 2) NOT NULL,
    total_price DECIMAL(12, 2) NOT NULL,
    sort_order  INT            DEFAULT 0
);

CREATE TABLE IF NOT EXISTS acts (
    id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    work_order_id UUID REFERENCES work_orders(id),
    invoice_id    UUID REFERENCES invoices(id),
    client_id     UUID REFERENCES clients(id),
    number        VARCHAR(50) UNIQUE NOT NULL,
    total_amount  DECIMAL(12, 2) DEFAULT 0,
    status        VARCHAR(20)    DEFAULT 'DRAFT',
    signed_at     TIMESTAMPTZ,
    created_at    TIMESTAMPTZ    DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_invoices_work_order  ON invoices(work_order_id);
CREATE INDEX IF NOT EXISTS idx_invoices_client      ON invoices(client_id);
CREATE INDEX IF NOT EXISTS idx_invoice_lines_invoice ON invoice_lines(invoice_id);
CREATE INDEX IF NOT EXISTS idx_acts_work_order      ON acts(work_order_id);
CREATE INDEX IF NOT EXISTS idx_acts_invoice         ON acts(invoice_id);
