import React, { useState, useEffect } from 'react';
import { 
  Activity, 
  BatteryCharging, 
  DollarSign, 
  Clock, 
  Download, 
  AlertTriangle, 
  TrendingUp, 
  CheckCircle2, 
  Zap,
  Sliders,
  FileSpreadsheet
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  Tooltip, 
  CartesianGrid 
} from 'recharts';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { EnergyAnalytics, ChargingEstimate } from '../types';

export const EnergyAnalyticsPage: React.FC = () => {
  const { activeVehicle } = useAuth();
  const [analytics, setAnalytics] = useState<EnergyAnalytics | null>(null);
  const [estimate, setEstimate] = useState<ChargingEstimate | null>(null);
  const [targetSoc, setTargetSoc] = useState(80);
  const [chargerPower, setChargerPower] = useState(150);
  const [tariff, setTariff] = useState(0.25);
  const [monthlyData, setMonthlyData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);

  const fetchData = async () => {
    if (!activeVehicle) return;
    setIsLoading(true);
    try {
      const [anData, estData, repData] = await Promise.all([
        api.getEnergyAnalytics(activeVehicle.id),
        api.getChargingEstimate(activeVehicle.id, targetSoc, chargerPower),
        api.getMonthlyReport(activeVehicle.id)
      ]);
      setAnalytics(anData);
      setEstimate(estData);
      setMonthlyData(repData);
    } catch (e) {
      console.error('Error fetching energy analytics:', e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [activeVehicle, targetSoc, chargerPower]);

  const downloadCSVReport = () => {
    if (!monthlyData) return;
    let csv = 'Week,Distance_km,Energy_kWh,Cost_USD,Efficiency_kWh_km\n';
    monthlyData.weekly_breakdown.forEach((w: any) => {
      csv += `${w.week},${w.distance_km},${w.kwh},${w.cost},${w.efficiency}\n`;
    });
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `EV_SmartTrace_Energy_Report_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
              MODULE TWO: SMART CHARGING & ENERGY ANALYTICS
            </span>
            <span className="text-xs text-slate-400">Metered Power & Anomaly Detection</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white mt-1">
            Energy Consumption & Charging Economics
          </h1>
        </div>

        <button
          onClick={downloadCSVReport}
          className="flex items-center space-x-2 px-4 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs font-semibold text-slate-200 hover:border-emerald-500/50 hover:text-emerald-400 transition"
        >
          <Download className="w-3.5 h-3.5" />
          <span>Export CSV Report</span>
        </button>
      </div>

      {/* Isolation Forest Anomaly Detection Banner */}
      {analytics?.anomaly_detection && (
        <div className={`p-4 rounded-2xl glass-panel border flex items-start space-x-3.5 ${
          analytics.anomaly_detection.is_anomaly
            ? 'border-amber-500/40 bg-amber-500/5'
            : 'border-emerald-500/30 bg-emerald-500/5'
        }`}>
          {analytics.anomaly_detection.is_anomaly ? (
            <AlertTriangle className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
          ) : (
            <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" />
          )}
          <div className="space-y-1">
            <div className="flex items-center space-x-2">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-200 font-mono">
                Isolation Forest Anomaly Inspector
              </span>
              <span className={`text-[10px] px-2 py-0.5 rounded font-mono ${
                analytics.anomaly_detection.is_anomaly
                  ? 'bg-amber-500/20 text-amber-300'
                  : 'bg-emerald-500/20 text-emerald-300'
              }`}>
                Score: {analytics.anomaly_detection.anomaly_score} ({analytics.anomaly_detection.severity})
              </span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              {analytics.anomaly_detection.explanation}
            </p>
          </div>
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        <div className="glass-panel p-5 rounded-2xl border-emerald-500/30">
          <span className="text-xs text-slate-400 block font-medium">Monthly Driving Distance</span>
          <div className="mt-2 flex items-baseline space-x-2">
            <span className="text-3xl font-extrabold font-mono text-emerald-400">
              {monthlyData ? monthlyData.total_distance_km.toFixed(1) : '1420.5'}
            </span>
            <span className="text-xs text-slate-400">km</span>
          </div>
          <span className="mt-3 text-[11px] text-slate-500 block">48 Total Trips Logged</span>
        </div>

        <div className="glass-panel p-5 rounded-2xl border-cyan-500/30">
          <span className="text-xs text-slate-400 block font-medium">Monthly Energy Consumed</span>
          <div className="mt-2 flex items-baseline space-x-2">
            <span className="text-3xl font-extrabold font-mono text-cyan-400">
              {monthlyData ? monthlyData.total_energy_kwh.toFixed(1) : '213.1'}
            </span>
            <span className="text-xs text-slate-400">kWh</span>
          </div>
          <span className="mt-3 text-[11px] text-slate-500 block">Avg: 0.150 kWh/km</span>
        </div>

        <div className="glass-panel p-5 rounded-2xl border-amber-500/30">
          <span className="text-xs text-slate-400 block font-medium">Electricity Expenditure</span>
          <div className="mt-2 flex items-baseline space-x-2">
            <span className="text-3xl font-extrabold font-mono text-amber-400">
              ${monthlyData ? monthlyData.total_cost_usd.toFixed(2) : '53.27'}
            </span>
            <span className="text-xs text-slate-400">USD</span>
          </div>
          <span className="mt-3 text-[11px] text-slate-500 block">Tariff: $0.25/kWh blend</span>
        </div>

        <div className="glass-panel p-5 rounded-2xl border-blue-500/30">
          <span className="text-xs text-slate-400 block font-medium">Carbon Emissions Prevented</span>
          <div className="mt-2 flex items-baseline space-x-2">
            <span className="text-3xl font-extrabold font-mono text-blue-400">
              {monthlyData ? monthlyData.co2_saved_kg.toFixed(0) : '178'}
            </span>
            <span className="text-xs text-slate-400">kg CO₂</span>
          </div>
          <span className="mt-3 text-[11px] text-slate-500 block">Compared to ICE Petrol</span>
        </div>

      </div>

      {/* Charging Estimator Tool */}
      <div className="glass-panel p-6 sm:p-8 rounded-2xl space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-4">
          <div>
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">
              Smart Charging Duration & Cost Estimator
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Formulas: Net Energy = Capacity × (Target SOC - Current SOC) / 100 | Duration = Net Energy / (Power × 92% eff)
            </p>
          </div>
          <span className="text-xs font-mono text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-lg border border-emerald-500/20">
            Current SOC: {activeVehicle?.current_battery_pct}%
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-300">Target State of Charge</span>
              <span className="font-mono text-emerald-400 font-bold">{targetSoc}%</span>
            </div>
            <input
              type="range"
              min="20"
              max="100"
              step="5"
              value={targetSoc}
              onChange={(e) => setTargetSoc(Number(e.target.value))}
              className="w-full accent-emerald-400 cursor-pointer"
            />
            <span className="text-[10px] text-slate-500 block font-mono">Daily recommended: 80%</span>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-300">Charger Rated Power</span>
              <span className="font-mono text-cyan-400 font-bold">{chargerPower} kW</span>
            </div>
            <select
              value={chargerPower}
              onChange={(e) => setChargerPower(Number(e.target.value))}
              className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none"
            >
              <option value="7.4">7.4 kW (Home AC Wallbox)</option>
              <option value="22">22 kW (Destination AC Fast)</option>
              <option value="50">50 kW (City DC Fast)</option>
              <option value="150">150 kW (Highway Ultra-Fast)</option>
              <option value="250">250 kW (Tesla Supercharger V3)</option>
            </select>
            <span className="text-[10px] text-slate-500 block font-mono">Effective rate with CC/CV taper</span>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-300">Electricity Tariff Rate</span>
              <span className="font-mono text-amber-400 font-bold">${tariff}/kWh</span>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setTariff(0.18)}
                className={`flex-1 py-2 rounded-lg text-xs font-semibold transition ${
                  tariff === 0.18 ? 'bg-amber-500 text-slate-950 font-bold' : 'bg-slate-900 text-slate-400 border border-slate-800'
                }`}
              >
                Off-Peak ($0.18)
              </button>
              <button
                onClick={() => setTariff(0.32)}
                className={`flex-1 py-2 rounded-lg text-xs font-semibold transition ${
                  tariff === 0.32 ? 'bg-amber-500 text-slate-950 font-bold' : 'bg-slate-900 text-slate-400 border border-slate-800'
                }`}
              >
                Peak ($0.32)
              </button>
            </div>
            <span className="text-[10px] text-slate-500 block font-mono">Time-of-Use Grid Pricing</span>
          </div>

        </div>

        {/* Calculated Output Matrix */}
        {estimate && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t border-slate-800">
            <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
              <span className="text-[10px] text-slate-500 uppercase font-mono block">Required Energy</span>
              <span className="text-xl font-bold font-mono text-emerald-400 mt-1 block">
                {estimate.required_energy_kwh.toFixed(1)} kWh
              </span>
              <span className="text-[10px] text-slate-500">Losses: +{estimate.charging_losses_kwh} kWh</span>
            </div>

            <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
              <span className="text-[10px] text-slate-500 uppercase font-mono block">Estimated Charging Time</span>
              <span className="text-xl font-bold font-mono text-cyan-400 mt-1 block">
                {estimate.estimated_duration_formatted}
              </span>
              <span className="text-[10px] text-slate-500">At {estimate.effective_power_kw} kW effective</span>
            </div>

            <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
              <span className="text-[10px] text-slate-500 uppercase font-mono block">Estimated Session Cost</span>
              <span className="text-xl font-bold font-mono text-amber-400 mt-1 block">
                ${estimate.estimated_cost_usd.toFixed(2)}
              </span>
              <span className="text-[10px] text-slate-500">Rate: ${tariff}/kWh</span>
            </div>

            <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
              <span className="text-[10px] text-slate-500 uppercase font-mono block">Estimated Efficiency</span>
              <span className="text-xl font-bold font-mono text-blue-400 mt-1 block">
                92.5%
              </span>
              <span className="text-[10px] text-slate-500">AC/DC conversion efficiency</span>
            </div>
          </div>
        )}

      </div>

      {/* Weekly Breakdown Chart */}
      <div className="glass-panel p-6 rounded-2xl space-y-4">
        <div>
          <h3 className="text-sm font-bold text-white uppercase tracking-wider">
            Weekly Energy Consumption & Distance Breakdown
          </h3>
          <p className="text-xs text-slate-400">Kilometres traveled vs kWh consumed across current billing cycle</p>
        </div>

        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={monthlyData?.weekly_breakdown}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis dataKey="week" stroke="#64748b" fontSize={11} />
              <YAxis yAxisId="left" stroke="#00ff87" fontSize={11} />
              <YAxis yAxisId="right" orientation="right" stroke="#00e5ff" fontSize={11} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#0f172a',
                  borderColor: '#1e293b',
                  borderRadius: '8px',
                  fontSize: '11px'
                }}
              />
              <Bar yAxisId="left" dataKey="kwh" fill="#00ff87" name="Energy (kWh)" radius={[4, 4, 0, 0]} />
              <Bar yAxisId="right" dataKey="distance_km" fill="#00e5ff" name="Distance (km)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

    </div>
  );
};
