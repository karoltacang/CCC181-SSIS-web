from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required
from app.models.college import College

colleges_bp = Blueprint('colleges', __name__)

@colleges_bp.route('', methods=['GET'], strict_slashes=False)
@jwt_required()
def get_colleges():
    try:
        page = int(request.args.get('page', 1))
        per_page = int(request.args.get('per_page', 10))
        search = request.args.get('search')
        only_codes = request.args.get('only_codes', '').lower() == 'true'
        sort_by = request.args.get('sort_by', 'college_code')
        order = request.args.get('order', 'asc')
        
        result = College.get_all(page, per_page, search, only_codes=only_codes, sort_by=sort_by, order=order)
        return jsonify(result), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@colleges_bp.route('', methods=['POST'], strict_slashes=False)
@jwt_required()
def create_college():
    data = request.json
    code = data.get('code') or data.get('college_code')
    name = data.get('name') or data.get('college_name')

    if not data or not code or not name:
        return jsonify({'error': 'Missing required fields'}), 400
    
    if College.create(code, name):
        return jsonify({'message': 'College created'}), 201
    return jsonify({'error': 'Failed to create college'}), 400

@colleges_bp.route('/<code>', methods=['PUT'])
@jwt_required()
def update_college(code):
    data = request.json
    name = data.get('name') or data.get('college_name')
    new_code = data.get('code') or data.get('college_code') or code
    success, message = College.update(code, new_code, name)
    if success:
        return jsonify({'message': message}), 200
    return jsonify({'error': message}), 400

@colleges_bp.route('/<code>', methods=['DELETE'])
@jwt_required()
def delete_college(code):
    if College.delete(code):
        return jsonify({'message': 'College deleted'}), 200
    return jsonify({'error': 'Failed to delete college'}), 404