"""
Report Service
Handles saving and retrieving AI-generated medical analysis reports to/from the database.
Provides transaction-safe operations for persisting and querying AI analysis results.
"""

import json
import logging
from typing import Dict, Any, List
from database.db import db
from models.ai_report import AIReport

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


def save_ai_report(symptoms: str, ai_result: Dict[str, Any], user_id: int = None) -> AIReport:
    """
    Save an AI analysis report to the database.
    
    This function creates an AIReport object from the provided symptoms
    and AI analysis result, then saves it to the database using a proper
    transaction. The transaction is committed on success and rolled back
    on any error to maintain data integrity.
    
    Args:
        symptoms: User's symptom description (string)
        ai_result: Dictionary containing AI analysis results with keys:
                   - possibleCauses: list of possible causes
                   - firstAid: list of first aid recommendations
                   - triageLevel: severity level (mild, moderate, severe, emergency)
                   - confidence: AI confidence score (0-100)
                   - recommendedSpecialist: type of specialist to consult
        user_id: Optional user ID to associate the report with a user
    
    Returns:
        AIReport: The saved AIReport object with database-generated ID
    
    Raises:
        Exception: If database operation fails (transaction is rolled back)
    
    Example:
        >>> symptoms = "Headache and fever for 2 days"
        >>> ai_result = {
        ...     'possibleCauses': ['Viral infection', 'Tension headache'],
        ...     'firstAid': ['Rest', 'Hydration'],
        ...     'triageLevel': 'moderate',
        ...     'confidence': 87,
        ...     'recommendedSpecialist': 'General Physician'
        ... }
        >>> report = save_ai_report(symptoms, ai_result, user_id=1)
        >>> print(report.id)
        1
    """
    try:
        # Start a database transaction
        # SQLAlchemy automatically begins a transaction when we perform operations
        
        # Extract data from AI result
        possible_causes_list = ai_result.get('possibleCauses', [])
        first_aid_list = ai_result.get('firstAid', [])
        severity = ai_result.get('triageLevel', 'moderate')
        confidence = ai_result.get('confidence', 0)
        recommended_specialist = ai_result.get('recommendedSpecialist', 'General Physician')
        
        # Convert lists to JSON strings for storage in TEXT columns
        possible_causes_json = json.dumps(possible_causes_list)
        first_aid_json = json.dumps(first_aid_list)
        
        # Create AIReport object
        report = AIReport(
            user_id=user_id,
            symptoms=symptoms,
            possible_causes=possible_causes_json,
            first_aid=first_aid_json,
            severity=severity,
            confidence=confidence,
            recommended_specialist=recommended_specialist
        )
        
        # Add to database session
        db.session.add(report)
        
        # Commit the transaction - this saves the record to the database
        db.session.commit()
        
        logger.info(f"Successfully saved AI report with ID: {report.id}")
        
        return report
    
    except Exception as e:
        # Roll back the transaction on any error
        # This ensures partial data is not saved if something fails
        db.session.rollback()
        
        logger.error(f"Failed to save AI report: {str(e)}")
        
        # Re-raise the exception for the caller to handle
        raise Exception(f"Database error while saving report: {str(e)}")


def delete_report(report_id: int, user_id: int) -> bool:
    """
    Delete a specific AI report from the database.
    
    This function permanently removes an AIReport record from the database.
    It ensures that the report belongs to the specified user before deletion
    to prevent unauthorized deletions.
    
    Args:
        report_id: ID of the report to delete
        user_id: User ID to verify ownership of the report
    
    Returns:
        bool: True if deletion was successful
    
    Raises:
        ValueError: If report not found or doesn't belong to the user
        Exception: If database operation fails (transaction is rolled back)
    
    Example:
        >>> delete_report(report_id=1, user_id=1)
        True
    """
    try:
        # Query for the report
        report = AIReport.query.filter_by(id=report_id, user_id=user_id).first()
        
        if not report:
            raise ValueError("Report not found or you don't have permission to delete it")
        
        # Delete the report
        db.session.delete(report)
        
        # Commit the transaction
        db.session.commit()
        
        logger.info(f"Successfully deleted report {report_id}")
        
        return True
    
    except ValueError:
        # Re-raise ValueError for specific handling
        raise
    
    except Exception as e:
        # Roll back the transaction on any error
        db.session.rollback()
        
        logger.error(f"Failed to delete report: {str(e)}")
        
        raise Exception(f"Database error while deleting report: {str(e)}")


def get_all_reports(user_id: int = None) -> List[AIReport]:
    """
    Retrieve AI reports from the database.
    
    This function queries the database for AIReport records.
    If user_id is provided, returns only reports belonging to that user.
    Results are ordered by creation date in descending order (newest first).
    All database access is handled through the service layer to
    maintain separation of concerns.
    
    Args:
        user_id: Optional user ID to filter reports by user
    
    Returns:
        List[AIReport]: List of AIReport objects ordered by created_at DESC
    
    Raises:
        Exception: If database query fails
    
    Example:
        >>> reports = get_all_reports(user_id=1)
        >>> for report in reports:
        ...     print(f"ID: {report.id}, Severity: {report.severity}")
    """
    try:
        # Query reports ordered by created_at descending (newest first)
        if user_id:
            # Filter by user_id if provided
            reports = AIReport.query.filter_by(user_id=user_id).order_by(AIReport.created_at.desc()).all()
        else:
            # Return all reports if no user_id provided (for backward compatibility)
            reports = AIReport.query.order_by(AIReport.created_at.desc()).all()
        
        logger.info(f"Successfully retrieved {len(reports)} reports")
        
        return reports
    
    except Exception as e:
        logger.error(f"Failed to retrieve reports: {str(e)}")
        raise Exception(f"Database error while retrieving reports: {str(e)}")
