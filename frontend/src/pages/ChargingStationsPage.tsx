import React, { useState, useEffect } from 'react';
import { 
  MapPin, 
  Search, 
  Filter, 
  Zap, 
  Navigation, 
  CheckCircle, 
  Clock, 
  DollarSign, 
  Compass,
  ArrowRight,
  ExternalLink
} from 'lucide-react';
import { InteractiveMap } from '../components/InteractiveMap';
import { api } from '../services/api';
import { ChargingStation } from '../types';

export const ChargingStationsPage: React.FC = () => {
  const [stations, setStations] = useState<ChargingStation[]>([]);
  const [selectedStation, setSelectedStation] = useState<ChargingStation | null>(null);
  const [searchCity, setSearchCity] = useState('');
  const [connectorFilter, setConnectorFilter] = useState('All');
  const [powerFilter, setPowerFilter] = useState<number | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(false);

  const fetchStations = async () => {
    setIsLoading(true);
    try {
      const data = await api.getStations(
        connectorFilter !== 'All' ? connectorFilter : undefined,
        powerFilter
      );
      setStations(data);
      if (data.length > 0 && !selectedStation) {
        setSelectedStation(data[0]);
      }
    } catch (e) {
      console.error('Error fetching stations:', e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchStations();
  }, [connectorFilter, powerFilter]);

  const filteredStations = stations.filter((s) => {
    if (!searchCity) return true;
    return (
      s.station_name.toLowerCase().includes(searchCity.toLowerCase()) ||
      s.address.toLowerCase().includes(searchCity.toLowerCase()) ||
      s.operator.toLowerCase().includes(searchCity.toLowerCase())
    );
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      
      {/* Page Header */}
      <div>
        <div className="flex items-center space-x-2">
          <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-blue-500/10 text-blue-400 border border-blue-500/20">
            MODULE FOUR: NEARBY CHARGING DISCOVERY
          </span>
          <span className="text-xs text-slate-400">Open Charge Map & Geolocation Engine</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white mt-1">
          Interactive EV Fast-Charging Station Radar
        </h1>
        <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-3xl">
          Discover verified CCS2, Type 2, and Ultra-Fast DC charging facilities. Filter by charging speed, real-time stall occupancy, and pricing.
        </p>
      </div>

      {/* Filter and Search Bar */}
      <div className="glass-panel p-4 rounded-2xl flex flex-col md:flex-row items-center justify-between gap-4">
        
        {/* Search input */}
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
          <input
            type="text"
            value={searchCity}
            onChange={(e) => setSearchCity(e.target.value)}
            placeholder="Search by city, operator, or street..."
            className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-9 pr-4 py-2 text-xs text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-cyan-500/60"
          />
        </div>

        {/* Filter dropdowns */}
        <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto">
          
          <div className="flex items-center space-x-1.5 bg-slate-900 border border-slate-800 rounded-xl px-3 py-1.5 text-xs">
            <span className="text-slate-400">Connector:</span>
            <select
              value={connectorFilter}
              onChange={(e) => setConnectorFilter(e.target.value)}
              className="bg-transparent text-emerald-400 font-semibold focus:outline-none"
            >
              <option value="All">All Plugs</option>
              <option value="CCS2">CCS2 (DC Fast)</option>
              <option value="Type 2">Type 2 (AC)</option>
              <option value="CHAdeMO">CHAdeMO</option>
              <option value="NACS">NACS / Tesla</option>
            </select>
          </div>

          <div className="flex items-center space-x-1.5 bg-slate-900 border border-slate-800 rounded-xl px-3 py-1.5 text-xs">
            <span className="text-slate-400">Min Power:</span>
            <select
              value={powerFilter || ''}
              onChange={(e) => setPowerFilter(e.target.value ? Number(e.target.value) : undefined)}
              className="bg-transparent text-cyan-400 font-semibold focus:outline-none"
            >
              <option value="">Any Speed</option>
              <option value="50">50+ kW (Fast)</option>
              <option value="100">100+ kW (Rapid)</option>
              <option value="150">150+ kW (Ultra-Fast)</option>
              <option value="250">250+ kW (Hyper)</option>
            </select>
          </div>

          <button
            onClick={() => {
              setConnectorFilter('All');
              setPowerFilter(undefined);
              setSearchCity('');
            }}
            className="text-xs text-slate-400 hover:text-slate-200 px-2 py-1"
          >
            Reset
          </button>
        </div>

      </div>

      {/* Map + Station List Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 min-h-[550px]">
        
        {/* Station List (5 columns) */}
        <div className="lg:col-span-5 space-y-3.5 max-h-[600px] overflow-y-auto pr-1">
          <div className="flex items-center justify-between pb-1">
            <span className="text-xs font-semibold text-slate-300 uppercase tracking-wider font-mono">
              Found {filteredStations.length} Verified Stations
            </span>
            <span className="text-[11px] text-slate-500 font-mono">Sorted by proximity</span>
          </div>

          {filteredStations.map((station) => {
            const isSelected = selectedStation?.id === station.id;
            return (
              <div
                key={station.id}
                onClick={() => setSelectedStation(station)}
                className={`glass-panel p-4 rounded-xl border transition cursor-pointer glass-card-hover ${
                  isSelected
                    ? 'border-emerald-500 bg-emerald-500/10 shadow-lg shadow-emerald-500/10'
                    : 'border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-sm font-bold text-slate-100">{station.station_name}</h3>
                    <p className="text-xs text-slate-400 mt-0.5">{station.address}</p>
                  </div>
                  <span className="text-xs font-mono font-bold text-cyan-400 bg-cyan-500/10 px-2 py-0.5 rounded border border-cyan-500/20">
                    {station.distance_km} km
                  </span>
                </div>

                <div className="mt-3 pt-3 border-t border-slate-800/80 grid grid-cols-3 gap-2 text-xs font-mono">
                  <div>
                    <span className="text-[10px] text-slate-500 block uppercase">Power</span>
                    <span className="text-emerald-400 font-bold">{station.charging_power} kW</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 block uppercase">Plugs</span>
                    <span className="text-slate-200 truncate block">{station.connector_type}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 block uppercase">Tariff</span>
                    <span className="text-amber-400 font-bold">${station.pricing_per_kwh}/kWh</span>
                  </div>
                </div>

                <div className="mt-2.5 flex items-center justify-between text-[11px]">
                  <span className="text-slate-400">
                    Status: <span className="text-slate-200 font-medium">{station.availability_status}</span>
                  </span>
                  <span className="text-[10px] text-slate-500">{station.operator}</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Interactive Leaflet Map (7 columns) */}
        <div className="lg:col-span-7 h-[500px] lg:h-auto min-h-[450px]">
          <InteractiveMap
            stations={filteredStations}
            center={selectedStation ? [selectedStation.latitude, selectedStation.longitude] : [37.7749, -122.4194]}
            zoom={selectedStation ? 14 : 12}
            onSelectStation={(s) => setSelectedStation(s)}
          />
        </div>

      </div>

    </div>
  );
};
