import React, { useMemo } from 'react';
import { useLocation } from 'react-router-dom';
import { Sparkles, Layers, ShieldCheck, BatteryCharging, Zap, MapPin, Navigation, Mic, FileText, User } from 'lucide-react';

interface ModuleThemeConfig {
  path: string;
  name: string;
  subname: string;
  badge: string;
  icon: React.ComponentType<{ className?: string }>;
  svgPath: string;
  glowColor: string;
  accentHex: string;
}

const MODULE_THEMES: Record<string, ModuleThemeConfig> = {
  '/dashboard': {
    path: '/dashboard',
    name: 'Executive Telemetry Cockpit',
    subname: 'Aerodynamic Wind-Tunnel Streamlines & Velocity Cluster HUD',
    badge: 'COCKPIT HUD HUD-MATRIX',
    icon: Zap,
    svgPath: '/backgrounds/bg-dashboard.svg',
    glowColor: 'rgba(0, 240, 255, 0.16)',
    accentHex: '#00f0ff'
  },
  '/battery': {
    path: '/battery',
    name: 'Lithium-Ion Molecular Matrix',
    subname: '4680 High-Voltage Prismatic Cell Arrays & Graphene Lattice',
    badge: 'LITHIUM CHEMISTRY MATRIX',
    icon: BatteryCharging,
    svgPath: '/backgrounds/bg-battery.svg',
    glowColor: 'rgba(0, 255, 157, 0.18)',
    accentHex: '#00ff9d'
  },
  '/energy': {
    path: '/energy',
    name: 'Megawatt Grid & Power Arbitrage',
    subname: '3-Phase AC/DC Power Harmonic Waveforms & Solar Pylon Catenary',
    badge: 'GRID WAVEFORM KINETIC',
    icon: Zap,
    svgPath: '/backgrounds/bg-energy.svg',
    glowColor: 'rgba(251, 191, 36, 0.18)',
    accentHex: '#fbbf24'
  },
  '/diagnostics': {
    path: '/diagnostics',
    name: 'Vehicle Chassis Hologram & X-Ray Scanner',
    subname: 'Skateboard Platform, Dual-Motor AWD & Concentric Radar Reticle',
    badge: 'POWERTRAIN BLUEPRINT SCAN',
    icon: ShieldCheck,
    svgPath: '/backgrounds/bg-diagnostics.svg',
    glowColor: 'rgba(0, 240, 255, 0.20)',
    accentHex: '#00f0ff'
  },
  '/stations': {
    path: '/stations',
    name: 'Global Charging Constellation',
    subname: 'Orbital GPS Satellite Telemetry & Interstate Corridor Beacons',
    badge: 'ORBITAL CHARGE NETWORK',
    icon: MapPin,
    svgPath: '/backgrounds/bg-stations.svg',
    glowColor: 'rgba(0, 255, 157, 0.16)',
    accentHex: '#00ff9d'
  },
  '/navigation': {
    path: '/navigation',
    name: 'Autonomous Highway & Waypoint Ribbon',
    subname: 'Curving High-Speed Expressway, Topographic Contours & Compass HUD',
    badge: 'EXPRESSWAY TOPOLOGY RIBBON',
    icon: Navigation,
    svgPath: '/backgrounds/bg-navigation.svg',
    glowColor: 'rgba(0, 240, 255, 0.18)',
    accentHex: '#00f0ff'
  },
  '/smartvoice': {
    path: '/smartvoice',
    name: 'Neural Acoustic Particle Sphere',
    subname: 'Siri-Style Conversational Waveforms & Resonance Harmonics',
    badge: 'NEURAL ACOUSTIC SPHERE',
    icon: Mic,
    svgPath: '/backgrounds/bg-smartvoice.svg',
    glowColor: 'rgba(192, 132, 252, 0.22)',
    accentHex: '#c084fc'
  },
  '/reports': {
    path: '/reports',
    name: 'Aerospace Technical Drafting Grid',
    subname: 'ISO Telemetry Matrix, Data Distribution & Fleet Compliance Waterfall',
    badge: 'ISO TECHNICAL DRAFTING',
    icon: FileText,
    svgPath: '/backgrounds/bg-reports.svg',
    glowColor: 'rgba(0, 240, 255, 0.14)',
    accentHex: '#00f0ff'
  },
  '/vehicles/register': {
    path: '/vehicles/register',
    name: 'Hypercar Design Studio & Wind Tunnel',
    subname: 'Aerodynamic Fastback Silhouette, Studio Sweep Lighting & Wheel Rake',
    badge: 'AERO CONCEPT STUDIO',
    icon: User,
    svgPath: '/backgrounds/bg-profile.svg',
    glowColor: 'rgba(139, 92, 246, 0.18)',
    accentHex: '#8b5cf6'
  },
  '/profile': {
    path: '/profile',
    name: 'Hypercar Design Studio & Identity',
    subname: 'Aerodynamic Fastback Silhouette, Studio Sweep Lighting & Wheel Rake',
    badge: 'AERO CONCEPT STUDIO',
    icon: User,
    svgPath: '/backgrounds/bg-profile.svg',
    glowColor: 'rgba(139, 92, 246, 0.18)',
    accentHex: '#8b5cf6'
  }
};

export const ModuleBackground: React.FC = () => {
  const location = useLocation();

  // Find configuration for current route or default to dashboard
  const currentTheme = useMemo(() => {
    return MODULE_THEMES[location.pathname] || MODULE_THEMES['/dashboard'];
  }, [location.pathname]);

  const IconComponent = currentTheme.icon;

  return (
    <>
      {/* 1. Full-Screen Fixed Dynamic Vector Layer */}
      <div 
        className="fixed inset-0 pointer-events-none z-0 overflow-hidden transition-all duration-700 ease-in-out"
        aria-hidden="true"
      >
        {/* Active Module SVG Vector Background with Crossfade Transition */}
        <div 
          key={currentTheme.path}
          className="absolute inset-0 w-full h-full bg-no-repeat bg-center bg-cover opacity-60 mix-blend-screen transition-opacity duration-1000 animate-fade-in"
          style={{
            backgroundImage: `url(${currentTheme.svgPath})`,
            filter: `drop-shadow(0 0 20px ${currentTheme.glowColor})`
          }}
        />

        {/* Dynamic Vignette & Depth Mask so charts and text remain 100% readable */}
        <div 
          className="absolute inset-0 bg-radial-vignette opacity-80"
          style={{
            background: `radial-gradient(circle at 50% 40%, transparent 20%, rgba(5, 8, 20, 0.45) 80%, rgba(5, 8, 20, 0.85) 100%)`
          }}
        />
      </div>

      {/* 2. Floating Module Ambient Theme HUD Pill Badge (Bottom-Left) */}
      <div className="fixed bottom-5 left-5 z-30 hidden lg:flex items-center space-x-2.5 px-3 py-1.5 rounded-full glass-panel border border-slate-700/60 shadow-xl backdrop-blur-xl group hover:border-slate-500 transition-all cursor-default">
        <div 
          className="w-2 h-2 rounded-full animate-ping"
          style={{ backgroundColor: currentTheme.accentHex }}
        />
        <div className="flex items-center space-x-1.5 text-[11px] font-mono">
          <IconComponent className="w-3.5 h-3.5 text-slate-300" />
          <span className="text-slate-400">MODULE AURA:</span>
          <span 
            className="font-bold tracking-wide uppercase transition-colors"
            style={{ color: currentTheme.accentHex }}
          >
            {currentTheme.name}
          </span>
        </div>

        {/* Hover Tooltip with module technical subtitle */}
        <div className="absolute bottom-full left-0 mb-2 w-72 glass-panel p-2.5 rounded-xl border border-slate-700 shadow-2xl opacity-0 group-hover:opacity-100 pointer-events-none transition-all duration-200 text-left">
          <div className="text-[10px] font-mono text-emerald-400 font-bold uppercase tracking-wider mb-1">
            {currentTheme.badge}
          </div>
          <div className="text-xs text-slate-200 font-medium leading-relaxed">
            {currentTheme.subname}
          </div>
        </div>
      </div>
    </>
  );
};
