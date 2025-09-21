from flask import Blueprint, request, jsonify
from app.models.program import Program

programs_bp = Blueprint('programs', __name__)

@programs_bp.route('/', methods=['GET'])
def get_programs():
    try:
        programs = Program.get_all()
        return jsonify(programs), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@programs_bp.route('/<string:code>', methods=['GET'])
def get_program(code):
    try:
        program = Program.get_by_code(code)
        if not program:
            return jsonify({'error': 'Program not found'}), 404
        return jsonify(program), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@programs_bp.route('/', methods=['POST'])
def create_program():
    try:
        data = request.get_json()
        Program.create(data['program_code'], data['program_name'], data['college_code'])
        return jsonify({'message': 'Program created successfully'}), 201
    except Exception as e:
        return jsonify({'error': str(e)}), 400

@programs_bp.route('/<string:code>', methods=['PUT'])
def update_program(code):
    try:
        data = request.get_json()
        success = Program.update(code, data['program_name'], data['college_code'])
        if not success:
            return jsonify({'error': 'Program not found'}), 404
        return jsonify({'message': 'Program updated successfully'}), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 400

@programs_bp.route('/<string:code>', methods=['DELETE'])
def delete_program(code):
    try:
        success = Program.delete(code)
        if not success:
            return jsonify({'error': 'Program not found'}), 404
        return jsonify({'message': 'Program deleted successfully'}), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 400