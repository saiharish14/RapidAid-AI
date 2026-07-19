"""
Authentication Routes Module
Handles user authentication endpoints including login, registration, and session management.
"""

from flask import Blueprint, request, jsonify
from flask_jwt_extended import create_access_token
from models.user import User
from database.db import db
from services.auth_service import hash_password, verify_password
import logging

# Configure logging
logger = logging.getLogger(__name__)

# Create Blueprint for authentication routes
auth_bp = Blueprint('auth', __name__)


@auth_bp.route('/register', methods=['POST'])
def register():
    """
    User registration endpoint.
    
    Expects JSON payload:
    {
        "full_name": "John Doe",
        "email": "john@example.com",
        "password": "password123"
    }
    
    Returns:
        Success: User created with user data (without password)
        Error: Validation errors or duplicate email
    """
    try:
        data = request.get_json()
        
        # Validate required fields
        if not data or not all(key in data for key in ['full_name', 'email', 'password']):
            return jsonify({
                'success': False,
                'message': 'Missing required fields: full_name, email, password'
            }), 400
        
        full_name = data.get('full_name')
        email = data.get('email').lower().strip()
        password = data.get('password')
        
        # Validate field lengths
        if len(full_name) < 2 or len(full_name) > 100:
            return jsonify({
                'success': False,
                'message': 'Full name must be between 2 and 100 characters'
            }), 400
        
        if len(email) < 5 or len(email) > 120:
            return jsonify({
                'success': False,
                'message': 'Email must be between 5 and 120 characters'
            }), 400
        
        if len(password) < 6:
            return jsonify({
                'success': False,
                'message': 'Password must be at least 6 characters'
            }), 400
        
        # Check if email already exists
        existing_user = User.query.filter_by(email=email).first()
        if existing_user:
            return jsonify({
                'success': False,
                'message': 'Email already registered'
            }), 409
        
        # Hash the password
        password_hash = hash_password(password)
        
        # Create new user
        new_user = User(
            full_name=full_name,
            email=email,
            password_hash=password_hash
        )
        
        # Save to database
        db.session.add(new_user)
        db.session.commit()
        
        logger.info(f"User registered successfully: {email}")
        
        # Return user data (without password)
        return jsonify({
            'success': True,
            'message': 'User registered successfully',
            'data': {
                'id': new_user.id,
                'full_name': new_user.full_name,
                'email': new_user.email,
                'created_at': new_user.created_at.isoformat()
            }
        }), 201
        
    except Exception as e:
        db.session.rollback()
        logger.error(f"Registration error: {str(e)}")
        return jsonify({
            'success': False,
            'message': 'Registration failed. Please try again.'
        }), 500


@auth_bp.route('/login', methods=['POST'])
def login():
    """
    User login endpoint.
    
    Expects JSON payload:
    {
        "email": "john@example.com",
        "password": "password123"
    }
    
    Returns:
        Success: JWT access token and user data
        Error: Invalid credentials
    """
    try:
        data = request.get_json()
        
        # Validate required fields
        if not data or not all(key in data for key in ['email', 'password']):
            return jsonify({
                'success': False,
                'message': 'Missing required fields: email, password'
            }), 400
        
        email = data.get('email').lower().strip()
        password = data.get('password')
        
        # Find user by email
        user = User.query.filter_by(email=email).first()
        
        if not user:
            return jsonify({
                'success': False,
                'message': 'Invalid email or password'
            }), 401
        
        # Verify password
        if not verify_password(password, user.password_hash):
            return jsonify({
                'success': False,
                'message': 'Invalid email or password'
            }), 401
        
        # Generate JWT access token
        access_token = create_access_token(identity=str(user.id))
        
        logger.info(f"User logged in successfully: {email}")
        
        # Return token and user data
        return jsonify({
            'success': True,
            'message': 'Login successful',
            'data': {
                'access_token': access_token,
                'user': {
                    'id': user.id,
                    'full_name': user.full_name,
                    'email': user.email
                }
            }
        }), 200
        
    except Exception as e:
        logger.error(f"Login error: {str(e)}")
        return jsonify({
            'success': False,
            'message': 'Login failed. Please try again.'
        }), 500


@auth_bp.route('/reset-password', methods=['POST'])
def reset_password():
    """
    Reset user password endpoint.

    Expects JSON payload:
    {
        "email": "john@example.com",
        "password": "newpassword123"
    }
    """
    try:
        data = request.get_json()

        if not data or not all(key in data for key in ['email', 'password']):
            return jsonify({
                'success': False,
                'message': 'Missing required fields: email, password'
            }), 400

        email = data.get('email').lower().strip()
        password = data.get('password')

        if len(password) < 6:
            return jsonify({
                'success': False,
                'message': 'Password must be at least 6 characters'
            }), 400

        user = User.query.filter_by(email=email).first()

        if not user:
            return jsonify({
                'success': False,
                'message': 'Email not found'
            }), 404

        user.password_hash = hash_password(password)
        db.session.commit()

        logger.info(f"Password reset successfully for: {email}")

        return jsonify({
            'success': True,
            'message': 'Password updated successfully'
        }), 200

    except Exception as e:
        db.session.rollback()
        logger.error(f"Reset password error: {str(e)}")
        return jsonify({
            'success': False,
            'message': 'Failed to reset password. Please try again.'
        }), 500

