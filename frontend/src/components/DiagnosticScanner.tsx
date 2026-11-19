import React, { useState } from 'react';
import { 
  ShieldCheck, 
  AlertTriangle, 
  AlertCircle, 
  CheckCircle2, 
  RefreshCw, 
  Cpu, 
  Battery, 
  Thermometer, 
  Zap, 
  Info,
  ChevronRight,
  FileText
} from 'lucide-react';
import { DiagnosticReport, ComponentHealthCard } from '../types';
import { api } from '../services/api';
import confetti from 'canvas-confetti';

interface DiagnosticScannerProps {
  vehicleId: number;
}

export const DiagnosticScanner: React.FC<DiagnosticScannerProps> = ({ vehicleId }) => {
  const [report, setReport] = useState<DiagnosticReport | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [scanProgress, setScanProgress] = useState(0);
  const [selectedComponent, setSelectedComponent] = useState<ComponentHealthCard | null>(null);
  const [showFullReportModal, setShowFullReportModal] = useState(false);

  const startScan = async () => {
    setIsScanning(true);
    setScanProgress(10);

    const interval = setInterval(() => {
      setScanProgress((prev) => {
        if (prev >= 90) {
          clearInterval(interval);
          return 90;
        }
        return prev + 20;
      });
    }, 250);

    try {
      const res = await api.scanVehicle(vehicleId);
      setTimeout(() => {
        clearInterval(interval);
        setScanProgress(100);
        setReport(res);
        setIsScanning(false);
        if (res.health_score > 85) {
          confetti({
            particleCount: 50,
            spread: 60,
            origin: { y: 0.7 }
          });
        }
      }, 1200);
    } catch (e) {
      console.error('Scan error:', e);
      setIsScanning(false);
      clearInterval(interval);
    }
  };

  const getSeverityBadge = (status: 'normal' | 'warning' | 'critical') => {
    switch (status) {
      case 'normal':
        return (
          <span className="flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
            <CheckCircle2 className="w-3 h-3" />
            <span>Normal</span>
          </span>
        );
      case 'warning':
        return (
          <span className="flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-500/10 text-amber-400 border border-amber-500/30">
            <AlertTriangle className="w-3 h-3" />
            <span>Warning</span>
          </span>
        );
      case 'critical':
        return (
          <span className="flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-rose-500/10 text-rose-400 border border-rose-500/30">
            <AlertCircle className="w-3 h-3" />
            <span>Critical</span>
          </span>
        );
    }
  };

  const getComponentIcon = (key: string) => {
    switch (key) {
      case 'battery':
        return <Battery className="w-5 h-5 text-emerald-400" />;
      case 'motor':
        return <Cpu className="w-5 h-5 text-cyan-400" />;
      case 'cooling':
        return <Thermometer className="w-5 h-5 text-amber-400" />;
      case 'charging':
        return <Zap className="w-5 h-5 text-blue-400" />;
      default:
        return <ShieldCheck className="w-5 h-5 text-slate-300" />;
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Scanner Hero Action Card */}
      <div className="glass-panel-glow rounded-2xl p-6 sm:p-8 relative overflow-hidden">
        
        {/* Animated Radar Scanning Line when active */}
        {isScanning && (
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-emerald-500/20 to-transparent animate-pulse pointer-events-none" />
        )}

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-xl">
            <div className="flex items-center space-x-2">
              <span className="px-2 py-0.5 rounded text-[11px] font-mono bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                OBD-II & AI ISOLATION FOREST ENGINE
              </span>
              <span className="text-xs text-slate-500">Autonomous Sensor Sweep</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-white">
              AI Diagnostic Health Scanner
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              Analyzes real-time powertrain telemetry, inverter thermal dissipation, high-voltage battery cell delta, and 12V auxiliary DC-DC stability.
            </p>
          </div>

          <div className="flex flex-col items-center md:items-end space-y-3">
            <button
              onClick={startScan}
              disabled={isScanning}
              className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-gradient-to-r from-emerald-500 to-cyan-500 text-slate-950 font-bold text-sm tracking-wide shadow-xl shadow-emerald-500/30 hover:shadow-emerald-500/50 hover:brightness-110 active:scale-95 transition flex items-center justify-center space-x-2.5 disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${isScanning ? 'animate-spin' : ''}`} />
              <span>{isScanning ? `SCANNING EV (${scanProgress}%)` : 'SCAN MY EV'}</span>
            </button>
            <span className="text-[11px] font-mono text-slate-400">
              {report ? `Last Scan: ${new Date(report.scan_timestamp).toLocaleTimeString()}` : 'System Ready'}
            </span>
          </div>
        </div>

        {/* Scan Progress Bar */}
        {isScanning && (
          <div className="mt-6 w-full bg-slate-900 rounded-full h-2 overflow-hidden border border-slate-800">
            <div
              className="bg-gradient-to-r from-emerald-500 to-cyan-400 h-full transition-all duration-300"
              style={{ width: `${scanProgress}%` }}
            />
          </div>
        )}
      </div>

      {/* Component Cards Grid */}
      {report && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-slate-200 tracking-wide uppercase">
              Subsystem Diagnostic Breakdown ({report.components.length} Monitored Domains)
            </h3>
            <button
              onClick={() => setShowFullReportModal(true)}
              className="flex items-center space-x-1.5 text-xs text-cyan-400 hover:text-cyan-300 font-medium"
            >
              <FileText className="w-3.5 h-3.5" />
              <span>GENERATE AI HEALTH REPORT</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {report.components.map((comp, idx) => (
              <div
                key={idx}
                onClick={() => setSelectedComponent(comp)}
                className={`glass-panel rounded-xl p-5 border transition cursor-pointer glass-card-hover ${
                  comp.status === 'warning'
                    ? 'border-amber-500/40 bg-amber-500/5'
                    : comp.status === 'critical'
                    ? 'border-rose-500/40 bg-rose-500/5'
                    : 'border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800">
                      {getComponentIcon(comp.sensor_key)}
                    </div>
                    <div>
                      <h4 className="text-sm font-semibold text-slate-100">{comp.name}</h4>
                      <p className="text-[11px] text-slate-400 font-mono mt-0.5">{comp.current_reading}</p>
                    </div>
                  </div>
                  {getSeverityBadge(comp.status)}
                </div>

                <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs">
                  <span className="text-slate-400">Health Index</span>
                  <div className="flex items-center space-x-1.5">
                    <span className="font-mono font-bold text-slate-200">{comp.score}/100</span>
                    <ChevronRight className="w-3.5 h-3.5 text-slate-500" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Component Detail Drawer / Modal */}
      {selectedComponent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
          <div className="glass-panel-glow rounded-2xl p-6 max-w-lg w-full border border-slate-700 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center space-x-3">
                <div className="p-2 rounded-lg bg-slate-900">
                  {getComponentIcon(selectedComponent.sensor_key)}
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-100">{selectedComponent.name}</h3>
                  <p className="text-xs text-slate-400">Deep Diagnostic Telemetry</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedComponent(null)}
                className="text-slate-400 hover:text-white text-sm font-bold p-1"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="bg-slate-900/80 p-3 rounded-xl space-y-1">
                <span className="text-slate-500 block uppercase font-mono text-[10px]">Current Reading</span>
                <span className="text-slate-200 font-mono font-medium">{selectedComponent.current_reading}</span>
              </div>

              <div className="bg-slate-900/80 p-3 rounded-xl space-y-1">
                <span className="text-slate-500 block uppercase font-mono text-[10px]">Expected Operating Range</span>
                <span className="text-slate-200 font-mono">{selectedComponent.expected_range}</span>
              </div>

              {selectedComponent.detected_problems.length > 0 && (
                <div className="bg-amber-500/10 border border-amber-500/30 p-3 rounded-xl space-y-1">
                  <span className="text-amber-400 font-bold block uppercase text-[10px]">Detected Diagnostic Codes</span>
                  {selectedComponent.detected_problems.map((prob, i) => (
                    <p key={i} className="text-amber-200 font-mono text-xs">{prob}</p>
                  ))}
                </div>
              )}

              <div className="bg-slate-900/80 p-3 rounded-xl space-y-1">
                <span className="text-cyan-400 font-bold block uppercase text-[10px]">AI Engine Explanation</span>
                <p className="text-slate-300 leading-relaxed">{selectedComponent.ai_explanation}</p>
              </div>

              <div className="bg-slate-900/80 p-3 rounded-xl space-y-1">
                <span className="text-emerald-400 font-bold block uppercase text-[10px]">Recommended Inspection</span>
                <p className="text-slate-300 leading-relaxed">{selectedComponent.recommended_action}</p>
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setSelectedComponent(null)}
                className="px-4 py-2 bg-slate-800 text-slate-200 text-xs font-semibold rounded-lg hover:bg-slate-700"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Full AI Health Report Modal */}
      {showFullReportModal && report && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="glass-panel-glow rounded-2xl p-6 sm:p-8 max-w-2xl w-full border border-emerald-500/40 space-y-5 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div>
                <h3 className="text-lg font-bold text-white">Full AI Vehicle Health Report</h3>
                <p className="text-xs text-slate-400 font-mono">Generated: {new Date(report.scan_timestamp).toLocaleString()}</p>
              </div>
              <button
                onClick={() => setShowFullReportModal(false)}
                className="text-slate-400 hover:text-white text-base font-bold"
              >
                ✕
              </button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
              <div className="glass-panel p-3 rounded-xl">
                <p className="text-[10px] text-slate-500 uppercase font-mono">Overall Status</p>
                <p className="text-sm font-bold text-emerald-400 mt-1">{report.overall_status}</p>
              </div>
              <div className="glass-panel p-3 rounded-xl">
                <p className="text-[10px] text-slate-500 uppercase font-mono">Health Score</p>
                <p className="text-sm font-bold text-cyan-400 mt-1">{report.health_score} / 100</p>
              </div>
              <div className="glass-panel p-3 rounded-xl">
                <p className="text-[10px] text-slate-500 uppercase font-mono">Active Warnings</p>
                <p className="text-sm font-bold text-amber-400 mt-1">{report.warnings_count}</p>
              </div>
              <div className="glass-panel p-3 rounded-xl">
                <p className="text-[10px] text-slate-500 uppercase font-mono">Critical Faults</p>
                <p className="text-sm font-bold text-rose-400 mt-1">{report.critical_count}</p>
              </div>
            </div>

            <div className="glass-panel p-4 rounded-xl space-y-2">
              <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider block">AI Condition Summary</span>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">{report.ai_summary}</p>
            </div>

            <div className="glass-panel p-4 rounded-xl space-y-2">
              <span className="text-xs font-bold text-cyan-400 uppercase tracking-wider block">Recommended Service Actions</span>
              <ul className="space-y-1.5 text-xs text-slate-300">
                {report.recommended_inspections.map((action, i) => (
                  <li key={i} className="flex items-start space-x-2">
                    <span className="text-emerald-400">•</span>
                    <span>{action}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="pt-2 flex items-center justify-between">
              <span className="text-[10px] text-slate-500 font-mono">Simulated Telemetry Signature: verified-ev360-model</span>
              <button
                onClick={() => {
                  window.print();
                }}
                className="px-4 py-2 rounded-lg bg-emerald-500 text-slate-950 font-bold text-xs hover:bg-emerald-400 transition"
              >
                Print / Export Report
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
