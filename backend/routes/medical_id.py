"""
Medical ID Routes Module
Defines API endpoints for medical information and emergency contacts.

This module provides CRUD operations for:
- Medical information (blood group, age, gender, allergies, conditions, medications)
- Emergency contacts (up to 3 contacts per user)

All endpoints require JWT authentication.
"""

from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from models.medical_id import MedicalID
from models.user import User
from database.db import db

medical_id_bp = Blueprint('medical_id', __name__)


@medical_id_bp.route('/api/medical-id', methods=['GET'])
@jwt_required()
def get_medical_id():
    """
    Get the current user's medical ID information.
    
    Returns:
        JSON: Medical ID data or 404 if not found
    """
    try:
        user_id = get_jwt_identity()
        medical_id = MedicalID.query.filter_by(user_id=user_id).first()
        
        if not medical_id:
            return jsonify({'message': 'Medical ID not found'}), 404
        
        return jsonify(medical_id.to_dict()), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@medical_id_bp.route('/api/medical-id', methods=['POST'])
@jwt_required()
def create_medical_id():
    """
    Create a new medical ID record for the current user.
    
    Request Body:
        blood_group: Blood group (optional)
        age: Age (optional)
        gender: Gender (optional)
        allergies: Allergies (optional)
        medical_conditions: Medical conditions (optional)
        medications: Medications (optional)
        emergency_contacts: List of emergency contacts (max 3)
    
    Returns:
        JSON: Created medical ID data or error message
    """
    try:
        user_id = get_jwt_identity()
        data = request.get_json()
        
        # Check if medical ID already exists
        existing = MedicalID.query.filter_by(user_id=user_id).first()
        if existing:
            return jsonify({'error': 'Medical ID already exists. Use PUT to update.'}), 400
        
        # Validate emergency contacts (max 3)
        emergency_contacts = data.get('emergency_contacts', [])
        if len(emergency_contacts) > 3:
            return jsonify({'error': 'Maximum 3 emergency contacts allowed'}), 400
        
        # Validate phone numbers
        for contact in emergency_contacts:
            phone = contact.get('phone', '')
            if phone and not phone.replace('+', '').replace('-', '').replace(' ', '').isdigit():
                return jsonify({'error': f'Invalid phone number for {contact.get("name", "contact")}'}), 400
        
        # Create medical ID record
        medical_id = MedicalID(
            user_id=user_id,
            blood_group=data.get('blood_group'),
            age=data.get('age'),
            gender=data.get('gender'),
            allergies=data.get('allergies'),
            medical_conditions=data.get('medical_conditions'),
            medications=data.get('medications')
        )
        
        # Add emergency contacts
        if len(emergency_contacts) > 0:
            medical_id.emergency_contact_1_name = emergency_contacts[0].get('name')
            medical_id.emergency_contact_1_relationship = emergency_contacts[0].get('relationship')
            medical_id.emergency_contact_1_phone = emergency_contacts[0].get('phone')
        
        if len(emergency_contacts) > 1:
            medical_id.emergency_contact_2_name = emergency_contacts[1].get('name')
            medical_id.emergency_contact_2_relationship = emergency_contacts[1].get('relationship')
            medical_id.emergency_contact_2_phone = emergency_contacts[1].get('phone')
        
        if len(emergency_contacts) > 2:
            medical_id.emergency_contact_3_name = emergency_contacts[2].get('name')
            medical_id.emergency_contact_3_relationship = emergency_contacts[2].get('relationship')
            medical_id.emergency_contact_3_phone = emergency_contacts[2].get('phone')
        
        db.session.add(medical_id)
        db.session.commit()
        
        return jsonify(medical_id.to_dict()), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500


@medical_id_bp.route('/api/medical-id', methods=['PUT'])
@jwt_required()
def update_medical_id():
    """
    Update the current user's medical ID information.
    
    Request Body:
        blood_group: Blood group (optional)
        age: Age (optional)
        gender: Gender (optional)
        allergies: Allergies (optional)
        medical_conditions: Medical conditions (optional)
        medications: Medications (optional)
        emergency_contacts: List of emergency contacts (max 3)
    
    Returns:
        JSON: Updated medical ID data or error message
    """
    try:
        user_id = get_jwt_identity()
        data = request.get_json()
        
        # Get existing medical ID
        medical_id = MedicalID.query.filter_by(user_id=user_id).first()
        if not medical_id:
            return jsonify({'error': 'Medical ID not found. Use POST to create.'}), 404
        
        # Validate emergency contacts (max 3)
        emergency_contacts = data.get('emergency_contacts', [])
        if len(emergency_contacts) > 3:
            return jsonify({'error': 'Maximum 3 emergency contacts allowed'}), 400
        
        # Validate phone numbers
        for contact in emergency_contacts:
            phone = contact.get('phone', '')
            if phone and not phone.replace('+', '').replace('-', '').replace(' ', '').isdigit():
                return jsonify({'error': f'Invalid phone number for {contact.get("name", "contact")}'}), 400
        
        # Update medical information
        if 'blood_group' in data:
            medical_id.blood_group = data.get('blood_group')
        if 'age' in data:
            medical_id.age = data.get('age')
        if 'gender' in data:
            medical_id.gender = data.get('gender')
        if 'allergies' in data:
            medical_id.allergies = data.get('allergies')
        if 'medical_conditions' in data:
            medical_id.medical_conditions = data.get('medical_conditions')
        if 'medications' in data:
            medical_id.medications = data.get('medications')
        
        # Update emergency contacts
        # Clear existing contacts
        medical_id.emergency_contact_1_name = None
        medical_id.emergency_contact_1_relationship = None
        medical_id.emergency_contact_1_phone = None
        medical_id.emergency_contact_2_name = None
        medical_id.emergency_contact_2_relationship = None
        medical_id.emergency_contact_2_phone = None
        medical_id.emergency_contact_3_name = None
        medical_id.emergency_contact_3_relationship = None
        medical_id.emergency_contact_3_phone = None
        
        # Add new contacts
        if len(emergency_contacts) > 0:
            medical_id.emergency_contact_1_name = emergency_contacts[0].get('name')
            medical_id.emergency_contact_1_relationship = emergency_contacts[0].get('relationship')
            medical_id.emergency_contact_1_phone = emergency_contacts[0].get('phone')
        
        if len(emergency_contacts) > 1:
            medical_id.emergency_contact_2_name = emergency_contacts[1].get('name')
            medical_id.emergency_contact_2_relationship = emergency_contacts[1].get('relationship')
            medical_id.emergency_contact_2_phone = emergency_contacts[1].get('phone')
        
        if len(emergency_contacts) > 2:
            medical_id.emergency_contact_3_name = emergency_contacts[2].get('name')
            medical_id.emergency_contact_3_relationship = emergency_contacts[2].get('relationship')
            medical_id.emergency_contact_3_phone = emergency_contacts[2].get('phone')
        
        db.session.commit()
        
        return jsonify(medical_id.to_dict()), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500


@medical_id_bp.route('/api/medical-id', methods=['DELETE'])
@jwt_required()
def delete_medical_id():
    """
    Delete the current user's medical ID information.
    
    Returns:
        JSON: Success message or error message
    """
    try:
        user_id = get_jwt_identity()
        medical_id = MedicalID.query.filter_by(user_id=user_id).first()
        
        if not medical_id:
            return jsonify({'error': 'Medical ID not found'}), 404
        
        db.session.delete(medical_id)
        db.session.commit()
        
        return jsonify({'message': 'Medical ID deleted successfully'}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500
