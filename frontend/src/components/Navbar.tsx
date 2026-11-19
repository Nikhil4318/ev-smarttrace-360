import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  Zap, 
  Activity, 
  BatteryCharging, 
  Navigation, 
  Mic, 
  FileText, 
  MapPin, 
  Bell, 
  User as UserIcon, 
  LogOut, 
  ChevronDown, 
  Sliders, 
  ShieldAlert,
  Car,
  CheckCircle
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { ThemeSelector } from './ThemeSelector';

interface NavbarProps {
  onOpenVoice: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onOpenVoice }) => {
  const { user, vehicles, activeVehicle, setActiveVehicle, isDemoMode, toggleDemoMode, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [showVehicleMenu, setShowVehicleMenu] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showNotifMenu, setShowNotifMenu] = useState(false);

  const navLinks = [
    { name: 'Dashboard', path: '/dashboard', icon: Zap },
    { name: 'Battery Intelligence', path: '/battery', icon: BatteryCharging },
    { name: 'Energy Analytics', path: '/energy', icon: Activity },
    { name: 'Vehicle Diagnostics', path: '/diagnostics', icon: ShieldAlert },
    { name: 'Charging Stations', path: '/stations', icon: MapPin },
    { name: 'Smart Navigation', path: '/navigation', icon: Navigation },
    { name: 'SmartVoice', path: '/smartvoice', icon: Mic },
    { name: 'Reports', path: '/reports', icon: FileText },
  ];

  return (
    <header className="sticky top-0 z-40 w-full glass-panel border-b border-slate-800/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Logo & Tagline */}
          <Link to="/dashboard" className="flex items-center space-x-3 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-500 to-cyan-400 p-[1.5px] shadow-lg shadow-emerald-500/20 group-hover:shadow-emerald-500/40 transition">
              <div className="w-full h-full bg-[#080c14] rounded-xl flex items-center justify-center">
                <Zap className="w-5 h-5 text-emerald-400 group-hover:scale-110 transition" />
              </div>
            </div>
            <div>
              <span className="text-lg font-bold bg-gradient-to-r from-emerald-400 via-cyan-400 to-blue-400 bg-clip-text text-transparent">
                EV SmartTrace 360
              </span>
              <p className="text-[10px] text-slate-400 tracking-wider hidden sm:block uppercase font-mono">
                Drive Smart. Charge Smart. Travel Safe.
              </p>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden xl:flex items-center space-x-1">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const isActive = location.pathname === link.path;
              return (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition ${
                    isActive
                      ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-emerald-400' : 'text-slate-400'}`} />
                  <span>{link.name}</span>
                </Link>
              );
            })}
          </nav>

          {/* Right Actions & Controls */}
          <div className="flex items-center space-x-2 sm:space-x-3">
            
            {/* Demo Mode Toggle */}
            <button
              onClick={toggleDemoMode}
              title="Click to toggle Demo Mode vs Live Sensor Mode"
              className={`hidden md:flex items-center space-x-1.5 px-2.5 py-1 rounded-full text-[11px] font-mono font-medium border transition ${
                isDemoMode
                  ? 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30 shadow-sm shadow-cyan-500/20'
                  : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
              }`}
            >
              <span className={`w-2 h-2 rounded-full animate-ping ${isDemoMode ? 'bg-cyan-400' : 'bg-emerald-400'}`} />
              <span>{isDemoMode ? 'DEMO MODE: ON' : 'LIVE TELEMETRY'}</span>
            </button>

            {/* Theme Selector */}
            <ThemeSelector />

            {/* SmartVoice Cockpit Trigger Button */}
            <button
              onClick={onOpenVoice}
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-gradient-to-r from-emerald-500 to-cyan-500 text-slate-950 font-bold text-xs shadow-md shadow-emerald-500/25 hover:shadow-emerald-500/50 hover:brightness-110 active:scale-95 transition"
            >
              <Mic className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">SmartVoice</span>
            </button>

            {/* Vehicle Selector */}
            <div className="relative">
              <button
                onClick={() => setShowVehicleMenu(!showVehicleMenu)}
                className="flex items-center space-x-1.5 px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-700/80 text-xs text-slate-300 hover:border-slate-600 transition"
              >
                <Car className="w-3.5 h-3.5 text-cyan-400" />
                <span className="max-w-[100px] truncate font-medium">
                  {activeVehicle ? activeVehicle.vehicle_name : 'Select EV'}
                </span>
                <ChevronDown className="w-3 h-3 text-slate-400" />
              </button>

              {showVehicleMenu && (
                <div className="absolute right-0 mt-2 w-64 glass-panel rounded-xl shadow-2xl p-2 border border-slate-700/80 z-50">
                  <div className="px-2 py-1.5 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                    My Registered EVs
                  </div>
                  {vehicles.map((v) => (
                    <button
                      key={v.id}
                      onClick={() => {
                        setActiveVehicle(v);
                        setShowVehicleMenu(false);
                      }}
                      className={`w-full text-left px-3 py-2 rounded-lg text-xs flex items-center justify-between transition ${
                        activeVehicle?.id === v.id
                          ? 'bg-emerald-500/10 text-emerald-400 font-semibold'
                          : 'text-slate-300 hover:bg-slate-800/80'
                      }`}
                    >
                      <div>
                        <p>{v.vehicle_name}</p>
                        <p className="text-[10px] text-slate-500">{v.manufacturer} {v.model} ({v.battery_capacity} kWh)</p>
                      </div>
                      {activeVehicle?.id === v.id && <CheckCircle className="w-4 h-4 text-emerald-400" />}
                    </button>
                  ))}
                  <div className="pt-2 border-t border-slate-800 mt-1">
                    <Link
                      to="/vehicles/register"
                      onClick={() => setShowVehicleMenu(false)}
                      className="block text-center py-1.5 text-xs text-cyan-400 hover:text-cyan-300 font-medium"
                    >
                      + Register New Vehicle
                    </Link>
                  </div>
                </div>
              )}
            </div>

            {/* Notifications */}
            <div className="relative">
              <button
                onClick={() => setShowNotifMenu(!showNotifMenu)}
                className="p-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 hover:text-white relative"
              >
                <Bell className="w-4 h-4" />
                <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-rose-500" />
              </button>

              {showNotifMenu && (
                <div className="absolute right-0 mt-2 w-80 glass-panel rounded-xl shadow-2xl p-3 border border-slate-700/80 z-50">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                    <span className="text-xs font-semibold text-slate-200">Alerts & Warnings</span>
                    <span className="text-[10px] text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded">2 Active</span>
                  </div>
                  <div className="space-y-2 mt-2 max-h-60 overflow-y-auto">
                    <div className="p-2 rounded-lg bg-amber-500/10 border border-amber-500/20 text-xs">
                      <p className="font-semibold text-amber-400">Inverter Cooling Alert</p>
                      <p className="text-[11px] text-slate-300 mt-0.5">Inverter thermal reading reached 68.4°C during peak acceleration.</p>
                      <span className="text-[9px] text-slate-500">12 mins ago</span>
                    </div>
                    <div className="p-2 rounded-lg bg-cyan-500/10 border border-cyan-500/20 text-xs">
                      <p className="font-semibold text-cyan-400">Off-Peak Charging Window</p>
                      <p className="text-[11px] text-slate-300 mt-0.5">Off-peak rate $0.18/kWh starts at 11:00 PM tonight.</p>
                      <span className="text-[9px] text-slate-500">2 hours ago</span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Profile Dropdown */}
            <div className="relative">
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="w-8 h-8 rounded-full bg-gradient-to-tr from-cyan-500 to-emerald-500 p-[1.5px] hover:scale-105 transition"
              >
                <div className="w-full h-full bg-slate-900 rounded-full flex items-center justify-center text-xs font-bold text-slate-200">
                  {user ? user.name.charAt(0) : 'A'}
                </div>
              </button>

              {showUserMenu && (
                <div className="absolute right-0 mt-2 w-52 glass-panel rounded-xl shadow-2xl p-2 border border-slate-700/80 z-50">
                  <div className="px-3 py-2 border-b border-slate-800">
                    <p className="text-xs font-semibold text-slate-200">{user?.name || 'Driver'}</p>
                    <p className="text-[11px] text-slate-500 truncate">{user?.email || 'demo@evsmarttrace.com'}</p>
                  </div>
                  <div className="py-1">
                    <Link
                      to="/profile"
                      onClick={() => setShowUserMenu(false)}
                      className="flex items-center space-x-2 px-3 py-2 text-xs text-slate-300 hover:bg-slate-800 rounded-lg"
                    >
                      <UserIcon className="w-3.5 h-3.5 text-cyan-400" />
                      <span>User Profile</span>
                    </Link>
                    <Link
                      to="/vehicles/register"
                      onClick={() => setShowUserMenu(false)}
                      className="flex items-center space-x-2 px-3 py-2 text-xs text-slate-300 hover:bg-slate-800 rounded-lg"
                    >
                      <Car className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Add New Vehicle</span>
                    </Link>
                  </div>
                  <div className="pt-1 border-t border-slate-800">
                    <button
                      onClick={() => {
                        logout();
                        setShowUserMenu(false);
                        navigate('/login');
                      }}
                      className="w-full flex items-center space-x-2 px-3 py-2 text-xs text-rose-400 hover:bg-rose-500/10 rounded-lg"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                </div>
              )}
            </div>

          </div>

        </div>
      </div>

      {/* Mobile Sub-Navigation Bar */}
      <div className="xl:hidden flex overflow-x-auto py-2 px-4 space-x-1.5 border-t border-slate-800/80 bg-slate-950/60 no-scrollbar">
        {navLinks.map((link) => {
          const Icon = link.icon;
          const isActive = location.pathname === link.path;
          return (
            <Link
              key={link.path}
              to={link.path}
              className={`flex-shrink-0 flex items-center space-x-1 px-2.5 py-1 rounded-md text-[11px] font-medium transition ${
                isActive
                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Icon className="w-3 h-3" />
              <span>{link.name}</span>
            </Link>
          );
        })}
      </div>
    </header>
  );
};
