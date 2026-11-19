import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import L from 'leaflet';
import { Globe, Layers, Navigation, Compass, Maximize2 } from 'lucide-react';
import { ChargingStation } from '../types';

// Custom Map Pins
const activeStationIcon = L.divIcon({
  className: 'custom-station-pin',
  html: `<div style="
    background: #00ff87;
    width: 26px;
    height: 26px;
    border-radius: 50%;
    border: 2px solid #080c14;
    box-shadow: 0 0 16px rgba(0,255,135,0.9);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 13px;
    font-weight: bold;
    color: #080c14;
    cursor: pointer;
  ">⚡</div>`,
  iconSize: [26, 26],
  iconAnchor: [13, 13]
});

const userLocationIcon = L.divIcon({
  className: 'custom-user-pin',
  html: `<div style="
    background: #00e5ff;
    width: 24px;
    height: 24px;
    border-radius: 50%;
    border: 3px solid #ffffff;
    box-shadow: 0 0 18px rgba(0,229,255,1);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 11px;
    color: #080c14;
    font-weight: bold;
  ">📍</div>`,
  iconSize: [24, 24],
  iconAnchor: [12, 12]
});

const destinationPinIcon = L.divIcon({
  className: 'custom-dest-pin',
  html: `<div style="
    background: #f43f5e;
    width: 24px;
    height: 24px;
    border-radius: 50%;
    border: 3px solid #ffffff;
    box-shadow: 0 0 18px rgba(244,63,94,1);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 11px;
    color: white;
  ">🏁</div>`,
  iconSize: [24, 24],
  iconAnchor: [12, 12]
});

interface InteractiveMapProps {
  stations?: ChargingStation[];
  routeWaypoints?: number[][]; // [[lat, lng], ...]
  center?: [number, number];
  zoom?: number;
  onSelectStation?: (station: ChargingStation) => void;
  defaultLayer?: 'satellite' | 'cyber' | 'streets';
}

// Controller component to smoothly pan/zoom when center or waypoints update
const MapController: React.FC<{ center?: [number, number]; waypoints?: number[][]; triggerFit?: number }> = ({ center, waypoints, triggerFit }) => {
  const map = useMap();

  useEffect(() => {
    if (waypoints && waypoints.length > 0) {
      const bounds = L.latLngBounds(waypoints as [number, number][]);
      map.fitBounds(bounds, { padding: [50, 50] });
    } else if (center) {
      map.panTo(center);
    }
  }, [center, waypoints, triggerFit, map]);

  return null;
};

export const InteractiveMap: React.FC<InteractiveMapProps> = ({
  stations = [],
  routeWaypoints = [],
  center = [37.7749, -122.4194],
  zoom = 11,
  onSelectStation,
  defaultLayer = 'satellite'
}) => {
  const [mapLayer, setMapLayer] = useState<'satellite' | 'cyber' | 'streets'>(defaultLayer);
  const [triggerFit, setTriggerFit] = useState(0);

  const startPoint = routeWaypoints.length > 0 ? (routeWaypoints[0] as [number, number]) : center;
  const endPoint = routeWaypoints.length > 1 ? (routeWaypoints[routeWaypoints.length - 1] as [number, number]) : null;

  return (
    <div className={`w-full h-full min-h-[440px] rounded-2xl overflow-hidden border border-slate-800 relative shadow-2xl ${
      mapLayer === 'cyber' ? 'map-theme-cyber' : mapLayer === 'satellite' ? 'map-theme-satellite' : ''
    }`}>
      
      {/* Floating Map Layer & Controls Bar */}
      <div className="absolute top-4 right-4 z-[400] flex items-center space-x-2 bg-slate-950/85 backdrop-blur-md p-1.5 rounded-xl border border-slate-700/80 shadow-2xl">
        <button
          onClick={() => setMapLayer('satellite')}
          className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
            mapLayer === 'satellite'
              ? 'bg-gradient-to-r from-emerald-500 to-cyan-500 text-slate-950 shadow-md shadow-emerald-500/20'
              : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
          }`}
          title="High-resolution World Satellite view with terrain, road labels, and satellite photography"
        >
          <Globe className="w-3.5 h-3.5" />
          <span>Satellite View</span>
        </button>

        <button
          onClick={() => setMapLayer('cyber')}
          className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
            mapLayer === 'cyber'
              ? 'bg-gradient-to-r from-emerald-500 to-cyan-500 text-slate-950 shadow-md shadow-emerald-500/20'
              : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
          }`}
          title="Cyber Dark futuristic automotive theme"
        >
          <Layers className="w-3.5 h-3.5" />
          <span>Cyber Dark</span>
        </button>

        <button
          onClick={() => setMapLayer('streets')}
          className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
            mapLayer === 'streets'
              ? 'bg-gradient-to-r from-emerald-500 to-cyan-500 text-slate-950 shadow-md shadow-emerald-500/20'
              : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
          }`}
          title="Standard road and street navigation map"
        >
          <Navigation className="w-3.5 h-3.5" />
          <span>Street Map</span>
        </button>

        <button
          onClick={() => setTriggerFit((p) => p + 1)}
          className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          title="Reset Zoom & Fit Route Corridor"
        >
          <Maximize2 className="w-4 h-4" />
        </button>
      </div>

      {/* Floating Status Indicator on Bottom Left */}
      <div className="absolute bottom-4 left-4 z-[400] bg-slate-950/85 backdrop-blur-md px-3 py-1.5 rounded-xl border border-slate-800 text-[11px] font-mono text-slate-300 flex items-center space-x-2">
        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
        <span className="text-emerald-400 font-bold uppercase">{mapLayer} Route Mode</span>
        <span className="text-slate-500">|</span>
        <span>{stations.length} Fast Chargers Active</span>
      </div>

      <MapContainer
        center={startPoint}
        zoom={zoom}
        scrollWheelZoom={true}
        className="w-full h-full z-10"
      >
        <MapController center={startPoint} waypoints={routeWaypoints} triggerFit={triggerFit} />

        {/* 1. SATELLITE MODE: Esri World Imagery (High-Resolution Real Satellite Photography) */}
        {mapLayer === 'satellite' && (
          <>
            <TileLayer
              attribution='Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community'
              url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
              maxZoom={18}
            />
            {/* World Reference Boundaries, Roads & Labels Overlay */}
            <TileLayer
              attribution='&copy; Esri World Boundaries'
              url="https://services.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}"
              maxZoom={18}
              opacity={0.85}
            />
          </>
        )}

        {/* 2. CYBER DARK MODE: CartoDB Dark Matter */}
        {mapLayer === 'cyber' && (
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
            url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
            maxZoom={19}
          />
        )}

        {/* 3. STREET MAP MODE: OpenStreetMap standard */}
        {mapLayer === 'streets' && (
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            maxZoom={19}
          />
        )}

        {/* Departure / Origin Marker */}
        <Marker position={startPoint} icon={userLocationIcon}>
          <Popup>
            <div className="text-xs font-sans">
              <p className="font-bold text-cyan-400">Departure / Current EV Position</p>
              <p className="text-slate-300">San Francisco Bay Corridor</p>
            </div>
          </Popup>
        </Marker>

        {/* Destination Marker if route active */}
        {endPoint && (
          <Marker position={endPoint} icon={destinationPinIcon}>
            <Popup>
              <div className="text-xs font-sans">
                <p className="font-bold text-rose-400">Arrival Destination</p>
                <p className="text-slate-300">Target Terminal</p>
              </div>
            </Popup>
          </Marker>
        )}

        {/* Charging Station Markers */}
        {stations.map((station) => (
          <Marker
            key={station.id}
            position={[station.latitude, station.longitude]}
            icon={activeStationIcon}
            eventHandlers={{
              click: () => onSelectStation && onSelectStation(station)
            }}
          >
            <Popup>
              <div className="p-1 space-y-1.5 text-xs font-sans max-w-[220px]">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-emerald-400">{station.station_name}</span>
                </div>
                <p className="text-[11px] text-slate-300">{station.address}</p>
                <div className="pt-1 border-t border-slate-700/80 flex items-center justify-between text-[11px] font-mono">
                  <span className="text-cyan-400 font-bold">{station.charging_power} kW ({station.connector_type})</span>
                  <span className="text-emerald-400">${station.pricing_per_kwh}/kWh</span>
                </div>
                <div className="text-[10px] text-slate-400">
                  Status: <span className="text-slate-200">{station.availability_status}</span>
                </div>
              </div>
            </Popup>
          </Marker>
        ))}

        {/* Glowing Route Polyline */}
        {routeWaypoints.length > 0 && (
          <>
            {/* Outer Glow */}
            <Polyline
              positions={routeWaypoints as [number, number][]}
              pathOptions={{
                color: mapLayer === 'satellite' ? '#00e5ff' : '#00ff87',
                weight: 8,
                opacity: 0.35,
                lineJoin: 'round'
              }}
            />
            {/* Inner High-Precision Line */}
            <Polyline
              positions={routeWaypoints as [number, number][]}
              pathOptions={{
                color: '#00ff87',
                weight: 4,
                opacity: 0.95,
                dashArray: '6, 6',
                lineJoin: 'round'
              }}
            />
          </>
        )}
      </MapContainer>
    </div>
  );
};
