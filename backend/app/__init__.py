from flask import Flask, jsonify, send_from_directory
from flask_cors import CORS
from app.config import Config
from flask_jwt_extended import JWTManager
from authlib.integrations.flask_client import OAuth
from app.db import init_app as init_db
from app.models.token import TokenBlocklist
from flask_apscheduler import APScheduler
import os

# Initialize extensions
jwt = JWTManager()
oauth = OAuth()

def create_app():
  scheduler = APScheduler()
  # Define the static folder for the React production build
  project_root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
  static_folder = os.path.join(project_root, 'static')
  
  # Initialize Flask to serve static files from the React build folder
  app = Flask(__name__, static_folder=static_folder)
  app.config.from_object(Config)
  
  # Initialize Database Teardown
  init_db(app)

  # Initialize Scheduler
  scheduler.init_app(app)
  scheduler.start()
  
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
    if path.startswith('api/'):
      return jsonify({'error': 'API endpoint not found'}), 404

    full_path = os.path.join(app.static_folder, path)
    if path != "" and os.path.exists(full_path) and os.path.isfile(full_path):
      return send_from_directory(app.static_folder, path)
    else:
      # For all other paths, serve the React app's entry point.
      if os.path.exists(os.path.join(app.static_folder, 'index.html')):
        return send_from_directory(app.static_folder, 'index.html')
      return jsonify({'error': 'React build not found. Please run npm run build'}), 404
  
  @app.cli.command('cleanup-tokens')
  def cleanup_tokens():
      """Deletes expired tokens from the blocklist."""
      count = TokenBlocklist.cleanup()
      print(f"Cleaned up {count} expired tokens.")

  # Run cleanup every hour
  @scheduler.task('interval', id='cleanup_tokens', hours=1)
  def scheduled_cleanup():
      with app.app_context():
          TokenBlocklist.cleanup()
  
  return app