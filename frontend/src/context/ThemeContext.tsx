import React, { createContext, useContext, useState, useEffect } from 'react';

export type ThemeId = 'monochrome' | 'ceramic' | 'aurora' | 'cyber' | 'solaris' | 'quantum';

export interface ThemeMeta {
  id: ThemeId;
  name: string;
  tagline: string;
  colors: string[]; // 3 hex values for preview swatch
  accent: string;
  description: string;
}

export const THEMES: ThemeMeta[] = [
  {
    id: 'monochrome',
    name: 'Monochrome Noir',
    tagline: 'Pure Black & White Minimalist Cockpit',
    colors: ['#ffffff', '#94a3b8', '#000000'],
    accent: '#ffffff',
    description: 'High-contrast pure obsidian black, stark white luminescence, titanium silver accents, and zero color distractions.'
  },
  {
    id: 'ceramic',
    name: 'Ceramic Aero White',
    tagline: 'Lucid Minimalist Pearl & Pure Glacier EV',
    colors: ['#0284c7', '#059669', '#f8fafc'],
    accent: '#0284c7',
    description: 'Ultra-clean Carrara pearl white, precision aerodynamic CAD grid lines, high-clarity daylight telemetry, and polished frosted acrylic glassmorphism.'
  },
  {
    id: 'aurora',
    name: 'Aurora Electric',
    tagline: 'Nordic Ionosphere & Lithium Flux',
    colors: ['#00ff9d', '#00f0ff', '#8b5cf6'],
    accent: '#00ff9d',
    description: 'Undulating emerald aurora borealis, polar cyan waves, and deep cosmic indigo glassmorphism.'
  },
  {
    id: 'cyber',
    name: 'Cyber Obsidian',
    tagline: 'Formula-E Night Racing & Stealth Carbon',
    colors: ['#00ff87', '#00e5ff', '#3b82f6'],
    accent: '#00ff87',
    description: 'High-contrast matte obsidian carbon, precision laser green, and sharp telemetry HUD accents.'
  },
  {
    id: 'solaris',
    name: 'Solaris Kinetic',
    tagline: 'Clean Solar Energy & Amber Pulse',
    colors: ['#fbbf24', '#f97316', '#38bdf8'],
    accent: '#fbbf24',
    description: 'Sunburst gold gradients, warm lithium amber, and clean sky-blue photovoltaic accents.'
  },
  {
    id: 'quantum',
    name: 'Quantum Nebula',
    tagline: 'Deep Autonomous AI & Plasma Flux',
    colors: ['#c084fc', '#60a5fa', '#f472b6'],
    accent: '#c084fc',
    description: 'Deep cosmic violet, quantum plasma rings, and vibrant sapphire intelligence highlights.'
  }
];

interface ThemeContextType {
  currentTheme: ThemeId;
  themeMeta: ThemeMeta;
  setTheme: (id: ThemeId) => void;
  availableThemes: ThemeMeta[];
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentTheme, setCurrentTheme] = useState<ThemeId>(() => {
    const saved = localStorage.getItem('ev_theme') as ThemeId;
    return saved && THEMES.some(t => t.id === saved) ? saved : 'aurora'; // Aurora Electric default!
  });

  useEffect(() => {
    // Remove previous theme classes
    document.documentElement.classList.remove('theme-aurora', 'theme-cyber', 'theme-solaris', 'theme-quantum');
    // Add current theme class
    document.documentElement.classList.add(`theme-${currentTheme}`);
    localStorage.setItem('ev_theme', currentTheme);
  }, [currentTheme]);

  const themeMeta = THEMES.find(t => t.id === currentTheme) || THEMES[0];

  return (
    <ThemeContext.Provider
      value={{
        currentTheme,
        themeMeta,
        setTheme: setCurrentTheme,
        availableThemes: THEMES
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
