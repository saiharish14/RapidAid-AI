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
    Get the database URI.
    
    Returns:
        str: PostgreSQL URI from DATABASE_URL environment variable if available,
             otherwise SQLite database URI pointing to backend/database/rapidaid.db
    """
    database_url = os.getenv('DATABASE_URL')
    if database_url:
        if database_url.startswith('postgresql://'):
            database_url = database_url.replace('postgresql://', 'postgresql+psycopg://', 1)
        return database_url
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
    # Import inside function to avoid circular imports
    from models.ai_report import AIReport
    from models.user import User
    from models.medical_id import MedicalID
    from models.preparedness_kit import PreparednessKit
    
    # Create all tables (will be used when models are defined)
    with app.app_context():
        db.create_all()
