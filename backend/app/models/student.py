from app.db import get_db_connection

class Student:
    @staticmethod
    def get_all():
        conn = get_db_connection()
        cur = conn.cursor()
        cur.execute('''
            SELECT s.student_id, s.first_name, s.last_name, s.year_level, s.gender, 
                   s.program_code, p.program_name, c.college_name 
            FROM students s 
            LEFT JOIN programs p ON s.program_code = p.program_code
            LEFT JOIN college c ON p.college_code = c.college_code
            ORDER BY s.student_id
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
            SELECT s.student_id, s.first_name, s.last_name, s.year_level, s.gender, 
                   s.program_code, p.program_name, c.college_name 
            FROM students s 
            LEFT JOIN programs p ON s.program_code = p.program_code
            LEFT JOIN college c ON p.college_code = c.college_code
            WHERE s.student_id = %s
        ''', (student_id,))
        columns = [desc[0] for desc in cur.description]
        row = cur.fetchone()
        result = dict(zip(columns, row)) if row else None
        cur.close()
        conn.close()
        return result
    
    @staticmethod
    def create(student_id, first_name, last_name, year_level, gender, program_code):
        conn = get_db_connection()
        cur = conn.cursor()
        try:
            cur.execute(
                '''INSERT INTO students (student_id, first_name, last_name, year_level, gender, program_code) 
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
                '''UPDATE students 
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
            cur.execute('DELETE FROM students WHERE student_id = %s', (student_id,))
            affected = cur.rowcount
            conn.commit()
            return affected > 0
        except Exception as e:
            conn.rollback()
            raise e
        finally:
            cur.close()
            conn.close()
