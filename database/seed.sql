-- EV SMARTTRACE 360 Seed Data
USE ev_smarttrace;

-- 1. Demo User: password is 'DemoPassword123!' (bcrypt hashed)
-- User: demo@evsmarttrace.com
INSERT INTO users (id, name, email, password_hash, created_at)
VALUES (
    1, 
    'Alex Rivers', 
    'demo@evsmarttrace.com', 
    '$2b$12$K1bH/KqN45.1M22sUv/BseA2kR0Wd6O1Vf9Xg2O3hZl0d3i0j1vKm', -- hashed DemoPassword123!
    NOW()
) ON DUPLICATE KEY UPDATE name=name;

-- 2. Demo Vehicle: Tesla Model 3 Long Range / Aero 60 kWh
INSERT INTO vehicles (
    id, user_id, vehicle_name, manufacturer, model, vehicle_type, 
    battery_capacity, battery_chemistry, max_charging_power, connector_types, 
    vehicle_identifier, current_battery_pct, efficiency_kwh_km, is_demo, created_at
) VALUES (
    1, 1, 'CyberPulse GT', 'Tesla', 'Model 3 Dual Motor', 'Sedan',
    60.0, 'Lithium Nickel Manganese Cobalt (NMC)', 170.0, 'CCS2, Tesla Supercharger, Type 2',
    'EV-ST360-9842-DEMO', 70.0, 0.150, TRUE, NOW()
) ON DUPLICATE KEY UPDATE vehicle_name=vehicle_name;

-- 3. Realistic Charging Stations
INSERT INTO charging_stations (id, station_name, address, latitude, longitude, operator, charging_power, connector_type, availability_status, pricing_per_kwh)
VALUES 
(1, 'Supercharge Hub - Silicon Metro', '101 Tech Blvd, Metro Central', 37.7749, -122.4194, 'Tesla Supercharger', 250.0, 'CCS2 / NACS', 'Available (8/12 Open)', 0.32),
(2, 'Electrify Express - Harbor Bay', '450 Marina Way, Bayside', 37.7891, -122.4014, 'Electrify America', 150.0, 'CCS2 / CHAdeMO', 'Available (4/6 Open)', 0.35),
(3, 'GreenGrid Fast Charge - Sunset Point', '820 Ocean Ave, West Coast', 37.7601, -122.4822, 'EVgo', 100.0, 'CCS2 / Type 2', 'Available (2/4 Open)', 0.28),
(4, 'VoltPoint Urban Charger', '12 Civic Center Plaza', 37.7793, -122.4184, 'ChargePoint', 50.0, 'Type 2 / AC Fast', 'Occupied (All in Use)', 0.22),
(5, 'EcoCharge Highway Oasis - Exit 42', 'Highway 101 Northbound Rest Area', 37.8205, -122.3789, 'BP Pulse', 180.0, 'CCS2', 'Available (5/8 Open)', 0.30)
ON DUPLICATE KEY UPDATE station_name=station_name;

-- 4. Initial Diagnostic Records
INSERT INTO vehicle_diagnostics (vehicle_id, component, fault_code, description, severity, sensor_value, expected_range, recommendation, detection_source, detected_at)
VALUES 
(1, 'Cooling System', 'P0A93-00', 'Inverter Cooling System Performance Degradation detected under high thermal load.', 'warning', 68.4, '35.0 - 60.0 °C', 'Inspect coolant level and radiator fan assembly at next service.', 'isolation_forest', NOW()),
(1, 'Electrical System', 'B1630-14', 'Minor auxiliary 12V DC-DC ripple voltage fluctuation observed.', 'info', 13.2, '13.5 - 14.8 V', 'Monitor 12V auxiliary battery health.', 'rule_based', DATE_SUB(NOW(), INTERVAL 2 DAY)),
(1, 'Battery System', 'P0A7F-00', 'Hybrid/EV Battery Pack Deterioration Index normal. Cell balance variance within 8mV.', 'normal', 8.0, '< 15 mV variance', 'Battery pack is healthy. Normal balancing active.', 'obd2', NOW());

-- 5. Recent Battery Readings
INSERT INTO battery_readings (vehicle_id, soc, soh, voltage, temperature, available_energy, timestamp, data_source)
VALUES 
(1, 70.0, 95.2, 401.5, 27.8, 42.0, NOW(), 'simulated'),
(1, 72.5, 95.2, 402.1, 28.1, 43.5, DATE_SUB(NOW(), INTERVAL 1 HOUR), 'simulated'),
(1, 76.0, 95.3, 405.0, 29.0, 45.6, DATE_SUB(NOW(), INTERVAL 3 HOUR), 'simulated'),
(1, 80.0, 95.3, 408.2, 30.5, 48.0, DATE_SUB(NOW(), INTERVAL 6 HOUR), 'simulated');

-- 6. Historical Energy Consumption
INSERT INTO energy_consumption (vehicle_id, distance_km, energy_consumed_kwh, consumption_per_km, average_speed, ambient_temperature, timestamp)
VALUES 
(1, 45.2, 6.78, 0.150, 58.5, 24.0, DATE_SUB(NOW(), INTERVAL 1 DAY)),
(1, 82.0, 12.71, 0.155, 68.0, 26.5, DATE_SUB(NOW(), INTERVAL 2 DAY)),
(1, 31.5, 4.60, 0.146, 45.0, 22.0, DATE_SUB(NOW(), INTERVAL 3 DAY)),
(1, 110.4, 17.66, 0.160, 72.0, 31.0, DATE_SUB(NOW(), INTERVAL 4 DAY)),
(1, 55.0, 8.14, 0.148, 52.0, 25.0, DATE_SUB(NOW(), INTERVAL 5 DAY)),
(1, 64.2, 9.82, 0.153, 60.0, 27.0, DATE_SUB(NOW(), INTERVAL 6 DAY)),
(1, 28.0, 4.06, 0.145, 42.0, 23.0, DATE_SUB(NOW(), INTERVAL 7 DAY));

-- 7. Charging Sessions History
INSERT INTO charging_sessions (vehicle_id, station_id, start_time, end_time, start_soc, end_soc, energy_kwh, charging_power, electricity_tariff, total_cost, session_status, efficiency_estimate)
VALUES 
(1, 1, DATE_SUB(NOW(), INTERVAL 2 DAY), DATE_SUB(NOW(), INTERVAL 2 DAY) + INTERVAL 38 MINUTE, 22.0, 80.0, 37.2, 120.0, 0.32, 11.90, 'completed', 93.4),
(1, 2, DATE_SUB(NOW(), INTERVAL 5 DAY), DATE_SUB(NOW(), INTERVAL 5 DAY) + INTERVAL 45 MINUTE, 18.0, 85.0, 42.5, 95.0, 0.35, 14.88, 'completed', 92.1),
(1, 3, DATE_SUB(NOW(), INTERVAL 9 DAY), DATE_SUB(NOW(), INTERVAL 9 DAY) + INTERVAL 52 MINUTE, 30.0, 90.0, 38.0, 60.0, 0.28, 10.64, 'completed', 94.0);

-- 8. Notifications
INSERT INTO notifications (user_id, vehicle_id, title, message, severity, is_read, created_at)
VALUES 
(1, 1, 'Inverter Cooling Alert', 'Inverter thermal reading reached 68.4°C during peak acceleration. System recommends cooling inspection.', 'warning', FALSE, NOW()),
(1, 1, 'Optimal Charging Time', 'Off-peak electricity tariff begins at 11:00 PM ($0.18/kWh). Scheduled charging recommended.', 'info', FALSE, DATE_SUB(NOW(), INTERVAL 5 HOUR)),
(1, 1, 'Range Advisory', 'Current battery level is 70% (Est. 280 km). Plenty of range for city commuting.', 'info', TRUE, DATE_SUB(NOW(), INTERVAL 1 DAY));
