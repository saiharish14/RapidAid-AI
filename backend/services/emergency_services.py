"""
Emergency Services Service

Provides mock data for nearby emergency services.
Phase 2 – Milestone 2 implementation.
"""

def get_emergency_services():
    """
    Returns mock emergency services data.
    
    Returns:
        dict: Response with success status and services list
    """
    services = [
        {
            "id": 1,
            "name": "City General Hospital",
            "category": "Hospital",
            "address": "123 Main Street, Downtown",
            "phone": "+91 9876543210",
            "distance": "1.2 km",
            "rating": 4.5,
            "isOpen": True,
            "latitude": 17.3850,
            "longitude": 78.4867
        },
        {
            "id": 2,
            "name": "Apollo Hospital",
            "category": "Hospital",
            "address": "456 Health Avenue, Medical District",
            "phone": "+91 9876543211",
            "distance": "2.5 km",
            "rating": 4.8,
            "isOpen": True,
            "latitude": 17.3900,
            "longitude": 78.4900
        },
        {
            "id": 3,
            "name": "Emergency Ambulance Service",
            "category": "Ambulance",
            "address": "789 Emergency Road, Central",
            "phone": "+91 108",
            "distance": "0.8 km",
            "rating": 4.2,
            "isOpen": True,
            "latitude": 17.3880,
            "longitude": 78.4880
        },
        {
            "id": 4,
            "name": "City Police Station",
            "category": "Police",
            "address": "321 Law Street, Civic Center",
            "phone": "+91 100",
            "distance": "1.5 km",
            "rating": 4.0,
            "isOpen": True,
            "latitude": 17.3920,
            "longitude": 78.4920
        },
        {
            "id": 5,
            "name": "Central Fire Station",
            "category": "Fire Station",
            "address": "654 Fire Lane, Industrial Area",
            "phone": "+91 101",
            "distance": "2.0 km",
            "rating": 4.6,
            "isOpen": True,
            "latitude": 17.3950,
            "longitude": 78.4950
        },
        {
            "id": 6,
            "name": "MediPlus Pharmacy",
            "category": "Pharmacy",
            "address": "987 Health Road, Near Hospital",
            "phone": "+91 9876543212",
            "distance": "0.5 km",
            "rating": 4.3,
            "isOpen": True,
            "latitude": 17.3860,
            "longitude": 78.4870
        },
        {
            "id": 7,
            "name": "Sunrise Pharmacy",
            "category": "Pharmacy",
            "address": "147 Medicine Street, Residential Area",
            "phone": "+91 9876543213",
            "distance": "1.8 km",
            "rating": 4.1,
            "isOpen": False,
            "latitude": 17.3870,
            "longitude": 78.4890
        },
        {
            "id": 8,
            "name": "District Hospital",
            "category": "Hospital",
            "address": "258 District Road, Government Complex",
            "phone": "+91 9876543214",
            "distance": "3.2 km",
            "rating": 4.4,
            "isOpen": True,
            "latitude": 17.4000,
            "longitude": 78.5000
        },
        {
            "id": 9,
            "name": "Private Ambulance",
            "category": "Ambulance",
            "address": "369 Transport Avenue, Near Highway",
            "phone": "+91 9876543215",
            "distance": "2.8 km",
            "rating": 4.0,
            "isOpen": True,
            "latitude": 17.4020,
            "longitude": 78.5020
        },
        {
            "id": 10,
            "name": "Suburban Police Station",
            "category": "Police",
            "address": "741 Security Road, Suburb",
            "phone": "+91 9876543216",
            "distance": "4.5 km",
            "rating": 3.8,
            "isOpen": True,
            "latitude": 17.4100,
            "longitude": 78.5100
        }
    ]
    
    return {
        "success": True,
        "services": services
    }
