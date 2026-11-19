export interface User {
  id: number;
  name: string;
  email: string;
  created_at?: string;
}

export interface Vehicle {
  id: number;
  user_id: number;
  vehicle_name: string;
  manufacturer: string;
  model: string;
  vehicle_type: string;
  battery_capacity: number; // kWh
  battery_chemistry: string;
  max_charging_power: number; // kW
  connector_types: string;
  vehicle_identifier: string;
  current_battery_pct: number;
  efficiency_kwh_km: number;
  is_demo: boolean;
  created_at?: string;
}

export interface BatteryReading {
  id: number;
  vehicle_id: number;
  soc: number;
  soh: number;
  voltage: number;
  temperature: number;
  available_energy: number;
  timestamp: string;
  data_source: 'real' | 'simulated' | 'predicted';
}

export interface RangePrediction {
  soc_pct: number;
  available_energy_kwh: number;
  predicted_consumption_kwh_km: number;
  predicted_consumption_kwh_100km: number;
  predicted_range_km: number;
  min_range_km: number;
  max_range_km: number;
  confidence_score: number;
  efficiency_score: number;
  recommendations: string[];
  model_type: string;
  disclaimer: string;
}

export interface EnergyRecord {
  id: number;
  vehicle_id: number;
  distance_km: number;
  energy_consumed_kwh: number;
  consumption_per_km: number;
  average_speed: number;
  ambient_temperature: number;
  timestamp: string;
}

export interface EnergyAnalytics {
  vehicle_id: number;
  total_distance_km: number;
  total_energy_kwh: number;
  average_consumption_kwh_km: number;
  average_speed_kmh: number;
  recent_history: EnergyRecord[];
  anomaly_detection: {
    is_anomaly: boolean;
    anomaly_score: number;
    severity: string;
    explanation: string;
    issues: string[];
  };
  peak_consumption_periods: Array<{
    period: string;
    avg_kwh_km: number;
    traffic: string;
  }>;
  efficiency_trend: string;
}

export interface ChargingStation {
  id: number;
  station_name: string;
  address: string;
  latitude: number;
  longitude: number;
  operator: string;
  charging_power: number;
  connector_type: string;
  availability_status: string;
  pricing_per_kwh: number;
  distance_km?: number;
  last_updated?: string;
}

export interface ChargingSession {
  id: number;
  vehicle_id: number;
  station_id?: number;
  start_time: string;
  end_time?: string;
  start_soc: number;
  end_soc: number;
  energy_kwh: number;
  charging_power: number;
  electricity_tariff: number;
  total_cost: number;
  session_status: 'active' | 'completed' | 'interrupted';
  efficiency_estimate: number;
}

export interface ChargingEstimate {
  current_soc: number;
  target_soc: number;
  battery_capacity_kwh: number;
  required_energy_kwh: number;
  charging_power_kw: number;
  estimated_duration_minutes: number;
  estimated_duration_formatted: string;
  estimated_cost_usd: number;
  electricity_tariff: number;
  charging_losses_kwh: number;
  effective_power_kw: number;
}

export interface ComponentHealthCard {
  name: string;
  status: 'normal' | 'warning' | 'critical';
  current_reading: string;
  expected_range: string;
  detected_problems: string[];
  ai_explanation: string;
  recommended_action: string;
  sensor_key: string;
  score: number;
}

export interface DiagnosticReport {
  vehicle_id: number;
  scan_timestamp: string;
  overall_status: 'Optimal' | 'Attention Needed' | 'Critical Warning';
  health_score: number;
  components: ComponentHealthCard[];
  active_faults_count: number;
  warnings_count: number;
  critical_count: number;
  ai_summary: string;
  recommended_inspections: string[];
  is_simulated: boolean;
}

export interface RouteOption {
  route_id: string;
  title: string;
  badge: string;
  distance_km: number;
  driving_time_minutes: number;
  charging_time_minutes: number;
  total_time_minutes: number;
  estimated_energy_kwh: number;
  arrival_battery_pct: number;
  charging_stops_count: number;
  charging_stops: Array<{
    stop_order: number;
    station: ChargingStation;
    estimated_arrival_soc: number;
    estimated_charging_duration_min: number;
    target_soc: number;
    added_range_km: number;
  }>;
  co2_saved_kg: number;
  summary: string;
  waypoints: number[][]; // [lat, lng]
}

export interface RouteOptimizeResult {
  vehicle_id: number;
  origin: string;
  destination: string;
  current_battery_pct: number;
  estimated_available_energy_kwh: number;
  routes: RouteOption[];
  recommended_route_id: string;
}

export interface NotificationItem {
  id: number;
  title: string;
  message: string;
  severity: 'info' | 'warning' | 'critical';
  is_read: boolean;
  created_at: string;
}

export interface DashboardStats {
  vehicle: Vehicle;
  latest_battery: BatteryReading;
  estimated_range_km: number;
  range_confidence: number;
  health_score: number;
  charging_status: string;
  estimated_charging_completion?: string;
  vehicle_health_status: string;
  upcoming_charging_recommendations: string[];
  recent_energy_trend: Array<{
    date: string;
    distance_km: number;
    consumption_kwh_km: number;
    energy_kwh: number;
  }>;
  recent_charging_sessions: Array<{
    id: number;
    date: string;
    energy_kwh: number;
    cost_usd: number;
    power_kw: number;
    soc_gain: string;
  }>;
  nearby_stations_count: number;
  notifications: NotificationItem[];
  is_demo_mode: boolean;
}
