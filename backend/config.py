"""
Configuration Module
Centralizes Flask extensions initialization to avoid circular imports.
"""

from flask_bcrypt import Bcrypt
from flask_jwt_extended import JWTManager

# Initialize extensions (will be configured with app in app.py)
bcrypt = Bcrypt()
jwt = JWTManager()
