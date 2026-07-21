"""
Database Initialization Module
Configures Flask-SQLAlchemy with SQLite for RapidAid AI.
"""

from flask_sqlalchemy import SQLAlchemy
import os

# Get the base directory of the application
BASE_DIR = os.path.abspath(os.path.dirname(os.path.dirname(__file__)))

# Initialize SQLAlchemy instance
db = SQLAlchemy()


def get_database_uri():
    """
    Get the database URI for SQLite.
    
    Returns:
        str: SQLite database URI pointing to backend/database/rapidaid.db
    """
    db_path = os.path.join(BASE_DIR, 'database', 'rapidaid.db')
    return f'sqlite:///{db_path}'


def init_db(app):
    """
    Initialize the database with the Flask application.
    
    Args:
        app: Flask application instance
    
    This function configures SQLAlchemy with the Flask app and
    sets up the SQLite database connection. It also imports
    all models to ensure SQLAlchemy can discover them for
    table creation.
    """
    # Configure database URI
    app.config['SQLALCHEMY_DATABASE_URI'] = get_database_uri()
    
    # Disable track modifications for performance
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
    
    # Initialize the database with the Flask app
    db.init_app(app)
    
    # Import models to ensure SQLAlchemy discovers them
    # This must be done before create_all() is called
    from models import AIReport, User, MedicalID, PreparednessKit
    
    # Create all tables (will be used when models are defined)
    with app.app_context():
        db.create_all()
