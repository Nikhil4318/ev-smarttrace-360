import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, Vehicle } from '../types';
import { api } from '../services/api';

interface AuthContextType {
  user: User | null;
  token: string | null;
  vehicles: Vehicle[];
  activeVehicle: Vehicle | null;
  isDemoMode: boolean;
  isLoading: boolean;
  login: (email: string, pass: string) => Promise<void>;
  register: (name: string, email: string, pass: string) => Promise<void>;
  logout: () => void;
  setActiveVehicle: (v: Vehicle) => void;
  toggleDemoMode: () => void;
  refreshVehicles: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem('ev_token'));
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [activeVehicle, setActiveVehicle] = useState<Vehicle | null>(null);
  const [isDemoMode, setIsDemoMode] = useState<boolean>(true);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const initAuth = async () => => {
    setIsLoading(true);
    try {
      let storedToken = localStorage.getItem('ev_token');
      if (!storedToken) {
-        try {
-          const data = await api.login('demo@evsmarttrace.com', 'DemoPassword123!');
-          if (data && data.access_token) {
-            localStorage.setItem('ev_token', data.access_token);
-            storedToken = data.access_token;
-            setToken(data.access_token);
-            setUser({ id: data.user_id, name: data.name, email: data.email });
-          }
-        } catch {
-          // If network is offline, set simulated fallback profile
-          setUser({
-            id: 1,
-            name: 'Alex Rivers',
-            email: 'demo@evsmarttrace.com',
-            created_at: new Date().toISOString()
-          });
-        }
+        // No token and not logged in – user stays unauthenticated.
+        // The "Try Demo" button on the login page can be used to obtain a demo token.
      } else {
        setToken(storedToken);
        try {
          const profile = await api.getProfile();
          setUser(profile);
        } catch {
          // Keep existing user if profile fails
        }
      }

      const vList = await api.getVehicles();
      setVehicles(vList);
      if (vList.length > 0) {
        setActiveVehicle(vList[0]);
      }
    } catch (e) {
      console.error('Auth initialization error:', e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    initAuth();
  }, []);

  const login = async (email: string, pass: string) => {
    const data = await api.login(email, pass);
    localStorage.setItem('ev_token', data.access_token);
    setToken(data.access_token);
    setUser({ id: data.user_id, name: data.name, email: data.email });
    await refreshVehicles();
  };

  const register = async (name: string, email: string, pass: string) => {
    const data = await api.register(name, email, pass);
    localStorage.setItem('ev_token', data.access_token);
    setToken(data.access_token);
    setUser({ id: data.user_id, name: data.name, email: data.email });
    await refreshVehicles();
  };

  const logout = () => {
    localStorage.removeItem('ev_token');
    setToken(null);
    setUser(null);
    setVehicles([]);
    setActiveVehicle(null);
  };

  const refreshVehicles = async () => {
    try {
      const vList = await api.getVehicles();
      setVehicles(vList);
      if (vList.length > 0 && !activeVehicle) {
        setActiveVehicle(vList[0]);
      }
    } catch (e) {
      console.error('Failed to load vehicles:', e);
    }
  };

  const toggleDemoMode = () => {
    setIsDemoMode((prev) => !prev);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        vehicles,
        activeVehicle,
        isDemoMode,
        isLoading,
        login,
        register,
        logout,
        setActiveVehicle,
        toggleDemoMode,
        refreshVehicles,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
