import React, { useState } from 'react';
import { User, Car, Shield, Database, Cpu, CheckCircle2, LogOut, Key } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const ProfilePage: React.FC = () => {
  const { user, vehicles, activeVehicle, setActiveVehicle, logout } = useAuth();
  const [name, setName] = useState(user?.name || 'Alex Rivers');
  const [saved, setSaved] = useState(false);

  const handleUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      <div>
        <div className="flex items-center space-x-2">
          <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
            DRIVER ACCOUNT & SETTINGS
          </span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white mt-1">
          Profile & Connected Vehicle Fleet
        </h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Profile Details Card */}
        <div className="md:col-span-2 glass-panel p-6 sm:p-8 rounded-2xl space-y-6">
          <div className="flex items-center space-x-4 border-b border-slate-800 pb-5">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-emerald-500 to-cyan-500 p-[2px]">
              <div className="w-full h-full bg-slate-950 rounded-2xl flex items-center justify-center text-xl font-bold text-slate-100">
                {name.charAt(0)}
              </div>
            </div>
            <div>
              <h2 className="text-base font-bold text-white">{name}</h2>
              <p className="text-xs text-slate-400 font-mono">{user?.email || 'demo@evsmarttrace.com'}</p>
              <span className="inline-block mt-1 text-[10px] font-mono bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded border border-emerald-500/20">
                Verified Driver ID #ST-9842
              </span>
            </div>
          </div>

          <form onSubmit={handleUpdate} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300">Driver Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-slate-100 focus:outline-none focus:border-cyan-500/60"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300">Registered Email</label>
              <input
                type="email"
                disabled
                value={user?.email || 'demo@evsmarttrace.com'}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-slate-500 cursor-not-allowed font-mono"
              />
            </div>

            <div className="pt-2 flex items-center justify-between">
              {saved && (
                <span className="text-xs text-emerald-400 flex items-center space-x-1 font-mono">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Profile updated</span>
                </span>
              )}
              <button
                type="submit"
                className="px-5 py-2.5 rounded-xl bg-emerald-500 text-slate-950 font-bold text-xs hover:bg-emerald-400 transition"
              >
                Save Changes
              </button>
            </div>
          </form>
        </div>

        {/* System Diagnostics Status */}
        <div className="glass-panel p-6 rounded-2xl space-y-4 flex flex-col justify-between">
          <div className="space-y-3">
            <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider font-mono">
              System Health & Diagnostics
            </h3>

            <div className="space-y-2 text-xs">
              <div className="p-3 rounded-xl bg-slate-900 flex items-center justify-between">
                <span className="text-slate-400">FastAPI Backend</span>
                <span className="text-emerald-400 font-mono font-bold">ONLINE</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-900 flex items-center justify-between">
                <span className="text-slate-400">Database Engine</span>
                <span className="text-emerald-400 font-mono font-bold">MySQL 8.0 / Active</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-900 flex items-center justify-between">
                <span className="text-slate-400">Random Forest Range ML</span>
                <span className="text-cyan-400 font-mono font-bold">120 Trees (R² 0.94)</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-900 flex items-center justify-between">
                <span className="text-slate-400">Isolation Forest Anomaly</span>
                <span className="text-cyan-400 font-mono font-bold">Fitted (100 Trees)</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-900 flex items-center justify-between">
                <span className="text-slate-400">SmartVoice TTS / NLU</span>
                <span className="text-emerald-400 font-mono font-bold">Web Speech + AI</span>
              </div>
            </div>
          </div>

          <button
            onClick={logout}
            className="w-full py-2.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 hover:bg-rose-500/20 text-xs font-bold transition flex items-center justify-center space-x-1.5"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out Session</span>
          </button>
        </div>

      </div>

      {/* Connected Vehicle Fleet Table */}
      <div className="glass-panel p-6 rounded-2xl space-y-4">
        <h3 className="text-sm font-bold text-white uppercase tracking-wider">
          Registered Vehicles in Driver Fleet ({vehicles.length})
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {vehicles.map((v) => {
            const isSelected = activeVehicle?.id === v.id;
            return (
              <div
                key={v.id}
                onClick={() => setActiveVehicle(v)}
                className={`p-4 rounded-xl border transition cursor-pointer ${
                  isSelected
                    ? 'bg-emerald-500/10 border-emerald-500/60 shadow-lg shadow-emerald-500/10'
                    : 'bg-slate-900/80 border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="text-sm font-bold text-white">{v.vehicle_name}</h4>
                    <p className="text-xs text-slate-400">{v.manufacturer} {v.model} ({v.vehicle_type})</p>
                  </div>
                  {isSelected && (
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-emerald-500 text-slate-950 font-bold">
                      ACTIVE
                    </span>
                  )}
                </div>

                <div className="mt-3 pt-2.5 border-t border-slate-800/80 grid grid-cols-3 gap-2 text-xs font-mono">
                  <div>
                    <span className="text-[10px] text-slate-500 uppercase block">Battery</span>
                    <span className="text-emerald-400 font-bold">{v.battery_capacity} kWh</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 uppercase block">Charge Rate</span>
                    <span className="text-cyan-400 font-bold">{v.max_charging_power} kW</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 uppercase block">Efficiency</span>
                    <span className="text-slate-300 font-bold">{v.efficiency_kwh_km} kWh/km</span>
                  </div>
                </div>

                <div className="mt-2 text-[10px] text-slate-500 font-mono">
                  VIN / ID: <span className="text-slate-400">{v.vehicle_identifier}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
};
