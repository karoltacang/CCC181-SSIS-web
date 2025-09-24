from app.db import get_db_connection

class College:
    @staticmethod
    def get_all(page=1, per_page=10, search_term=None, only_codes=False):
      conn = get_db_connection()
      cur = conn.cursor()

      # Base query
      columns = "college_code" if only_codes else "college_code, college_name"
      query = f'''
          SELECT {columns}
          FROM college
      '''
      count_query = 'SELECT COUNT(*) FROM college'

      conditions = []
      params = []

      # Filters/search
      if search_term:
        conditions.append('''
          (college_code ILIKE %s OR college_name ILIKE %s)
      ''')
        like_term = f'%{search_term}%'
        params.extend([like_term, like_term])

      # WHERE clause
      if conditions:
        where_clause = 'WHERE ' + ' AND '.join(conditions)
        query += where_clause
        count_query += where_clause

      # Get total count
      cur.execute(count_query, params)
      total_count = cur.fetchone()[0]

      # Pagination
      query += ' ORDER BY college_code LIMIT %s OFFSET %s'
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
    
    @staticmethod
    def get_by_code(college_code):
      conn = get_db_connection()
      cur = conn.cursor()
      try:
        cur.execute(
          'SELECT college_code, college_name FROM college WHERE college_code = %s',
          (college_code,)
        )
        row = cur.fetchone()
        if row:
          return {
            'college_code': row[0],
            'college_name': row[1]
          }
        return None
      except Exception as e:
        raise e
      finally:
        cur.close()
        conn.close()