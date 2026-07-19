"""
Test script to verify report ordering (newest first)
"""

from app import app
from services.report_service import save_ai_report

# Create multiple test reports with different timestamps
test_reports = [
    {
        'symptoms': 'Test report 1 - oldest',
        'ai_result': {
            'possibleCauses': ['Cause A'],
            'firstAid': ['Action A'],
            'triageLevel': 'mild',
            'confidence': 75,
            'recommendedSpecialist': 'General Physician'
        }
    },
    {
        'symptoms': 'Test report 2 - newest',
        'ai_result': {
            'possibleCauses': ['Cause B'],
            'firstAid': ['Action B'],
            'triageLevel': 'moderate',
            'confidence': 90,
            'recommendedSpecialist': 'Cardiologist'
        }
    }
]

print("Creating test reports to verify ordering...")

with app.app_context():
    for i, test_data in enumerate(test_reports):
        try:
            saved_report = save_ai_report(test_data['symptoms'], test_data['ai_result'])
            print(f"✅ Report {i+1} saved with ID: {saved_report.id}")
        except Exception as e:
            print(f"❌ Failed to save report {i+1}: {str(e)}")

print("\nNow testing GET /api/reports to verify ordering...")
