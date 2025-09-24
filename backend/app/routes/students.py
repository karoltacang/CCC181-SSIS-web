from flask import Blueprint, request, jsonify
from app.models.student import Student

students_bp = Blueprint('students', __name__)

@students_bp.route('', methods=['GET'])
def get_students():
  """Get all students with pagination, optionally filtered by program_code or a search query."""
  try:
    # Pagination params
    page = int(request.args.get('page', 1))
    per_page = int(request.args.get('per_page', 10))
    program_code = request.args.get('program_code')
    search = request.args.get('search')
    
    # Get paginated results
    result = Student.get_all(
        page=page,
        per_page=per_page,
        search_term=search,
        program_code=program_code
    )
    
    return jsonify(result), 200
  except Exception as e:
    return jsonify({'error': str(e)}), 500

@students_bp.route('', methods=['POST'])
def create_student():
  """Create a new student."""
  try:
    data = request.get_json()
    
    required_fields = ['student_id', 'first_name', 'last_name', 'program_code', 'year_level']
    if not data or not all(field in data for field in required_fields):
      return jsonify({'error': 'student_id, first_name, last_name, program_code, and year_level are required'}), 400
    
    if Student.create(
      student_id=data['student_id'],
      first_name=data['first_name'],
      last_name=data['last_name'],
      year_level=data['year_level'],
      gender=data.get('gender'),
      program_code=data['program_code']
    ):
      return jsonify(data), 201
    return jsonify({'error': 'Failed to create student'}), 400
  except Exception as e:
    return jsonify({'error': str(e)}), 500

@students_bp.route('/<id>', methods=['GET'])
def get_student(id):
  """Get a specific student by ID."""
  try:
    student = Student.get_by_id(id)
    if not student:
      return jsonify({'error': 'Student not found'}), 404
    return jsonify(student), 200
  except Exception as e:
    return jsonify({'error': str(e)}), 500

@students_bp.route('/<id>', methods=['PUT'])
def update_student(id):
  """Update a specific student by ID."""
  try:
    data = request.get_json()
    if not data:
      return jsonify({'error': 'Request body is empty'}), 400

    if Student.update(
      student_id=id,
      first_name=data.get('first_name'),
      last_name=data.get('last_name'),
      year_level=data.get('year_level'),
      gender=data.get('gender'),
      program_code=data.get('program_code'),
    ):
      updated_student = Student.get_by_id(id)
      return jsonify(updated_student), 200
    return jsonify({'error': 'Failed to update student or student not found'}), 404
  except Exception as e:
    return jsonify({'error': str(e)}), 500

@students_bp.route('/<id>', methods=['DELETE'])
def delete_student(id):
  """Delete a specific student by ID."""
  try:
    if Student.delete(id):
      return jsonify({'message': 'Student deleted successfully'}), 200
    return jsonify({'error': 'Failed to delete student or student not found'}), 404
  except Exception as e:
    return jsonify({'error': str(e)}), 500