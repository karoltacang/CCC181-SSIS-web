from werkzeug.security import generate_password_hash, check_password_hash
from psycopg2.extras import RealDictCursor
from app.db import get_db
import secrets

class User:
  """
  Handles user data,
  database interactions, and authentication logic.
  """
  def __init__(self, id, username, email, password=None, google_id=None):
    self.id = str(id) # Flask-Login expects string IDs
    self.username = username
    self.email = email
    self.password = password
    self.google_id = google_id

  @staticmethod
  def get(user_id):
    """Fetch a user by their unique ID."""
    db = get_db()
    with db.cursor(cursor_factory=RealDictCursor) as cursor:
        cursor.execute("SELECT * FROM users WHERE id = %s", (user_id,))
        data = cursor.fetchone()
    if data:
        return User(data['id'], data['username'], data['email'], data.get('password'), data.get('google_id'))
    return None

  @staticmethod
  def get_by_username(username):
    """Fetch a user by their username."""
    db = get_db()
    with db.cursor(cursor_factory=RealDictCursor) as cursor:
        cursor.execute("SELECT * FROM users WHERE username = %s", (username,))
        data = cursor.fetchone()
    if data:
        return User(data['id'], data['username'], data['email'], data.get('password'), data.get('google_id'))
    return None

  @staticmethod
  def get_by_email(email):
    """Fetch a user by their email address."""
    db = get_db()
    with db.cursor(cursor_factory=RealDictCursor) as cursor:
        cursor.execute("SELECT * FROM users WHERE email = %s", (email,))
        data = cursor.fetchone()
    if data:
        return User(data['id'], data['username'], data['email'], data.get('password'), data.get('google_id'))
    return None

  @staticmethod
  def create(username, email, password=None, google_id=None):
      """
      Create a new user in the database.
      Hashes the password if provided before storage.
      """
      db = get_db()
      if password:
          hashed_pw = generate_password_hash(password)
      else:
          # Generate a secure random password hash for OAuth users to satisfy NOT NULL constraint
          hashed_pw = generate_password_hash(secrets.token_hex(16))
      
      with db.cursor(cursor_factory=RealDictCursor) as cursor:
          cursor.execute(
              "INSERT INTO users (username, email, password, google_id) VALUES (%s, %s, %s, %s) RETURNING id",
              (username, email, hashed_pw, google_id)
          )
          user_id = cursor.fetchone()['id']
          db.commit()
          
      return User(user_id, username, email, hashed_pw, google_id)

  def check_password(self, password):
      """
      Verify a plaintext password against the stored hash.
      Returns True if they match, False otherwise.
      """
      if not self.password: return False
      return check_password_hash(self.password, password)
