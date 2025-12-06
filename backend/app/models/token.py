from app.db import get_db

class TokenBlocklist:
    @staticmethod
    def add(jti):
        try:
            conn = get_db()
            with conn.cursor() as cur:
                cur.execute('INSERT INTO token_blocklist (jti) VALUES (%s)', (jti,))
                conn.commit()
                return True
        except Exception:
            return False

    @staticmethod
    def is_revoked(jti):
        try:
            conn = get_db()
            with conn.cursor() as cur:
                cur.execute('SELECT 1 FROM token_blocklist WHERE jti = %s', (jti,))
                return cur.fetchone() is not None
        except Exception:
            return False

    @staticmethod
    def cleanup():
        """Deletes expired tokens from the blocklist."""
        try:
            conn = get_db()
            with conn.cursor() as cur:
                # Delete tokens older than 8 hours
                cur.execute("DELETE FROM token_blocklist WHERE created_at < NOW() - INTERVAL '8 hours'")
                conn.commit()
                return cur.rowcount
        except Exception:
            return 0
