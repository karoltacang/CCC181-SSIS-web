import psycopg2
from psycopg2 import pool
from psycopg2.extras import RealDictCursor
from flask import g
from app.config import Config

pg_pool = None

def get_db_connection():
  global pg_pool
  if pg_pool is None:
    pg_pool = psycopg2.pool.ThreadedConnectionPool(
      minconn=1,
      maxconn=20,
      host=Config.DB_HOST,
      port=Config.DB_PORT,
      database=Config.DB_NAME,
      user=Config.DB_USER,
      password=Config.DB_PASSWORD,
      sslmode='require'
    )
  return pg_pool.getconn()

def get_db():
  if 'db' not in g:
    g.db = get_db_connection()
  return g.db

def close_db(e=None):
  db = g.pop('db', None)
  if db is not None:
    if pg_pool:
      pg_pool.putconn(db)
    else:
      db.close()

def init_app(app):
  app.teardown_appcontext(close_db)