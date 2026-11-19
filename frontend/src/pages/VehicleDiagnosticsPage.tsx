import React from 'react';
import { ShieldCheck, ShieldAlert, Cpu, Battery, Thermometer, Zap, Layers } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { DiagnosticScanner } from '../components/DiagnosticScanner';

export const VehicleDiagnosticsPage: React.FC = () => {
  const { activeVehicle } = useAuth();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Page Title */}
      <div>
        <div className="flex items-center space-x-2">
          <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-amber-500/10 text-amber-400 border border-amber-500/20">
            MODULE THREE & SEVEN: AI VEHICLE HEALTH & FAULT DETECTION
          </span>
          <span className="text-xs text-slate-400">Autonomous Sensor Sweep & Health Report</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white mt-1">
          Vehicle Diagnostics & Subsystem Health Monitoring
        </h1>
        <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-3xl">
          Complete vehicle diagnostics scanner. Monitor battery cells, electric traction motor, cooling loops, 12V auxiliary DC-DC converter, and onboard inverter.
        </p>
      </div>

      {/* Modern Vehicle Chassis Graphic Representation */}
      <div className="glass-panel p-6 sm:p-8 rounded-2xl relative overflow-hidden space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <h3 className="text-xs sm:text-sm font-bold text-white uppercase tracking-wider flex items-center space-x-2">
            <Layers className="w-4 h-4 text-emerald-400" />
            <span>Interactive Powertrain Architecture ({activeVehicle?.vehicle_name})</span>
          </h3>
          <span className="text-[11px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded">
            CAN-Bus Monitored
          </span>
        </div>

        {/* Chassis Diagram Visual */}
        <div className="relative py-6 flex flex-col items-center justify-center">
          
          <div className="w-full max-w-xl p-6 rounded-2xl bg-slate-950/70 border border-slate-800 relative shadow-2xl">
            
            {/* Front Axle / Motor */}
            <div className="flex items-center justify-between px-6 pb-4 border-b border-slate-800/80">
              <div className="flex items-center space-x-3">
                <div className="w-3.5 h-3.5 rounded-full bg-emerald-400 animate-pulse shadow-md shadow-emerald-400/50" />
                <div>
                  <span className="text-xs font-bold text-slate-200">Electric Traction Motor</span>
                  <span className="text-[10px] text-slate-500 block font-mono">56.2°C | 96/100 Optimal</span>
                </div>
              </div>
              <span className="text-[10px] font-mono bg-emerald-500/15 text-emerald-400 px-2 py-0.5 rounded">
                NORMAL
              </span>
            </div>

            {/* Inverter Cooling Loop */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800/80">
              <div className="flex items-center space-x-3">
                <div className="w-3.5 h-3.5 rounded-full bg-amber-400 animate-ping shadow-md shadow-amber-400/50" />
                <div>
                  <span className="text-xs font-bold text-slate-200">Cooling & Thermal Loop</span>
                  <span className="text-[10px] text-amber-400 block font-mono">P0A93-00 Flow Restriction Notice</span>
                </div>
              </div>
              <span className="text-[10px] font-mono bg-amber-500/15 text-amber-400 px-2 py-0.5 rounded">
                ATTENTION
              </span>
            </div>

            {/* High Voltage Battery Pack (Mid-Chassis) */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800/80 bg-emerald-500/5 rounded-xl my-2">
              <div className="flex items-center space-x-3">
                <div className="w-3.5 h-3.5 rounded-full bg-emerald-400 animate-pulse shadow-md shadow-emerald-400/50" />
                <div>
                  <span className="text-xs font-bold text-slate-200">High-Voltage Battery Pack</span>
                  <span className="text-[10px] text-slate-400 block font-mono">60 kWh NMC | 401.5V | Cell Delta 6.5 mV</span>
                </div>
              </div>
              <span className="text-[10px] font-mono bg-emerald-500/15 text-emerald-400 px-2 py-0.5 rounded">
                NORMAL (98/100)
              </span>
            </div>

            {/* Rear Charge Port & 12V Auxiliary System */}
            <div className="flex items-center justify-between px-6 pt-4">
              <div className="flex items-center space-x-3">
                <div className="w-3.5 h-3.5 rounded-full bg-cyan-400 shadow-md shadow-cyan-400/50" />
                <div>
                  <span className="text-xs font-bold text-slate-200">12V DC-DC & CCS2 Charge Inlet</span>
                  <span className="text-[10px] text-slate-500 block font-mono">13.8V Auxiliary | Ready</span>
                </div>
              </div>
              <span className="text-[10px] font-mono bg-cyan-500/15 text-cyan-400 px-2 py-0.5 rounded">
                NORMAL
              </span>
            </div>

          </div>

        </div>
      </div>

      {/* Diagnostic Scanner Component */}
      {activeVehicle && (
        <DiagnosticScanner vehicleId={activeVehicle.id} />
      )}

    </div>
  );
};
