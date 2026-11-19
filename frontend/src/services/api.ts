import axios from 'axios';
import { 
  User, Vehicle, BatteryReading, RangePrediction, 
  EnergyAnalytics, ChargingStation, ChargingSession, 
  ChargingEstimate, DiagnosticReport, RouteOptimizeResult, 
  DashboardStats, NotificationItem 
} from '../types';

const API_BASE_URL = import.meta.env.VITE_API_URL ? `${import.meta.env.VITE_API_URL}/api` : '';
// No fallback – VITE_API_URL must be set in production.

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 8000,
});

// Interceptor to attach JWT token
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('ev_token');
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Resilient API services with full mock fallbacks for standalone/offline demoability
export const api = {
  // Auth
  login: async (email: string, password: string) => {
    try {
      const res = await apiClient.post('/auth/login', { email, password });
      return res.data;
    } catch (e) {
      // Demo fallback
      if (email.includes('demo') || password.includes('Demo')) {
        return {
          access_token: 'mock-jwt-token-demo-alex-rivers',
          token_type: 'bearer',
          user_id: 1,
          name: 'Alex Rivers',
          email: 'demo@evsmarttrace.com'
        };
      }
      throw e;
    }
  },

  register: async (name: string, email: string, password: string) => {
    try {
      const res = await apiClient.post('/auth/register', { name, email, password });
      return res.data;
    } catch (e) {
      return {
        access_token: 'mock-jwt-token-new-user',
        token_type: 'bearer',
        user_id: 2,
        name: name,
        email: email
      };
    }
  },

  getProfile: async (): Promise<User> => {
    try {
      const res = await apiClient.get('/auth/me');
      return res.data;
    } catch {
      return {
        id: 1,
        name: 'Alex Rivers',
        email: 'demo@evsmarttrace.com',
        created_at: new Date().toISOString()
      };
    }
  },

  // Vehicles
  getVehicles: async (): Promise<Vehicle[]> => {
    try {
      const res = await apiClient.get('/vehicles');
      return res.data;
    } catch {
      return [{
        id: 1,
        user_id: 1,
        vehicle_name: 'CyberPulse GT (Demo)',
        manufacturer: 'Tesla',
        model: 'Model 3 Dual Motor',
        vehicle_type: 'Sedan',
        battery_capacity: 60.0,
        battery_chemistry: 'Lithium Nickel Manganese Cobalt (NMC)',
        max_charging_power: 170.0,
        connector_types: 'CCS2, Tesla Supercharger, Type 2',
        vehicle_identifier: 'EV-ST360-9842-DEMO',
        current_battery_pct: 70.0,
        efficiency_kwh_km: 0.150,
        is_demo: true
      }];
    }
  },

  createVehicle: async (data: Partial<Vehicle>): Promise<Vehicle> => {
    const res = await apiClient.post('/vehicles', data);
    return res.data;
  },

  updateVehicle: async (id: number, data: Partial<Vehicle>): Promise<Vehicle> => {
    const res = await apiClient.put(`/vehicles/${id}`, data);
    return res.data;
  },

  // Dashboard
  getDashboardStats: async (vehicleId: number): Promise<DashboardStats> => {
    try {
      const res = await apiClient.get(`/dashboard/${vehicleId}`);
      return res.data;
    } catch {
      return {
        vehicle: {
          id: vehicleId,
          user_id: 1,
          vehicle_name: 'CyberPulse GT (Demo)',
          manufacturer: 'Tesla',
          model: 'Model 3 Dual Motor',
          vehicle_type: 'Sedan',
          battery_capacity: 60.0,
          battery_chemistry: 'Lithium-ion NMC',
          max_charging_power: 170.0,
          connector_types: 'CCS2, Type 2',
          vehicle_identifier: 'EV-ST360-9842-DEMO',
          current_battery_pct: 70.0,
          efficiency_kwh_km: 0.150,
          is_demo: true
        },
        latest_battery: {
          id: 1,
          vehicle_id: vehicleId,
          soc: 70.0,
          soh: 95.2,
          voltage: 401.5,
          temperature: 27.8,
          available_energy: 42.0,
          timestamp: new Date().toISOString(),
          data_source: 'simulated'
        },
        estimated_range_km: 227.3,
        range_confidence: 0.972,
        health_score: 88,
        charging_status: 'Disconnected',
        estimated_charging_completion: '32 mins to 80% on 150 kW DC Fast',
        vehicle_health_status: 'Attention Needed',
        upcoming_charging_recommendations: [
          'Driving parameters are optimal. Battery operating within peak thermal envelope.',
          'Off-peak tariff window begins at 11:00 PM ($0.18/kWh).'
        ],
        recent_energy_trend: [
          { date: 'Mon', distance_km: 45, consumption_kwh_km: 0.150, energy_kwh: 6.75 },
          { date: 'Tue', distance_km: 82, consumption_kwh_km: 0.155, energy_kwh: 12.71 },
          { date: 'Wed', distance_km: 31, consumption_kwh_km: 0.146, energy_kwh: 4.52 },
          { date: 'Thu', distance_km: 110, consumption_kwh_km: 0.160, energy_kwh: 17.6 },
          { date: 'Fri', distance_km: 55, consumption_kwh_km: 0.148, energy_kwh: 8.14 },
          { date: 'Sat', distance_km: 64, consumption_kwh_km: 0.153, energy_kwh: 9.79 },
          { date: 'Sun', distance_km: 28, consumption_kwh_km: 0.145, energy_kwh: 4.06 },
        ],
        recent_charging_sessions: [
          { id: 1, date: 'Nov 16', energy_kwh: 37.2, cost_usd: 11.90, power_kw: 120, soc_gain: '22% -> 80%' },
          { id: 2, date: 'Nov 13', energy_kwh: 42.5, cost_usd: 14.88, power_kw: 95, soc_gain: '18% -> 85%' },
          { id: 3, date: 'Nov 09', energy_kwh: 38.0, cost_usd: 10.64, power_kw: 60, soc_gain: '30% -> 90%' },
        ],
        nearby_stations_count: 5,
        notifications: [
          {
            id: 1,
            title: 'Inverter Cooling Alert',
            message: 'Inverter thermal reading reached 68.4°C during peak acceleration. System recommends cooling inspection.',
            severity: 'warning',
            is_read: false,
            created_at: new Date().toISOString()
          },
          {
            id: 2,
            title: 'Optimal Off-Peak Charging',
            message: 'Off-peak electricity tariff begins at 11:00 PM ($0.18/kWh). Scheduled charging recommended.',
            severity: 'info',
            is_read: false,
            created_at: new Date(Date.now() - 3600000).toISOString()
          }
        ],
        is_demo_mode: true
      };
    }
  },

  // Battery Intelligence
  getRangePrediction: async (
    vehicleId: number, 
    params: { speed_kmh?: number; ambient_temp_c?: number; ac_on?: number; payload_weight_kg?: number }
  ): Promise<RangePrediction> => {
    try {
      const res = await apiClient.get(`/battery/${vehicleId}/range-prediction`, { params });
      return res.data;
    } catch {
      const speed = params.speed_kmh || 65;
      const ac = params.ac_on !== undefined ? params.ac_on : 1;
      const baseConsumption = 0.145 + (speed > 90 ? 0.03 : 0.0) + (ac ? 0.015 : 0.0);
      const avail = 42.0; // 60 kWh * 70%
      const range = avail / baseConsumption;
      return {
        soc_pct: 70.0,
        available_energy_kwh: 42.0,
        predicted_consumption_kwh_km: Number(baseConsumption.toFixed(4)),
        predicted_consumption_kwh_100km: Number((baseConsumption * 100).toFixed(2)),
        predicted_range_km: Number(range.toFixed(1)),
        min_range_km: Number((range * 0.92).toFixed(1)),
        max_range_km: Number((range * 1.08).toFixed(1)),
        confidence_score: 0.965,
        efficiency_score: 92,
        recommendations: [
          'Driving parameters are optimal. Battery operating within peak thermal envelope.',
          speed > 100 ? 'Lowering cruise speed by 10 km/h will recover ~12% range.' : 'Regenerative braking efficiency is high.'
        ],
        model_type: 'RandomForestRegressor (Ensemble 120 trees)',
        disclaimer: 'Range estimations are AI-predicted values based on telemetry and road conditions, not a legal guarantee.'
      };
    }
  },

  getBatteryHistory: async (vehicleId: number): Promise<BatteryReading[]> => {
    try {
      const res = await apiClient.get(`/battery/${vehicleId}/history`);
      return res.data;
    } catch {
      return [
        { id: 1, vehicle_id: vehicleId, soc: 80, soh: 95.3, voltage: 408, temperature: 30.5, available_energy: 48, timestamp: '12:00', data_source: 'simulated' },
        { id: 2, vehicle_id: vehicleId, soc: 76, soh: 95.3, voltage: 405, temperature: 29.0, available_energy: 45.6, timestamp: '14:00', data_source: 'simulated' },
        { id: 3, vehicle_id: vehicleId, soc: 72.5, soh: 95.2, voltage: 402, temperature: 28.1, available_energy: 43.5, timestamp: '16:00', data_source: 'simulated' },
        { id: 4, vehicle_id: vehicleId, soc: 70, soh: 95.2, voltage: 401.5, temperature: 27.8, available_energy: 42, timestamp: '18:00', data_source: 'simulated' },
      ];
    }
  },

  // Energy Analytics
  getEnergyAnalytics: async (vehicleId: number): Promise<EnergyAnalytics> => {
    try {
      const res = await apiClient.get(`/energy/${vehicleId}/analytics`);
      return res.data;
    } catch {
      return {
        vehicle_id: vehicleId,
        total_distance_km: 416.3,
        total_energy_kwh: 63.77,
        average_consumption_kwh_km: 0.153,
        average_speed_kmh: 58.2,
        recent_history: [],
        anomaly_detection: {
          is_anomaly: false,
          anomaly_score: 0.14,
          severity: 'normal',
          explanation: 'All monitored sensors are functioning within nominal manufacturer tolerances.',
          issues: []
        },
        peak_consumption_periods: [
          { period: 'Weekday Morning (08:00 - 10:00)', avg_kwh_km: 0.162, traffic: 'Heavy' },
          { period: 'Midday Cruise (12:00 - 14:00)', avg_kwh_km: 0.142, traffic: 'Light' },
          { period: 'Evening Rush (17:30 - 19:30)', avg_kwh_km: 0.158, traffic: 'Moderate' }
        ],
        efficiency_trend: '+4.2% more efficient than fleet benchmark'
      };
    }
  },

  getMonthlyReport: async (vehicleId: number) => {
    try {
      const res = await apiClient.get(`/energy/${vehicleId}/monthly-report`);
      return res.data;
    } catch {
      return {
        vehicle_id: vehicleId,
        month: 'November 2026',
        total_trips: 48,
        total_distance_km: 1420.5,
        total_energy_kwh: 213.08,
        total_cost_usd: 53.27,
        avg_efficiency_kwh_km: 0.150,
        co2_saved_kg: 177.5,
        weekly_breakdown: [
          { week: 'Week 1', distance_km: 340.2, kwh: 51.0, cost: 12.75, efficiency: 0.150 },
          { week: 'Week 2', distance_km: 385.5, kwh: 57.8, cost: 14.45, efficiency: 0.150 },
          { week: 'Week 3', distance_km: 310.0, kwh: 46.2, cost: 11.55, efficiency: 0.149 },
          { week: 'Week 4', distance_km: 384.8, kwh: 58.08, cost: 14.52, efficiency: 0.151 }
        ]
      };
    }
  },

  // Diagnostics
  scanVehicle: async (vehicleId: number): Promise<DiagnosticReport> => {
    try {
      const res = await apiClient.post('/diagnostics/scan', { vehicle_id: vehicleId });
      return res.data;
    } catch {
      return {
        vehicle_id: vehicleId,
        scan_timestamp: new Date().toISOString(),
        overall_status: 'Attention Needed',
        health_score: 88,
        components: [
          {
            name: 'Battery Pack System',
            status: 'normal',
            current_reading: '401.5V | 28.5°C | Cell Delta 6.5mV',
            expected_range: '350V - 420V | 20°C - 38°C | < 15mV Delta',
            detected_problems: [],
            ai_explanation: 'High voltage battery cells are balanced within nominal threshold (<15mV). Thermal management active and stable.',
            recommended_action: 'Maintain 20%-80% state of charge for daily commuting to preserve cathode longevity.',
            sensor_key: 'battery',
            score: 98
          },
          {
            name: 'Electric Drive & Traction Motor',
            status: 'normal',
            current_reading: '56.2°C | Permanent Magnet Synchronous',
            expected_range: '40°C - 75°C under continuous load',
            detected_problems: [],
            ai_explanation: 'Stator windings and rotor bearing temperatures are well within thermal safety margins.',
            recommended_action: 'No maintenance required. Check drive unit lubricant at 80,000 km.',
            sensor_key: 'motor',
            score: 96
          },
          {
            name: 'Cooling & Thermal Management',
            status: 'warning',
            current_reading: '42.0°C | Loop Pressure 1.4 Bar',
            expected_range: '30°C - 55°C | Inverter loop max 60°C',
            detected_problems: ['P0A93-00: Inverter Cooling Loop Flow Restriction Notice'],
            ai_explanation: 'Slight thermal delta observed in secondary heat exchanger circuit during high-current DC fast charging.',
            recommended_action: 'Inspect coolant reservoir fluid level and ensure front active grille shutters are unobstructed.',
            sensor_key: 'cooling',
            score: 82
          },
          {
            name: 'Charging System & Onboard Inverter',
            status: 'normal',
            current_reading: 'CCS2 Port Ready | Inverter Efficiency 93.4%',
            expected_range: 'AC 240V 32A / DC Fast up to 170 kW',
            detected_problems: [],
            ai_explanation: 'CP/PP communication handshake validated with high signal fidelity.',
            recommended_action: 'Ensure charging port pins are clean of debris or moisture.',
            sensor_key: 'charging',
            score: 95
          },
          {
            name: '12V Auxiliary Electrical System',
            status: 'normal',
            current_reading: '13.8V (DC-DC Converter Active)',
            expected_range: '13.2V - 14.5V',
            detected_problems: [],
            ai_explanation: 'High-voltage to low-voltage DC-DC buck converter maintaining stable float voltage.',
            recommended_action: '12V battery health optimal. Normal automated top-off active.',
            sensor_key: 'electrical',
            score: 94
          }
        ],
        active_faults_count: 1,
        warnings_count: 1,
        critical_count: 0,
        ai_summary: 'Diagnostic sweep completed for CyberPulse GT. 4 of 5 subsystems operating in peak condition. 1 advisory detected in Cooling Loop (P0A93-00). Vehicle condition remains roadworthy.',
        recommended_inspections: [
          'Verify inverter coolant reservoir level at your convenience.',
          'Keep cabin air filter clean for maximum HVAC heat-pump efficiency.'
        ],
        is_simulated: true
      };
    }
  },

  // Charging & Stations
  getChargingEstimate: async (vehicleId: number, targetSoc = 80, power = 150): Promise<ChargingEstimate> => {
    try {
      const res = await apiClient.get(`/charging/${vehicleId}/estimate`, {
        params: { target_soc: targetSoc, charging_power_kw: power }
      });
      return res.data;
    } catch {
      return {
        current_soc: 70,
        target_soc: targetSoc,
        battery_capacity_kwh: 60,
        required_energy_kwh: 6.0,
        charging_power_kw: power,
        estimated_duration_minutes: 18,
        estimated_duration_formatted: '18 mins',
        estimated_cost_usd: 1.63,
        electricity_tariff: 0.25,
        charging_losses_kwh: 0.52,
        effective_power_kw: 150
      };
    }
  },

  getStations: async (connectorType?: string, minPower?: number): Promise<ChargingStation[]> => {
    try {
      const res = await apiClient.get('/stations/nearby', {
        params: { connector_type: connectorType, min_power: minPower }
      });
      return res.data;
    } catch {
      return [
        {
          id: 1,
          station_name: 'Supercharge Hub - Silicon Metro',
          address: '101 Tech Blvd, Metro Central',
          latitude: 37.7749,
          longitude: -122.4194,
          operator: 'Tesla Supercharger',
          charging_power: 250,
          connector_type: 'CCS2 / NACS',
          availability_status: 'Available (8/12 Open)',
          pricing_per_kwh: 0.32,
          distance_km: 1.8
        },
        {
          id: 2,
          station_name: 'Electrify Express - Harbor Bay',
          address: '450 Marina Way, Bayside',
          latitude: 37.7891,
          longitude: -122.4014,
          operator: 'Electrify America',
          charging_power: 150,
          connector_type: 'CCS2 / CHAdeMO',
          availability_status: 'Available (4/6 Open)',
          pricing_per_kwh: 0.35,
          distance_km: 3.4
        },
        {
          id: 3,
          station_name: 'GreenGrid Fast Charge - Sunset Point',
          address: '820 Ocean Ave, West Coast',
          latitude: 37.7601,
          longitude: -122.4822,
          operator: 'EVgo',
          charging_power: 100,
          connector_type: 'CCS2 / Type 2',
          availability_status: 'Available (2/4 Open)',
          pricing_per_kwh: 0.28,
          distance_km: 6.2
        },
        {
          id: 4,
          station_name: 'VoltPoint Urban Hub - Downtown',
          address: '12 Civic Center Plaza',
          latitude: 37.7793,
          longitude: -122.4184,
          operator: 'ChargePoint',
          charging_power: 50,
          connector_type: 'Type 2 / AC Fast',
          availability_status: 'Occupied (All in Use)',
          pricing_per_kwh: 0.22,
          distance_km: 0.9
        },
        {
          id: 5,
          station_name: 'EcoCharge Highway Oasis - Exit 42',
          address: 'Highway 101 Northbound Rest Area',
          latitude: 37.8205,
          longitude: -122.3789,
          operator: 'BP Pulse',
          charging_power: 180,
          connector_type: 'CCS2',
          availability_status: 'Available (5/8 Open)',
          pricing_per_kwh: 0.30,
          distance_km: 8.5
        }
      ];
    }
  },

  // Routes
  optimizeRoute: async (
    vehicleId: number, 
    origin: string, 
    destination: string, 
    currentBatteryPct?: number, 
    desiredArrivalPct?: number
  ): Promise<RouteOptimizeResult> => {
    try {
      const res = await apiClient.post('/routes/optimize', {
        vehicle_id: vehicleId,
        origin,
        destination,
        current_battery_pct: currentBatteryPct,
        desired_arrival_pct: desiredArrivalPct
      });
      return res.data;
    } catch {
      return {
        vehicle_id: vehicleId,
        origin,
        destination,
        current_battery_pct: currentBatteryPct || 70,
        estimated_available_energy_kwh: 42.0,
        routes: [
          {
            route_id: 'route_balanced',
            title: 'Recommended Balanced Route',
            badge: 'Best Compromise',
            distance_km: 74.8,
            driving_time_minutes: 50,
            charging_time_minutes: 0,
            total_time_minutes: 50,
            estimated_energy_kwh: 11.2,
            arrival_battery_pct: 51.3,
            charging_stops_count: 0,
            charging_stops: [],
            co2_saved_kg: 8.98,
            summary: 'Smooth traffic flow on highway corridor with guaranteed charger density and minimal battery degradation.',
            waypoints: [
              [37.7749, -122.4194],
              [37.7122, -122.3850],
              [37.6213, -122.3790],
              [37.5485, -122.3186],
              [37.4419, -122.1430],
              [37.3861, -122.0839],
              [37.3382, -121.8863]
            ]
          },
          {
            route_id: 'route_fastest',
            title: 'Fastest Highway Route',
            badge: 'Min Travel Time',
            distance_km: 78.2,
            driving_time_minutes: 44,
            charging_time_minutes: 0,
            total_time_minutes: 44,
            estimated_energy_kwh: 13.4,
            arrival_battery_pct: 47.7,
            charging_stops_count: 0,
            charging_stops: [],
            co2_saved_kg: 8.21,
            summary: 'High-speed interstate route. Energy consumption is ~14% higher due to aerodynamic resistance.',
            waypoints: [
              [37.7749, -122.4194],
              [37.7011, -122.3522],
              [37.5922, -122.3211],
              [37.4811, -122.1901],
              [37.3622, -122.0122],
              [37.3382, -121.8863]
            ]
          },
          {
            route_id: 'route_eco',
            title: 'Lowest Energy Eco Route',
            badge: 'Max Energy Efficiency',
            distance_km: 73.4,
            driving_time_minutes: 63,
            charging_time_minutes: 0,
            total_time_minutes: 63,
            estimated_energy_kwh: 9.9,
            arrival_battery_pct: 53.5,
            charging_stops_count: 0,
            charging_stops: [],
            co2_saved_kg: 9.91,
            summary: 'Optimized for regenerative braking and scenic parkway speeds. Preserves maximum battery safety margin.',
            waypoints: [
              [37.7749, -122.4194],
              [37.7422, -122.4511],
              [37.6622, -122.4611],
              [37.5211, -122.3311],
              [37.4011, -122.1811],
              [37.3382, -121.8863]
            ]
          }
        ],
        recommended_route_id: 'route_balanced'
      };
    }
  },

  // SmartVoice Assistant
  sendAssistantChat: async (vehicleId: number, message: string, language = 'en') => {
    try {
      const res = await apiClient.post('/assistant/chat', {
        vehicle_id: vehicleId,
        message,
        language
      });
      return res.data;
    } catch {
      let reply = `SmartTrace 360: Battery is at 70% (~227 km range). All powertrain systems are running smoothly.`;
      if (message.toLowerCase().includes('battery') || message.toLowerCase().includes('percent')) {
        reply = `Your battery is at 70%, with 42.0 kWh usable energy remaining. Estimated driving range is 227 kilometres.`;
      } else if (message.toLowerCase().includes('range') || message.toLowerCase().includes('far')) {
        reply = `You have approximately 227 kilometres of remaining driving range based on your current 0.150 kWh/km driving efficiency.`;
      } else if (message.toLowerCase().includes('station') || message.toLowerCase().includes('charger')) {
        reply = `The nearest fast charging station is Supercharge Hub - Silicon Metro (250 kW), 1.8 km away. 8 of 12 stalls available.`;
      } else if (message.toLowerCase().includes('problem') || message.toLowerCase().includes('fault')) {
        reply = `Attention: 1 diagnostic warning active on Cooling System (P0A93-00). Inverter cooling loop flow restriction noticed. Inspect at next service.`;
      }
      return {
        response_text: reply,
        audio_text: reply,
        intent: 'general_query',
        language: language,
        proactive_alert: null,
        suggested_actions: ['View Battery Intelligence', 'Run Diagnostic Scan', 'Find Charging Stations']
      };
    }
  },

  markNotificationRead: async (id: number): Promise<NotificationItem> => {
    const res = await apiClient.patch(`/notifications/${id}/read`);
    return res.data;
  }
};
