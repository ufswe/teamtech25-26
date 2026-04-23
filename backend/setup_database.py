import sqlite3
def setup_database():
    conn = sqlite3.connect('database.db')
    c = conn.cursor()
    c.execute('''
        CREATE TABLE IF NOT EXISTS flight_history (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            airport_code_1 VARCHAR(3) NOT NULL,
            airport_code_2 VARCHAR(3) NOT NULL
        )
    ''')
    conn.commit()
    conn.close()