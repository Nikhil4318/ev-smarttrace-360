import React, { useState } from 'react';
import { 
  Navigation, 
  MapPin, 
  Clock, 
  BatteryCharging, 
  Zap, 
  ArrowRight, 
  ShieldCheck, 
  CheckCircle2, 
  Layers,
  Sparkles,
  Compass,
  AlertCircle
} from 'lucide-react';
import { InteractiveMap } from '../components/InteractiveMap';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { RouteOptimizeResult, RouteOption } from '../types';

export const SmartNavigationPage: React.FC = () => {
  const { activeVehicle } = useAuth();
  const [origin, setOrigin] = useState('San Francisco, CA');
  const [destination, setDestination] = useState('San Jose, CA');
  const [batteryPct, setBatteryPct] = useState(activeVehicle?.current_battery_pct || 70);
  const [desiredArrivalPct, setDesiredArrivalPct] = useState(15);

  const [routeResult, setRouteResult] = useState<RouteOptimizeResult | null>(null);
  const [selectedRouteId, setSelectedRouteId] = useState<string>('route_balanced');
  const [isLoading, setIsLoading] = useState(false);

  const handleOptimize = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!activeVehicle) return;
    setIsLoading(true);
    try {
      const data = await api.optimizeRoute(
        activeVehicle.id,
        origin,
        destination,
        batteryPct,
        desiredArrivalPct
      );
      setRouteResult(data);
      setSelectedRouteId(data.recommended_route_id);
    } catch (err) {
      console.error('Route optimization error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Run on mount
  React.useEffect(() => {
    handleOptimize();
  }, [activeVehicle]);

  const activeRoute = routeResult?.routes.find((r) => r.route_id === selectedRouteId) || routeResult?.routes[0];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      
      {/* Header */}
      <div>
        <div className="flex items-center space-x-2">
          <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            MODULE FIVE: AI SMART ROUTE OPTIMIZATION
          </span>
          <span className="text-xs text-slate-400">Multi-Path Energy & Stop Planner</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white mt-1">
          Intelligent EV Range & Charging Stop Navigator
        </h1>
        <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-3xl">
          Multi-variable itinerary planner factoring aerodynamic resistance, regenerative braking, thermal load, and automated charger detour insertion.
        </p>
      </div>

      {/* Origin & Destination Configurator Panel */}
      <form onSubmit={handleOptimize} className="glass-panel p-5 rounded-2xl space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          
          <div className="space-y-1">
            <label className="text-xs font-medium text-slate-300 flex items-center space-x-1.5">
              <MapPin className="w-3.5 h-3.5 text-cyan-400" />
              <span>Starting Corridor</span>
            </label>
            <input
              type="text"
              required
              value={origin}
              onChange={(e) => setOrigin(e.target.value)}
              className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-cyan-500/60"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-medium text-slate-300 flex items-center space-x-1.5">
              <Navigation className="w-3.5 h-3.5 text-emerald-400" />
              <span>Destination City</span>
            </label>
            <input
              type="text"
              required
              value={destination}
              onChange={(e) => setDestination(e.target.value)}
              className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-emerald-500/60"
            />
          </div>

          <div className="space-y-1">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-300">Departure Battery</span>
              <span className="font-mono text-emerald-400 font-bold">{batteryPct}%</span>
            </div>
            <input
              type="range"
              min="10"
              max="100"
              value={batteryPct}
              onChange={(e) => setBatteryPct(Number(e.target.value))}
              className="w-full accent-emerald-400 cursor-pointer pt-2"
            />
          </div>

          <div className="space-y-1">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-300">Desired Arrival Safety Buffer</span>
              <span className="font-mono text-cyan-400 font-bold">{desiredArrivalPct}%</span>
            </div>
            <input
              type="range"
              min="5"
              max="35"
              value={desiredArrivalPct}
              onChange={(e) => setDesiredArrivalPct(Number(e.target.value))}
              className="w-full accent-cyan-400 cursor-pointer pt-2"
            />
          </div>

        </div>

        <div className="flex justify-end pt-1">
          <button
            type="submit"
            disabled={isLoading}
            className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-cyan-500 text-slate-950 font-bold text-xs tracking-wide shadow-lg shadow-emerald-500/20 hover:brightness-110 active:scale-95 transition flex items-center space-x-2 disabled:opacity-50"
          >
            <span>{isLoading ? 'Computing Itineraries...' : 'Optimize 3 Route Alternatives'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </form>

      {/* 3 Route Options Selection Cards */}
      {routeResult && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {routeResult.routes.map((route) => {
            const isSelected = selectedRouteId === route.route_id;
            return (
              <div
                key={route.route_id}
                onClick={() => setSelectedRouteId(route.route_id)}
                className={`glass-panel p-5 rounded-2xl border transition cursor-pointer glass-card-hover relative overflow-hidden ${
                  isSelected
                    ? 'border-emerald-500 bg-emerald-500/10 shadow-xl shadow-emerald-500/10'
                    : 'border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="flex items-start justify-between">
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-slate-900 text-slate-300 border border-slate-800">
                    {route.badge}
                  </span>
                  {isSelected && (
                    <span className="text-[10px] font-mono text-emerald-400 font-bold flex items-center space-x-1">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>SELECTED</span>
                    </span>
                  )}
                </div>

                <h3 className="text-base font-bold text-white mt-2">{route.title}</h3>
                <p className="text-xs text-slate-400 mt-1 line-clamp-2">{route.summary}</p>

                <div className="mt-4 pt-3 border-t border-slate-800 grid grid-cols-2 gap-2 text-xs font-mono">
                  <div>
                    <span className="text-[10px] text-slate-500 uppercase block">Distance</span>
                    <span className="text-slate-200 font-bold">{route.distance_km} km</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 uppercase block">Total Time</span>
                    <span className="text-cyan-400 font-bold">{route.total_time_minutes} mins</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 uppercase block">Est. Energy</span>
                    <span className="text-emerald-400 font-bold">{route.estimated_energy_kwh} kWh</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 uppercase block">Arrival Battery</span>
                    <span className="text-amber-400 font-bold">{route.arrival_battery_pct}%</span>
                  </div>
                </div>

                {route.charging_stops_count > 0 && (
                  <div className="mt-3 p-2 rounded-lg bg-cyan-500/10 border border-cyan-500/20 text-[11px] text-cyan-300 flex items-center space-x-1.5">
                    <BatteryCharging className="w-3.5 h-3.5" />
                    <span>Includes 1 Fast Charging Stop ({route.charging_time_minutes} mins)</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Interactive Map Visualizer of Selected Route */}
      <div className="h-[460px] w-full">
        <InteractiveMap
          routeWaypoints={activeRoute?.waypoints || []}
          center={activeRoute?.waypoints ? (activeRoute.waypoints[0] as [number, number]) : [37.7749, -122.4194]}
          zoom={10}
        />
      </div>

    </div>
  );
};
