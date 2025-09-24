from flask import Blueprint, request, jsonify
from app.models.college import College

colleges_bp = Blueprint('colleges', __name__)

@colleges_bp.route('', methods=['GET'])
def get_colleges():
  """Get all colleges or search colleges with pagination"""
  try:
    # Pagination params
    page = int(request.args.get('page', 1))
    per_page = int(request.args.get('per_page', 10))
    search = request.args.get('search')
    only_codes = request.args.get('only_codes') == 'true'

    # Paginated results
    result = College.get_all(
      page=page,
      per_page=per_page,
      search_term=search,
      only_codes=only_codes
    )

    return jsonify(result),  200
  except Exception as e:
    return jsonify({'error': str(e)}), 500

@colleges_bp.route('', methods=['POST'])
def create_college():
  """Create a new college."""
  try:
    data = request.get_json()
    if not data or 'college_code' not in data or 'college_name' not in data:
      return jsonify({'error': 'college_code and college_name are required'}), 400
    
    if College.create(data['college_code'], data['college_name']):
      return jsonify(data), 201
    return jsonify({'error': 'Failed to create college'}), 400
  except Exception as e:
    return jsonify({'error': str(e)}), 500

@colleges_bp.route('/<code>', methods=['GET'])
def get_college(code):
  """Get a specific college by code."""
  try:
    college = College.get_by_code(code)
    if not college:
      return jsonify({'error': 'College not found'}), 404
    return jsonify(college), 200
  except Exception as e:
    return jsonify({'error': str(e)}), 500

@colleges_bp.route('/<code>', methods=['PUT'])
def update_college(code):
  """Update a specific college by code."""
  try:
    data = request.get_json()
    if not data or 'college_name' not in data:
      return jsonify({'error': 'Request body must contain college_name'}), 400
    
    if College.update(code, data.get('college_name')):
      updated_college = College.get_by_code(code)
      return jsonify(updated_college), 200
    return jsonify({'error': 'Failed to update college or college not found'}), 404
  except Exception as e:
    return jsonify({'error': str(e)}), 500

@colleges_bp.route('/<code>', methods=['DELETE'])
def delete_college(code):
  """Delete a specific college by code."""
  try:
    if College.delete(code):
      return jsonify({'message': 'College deleted successfully'}), 200
    return jsonify({'error': 'Failed to delete college or college not found'}), 404
  except Exception as e:
    return jsonify({'error': str(e)}), 500