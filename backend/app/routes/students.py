from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required
from app.models.student import Student

students_bp = Blueprint('students', __name__)

@students_bp.route('', methods=['GET'], strict_slashes=False)
@jwt_required()
def get_students():
  """Get all students with pagination, optionally filtered by program_code or a search query."""
  try:
    # Pagination params
    page = int(request.args.get('page', 1))
    per_page = int(request.args.get('per_page', 10))
    program_code = request.args.getlist('program_code[]') or request.args.getlist('program_code')
    year_level = request.args.getlist('year_level[]') or request.args.getlist('year_level')
    gender = request.args.getlist('gender[]') or request.args.getlist('gender')
    search = request.args.get('search')
    sort_by = request.args.get('sort_by', 'student_id')
    order = request.args.get('order', 'asc')
    only_codes = request.args.get('only_codes') == 'true'
    
    # Get paginated results
    result = Student.get_all(
        page=page,
        per_page=per_page,
        search_term=search,
        program_code=program_code,
        year_level=year_level,
        gender=gender,
        sort_by=sort_by,
        order=order,
        only_codes=only_codes
    )
    
    return jsonify(result), 200
  except Exception as e:
    return jsonify({'error': str(e)}), 500

@students_bp.route('', methods=['POST'], strict_slashes=False)
@jwt_required()
def create_student():
  """Create a new student."""
  try:
    data = request.get_json()
    
    student_id = data.get('student_id') or data.get('id')
    first_name = data.get('first_name') or data.get('firstname')
    last_name = data.get('last_name') or data.get('lastname')
    program_code = data.get('program_code') or data.get('program')
    year_level = data.get('year_level') or data.get('year')
    gender = data.get('gender')

    if not data or not all([student_id, first_name, last_name, program_code, year_level]):
      return jsonify({'error': 'student_id, first_name, last_name, program_code, and year_level are required'}), 400
    
    if Student.create(
      student_id=student_id,
      first_name=first_name,
      last_name=last_name,
      year_level=year_level,
      gender=gender,
      program_code=program_code
    ):
      return jsonify(data), 201
    return jsonify({'error': 'Failed to create student'}), 400
  except Exception as e:
    return jsonify({'error': str(e)}), 500

@students_bp.route('/<id>', methods=['GET'])
@jwt_required()
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
@jwt_required()
def update_student(id):
  """Update a specific student by ID."""
  try:
    data = request.get_json()
    if not data:
      return jsonify({'error': 'Request body is empty'}), 400

    first_name = data.get('first_name') or data.get('firstname')
    last_name = data.get('last_name') or data.get('lastname')
    year_level = data.get('year_level') or data.get('year')
    gender = data.get('gender')
    program_code = data.get('program_code') or data.get('program')
    new_id = data.get('student_id') or data.get('id') or id

    if Student.update(
      old_id=id,
      new_id=new_id,
      first_name=first_name,
      last_name=last_name,
      year_level=year_level,
      gender=gender,
      program_code=program_code,
    ):
      updated_student = Student.get_by_id(id)
      return jsonify(updated_student), 200
    return jsonify({'error': 'Failed to update student or student not found'}), 404
  except Exception as e:
    return jsonify({'error': str(e)}), 500

@students_bp.route('/<id>', methods=['DELETE'])
@jwt_required()
def delete_student(id):
  """Delete a specific student by ID."""
  try:
    if Student.delete(id):
      return jsonify({'message': 'Student deleted successfully'}), 200
    return jsonify({'error': 'Failed to delete student or student not found'}), 404
  except Exception as e:
    return jsonify({'error': str(e)}), 500

ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'gif'}

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

@students_bp.route('/<id>/photo', methods=['POST'])
@jwt_required()
def upload_photo(id):
  if 'file' not in request.files:
    return jsonify({'error': 'No file part'}), 400
  
  file = request.files['file']
  
  if file.filename == '':
    return jsonify({'error': 'No selected file'}), 400
      
  if file and allowed_file(file.filename):
    success, message, photo_url = Student.upload_photo(id, file)
    
    if success:
        return jsonify({'message': message, 'photo_url': photo_url})
    else:
        return jsonify({'error': message}), 500
          
  return jsonify({'error': 'File type not allowed'}), 400
