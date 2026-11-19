import math
from typing import List, Dict, Any
from app.models.vehicle import Vehicle
from app.models.charging import ChargingStation
from app.schemas.routes import RouteOption, RouteChargingStopDetail, RouteOptimizeResponse
from app.schemas.charging import ChargingStationOut


def calculate_haversine_distance(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    """Haversine formula to compute distance in km between two coordinate pairs."""
    R = 6371.0 # Earth radius in km
    dlat = math.radians(lat2 - lat1)
    dlon = math.radians(lon2 - lon1)
    a = (math.sin(dlat / 2) ** 2 +
         math.cos(math.radians(lat1)) * math.cos(math.radians(lat2)) * math.sin(dlon / 2) ** 2)
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
    return R * c


def optimize_ev_routes(
    vehicle: Vehicle,
    origin: str,
    destination: str,
    current_battery_pct: float,
    desired_arrival_pct: float,
    available_stations: List[ChargingStation]
) -> RouteOptimizeResponse:
    """
    Computes three optimized EV travel itineraries:
    1. Fastest Route (Highway speeds, higher consumption, rapid charging stop if needed)
    2. Lowest Energy Route (Eco-speed parkway, optimal regeneration, minimizes kWh)
    3. Recommended Balanced Route (Optimum blend of duration, safety buffer, and charging ease)
    """
    battery_cap = float(vehicle.battery_capacity)
    available_energy = battery_cap * (current_battery_pct / 100.0)
    base_eff = float(vehicle.efficiency_kwh_km)

    # Coordinates mapping for common demo locations or default San Francisco metro coordinates
    demo_coords = {
        "san francisco": (37.7749, -122.4194),
        "san jose": (37.3382, -121.8863),
        "oakland": (37.8044, -122.2712),
        "palo alto": (37.4419, -122.1430),
        "sacramento": (38.5816, -121.4944),
        "los angeles": (34.0522, -118.2437)
    }

    orig_lower = origin.lower().strip()
    dest_lower = destination.lower().strip()

    start_lat, start_lng = demo_coords.get(orig_lower, (37.7749, -122.4194))
    end_lat, end_lng = demo_coords.get(dest_lower, (37.3382, -121.8863))

    straight_dist = calculate_haversine_distance(start_lat, start_lng, end_lat, end_lng)
    if straight_dist < 10.0:
        straight_dist = 68.0 # Standard demo corridor distance (SF to Silicon Valley)

    # 1. Fastest Route
    fastest_dist = round(straight_dist * 1.15, 1)
    fastest_eff = base_eff * 1.14 # Higher aerodynamic drag at 110-120 km/h
    fastest_energy = round(fastest_dist * fastest_eff, 1)
    fastest_drive_time = int(fastest_dist / 105.0 * 60) # mins

    # 2. Lowest Energy Route
    eco_dist = round(straight_dist * 1.08, 1)
    eco_eff = base_eff * 0.90 # Eco speeds (65-80 km/h) & regenerative braking
    eco_energy = round(eco_dist * eco_eff, 1)
    eco_drive_time = int(eco_dist / 70.0 * 60) # mins

    # 3. Recommended Balanced Route
    balanced_dist = round(straight_dist * 1.10, 1)
    balanced_eff = base_eff * 1.00 # Nominal cruise
    balanced_energy = round(balanced_dist * balanced_eff, 1)
    balanced_drive_time = int(balanced_dist / 90.0 * 60) # mins

    def evaluate_route_stops(dist: float, energy: float, drive_time: int) -> Dict[str, Any]:
        required_pct = (energy / battery_cap) * 100.0
        remaining_at_arrival = current_battery_pct - required_pct

        stops = []
        charge_time = 0
        arrival_pct = remaining_at_arrival

        # If arrival battery is lower than driver's desired buffer, add a fast charging stop
        if remaining_at_arrival < desired_arrival_pct and available_stations:
            chosen_station = available_stations[0]
            # Calculate needed charge to safely reach destination with desired buffer
            deficit_energy = (desired_arrival_pct - remaining_at_arrival) / 100.0 * battery_cap + 6.0
            power = max(float(chosen_station.charging_power), 50.0)
            charge_duration = int(deficit_energy / (power * 0.90) * 60) + 5 # 5 min connect buffer
            charge_time = max(12, charge_duration)
            arrival_pct = desired_arrival_pct + 8.0

            stops.append(RouteChargingStopDetail(
                stop_order=1,
                station=ChargingStationOut.from_orm(chosen_station),
                estimated_arrival_soc=max(12.0, round(current_battery_pct * 0.45, 1)),
                estimated_charging_duration_min=charge_time,
                target_soc=min(85.0, round(current_battery_pct + 45.0, 1)),
                added_range_km=round(deficit_energy / base_eff, 1)
            ))
        else:
            arrival_pct = round(max(8.0, remaining_at_arrival), 1)

        return {
            "stops": stops,
            "charge_time": charge_time,
            "total_time": drive_time + charge_time,
            "arrival_pct": arrival_pct
        }

    fast_eval = evaluate_route_stops(fastest_dist, fastest_energy, fastest_drive_time)
    eco_eval = evaluate_route_stops(eco_dist, eco_energy, eco_drive_time)
    bal_eval = evaluate_route_stops(balanced_dist, balanced_energy, balanced_drive_time)

    # Waypoints generator for interactive map rendering
    def make_waypoints(lat1, lon1, lat2, lon2, curvature: float):
        points = []
        steps = 10
        mid_lat = (lat1 + lat2) / 2.0
        mid_lon = (lon1 + lon2) / 2.0 + curvature
        for i in range(steps + 1):
            t = i / steps
            # Quadratic bezier curve
            lat = (1 - t) ** 2 * lat1 + 2 * (1 - t) * t * mid_lat + t ** 2 * lat2
            lon = (1 - t) ** 2 * lon1 + 2 * (1 - t) * t * mid_lon + t ** 2 * lon2
            points.append([round(lat, 5), round(lon, 5)])
        return points

    routes = [
        RouteOption(
            route_id="route_balanced",
            title="Recommended Balanced Route",
            badge="Best Compromise",
            distance_km=balanced_dist,
            driving_time_minutes=balanced_drive_time,
            charging_time_minutes=bal_eval["charge_time"],
            total_time_minutes=bal_eval["total_time"],
            estimated_energy_kwh=balanced_energy,
            arrival_battery_pct=bal_eval["arrival_pct"],
            charging_stops_count=len(bal_eval["stops"]),
            charging_stops=bal_eval["stops"],
            co2_saved_kg=round(balanced_dist * 0.120, 2),
            summary="Smooth traffic flow on highway corridor with guaranteed charger density and minimal battery degradation.",
            waypoints=make_waypoints(start_lat, start_lng, end_lat, end_lng, 0.02)
        ),
        RouteOption(
            route_id="route_fastest",
            title="Fastest Highway Route",
            badge="Min Travel Time",
            distance_km=fastest_dist,
            driving_time_minutes=fastest_drive_time,
            charging_time_minutes=fast_eval["charge_time"],
            total_time_minutes=fast_eval["total_time"],
            estimated_energy_kwh=fastest_energy,
            arrival_battery_pct=fast_eval["arrival_pct"],
            charging_stops_count=len(fast_eval["stops"]),
            charging_stops=fast_eval["stops"],
            co2_saved_kg=round(fastest_dist * 0.105, 2),
            summary="High-speed expressway route with direct interstate connectivity. Energy consumption is ~14% higher due to aero drag.",
            waypoints=make_waypoints(start_lat, start_lng, end_lat, end_lng, -0.01)
        ),
        RouteOption(
            route_id="route_eco",
            title="Lowest Energy Eco Route",
            badge="Max Energy Efficiency",
            distance_km=eco_dist,
            driving_time_minutes=eco_drive_time,
            charging_time_minutes=eco_eval["charge_time"],
            total_time_minutes=eco_eval["total_time"],
            estimated_energy_kwh=eco_energy,
            arrival_battery_pct=eco_eval["arrival_pct"],
            charging_stops_count=len(eco_eval["stops"]),
            charging_stops=eco_eval["stops"],
            co2_saved_kg=round(eco_dist * 0.135, 2),
            summary="Optimized for regenerative braking and lower average speeds. Consumes minimal kWh, preserving battery safety margin.",
            waypoints=make_waypoints(start_lat, start_lng, end_lat, end_lng, 0.05)
        )
    ]

    return RouteOptimizeResponse(
        vehicle_id=vehicle.id,
        origin=origin,
        destination=destination,
        current_battery_pct=current_battery_pct,
        estimated_available_energy_kwh=round(available_energy, 2),
        routes=routes,
        recommended_route_id="route_balanced"
    )
