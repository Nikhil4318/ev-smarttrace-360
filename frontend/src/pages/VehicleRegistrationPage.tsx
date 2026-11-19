import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Car, Zap, BatteryCharging, ArrowRight, CheckCircle2, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';

export const VehicleRegistrationPage: React.FC = () => {
  const { refreshVehicles } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    vehicle_name: '',
    manufacturer: '',
    model: '',
    vehicle_type: 'Sedan',
    battery_capacity: 60.0,
    battery_chemistry: 'Lithium-ion (NMC)',
    max_charging_power: 150.0,
    connector_types: 'CCS2, Type 2',
    vehicle_identifier: '',
    current_battery_pct: 75.0,
    efficiency_kwh_km: 0.150
  });

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    try {
      await api.createVehicle(formData);
      await refreshVehicles();
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to register vehicle. Check VIN / identifier uniqueness.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      
      {/* Header */}
      <div>
        <div className="flex items-center space-x-2">
          <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            FLEET REGISTRY
          </span>
          <span className="text-xs text-slate-400">Multi-Vehicle Registration</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white mt-1">
          Register New Electric Vehicle
        </h1>
        <p className="text-xs sm:text-sm text-slate-400 mt-1">
          Add your EV specifications to initialize battery degradation tracking, range prediction, and compatible charging filters.
        </p>
      </div>

      {error && (
        <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 flex items-center space-x-2 text-rose-400 text-xs">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} className="glass-panel p-6 sm:p-8 rounded-2xl space-y-6">
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300">Vehicle Display Name</label>
            <input
              type="text"
              required
              placeholder="e.g. CyberPulse GT"
              value={formData.vehicle_name}
              onChange={(e) => setFormData({ ...formData, vehicle_name: e.target.value })}
              className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-emerald-500/60"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300">Manufacturer</label>
            <input
              type="text"
              required
              placeholder="e.g. Tesla, Hyundai, Porsche, BMW"
              value={formData.manufacturer}
              onChange={(e) => setFormData({ ...formData, manufacturer: e.target.value })}
              className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-emerald-500/60"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300">Model Name</label>
            <input
              type="text"
              required
              placeholder="e.g. Model 3, Ioniq 5, Taycan 4S"
              value={formData.model}
              onChange={(e) => setFormData({ ...formData, model: e.target.value })}
              className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-emerald-500/60"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300">Vehicle Type</label>
            <select
              value={formData.vehicle_type}
              onChange={(e) => setFormData({ ...formData, vehicle_type: e.target.value })}
              className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-slate-100 focus:outline-none"
            >
              <option value="Sedan">Sedan</option>
              <option value="SUV">SUV / Crossover</option>
              <option value="Hatchback">Hatchback</option>
              <option value="Truck">Electric Truck / Pickup</option>
              <option value="Van">Electric Van</option>
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300">Battery Capacity (kWh)</label>
            <input
              type="number"
              step="0.1"
              required
              value={formData.battery_capacity}
              onChange={(e) => setFormData({ ...formData, battery_capacity: Number(e.target.value) })}
              className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-slate-100 focus:outline-none focus:border-emerald-500/60 font-mono"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300">Battery Chemistry</label>
            <select
              value={formData.battery_chemistry}
              onChange={(e) => setFormData({ ...formData, battery_chemistry: e.target.value })}
              className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-slate-100 focus:outline-none"
            >
              <option value="Lithium-ion (NMC)">Lithium-ion (NMC)</option>
              <option value="Lithium Iron Phosphate (LFP)">Lithium Iron Phosphate (LFP)</option>
              <option value="Nickel Cobalt Aluminum (NCA)">Nickel Cobalt Aluminum (NCA)</option>
              <option value="Solid State Battery">Solid State Battery</option>
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300">Max DC Fast Charging Power (kW)</label>
            <input
              type="number"
              required
              value={formData.max_charging_power}
              onChange={(e) => setFormData({ ...formData, max_charging_power: Number(e.target.value) })}
              className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-slate-100 focus:outline-none font-mono"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300">Supported Connector Types</label>
            <input
              type="text"
              required
              value={formData.connector_types}
              onChange={(e) => setFormData({ ...formData, connector_types: e.target.value })}
              className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-slate-100 focus:outline-none"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300">Vehicle Identifier (VIN / License Plate)</label>
            <input
              type="text"
              required
              placeholder="e.g. 5YJ3E1EB8NF123456"
              value={formData.vehicle_identifier}
              onChange={(e) => setFormData({ ...formData, vehicle_identifier: e.target.value })}
              className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-slate-100 uppercase font-mono focus:outline-none"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300">Initial Battery Percentage (%)</label>
            <input
              type="number"
              min="5"
              max="100"
              required
              value={formData.current_battery_pct}
              onChange={(e) => setFormData({ ...formData, current_battery_pct: Number(e.target.value) })}
              className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-slate-100 font-mono focus:outline-none"
            />
          </div>

          <div className="space-y-1.5 md:col-span-2">
            <label className="text-xs font-semibold text-slate-300">Rated Efficiency (kWh per km)</label>
            <input
              type="number"
              step="0.001"
              required
              value={formData.efficiency_kwh_km}
              onChange={(e) => setFormData({ ...formData, efficiency_kwh_km: Number(e.target.value) })}
              className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-slate-100 font-mono focus:outline-none"
            />
            <span className="text-[10px] text-slate-500 font-mono">0.150 kWh/km is equivalent to 15.0 kWh/100 km (~4.1 mi/kWh)</span>
          </div>

        </div>

        <div className="flex justify-end pt-4 border-t border-slate-800">
          <button
            type="submit"
            disabled={isLoading}
            className="px-8 py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-cyan-500 text-slate-950 font-bold text-xs sm:text-sm shadow-lg shadow-emerald-500/20 hover:brightness-110 active:scale-95 transition flex items-center space-x-2 disabled:opacity-50"
          >
            <span>{isLoading ? 'Registering...' : 'Register Vehicle to Fleet'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

      </form>

    </div>
  );
};
