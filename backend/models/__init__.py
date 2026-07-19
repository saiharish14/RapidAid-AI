"""
Models Package
Contains all SQLAlchemy database models for RapidAid AI.
"""

from .ai_report import AIReport
from .user import User

__all__ = ['AIReport', 'User']
