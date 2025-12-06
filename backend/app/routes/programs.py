from flask import Blueprint, request, jsonify
from app.models.program import Program

programs_bp = Blueprint('programs', __name__)

@programs_bp.route('', methods=['GET'])
def get_programs():
    try:
        page = int(request.args.get('page', 1))
        per_page = int(request.args.get('per_page', 10))
        search = request.args.get('search')
        only_codes = request.args.get('only_codes') == 'true'
        sort_by = request.args.get('sort_by', 'program_code')
        order = request.args.get('order', 'asc')
        
        result = Program.get_all(page, per_page, search, only_codes=only_codes, sort_by=sort_by, order=order)
        return jsonify(result), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@programs_bp.route('', methods=['POST'])
def create_program():
    data = request.json
    if not data or 'code' not in data or 'name' not in data or 'college' not in data:
        return jsonify({'error': 'Missing required fields'}), 400
    
    if Program.create(data['code'], data['name'], data['college']):
        return jsonify({'message': 'Program created'}), 201
    return jsonify({'error': 'Failed to create program'}), 400

@programs_bp.route('/<code>', methods=['PUT'])
def update_program(code):
    data = request.json
    if Program.update(code, data.get('name'), data.get('college')):
        return jsonify({'message': 'Program updated'}), 200
    return jsonify({'error': 'Failed to update program'}), 404

@programs_bp.route('/<code>', methods=['DELETE'])
def delete_program(code):
    if Program.delete(code):
        return jsonify({'message': 'Program deleted'}), 200
    return jsonify({'error': 'Failed to delete program'}), 404