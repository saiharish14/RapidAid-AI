"""
Authentication Service Module
Handles core authentication business logic and user management.

This service contains functions for:
- User registration with password hashing
- User login with password verification
- JWT token generation and validation
- Token refresh mechanism
- User session management
- Password reset functionality
- Email validation
- User profile management

All database operations for authentication are handled through this service layer
to maintain separation of concerns and reusability across different routes.
"""

from config import bcrypt


def hash_password(password: str) -> str:
    """
    Hash a plain text password using bcrypt.
    
    This function uses Flask-Bcrypt to securely hash passwords before
    storing them in the database. Bcrypt automatically handles salt
    generation and includes it in the hash.
    
    Args:
        password: Plain text password string
    
    Returns:
        str: Bcrypt hash of the password
    
    Example:
        >>> hashed = hash_password("mypassword123")
        >>> print(hashed)
        $2b$12$N9qo8uLOickgx2ZMRZoMy...
    
    Note:
        - Bcrypt is designed to be slow to prevent brute force attacks
        - The hash includes the salt, so no separate salt storage is needed
        - This function will be used during user registration
    """
    return bcrypt.generate_password_hash(password).decode('utf-8')


def verify_password(password: str, password_hash: str) -> bool:
    """
    Verify a plain text password against a bcrypt hash.
    
    This function compares a plain text password with a stored hash
    to determine if they match. It will be used during user login.
    
    Args:
        password: Plain text password to verify
        password_hash: Stored bcrypt hash from database
    
    Returns:
        bool: True if password matches hash, False otherwise
    
    Example:
        >>> stored_hash = hash_password("mypassword123")
        >>> is_valid = verify_password("mypassword123", stored_hash)
        >>> print(is_valid)
        True
    
    Note:
        - This function is safe against timing attacks
        - Will be used in login API to authenticate users
        - Returns False for invalid passwords without revealing details
    """
    return bcrypt.check_password_hash(password_hash, password)

