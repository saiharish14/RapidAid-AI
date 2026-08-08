"""
Medical ID Model Module
Defines the SQLAlchemy model for medical information and emergency contacts.

This model stores user's medical information including:
- Blood group, age, gender
- Allergies, medical conditions, medications
- Emergency contacts (up to 3)

The MedicalID model has a One-to-One relationship with User model.
"""

from datetime import datetime
from database.db import db


class MedicalID(db.Model):
    """
    SQLAlchemy model for medical ID information.
    
    This model represents a user's medical information and emergency contacts.
    Each user can have one Medical ID record through a One-to-One relationship.
    
    Attributes:
        id: Unique identifier for the medical ID record (primary key)
        user_id: Foreign key to User model (unique, one-to-one)
        blood_group: User's blood group
        age: User's age
        gender: User's gender
        allergies: User's allergies (text field for multiple allergies)
        medical_conditions: Existing medical conditions
        medications: Current medications
        emergency_contact_1_name: First emergency contact name
        emergency_contact_1_relationship: First emergency contact relationship
        emergency_contact_1_phone: First emergency contact phone
        emergency_contact_2_name: Second emergency contact name
        emergency_contact_2_relationship: Second emergency contact relationship
        emergency_contact_2_phone: Second emergency contact phone
        emergency_contact_3_name: Third emergency contact name
        emergency_contact_3_relationship: Third emergency contact relationship
        emergency_contact_3_phone: Third emergency contact phone
        created_at: Timestamp when the record was created
        updated_at: Timestamp when the record was last updated
        user: Relationship to User model (One-to-One)
    """
    
    __tablename__ = 'medical_ids'
    
    # Primary Key
    id = db.Column(
        db.Integer,
        primary_key=True,
        autoincrement=True
    )
    
    # Foreign Key to User (One-to-One relationship)
    user_id = db.Column(
        db.Integer,
        db.ForeignKey('users.id'),
        unique=True,
        nullable=False,
        index=True
    )
    
    # Medical Information
    blood_group = db.Column(
        db.String(10),
        nullable=True
    )
    
    age = db.Column(
        db.Integer,
        nullable=True
    )
    
    gender = db.Column(
        db.String(20),
        nullable=True
    )
    
    allergies = db.Column(
        db.Text,
        nullable=True
    )
    
    medical_conditions = db.Column(
        db.Text,
        nullable=True
    )
    
    medications = db.Column(
        db.Text,
        nullable=True
    )
    
    # Emergency Contact 1
    emergency_contact_1_name = db.Column(
        db.String(100),
        nullable=True
    )
    
    emergency_contact_1_relationship = db.Column(
        db.String(50),
        nullable=True
    )
    
    emergency_contact_1_phone = db.Column(
        db.String(20),
        nullable=True
    )
    
    # Emergency Contact 2
    emergency_contact_2_name = db.Column(
        db.String(100),
        nullable=True
    )
    
    emergency_contact_2_relationship = db.Column(
        db.String(50),
        nullable=True
    )
    
    emergency_contact_2_phone = db.Column(
        db.String(20),
        nullable=True
    )
    
    # Emergency Contact 3
    emergency_contact_3_name = db.Column(
        db.String(100),
        nullable=True
    )
    
    emergency_contact_3_relationship = db.Column(
        db.String(50),
        nullable=True
    )
    
    emergency_contact_3_phone = db.Column(
        db.String(20),
        nullable=True
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
        """
        Convert the MedicalID model to a dictionary for JSON serialization.
        
        Returns:
            dict: Dictionary representation of the medical ID record
        """
        return {
            'id': self.id,
            'user_id': self.user_id,
            'blood_group': self.blood_group,
            'age': self.age,
            'gender': self.gender,
            'allergies': self.allergies,
            'medical_conditions': self.medical_conditions,
            'medications': self.medications,
            'emergency_contacts': self.get_emergency_contacts(),
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None
        }
    
    def get_emergency_contacts(self):
        """
        Get emergency contacts as a list of dictionaries.
        
        Returns:
            list: List of emergency contact dictionaries
        """
        contacts = []
        
        if self.emergency_contact_1_name:
            contacts.append({
                'name': self.emergency_contact_1_name,
                'relationship': self.emergency_contact_1_relationship,
                'phone': self.emergency_contact_1_phone
            })
        
        if self.emergency_contact_2_name:
            contacts.append({
                'name': self.emergency_contact_2_name,
                'relationship': self.emergency_contact_2_relationship,
                'phone': self.emergency_contact_2_phone
            })
        
        if self.emergency_contact_3_name:
            contacts.append({
                'name': self.emergency_contact_3_name,
                'relationship': self.emergency_contact_3_relationship,
                'phone': self.emergency_contact_3_phone
            })
        
        return contacts
    
    def __repr__(self):
        """String representation of the MedicalID model."""
        return f'<MedicalID User {self.user_id}>'
