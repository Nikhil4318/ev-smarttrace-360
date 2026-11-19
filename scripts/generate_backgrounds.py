import os

output_dir = r"c:\Users\dell\OneDrive\Desktop\Portfolio 2\ev-smart\frontend\public\backgrounds"
os.makedirs(output_dir, exist_ok=True)

# 1. DASHBOARD - Central Telemetry Cockpit & Aerodynamic Wind-Tunnel
dashboard_svg = """<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1920 1080" fill="none">
  <defs>
    <linearGradient id="dbStream1" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#00f0ff" stop-opacity="0.35"/>
      <stop offset="50%" stop-color="#00ff9d" stop-opacity="0.25"/>
      <stop offset="100%" stop-color="#8b5cf6" stop-opacity="0"/>
    </linearGradient>
    <radialGradient id="dbGlow" cx="50%" cy="50%" r="60%">
      <stop offset="0%" stop-color="#00f0ff" stop-opacity="0.12"/>
      <stop offset="60%" stop-color="#00ff9d" stop-opacity="0.04"/>
      <stop offset="100%" stop-color="#050814" stop-opacity="0"/>
    </radialGradient>
  </defs>
  <rect width="1920" height="1080" fill="url(#dbGlow)"/>
  
  <!-- Aerodynamic Streamlines (Wind-tunnel velocity curves) -->
  <path d="M-50,220 C350,220 750,160 1150,280 C1550,400 1850,340 2000,340" stroke="url(#dbStream1)" stroke-width="2.5" fill="none"/>
  <path d="M-50,300 C300,300 700,220 1100,360 C1500,500 1800,440 2000,440" stroke="url(#dbStream1)" stroke-width="1.8" stroke-dasharray="12 6" fill="none"/>
  <path d="M-50,380 C250,380 650,280 1050,440 C1450,600 1750,540 2000,540" stroke="url(#dbStream1)" stroke-width="2.0" fill="none"/>
  <path d="M-50,460 C200,460 600,340 1000,520 C1400,700 1700,640 2000,640" stroke="url(#dbStream1)" stroke-width="1.2" stroke-dasharray="6 6" fill="none"/>
  
  <!-- Center HUD Instrument Cluster Gauges -->
  <g transform="translate(960, 480)" opacity="0.4">
    <circle r="360" stroke="#00f0ff" stroke-width="1" stroke-dasharray="6 8"/>
    <circle r="290" stroke="#00ff9d" stroke-width="2" stroke-dasharray="16 8"/>
    <circle r="220" stroke="#8b5cf6" stroke-width="1.2"/>
    <circle r="150" stroke="#00f0ff" stroke-width="0.8" stroke-dasharray="4 4"/>
    <path d="M-380,0 L380,0" stroke="#00f0ff" stroke-width="0.8" stroke-dasharray="4 6"/>
    <path d="M0,-380 L0,380" stroke="#00f0ff" stroke-width="0.8" stroke-dasharray="4 6"/>
    <!-- Velocity arcs -->
    <path d="M-260,150 A 300 300 0 1 1 260 150" stroke="#00ff9d" stroke-width="3.5" stroke-linecap="round"/>
    <!-- Target crosshairs -->
    <circle cx="-290" cy="0" r="8" stroke="#00ff9d" stroke-width="1.5"/>
    <circle cx="290" cy="0" r="8" stroke="#00ff9d" stroke-width="1.5"/>
    <circle cx="0" cy="-290" r="8" stroke="#00f0ff" stroke-width="1.5"/>
  </g>
  
  <!-- Perspective Floor Grid (Automotive CAD grid) -->
  <g opacity="0.2" stroke="#00f0ff" stroke-width="0.8">
    <line x1="960" y1="500" x2="100" y2="1080"/>
    <line x1="960" y1="500" x2="400" y2="1080"/>
    <line x1="960" y1="500" x2="700" y2="1080"/>
    <line x1="960" y1="500" x2="1220" y2="1080"/>
    <line x1="960" y1="500" x2="1520" y2="1080"/>
    <line x1="960" y1="500" x2="1820" y2="1080"/>
    <!-- Iso grid bars -->
    <line x1="300" y1="750" x2="1620" y2="750"/>
    <line x1="200" y1="880" x2="1720" y2="880"/>
    <line x1="100" y1="1020" x2="1820" y2="1020"/>
  </g>
</svg>"""

# 2. BATTERY INTELLIGENCE - Lithium-Ion Cell Array & Graphene Molecular Lattice
battery_svg = """<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1920 1080" fill="none">
  <defs>
    <radialGradient id="batGlow" cx="50%" cy="50%" r="55%">
      <stop offset="0%" stop-color="#00ff9d" stop-opacity="0.14"/>
      <stop offset="60%" stop-color="#00f0ff" stop-opacity="0.05"/>
      <stop offset="100%" stop-color="#050814" stop-opacity="0"/>
    </radialGradient>
    <pattern id="hexLattice" width="60" height="104" patternUnits="userSpaceOnUse" patternTransform="scale(1.2)">
      <path d="M30 0 L60 17.3 L60 52 L30 69.3 L0 52 L0 17.3 Z" stroke="#00ff9d" stroke-opacity="0.12" stroke-width="1.2" fill="none"/>
      <path d="M30 69.3 L60 86.6 L60 121.3 L30 138.6 L0 121.3 L0 86.6 Z" stroke="#00ff9d" stroke-opacity="0.12" stroke-width="1.2" fill="none"/>
      <circle cx="30" cy="17.3" r="2.5" fill="#00f0ff" fill-opacity="0.3"/>
      <circle cx="60" cy="52" r="2" fill="#00ff9d" fill-opacity="0.25"/>
    </pattern>
  </defs>
  <rect width="1920" height="1080" fill="url(#batGlow)"/>
  <rect width="1920" height="1080" fill="url(#hexLattice)"/>

  <!-- High-Voltage 4680 Cylindrical Cells & Busbar Array Blueprint -->
  <g transform="translate(400, 300)" opacity="0.35" stroke="#00ff9d" stroke-width="1.5">
    <!-- Row 1 Cells -->
    <ellipse cx="100" cy="100" rx="45" ry="25" fill="#00ff9d" fill-opacity="0.08"/>
    <ellipse cx="220" cy="100" rx="45" ry="25" fill="#00ff9d" fill-opacity="0.08"/>
    <ellipse cx="340" cy="100" rx="45" ry="25" fill="#00ff9d" fill-opacity="0.08"/>
    <ellipse cx="460" cy="100" rx="45" ry="25" fill="#00ff9d" fill-opacity="0.08"/>
    <ellipse cx="580" cy="100" rx="45" ry="25" fill="#00ff9d" fill-opacity="0.08"/>
    <ellipse cx="700" cy="100" rx="45" ry="25" fill="#00ff9d" fill-opacity="0.08"/>
    <ellipse cx="820" cy="100" rx="45" ry="25" fill="#00ff9d" fill-opacity="0.08"/>
    <ellipse cx="940" cy="100" rx="45" ry="25" fill="#00ff9d" fill-opacity="0.08"/>
    <ellipse cx="1060" cy="100" rx="45" ry="25" fill="#00ff9d" fill-opacity="0.08"/>

    <!-- Row 2 Cells -->
    <ellipse cx="160" cy="180" rx="45" ry="25" fill="#00f0ff" fill-opacity="0.08" stroke="#00f0ff"/>
    <ellipse cx="280" cy="180" rx="45" ry="25" fill="#00f0ff" fill-opacity="0.08" stroke="#00f0ff"/>
    <ellipse cx="400" cy="180" rx="45" ry="25" fill="#00f0ff" fill-opacity="0.08" stroke="#00f0ff"/>
    <ellipse cx="520" cy="180" rx="45" ry="25" fill="#00f0ff" fill-opacity="0.08" stroke="#00f0ff"/>
    <ellipse cx="640" cy="180" rx="45" ry="25" fill="#00f0ff" fill-opacity="0.08" stroke="#00f0ff"/>
    <ellipse cx="760" cy="180" rx="45" ry="25" fill="#00f0ff" fill-opacity="0.08" stroke="#00f0ff"/>
    <ellipse cx="880" cy="180" rx="45" ry="25" fill="#00f0ff" fill-opacity="0.08" stroke="#00f0ff"/>
    <ellipse cx="1000" cy="180" rx="45" ry="25" fill="#00f0ff" fill-opacity="0.08" stroke="#00f0ff"/>

    <!-- High-Voltage Interconnect Busbars -->
    <path d="M100,100 L1060,100" stroke="#00ff9d" stroke-width="4" stroke-dasharray="20 10"/>
    <path d="M160,180 L1000,180" stroke="#00f0ff" stroke-width="4" stroke-dasharray="20 10"/>
    <!-- Cathode / Anode Terminals -->
    <path d="M80,80 L120,120 M120,80 L80,120" stroke="#00ff9d" stroke-width="2"/>
    <path d="M1040,80 L1080,120 M1080,80 L1040,120" stroke="#00ff9d" stroke-width="2"/>
  </g>

  <!-- Electrochemical Electron Flow Curves -->
  <path d="M100,750 C500,600 900,850 1400,680 C1650,600 1800,720 1950,700" stroke="#00ff9d" stroke-width="2.5" opacity="0.3" fill="none"/>
  <path d="M100,820 C500,670 900,920 1400,750 C1650,670 1800,790 1950,770" stroke="#00f0ff" stroke-width="1.8" stroke-dasharray="8 6" opacity="0.25" fill="none"/>
</svg>"""

# 3. ENERGY ANALYTICS - Megawatt Grid & High-Voltage Charging Waveforms
energy_svg = """<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1920 1080" fill="none">
  <defs>
    <radialGradient id="enGlow" cx="50%" cy="50%" r="55%">
      <stop offset="0%" stop-color="#fbbf24" stop-opacity="0.12"/>
      <stop offset="50%" stop-color="#f97316" stop-opacity="0.05"/>
      <stop offset="100%" stop-color="#050814" stop-opacity="0"/>
    </radialGradient>
  </defs>
  <rect width="1920" height="1080" fill="url(#enGlow)"/>

  <!-- High-Power Sine & Cosine Energy Waveforms (3-Phase AC/DC Power Flow) -->
  <path d="M0,540 Q 240,240 480,540 T 960,540 T 1440,540 T 1920,540" stroke="#fbbf24" stroke-width="3" stroke-opacity="0.35" fill="none"/>
  <path d="M0,540 Q 240,840 480,540 T 960,540 T 1440,540 T 1920,540" stroke="#f97316" stroke-width="2.2" stroke-opacity="0.3" fill="none"/>
  <path d="M0,540 Q 240,390 480,540 T 960,540 T 1440,540 T 1920,540" stroke="#38bdf8" stroke-width="1.8" stroke-dasharray="10 5" stroke-opacity="0.35" fill="none"/>

  <!-- Electrical Power Grid Transmission Tower Pylons (Technical Silhouette) -->
  <g transform="translate(180, 240)" opacity="0.25" stroke="#fbbf24" stroke-width="1.5">
    <line x1="120" y1="40" x2="80" y2="400"/>
    <line x1="120" y1="40" x2="160" y2="400"/>
    <line x1="80" y1="400" x2="160" y2="400"/>
    <line x1="90" y1="300" x2="150" y2="300"/>
    <line x1="100" y1="200" x2="140" y2="200"/>
    <line x1="110" y1="120" x2="130" y2="120"/>
    <line x1="40" y1="120" x2="200" y2="120"/>
    <line x1="20" y1="200" x2="220" y2="200"/>
    <line x1="50" y1="300" x2="190" y2="300"/>
    <line x1="85" y1="350" x2="155" y2="250"/>
    <line x1="155" y1="350" x2="85" y2="250"/>
  </g>
  <g transform="translate(1550, 280)" opacity="0.25" stroke="#fbbf24" stroke-width="1.5">
    <line x1="120" y1="40" x2="80" y2="400"/>
    <line x1="120" y1="40" x2="160" y2="400"/>
    <line x1="80" y1="400" x2="160" y2="400"/>
    <line x1="90" y1="300" x2="150" y2="300"/>
    <line x1="100" y1="200" x2="140" y2="200"/>
    <line x1="40" y1="120" x2="200" y2="120"/>
    <line x1="20" y1="200" x2="220" y2="200"/>
  </g>

  <!-- High-Voltage Power Line Catenary Curves -->
  <path d="M300,360 Q 960,620 1670,400" stroke="#fbbf24" stroke-width="1.5" stroke-dasharray="6 4" stroke-opacity="0.3" fill="none"/>
  <path d="M220,440 Q 960,700 1590,480" stroke="#f97316" stroke-width="1.2" stroke-opacity="0.25" fill="none"/>
</svg>"""

# 4. VEHICLE DIAGNOSTICS - EV Chassis Hologram & Powertrain X-Ray Scanner
diagnostics_svg = """<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1920 1080" fill="none">
  <defs>
    <radialGradient id="diagGlow" cx="50%" cy="50%" r="55%">
      <stop offset="0%" stop-color="#00f0ff" stop-opacity="0.14"/>
      <stop offset="60%" stop-color="#00ff9d" stop-opacity="0.04"/>
      <stop offset="100%" stop-color="#050814" stop-opacity="0"/>
    </radialGradient>
  </defs>
  <rect width="1920" height="1080" fill="url(#diagGlow)"/>

  <!-- Concentric Diagnostic Scanner Radar Sweeps -->
  <g transform="translate(960, 520)" opacity="0.35">
    <circle r="450" stroke="#00f0ff" stroke-width="1" stroke-dasharray="6 8"/>
    <circle r="360" stroke="#00ff9d" stroke-width="1.5" stroke-dasharray="12 6"/>
    <circle r="260" stroke="#00f0ff" stroke-width="1" stroke-dasharray="4 4"/>
    <circle r="140" stroke="#00ff9d" stroke-width="2"/>
    <line x1="-500" y1="0" x2="500" y2="0" stroke="#00f0ff" stroke-width="0.8" stroke-dasharray="5 5"/>
    <line x1="0" y1="-480" x2="0" y2="480" stroke="#00f0ff" stroke-width="0.8" stroke-dasharray="5 5"/>
    <!-- Radar angle lines (30, 45, 60 deg) -->
    <line x1="-350" y1="-350" x2="350" y2="350" stroke="#00f0ff" stroke-width="0.5" stroke-dasharray="3 3"/>
    <line x1="-350" y1="350" x2="350" y2="-350" stroke="#00f0ff" stroke-width="0.5" stroke-dasharray="3 3"/>
  </g>

  <!-- Complete EV Skateboard Chassis Top-Down Blueprint Wireframe -->
  <g transform="translate(680, 220)" opacity="0.4" stroke="#00f0ff" stroke-width="1.8">
    <!-- Vehicle Outer Silhouette -->
    <path d="M120,40 C200,30 360,30 440,40 C490,60 520,140 520,240 L520,480 C520,580 490,640 440,660 C360,670 200,670 120,660 C70,640 40,580 40,480 L40,240 C40,140 70,60 120,40 Z" fill="none" stroke-width="2"/>
    <!-- 4 Wheels -->
    <rect x="15" y="110" width="35" height="90" rx="8" fill="#00ff9d" fill-opacity="0.15" stroke="#00ff9d" stroke-width="1.5"/>
    <rect x="510" y="110" width="35" height="90" rx="8" fill="#00ff9d" fill-opacity="0.15" stroke="#00ff9d" stroke-width="1.5"/>
    <rect x="15" y="500" width="35" height="90" rx="8" fill="#00ff9d" fill-opacity="0.15" stroke="#00ff9d" stroke-width="1.5"/>
    <rect x="510" y="500" width="35" height="90" rx="8" fill="#00ff9d" fill-opacity="0.15" stroke="#00ff9d" stroke-width="1.5"/>
    <!-- Front Electric Drive Unit (Front Motor) -->
    <rect x="220" y="125" width="120" height="60" rx="6" fill="#00f0ff" fill-opacity="0.2" stroke="#00f0ff" stroke-width="1.5"/>
    <circle cx="280" cy="155" r="18" fill="none" stroke="#00ff9d" stroke-width="1.2"/>
    <!-- Rear Electric Drive Unit (Rear Motor) -->
    <rect x="210" y="515" width="140" height="70" rx="6" fill="#00f0ff" fill-opacity="0.2" stroke="#00f0ff" stroke-width="1.5"/>
    <circle cx="280" cy="550" r="22" fill="none" stroke="#00ff9d" stroke-width="1.2"/>
    <!-- Skateboard Battery Pack Floor Compartment -->
    <rect x="100" y="220" width="360" height="260" rx="10" fill="#00ff9d" fill-opacity="0.08" stroke="#00ff9d" stroke-width="2"/>
    <!-- Battery Pack Internal Module Rails -->
    <line x1="160" y1="220" x2="160" y2="480" stroke="#00ff9d" stroke-width="1" stroke-dasharray="4 4"/>
    <line x1="220" y1="220" x2="220" y2="480" stroke="#00ff9d" stroke-width="1" stroke-dasharray="4 4"/>
    <line x1="280" y1="220" x2="280" y2="480" stroke="#00ff9d" stroke-width="1" stroke-dasharray="4 4"/>
    <line x1="340" y1="220" x2="340" y2="480" stroke="#00ff9d" stroke-width="1" stroke-dasharray="4 4"/>
    <line x1="400" y1="220" x2="400" y2="480" stroke="#00ff9d" stroke-width="1" stroke-dasharray="4 4"/>
    <!-- High-Voltage Inverter & Thermal Bus Cables -->
    <path d="M280,185 L280,220 M280,480 L280,515" stroke="#f59e0b" stroke-width="3"/>
  </g>
</svg>"""

# 5. CHARGING STATIONS - Orbital GPS Constellation & Global Charging Nodes
stations_svg = """<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1920 1080" fill="none">
  <defs>
    <radialGradient id="stGlow" cx="50%" cy="50%" r="55%">
      <stop offset="0%" stop-color="#00f0ff" stop-opacity="0.14"/>
      <stop offset="60%" stop-color="#00ff9d" stop-opacity="0.04"/>
      <stop offset="100%" stop-color="#050814" stop-opacity="0"/>
    </radialGradient>
  </defs>
  <rect width="1920" height="1080" fill="url(#stGlow)"/>

  <!-- Orbital Global Coordinate Grid Curves (Latitude/Longitude Projection) -->
  <g opacity="0.25" stroke="#00f0ff" stroke-width="1">
    <ellipse cx="960" cy="540" rx="720" ry="380" stroke-dasharray="6 6"/>
    <ellipse cx="960" cy="540" rx="580" ry="280"/>
    <ellipse cx="960" cy="540" rx="420" ry="180" stroke-dasharray="4 4"/>
    <ellipse cx="960" cy="540" rx="240" ry="90"/>
    <line x1="240" y1="540" x2="1680" y2="540" stroke-width="1.5"/>
    <line x1="960" y1="160" x2="960" y2="920" stroke-width="1.5"/>
  </g>

  <!-- Network of Interconnected Charging Hub Nodes with Range Beacons -->
  <g opacity="0.45" stroke="#00ff9d">
    <!-- Hub 1 Silicon Valley Metro -->
    <circle cx="580" cy="460" r="12" fill="#00ff9d" fill-opacity="0.2" stroke-width="2"/>
    <circle cx="580" cy="460" r="45" fill="none" stroke="#00f0ff" stroke-width="1" stroke-dasharray="4 4"/>
    <!-- Hub 2 Harbor Bay -->
    <circle cx="820" cy="380" r="10" fill="#00f0ff" fill-opacity="0.2" stroke="#00f0ff" stroke-width="2"/>
    <circle cx="820" cy="380" r="38" fill="none" stroke="#00f0ff" stroke-width="1" stroke-dasharray="4 4"/>
    <!-- Hub 3 Sunset Point -->
    <circle cx="1120" cy="480" r="14" fill="#00ff9d" fill-opacity="0.25" stroke-width="2"/>
    <circle cx="1120" cy="480" r="55" fill="none" stroke="#00ff9d" stroke-width="1" stroke-dasharray="6 4"/>
    <!-- Hub 4 Foothill Express -->
    <circle cx="1380" cy="410" r="10" fill="#00f0ff" fill-opacity="0.2" stroke="#00f0ff" stroke-width="2"/>
    <!-- Hub 5 Golden Gate Terminal -->
    <circle cx="940" cy="620" r="16" fill="#8b5cf6" fill-opacity="0.25" stroke="#8b5cf6" stroke-width="2"/>
    <circle cx="940" cy="620" r="60" fill="none" stroke="#8b5cf6" stroke-width="1" stroke-dasharray="6 6"/>

    <!-- Interconnect Network Traces (Interstate EV Corridors) -->
    <path d="M580,460 L820,380 L1120,480 L1380,410 M820,380 L940,620 L1120,480 M580,460 L940,620" stroke="#00f0ff" stroke-width="1.8" stroke-dasharray="8 6" fill="none"/>
  </g>
</svg>"""

# 6. SMART NAVIGATION - Curving Autonomous Highway Ribbon & Waypoint Elevation
navigation_svg = """<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1920 1080" fill="none">
  <defs>
    <linearGradient id="navRibbon" x1="0%" y1="100%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#00f0ff" stop-opacity="0.45"/>
      <stop offset="50%" stop-color="#00ff9d" stop-opacity="0.3"/>
      <stop offset="100%" stop-color="#8b5cf6" stop-opacity="0.1"/>
    </linearGradient>
    <radialGradient id="navGlow" cx="50%" cy="50%" r="55%">
      <stop offset="0%" stop-color="#00f0ff" stop-opacity="0.12"/>
      <stop offset="60%" stop-color="#00ff9d" stop-opacity="0.04"/>
      <stop offset="100%" stop-color="#050814" stop-opacity="0"/>
    </radialGradient>
  </defs>
  <rect width="1920" height="1080" fill="url(#navGlow)"/>

  <!-- Glowing Curving Highway Expressway Ribbon -->
  <path d="M-100,880 C400,880 600,600 960,540 C1320,480 1500,280 2020,180" stroke="url(#navRibbon)" stroke-width="45" stroke-linecap="round" fill="none"/>
  <path d="M-100,880 C400,880 600,600 960,540 C1320,480 1500,280 2020,180" stroke="#050814" stroke-width="35" stroke-linecap="round" fill="none"/>
  <!-- Highway Center Dashed Guide Line -->
  <path d="M-100,880 C400,880 600,600 960,540 C1320,480 1500,280 2020,180" stroke="#00f0ff" stroke-width="2.5" stroke-dasharray="24 16" fill="none"/>

  <!-- Topographic Elevation Contour Curves -->
  <g opacity="0.2" stroke="#00ff9d" stroke-width="1.2">
    <path d="M100,200 C400,120 800,280 1200,160 C1600,60 1800,220 2000,180" fill="none"/>
    <path d="M80,260 C380,180 780,340 1180,220 C1580,120 1780,280 1980,240" fill="none"/>
    <path d="M60,320 C360,240 760,400 1160,280 C1560,180 1760,340 1960,300" fill="none"/>
  </g>

  <!-- GPS Waypoint Target Markers & Compass Rose -->
  <g transform="translate(1600, 240)" opacity="0.35" stroke="#00f0ff">
    <circle r="75" stroke-width="1.2" stroke-dasharray="4 6"/>
    <circle r="55" stroke-width="1.5"/>
    <line x1="-90" y1="0" x2="90" y2="0" stroke-width="1"/>
    <line x1="0" y1="-90" x2="0" y2="90" stroke-width="1"/>
    <polygon points="0,-48 8,-20 0,-30 -8,-20" fill="#00ff9d"/>
  </g>
</svg>"""

# 7. SMARTVOICE - Siri-Style Neural Soundwave Particle Sphere
smartvoice_svg = """<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1920 1080" fill="none">
  <defs>
    <radialGradient id="voiceGlow" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="#c084fc" stop-opacity="0.18"/>
      <stop offset="40%" stop-color="#00f0ff" stop-opacity="0.10"/>
      <stop offset="80%" stop-color="#ec4899" stop-opacity="0.04"/>
      <stop offset="100%" stop-color="#050814" stop-opacity="0"/>
    </radialGradient>
  </defs>
  <rect width="1920" height="1080" fill="url(#voiceGlow)"/>

  <!-- Siri-Style Circular Acoustic Waveform Rings -->
  <g transform="translate(960, 520)" opacity="0.45">
    <circle r="380" stroke="#c084fc" stroke-width="1" stroke-dasharray="4 8"/>
    <circle r="310" stroke="#00f0ff" stroke-width="1.5" stroke-dasharray="12 6"/>
    <circle r="240" stroke="#ec4899" stroke-width="2" stroke-dasharray="24 12"/>
    <circle r="170" stroke="#a855f7" stroke-width="2.5"/>
    <circle r="100" stroke="#00f0ff" stroke-width="3"/>
    
    <!-- Concentric Speech Frequency Nodes -->
    <path d="M-360,0 C-240,-120 -120,120 0,0 C120,-120 240,120 360,0" stroke="#c084fc" stroke-width="2.5" fill="none"/>
    <path d="M-360,0 C-240,140 -120,-140 0,0 C120,140 240,-140 360,0" stroke="#00f0ff" stroke-width="2" fill="none"/>
    <path d="M-280,0 C-180,-80 -90,80 0,0 C90,-80 180,80 280,0" stroke="#ec4899" stroke-width="2.2" stroke-dasharray="8 4" fill="none"/>

    <!-- Voice Pulse Particles -->
    <circle cx="0" cy="-170" r="5" fill="#00f0ff"/>
    <circle cx="170" cy="0" r="5" fill="#c084fc"/>
    <circle cx="0" cy="170" r="5" fill="#ec4899"/>
    <circle cx="-170" cy="0" r="5" fill="#00f0ff"/>
  </g>
</svg>"""

# 8. REPORTS - Aerospace Technical Drafting Grid & Compliance Waterfall
reports_svg = """<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1920 1080" fill="none">
  <defs>
    <radialGradient id="repGlow" cx="50%" cy="50%" r="55%">
      <stop offset="0%" stop-color="#00f0ff" stop-opacity="0.10"/>
      <stop offset="60%" stop-color="#00ff9d" stop-opacity="0.04"/>
      <stop offset="100%" stop-color="#050814" stop-opacity="0"/>
    </radialGradient>
    <pattern id="isoDraft" width="40" height="40" patternUnits="userSpaceOnUse">
      <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#00f0ff" stroke-opacity="0.07" stroke-width="0.8"/>
      <circle cx="0" cy="0" r="1.2" fill="#00f0ff" fill-opacity="0.2"/>
    </pattern>
  </defs>
  <rect width="1920" height="1080" fill="url(#repGlow)"/>
  <rect width="1920" height="1080" fill="url(#isoDraft)"/>

  <!-- Technical Analytical Curves & Standard Deviation Bands -->
  <g opacity="0.35">
    <path d="M150,750 C400,720 600,480 900,420 C1200,360 1500,500 1780,320" stroke="#00ff9d" stroke-width="2.8" fill="none"/>
    <path d="M150,780 C400,750 600,520 900,460 C1200,400 1500,540 1780,360" stroke="#00f0ff" stroke-width="1.8" stroke-dasharray="8 6" fill="none"/>
    <!-- Area shade under primary curve -->
    <path d="M150,750 C400,720 600,480 900,420 C1200,360 1500,500 1780,320 L1780,850 L150,850 Z" fill="#00f0ff" fill-opacity="0.04"/>

    <!-- Calibration Tick Axes -->
    <line x1="150" y1="250" x2="150" y2="850" stroke="#00f0ff" stroke-width="1.5"/>
    <line x1="150" y1="850" x2="1780" y2="850" stroke="#00f0ff" stroke-width="1.5"/>
  </g>
</svg>"""

# 9. PROFILE & VEHICLE REGISTRATION - Hypercar Design Studio & Clay Model Silhouette
profile_svg = """<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1920 1080" fill="none">
  <defs>
    <radialGradient id="proGlow" cx="50%" cy="50%" r="55%">
      <stop offset="0%" stop-color="#00f0ff" stop-opacity="0.12"/>
      <stop offset="60%" stop-color="#8b5cf6" stop-opacity="0.05"/>
      <stop offset="100%" stop-color="#050814" stop-opacity="0"/>
    </radialGradient>
  </defs>
  <rect width="1920" height="1080" fill="url(#proGlow)"/>

  <!-- Sleek Aerodynamic Fastback Hypercar Silhouette under Studio Overhead Lighting -->
  <g transform="translate(360, 320)" opacity="0.38" stroke="#00f0ff">
    <!-- Body Profile Curve -->
    <path d="M80,360 C140,360 200,320 260,260 C360,160 520,110 740,110 C920,110 1040,160 1120,240 C1160,280 1200,330 1260,350 L1300,360" stroke-width="3" fill="none"/>
    <!-- Greenhouse / Roof Arc -->
    <path d="M420,175 C520,90 680,80 840,110 C960,130 1040,190 1070,240" stroke="#00ff9d" stroke-width="2" fill="none"/>
    <!-- Beltline & Door Cutlines -->
    <path d="M220,265 L1180,265" stroke-width="1.2" stroke-dasharray="10 5"/>
    <!-- Front Wheel Arch & Rim -->
    <circle cx="340" cy="360" r="70" stroke-width="2.5" fill="none"/>
    <circle cx="340" cy="360" r="45" stroke="#00ff9d" stroke-width="1.5" stroke-dasharray="8 6"/>
    <!-- Rear Wheel Arch & Rim -->
    <circle cx="1060" cy="360" r="70" stroke-width="2.5" fill="none"/>
    <circle cx="1060" cy="360" r="45" stroke="#00ff9d" stroke-width="1.5" stroke-dasharray="8 6"/>
    <!-- Ground Datum Line -->
    <line x1="80" y1="430" x2="1320" y2="430" stroke-width="1.5"/>
  </g>
</svg>"""

files = {
    "bg-dashboard.svg": dashboard_svg,
    "bg-battery.svg": battery_svg,
    "bg-energy.svg": energy_svg,
    "bg-diagnostics.svg": diagnostics_svg,
    "bg-stations.svg": stations_svg,
    "bg-navigation.svg": navigation_svg,
    "bg-smartvoice.svg": smartvoice_svg,
    "bg-reports.svg": reports_svg,
    "bg-profile.svg": profile_svg
}

for filename, content in files.items():
    filepath = os.path.join(output_dir, filename)
    with open(filepath, "w", encoding="utf-8") as f:
        f.write(content.strip())
    print(f"Created {filename} ({len(content)} bytes)")

print("All 9 module background SVGs successfully created.")
