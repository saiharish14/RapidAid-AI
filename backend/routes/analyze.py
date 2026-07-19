"""
Analyze Route
Handles symptom analysis requests with validation and AI integration.
Uses Flask Blueprint for modular routing.
"""

from flask import Blueprint, request
from flask_jwt_extended import jwt_required, get_jwt_identity
from services.validation import validate_request_data
from services.response_formatter import success_response, validation_response, error_response
from services.ai_prompt import get_analysis_prompt
from services.gemini_service import analyze_medical_case
from services.report_service import save_ai_report
import logging
import traceback

# Configure logging
logger = logging.getLogger(__name__)

# Create Blueprint
analyze_bp = Blueprint('analyze', __name__)


@analyze_bp.route('/api/analyze', methods=['POST'])
@jwt_required()
def analyze_symptoms():
    """
    Analyze symptoms endpoint.
    Validates incoming JSON data, generates AI prompt, and returns medical analysis.
    Requires JWT authentication.
    
    Request Body (Required Fields):
        - age: Patient age (number, 0-150)
        - gender: Patient gender (string: male, female, other, prefer_not_to_say)
        - symptoms: Symptoms description (string, min 10 characters)
        - duration: Duration of symptoms (string, min 2 characters)
        - painLevel: Pain level (string: mild, moderate, severe, extreme)
    
    Request Body (Optional Fields):
        - medicalHistory: Medical history (string)
        - medications: Current medications (string)
        - allergies: Known allergies (string)
    
    Returns:
        On validation success: JSON with AI analysis results (200)
        On validation failure: JSON with error status and validation errors (400)
        On AI service failure: JSON with error message (500)
        On authentication failure: JSON with error message (401)
    """
    logger.info("=== Starting analyze_symptoms ===")
    
    # Get authenticated user ID from JWT
    try:
        user_id = int(get_jwt_identity())
        logger.info(f"Successfully extracted user_id: {user_id}")
    except Exception as e:
        logger.error(f"Failed to get user identity: {str(e)}\n{traceback.format_exc()}")
        return error_response(
            message="Authentication failed",
            status_code=401
        )
    
    # Get JSON data from request
    try:
        data = request.get_json()
        logger.info(f"Received request data: {data}")
    except Exception as e:
        logger.error(f"Failed to parse JSON: {str(e)}\n{traceback.format_exc()}")
        return error_response(
            message="Invalid JSON in request body",
            status_code=400
        )
    
    # Validate request data
    try:
        is_valid, errors = validate_request_data(data)
        logger.info(f"Validation result: is_valid={is_valid}, errors={errors}")
    except Exception as e:
        logger.error(f"Validation failed with exception: {str(e)}\n{traceback.format_exc()}")
        return error_response(
            message=f"Validation error: {str(e)}",
            status_code=500
        )
    
    # Return validation response
    if not is_valid:
        return validation_response(errors)
    
    # Generate AI prompt from validated data
    try:
        logger.info("Generating AI prompt...")
        prompt = get_analysis_prompt(data)
        logger.info("AI prompt generated successfully")
    except Exception as e:
        logger.error(f"Failed to generate AI prompt: {str(e)}\n{traceback.format_exc()}")
        return error_response(
            message="Failed to generate AI prompt",
            status_code=500
        )
    
    # Call Gemini service for analysis
    try:
        logger.info("Calling Gemini service...")
        ai_result = analyze_medical_case(prompt)
        logger.info(f"AI service returned: success={ai_result.get('success')}")
        
        # With production fallback mode, AI service always returns success: true
        # If it fails internally, it automatically falls back to mock mode
        if not ai_result.get("success"):
            # This should never happen with the new fallback implementation
            logger.error("AI service returned success: false (unexpected)")
            return error_response(
                message="AI service error",
                status_code=500
            )
        
        # Save report to database with user_id (non-blocking - errors won't affect API response)
        try:
            symptoms = data.get('symptoms', '')
            ai_data = ai_result.get("data", {})
            logger.info(f"Saving report to database for user_id: {user_id}")
            
            # Add confidence if not present in AI response (use default)
            if 'confidence' not in ai_data:
                ai_data['confidence'] = 85  # Default confidence score
                logger.info("Added default confidence score")
            
            saved_report = save_ai_report(symptoms, ai_data, user_id=user_id)
            logger.info(f"AI report saved with ID: {saved_report.id} for user: {user_id}")
        except Exception as db_error:
            # Log the error but don't fail the API response
            logger.error(f"Failed to save AI report to database: {str(db_error)}\n{traceback.format_exc()}")
        
        # Return successful analysis
        logger.info("Returning successful analysis response")
        return success_response(
            data=ai_result.get("data"),
            message="Analysis completed successfully"
        )
    
    except Exception as e:
        logger.error(f"Unexpected error in analyze flow: {str(e)}\n{traceback.format_exc()}")
        return error_response(
            message=f"Analysis error: {str(e)}",
            status_code=500
        )
