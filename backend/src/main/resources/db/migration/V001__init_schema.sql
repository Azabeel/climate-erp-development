-- V001__init_schema.sql
-- Начальная схема АСУ СЦ «Сервис Климат»

-- ══════════════════════════════════════════════
-- СПРАВОЧНИКИ
-- ══════════════════════════════════════════════

CREATE TABLE brands (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL UNIQUE,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE competencies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL UNIQUE,
    description TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE suppliers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    phone VARCHAR(20),
    email VARCHAR(255),
    address TEXT,
    contact_person VARCHAR(255),
    notes TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE system_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    key VARCHAR(100) UNIQUE NOT NULL,
    value TEXT,
    description VARCHAR(255),
    updated_by UUID,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ══════════════════════════════════════════════
-- КЛИЕНТЫ И ДОГОВОРЫ
-- ══════════════════════════════════════════════

CREATE TABLE clients (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    type VARCHAR(20) NOT NULL CHECK (type IN ('INDIVIDUAL', 'LEGAL_ENTITY')),
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
    health_score INT DEFAULT 100,
    external_id VARCHAR(100),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE contacts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
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

CREATE TABLE sla_configs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    level VARCHAR(20) NOT NULL CHECK (level IN ('CORPORATE', 'CONTRACT')),
    contract_id UUID,
    ttr_hours DECIMAL(10,2),
    tto_hours DECIMAL(10,2),
    ttf_hours DECIMAL(10,2),
    critical_metric VARCHAR(10) DEFAULT 'TTF',
    warning_percent INT DEFAULT 20,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE sla_service_hours (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    sla_config_id UUID NOT NULL REFERENCES sla_configs(id) ON DELETE CASCADE,
    day_of_week INT NOT NULL CHECK (day_of_week BETWEEN 1 AND 7),
    time_from TIME NOT NULL,
    time_to TIME NOT NULL
);

CREATE TABLE contracts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    client_id UUID NOT NULL REFERENCES clients(id),
    number VARCHAR(100) NOT NULL,
    date_start DATE NOT NULL,
    date_end DATE,
    status VARCHAR(20) DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'EXPIRED', 'TERMINATED')),
    sla_config_id UUID REFERENCES sla_configs(id),
    act_template_id UUID,
    penalty_enabled BOOLEAN DEFAULT FALSE,
    penalty_type VARCHAR(10) CHECK (penalty_type IN ('FIXED', 'PERCENT')),
    penalty_value DECIMAL(12,2),
    budget_limit DECIMAL(12,2),
    budget_period VARCHAR(20),
    notes TEXT,
    file_url VARCHAR(500),
    external_id VARCHAR(100),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE contract_brands (
    contract_id UUID REFERENCES contracts(id) ON DELETE CASCADE,
    brand_id UUID REFERENCES brands(id) ON DELETE CASCADE,
    PRIMARY KEY (contract_id, brand_id)
);

-- ══════════════════════════════════════════════
-- ОБЪЕКТЫ И ОБОРУДОВАНИЕ
-- ══════════════════════════════════════════════

CREATE TABLE equipment_types (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL UNIQUE,
    attributes_schema JSONB DEFAULT '{}',
    is_active BOOLEAN DEFAULT TRUE
);

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
    location_id UUID NOT NULL REFERENCES service_locations(id) ON DELETE CASCADE,
    day_of_week INT NOT NULL CHECK (day_of_week BETWEEN 1 AND 7),
    time_from TIME NOT NULL,
    time_to TIME NOT NULL
);

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
    equipment_type_id UUID REFERENCES equipment_types(id),
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
    predicted_failure_date DATE,
    external_id VARCHAR(100),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ══════════════════════════════════════════════
-- ИНЖЕНЕРЫ
-- ══════════════════════════════════════════════

CREATE TABLE engineers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID,
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
    engineer_id UUID NOT NULL REFERENCES engineers(id) ON DELETE CASCADE,
    brand_id UUID REFERENCES brands(id),
    cert_name VARCHAR(255) NOT NULL,
    issued_at DATE,
    expires_at DATE,
    cert_url VARCHAR(500)
);

CREATE TABLE engineer_competencies (
    engineer_id UUID REFERENCES engineers(id) ON DELETE CASCADE,
    competency_id UUID REFERENCES competencies(id) ON DELETE CASCADE,
    PRIMARY KEY (engineer_id, competency_id)
);

CREATE TABLE engineer_piece_rates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    engineer_id UUID NOT NULL REFERENCES engineers(id) ON DELETE CASCADE,
    service_id UUID,
    brand_id UUID REFERENCES brands(id),
    priority VARCHAR(20),
    rate DECIMAL(10,2) NOT NULL
);

CREATE TABLE engineer_schedule (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    engineer_id UUID NOT NULL REFERENCES engineers(id),
    date DATE NOT NULL,
    work_start TIME,
    work_end TIME,
    type VARCHAR(20) NOT NULL,
    reason VARCHAR(255),
    created_by UUID,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE engineer_day_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    engineer_id UUID NOT NULL REFERENCES engineers(id),
    date DATE NOT NULL,
    start_type VARCHAR(10),
    start_lat DECIMAL(10,6),
    start_lng DECIMAL(10,6),
    start_time TIMESTAMPTZ,
    end_time TIMESTAMPTZ,
    total_km DECIMAL(10,2),
    gps_track JSONB DEFAULT '[]',
    UNIQUE(engineer_id, date)
);

-- ══════════════════════════════════════════════
-- УСЛУГИ
-- ══════════════════════════════════════════════

CREATE TABLE services (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    short_name VARCHAR(100),
    description TEXT,
    specification TEXT,
    base_duration_minutes INT NOT NULL DEFAULT 60,
    execution_type VARCHAR(20) DEFAULT 'SEQUENTIAL'
        CHECK (execution_type IN ('SEQUENTIAL', 'PARALLEL', 'REQUIRES_TWO')),
    base_price DECIMAL(12,2) DEFAULT 0,
    currency VARCHAR(10) DEFAULT 'RUB',
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE service_modifiers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    service_id UUID NOT NULL REFERENCES services(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    condition_type VARCHAR(50),
    condition_value VARCHAR(100),
    add_minutes INT DEFAULT 0,
    multiply_factor DECIMAL(5,2) DEFAULT 1.0
);

CREATE TABLE service_competencies (
    service_id UUID REFERENCES services(id) ON DELETE CASCADE,
    competency_id UUID REFERENCES competencies(id) ON DELETE CASCADE,
    PRIMARY KEY (service_id, competency_id)
);

CREATE TABLE service_brands (
    service_id UUID REFERENCES services(id) ON DELETE CASCADE,
    brand_id UUID REFERENCES brands(id) ON DELETE CASCADE,
    PRIMARY KEY (service_id, brand_id)
);

-- ══════════════════════════════════════════════
-- НАРЯДЫ
-- ══════════════════════════════════════════════

CREATE TABLE work_orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    number VARCHAR(50) UNIQUE NOT NULL,
    type VARCHAR(20) NOT NULL DEFAULT 'REPAIR',
    status VARCHAR(30) NOT NULL DEFAULT 'NEW',
    priority VARCHAR(20) DEFAULT 'NORMAL',
    source VARCHAR(20) DEFAULT 'MANUAL',
    client_id UUID NOT NULL REFERENCES clients(id),
    contract_id UUID REFERENCES contracts(id),
    contact_id UUID REFERENCES contacts(id),
    location_id UUID REFERENCES service_locations(id),
    equipment_id UUID REFERENCES equipment(id),
    sla_config_id UUID REFERENCES sla_configs(id),
    description TEXT,
    dispatcher_comment TEXT,
    engineer_report TEXT,
    total_estimated_duration_minutes INT,
    has_parallel_tasks BOOLEAN DEFAULT FALSE,
    requires_two_engineers BOOLEAN DEFAULT FALSE,
    scheduled_start TIMESTAMPTZ,
    scheduled_end TIMESTAMPTZ,
    engineer_id UUID REFERENCES engineers(id),
    second_engineer_id UUID REFERENCES engineers(id),
    actual_start TIMESTAMPTZ,
    actual_end TIMESTAMPTZ,
    sla_ttr_planned TIMESTAMPTZ,
    sla_ttr_actual TIMESTAMPTZ,
    sla_tto_planned TIMESTAMPTZ,
    sla_tto_actual TIMESTAMPTZ,
    sla_ttf_planned TIMESTAMPTZ,
    sla_ttf_actual TIMESTAMPTZ,
    sla_status VARCHAR(10) DEFAULT 'GREEN',
    sla_violated BOOLEAN DEFAULT FALSE,
    sla_notified_yellow BOOLEAN DEFAULT FALSE,
    sla_notified_red BOOLEAN DEFAULT FALSE,
    penalty_amount DECIMAL(12,2),
    cost_price DECIMAL(12,2) DEFAULT 0,
    revenue DECIMAL(12,2) DEFAULT 0,
    margin DECIMAL(12,2) DEFAULT 0,
    margin_percent DECIMAL(8,2) DEFAULT 0,
    client_rating INT CHECK (client_rating BETWEEN 1 AND 5),
    client_comment TEXT,
    external_id VARCHAR(100),
    onec_synced BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    closed_at TIMESTAMPTZ
);

CREATE TABLE work_order_services (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    work_order_id UUID NOT NULL REFERENCES work_orders(id) ON DELETE CASCADE,
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
    work_order_id UUID NOT NULL REFERENCES work_orders(id) ON DELETE CASCADE,
    stock_item_id UUID NOT NULL,
    qty DECIMAL(10,3) NOT NULL,
    unit_price DECIMAL(12,2) NOT NULL,
    sale_price DECIMAL(12,2) NOT NULL,
    added_by UUID,
    added_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE work_order_photos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    work_order_id UUID NOT NULL REFERENCES work_orders(id) ON DELETE CASCADE,
    photo_type VARCHAR(10) NOT NULL CHECK (photo_type IN ('BEFORE', 'AFTER', 'OTHER')),
    url VARCHAR(500) NOT NULL,
    service_id UUID,
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

-- ══════════════════════════════════════════════
-- СКЛАД
-- ══════════════════════════════════════════════

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
    location_type VARCHAR(20) NOT NULL CHECK (location_type IN ('CENTRAL', 'MOBILE')),
    engineer_id UUID REFERENCES engineers(id),
    qty DECIMAL(10,3) DEFAULT 0,
    reserved_qty DECIMAL(10,3) DEFAULT 0,
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(stock_item_id, location_type, COALESCE(engineer_id, '00000000-0000-0000-0000-000000000000'))
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

-- ══════════════════════════════════════════════
-- ЗАКУПКИ (ЗИП)
-- ══════════════════════════════════════════════

CREATE TABLE purchase_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    number VARCHAR(50) UNIQUE NOT NULL,
    work_order_id UUID NOT NULL REFERENCES work_orders(id),
    engineer_id UUID REFERENCES engineers(id),
    responsible_user_id UUID,
    status VARCHAR(30) DEFAULT 'NEW',
    latest_delivery_date DATE,
    client_notified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE purchase_request_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    purchase_request_id UUID NOT NULL REFERENCES purchase_requests(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    article VARCHAR(100),
    qty DECIMAL(10,3) NOT NULL DEFAULT 1,
    unit VARCHAR(20) DEFAULT 'шт',
    supplier_id UUID REFERENCES suppliers(id),
    purchase_price DECIMAL(12,2),
    currency VARCHAR(10) DEFAULT 'RUB',
    markup_percent DECIMAL(8,2),
    markup_amount DECIMAL(12,2),
    sale_price DECIMAL(12,2),
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
    status VARCHAR(20) DEFAULT 'PENDING',
    accountant_user_id UUID,
    paid_at TIMESTAMPTZ,
    payment_note TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ══════════════════════════════════════════════
-- УВЕДОМЛЕНИЯ
-- ══════════════════════════════════════════════

CREATE TABLE notification_templates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    key VARCHAR(100) UNIQUE NOT NULL,
    description VARCHAR(255),
    channels JSONB NOT NULL DEFAULT '{}',
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

-- ══════════════════════════════════════════════
-- ИИ
-- ══════════════════════════════════════════════

CREATE TABLE ai_conversations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    session_id UUID NOT NULL DEFAULT gen_random_uuid(),
    agent_type VARCHAR(30) NOT NULL,
    work_order_id UUID REFERENCES work_orders(id),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE ai_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    conversation_id UUID NOT NULL REFERENCES ai_conversations(id) ON DELETE CASCADE,
    role VARCHAR(20) NOT NULL,
    content TEXT NOT NULL,
    rating INT CHECK (rating BETWEEN 1 AND 5),
    tokens_used INT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE error_codes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    brand_id UUID REFERENCES brands(id),
    model_pattern VARCHAR(255),
    code VARCHAR(50) NOT NULL,
    display_text VARCHAR(255),
    descriptions JSONB DEFAULT '{}',
    probable_causes JSONB DEFAULT '[]',
    resolution_steps JSONB DEFAULT '[]',
    related_manual_section VARCHAR(255),
    similar_cases_count INT DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ══════════════════════════════════════════════
-- АУДИТ И ИНТЕГРАЦИЯ
-- ══════════════════════════════════════════════

CREATE TABLE audit_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    table_name VARCHAR(100) NOT NULL,
    record_id UUID NOT NULL,
    action VARCHAR(20) NOT NULL,
    old_values JSONB,
    new_values JSONB,
    changed_by UUID,
    changed_at TIMESTAMPTZ DEFAULT NOW(),
    ip_address INET
);

CREATE TABLE integration_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    system VARCHAR(50) NOT NULL,
    direction VARCHAR(10) NOT NULL,
    document_type VARCHAR(100),
    document_id UUID,
    request_payload JSONB,
    response_payload JSONB,
    status VARCHAR(20) NOT NULL,
    error_message TEXT,
    attempt_count INT DEFAULT 1,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    completed_at TIMESTAMPTZ
);

-- ══════════════════════════════════════════════
-- ИНДЕКСЫ
-- ══════════════════════════════════════════════

CREATE INDEX idx_wo_status ON work_orders(status);
CREATE INDEX idx_wo_engineer ON work_orders(engineer_id);
CREATE INDEX idx_wo_client ON work_orders(client_id);
CREATE INDEX idx_wo_scheduled ON work_orders(scheduled_start);
CREATE INDEX idx_wo_sla ON work_orders(sla_status) WHERE sla_violated = FALSE;
CREATE INDEX idx_wo_created ON work_orders(created_at DESC);

CREATE INDEX idx_contacts_client ON contacts(client_id);
CREATE INDEX idx_contracts_client ON contracts(client_id);
CREATE INDEX idx_equipment_client ON equipment(client_id);
CREATE INDEX idx_equipment_location ON equipment(location_id);

CREATE INDEX idx_stock_balances_item ON stock_balances(stock_item_id);
CREATE INDEX idx_stock_movements_wo ON stock_movements(work_order_id);
CREATE INDEX idx_stock_movements_item ON stock_movements(stock_item_id);

CREATE INDEX idx_notifications_pending ON notifications(status, created_at)
    WHERE status = 'PENDING';
CREATE INDEX idx_notifications_wo ON notifications(work_order_id);

CREATE INDEX idx_day_logs_eng_date ON engineer_day_logs(engineer_id, date);
CREATE INDEX idx_integration_failed ON integration_log(status, created_at)
    WHERE status = 'FAILED';

CREATE INDEX idx_pr_items_status ON purchase_request_items(status);
CREATE INDEX idx_pr_wo ON purchase_requests(work_order_id);

-- ══════════════════════════════════════════════
-- НАЧАЛЬНЫЕ ДАННЫЕ
-- ══════════════════════════════════════════════

-- Корпоративный SLA по умолчанию
INSERT INTO sla_configs (name, level, ttr_hours, tto_hours, ttf_hours, critical_metric, warning_percent)
VALUES ('Корпоративный SLA', 'CORPORATE', 2, 4, 24, 'TTF', 20);

-- Рабочие часы корпоративного SLA (пн-пт 9:00-18:00)
INSERT INTO sla_service_hours (sla_config_id, day_of_week, time_from, time_to)
SELECT id, generate_series(1,5), '09:00', '18:00' FROM sla_configs WHERE level = 'CORPORATE';

-- Системные настройки
INSERT INTO system_settings (key, value, description) VALUES
('zip_default_markup', '30', 'Наценка на ЗИП по умолчанию (%)'),
('overhead_percent', '15', 'Доля накладных расходов (% от выручки)'),
('sla_check_interval_minutes', '5', 'Интервал проверки SLA (минуты)'),
('office_address', '', 'Адрес офиса (стартовая точка инженеров)'),
('office_lat', '55.751244', 'Широта офиса'),
('office_lng', '37.618423', 'Долгота офиса'),
('fuel_price_per_liter', '55', 'Цена топлива руб/л'),
('vat_percent', '20', 'НДС %'),
('arrival_warning_minutes', '30', 'За сколько минут предупреждать клиента'),
('digest_time', '08:00', 'Время утреннего дайджеста руководителю'),
('stock_check_interval_hours', '2', 'Интервал проверки критических остатков');

-- Шаблоны уведомлений
INSERT INTO notification_templates (key, description, channels) VALUES
('ORDER_ASSIGNED', 'Наряд назначен', '{"telegram": "✅ Заявка принята!\n\nИнженер *{{engineerName}}* приедет {{scheduledDate}} в {{scheduledTime}}.\n\nПо вопросам: {{phone}}", "sms": "Заявка принята. Инженер {{engineerName}} приедет {{scheduledDate}} в {{scheduledTime}}"}'),
('ENGINEER_EN_ROUTE', 'Инженер выехал', '{"telegram": "🚗 Инженер {{engineerName}} уже едет к вам!\n\nОжидаемое время прибытия: ~{{eta}} мин"}'),
('ENGINEER_ARRIVING_SOON', 'Инженер скоро прибудет', '{"telegram": "⏰ Инженер будет у вас примерно через 30 минут"}'),
('AWAITING_PARTS', 'Ожидание запчасти', '{"telegram": "🔧 Для завершения ремонта заказана запчасть.\n\nОриентировочный срок поставки: {{deliveryDate}}\nМы сообщим вам когда она придёт."}'),
('PARTS_RECEIVED', 'Запчасть получена', '{"telegram": "📦 Запчасть по вашей заявке получена.\nСвяжемся с вами для согласования времени повторного визита."}'),
('ORDER_COMPLETED', 'Работы выполнены', '{"telegram": "🎉 Работы по вашей заявке выполнены!\n\nПожалуйста, оцените качество обслуживания: {{ratingUrl}}"}'),
('SLA_WARNING', 'Риск нарушения SLA', '{"in_app": "⚠️ Риск нарушения SLA: наряд #{{orderNumber}}, клиент {{clientName}}. Осталось {{remainingHours}} ч."}'),
('SLA_VIOLATED', 'SLA нарушен', '{"in_app": "🔴 Нарушение SLA: наряд #{{orderNumber}}, клиент {{clientName}}. Дедлайн истёк {{violatedAt}}."}'),
('ZIP_CREATED', 'Заявка на ЗИП', '{"in_app": "📋 Новая заявка на ЗИП по наряду #{{orderNumber}}. Требуется: {{itemCount}} поз."}'),
('ZIP_READY', 'ЗИП готов к выдаче', '{"in_app": "✅ ЗИП по наряду #{{orderNumber}} получен. Назначьте повторный выезд!"}'),
('PAYMENT_REQUEST', 'Заявка на оплату', '{"in_app": "💳 Новая заявка на оплату: {{supplierName}}, сумма {{amount}} руб. Срок: {{dueDate}}"}'),
('LOW_RATING', 'Низкая оценка клиента', '{"in_app": "⭐ Низкая оценка от {{clientName}}: {{rating}}/5. Наряд #{{orderNumber}}. Причина: {{comment}}"}'),
('CONTRACT_EXPIRY', 'Договор истекает', '{"in_app": "📄 Через 30 дней истекает договор с {{clientName}}. Сумма за год: {{yearRevenue}} руб."}'),
('CERT_EXPIRY', 'Сертификат истекает', '{"in_app": "🎓 У инженера {{engineerName}} через 14 дней истекает допуск по бренду {{brandName}}"}');

-- Популярные бренды
INSERT INTO brands (name) VALUES
('Daikin'), ('Mitsubishi Electric'), ('Mitsubishi Heavy'), ('Hitachi'),
('Gree'), ('Haier'), ('LG'), ('Samsung'), ('Carrier'), ('Lennox'),
('Toshiba'), ('Panasonic'), ('Bosch'), ('GENERAL'), ('Ballu');
