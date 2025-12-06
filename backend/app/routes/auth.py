from flask import Blueprint, request, jsonify, url_for, redirect, current_app
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity, get_jwt
from app.models.user import User
from app.models.token import TokenBlocklist
from app import oauth, jwt

auth_bp = Blueprint('auth', __name__)

@jwt.token_in_blocklist_loader
def check_if_token_revoked(jwt_header, jwt_payload):
    jti = jwt_payload["jti"]
    return TokenBlocklist.is_revoked(jti)

@auth_bp.route('/login', methods=['POST'])
def login():
    """
    Standard login endpoint using username and password.
    Returns a JWT access token upon successful authentication.
    """
    data = request.json
    username = data.get('username')
    password = data.get('password')
    
    if not username or not password:
        return jsonify({'error': 'Missing credentials'}), 400
        
    # Verify user credentials against the database
    user = User.get_by_username(username)
    if user and user.check_password(password):
        # Generate a new JWT access token for the user
        access_token = create_access_token(identity=user.username)
        return jsonify({
            'message': 'Login successful',
            'access_token': access_token,
            'user': {'username': user.username, 'email': user.email}
        })
    
    return jsonify({'error': 'Invalid username or password'}), 401

@auth_bp.route('/logout', methods=['POST'])
@jwt_required()
def logout():
    jti = get_jwt()['jti']
    if TokenBlocklist.add(jti):
        return jsonify({'message': 'Successfully logged out'}), 200
    return jsonify({'error': 'Logout failed'}), 500

@auth_bp.route('/register', methods=['POST'])
def register():
    """
    Register a new user.
    """
    data = request.json
    username = data.get('username')
    email = data.get('email')
    password = data.get('password')

    if not username or not email or not password:
        return jsonify({'error': 'Missing required fields'}), 400

    if User.get_by_username(username):
        return jsonify({'error': 'Username already taken'}), 409
    
    if User.get_by_email(email):
        return jsonify({'error': 'Email already registered'}), 409

    User.create(username, email, password)
    return jsonify({'message': 'User created successfully'}), 201

@auth_bp.route('/google')
def google_login():
    """
    Initiates the Google OAut authentication flow
    Redirects the user to Google's login page
    """
    redirect_uri = url_for('auth.google_callback', _external=True)
    return oauth.google.authorize_redirect(redirect_uri)

@auth_bp.route('/google/callback')
def google_callback():
    """
    Callback endpoint for Google OAuth.
    Handles the response from Google, creates/retrieves the user,
    and redirects to the frontend with a JWT token.
    """
    try:
        # Exchange the authorization code for an access token
        token = oauth.google.authorize_access_token()
        # Fetch user info explicitly using the userinfo endpoint
        user_info = oauth.google.userinfo()
        
        if not user_info:
            return jsonify({'error': 'Failed to fetch user info'}), 400
            
        email = user_info['email']
        google_id = user_info['sub']
        name = user_info.get('name', email.split('@')[0])
        
        # Check if the user already exists in the database
        user = User.get_by_email(email)
        if not user:
            # Handle username collision
            base_name = name
            counter = 1
            while User.get_by_username(name):
                name = f"{base_name}{counter}"
                counter += 1

            # Auto-register user if they don't exist
            user = User.create(username=name, email=email, google_id=google_id)
        
        # Generate a JWT for the session
        access_token = create_access_token(identity=user.username)
        
        # Redirect to the frontend with the token in the query string
        # The frontend should grab this token, save it, and redirect the user to the dashboard
        frontend_url = current_app.config.get('FRONTEND_URL', 'http://localhost:5173')
        return redirect(f'{frontend_url}/?token={access_token}')
    except Exception as e:
        return jsonify({'error': 'Google login failed', 'details': str(e)}), 500

@auth_bp.route('/me')
@jwt_required()
def me():
    """
    Protected endpoint to get the current authenticated user's profile.
    Requires a valid JWT token in the Authorization header.
    """
    current_username = get_jwt_identity()
    user = User.get_by_username(current_username)
    if user:
        return jsonify({'username': user.username, 'email': user.email})
    return jsonify({'error': 'User not found'}), 404
