"""
Preparedness Kit Routes
API endpoints for emergency preparedness checklist management.
Phase 1 – Lesson 1.4 implementation.
"""

from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from models.preparedness_kit import PreparednessKit
from models.user import User
from database.db import db

preparedness_kit_bp = Blueprint('preparedness_kit', __name__)


@preparedness_kit_bp.route('/api/preparedness-kit', methods=['GET'])
@jwt_required()
def get_preparedness_kit():
    """
    Get the current user's preparedness kit checklist.
    
    Returns:
        JSON response with checklist data or 404 if not found
    """
    try:
        user_id = get_jwt_identity()
        
        kit = PreparednessKit.query.filter_by(user_id=user_id).first()
        
        if not kit:
            return jsonify({
                'error': 'Preparedness kit not found',
                'checklist': {},
                'completion_percentage': 0
            }), 404
        
        return jsonify({
            'success': True,
            'data': kit.to_dict()
        }), 200
        
    except Exception as e:
        return jsonify({
            'error': str(e),
            'message': 'Failed to fetch preparedness kit'
        }), 500


@preparedness_kit_bp.route('/api/preparedness-kit', methods=['POST'])
@jwt_required()
def create_preparedness_kit():
    """
    Create a new preparedness kit for the current user.
    
    Request body:
        checklist: JSON object with item categories and their checked status
        completion_percentage: Integer (0-100)
    
    Returns:
        JSON response with created kit data
    """
    try:
        user_id = get_jwt_identity()
        
        # Check if kit already exists
        existing_kit = PreparednessKit.query.filter_by(user_id=user_id).first()
        if existing_kit:
            return jsonify({
                'error': 'Preparedness kit already exists',
                'message': 'Use PUT to update existing kit'
            }), 400
        
        data = request.get_json()
        
        # Validate completion percentage
        completion_percentage = data.get('completion_percentage', 0)
        if not isinstance(completion_percentage, int) or completion_percentage < 0 or completion_percentage > 100:
            return jsonify({
                'error': 'Invalid completion percentage',
                'message': 'Must be an integer between 0 and 100'
            }), 400
        
        # Validate checklist structure
        checklist = data.get('checklist', {})
        if not isinstance(checklist, dict):
            return jsonify({
                'error': 'Invalid checklist format',
                'message': 'Checklist must be a JSON object'
            }), 400
        
        kit = PreparednessKit(
            user_id=user_id,
            checklist=checklist,
            completion_percentage=completion_percentage
        )
        
        db.session.add(kit)
        db.session.commit()
        
        return jsonify({
            'success': True,
            'message': 'Preparedness kit created successfully',
            'data': kit.to_dict()
        }), 201
        
    except Exception as e:
        db.session.rollback()
        return jsonify({
            'error': str(e),
            'message': 'Failed to create preparedness kit'
        }), 500


@preparedness_kit_bp.route('/api/preparedness-kit', methods=['PUT'])
@jwt_required()
def update_preparedness_kit():
    """
    Update the current user's preparedness kit checklist.
    
    Request body:
        checklist: JSON object with item categories and their checked status
        completion_percentage: Integer (0-100)
    
    Returns:
        JSON response with updated kit data
    """
    try:
        user_id = get_jwt_identity()
        
        kit = PreparednessKit.query.filter_by(user_id=user_id).first()
        
        if not kit:
            # Create if doesn't exist
            return create_preparedness_kit()
        
        data = request.get_json()
        
        # Validate completion percentage
        if 'completion_percentage' in data:
            completion_percentage = data['completion_percentage']
            if not isinstance(completion_percentage, int) or completion_percentage < 0 or completion_percentage > 100:
                return jsonify({
                    'error': 'Invalid completion percentage',
                    'message': 'Must be an integer between 0 and 100'
                }), 400
            kit.completion_percentage = completion_percentage
        
        # Validate and update checklist
        if 'checklist' in data:
            checklist = data['checklist']
            if not isinstance(checklist, dict):
                return jsonify({
                    'error': 'Invalid checklist format',
                    'message': 'Checklist must be a JSON object'
                }), 400
            kit.checklist = checklist
        
        db.session.commit()
        
        return jsonify({
            'success': True,
            'message': 'Preparedness kit updated successfully',
            'data': kit.to_dict()
        }), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({
            'error': str(e),
            'message': 'Failed to update preparedness kit'
        }), 500


@preparedness_kit_bp.route('/api/preparedness-kit', methods=['DELETE'])
@jwt_required()
def delete_preparedness_kit():
    """
    Delete the current user's preparedness kit.
    
    Returns:
        JSON response with success message
    """
    try:
        user_id = get_jwt_identity()
        
        kit = PreparednessKit.query.filter_by(user_id=user_id).first()
        
        if not kit:
            return jsonify({
                'error': 'Preparedness kit not found'
            }), 404
        
        db.session.delete(kit)
        db.session.commit()
        
        return jsonify({
            'success': True,
            'message': 'Preparedness kit deleted successfully'
        }), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({
            'error': str(e),
            'message': 'Failed to delete preparedness kit'
        }), 500
