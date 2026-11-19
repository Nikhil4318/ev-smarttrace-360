import React, { useState } from 'react';
import { Palette, Check, Sparkles, ChevronDown } from 'lucide-react';
import { useTheme, THEMES, ThemeId } from '../context/ThemeContext';

export const ThemeSelector: React.FC = () => {
  const { currentTheme, setTheme, themeMeta } = useTheme();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative">
      {/* Trigger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 px-3 py-1.5 rounded-xl bg-slate-900/80 border border-slate-800 text-xs text-slate-200 hover:border-slate-700 transition"
        title="Select Cockpit Aura & Visual Theme"
      >
        <div className="flex items-center space-x-1">
          <span
            className="w-2.5 h-2.5 rounded-full shadow-sm"
            style={{ backgroundColor: themeMeta.colors[0] }}
          />
          <span
            className="w-2.5 h-2.5 rounded-full shadow-sm"
            style={{ backgroundColor: themeMeta.colors[1] }}
          />
          <span
            className="w-2.5 h-2.5 rounded-full shadow-sm hidden sm:inline-block"
            style={{ backgroundColor: themeMeta.colors[2] }}
          />
        </div>
        <span className="font-semibold hidden md:inline">{themeMeta.name}</span>
        <ChevronDown className="w-3 h-3 text-slate-400" />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-72 glass-panel rounded-2xl shadow-2xl p-3 border border-slate-700/80 z-50 animate-fade-in">
          <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-800">
            <div className="flex items-center space-x-1.5">
              <Palette className="w-3.5 h-3.5 text-cyan-400" />
              <span className="text-xs font-bold text-slate-200 uppercase tracking-wider font-mono">
                Cockpit Visual Themes
              </span>
            </div>
            <span className="text-[10px] text-emerald-400 font-mono">Instant Apply</span>
          </div>

          <div className="space-y-1.5">
            {THEMES.map((theme) => {
              const isSelected = currentTheme === theme.id;
              return (
                <button
                  key={theme.id}
                  onClick={() => {
                    setTheme(theme.id);
                    setIsOpen(false);
                  }}
                  className={`w-full text-left p-2.5 rounded-xl text-xs transition flex items-center justify-between group ${
                    isSelected
                      ? 'bg-slate-800/90 border border-slate-700 text-white font-semibold shadow-md'
                      : 'hover:bg-slate-800/50 text-slate-300'
                  }`}
                >
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2">
                      <div className="flex items-center -space-x-1">
                        <span
                          className="w-3 h-3 rounded-full border border-slate-900 shadow-sm"
                          style={{ backgroundColor: theme.colors[0] }}
                        />
                        <span
                          className="w-3 h-3 rounded-full border border-slate-900 shadow-sm"
                          style={{ backgroundColor: theme.colors[1] }}
                        />
                        <span
                          className="w-3 h-3 rounded-full border border-slate-900 shadow-sm"
                          style={{ backgroundColor: theme.colors[2] }}
                        />
                      </div>
                      <span className="font-bold text-slate-100">{theme.name}</span>
                    </div>
                    <p className="text-[10px] text-slate-400 font-mono">{theme.tagline}</p>
                  </div>

                  {isSelected ? (
                    <div className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                      <Check className="w-3 h-3" />
                    </div>
                  ) : (
                    <Sparkles className="w-3.5 h-3.5 text-slate-600 group-hover:text-slate-400 transition" />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
