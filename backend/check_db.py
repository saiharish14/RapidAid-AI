import sqlite3

conn = sqlite3.connect('database/rapidaid.db')
cursor = conn.cursor()

# Get all tables
cursor.execute("SELECT name FROM sqlite_master WHERE type='table'")
tables = cursor.fetchall()
print('Tables:', tables)

# Get ai_reports table schema
if tables:
    cursor.execute('PRAGMA table_info(ai_reports)')
    columns = cursor.fetchall()
    print('\nColumns in ai_reports table:')
    for col in columns:
        print(f'  {col}')

conn.close()
