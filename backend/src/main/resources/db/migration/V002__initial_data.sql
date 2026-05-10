-- V002__initial_data.sql
-- Начальные справочные данные

-- ══════════════════════════════════════════════
-- БРЕНДЫ КЛИМАТИЧЕСКОГО ОБОРУДОВАНИЯ
-- ══════════════════════════════════════════════

INSERT INTO brands (name) VALUES
('Daikin'),
('Mitsubishi Electric'),
('Mitsubishi Heavy'),
('Hitachi'),
('Gree'),
('Haier'),
('LG'),
('Samsung'),
('Carrier'),
('Lennox'),
('Toshiba'),
('Panasonic'),
('Bosch'),
('GENERAL'),
('Ballu'),
('Cooper&Hunter'),
('Electrolux'),
('AUX'),
('Midea'),
('Chigo')
ON CONFLICT (name) DO NOTHING;

-- ══════════════════════════════════════════════
-- КОМПЕТЕНЦИИ ИНЖЕНЕРОВ
-- ══════════════════════════════════════════════

INSERT INTO competencies (name, description) VALUES
('Сплит-системы', 'Монтаж и обслуживание сплит-систем'),
('Мультизональные VRF/VRV', 'Работа с VRF/VRV системами'),
('Чиллеры и фанкойлы', 'Обслуживание чиллеров и фанкойлов'),
('Прецизионные кондиционеры', 'Обслуживание прецизионного оборудования'),
('Промышленные системы', 'Промышленные системы кондиционирования'),
('Рефрижераторные установки', 'Холодильное оборудование'),
('Тепловые насосы', 'Тепловые насосы и геотермальные системы'),
('Вентиляция', 'Вентиляционные системы'),
('Электрика', 'Электромонтажные работы'),
('Сварка', 'Газосварочные работы')
ON CONFLICT (name) DO NOTHING;

-- ══════════════════════════════════════════════
-- ТИПЫ ОБОРУДОВАНИЯ
-- ══════════════════════════════════════════════

INSERT INTO equipment_types (name, attributes_schema) VALUES
('Сплит-система', '{"power_kw": "number", "refrigerant": "string", "btu": "number"}'),
('Мульти-сплит', '{"power_kw": "number", "indoor_units": "number", "refrigerant": "string"}'),
('VRF/VRV система', '{"power_kw": "number", "indoor_units": "number", "refrigerant": "string", "zones": "number"}'),
('Кассетный кондиционер', '{"power_kw": "number", "refrigerant": "string", "ceiling_height": "number"}'),
('Канальный кондиционер', '{"power_kw": "number", "duct_length": "number", "refrigerant": "string"}'),
('Чиллер', '{"power_kw": "number", "cooling_capacity": "number", "refrigerant": "string"}'),
('Фанкойл', '{"power_kw": "number", "water_flow": "number"}'),
('Прецизионный кондиционер', '{"power_kw": "number", "precision_class": "string", "humidity_control": "boolean"}'),
('Тепловой насос', '{"power_kw": "number", "cop": "number", "refrigerant": "string"}'),
('Вентустановка', '{"airflow_m3h": "number", "heat_recovery": "boolean"}')
ON CONFLICT (name) DO NOTHING;

-- ══════════════════════════════════════════════
-- КОРПОРАТИВНЫЙ SLA (уже частично создан в V001)
-- Добавляем субботу (опционально 9:00-14:00)
-- ══════════════════════════════════════════════

INSERT INTO sla_service_hours (sla_config_id, day_of_week, time_from, time_to)
SELECT id, 6, '09:00', '14:00' FROM sla_configs WHERE level = 'CORPORATE'
ON CONFLICT DO NOTHING;

-- ══════════════════════════════════════════════
-- ЭКСТРЕННЫЙ SLA (2ч/4ч/8ч, круглосуточно)
-- ══════════════════════════════════════════════

INSERT INTO sla_configs (name, level, ttr_hours, tto_hours, ttf_hours, critical_metric, warning_percent)
VALUES ('Экстренный SLA', 'CORPORATE', 1, 2, 8, 'TTF', 30)
ON CONFLICT DO NOTHING;

-- Экстренный SLA — 24/7
INSERT INTO sla_service_hours (sla_config_id, day_of_week, time_from, time_to)
SELECT id, gs, '00:00', '23:59'
FROM sla_configs CROSS JOIN generate_series(1, 7) gs
WHERE name = 'Экстренный SLA'
ON CONFLICT DO NOTHING;

-- ══════════════════════════════════════════════
-- КАТЕГОРИИ СКЛАДСКИХ ПОЗИЦИЙ
-- ══════════════════════════════════════════════

INSERT INTO system_settings (key, value, description)
VALUES
('stock_categories', 'Фреон,Масло компрессорное,Фильтры,Электрика,Крепёж,Инструмент,Расходники,Запчасти', 'Категории складских позиций'),
('work_order_number_prefix', 'WO', 'Префикс номера наряда'),
('work_order_number_year_reset', 'true', 'Сброс счётчика нарядов ежегодно'),
('purchase_request_prefix', 'PR', 'Префикс номера заявки на ЗИП'),
('invoice_prefix', 'INV', 'Префикс счёта'),
('act_prefix', 'ACT', 'Префикс акта'),
('min_rating_alert_threshold', '3', 'Минимальная оценка для алерта руководителю'),
('contract_expiry_warning_days', '30', 'За сколько дней предупреждать об истечении договора'),
('cert_expiry_warning_days', '14', 'За сколько дней предупреждать об истечении сертификата'),
('refrigerant_leak_threshold_percent', '30', 'Порог утечки хладагента (%)')
ON CONFLICT (key) DO NOTHING;

-- ══════════════════════════════════════════════
-- УСЛУГИ (БАЗОВЫЙ КАТАЛОГ)
-- ══════════════════════════════════════════════

INSERT INTO services (name, short_name, base_duration_minutes, execution_type, base_price) VALUES
('Диагностика сплит-системы', 'Диагностика', 30, 'SEQUENTIAL', 1500.00),
('Заправка фреоном (до 3 кг)', 'Заправка фреоном', 45, 'SEQUENTIAL', 2500.00),
('Чистка внутреннего блока', 'Чистка вн.блока', 60, 'SEQUENTIAL', 2000.00),
('Чистка наружного блока', 'Чистка нар.блока', 60, 'SEQUENTIAL', 2500.00),
('Полная чистка сплит-системы', 'Чистка полная', 90, 'SEQUENTIAL', 4000.00),
('Замена компрессора', 'Замена компрессора', 180, 'SEQUENTIAL', 8000.00),
('Замена платы управления', 'Замена платы', 60, 'SEQUENTIAL', 3000.00),
('Монтаж сплит-системы (до 2 кВт)', 'Монтаж 2кВт', 240, 'REQUIRES_TWO', 6000.00),
('Монтаж сплит-системы (до 5 кВт)', 'Монтаж 5кВт', 300, 'REQUIRES_TWO', 8000.00),
('Демонтаж сплит-системы', 'Демонтаж', 120, 'SEQUENTIAL', 3000.00),
('Гарантийное обслуживание', 'Гарантия', 60, 'SEQUENTIAL', 0.00),
('Плановое ТО', 'ТО плановое', 90, 'SEQUENTIAL', 3500.00),
('Аварийный вызов', 'Аварийный вызов', 30, 'SEQUENTIAL', 2000.00),
('Пуско-наладочные работы', 'ПНР', 120, 'REQUIRES_TWO', 5000.00),
('Ремонт фреонового контура', 'Ремонт контура', 90, 'SEQUENTIAL', 4000.00)
ON CONFLICT DO NOTHING;
