from flask import Blueprint, request, jsonify
from app.models.student import Student

students_bp = Blueprint('students', __name__)

@students_bp.route('/', methods=['GET'])
def get_students():
    try:
        students = Student.get_all()
        return jsonify(students), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@students_bp.route('/<string:id>', methods=['GET'])
def get_student(id):
    try:
        student = Student.get_by_id(id)
        if not student:
            return jsonify({'error': 'Student not found'}), 404
        return jsonify(student), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@students_bp.route('/', methods=['POST'])
def create_student():
    try:
        data = request.get_json()
        Student.create(
            data['student_id'], 
            data['first_name'], 
            data['last_name'],
            data['year_level'], 
            data['gender'], 
            data['program_code']
        )
        return jsonify({'message': 'Student created successfully'}), 201
    except Exception as e:
        return jsonify({'error': str(e)}), 400

@students_bp.route('/<string:id>', methods=['PUT'])
def update_student(id):
    try:
        data = request.get_json()
        success = Student.update(
            id,
            data['first_name'], 
            data['last_name'],
            data['year_level'], 
            data['gender'], 
            data['program_code']
        )
        if not success:
            return jsonify({'error': 'Student not found'}), 404
        return jsonify({'message': 'Student updated successfully'}), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 400

@students_bp.route('/<string:id>', methods=['DELETE'])
def delete_student(id):
    try:
        success = Student.delete(id)
        if not success:
            return jsonify({'error': 'Student not found'}), 404
        return jsonify({'message': 'Student deleted successfully'}), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 400
