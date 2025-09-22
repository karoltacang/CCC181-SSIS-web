from os import getenv

class Config:
  SECRET_KEY = getenv('SECRET_KEY')
  DB_HOST = getenv('DB_HOST')
  DB_PORT = getenv('DB_PORT', '5432')
  DB_NAME = getenv('DB_NAME')
  DB_USER = getenv('DB_USERNAME')
  DB_PASSWORD = getenv('DB_PASSWORD')