"""
Response Formatter Service
Provides common response structure for all API endpoints.
Ensures consistent JSON responses across the application.
"""

from typing import Any, Dict, List, Optional
from flask import jsonify


def success_response(data: Optional[Dict[str, Any]] = None, message: str = "Success", status_code: int = 200) -> tuple:
    """
    Format a successful API response.
    
    Args:
        data: Optional data to include in the response
        message: Success message
        status_code: HTTP status code (default: 200)
    
    Returns:
        Tuple of (JSON response, status code)
    """
    response = {
        "success": True,
        "message": message
    }
    
    if data:
        response["data"] = data
    
    return jsonify(response), status_code


def error_response(message: str, errors: Optional[List[str]] = None, status_code: int = 400) -> tuple:
    """
    Format an error API response.
    
    Args:
        message: Error message
        errors: Optional list of specific error messages
        status_code: HTTP status code (default: 400)
    
    Returns:
        Tuple of (JSON response, status code)
    """
    response = {
        "success": False,
        "message": message
    }
    
    if errors:
        response["errors"] = errors
    
    return jsonify(response), status_code


def validation_response(errors: List[str]) -> tuple:
    """
    Format a validation error response.
    
    Args:
        errors: List of validation error messages
    
    Returns:
        Tuple of (JSON response, 400 status code)
    """
    return error_response(
        message="Validation failed",
        errors=errors,
        status_code=400
    )


def created_response(data: Dict[str, Any], message: str = "Resource created successfully") -> tuple:
    """
    Format a resource created response.
    
    Args:
        data: Created resource data
        message: Success message
    
    Returns:
        Tuple of (JSON response, 201 status code)
    """
    return success_response(data=data, message=message, status_code=201)
