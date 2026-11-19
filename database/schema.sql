-- EV SMARTTRACE 360 Database Schema (MySQL 8.0+)
-- Database: ev_smarttrace

CREATE DATABASE IF NOT EXISTS ev_smarttrace CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE ev_smarttrace;

-- 1. Users Table
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(150) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_user_email (email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 2. Vehicles Table
CREATE TABLE IF NOT EXISTS vehicles (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    vehicle_name VARCHAR(100) NOT NULL DEFAULT 'My EV',
    manufacturer VARCHAR(100) NOT NULL,
    model VARCHAR(100) NOT NULL,
    vehicle_type VARCHAR(50) DEFAULT 'Sedan',
    battery_capacity FLOAT NOT NULL DEFAULT 60.0,
    battery_chemistry VARCHAR(50) DEFAULT 'Lithium-ion (NMC)',
    max_charging_power FLOAT NOT NULL DEFAULT 150.0,
    connector_types VARCHAR(150) DEFAULT 'CCS2, Type 2',
    vehicle_identifier VARCHAR(100) UNIQUE NOT NULL,
    current_battery_pct FLOAT DEFAULT 70.0,
    efficiency_kwh_km FLOAT DEFAULT 0.15,
    is_demo BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_vehicle_user (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 3. Battery Readings Table
CREATE TABLE IF NOT EXISTS battery_readings (
    id INT AUTO_INCREMENT PRIMARY KEY,
    vehicle_id INT NOT NULL,
    soc FLOAT NOT NULL,
    soh FLOAT DEFAULT 95.0,
    voltage FLOAT DEFAULT 400.0,
    temperature FLOAT DEFAULT 28.5,
    available_energy FLOAT NOT NULL,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    data_source ENUM('real', 'simulated', 'predicted') DEFAULT 'simulated',
    FOREIGN KEY (vehicle_id) REFERENCES vehicles(id) ON DELETE CASCADE,
    INDEX idx_battery_vehicle_time (vehicle_id, timestamp)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 4. Energy Consumption Table
CREATE TABLE IF NOT EXISTS energy_consumption (
    id INT AUTO_INCREMENT PRIMARY KEY,
    vehicle_id INT NOT NULL,
    distance_km FLOAT NOT NULL,
    energy_consumed_kwh FLOAT NOT NULL,
    consumption_per_km FLOAT NOT NULL,
    average_speed FLOAT DEFAULT 55.0,
    ambient_temperature FLOAT DEFAULT 26.0,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (vehicle_id) REFERENCES vehicles(id) ON DELETE CASCADE,
    INDEX idx_energy_vehicle_time (vehicle_id, timestamp)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 7. Charging Stations Table (Created before charging_sessions for foreign key reference)
CREATE TABLE IF NOT EXISTS charging_stations (
    id INT AUTO_INCREMENT PRIMARY KEY,
    station_name VARCHAR(200) NOT NULL,
    address TEXT NOT NULL,
    latitude DOUBLE NOT NULL,
    longitude DOUBLE NOT NULL,
    operator VARCHAR(100) DEFAULT 'EV ChargeNet',
    charging_power FLOAT DEFAULT 60.0,
    connector_type VARCHAR(100) DEFAULT 'CCS2',
    availability_status VARCHAR(50) DEFAULT 'Available',
    pricing_per_kwh FLOAT DEFAULT 0.25,
    last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_station_coords (latitude, longitude)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 5. Charging Sessions Table
CREATE TABLE IF NOT EXISTS charging_sessions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    vehicle_id INT NOT NULL,
    station_id INT NULL,
    start_time TIMESTAMP NOT NULL,
    end_time TIMESTAMP NULL,
    start_soc FLOAT NOT NULL,
    end_soc FLOAT NOT NULL,
    energy_kwh FLOAT NOT NULL,
    charging_power FLOAT NOT NULL,
    electricity_tariff FLOAT DEFAULT 0.25,
    total_cost FLOAT DEFAULT 0.0,
    session_status ENUM('active', 'completed', 'interrupted') DEFAULT 'completed',
    efficiency_estimate FLOAT DEFAULT 92.5,
    FOREIGN KEY (vehicle_id) REFERENCES vehicles(id) ON DELETE CASCADE,
    FOREIGN KEY (station_id) REFERENCES charging_stations(id) ON DELETE SET NULL,
    INDEX idx_charging_vehicle_time (vehicle_id, start_time)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 6. Vehicle Diagnostics Table
CREATE TABLE IF NOT EXISTS vehicle_diagnostics (
    id INT AUTO_INCREMENT PRIMARY KEY,
    vehicle_id INT NOT NULL,
    component VARCHAR(100) NOT NULL,
    fault_code VARCHAR(50) NOT NULL,
    description TEXT NOT NULL,
    severity ENUM('normal', 'info', 'warning', 'critical') DEFAULT 'normal',
    sensor_value FLOAT NULL,
    expected_range VARCHAR(100) NULL,
    recommendation TEXT NULL,
    detection_source ENUM('rule_based', 'isolation_forest', 'obd2', 'simulated') DEFAULT 'simulated',
    detected_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    resolved_at TIMESTAMP NULL,
    FOREIGN KEY (vehicle_id) REFERENCES vehicles(id) ON DELETE CASCADE,
    INDEX idx_diag_vehicle_severity (vehicle_id, severity, detected_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 8. Route History Table
CREATE TABLE IF NOT EXISTS route_history (
    id INT AUTO_INCREMENT PRIMARY KEY,
    vehicle_id INT NOT NULL,
    origin VARCHAR(255) NOT NULL,
    destination VARCHAR(255) NOT NULL,
    total_distance FLOAT NOT NULL,
    estimated_energy FLOAT NOT NULL,
    estimated_duration INT NOT NULL, -- minutes
    selected_route VARCHAR(100) DEFAULT 'Recommended Balanced Route',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (vehicle_id) REFERENCES vehicles(id) ON DELETE CASCADE,
    INDEX idx_route_vehicle (vehicle_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 9. Route Charging Stops Table
CREATE TABLE IF NOT EXISTS route_charging_stops (
    id INT AUTO_INCREMENT PRIMARY KEY,
    route_id INT NOT NULL,
    station_id INT NOT NULL,
    stop_order INT NOT NULL,
    estimated_arrival_soc FLOAT NOT NULL,
    estimated_charging_duration INT NOT NULL, -- minutes
    target_soc FLOAT DEFAULT 80.0,
    FOREIGN KEY (route_id) REFERENCES route_history(id) ON DELETE CASCADE,
    FOREIGN KEY (station_id) REFERENCES charging_stations(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 10. Voice Conversations Table
CREATE TABLE IF NOT EXISTS voice_conversations (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    vehicle_id INT NULL,
    user_message TEXT NOT NULL,
    assistant_response TEXT NOT NULL,
    language VARCHAR(10) DEFAULT 'en',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (vehicle_id) REFERENCES vehicles(id) ON DELETE SET NULL,
    INDEX idx_voice_user_time (user_id, created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 11. Notifications Table
CREATE TABLE IF NOT EXISTS notifications (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    vehicle_id INT NULL,
    title VARCHAR(200) NOT NULL,
    message TEXT NOT NULL,
    severity ENUM('info', 'warning', 'critical') DEFAULT 'info',
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (vehicle_id) REFERENCES vehicles(id) ON DELETE SET NULL,
    INDEX idx_notif_user_read (user_id, is_read, created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 12. AI Predictions Table
CREATE TABLE IF NOT EXISTS ai_predictions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    vehicle_id INT NOT NULL,
    prediction_type VARCHAR(100) NOT NULL, -- e.g., 'range_km', 'anomaly_score', 'soh_degradation'
    predicted_value FLOAT NOT NULL,
    confidence_or_uncertainty FLOAT DEFAULT 0.95,
    model_version VARCHAR(50) DEFAULT 'v1.0-rf',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (vehicle_id) REFERENCES vehicles(id) ON DELETE CASCADE,
    INDEX idx_ai_pred_vehicle (vehicle_id, prediction_type, created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
