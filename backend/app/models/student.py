from app.db import get_db_connection

class Student:
    @staticmethod
    def get_all():
      conn = get_db_connection()
      cur = conn.cursor()
      cur.execute('''
        SELECT student_id, first_name, last_name, year_level, gender, program_code
        FROM student
        ORDER BY student_id;
      ''')
      columns = [desc[0] for desc in cur.description]
      results = [dict(zip(columns, row)) for row in cur.fetchall()]
      cur.close()
      conn.close()
      return results
    
    @staticmethod
    def get_by_id(student_id):
      conn = get_db_connection()
      cur = conn.cursor()
      cur.execute('''
        SELECT student_id, first_name, last_name, year_level, gender, program_code
        FROM student
        WHERE student_id = %s;
      ''', (student_id,))
      columns = [desc[0] for desc in cur.description]
      row = cur.fetchone()
      result = dict(zip(columns, row)) if row else None
      cur.close()
      conn.close()
      return result
    
    @staticmethod
    def get_by_program(program_code):
      conn = get_db_connection()
      cur = conn.cursor()
      cur.execute('''
        SELECT student_id, first_name, last_name, year_level, gender, program_code
        FROM student
        WHERE program_code = %s
        ORDER BY student_id;
      ''', (program_code,))
      columns = [desc[0] for desc in cur.description]
      results = [dict(zip(columns, row)) for row in cur.fetchall()]
      cur.close()
      conn.close()
      return results

    @staticmethod
    def search(search_term):
      conn = get_db_connection()
      cur = conn.cursor()
      query = '''
        SELECT student_id, first_name, last_name, year_level, gender, program_code
        FROM student
        WHERE student_id ILIKE %s
          OR first_name ILIKE %s
          OR last_name ILIKE %s
          OR gender ILIKE %s
          OR program_code ILIKE %s
          ORDER BY student_id;
      '''
      like_term = f'%{search_term}%'
      
      try:
        cur.execute(query, (like_term, like_term, like_term))
        columns = [desc[0] for desc in cur.description]
        results = [dict(zip(columns, row)) for row in cur.fetchall()]
        return results
      finally:
        cur.close()
        conn.close()

    @staticmethod
    def create(student_id, first_name, last_name, year_level, gender, program_code):
      conn = get_db_connection()
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
        conn.close()
    
    @staticmethod
    def update(student_id, first_name, last_name, year_level, gender, program_code):
      conn = get_db_connection()
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
        conn.close()
    
    @staticmethod
    def delete(student_id):
      conn = get_db_connection()
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
        conn.close()
