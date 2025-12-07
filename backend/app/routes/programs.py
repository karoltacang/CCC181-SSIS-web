from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required
from app.models.program import Program

programs_bp = Blueprint('programs', __name__)

@programs_bp.route('', methods=['GET'], strict_slashes=False)
@jwt_required()
def get_programs():
    try:
        page = int(request.args.get('page', 1))
        per_page = int(request.args.get('per_page', 10))
        search = request.args.get('search')
        only_codes = request.args.get('only_codes', '').lower() == 'true'
        sort_by = request.args.get('sort_by', 'program_code')
        order = request.args.get('order', 'asc')
        
        result = Program.get_all(page, per_page, search, only_codes=only_codes, sort_by=sort_by, order=order)
        return jsonify(result), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@programs_bp.route('', methods=['POST'], strict_slashes=False)
@jwt_required()
def create_program():
    data = request.json
    code = data.get('code') or data.get('program_code')
    name = data.get('name') or data.get('program_name')
    college = data.get('college') or data.get('college_code')

    if not data or not code or not name or not college:
        return jsonify({'error': 'Missing required fields'}), 400
    
    if Program.create(code, name, college):
        return jsonify({'message': 'Program created'}), 201
    return jsonify({'error': 'Failed to create program'}), 400

@programs_bp.route('/<code>', methods=['PUT'])
@jwt_required()
def update_program(code):
    data = request.json
    name = data.get('name') or data.get('program_name')
    college = data.get('college') or data.get('college_code')
    new_code = data.get('code') or data.get('program_code') or code

    success, message = Program.update(code, new_code, name, college)
    if success:
        return jsonify({'message': message}), 200
    return jsonify({'error': message}), 400

@programs_bp.route('/<code>', methods=['DELETE'])
@jwt_required()
def delete_program(code):
    success, message = Program.delete(code)
    if success:
        return jsonify({'message': message}), 200
    return jsonify({'error': message}), 400