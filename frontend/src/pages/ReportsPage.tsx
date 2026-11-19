import React, { useState, useEffect } from 'react';
import { 
  FileText, 
  Download, 
  Printer, 
  TrendingUp, 
  DollarSign, 
  Zap, 
  CheckCircle2, 
  Calendar,
  Leaf
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';

export const ReportsPage: React.FC = () => {
  const { activeVehicle } = useAuth();
  const [report, setReport] = useState<any>(null);

  useEffect(() => {
    if (activeVehicle) {
      api.getMonthlyReport(activeVehicle.id).then(setReport).catch(console.error);
    }
  }, [activeVehicle]);

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadCSV = () => {
    if (!report) return;
    let csv = 'Week,Distance_km,Energy_kWh,Cost_USD,Efficiency_kWh_km\n';
    report.weekly_breakdown.forEach((w: any) => {
      csv += `${w.week},${w.distance_km},${w.kwh},${w.cost},${w.efficiency}\n`;
    });
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `EV_SmartTrace_Report_${report.month.replace(' ', '_')}.csv`;
    a.click();
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              AUDIT & ANALYTICS REPORTING
            </span>
            <span className="text-xs text-slate-400">Monthly Operational Audit</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white mt-1">
            EV Intelligence & Efficiency Reports
          </h1>
        </div>

        <div className="flex items-center space-x-2.5">
          <button
            onClick={handleDownloadCSV}
            className="flex items-center space-x-1.5 px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs font-semibold text-slate-300 hover:text-white transition"
          >
            <Download className="w-3.5 h-3.5 text-cyan-400" />
            <span>Download CSV</span>
          </button>
          <button
            onClick={handlePrint}
            className="flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-cyan-500 text-slate-950 font-bold text-xs shadow-md shadow-emerald-500/20 hover:brightness-110 transition"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print Report</span>
          </button>
        </div>
      </div>

      {/* Report Summary Card */}
      <div className="glass-panel p-6 sm:p-8 rounded-2xl space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-4">
          <div>
            <h2 className="text-base font-bold text-white uppercase tracking-wider">
              {report?.month || 'Current Month'} Operational Statement
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Vehicle: {activeVehicle?.vehicle_name} ({activeVehicle?.vehicle_identifier})
            </p>
          </div>
          <div className="flex items-center space-x-2 text-xs font-mono text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-lg border border-emerald-500/20">
            <CheckCircle2 className="w-4 h-4" />
            <span>Audit Validated</span>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800">
            <span className="text-[10px] text-slate-500 uppercase font-mono block">Distance Driven</span>
            <span className="text-2xl font-bold font-mono text-white mt-1 block">
              {report?.total_distance_km} km
            </span>
            <span className="text-[11px] text-slate-400">{report?.total_trips} Trips</span>
          </div>

          <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800">
            <span className="text-[10px] text-slate-500 uppercase font-mono block">Energy Consumed</span>
            <span className="text-2xl font-bold font-mono text-emerald-400 mt-1 block">
              {report?.total_energy_kwh} kWh
            </span>
            <span className="text-[11px] text-slate-400">Avg {report?.avg_efficiency_kwh_km} kWh/km</span>
          </div>

          <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800">
            <span className="text-[10px] text-slate-500 uppercase font-mono block">Total Energy Cost</span>
            <span className="text-2xl font-bold font-mono text-cyan-400 mt-1 block">
              ${report?.total_cost_usd}
            </span>
            <span className="text-[11px] text-slate-400">$0.038 / km</span>
          </div>

          <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800">
            <span className="text-[10px] text-slate-500 uppercase font-mono block">CO₂ Abated</span>
            <span className="text-2xl font-bold font-mono text-emerald-400 mt-1 block flex items-center space-x-1">
              <Leaf className="w-5 h-5 text-emerald-400 inline" />
              <span>{report?.co2_saved_kg} kg</span>
            </span>
            <span className="text-[11px] text-slate-400">Green Impact</span>
          </div>
        </div>

        {/* Detailed Weekly Table */}
        <div className="space-y-3 pt-4">
          <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider font-mono">
            Weekly Performance Audit Breakdown
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono">
              <thead className="border-b border-slate-800 text-slate-500 uppercase text-[10px]">
                <tr>
                  <th className="py-2.5 px-3">Billing Segment</th>
                  <th className="py-2.5 px-3">Distance</th>
                  <th className="py-2.5 px-3">Net Energy</th>
                  <th className="py-2.5 px-3">Efficiency</th>
                  <th className="py-2.5 px-3">Electricity Cost</th>
                  <th className="py-2.5 px-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {report?.weekly_breakdown.map((row: any, i: number) => (
                  <tr key={i} className="hover:bg-slate-900/40">
                    <td className="py-3 px-3 text-slate-200 font-bold">{row.week}</td>
                    <td className="py-3 px-3 text-cyan-400">{row.distance_km} km</td>
                    <td className="py-3 px-3 text-emerald-400">{row.kwh} kWh</td>
                    <td className="py-3 px-3 text-slate-300">{row.efficiency} kWh/km</td>
                    <td className="py-3 px-3 text-white font-bold">${row.cost.toFixed(2)}</td>
                    <td className="py-3 px-3">
                      <span className="px-2 py-0.5 rounded text-[10px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                        Verified
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

      </div>

    </div>
  );
};
