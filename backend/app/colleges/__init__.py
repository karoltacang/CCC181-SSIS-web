from flask import Blueprint, request, jsonify
from app.models.college import College

colleges_bp = Blueprint('colleges', __name__)

@colleges_bp.route('/', methods=['GET'])
def get_colleges():
    try:
        colleges = College.get_all()
        return jsonify(colleges), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@colleges_bp.route('/<string:code>', methods=['GET'])
def get_college(code):
    try:
        college = College.get_by_code(code)
        if not college:
            return jsonify({'error': 'College not found'}), 404
        return jsonify(college), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@colleges_bp.route('/', methods=['POST'])
def create_college():
    try:
        data = request.get_json()
        College.create(data['college_code'], data['college_name'])
        return jsonify({'message': 'College created successfully'}), 201
    except Exception as e:
        return jsonify({'error': str(e)}), 400

@colleges_bp.route('/<string:code>', methods=['PUT'])
def update_college(code):
    try:
        data = request.get_json()
        success = College.update(code, data['college_name'])
        if not success:
            return jsonify({'error': 'College not found'}), 404
        return jsonify({'message': 'College updated successfully'}), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 400

@colleges_bp.route('/<string:code>', methods=['DELETE'])
def delete_college(code):
    try:
        success = College.delete(code)
        if not success:
            return jsonify({'error': 'College not found'}), 404
        return jsonify({'message': 'College deleted successfully'}), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 400