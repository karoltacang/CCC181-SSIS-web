from flask import Flask
from app.config import Config

def create_app():
    app = Flask(__name__)
    app.config.from_object(Config)
    
    from app.colleges import colleges_bp
    from app.programs import programs_bp
    from app.students import students_bp
    
    app.register_blueprint(colleges_bp, url_prefix='/api/colleges')
    app.register_blueprint(programs_bp, url_prefix='/api/programs')
    app.register_blueprint(students_bp, url_prefix='/api/students')
    
    return app
