"""
Preparedness Kit Model
Stores user's emergency preparedness checklist progress.
Phase 1 – Lesson 1.4 implementation.
"""

from datetime import datetime
from database.db import db


class PreparednessKit(db.Model):
    """
    Preparedness Kit model for storing emergency preparedness checklist progress.
    One-to-One relationship with User model.
    """
    __tablename__ = 'preparedness_kits'

    id = db.Column(
        db.Integer,
        primary_key=True,
        autoincrement=True
    )
    
    user_id = db.Column(
        db.Integer,
        db.ForeignKey('users.id', ondelete='CASCADE'),
        unique=True,
        nullable=False,
        index=True
    )
    
    # Checklist items stored as JSON with boolean values
    # Structure: { "medical": {...}, "emergency_supplies": {...}, "documents": {...} }
    checklist = db.Column(
        db.JSON,
        default={},
        nullable=False
    )
    
    # Completion percentage (0-100)
    completion_percentage = db.Column(
        db.Integer,
        default=0,
        nullable=False
    )
    
    # Timestamps
    created_at = db.Column(
        db.DateTime,
        nullable=False,
        default=datetime.utcnow
    )
    
    updated_at = db.Column(
        db.DateTime,
        nullable=False,
        default=datetime.utcnow,
        onupdate=datetime.utcnow
    )

    def to_dict(self):
        """Convert model to dictionary for JSON serialization."""
        return {
            'id': self.id,
            'user_id': self.user_id,
            'checklist': self.checklist,
            'completion_percentage': self.completion_percentage,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None
        }

    def __repr__(self):
        return f"<PreparednessKit(user_id={self.user_id}, completion={self.completion_percentage}%)>"
