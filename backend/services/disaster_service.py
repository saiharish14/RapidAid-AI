"""
Disaster Alert Service Module
Handles fetching disaster alerts from external APIs or providing mock data.
Designed for future integration with real disaster alert APIs.
"""

import os
import logging
from datetime import datetime, timedelta

logger = logging.getLogger(__name__)


class DisasterService:
    """Service for fetching disaster alerts."""
    
    def __init__(self):
        """Initialize disaster service."""
        self.api_key = os.getenv('DISASTER_API_KEY')
    
    def get_disaster_alerts(self):
        """
        Get disaster alerts from external API or return mock data.
        
        Returns:
            list: List of disaster alert dictionaries
        """
        # If no API key is configured, return mock data
        # This allows the service to work without external dependencies
        # and makes it easy to integrate with a real API later
        if not self.api_key:
            logger.info("No disaster API key configured, returning mock data")
            return self._get_mock_alerts()
        
        # Future: Call real disaster API here
        # Example: return self._fetch_from_api()
        return self._get_mock_alerts()
    
    def _get_mock_alerts(self):
        """
        Return mock disaster alert data.
        
        Returns:
            list: Mock disaster alerts
        """
        mock_alerts = [
            {
                "id": 1,
                "title": "Heavy Rain Warning",
                "severity": "Medium",
                "location": "Guntur",
                "description": "Heavy rainfall expected within the next 24 hours.",
                "time": "2 hours ago"
            },
            {
                "id": 2,
                "title": "Heatwave Alert",
                "severity": "High",
                "location": "Vijayawada",
                "description": "Avoid outdoor activities during afternoon hours.",
                "time": "Today"
            },
            {
                "id": 3,
                "title": "Flood Warning",
                "severity": "Critical",
                "location": "Krishna District",
                "description": "Severe flooding expected in low-lying areas. Evacuation recommended.",
                "time": "1 hour ago"
            },
            {
                "id": 4,
                "title": "Thunderstorm Alert",
                "severity": "Medium",
                "location": "Amaravati",
                "description": "Thunderstorms with lightning expected. Stay indoors.",
                "time": "3 hours ago"
            },
            {
                "id": 5,
                "title": "Cyclone Watch",
                "severity": "High",
                "location": "Coastal Andhra",
                "description": "Cyclone forming in Bay of Bengal. Monitor updates.",
                "time": "Today"
            },
            {
                "id": 6,
                "title": "Wind Advisory",
                "severity": "Low",
                "location": "Nellore",
                "description": "Strong winds expected. Secure loose objects.",
                "time": "4 hours ago"
            }
        ]
        
        return mock_alerts
    
    def _fetch_from_api(self):
        """
        Fetch disaster alerts from external API (placeholder for future implementation).
        
        Returns:
            list: Disaster alerts from external API
        """
        # Future implementation:
        # import requests
        # response = requests.get(
        #     'https://api.disaster-service.com/alerts',
        #     headers={'Authorization': f'Bearer {self.api_key}'}
        # )
        # return response.json()
        logger.warning("External API integration not yet implemented")
        return self._get_mock_alerts()


# Singleton instance
disaster_service = DisasterService()
