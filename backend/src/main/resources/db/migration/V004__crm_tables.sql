-- Sprint 10: CRM Tables

-- Лиды
CREATE TABLE leads (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    client_id UUID REFERENCES clients(id),
    name VARCHAR(255) NOT NULL,
    phone VARCHAR(20),
    email VARCHAR(255),
    source VARCHAR(30) DEFAULT 'MANUAL',
    channel VARCHAR(20),
    description TEXT,
    assigned_to UUID,
    status VARCHAR(30) DEFAULT 'NEW',
    converted_to_deal_id UUID,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Сделки (воронка)
CREATE TABLE deals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    lead_id UUID REFERENCES leads(id),
    client_id UUID NOT NULL REFERENCES clients(id),
    title VARCHAR(255) NOT NULL,
    stage VARCHAR(30) NOT NULL DEFAULT 'QUALIFICATION',
    amount DECIMAL(12,2) DEFAULT 0,
    probability INT DEFAULT 50,
    planned_close_date DATE,
    actual_close_date DATE,
    assigned_to UUID,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Коммерческие предложения
CREATE TABLE commercial_proposals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    deal_id UUID NOT NULL REFERENCES deals(id),
    client_id UUID NOT NULL REFERENCES clients(id),
    number VARCHAR(50) UNIQUE NOT NULL,
    title VARCHAR(255) NOT NULL,
    variant VARCHAR(20) DEFAULT 'STANDARD',
    total_amount DECIMAL(12,2) DEFAULT 0,
    valid_until DATE,
    status VARCHAR(20) DEFAULT 'DRAFT',
    pdf_url VARCHAR(500),
    sent_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE cp_lines (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    proposal_id UUID NOT NULL REFERENCES commercial_proposals(id) ON DELETE CASCADE,
    description VARCHAR(500) NOT NULL,
    quantity DECIMAL(10,3) DEFAULT 1,
    unit VARCHAR(20) DEFAULT 'шт',
    unit_price DECIMAL(12,2) NOT NULL,
    total_price DECIMAL(12,2) NOT NULL,
    sort_order INT DEFAULT 0
);

-- Задачи CRM
CREATE TABLE crm_tasks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    lead_id UUID REFERENCES leads(id),
    deal_id UUID REFERENCES deals(id),
    client_id UUID REFERENCES clients(id),
    title VARCHAR(255) NOT NULL,
    description TEXT,
    type VARCHAR(30) DEFAULT 'CALL',
    due_date TIMESTAMPTZ,
    completed_at TIMESTAMPTZ,
    assigned_to UUID,
    created_by UUID,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Показатель здоровья клиента (расчётный)
CREATE TABLE client_health_scores (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    client_id UUID UNIQUE NOT NULL REFERENCES clients(id),
    score INT DEFAULT 100,
    last_order_date DATE,
    orders_last_12m INT DEFAULT 0,
    avg_rating DECIMAL(3,1),
    open_complaints INT DEFAULT 0,
    contract_active BOOLEAN DEFAULT FALSE,
    calculated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_leads_client ON leads(client_id);
CREATE INDEX idx_leads_status ON leads(status);
CREATE INDEX idx_deals_client ON deals(client_id);
CREATE INDEX idx_deals_stage ON deals(stage);
CREATE INDEX idx_cp_deal ON commercial_proposals(deal_id);
CREATE INDEX idx_crm_tasks_deal ON crm_tasks(deal_id);
CREATE INDEX idx_health_client ON client_health_scores(client_id);
