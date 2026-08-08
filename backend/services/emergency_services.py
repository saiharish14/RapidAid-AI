"""
Emergency Services Service

Provides nearby emergency services data using Overpass API.
Phase 2 – Milestone 2 implementation.
"""

import requests
import math
from flask import request

def haversine_distance(lat1, lon1, lat2, lon2):
    """Calculate distance between two coordinates in kilometers."""
    R = 6371
    dlat = math.radians(lat2 - lat1)
    dlon = math.radians(lon2 - lon1)
    a = math.sin(dlat/2) * math.sin(dlat/2) + math.cos(math.radians(lat1)) * math.cos(math.radians(lat2)) * math.sin(dlon/2) * math.sin(dlon/2)
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1-a))
    return R * c

def get_emergency_services():
    """
    Returns nearby emergency services using Overpass API.
    
    Returns:
        dict: Response with success status and services list
    """
    try:
        lat = request.args.get('lat', '17.3850')
        lon = request.args.get('lon', '78.4867')
        user_lat = float(lat)
        user_lon = float(lon)
        
        radii = [5000, 10000, 15000, 25000, 50000]
        all_services = []
        seen_ids = set()
        
        for radius in radii:
            overpass_query = f"""
            [out:json][timeout:25];
            (
              node["amenity"="hospital"](around:{radius},{user_lat},{user_lon});
              node["amenity"="clinic"](around:{radius},{user_lat},{user_lon});
              node["amenity"="pharmacy"](around:{radius},{user_lat},{user_lon});
              node["amenity"="doctors"](around:{radius},{user_lat},{user_lon});
              node["amenity"="police"](around:{radius},{user_lat},{user_lon});
              node["amenity"="fire_station"](around:{radius},{user_lat},{user_lon});
              node["emergency"="ambulance_station"](around:{radius},{user_lat},{user_lon});
              node["emergency"="ambulance"](around:{radius},{user_lat},{user_lon});
              way["amenity"="hospital"](around:{radius},{user_lat},{user_lon});
              way["amenity"="clinic"](around:{radius},{user_lat},{user_lon});
              way["amenity"="pharmacy"](around:{radius},{user_lat},{user_lon});
              way["amenity"="doctors"](around:{radius},{user_lat},{user_lon});
              way["amenity"="police"](around:{radius},{user_lat},{user_lon});
              way["amenity"="fire_station"](around:{radius},{user_lat},{user_lon});
              way["emergency"="ambulance_station"](around:{radius},{user_lat},{user_lon});
              way["emergency"="ambulance"](around:{radius},{user_lat},{user_lon});
            );
            out center;
            """
            
            response = requests.post(
                'https://overpass-api.de/api/interpreter',
                data={'data': overpass_query},
                timeout=30
            )
            
            if response.status_code == 200:
                data = response.json()
                for element in data.get('elements', []):
                    elem_id = element.get('id')
                    if elem_id in seen_ids:
                        continue
                    seen_ids.add(elem_id)
                    
                    tags = element.get('tags', {})
                    lat = element.get('lat') or element.get('center', {}.get('lat'))
                    lon = element.get('lon') or element.get('center', {}.get('lon'))
                    
                    if not lat or not lon:
                        continue
                    
                    distance = haversine_distance(user_lat, user_lon, lat, lon)
                    
                    category = "Other"
                    if tags.get('amenity') == 'hospital':
                        category = "Hospital"
                    elif tags.get('amenity') == 'clinic':
                        category = "Clinic"
                    elif tags.get('amenity') == 'pharmacy':
                        category = "Pharmacy"
                    elif tags.get('amenity') == 'doctors':
                        category = "Clinic"
                    elif tags.get('amenity') == 'police':
                        category = "Police"
                    elif tags.get('amenity') == 'fire_station':
                        category = "Fire Station"
                    elif tags.get('emergency') in ['ambulance_station', 'ambulance']:
                        category = "Ambulance"
                    
                    service = {
                        "id": elem_id,
                        "name": tags.get('name', 'Unknown'),
                        "category": category,
                        "address": tags.get('addr:full') or tags.get('addr:street', 'Address not available'),
                        "phone": tags.get('phone', tags.get('contact:phone', 'Not available')),
                        "distance": f"{distance:.1f} km",
                        "rating": 4.0,
                        "isOpen": True,
                        "latitude": lat,
                        "longitude": lon
                    }
                    all_services.append(service)
            
            if len(all_services) >= 20:
                break
        
        all_services.sort(key=lambda x: float(x['distance'].split()[0]))
        
        return {
            "success": True,
            "services": all_services[:50]
        }
    except Exception as e:
        return {
            "success": False,
            "services": [],
            "error": str(e)
        }
