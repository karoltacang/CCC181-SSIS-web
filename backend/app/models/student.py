from app.db import get_db_connection

class Student:
    @staticmethod
    def get_all(page=1, per_page=10, search_term=None, program_code=None):
      conn = get_db_connection()
      cur = conn.cursor()

      # Base query
      query = '''
          SELECT student_id, first_name, last_name, year_level, gender, program_code
          FROM student
      '''
      count_query = 'SELECT COUNT(*) FROM student'
      
      conditions = []
      params = []

      # Filters
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
      conn.close()
      
      return {
          'data': results,
          'total': total_count,
          'page': page,
          'per_page': per_page,
          'total_pages': (total_count + per_page - 1) // per_page
      }
    
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
