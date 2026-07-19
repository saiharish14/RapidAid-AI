"""
AI Prompt Service
Handles prompt generation and formatting for AI integration.
Designed for future Gemini API integration.
"""

from typing import Dict, Any


class PromptGenerator:
    """Generates prompts for AI symptom analysis."""
    
    @staticmethod
    def generate_analysis_prompt(patient_data: Dict[str, Any]) -> str:
        """
        Generate a comprehensive prompt for symptom analysis.
        
        Args:
            patient_data: Dictionary containing patient information
        
        Returns:
            Formatted prompt string for AI processing
        """
        prompt = f"""
You are a medical AI assistant specializing in emergency triage and first aid recommendations.
Analyze the following patient information and provide appropriate medical guidance.

IMPORTANT: You are NOT diagnosing diseases. You are providing educational guidance and urgency assessment only.

Patient Information:
- Age: {patient_data.get('age', 'Not provided')}
- Gender: {patient_data.get('gender', 'Not provided')}
- Symptoms: {patient_data.get('symptoms', 'Not provided')}
- Duration: {patient_data.get('duration', 'Not provided')}
- Pain Level: {patient_data.get('painLevel', 'Not provided')}
"""

        # Add optional information if provided
        if patient_data.get('medicalHistory'):
            prompt += f"- Medical History: {patient_data['medicalHistory']}\n"
        
        if patient_data.get('medications'):
            prompt += f"- Current Medications: {patient_data['medications']}\n"
        
        if patient_data.get('allergies'):
            prompt += f"- Allergies: {patient_data['allergies']}\n"
        
        prompt += """
Based on the provided information, assess the urgency and provide educational guidance.

IMPORTANT: Respond ONLY in valid JSON format with the following exact structure:

{
  "triageLevel": "mild|moderate|severe|emergency",
  "possibleCauses": ["cause1", "cause2", ...],
  "firstAid": ["step1", "step2", ...],
  "recommendedSpecialist": "specialist type",
  "seekEmergencyCare": true|false,
  "disclaimer": "Your medical disclaimer text"
}

Field descriptions:
- triageLevel: Assess urgency (mild, moderate, severe, or emergency)
- possibleCauses: List of 2-4 possible causes based on symptoms (educational only)
- firstAid: List of 3-5 immediate first aid recommendations
- recommendedSpecialist: Type of specialist to consult (e.g., "General Physician", "Cardiologist")
- seekEmergencyCare: Boolean indicating if emergency care should be sought immediately
- disclaimer: Include a standard medical disclaimer about seeking professional medical advice

Do not include any text outside the JSON. Do not provide a diagnosis. This is for educational purposes only.
"""
        return prompt
    
    @staticmethod
    def generate_triage_prompt(symptoms: str, pain_level: str) -> str:
        """
        Generate a focused prompt for triage assessment.
        
        Args:
            symptoms: Patient symptoms description
            pain_level: Reported pain level
        
        Returns:
            Formatted prompt string for triage assessment
        """
        return f"""
Assess the urgency of the following medical situation:

Symptoms: {symptoms}
Pain Level: {pain_level}

Provide a triage assessment with:
- Urgency level (1-5, where 5 is most urgent)
- Recommended time frame for seeking medical attention
- Immediate actions the patient should take
"""
    
    @staticmethod
    def format_response_for_api(ai_response: str) -> Dict[str, Any]:
        """
        Format AI response for API consumption.
        
        Args:
            ai_response: Raw response from AI service
        
        Returns:
            Formatted dictionary with structured response data
        
        Note:
            This is a placeholder for future implementation.
            Actual implementation will depend on AI service response format.
        """
        return {
            "raw_response": ai_response,
            "structured_data": None,
            "confidence": None,
            "requires_medical_attention": None
        }


def get_analysis_prompt(patient_data: Dict[str, Any]) -> str:
    """
    Public function to generate analysis prompt.
    
    Args:
        patient_data: Dictionary containing patient information
    
    Returns:
        Formatted prompt string
    """
    return PromptGenerator.generate_analysis_prompt(patient_data)


def get_triage_prompt(symptoms: str, pain_level: str) -> str:
    """
    Public function to generate triage prompt.
    
    Args:
        symptoms: Patient symptoms description
        pain_level: Reported pain level
    
    Returns:
        Formatted prompt string
    """
    return PromptGenerator.generate_triage_prompt(symptoms, pain_level)
