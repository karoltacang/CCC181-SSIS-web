from flask import Blueprint, request, jsonify
from app.models.college import College

colleges_bp = Blueprint('colleges', __name__)

@colleges_bp.route('', methods=['GET'])
def get_colleges():
    try:
        page = int(request.args.get('page', 1))
        per_page = int(request.args.get('per_page', 10))
        search = request.args.get('search')
        only_codes = request.args.get('only_codes') == 'true'
        sort_by = request.args.get('sort_by', 'college_code')
        order = request.args.get('order', 'asc')
        
        result = College.get_all(page, per_page, search, only_codes=only_codes, sort_by=sort_by, order=order)
        return jsonify(result), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@colleges_bp.route('', methods=['POST'])
def create_college():
    data = request.json
    if not data or 'code' not in data or 'name' not in data:
        return jsonify({'error': 'Missing required fields'}), 400
    
    if College.create(data['code'], data['name']):
        return jsonify({'message': 'College created'}), 201
    return jsonify({'error': 'Failed to create college'}), 400

@colleges_bp.route('/<code>', methods=['PUT'])
def update_college(code):
    data = request.json
    if College.update(code, data.get('name')):
        return jsonify({'message': 'College updated'}), 200
    return jsonify({'error': 'Failed to update college'}), 404

@colleges_bp.route('/<code>', methods=['DELETE'])
def delete_college(code):
    if College.delete(code):
        return jsonify({'message': 'College deleted'}), 200
    return jsonify({'error': 'Failed to delete college'}), 404