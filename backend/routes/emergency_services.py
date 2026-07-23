"""
Emergency Services Routes

API endpoints for emergency services data.
Phase 2 – Milestone 2 implementation.
"""

from flask import Blueprint, jsonify
from services.emergency_services import get_emergency_services

emergency_bp = Blueprint('emergency_services', __name__)

@emergency_bp.route('/emergency-services', methods=['GET'])
def get_services():
    """
    Get nearby emergency services.
    
    Returns:
        JSON response with emergency services data
    """
    try:
        data = get_emergency_services()
        return jsonify(data), 200
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500
