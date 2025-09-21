from app.db import get_db_connection

class Program:
    @staticmethod
    def get_all():
        conn = get_db_connection()
        cur = conn.cursor()
        cur.execute('''
            SELECT p.program_code, p.program_name, p.college_code, c.college_name 
            FROM programs p 
            LEFT JOIN college c ON p.college_code = c.college_code
            ORDER BY p.program_code
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
            SELECT p.program_code, p.program_name, p.college_code, c.college_name 
            FROM programs p 
            LEFT JOIN college c ON p.college_code = c.college_code
            WHERE p.program_code = %s
        ''', (program_code,))
        columns = [desc[0] for desc in cur.description]
        row = cur.fetchone()
        result = dict(zip(columns, row)) if row else None
        cur.close()
        conn.close()
        return result
    
    @staticmethod
    def create(program_code, program_name, college_code):
        conn = get_db_connection()
        cur = conn.cursor()
        try:
            cur.execute(
                'INSERT INTO programs (program_code, program_name, college_code) VALUES (%s, %s, %s)',
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
                'UPDATE programs SET program_name = %s, college_code = %s WHERE program_code = %s',
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
            cur.execute('DELETE FROM programs WHERE program_code = %s', (program_code,))
            affected = cur.rowcount
            conn.commit()
            return affected > 0
        except Exception as e:
            conn.rollback()
            raise e
        finally:
            cur.close()
            conn.close()