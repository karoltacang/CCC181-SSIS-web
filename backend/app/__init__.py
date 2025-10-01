from flask import Flask, jsonify, send_from_directory
from flask_cors import CORS
from app.config import Config
from flask_jwt_extended import JWTManager
from authlib.integrations.flask_client import OAuth
from app.db import init_app as init_db
import os

# Initialize extensions
jwt = JWTManager()
oauth = OAuth()

def create_app():
  # Define the static folder for the React production build
  project_root = os.path.dirname(os.path.dirname(__file__))
  static_folder = os.path.join(project_root, 'static')
  
  # Initialize Flask to serve static files from the React build folder
  app = Flask(__name__, static_folder=static_folder, static_url_path='')
  app.config.from_object(Config)
  
  # Initialize Database Teardown
  init_db(app)
  
  # Initialize Auth Extensions
  jwt.init_app(app)
  oauth.init_app(app)
  oauth.register(
      name='google',
      server_metadata_url='https://accounts.google.com/.well-known/openid-configuration',
      client_kwargs={'scope': 'openid email profile'}
  )

  # Enable CORS for API routes only
  CORS(app, resources={r"/api/*": {"origins": "*"}})
  
  # Register blueprints
  from app.routes.colleges import colleges_bp
  from app.routes.programs import programs_bp
  from app.routes.students import students_bp
  from app.routes.auth import auth_bp
  
  app.register_blueprint(colleges_bp, url_prefix='/api/colleges')
  app.register_blueprint(programs_bp, url_prefix='/api/programs')
  app.register_blueprint(students_bp, url_prefix='/api/students')
  app.register_blueprint(auth_bp, url_prefix='/api/auth')
  
  @app.route('/api/health', methods=['GET'])
  def health():
    return jsonify({'status': 'healthy', 'message': 'SSIS API is running'}), 200
  
  # This catch-all route serves the React app's entry point (index.html)
  # for any route that is not an API call or a static file.
  @app.route('/', defaults={'path': ''}, methods=['GET'])
  @app.route('/<path:path>', methods=['GET'])
  def serve_react(path):    
    # If it's an API call that doesn't exist, it will be handled correctly as a 404.
    if path != "" and os.path.exists(os.path.join(app.static_folder, path)):
      return send_from_directory(app.static_folder, path)
    else:
      # For all other paths, serve the React app's entry point.
      return send_from_directory(app.static_folder, 'index.html')
  
  return app