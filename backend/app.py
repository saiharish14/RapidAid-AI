"""
Flask Application Configuration
Main entry point for the RapidAid AI backend API.
Configures Flask app, CORS, database, and registers blueprints.
"""

from flask import Flask, jsonify
from flask_cors import CORS
from config import bcrypt, jwt
from routes.health import health_bp
from routes.analyze import analyze_bp
from routes.reports import reports_bp
from routes.auth import auth_bp
from database import init_db

# Initialize Flask application
app = Flask(__name__)

# Configure JWT settings before initializing
app.config['JWT_SECRET_KEY'] = 'your-secret-key-change-in-production'  # Change this in production
app.config['JWT_ACCESS_TOKEN_EXPIRES'] = 3600  # 1 hour expiration

# Initialize Flask-Bcrypt for password hashing
bcrypt.init_app(app)

# Initialize Flask-JWT-Extended for JWT authentication
jwt.init_app(app)

# Enable CORS for all routes to allow frontend communication
CORS(app)

# Initialize database
init_db(app)

# Register Blueprints
app.register_blueprint(health_bp)
app.register_blueprint(analyze_bp)
app.register_blueprint(reports_bp)
app.register_blueprint(auth_bp, url_prefix='/api/auth')


@app.route('/', methods=['GET'])
def root():
    """
    Root endpoint.
    Returns API information and available endpoints.
    """
    return jsonify({
        "message": "RapidAid AI Backend API",
        "version": "1.0.0",
        "endpoints": {
            "health": "/api/health",
            "analyze": "/api/analyze",
            "reports": "/api/reports",
            "auth": "/api/auth"
        },
        "documentation": "See endpoint routes for details"
    })


if __name__ == '__main__':
    # Run the Flask development server
    # Debug mode enabled for development (disable in production)
    app.run(debug=True, host='0.0.0.0', port=5000)
