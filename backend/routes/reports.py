"""
Reports Route
Handles retrieval and deletion of previously saved AI analysis reports.
Uses Flask Blueprint for modular routing.
"""

import json
import logging
from flask import Blueprint, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from services.response_formatter import success_response, error_response
from services.report_service import get_all_reports, delete_report

# Configure logging
logger = logging.getLogger(__name__)

# Create Blueprint
reports_bp = Blueprint('reports', __name__)


@reports_bp.route('/api/reports', methods=['GET'])
@jwt_required()
def get_reports():
    """
    Get all AI reports endpoint.
    Retrieves previously saved AI analysis reports for the authenticated user.
    Requires JWT authentication.
    
    Returns:
        On success: JSON with array of report objects ordered by creation date (newest first) (200)
        On database failure: JSON with error message (500)
        On authentication failure: JSON with error message (401)
    
    Response Format:
        {
            "success": true,
            "message": "Reports retrieved successfully",
            "data": [
                {
                    "id": 1,
                    "symptoms": "Headache and fever",
                    "possible_causes": ["Viral infection", "Tension headache"],
                    "first_aid": ["Rest", "Hydration"],
                    "severity": "moderate",
                    "confidence": 87,
                    "recommended_specialist": "General Physician",
                    "created_at": "2026-07-18T18:56:20"
                },
                ...
            ]
        }
    """
    try:
        # Get authenticated user ID from JWT
        user_id = int(get_jwt_identity())
        
        # Retrieve reports for the authenticated user (ordered by created_at DESC)
        reports = get_all_reports(user_id=user_id)
        
        # Serialize AIReport objects to JSON-compatible dictionaries
        serialized_reports = []
        for report in reports:
            serialized_report = {
                'id': report.id,
                'symptoms': report.symptoms,
                'possible_causes': json.loads(report.possible_causes),
                'first_aid': json.loads(report.first_aid),
                'severity': report.severity,
                'confidence': report.confidence,
                'recommended_specialist': report.recommended_specialist,
                'created_at': report.created_at.isoformat()
            }
            serialized_reports.append(serialized_report)
        
        logger.info(f"Successfully retrieved {len(serialized_reports)} reports for user: {user_id}")
        
        return success_response(
            data=serialized_reports,
            message="Reports retrieved successfully"
        )
    
    except Exception as e:
        logger.error(f"Failed to retrieve reports: {str(e)}")
        return error_response(
            message=f"Failed to retrieve reports: {str(e)}",
            status_code=500
        )


@reports_bp.route('/api/reports/<int:report_id>', methods=['DELETE'])
@jwt_required()
def delete_report_endpoint(report_id):
    """
    Delete a specific AI report endpoint.
    Permanently removes a report for the authenticated user.
    Requires JWT authentication.
    
    Args:
        report_id: ID of the report to delete
    
    Returns:
        On success: JSON with success message (200)
        On not found: JSON with error message (404)
        On database failure: JSON with error message (500)
        On authentication failure: JSON with error message (401)
    
    Response Format:
        {
            "success": true,
            "message": "Report deleted successfully"
        }
    """
    try:
        # Get authenticated user ID from JWT
        user_id = int(get_jwt_identity())
        
        # Delete the report
        delete_report(report_id=report_id, user_id=user_id)
        
        logger.info(f"Successfully deleted report {report_id} for user: {user_id}")
        
        return success_response(
            message="Report deleted successfully"
        )
    
    except ValueError as e:
        # Report not found or doesn't belong to user
        logger.error(f"Report not found: {str(e)}")
        return error_response(
            message=str(e),
            status_code=404
        )
    
    except Exception as e:
        logger.error(f"Failed to delete report: {str(e)}")
        return error_response(
            message=f"Failed to delete report: {str(e)}",
            status_code=500
        )
