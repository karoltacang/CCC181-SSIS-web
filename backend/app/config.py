from os import getenv
from dotenv import load_dotenv

load_dotenv()

class Config:
  SECRET_KEY = getenv('SECRET_KEY')
  DB_HOST = getenv('DB_HOST')
  DB_PORT = getenv('DB_PORT', '5432')
  DB_NAME = getenv('DB_NAME')
  DB_USER = getenv('DB_USERNAME')
  DB_PASSWORD = getenv('DB_PASSWORD')
  JWT_SECRET_KEY = getenv('JWT_SECRET_KEY', 'your-secret-key')
  GOOGLE_CLIENT_ID = getenv('GOOGLE_CLIENT_ID')
  GOOGLE_CLIENT_SECRET = getenv('GOOGLE_CLIENT_SECRET')
  SUPABASE_URL = getenv('SUPABASE_URL')
  SUPABASE_KEY = getenv('SUPABASE_KEY')