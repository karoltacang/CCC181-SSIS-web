from flask import Blueprint, request, jsonify
from app.models.program import Program

programs_bp = Blueprint('programs', __name__)

@programs_bp.route('', methods=['GET'])
def get_programs():
    """Get all programs, optionally filtered by college_code."""
    try:
        college_code = request.args.get('college_code')
        if college_code:
            programs = Program.get_by_college(college_code)
        else:
            programs = Program.get_all()
        print("PROGRAMS:", programs)
        return jsonify(programs), 200
    except Exception as e:
        print("ERROR in /api/programs:", e)
        return jsonify({"error": "server error"}), 500

@programs_bp.route('', methods=['POST'])
def create_program():
    """Create a new program."""
    try:
        data = request.get_json()
        required_fields = ['program_code', 'program_name', 'college_code']
        if not data or not all(field in data for field in required_fields):
            return jsonify({'error': 'program_code, program_name, and college_code are required'}), 400
        
        if Program.create(
            program_code=data['program_code'],
            program_name=data['program_name'],
            college_code=data['college_code']
        ):
            return jsonify(data), 201
        return jsonify({'error': 'Failed to create program'}), 400
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@programs_bp.route('/<code>', methods=['GET'])
def get_program(code):
    """Get a specific program by code."""
    try:
        program = Program.get_by_code(code)
        if not program:
            return jsonify({'error': 'Program not found'}), 404
        return jsonify(program), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@programs_bp.route('/<code>', methods=['PUT'])
def update_program(code):
    """Update a specific program by code."""
    try:
        data = request.get_json()
        if not data:
            return jsonify({'error': 'Request body is empty'}), 400
        
        if Program.update(
            program_code=code,
            program_name=data.get('program_name'),
            college_code=data.get('college_code')
        ):
            updated_program = Program.get_by_code(code)
            return jsonify(updated_program), 200
        return jsonify({'error': 'Failed to update program or program not found'}), 404
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@programs_bp.route('/<code>', methods=['DELETE'])
def delete_program(code):
    """Delete a specific program by code."""
    try:
        if Program.delete(code):
            return jsonify({'message': 'Program deleted successfully'}), 200
        return jsonify({'error': 'Failed to delete program or program not found'}), 404
    except Exception as e:
        return jsonify({'error': str(e)}), 500