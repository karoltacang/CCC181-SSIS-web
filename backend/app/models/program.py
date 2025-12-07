from app.db import get_db

class Program:
  @staticmethod
  def get_all(page=1, per_page=10, search_term=None, only_codes=False, sort_by='program_code', order='asc'):
    conn = get_db()
    cur = conn.cursor()

    if only_codes:
        cur.execute('SELECT program_code FROM program ORDER BY program_code ASC')
        results = [row[0] for row in cur.fetchall()]
        cur.close()
        return {'data': results}

    query = 'SELECT program_code, program_name, college_code FROM program'
    count_query = 'SELECT COUNT(*) FROM program'
    
    params = []
    if search_term:
      where_clause = ' WHERE program_code ILIKE %s OR program_name ILIKE %s OR college_code ILIKE %s'
      query += where_clause
      count_query += where_clause
      term = f'%{search_term}%'
      params.extend([term, term, term])
    
    cur.execute(count_query, params)
    total_count = cur.fetchone()[0]

    # Sorting
    valid_sort_columns = {'program_code', 'program_name', 'college_code'}
    if sort_by not in valid_sort_columns:
        sort_by = 'program_code'
    
    sort_order = 'DESC' if order.lower() == 'desc' else 'ASC'
    query += f' ORDER BY {sort_by} {sort_order} LIMIT %s OFFSET %s'

    offset = (page - 1) * per_page
    params.extend([per_page, offset])
    
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
  def create(code, name, college_code):
    conn = get_db()
    cur = conn.cursor()
    try:
      cur.execute('INSERT INTO program (program_code, program_name, college_code) VALUES (%s, %s, %s)', (code, name, college_code))
      conn.commit()
      return True
    except Exception:
      conn.rollback()
      return False
    finally:
      cur.close()

  @staticmethod
  def update(old_code, new_code, name, college_code):
    conn = get_db()
    cur = conn.cursor()
    try:
      cur.execute('UPDATE program SET program_code = %s, program_name = %s, college_code = %s WHERE program_code = %s', (new_code, name, college_code, old_code))
      conn.commit()
      if cur.rowcount > 0:
        return True, "Program updated successfully"
      return False, "Program not found"
    except Exception as e:
      conn.rollback()
      return False, str(e)
    finally:
      cur.close()

  @staticmethod
  def delete(code):
    conn = get_db()
    cur = conn.cursor()
    try:
      cur.execute('DELETE FROM program WHERE program_code = %s', (code,))
      conn.commit()
      if cur.rowcount > 0:
        return True, "Program deleted successfully"
      return False, "Program not found"
    except Exception as e:
      conn.rollback()
      return False, str(e)
    finally:
      cur.close()