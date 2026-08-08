"""
Disaster Alerts Routes Module
Handles disaster alert endpoints.
"""

from flask import Blueprint, jsonify
from services.disaster_service import disaster_service
import logging

logger = logging.getLogger(__name__)

# Create Blueprint for disaster alerts routes
disaster_bp = Blueprint('disaster', __name__)


@disaster_bp.route('/disaster-alerts', methods=['GET'])
def get_disaster_alerts():
    """
    Get current disaster alerts.
    
    Returns:
        Success: JSON with list of disaster alerts
        Error: Error message
    """
    try:
        logger.info("Fetching disaster alerts")
        
        alerts = disaster_service.get_disaster_alerts()
        
        return jsonify({
            'success': True,
            'alerts': alerts
        }), 200
        
    except Exception as e:
        logger.error(f"Error fetching disaster alerts: {str(e)}")
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500
