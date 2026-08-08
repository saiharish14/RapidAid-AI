"""
Validation Service
Validates incoming JSON data for API endpoints.
Provides comprehensive validation for symptom analysis requests.
"""

from typing import Dict, List, Any, Optional


class ValidationError(Exception):
    """Custom exception for validation errors."""
    pass


class SymptomAnalyzerValidator:
    """Validator for symptom analysis requests."""
    
    REQUIRED_FIELDS = ['age', 'gender', 'symptoms', 'duration', 'painLevel']
    OPTIONAL_FIELDS = ['medicalHistory', 'medications', 'allergies']
    
    VALID_GENDERS = ['male', 'female', 'other', 'prefer_not_to_say']
    VALID_PAIN_LEVELS = ['mild', 'moderate', 'severe', 'extreme']
    
    @staticmethod
    def validate_symptom_request(data: Dict[str, Any]) -> tuple[bool, List[str]]:
        """
        Validate symptom analysis request data.
        
        Args:
            data: Dictionary containing request data
        
        Returns:
            Tuple of (is_valid, list of error messages)
        """
        errors = []
        
        # Check if data is provided
        if not data:
            errors.append("Request body is required")
            return False, errors
        
        # Validate required fields
        for field in SymptomAnalyzerValidator.REQUIRED_FIELDS:
            if field not in data:
                errors.append(f"Missing required field: {field}")
            elif data[field] is None or (isinstance(data[field], str) and not data[field].strip()):
                errors.append(f"Field '{field}' cannot be empty")
        
        # If there are missing/empty fields, return early
        if errors:
            return False, errors
        
        # Validate field types and values
        errors.extend(SymptomAnalyzerValidator._validate_field_types(data))
        errors.extend(SymptomAnalyzerValidator._validate_field_values(data))
        
        # Validate optional fields if provided
        errors.extend(SymptomAnalyzerValidator._validate_optional_fields(data))
        
        return len(errors) == 0, errors
    
    @staticmethod
    def _validate_field_types(data: Dict[str, Any]) -> List[str]:
        """Validate data types of required fields."""
        errors = []
        
        # Validate age
        if not isinstance(data.get('age'), (int, float)):
            errors.append("Field 'age' must be a number")
        elif data['age'] < 0 or data['age'] > 150:
            errors.append("Field 'age' must be between 0 and 150")
        
        # Validate gender
        if not isinstance(data.get('gender'), str):
            errors.append("Field 'gender' must be a string")
        
        # Validate symptoms
        if not isinstance(data.get('symptoms'), str):
            errors.append("Field 'symptoms' must be a string")
        elif len(data['symptoms']) < 10:
            errors.append("Field 'symptoms' must be at least 10 characters long")
        
        # Validate duration
        if not isinstance(data.get('duration'), str):
            errors.append("Field 'duration' must be a string")
        elif len(data['duration']) < 2:
            errors.append("Field 'duration' must be at least 2 characters long")
        
        # Validate painLevel
        if not isinstance(data.get('painLevel'), str):
            errors.append("Field 'painLevel' must be a string")
        
        return errors
    
    @staticmethod
    def _validate_field_values(data: Dict[str, Any]) -> List[str]:
        """Validate values of enum-like fields."""
        errors = []
        
        # Validate gender value
        gender = data.get('gender', '').lower().strip()
        if gender not in SymptomAnalyzerValidator.VALID_GENDERS:
            errors.append(f"Field 'gender' must be one of: {', '.join(SymptomAnalyzerValidator.VALID_GENDERS)}")
        
        # Validate painLevel value
        pain_level = data.get('painLevel', '').lower().strip()
        if pain_level not in SymptomAnalyzerValidator.VALID_PAIN_LEVELS:
            errors.append(f"Field 'painLevel' must be one of: {', '.join(SymptomAnalyzerValidator.VALID_PAIN_LEVELS)}")
        
        return errors
    
    @staticmethod
    def _validate_optional_fields(data: Dict[str, Any]) -> List[str]:
        """Validate optional fields if provided."""
        errors = []
        
        # Validate medicalHistory if provided
        if 'medicalHistory' in data and data['medicalHistory']:
            if not isinstance(data['medicalHistory'], str):
                errors.append("Field 'medicalHistory' must be a string")
        
        # Validate medications if provided
        if 'medications' in data and data['medications']:
            if not isinstance(data['medications'], str):
                errors.append("Field 'medications' must be a string")
        
        # Validate allergies if provided
        if 'allergies' in data and data['allergies']:
            if not isinstance(data['allergies'], str):
                errors.append("Field 'allergies' must be a string")
        
        return errors


def validate_request_data(data: Dict[str, Any]) -> tuple[bool, List[str]]:
    """
    Public function to validate request data.
    
    Args:
        data: Dictionary containing request data
    
    Returns:
        Tuple of (is_valid, list of error messages)
    """
    return SymptomAnalyzerValidator.validate_symptom_request(data)
