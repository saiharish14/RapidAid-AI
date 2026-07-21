"""
User Model Module
Defines the SQLAlchemy model for user accounts and authentication.

This model stores user information including:
- User credentials (email, password hash)
- Profile information (full name)
- Account status and timestamps
- Relationships to user data (reports)

The User model integrates with the existing database infrastructure
and establishes a One-to-Many relationship with AIReport model.
"""

from datetime import datetime
from database.db import db


class User(db.Model):
    """
    SQLAlchemy model for user accounts.
    
    This model represents a user in the RapidAid AI system.
    Each user can have multiple AI analysis reports through
    a One-to-Many relationship.
    
    Attributes:
        id: Unique identifier for the user (primary key)
        full_name: User's full name
        email: User's email address (unique)
        password_hash: Hashed password using bcrypt
        created_at: Timestamp when the account was created
        reports: Relationship to AIReport objects (One-to-Many)
    """
    
    __tablename__ = 'users'
    
    # Primary Key
    id = db.Column(
        db.Integer,
        primary_key=True,
        autoincrement=True
    )
    
    # User's full name
    full_name = db.Column(
        db.String(100),
        nullable=False
    )
    
    # User's email (must be unique)
    email = db.Column(
        db.String(120),
        unique=True,
        nullable=False,
        index=True
    )
    
    # Hashed password (bcrypt)
    password_hash = db.Column(
        db.String(128),
        nullable=False
    )
    
    # Timestamp for account creation
    created_at = db.Column(
        db.DateTime,
        nullable=False,
        default=datetime.utcnow
    )
    
    # One-to-Many relationship with AIReport
    # A user can have many reports, but each report belongs to one user
    reports = db.relationship(
        'AIReport',
        backref='user',
        lazy=True,
        cascade='all, delete-orphan'
    )
    
    # One-to-One relationship with MedicalID
    # A user can have one medical ID record
    medical_id = db.relationship(
        'MedicalID',
        backref='user',
        uselist=False,
        cascade='all, delete-orphan'
    )
    
    # One-to-One relationship with PreparednessKit
    # A user can have one preparedness kit record
    preparedness_kit = db.relationship(
        'PreparednessKit',
        backref='user',
        uselist=False,
        cascade='all, delete-orphan'
    )
    
    def __repr__(self):
        """String representation of the User model."""
        return f'<User {self.email}>'

