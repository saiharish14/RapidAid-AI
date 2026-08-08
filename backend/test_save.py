"""
Test script to verify report saving functionality
Simulates a successful AI analysis and saves to database
"""

from app import app
from services.report_service import save_ai_report

# Simulate a successful AI analysis result
test_symptoms = "Headache and fever for 2 days with moderate pain"
test_ai_result = {
    'possibleCauses': ['Viral infection', 'Tension headache', 'Dehydration'],
    'firstAid': ['Rest in a quiet room', 'Stay hydrated', 'Take over-the-counter pain relief'],
    'triageLevel': 'moderate',
    'confidence': 87,
    'recommendedSpecialist': 'General Physician'
}

print("Testing report save functionality...")
print(f"Symptoms: {test_symptoms}")
print(f"AI Result: {test_ai_result}")

# Run within Flask application context
with app.app_context():
    try:
        saved_report = save_ai_report(test_symptoms, test_ai_result)
        print(f"\n✅ Report saved successfully!")
        print(f"Report ID: {saved_report.id}")
        print(f"Severity: {saved_report.severity}")
        print(f"Confidence: {saved_report.confidence}")
        print(f"Specialist: {saved_report.recommended_specialist}")
        print(f"Created at: {saved_report.created_at}")
    except Exception as e:
        print(f"\n❌ Failed to save report: {str(e)}")
