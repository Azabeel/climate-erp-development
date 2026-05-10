-- Sprint 14: Seed error codes for AI consultant
INSERT INTO error_codes (id, code, display_text, descriptions, probable_causes, resolution_steps, similar_cases_count)
VALUES
    (gen_random_uuid(), 'E-01', 'Compressor overload',
     '{"en": "Compressor overload protection triggered"}',
     '["High refrigerant pressure", "Dirty condenser coil", "Refrigerant overcharge"]',
     '["Check refrigerant pressure with manifold gauge", "Clean condenser coil", "Check refrigerant charge level"]',
     12),
    (gen_random_uuid(), 'E-02', 'Fan motor failure',
     '{"en": "Indoor or outdoor fan motor fault detected"}',
     '["Motor winding failure", "Capacitor fault", "Wiring issue"]',
     '["Inspect fan motor windings with multimeter", "Replace capacitor if open circuit", "Check and repair wiring harness"]',
     7),
    (gen_random_uuid(), 'F1', 'Temperature sensor fault',
     '{"en": "Indoor temperature sensor open or short circuit"}',
     '["Sensor disconnected", "Broken sensor wire", "Sensor out of range"]',
     '["Check sensor connector seating", "Measure sensor resistance vs temperature chart", "Replace sensor if out of spec"]',
     15),
    (gen_random_uuid(), 'P5', 'Communication error',
     '{"en": "Communication fault between indoor and outdoor units"}',
     '["Loose signal cable", "EMI interference", "PCB fault"]',
     '["Check signal cable connections at both units", "Ensure proper grounding", "Replace PCB if fault persists"]',
     9),
    (gen_random_uuid(), 'H6', 'No DC fan feedback',
     '{"en": "DC fan motor speed feedback signal lost"}',
     '["Fan blocked", "Motor failure", "Driver board fault"]',
     '["Remove obstructions from fan", "Test motor with direct power supply", "Replace driver board"]',
     5)
ON CONFLICT DO NOTHING;
