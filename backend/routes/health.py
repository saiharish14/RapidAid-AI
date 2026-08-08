"""
Health Check Route
Provides health check endpoint for monitoring service status.
Uses Flask Blueprint for modular routing.
"""

from flask import Blueprint, jsonify
from services.response_formatter import success_response

# Create Blueprint
health_bp = Blueprint('health', __name__)


@health_bp.route('/api/health', methods=['GET'])
def health_check():
    """
    Health check endpoint.
    Returns the status of the backend service.
    
    Returns:
        JSON response with service status
    """
    return success_response(
        data={"status": "Backend Running"},
        message="Service is healthy"
    )
