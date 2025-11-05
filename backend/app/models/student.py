from app.db import get_db
import uuid
from werkzeug.utils import secure_filename
from flask import current_app
from supabase import create_client

class Student:
  @staticmethod
  def get_all(page=1, per_page=10, search_term=None, program_code=None):
    conn = get_db()
    cur = conn.cursor()

    # Base query
    query = '''
        SELECT student_id, first_name, last_name, year_level, gender, program_code, photo_url
        FROM student
    '''
    count_query = 'SELECT COUNT(*) FROM student'
    
    conditions = []
    params = []

    # Filters/search
    if search_term:
      conditions.append('''
          (student_id ILIKE %s OR first_name ILIKE %s OR 
            last_name ILIKE %s OR gender ILIKE %s OR program_code ILIKE %s)
      ''')
      like_term = f'%{search_term}%'
      params.extend([like_term] * 5)
    
    if program_code:
      conditions.append('program_code = %s')
      params.append(program_code)

    # WHERE clause (for filters)
    if conditions:
      where_clause = ' WHERE ' + ' AND '.join(conditions)
      query += where_clause
      count_query += where_clause
    
    # Get total count
    cur.execute(count_query, params)
    total_count = cur.fetchone()[0]

    # Pagination
    query += ' ORDER BY student_id LIMIT %s OFFSET %s'
    offset = (page - 1) * per_page
    params.extend([per_page, offset])
    
    # Execute query
    cur.execute(query, params)
    columns = [desc[0] for desc in cur.description]
    results = [dict(zip(columns, row)) for row in cur.fetchall()]
    
    cur.close()
    
    return {
      'data': results,
      'total': total_count,
      'page': page,
      'per_page': per_page,
      'total_pages': (total_count + per_page - 1) // per_page
    }

  @staticmethod
  def create(student_id, first_name, last_name, year_level, gender, program_code):
    conn = get_db()
    cur = conn.cursor()
    try:
      cur.execute(
        '''INSERT INTO student (student_id, first_name, last_name, year_level, gender, program_code)
                  VALUES (%s, %s, %s, %s, %s, %s)''',
        (student_id, first_name, last_name, year_level, gender, program_code)
      )
      conn.commit()
      return True
    except Exception as e:
      conn.rollback()
      raise e
    finally:
      cur.close()
  
  @staticmethod
  def get_by_id(student_id):
    conn = get_db()
    cur = conn.cursor()
    try:
      cur.execute(
        'SELECT student_id, first_name, last_name, year_level, gender, program_code, photo_url FROM student WHERE student_id = %s',
        (student_id,)
      )
      row = cur.fetchone()
      if row:
        return {
          'student_id': row[0],
          'first_name': row[1],
          'last_name': row[2],
          'year_level': row[3],
          'gender': row[4],
          'program_code': row[5],
          'photo_url': row[6]
        }
      return None
    except Exception as e:
      raise e
    finally:
      cur.close()
  
  @staticmethod
  def update(student_id, first_name, last_name, year_level, gender, program_code):
    conn = get_db()
    cur = conn.cursor()
    try:
      cur.execute(
        '''UPDATE student
                  SET first_name = %s, last_name = %s, year_level = %s, gender = %s, program_code = %s
                  WHERE student_id = %s''',
        (first_name, last_name, year_level, gender, program_code, student_id)
      )
      affected = cur.rowcount
      conn.commit()
      return affected > 0
    except Exception as e:
      conn.rollback()
      raise e
    finally:
      cur.close()
  
  @staticmethod
  def delete(student_id):
    conn = get_db()
    cur = conn.cursor()
    try:
      cur.execute('DELETE FROM student WHERE student_id = %s', (student_id,))
      affected = cur.rowcount
      conn.commit()
      return affected > 0
    except Exception as e:
      conn.rollback()
      raise e
    finally:
      cur.close()

  @staticmethod
  def update_photo_url(student_id, photo_url):
      conn = get_db()
      with conn.cursor() as cursor:
          cursor.execute(
              "UPDATE student SET photo_url = %s WHERE student_id = %s",
              (photo_url, student_id)
          )
          conn.commit()

  @staticmethod
  def upload_photo(student_id, file):
    try:
      url = current_app.config.get('SUPABASE_URL')
      key = current_app.config.get('SUPABASE_KEY')
      
      if not url or not key:
          return False, "Supabase credentials missing", None

      supabase = create_client(url, key)
      storage_url = str(supabase.storage_url)
      if not storage_url.endswith('/'):
          supabase.storage_url = storage_url + '/'

      # Generate unique filename
      filename = secure_filename(file.filename)
      ext = filename.rsplit('.', 1)[1].lower()
      unique_filename = f"{student_id}_{uuid.uuid4().hex[:8]}.{ext}"
      
      bucket_name = 'SSIS'
      folder_name = 'student photos'
      file_path = f"{folder_name}/{unique_filename}"
      
      # Read file content
      file_content = file.read()
      
      supabase.storage.from_(bucket_name).upload(
          path=file_path,
          file=file_content,
          file_options={"content-type": file.content_type}
      )
      
      # Get Public URL
      photo_url = supabase.storage.from_(bucket_name).get_public_url(file_path)
      
      if photo_url:
          Student.update_photo_url(student_id, photo_url)
          return True, "File uploaded successfully", photo_url
      return False, "Failed to retrieve photo URL", None
    except Exception as e:
      return False, str(e), None
