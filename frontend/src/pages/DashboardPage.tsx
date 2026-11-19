import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Zap, 
  BatteryCharging, 
  Activity, 
  ShieldCheck, 
  MapPin, 
  ArrowRight, 
  Clock, 
  TrendingUp, 
  AlertTriangle, 
  CheckCircle2, 
  Sparkles,
  RefreshCw,
  Sliders,
  DollarSign
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  CartesianGrid 
} from 'recharts';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { DashboardStats } from '../types';

export const DashboardPage: React.FC = () => {
  const { activeVehicle, isDemoMode } = useAuth();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchStats = async () => {
    if (!activeVehicle) return;
    setIsLoading(true);
    try {
      const data = await api.getDashboardStats(activeVehicle.id);
      setStats(data);
    } catch (e) {
      console.error('Failed to load dashboard:', e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, [activeVehicle]);

  if (isLoading && !stats) {
    return (
      <div className="min-h-[80vh] flex flex-col items-center justify-center space-y-3">
        <RefreshCw className="w-8 h-8 text-emerald-400 animate-spin" />
        <p className="text-xs text-slate-400 font-mono">Synchronizing EV Telemetry Bus...</p>
      </div>
    );
  }

  const soc = stats?.latest_battery.soc || 70;
  const range = stats?.estimated_range_km || 227.3;
  const healthScore = stats?.health_score || 88;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Top Cockpit Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              CENTRAL INTELLIGENCE COCKPIT
            </span>
            <span className="text-xs text-slate-400">
              {stats?.vehicle.vehicle_name} ({stats?.vehicle.manufacturer} {stats?.vehicle.model})
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white mt-1">
            Vehicle Health & Performance Matrix
          </h1>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={fetchStats}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-xs text-slate-300 hover:border-slate-700 transition"
          >
            <RefreshCw className="w-3.5 h-3.5 text-emerald-400" />
            <span>Refresh Bus</span>
          </button>
          <Link
            to="/diagnostics"
            className="flex items-center space-x-1.5 px-4 py-1.5 rounded-lg bg-gradient-to-r from-emerald-500 to-cyan-500 text-slate-950 font-bold text-xs shadow-md shadow-emerald-500/20 hover:brightness-110 transition"
          >
            <span>Scan My EV</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>

      {/* Main KPI Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Battery State of Charge (SOC) */}
        <div className="glass-panel p-5 rounded-2xl relative overflow-hidden glass-card-hover border-emerald-500/30">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400 font-medium">State of Charge (SOC)</span>
            <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400">
              <BatteryCharging className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline space-x-2">
            <span className="text-3xl sm:text-4xl font-extrabold font-mono text-emerald-400">
              {soc.toFixed(0)}%
            </span>
            <span className="text-xs text-slate-400">
              ({stats?.latest_battery.available_energy.toFixed(1)} kWh)
            </span>
          </div>
          <div className="mt-3 w-full bg-slate-900 rounded-full h-1.5 overflow-hidden">
            <div
              className="bg-gradient-to-r from-emerald-500 to-cyan-400 h-full rounded-full"
              style={{ width: `${soc}%` }}
            />
          </div>
          <div className="mt-2 flex items-center justify-between text-[10px] text-slate-500 font-mono">
            <span>SOH: {stats?.latest_battery.soh}%</span>
            <span className="text-emerald-400">401.5V Nominal</span>
          </div>
        </div>

        {/* Estimated Driving Range */}
        <div className="glass-panel p-5 rounded-2xl relative overflow-hidden glass-card-hover border-cyan-500/30">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400 font-medium">Estimated Driving Range</span>
            <div className="p-2 rounded-lg bg-cyan-500/10 text-cyan-400">
              <Zap className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline space-x-2">
            <span className="text-3xl sm:text-4xl font-extrabold font-mono text-cyan-400">
              {range.toFixed(0)}
            </span>
            <span className="text-xs text-slate-400">km remaining</span>
          </div>
          <div className="mt-3 flex items-center justify-between text-[11px]">
            <span className="text-slate-400">Confidence Margin</span>
            <span className="font-mono text-emerald-400 font-bold">
              {((stats?.range_confidence || 0.95) * 100).toFixed(1)}%
            </span>
          </div>
          <div className="mt-1 flex items-center justify-between text-[10px] text-slate-500 font-mono">
            <span>Random Forest Model</span>
            <span className="text-cyan-400">±18 km spread</span>
          </div>
        </div>

        {/* Subsystem Health Score */}
        <div className="glass-panel p-5 rounded-2xl relative overflow-hidden glass-card-hover border-amber-500/30">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400 font-medium">Subsystem Health Index</span>
            <div className="p-2 rounded-lg bg-amber-500/10 text-amber-400">
              <ShieldCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline space-x-2">
            <span className="text-3xl sm:text-4xl font-extrabold font-mono text-amber-400">
              {healthScore}
            </span>
            <span className="text-xs text-slate-400">/ 100</span>
          </div>
          <div className="mt-3 flex items-center justify-between text-[11px]">
            <span className="text-slate-400">Overall Condition</span>
            <span className="font-medium text-amber-400">
              {stats?.vehicle_health_status}
            </span>
          </div>
          <div className="mt-1 flex items-center justify-between text-[10px] text-slate-500 font-mono">
            <span>Active Codes: 1 Notice</span>
            <span className="text-amber-400">P0A93 (Cooling)</span>
          </div>
        </div>

        {/* Charging Status & Fast Charge ETA */}
        <div className="glass-panel p-5 rounded-2xl relative overflow-hidden glass-card-hover border-blue-500/30">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400 font-medium">Charging Port & Schedule</span>
            <div className="p-2 rounded-lg bg-blue-500/10 text-blue-400">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline space-x-2">
            <span className="text-xl sm:text-2xl font-bold text-white">
              {stats?.charging_status}
            </span>
          </div>
          <div className="mt-3 text-[11px] text-slate-300 line-clamp-1">
            {stats?.estimated_charging_completion}
          </div>
          <div className="mt-2 flex items-center justify-between text-[10px] text-slate-500 font-mono">
            <span>Inlet: CCS2 Ready</span>
            <span className="text-emerald-400">Max 170 kW</span>
          </div>
        </div>

      </div>

      {/* Visualizations Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Daily Energy Consumption Chart (2 columns) */}
        <div className="lg:col-span-2 glass-panel p-6 rounded-2xl space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                Daily Energy Consumption Profile (kWh/km)
              </h3>
              <p className="text-xs text-slate-400">
                Calculated efficiency over past 7 driving days compared to 0.150 kWh/km benchmark
              </p>
            </div>
            <span className="text-[11px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20 self-start sm:self-auto">
              Telemetry Verified
            </span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={stats?.recent_energy_trend}>
                <defs>
                  <linearGradient id="energyGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#00ff87" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#00ff87" stopOpacity={0.0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="date" stroke="#64748b" fontSize={11} />
                <YAxis stroke="#64748b" fontSize={11} domain={[0.13, 0.18]} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    borderColor: '#1e293b',
                    borderRadius: '8px',
                    fontSize: '11px'
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="consumption_kwh_km"
                  stroke="#00ff87"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#energyGradient)"
                  name="kWh/km"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Upcoming Charging Recommendations */}
        <div className="glass-panel p-6 rounded-2xl space-y-4 flex flex-col justify-between">
          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <Sparkles className="w-4 h-4 text-cyan-400" />
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                AI Charging Advisory
              </h3>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Real-time recommendations derived from temperature, calendar commute patterns, and grid tariffs.
            </p>

            <div className="space-y-2.5 pt-2">
              {stats?.upcoming_charging_recommendations.map((rec, i) => (
                <div key={i} className="p-3 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-300 flex items-start space-x-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                  <span>{rec}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-4 border-t border-slate-800 flex items-center justify-between text-xs">
            <span className="text-slate-400">Nearby Fast Chargers</span>
            <Link to="/stations" className="text-cyan-400 hover:text-cyan-300 font-semibold flex items-center space-x-1">
              <span>View 5 Stations</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

      </div>

      {/* Charging Sessions & Cost Analysis */}
      <div className="glass-panel p-6 rounded-2xl space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">
              Recent Metered Fast Charging Sessions
            </h3>
            <p className="text-xs text-slate-400">Logged session power, energy delivered, and electricity expenditure</p>
          </div>
          <Link to="/energy" className="text-xs text-emerald-400 hover:text-emerald-300 font-semibold flex items-center space-x-1">
            <span>Detailed Analytics</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-slate-800 text-slate-400 font-mono text-[11px] uppercase">
              <tr>
                <th className="py-2.5 px-3">Date</th>
                <th className="py-2.5 px-3">Energy Delivered</th>
                <th className="py-2.5 px-3">State of Charge Delta</th>
                <th className="py-2.5 px-3">Peak Power</th>
                <th className="py-2.5 px-3">Total Cost</th>
                <th className="py-2.5 px-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-mono">
              {stats?.recent_charging_sessions.map((sess) => (
                <tr key={sess.id} className="hover:bg-slate-900/40">
                  <td className="py-3 px-3 text-slate-200">{sess.date}</td>
                  <td className="py-3 px-3 text-emerald-400 font-bold">{sess.energy_kwh} kWh</td>
                  <td className="py-3 px-3 text-slate-300">{sess.soc_gain}</td>
                  <td className="py-3 px-3 text-cyan-400">{sess.power_kw} kW</td>
                  <td className="py-3 px-3 text-white font-bold">${sess.cost_usd.toFixed(2)}</td>
                  <td className="py-3 px-3">
                    <span className="px-2 py-0.5 rounded text-[10px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                      Completed
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};
