import psycopg2
from psycopg2.extras import RealDictCursor
from flask import g
from app.config import Config

def get_db_connection():
  conn = psycopg2.connect(
  host=Config.DB_HOST,
  port=Config.DB_PORT,
  database=Config.DB_NAME,
  user=Config.DB_USER,
  password=Config.DB_PASSWORD,
  sslmode='require'
  )
  return conn

def get_db():
  if 'db' not in g:
    g.db = get_db_connection()
  return g.db

def close_db(e=None):
  db = g.pop('db', None)
  if db is not None:
    db.close()

def init_app(app):
  app.teardown_appcontext(close_db)