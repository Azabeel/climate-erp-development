# Полная спецификация данных — АСУ СЦ «Сервис Климат»

## СХЕМА БАЗЫ ДАННЫХ

### clients
```sql
CREATE TABLE clients (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    type VARCHAR(20) NOT NULL, -- INDIVIDUAL | LEGAL_ENTITY
    name VARCHAR(255) NOT NULL,
    inn VARCHAR(12),
    kpp VARCHAR(9),
    legal_address TEXT,
    actual_address TEXT,
    phone VARCHAR(20),
    email VARCHAR(255),
    preferred_channel VARCHAR(20) DEFAULT 'TELEGRAM',
    telegram_chat_id VARCHAR(50),
    whatsapp_number VARCHAR(20),
    max_user_id VARCHAR(50),
    health_score INT DEFAULT 100, -- 0-100, рассчитывается автоматически
    external_id VARCHAR(100),     -- ID в 1С
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

### contacts
```sql
CREATE TABLE contacts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    client_id UUID NOT NULL REFERENCES clients(id),
    full_name VARCHAR(255) NOT NULL,
    position VARCHAR(100),
    phone VARCHAR(20) NOT NULL,
    email VARCHAR(255),
    preferred_channel VARCHAR(20) DEFAULT 'TELEGRAM',
    telegram_chat_id VARCHAR(50),
    whatsapp_number VARCHAR(20),
    max_user_id VARCHAR(50),
    is_primary BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### sla_configs
```sql
CREATE TABLE sla_configs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    level VARCHAR(20) NOT NULL, -- CORPORATE | CONTRACT
    contract_id UUID,           -- NULL для корпоративного
    ttr_hours DECIMAL(10,2),   -- time to respond
    tto_hours DECIMAL(10,2),   -- time to on-site
    ttf_hours DECIMAL(10,2),   -- time to fix
    critical_metric VARCHAR(10), -- TTR | TTO | TTF
    warning_percent INT DEFAULT 20, -- % остатка времени для жёлтого индикатора
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE sla_service_hours (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    sla_config_id UUID NOT NULL REFERENCES sla_configs(id),
    day_of_week INT NOT NULL, -- 1=ПН, 7=ВС
    time_from TIME NOT NULL,
    time_to TIME NOT NULL
);
```

### contracts
```sql
CREATE TABLE contracts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    client_id UUID NOT NULL REFERENCES clients(id),
    number VARCHAR(100) NOT NULL,
    date_start DATE NOT NULL,
    date_end DATE,
    status VARCHAR(20) DEFAULT 'ACTIVE', -- ACTIVE|EXPIRED|TERMINATED
    sla_config_id UUID REFERENCES sla_configs(id),
    price_list_id UUID,
    act_template_id UUID,
    penalty_enabled BOOLEAN DEFAULT FALSE,
    penalty_type VARCHAR(10),   -- FIXED | PERCENT
    penalty_value DECIMAL(12,2),
    budget_limit DECIMAL(12,2),
    budget_period VARCHAR(20),  -- MONTHLY|QUARTERLY|ANNUAL
    notes TEXT,
    file_url VARCHAR(500),
    external_id VARCHAR(100),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Бренды по договору
CREATE TABLE contract_brands (
    contract_id UUID REFERENCES contracts(id),
    brand_id UUID REFERENCES brands(id),
    PRIMARY KEY (contract_id, brand_id)
);
```

### service_locations (объекты обслуживания)
```sql
CREATE TABLE service_locations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    client_id UUID NOT NULL REFERENCES clients(id),
    name VARCHAR(255) NOT NULL,
    address TEXT NOT NULL,
    lat DECIMAL(10,6),
    lng DECIMAL(10,6),
    timezone VARCHAR(50) DEFAULT 'Europe/Moscow',
    floor VARCHAR(20),
    room VARCHAR(50),
    access_notes TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE location_working_hours (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    location_id UUID NOT NULL REFERENCES service_locations(id),
    day_of_week INT NOT NULL,
    time_from TIME NOT NULL,
    time_to TIME NOT NULL
);
```

### equipment
```sql
CREATE TABLE equipment (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    client_id UUID NOT NULL REFERENCES clients(id),
    location_id UUID REFERENCES service_locations(id),
    parent_equipment_id UUID REFERENCES equipment(id),
    inventory_number VARCHAR(100),
    serial_number VARCHAR(100),
    name VARCHAR(255) NOT NULL,
    brand_id UUID REFERENCES brands(id),
    model VARCHAR(255),
    equipment_type_id UUID,
    power_kw DECIMAL(10,2),
    refrigerant_type VARCHAR(20),
    service_area_sqm DECIMAL(10,2),
    status VARCHAR(30) DEFAULT 'IN_SERVICE',
    warranty_start DATE,
    warranty_end DATE,
    warranty_cert_url VARCHAR(500),
    contract_id UUID REFERENCES contracts(id),
    sla_config_id UUID REFERENCES sla_configs(id),
    qr_code_url VARCHAR(500),
    attributes JSONB DEFAULT '{}',
    last_service_date DATE,
    predicted_failure_date DATE, -- от ML модели
    external_id VARCHAR(100),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE equipment_photos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    equipment_id UUID NOT NULL REFERENCES equipment(id),
    url VARCHAR(500) NOT NULL,
    description VARCHAR(255),
    uploaded_at TIMESTAMPTZ DEFAULT NOW()
);
```

### engineers
```sql
CREATE TABLE engineers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID,               -- Keycloak user id
    full_name VARCHAR(255) NOT NULL,
    phone VARCHAR(20),
    email VARCHAR(255),
    employment_type VARCHAR(20) DEFAULT 'EMPLOYEE',
    home_address TEXT,
    home_lat DECIMAL(10,6),
    home_lng DECIMAL(10,6),
    vehicle_type VARCHAR(20) DEFAULT 'OWN_CAR',
    fuel_rate_per_km DECIMAL(8,2) DEFAULT 0,
    hourly_rate DECIMAL(10,2) DEFAULT 0,
    has_all_competencies BOOLEAN DEFAULT FALSE,
    use_in_auto_scheduler BOOLEAN DEFAULT TRUE,
    is_active BOOLEAN DEFAULT TRUE,
    external_id VARCHAR(100),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE engineer_certifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    engineer_id UUID NOT NULL REFERENCES engineers(id),
    brand_id UUID REFERENCES brands(id),
    cert_name VARCHAR(255) NOT NULL,
    issued_at DATE,
    expires_at DATE,
    cert_url VARCHAR(500)
);

CREATE TABLE engineer_competencies (
    engineer_id UUID REFERENCES engineers(id),
    competency_id UUID REFERENCES competencies(id),
    PRIMARY KEY (engineer_id, competency_id)
);

CREATE TABLE engineer_piece_rates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    engineer_id UUID NOT NULL REFERENCES engineers(id),
    service_id UUID REFERENCES services(id),
    brand_id UUID REFERENCES brands(id),
    priority VARCHAR(20),       -- NORMAL|URGENT|EMERGENCY
    rate DECIMAL(10,2) NOT NULL
);
```

### engineer_day_logs
```sql
CREATE TABLE engineer_day_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    engineer_id UUID NOT NULL REFERENCES engineers(id),
    date DATE NOT NULL,
    start_type VARCHAR(10),     -- HOME | OFFICE
    start_lat DECIMAL(10,6),
    start_lng DECIMAL(10,6),
    start_time TIMESTAMPTZ,
    end_time TIMESTAMPTZ,
    total_km DECIMAL(10,2),
    gps_track JSONB DEFAULT '[]', -- [{lat, lng, timestamp}]
    UNIQUE(engineer_id, date)
);
```

### engineer_schedule
```sql
CREATE TABLE engineer_schedule (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    engineer_id UUID NOT NULL REFERENCES engineers(id),
    date DATE NOT NULL,
    work_start TIME,
    work_end TIME,
    type VARCHAR(20) NOT NULL,  -- WORKING|DAY_OFF|VACATION|SICK|CUSTOM
    reason VARCHAR(255),
    created_by UUID,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### services
```sql
CREATE TABLE services (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    short_name VARCHAR(100),
    description TEXT,
    specification TEXT,
    base_duration_minutes INT NOT NULL DEFAULT 60,
    execution_type VARCHAR(20) DEFAULT 'SEQUENTIAL',
    base_price DECIMAL(12,2) DEFAULT 0,
    currency VARCHAR(10) DEFAULT 'RUB',
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE service_modifiers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    service_id UUID NOT NULL REFERENCES services(id),
    name VARCHAR(255) NOT NULL,
    condition_type VARCHAR(50),   -- EQUIPMENT_TYPE|HEIGHT|SIZE|etc
    condition_value VARCHAR(100),
    add_minutes INT DEFAULT 0,
    multiply_factor DECIMAL(5,2) DEFAULT 1.0
);

CREATE TABLE service_competencies (
    service_id UUID REFERENCES services(id),
    competency_id UUID REFERENCES competencies(id),
    PRIMARY KEY (service_id, competency_id)
);

CREATE TABLE service_brands (
    service_id UUID REFERENCES services(id),
    brand_id UUID REFERENCES brands(id),
    PRIMARY KEY (service_id, brand_id)
);
```

### work_orders (ЦЕНТРАЛЬНАЯ СУЩНОСТЬ)
```sql
CREATE TABLE work_orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    number VARCHAR(50) UNIQUE NOT NULL, -- автогенерация: WO-2025-001234
    type VARCHAR(20) NOT NULL DEFAULT 'REPAIR',
    status VARCHAR(30) NOT NULL DEFAULT 'NEW',
    priority VARCHAR(20) DEFAULT 'NORMAL',
    source VARCHAR(20) DEFAULT 'MANUAL',

    -- Клиент и договор
    client_id UUID NOT NULL REFERENCES clients(id),
    contract_id UUID REFERENCES contracts(id),
    contact_id UUID REFERENCES contacts(id),
    location_id UUID REFERENCES service_locations(id),
    equipment_id UUID REFERENCES equipment(id),
    sla_config_id UUID REFERENCES sla_configs(id),

    -- Описание
    description TEXT,
    dispatcher_comment TEXT,
    engineer_report TEXT,

    -- Планирование
    total_estimated_duration_minutes INT,
    has_parallel_tasks BOOLEAN DEFAULT FALSE,
    requires_two_engineers BOOLEAN DEFAULT FALSE,
    scheduled_start TIMESTAMPTZ,
    scheduled_end TIMESTAMPTZ,
    engineer_id UUID REFERENCES engineers(id),
    second_engineer_id UUID REFERENCES engineers(id),

    -- Фактические данные
    actual_start TIMESTAMPTZ,
    actual_end TIMESTAMPTZ,

    -- SLA
    sla_ttr_planned TIMESTAMPTZ,
    sla_ttr_actual TIMESTAMPTZ,
    sla_tto_planned TIMESTAMPTZ,
    sla_tto_actual TIMESTAMPTZ,
    sla_ttf_planned TIMESTAMPTZ,
    sla_ttf_actual TIMESTAMPTZ,
    sla_status VARCHAR(10) DEFAULT 'GREEN', -- GREEN|YELLOW|RED
    sla_violated BOOLEAN DEFAULT FALSE,
    sla_notified_yellow BOOLEAN DEFAULT FALSE,
    sla_notified_red BOOLEAN DEFAULT FALSE,
    penalty_amount DECIMAL(12,2),

    -- Финансы
    cost_price DECIMAL(12,2) DEFAULT 0,
    revenue DECIMAL(12,2) DEFAULT 0,
    margin DECIMAL(12,2) DEFAULT 0,
    margin_percent DECIMAL(8,2) DEFAULT 0,

    -- Оценка
    client_rating INT,           -- 1-5
    client_comment TEXT,

    -- Внешние системы
    external_id VARCHAR(100),    -- ID в 1С
    onec_synced BOOLEAN DEFAULT FALSE,

    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    closed_at TIMESTAMPTZ
);

CREATE TABLE work_order_services (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    work_order_id UUID NOT NULL REFERENCES work_orders(id),
    service_id UUID NOT NULL REFERENCES services(id),
    applied_modifiers JSONB DEFAULT '[]',
    calculated_duration_minutes INT NOT NULL,
    execution_type VARCHAR(20) NOT NULL,
    price DECIMAL(12,2) DEFAULT 0,
    quantity INT DEFAULT 1,
    sort_order INT DEFAULT 0
);

CREATE TABLE work_order_materials (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    work_order_id UUID NOT NULL REFERENCES work_orders(id),
    stock_item_id UUID NOT NULL REFERENCES stock_items(id),
    qty DECIMAL(10,3) NOT NULL,
    unit_price DECIMAL(12,2) NOT NULL,  -- цена закупки
    sale_price DECIMAL(12,2) NOT NULL,  -- цена продажи клиенту
    added_by UUID,
    added_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE work_order_photos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    work_order_id UUID NOT NULL REFERENCES work_orders(id),
    photo_type VARCHAR(10) NOT NULL, -- BEFORE | AFTER | OTHER
    url VARCHAR(500) NOT NULL,
    service_id UUID REFERENCES services(id),
    uploaded_by UUID,
    uploaded_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE work_order_status_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    work_order_id UUID NOT NULL REFERENCES work_orders(id),
    old_status VARCHAR(30),
    new_status VARCHAR(30) NOT NULL,
    comment TEXT,
    lat DECIMAL(10,6),
    lng DECIMAL(10,6),
    changed_by UUID,
    changed_at TIMESTAMPTZ DEFAULT NOW()
);
```

### purchase_requests (ЗАЯВКИ НА ЗИП)
```sql
CREATE TABLE purchase_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    number VARCHAR(50) UNIQUE NOT NULL, -- PR-2025-001234
    work_order_id UUID NOT NULL REFERENCES work_orders(id),
    engineer_id UUID REFERENCES engineers(id),
    responsible_user_id UUID,
    status VARCHAR(30) DEFAULT 'NEW',
    latest_delivery_date DATE,    -- MAX по items, передаётся в наряд
    client_notified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE purchase_request_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    purchase_request_id UUID NOT NULL REFERENCES purchase_requests(id),
    name VARCHAR(255) NOT NULL,
    article VARCHAR(100),
    qty DECIMAL(10,3) NOT NULL DEFAULT 1,
    unit VARCHAR(20) DEFAULT 'шт',
    supplier_id UUID REFERENCES suppliers(id),
    purchase_price DECIMAL(12,2),
    currency VARCHAR(10) DEFAULT 'RUB',
    markup_percent DECIMAL(8,2),        -- вводится вручную
    markup_amount DECIMAL(12,2),        -- альтернатива percent
    sale_price DECIMAL(12,2),           -- авторасчёт
    planned_delivery_date DATE,
    carrier_name VARCHAR(100),
    tracking_number VARCHAR(100),
    invoice_url VARCHAR(500),
    status VARCHAR(20) DEFAULT 'NEW',
    payment_request_id UUID,
    engineer_comment TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE payment_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    purchase_request_item_id UUID NOT NULL REFERENCES purchase_request_items(id),
    supplier_id UUID REFERENCES suppliers(id),
    amount DECIMAL(12,2) NOT NULL,
    currency VARCHAR(10) DEFAULT 'RUB',
    due_date DATE,
    invoice_url VARCHAR(500),
    status VARCHAR(20) DEFAULT 'PENDING', -- PENDING|PAID|REJECTED
    accountant_user_id UUID,
    paid_at TIMESTAMPTZ,
    payment_note TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### stock (СКЛАД)
```sql
CREATE TABLE stock_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    article VARCHAR(100),
    unit VARCHAR(20) DEFAULT 'шт',
    category VARCHAR(100),
    brand_id UUID REFERENCES brands(id),
    min_stock_level DECIMAL(10,3) DEFAULT 0,
    purchase_price DECIMAL(12,2) DEFAULT 0,
    sale_price DECIMAL(12,2) DEFAULT 0,
    barcode VARCHAR(100),
    external_id VARCHAR(100),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE stock_balances (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    stock_item_id UUID NOT NULL REFERENCES stock_items(id),
    location_type VARCHAR(20) NOT NULL, -- CENTRAL | MOBILE
    engineer_id UUID REFERENCES engineers(id), -- для MOBILE
    qty DECIMAL(10,3) DEFAULT 0,
    reserved_qty DECIMAL(10,3) DEFAULT 0,
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(stock_item_id, location_type, engineer_id)
);

CREATE TABLE stock_movements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    stock_item_id UUID NOT NULL REFERENCES stock_items(id),
    from_location_type VARCHAR(20),
    from_engineer_id UUID,
    to_location_type VARCHAR(20),
    to_engineer_id UUID,
    work_order_id UUID REFERENCES work_orders(id),
    qty DECIMAL(10,3) NOT NULL,
    unit_price DECIMAL(12,2) DEFAULT 0,
    type VARCHAR(20) NOT NULL,
    notes TEXT,
    created_by UUID,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### notifications
```sql
CREATE TABLE notification_templates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    key VARCHAR(100) UNIQUE NOT NULL,
    description VARCHAR(255),
    channels JSONB NOT NULL DEFAULT '{}', -- {telegram: "...", email: {subject, body}, sms: "..."}
    is_active BOOLEAN DEFAULT TRUE
);

CREATE TABLE notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    recipient_type VARCHAR(20) NOT NULL,
    recipient_id UUID NOT NULL,
    channel VARCHAR(20) NOT NULL,
    template_key VARCHAR(100),
    variables JSONB DEFAULT '{}',
    rendered_text TEXT,
    status VARCHAR(20) DEFAULT 'PENDING',
    work_order_id UUID REFERENCES work_orders(id),
    error_message TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    sent_at TIMESTAMPTZ
);
```

### ai_conversations
```sql
CREATE TABLE ai_conversations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    session_id UUID NOT NULL DEFAULT gen_random_uuid(),
    agent_type VARCHAR(30) NOT NULL, -- TECH_CONSULTANT | BUSINESS_ANALYST
    work_order_id UUID REFERENCES work_orders(id),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE ai_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    conversation_id UUID NOT NULL REFERENCES ai_conversations(id),
    role VARCHAR(20) NOT NULL, -- user | assistant | system
    content TEXT NOT NULL,
    rating INT,                -- 1-5 (только для assistant)
    tokens_used INT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE error_codes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    brand_id UUID REFERENCES brands(id),
    model_pattern VARCHAR(255),     -- regex
    code VARCHAR(50) NOT NULL,
    display_text VARCHAR(255),
    descriptions JSONB DEFAULT '{}', -- {ru: "...", en: "..."}
    probable_causes JSONB DEFAULT '[]',
    resolution_steps JSONB DEFAULT '[]',
    related_manual_section VARCHAR(255),
    similar_cases_count INT DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### system_settings
```sql
CREATE TABLE system_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    key VARCHAR(100) UNIQUE NOT NULL,
    value TEXT,
    description VARCHAR(255),
    updated_by UUID,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

### audit_log
```sql
CREATE TABLE audit_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    table_name VARCHAR(100) NOT NULL,
    record_id UUID NOT NULL,
    action VARCHAR(20) NOT NULL, -- INSERT|UPDATE|DELETE
    old_values JSONB,
    new_values JSONB,
    changed_by UUID,
    changed_at TIMESTAMPTZ DEFAULT NOW(),
    ip_address INET
);
```

### integration_log
```sql
CREATE TABLE integration_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    system VARCHAR(50) NOT NULL,  -- 1C|TELEGRAM|WHATSAPP|etc
    direction VARCHAR(10) NOT NULL, -- IN|OUT
    document_type VARCHAR(100),
    document_id UUID,
    request_payload JSONB,
    response_payload JSONB,
    status VARCHAR(20) NOT NULL, -- SUCCESS|FAILED|RETRYING
    error_message TEXT,
    attempt_count INT DEFAULT 1,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    completed_at TIMESTAMPTZ
);
```

---

## ИНДЕКСЫ (производительность)

```sql
-- Основные запросы
CREATE INDEX idx_work_orders_status ON work_orders(status);
CREATE INDEX idx_work_orders_engineer ON work_orders(engineer_id);
CREATE INDEX idx_work_orders_client ON work_orders(client_id);
CREATE INDEX idx_work_orders_scheduled ON work_orders(scheduled_start);
CREATE INDEX idx_work_orders_sla_status ON work_orders(sla_status) WHERE sla_violated = FALSE;

-- Склад
CREATE INDEX idx_stock_balances_item ON stock_balances(stock_item_id);
CREATE INDEX idx_stock_movements_order ON stock_movements(work_order_id);

-- Уведомления
CREATE INDEX idx_notifications_status ON notifications(status) WHERE status = 'PENDING';

-- GPS трекинг (частые записи)
CREATE INDEX idx_day_logs_engineer_date ON engineer_day_logs(engineer_id, date);

-- Интеграция
CREATE INDEX idx_integration_log_status ON integration_log(status) WHERE status = 'FAILED';
```
