from app.db import get_db_connection

class Program:
    @staticmethod
    def get_all(page=1, per_page=10, search_term=None, college_code=None, only_codes=False):
      conn = get_db_connection()
      cur = conn.cursor()

      # Base query
      columns = "program_code" if only_codes else "program_code, program_name, college_code"
      query = f'''
          SELECT {columns}
          FROM program
      '''
      count_query = 'SELECT COUNT(*) FROM program'
      
      conditions = []
      params = []

      # Filters
      if search_term:
          conditions.append('''
              (program_code ILIKE %s OR program_name ILIKE %s)
          ''')
          like_term = f'%{search_term}%'
          params.extend([like_term] * 2)
      
      if college_code:
          conditions.append('college_code = %s')
          params.append(college_code)

      # WHERE clause (for filters)
      if conditions:
          where_clause = ' WHERE ' + ' AND '.join(conditions)
          query += where_clause
          count_query += where_clause
      
      # Get total count
      cur.execute(count_query, params)
      total_count = cur.fetchone()[0]

      # Pagination
      query += ' ORDER BY program_code LIMIT %s OFFSET %s'
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
    def get_by_code(program_code):
      conn = get_db_connection()
      cur = conn.cursor()
      try:
        cur.execute(
          'SELECT program_code, program_name, college_code FROM program WHERE program_code = %s',
          (program_code,)
        )
        row = cur.fetchone()
        if row:
          return {
            'program_code': row[0],
            'program_name': row[1],
            'college_code': row[2]
          }
        return None
      except Exception as e:
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