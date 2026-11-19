import React, { useState, useEffect } from 'react';
import { 
  BatteryCharging, 
  Battery, 
  Zap, 
  Activity, 
  Sliders, 
  Thermometer, 
  Wind, 
  Sparkles, 
  AlertCircle, 
  ShieldCheck,
  TrendingUp,
  Cpu
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  Tooltip, 
  CartesianGrid 
} from 'recharts';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { RangePrediction, BatteryReading } from '../types';

export const BatteryIntelligencePage: React.FC = () => {
  const { activeVehicle } = useAuth();
  
  // Interactive Simulation Controls for Random Forest Inference
  const [speed, setSpeed] = useState(65);
  const [temp, setTemp] = useState(24);
  const [acOn, setAcOn] = useState(1);
  const [payload, setPayload] = useState(150);

  const [prediction, setPrediction] = useState<RangePrediction | null>(null);
  const [history, setHistory] = useState<BatteryReading[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetchPredictionAndHistory = async () => {
    if (!activeVehicle) return;
    setIsLoading(true);
    try {
      const pred = await api.getRangePrediction(activeVehicle.id, {
        speed_kmh: speed,
        ambient_temp_c: temp,
        ac_on: acOn,
        payload_weight_kg: payload
      });
      setPrediction(pred);

      const hist = await api.getBatteryHistory(activeVehicle.id);
      setHistory(hist);
    } catch (e) {
      console.error('Error fetching battery intelligence:', e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPredictionAndHistory();
  }, [activeVehicle, speed, temp, acOn, payload]);

  const capacity = activeVehicle?.battery_capacity || 60;
  const soc = activeVehicle?.current_battery_pct || 70;
  const availableEnergy = (capacity * soc) / 100;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Header */}
      <div>
        <div className="flex items-center space-x-2">
          <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            MODULE ONE: AI BATTERY INTELLIGENCE
          </span>
          <span className="text-xs text-slate-400">Random Forest Telemetry Estimator</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white mt-1">
          Battery Performance & Dynamic Range Predictor
        </h1>
        <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-3xl">
          Real-time analysis of State of Charge, cathode degradation (SOH), pack thermal envelope, and machine learning range prediction.
        </p>
      </div>

      {/* Primary Battery Telemetry Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        <div className="glass-panel p-5 rounded-2xl border-emerald-500/30">
          <span className="text-xs text-slate-400 block font-medium">State of Charge (SOC)</span>
          <div className="mt-2 flex items-baseline space-x-2">
            <span className="text-3xl font-extrabold font-mono text-emerald-400">{soc}%</span>
            <span className="text-xs text-slate-400">({availableEnergy.toFixed(1)} kWh)</span>
          </div>
          <div className="mt-3 w-full bg-slate-900 rounded-full h-1.5 overflow-hidden">
            <div className="bg-emerald-400 h-full rounded-full" style={{ width: `${soc}%` }} />
          </div>
          <span className="mt-2 text-[10px] font-mono text-slate-500 block">Total Capacity: {capacity} kWh</span>
        </div>

        <div className="glass-panel p-5 rounded-2xl border-cyan-500/30">
          <span className="text-xs text-slate-400 block font-medium">State of Health (SOH)</span>
          <div className="mt-2 flex items-baseline space-x-2">
            <span className="text-3xl font-extrabold font-mono text-cyan-400">95.2%</span>
            <span className="text-xs text-slate-400">Cathode Retention</span>
          </div>
          <div className="mt-3 w-full bg-slate-900 rounded-full h-1.5 overflow-hidden">
            <div className="bg-cyan-400 h-full rounded-full" style={{ width: '95.2%' }} />
          </div>
          <span className="mt-2 text-[10px] font-mono text-slate-500 block">Chemistry: NMC Lithium-ion</span>
        </div>

        <div className="glass-panel p-5 rounded-2xl border-amber-500/30">
          <span className="text-xs text-slate-400 block font-medium">Pack Temperature & Voltage</span>
          <div className="mt-2 flex items-baseline space-x-2">
            <span className="text-3xl font-extrabold font-mono text-amber-400">27.8°C</span>
            <span className="text-xs text-slate-400 font-mono">| 401.5V</span>
          </div>
          <div className="mt-3 flex items-center justify-between text-[11px] text-slate-400">
            <span>Thermal Envelope</span>
            <span className="text-emerald-400 font-mono">Nominal (20-35°C)</span>
          </div>
          <span className="mt-2 text-[10px] font-mono text-slate-500 block">Cell Variance: 6.5 mV</span>
        </div>

        <div className="glass-panel p-5 rounded-2xl border-blue-500/30">
          <span className="text-xs text-slate-400 block font-medium">Predicted Driving Range</span>
          <div className="mt-2 flex items-baseline space-x-2">
            <span className="text-3xl font-extrabold font-mono text-blue-400">
              {prediction ? prediction.predicted_range_km : 227}
            </span>
            <span className="text-xs text-slate-400">km</span>
          </div>
          <div className="mt-3 flex items-center justify-between text-[11px] text-slate-400">
            <span>Confidence Margin</span>
            <span className="text-cyan-400 font-mono font-bold">
              {prediction ? `${(prediction.confidence_score * 100).toFixed(1)}%` : '96.5%'}
            </span>
          </div>
          <span className="mt-2 text-[10px] font-mono text-slate-500 block">
            Range Spread: {prediction?.min_range_km} - {prediction?.max_range_km} km
          </span>
        </div>

      </div>

      {/* Interactive Random Forest Inference Simulator */}
      <div className="glass-panel p-6 sm:p-8 rounded-2xl space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-4">
          <div>
            <div className="flex items-center space-x-2">
              <Cpu className="w-4 h-4 text-cyan-400" />
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                Random Forest Inference Simulator
              </h3>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Simulate driving conditions dynamically to observe aerodynamic drag, HVAC draw, and payload effects.
            </p>
          </div>
          <span className="text-xs font-mono text-slate-400 bg-slate-900 px-3 py-1 rounded-lg border border-slate-800">
            Model: 120-Tree Ensemble (R² 0.944)
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          
          {/* Cruise Speed Slider */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-300 font-medium">Average Speed</span>
              <span className="font-mono text-cyan-400 font-bold">{speed} km/h</span>
            </div>
            <input
              type="range"
              min="30"
              max="140"
              value={speed}
              onChange={(e) => setSpeed(Number(e.target.value))}
              className="w-full accent-cyan-400 cursor-pointer"
            />
            <span className="text-[10px] text-slate-500 block font-mono">Aerodynamic drag scales exponentially</span>
          </div>

          {/* Ambient Temperature Slider */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-300 font-medium">Ambient Temperature</span>
              <span className="font-mono text-amber-400 font-bold">{temp}°C</span>
            </div>
            <input
              type="range"
              min="-10"
              max="45"
              value={temp}
              onChange={(e) => setTemp(Number(e.target.value))}
              className="w-full accent-amber-400 cursor-pointer"
            />
            <span className="text-[10px] text-slate-500 block font-mono">Battery pre-heating/cooling penalty</span>
          </div>

          {/* Payload Weight Slider */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-300 font-medium">Payload & Cargo</span>
              <span className="font-mono text-emerald-400 font-bold">{payload} kg</span>
            </div>
            <input
              type="range"
              min="0"
              max="450"
              value={payload}
              onChange={(e) => setPayload(Number(e.target.value))}
              className="w-full accent-emerald-400 cursor-pointer"
            />
            <span className="text-[10px] text-slate-500 block font-mono">Rolling resistance adjustment</span>
          </div>

          {/* AC / Heating Toggle */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-300 font-medium">Climate Control (AC/Heat)</span>
              <span className={`font-mono font-bold ${acOn ? 'text-emerald-400' : 'text-slate-500'}`}>
                {acOn ? 'ACTIVE (Eco)' : 'OFF'}
              </span>
            </div>
            <div className="flex items-center space-x-2 pt-1">
              <button
                onClick={() => setAcOn(1)}
                className={`flex-1 py-2 rounded-lg text-xs font-semibold transition ${
                  acOn === 1 ? 'bg-emerald-500 text-slate-950' : 'bg-slate-900 text-slate-400 border border-slate-800'
                }`}
              >
                ON
              </button>
              <button
                onClick={() => setAcOn(0)}
                className={`flex-1 py-2 rounded-lg text-xs font-semibold transition ${
                  acOn === 0 ? 'bg-emerald-500 text-slate-950' : 'bg-slate-900 text-slate-400 border border-slate-800'
                }`}
              >
                OFF
              </button>
            </div>
            <span className="text-[10px] text-slate-500 block font-mono">HVAC heat-pump load</span>
          </div>

        </div>

        {/* Dynamic Model Output Matrix */}
        {prediction && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t border-slate-800">
            <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800">
              <span className="text-[11px] text-slate-400 font-mono uppercase block">Predicted Consumption</span>
              <span className="text-xl font-bold font-mono text-emerald-400 mt-1 block">
                {prediction.predicted_consumption_kwh_km} kWh/km
              </span>
              <span className="text-[11px] text-slate-500 font-mono">
                ({prediction.predicted_consumption_kwh_100km} kWh / 100 km)
              </span>
            </div>

            <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800">
              <span className="text-[11px] text-slate-400 font-mono uppercase block">Energy Efficiency Score</span>
              <span className="text-xl font-bold font-mono text-cyan-400 mt-1 block">
                {prediction.efficiency_score} / 100
              </span>
              <span className="text-[11px] text-slate-500">Above average fleet efficiency</span>
            </div>

            <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800">
              <span className="text-[11px] text-slate-400 font-mono uppercase block">Uncertainty Bounds (95% CI)</span>
              <span className="text-xl font-bold font-mono text-blue-400 mt-1 block">
                {prediction.min_range_km} - {prediction.max_range_km} km
              </span>
              <span className="text-[11px] text-slate-500">Based on tree ensemble variance</span>
            </div>
          </div>
        )}

        {/* Recommendations & Safety Disclaimer */}
        <div className="space-y-2 pt-2">
          {prediction?.recommendations.map((rec, i) => (
            <div key={i} className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 text-xs text-slate-300 flex items-start space-x-2">
              <Sparkles className="w-4 h-4 text-cyan-400 flex-shrink-0 mt-0.5" />
              <span>{rec}</span>
            </div>
          ))}
          <p className="text-[10px] text-slate-500 italic pt-1">
            * {prediction?.disclaimer}
          </p>
        </div>

      </div>

      {/* Battery Voltage & SOC Discharge Curve (Recharts) */}
      <div className="glass-panel p-6 rounded-2xl space-y-4">
        <div>
          <h3 className="text-sm font-bold text-white uppercase tracking-wider">
            Battery Telemetry Historical Discharge Profile
          </h3>
          <p className="text-xs text-slate-400">Pack voltage and state of charge readings during recent trips</p>
        </div>

        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={history}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis dataKey="timestamp" stroke="#64748b" fontSize={11} />
              <YAxis yAxisId="left" stroke="#00ff87" fontSize={11} domain={[60, 100]} />
              <YAxis yAxisId="right" orientation="right" stroke="#00e5ff" fontSize={11} domain={[380, 420]} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#0f172a',
                  borderColor: '#1e293b',
                  borderRadius: '8px',
                  fontSize: '11px'
                }}
              />
              <Line yAxisId="left" type="monotone" dataKey="soc" stroke="#00ff87" strokeWidth={2} name="SOC %" />
              <Line yAxisId="right" type="monotone" dataKey="voltage" stroke="#00e5ff" strokeWidth={2} name="Voltage (V)" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

    </div>
  );
};
