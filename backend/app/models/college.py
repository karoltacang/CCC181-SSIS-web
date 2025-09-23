from app.db import get_db_connection

class College:
    @staticmethod
    def get_all():
      conn = get_db_connection()
      cur = conn.cursor()
      cur.execute('SELECT college_code, college_name FROM college ORDER BY college_code')
      columns = [desc[0] for desc in cur.description]
      results = [dict(zip(columns, row)) for row in cur.fetchall()]
      cur.close()
      conn.close()
      return results
    
    @staticmethod
    def get_by_code(college_code):
      conn = get_db_connection()
      cur = conn.cursor()
      cur.execute('SELECT college_code, college_name FROM college WHERE college_code = %s', (college_code,))
      columns = [desc[0] for desc in cur.description]
      row = cur.fetchone()
      result = dict(zip(columns, row)) if row else None
      cur.close()
      conn.close()
      return result
    
    @staticmethod
    def search(search_term):
      conn = get_db_connection()
      cur = conn.cursor()
      query = '''
            SELECT college_code, college_name FROM college
            WHERE college_code ILIKE %s OR college_name ILIKE %s
            ORDER BY college_code
        '''
      like_term = f'%{search_term}%'
      cur.execute(query, (like_term, like_term))
      columns = [desc[0] for desc in cur.description]
      results = [dict(zip(columns, row)) for row in cur.fetchall()]
      cur.close()
      conn.close()
      return results

    @staticmethod
    def create(college_code, college_name):
      conn = get_db_connection()
      cur = conn.cursor()
      try:
        cur.execute(
          'INSERT INTO college (college_code, college_name) VALUES (%s, %s)',
          (college_code, college_name)
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
    def update(college_code, college_name):
      conn = get_db_connection()
      cur = conn.cursor()
      try:
        cur.execute(
          'UPDATE college SET college_name = %s WHERE college_code = %s',
          (college_name, college_code)
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
    def delete(college_code):
      conn = get_db_connection()
      cur = conn.cursor()
      try:
        cur.execute('DELETE FROM college WHERE college_code = %s', (college_code,))
        affected = cur.rowcount
        conn.commit()
        return affected > 0
      except Exception as e:
        conn.rollback()
        raise e
      finally:
        cur.close()
        conn.close()