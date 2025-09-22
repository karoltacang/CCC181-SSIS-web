from app.db import get_db_connection

class Program:
    @staticmethod
    def get_all():
      conn = get_db_connection()
      cur = conn.cursor()
      cur.execute('''
            SELECT program_code, program_name, college_code 
            FROM program
            ORDER BY program_code
        ''')
      columns = [desc[0] for desc in cur.description]
      results = [dict(zip(columns, row)) for row in cur.fetchall()]
      cur.close()
      conn.close()
      return results
    
    @staticmethod
    def get_by_code(program_code):
      conn = get_db_connection()
      cur = conn.cursor()
      cur.execute('''
            SELECT program_code, program_name, college_code 
            FROM program
            WHERE program_code = %s
        ''', (program_code,))
      columns = [desc[0] for desc in cur.description]
      row = cur.fetchone()
      result = dict(zip(columns, row)) if row else None
      cur.close()
      conn.close()
      return result
    
    @staticmethod
    def get_by_college(college_code):
      conn = get_db_connection()
      cur = conn.cursor()
      cur.execute('''
            SELECT program_code, program_name, college_code 
            FROM program
            WHERE college_code = %s
            ORDER BY program_code
        ''', (college_code,))
      columns = [desc[0] for desc in cur.description]
      results = [dict(zip(columns, row)) for row in cur.fetchall()]
      cur.close()
      conn.close()
      return results

    @staticmethod
    def create(program_code, program_name, college_code):
      conn = get_db_connection()
      cur = conn.cursor()
      try:
        cur.execute(
          'INSERT INTO program (program_code, program_name, college_code) VALUES (%s, %s, %s)',
          (program_code, program_name, college_code)
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
    def update(program_code, program_name, college_code):
      conn = get_db_connection()
      cur = conn.cursor()
      try:
        cur.execute(
          'UPDATE program SET program_name = %s, college_code = %s WHERE program_code = %s',
          (program_name, college_code, program_code)
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
    def delete(program_code):
      conn = get_db_connection()
      cur = conn.cursor()
      try:
        cur.execute('DELETE FROM program WHERE program_code = %s', (program_code,))
        affected = cur.rowcount
        conn.commit()
        return affected > 0
      except Exception as e:
        conn.rollback()
        raise e
      finally:
        cur.close()
        conn.close()