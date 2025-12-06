from app.db import get_db

class College:
  @staticmethod
  def get_all(page=1, per_page=10, search_term=None, only_codes=False, sort_by='college_code', order='asc'):
    conn = get_db()
    cur = conn.cursor()

    if only_codes:
        cur.execute('SELECT college_code FROM college')
        results = [row[0] for row in cur.fetchall()]
        cur.close()
        return {'data': results}

    query = 'SELECT college_code, college_name FROM college'
    count_query = 'SELECT COUNT(*) FROM college'
    
    params = []
    if search_term:
      where_clause = ' WHERE college_code ILIKE %s OR college_name ILIKE %s'
      query += where_clause
      count_query += where_clause
      term = f'%{search_term}%'
      params.extend([term, term])
    
    # Get total count
    cur.execute(count_query, params)
    total_count = cur.fetchone()[0]

    # Sorting
    valid_sort_columns = {'college_code', 'college_name'}
    if sort_by not in valid_sort_columns:
        sort_by = 'college_code'
    
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
  def create(code, name):
    conn = get_db()
    cur = conn.cursor()
    try:
      cur.execute('INSERT INTO college (college_code, college_name) VALUES (%s, %s)', (code, name))
      conn.commit()
      return True
    except Exception:
      conn.rollback()
      return False
    finally:
      cur.close()

  @staticmethod
  def update(code, name):
    conn = get_db()
    cur = conn.cursor()
    try:
      cur.execute('UPDATE college SET college_name = %s WHERE college_code = %s', (name, code))
      conn.commit()
      return cur.rowcount > 0
    except Exception:
      conn.rollback()
      return False
    finally:
      cur.close()

  @staticmethod
  def delete(code):
    conn = get_db()
    cur = conn.cursor()
    try:
      cur.execute('DELETE FROM college WHERE college_code = %s', (code,))
      conn.commit()
      return cur.rowcount > 0
    except Exception:
      conn.rollback()
      return False
    finally:
      cur.close()