"""
AI Report Model
Represents AI-generated medical analysis reports stored in the database.
"""

from datetime import datetime
from database.db import db


class AIReport(db.Model):
    """
    SQLAlchemy model for AI-generated medical analysis reports.
    
    This model stores the results of AI symptom analysis, including
    symptoms, possible causes, first aid recommendations, severity
    assessment, confidence scores, and specialist recommendations.
    
    Each report belongs to exactly one user through a Many-to-One relationship.
    """
    
    __tablename__ = 'ai_reports'
    
    # Primary Key
    id = db.Column(
        db.Integer,
        primary_key=True,
        autoincrement=True
    )
    
    # Foreign Key to User (Many-to-One relationship)
    # Each report belongs to one user
    user_id = db.Column(
        db.Integer,
        db.ForeignKey('users.id'),
        nullable=True
    )
    
    # Symptom description
    symptoms = db.Column(
        db.Text,
        nullable=False
    )
    
    # Possible causes (stored as JSON string or comma-separated list)
    possible_causes = db.Column(
        db.Text,
        nullable=False
    )
    
    # First aid recommendations (stored as JSON string or comma-separated list)
    first_aid = db.Column(
        db.Text,
        nullable=False
    )
    
    # Severity assessment
    severity = db.Column(
        db.String(20),
        nullable=False
    )
    
    # AI confidence score (0-100)
    confidence = db.Column(
        db.Integer,
        nullable=False
    )
    
    # Recommended specialist
    recommended_specialist = db.Column(
        db.String(100),
        nullable=False
    )
    
    # Timestamp for when the report was created
    created_at = db.Column(
        db.DateTime,
        nullable=False,
        default=datetime.utcnow
    )
    
    def __repr__(self):
        """String representation of the AIReport model."""
        return f'<AIReport {self.id} - Severity: {self.severity}>'
