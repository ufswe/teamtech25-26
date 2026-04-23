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

def write_airports(code1, code2):
    command = f"INSERT INTO flight_history (airport_code_1, airport_code_2) values (\"{code1}\", \"{code2}\")"
    conn = sqlite3.connect('database.db')
    c = conn.cursor()
    c.execute(command)
    conn.commit()
    conn.close()