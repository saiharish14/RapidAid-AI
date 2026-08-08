"""
Authentication Routes Module
Handles user authentication endpoints including login, registration, and session management.
"""

from flask import Blueprint, request, jsonify
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity
from models.user import User
from database.db import db
from services.auth_service import hash_password, verify_password
import logging
import re

# Configure logging
logger = logging.getLogger(__name__)

# Create Blueprint for authentication routes
auth_bp = Blueprint('auth', __name__)


def validate_password(password):
    """
    Validate password strength using regular expressions.
    
    Requirements:
    - Minimum 6 characters (matches frontend validation)
    
    Args:
        password (str): The password to validate
    
    Returns:
        tuple: (bool, str) where bool indicates validity and str contains error message if invalid
    """
    if not password:
        return False, "Password is required"
    
    # Check minimum length (matches frontend)
    if len(password) < 6:
        return False, "Password must be at least 6 characters long"
    
    return True, ""


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
        
        # Validate password strength
        is_valid, error_message = validate_password(password)
        if not is_valid:
            return jsonify({
                'success': False,
                'message': error_message
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
        import traceback
        db.session.rollback()
        traceback.print_exc()
        print(f"\n=== REGISTER EXCEPTION ===")
        print(f"Request data: {request.get_json()}")
        print(f"Exception: {str(e)}")
        print(f"Full traceback:\n{traceback.format_exc()}")
        print(f"===========================\n")
        logger.error(f"Registration error: {str(e)}")
        return jsonify({
            'success': False,
            'error': str(e)
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
        print("STEP 1 - Request received")
        data = request.get_json()
        print("STEP 2 - JSON parsed")
        logger.info(f"Login attempt with data: {data}")
        
        # Validate required fields
        if not data or not all(key in data for key in ['email', 'password']):
            logger.warning("Login failed: Missing required fields")
            return jsonify({
                'success': False,
                'message': 'Missing required fields: email, password'
            }), 400
        
        email = data.get('email').lower().strip()
        password = data.get('password')
        
        print("STEP 3 - User lookup started")
        logger.info(f"Looking up user with email: {email}")
        
        # Find user by email
        try:
            user = User.query.filter_by(email=email).first()
        except Exception as e:
            print("FAILED AT STEP 3 - User lookup")
            print(repr(e))
            import traceback
            traceback.print_exc()
            raise
        
        print("STEP 4 - User found" if user else "STEP 4 - User not found")
        
        if not user:
            logger.warning(f"Login failed: User not found for email: {email}")
            return jsonify({
                'success': False,
                'message': 'Invalid email or password'
            }), 401
        
        logger.info(f"User found: {user.id}, verifying password")
        
        print("STEP 5 - Password verification")
        # Verify password
        try:
            password_valid = verify_password(password, user.password_hash)
        except Exception as e:
            print("FAILED AT STEP 5 - Password verification")
            print(repr(e))
            import traceback
            traceback.print_exc()
            raise
        
        if not password_valid:
            logger.warning(f"Login failed: Invalid password for email: {email}")
            return jsonify({
                'success': False,
                'message': 'Invalid email or password'
            }), 401
        
        logger.info(f"Password verified, generating JWT token for user: {user.id}")
        
        print("STEP 6 - JWT generation")
        # Generate JWT access token
        try:
            access_token = create_access_token(identity=str(user.id))
        except Exception as e:
            print("FAILED AT STEP 6 - JWT generation")
            print(repr(e))
            import traceback
            traceback.print_exc()
            raise
        
        logger.info(f"User logged in successfully: {email}")
        
        print("STEP 7 - Returning response")
        # Return token and user data
        return jsonify({
            'success': True,
            'message': 'Login successful',
            'data': {
                'access_token': access_token,
                'user': {
                    'id': user.id,
                    'full_name': user.full_name,
                    'email': user.email,
                    'created_at': user.created_at.isoformat() if user.created_at else None,
                    'profile_picture': getattr(user, 'profile_picture', None)
                }
            }
        }), 200
        
    except Exception as e:
        import traceback
        traceback.print_exc()
        print(f"\n=== LOGIN EXCEPTION ===")
        print(f"Request data: {request.get_json()}")
        print(f"Exception: {str(e)}")
        print(f"Full traceback:\n{traceback.format_exc()}")
        print(f"========================\n")
        logger.error(f"Login error: {str(e)}")
        logger.error(f"Full traceback: {traceback.format_exc()}")
        return jsonify({
            'success': False,
            'error': str(e)
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
        print("STEP A - Request received")
        data = request.get_json()
        print("STEP B - JSON parsed")
        logger.info(f"Reset password attempt with data: {data}")

        if not data or not all(key in data for key in ['email', 'password']):
            logger.warning("Reset password failed: Missing required fields")
            return jsonify({
                'success': False,
                'message': 'Missing required fields: email, password'
            }), 400

        email = data.get('email').lower().strip()
        password = data.get('password')

        # Validate password strength
        is_valid, error_message = validate_password(password)
        if not is_valid:
            return jsonify({
                'success': False,
                'message': error_message
            }), 400

        print("STEP C - User lookup")
        logger.info(f"Looking up user with email: {email}")
        try:
            user = User.query.filter_by(email=email).first()
        except Exception as e:
            print("FAILED AT STEP C - User lookup")
            print(repr(e))
            import traceback
            traceback.print_exc()
            raise

        print("STEP D - User found" if user else "STEP D - User not found")

        if not user:
            logger.warning(f"Reset password failed: User not found for email: {email}")
            return jsonify({
                'success': False,
                'message': 'Email not found'
            }), 404

        logger.info(f"User found: {user.id}, hashing new password")
        
        print("STEP D - Password hashing")
        try:
            user.password_hash = hash_password(password)
        except Exception as e:
            print("FAILED AT STEP D - Password hashing")
            print(repr(e))
            import traceback
            traceback.print_exc()
            raise
        
        print("STEP E - Database commit")
        logger.info(f"Committing password change to database")
        try:
            db.session.commit()
        except Exception as e:
            print("FAILED AT STEP E - Database commit")
            print(repr(e))
            import traceback
            traceback.print_exc()
            raise

        logger.info(f"Password reset successfully for: {email}")

        print("STEP F - Returning response")
        return jsonify({
            'success': True,
            'message': 'Password updated successfully'
        }), 200

    except Exception as e:
        import traceback
        db.session.rollback()
        traceback.print_exc()
        print(f"\n=== RESET PASSWORD EXCEPTION ===")
        print(f"Request data: {request.get_json()}")
        print(f"Exception: {str(e)}")
        print(f"Full traceback:\n{traceback.format_exc()}")
        print(f"===============================\n")
        logger.error(f"Reset password error: {str(e)}")
        logger.error(f"Full traceback: {traceback.format_exc()}")
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500


@auth_bp.route('/profile', methods=['GET'])
@jwt_required()
def get_profile():
    """
    Get current user profile endpoint.
    
    Returns:
        Success: Current user profile data
        Error: User not found
    """
    try:
        logger.info("Get profile request received")
        
        # Get current user ID from JWT token
        user_id = get_jwt_identity()
        logger.info(f"Fetching profile for user ID: {user_id}")
        
        # Find user by ID
        user = User.query.get(user_id)
        if not user:
            logger.warning(f"User not found for ID: {user_id}")
            return jsonify({
                'success': False,
                'message': 'User not found'
            }), 404
        
        # Return user profile data
        return jsonify({
            'success': True,
            'data': {
                'id': user.id,
                'full_name': user.full_name,
                'email': user.email,
                'created_at': user.created_at.isoformat() if user.created_at else None,
                'profile_picture': getattr(user, 'profile_picture', None)
            }
        }), 200
        
    except Exception as e:
        import traceback
        traceback.print_exc()
        print(f"\n=== GET PROFILE EXCEPTION ===")
        print(f"Exception: {str(e)}")
        print(f"Full traceback:\n{traceback.format_exc()}")
        print(f"=============================\n")
        logger.error(f"Get profile error: {str(e)}")
        logger.error(f"Full traceback: {traceback.format_exc()}")
        return jsonify({
            'success': False,
            'message': 'Failed to get profile',
            'error': str(e)
        }), 500


@auth_bp.route('/profile', methods=['PUT'])
@jwt_required()
def update_profile():
    """
    Update user profile endpoint.
    
    Expects JSON payload:
    {
        "full_name": "John Doe",
        "profile_picture": "base64_encoded_string" (optional)
    }
    
    Returns:
        Success: Updated user data
        Error: Validation errors or user not found
    """
    try:
        logger.info("Profile update request received")
        data = request.get_json()
        
        if not data:
            return jsonify({
                'success': False,
                'message': 'No data provided'
            }), 400
        
        # Get current user ID from JWT token
        user_id = get_jwt_identity()
        logger.info(f"Updating profile for user ID: {user_id}")
        
        # Find user by ID
        user = User.query.get(user_id)
        if not user:
            logger.warning(f"User not found for ID: {user_id}")
            return jsonify({
                'success': False,
                'message': 'User not found'
            }), 404
        
        # Update full name if provided
        if 'full_name' in data:
            full_name = data.get('full_name')
            if len(full_name) < 2 or len(full_name) > 100:
                return jsonify({
                    'success': False,
                    'message': 'Full name must be between 2 and 100 characters'
                }), 400
            user.full_name = full_name
            logger.info(f"Updated full_name to: {full_name}")
        
        # Update profile picture if provided
        if 'profile_picture' in data and data.get('profile_picture'):
            profile_picture = data.get('profile_picture')
            user.profile_picture = profile_picture
            logger.info("Updated profile picture")
        
        # Commit changes to database
        db.session.commit()
        logger.info(f"Profile updated successfully for user ID: {user_id}")
        
        # Return updated user data
        return jsonify({
            'success': True,
            'message': 'Profile updated successfully',
            'data': {
                'id': user.id,
                'full_name': user.full_name,
                'email': user.email,
                'created_at': user.created_at.isoformat() if user.created_at else None,
                'profile_picture': getattr(user, 'profile_picture', None)
            }
        }), 200
        
    except Exception as e:
        import traceback
        db.session.rollback()
        traceback.print_exc()
        print(f"\n=== UPDATE PROFILE EXCEPTION ===")
        print(f"Request data: {request.get_json()}")
        print(f"Exception: {str(e)}")
        print(f"Full traceback:\n{traceback.format_exc()}")
        print(f"================================\n")
        logger.error(f"Profile update error: {str(e)}")
        logger.error(f"Full traceback: {traceback.format_exc()}")
        return jsonify({
            'success': False,
            'message': 'Failed to update profile',
            'error': str(e)
        }), 500


@auth_bp.route('/change-password', methods=['POST'])
@jwt_required()
def change_password():
    """
    Change user password endpoint.
    
    Expects JSON payload:
    {
        "current_password": "oldpassword123",
        "new_password": "newpassword123"
    }
    
    Returns:
        Success: Password changed successfully
        Error: Invalid current password or validation errors
    """
    try:
        logger.info("Password change request received")
        data = request.get_json()
        
        if not data or not all(key in data for key in ['current_password', 'new_password']):
            return jsonify({
                'success': False,
                'message': 'Missing required fields: current_password, new_password'
            }), 400
        
        current_password = data.get('current_password')
        new_password = data.get('new_password')
        
        # Validate new password strength
        is_valid, error_message = validate_password(new_password)
        if not is_valid:
            return jsonify({
                'success': False,
                'message': error_message
            }), 400
        
        # Get current user ID from JWT token
        user_id = get_jwt_identity()
        logger.info(f"Changing password for user ID: {user_id}")
        
        # Find user by ID
        user = User.query.get(user_id)
        if not user:
            logger.warning(f"User not found for ID: {user_id}")
            return jsonify({
                'success': False,
                'message': 'User not found'
            }), 404
        
        # Verify current password
        if not verify_password(current_password, user.password_hash):
            logger.warning(f"Invalid current password for user ID: {user_id}")
            return jsonify({
                'success': False,
                'message': 'Current password is incorrect'
            }), 401
        
        # Hash and update new password
        user.password_hash = hash_password(new_password)
        db.session.commit()
        
        logger.info(f"Password changed successfully for user ID: {user_id}")
        
        return jsonify({
            'success': True,
            'message': 'Password changed successfully'
        }), 200
        
    except Exception as e:
        import traceback
        db.session.rollback()
        traceback.print_exc()
        print(f"\n=== CHANGE PASSWORD EXCEPTION ===")
        print(f"Request data: {request.get_json()}")
        print(f"Exception: {str(e)}")
        print(f"Full traceback:\n{traceback.format_exc()}")
        print(f"================================\n")
        logger.error(f"Password change error: {str(e)}")
        logger.error(f"Full traceback: {traceback.format_exc()}")
        return jsonify({
            'success': False,
            'message': 'Failed to change password',
            'error': str(e)
        }), 500


@auth_bp.route('/account', methods=['DELETE'])
@jwt_required()
def delete_account():
    """
    Delete user account endpoint.
    
    Returns:
        Success: Account deleted successfully
        Error: User not found
    """
    try:
        logger.info("Account deletion request received")
        
        # Get current user ID from JWT token
        user_id = get_jwt_identity()
        logger.info(f"Deleting account for user ID: {user_id}")
        
        # Find user by ID
        user = User.query.get(user_id)
        if not user:
            logger.warning(f"User not found for ID: {user_id}")
            return jsonify({
                'success': False,
                'message': 'User not found'
            }), 404
        
        # Delete user from database
        db.session.delete(user)
        db.session.commit()
        
        logger.info(f"Account deleted successfully for user ID: {user_id}")
        
        return jsonify({
            'success': True,
            'message': 'Account deleted successfully'
        }), 200
        
    except Exception as e:
        import traceback
        db.session.rollback()
        traceback.print_exc()
        print(f"\n=== DELETE ACCOUNT EXCEPTION ===")
        print(f"Exception: {str(e)}")
        print(f"Full traceback:\n{traceback.format_exc()}")
        print(f"==============================\n")
        logger.error(f"Account deletion error: {str(e)}")
        logger.error(f"Full traceback: {traceback.format_exc()}")
        return jsonify({
            'success': False,
            'message': 'Failed to delete account',
            'error': str(e)
        }), 500

