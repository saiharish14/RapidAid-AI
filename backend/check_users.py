import sqlite3

conn = sqlite3.connect('database/rapidaid.db')
cursor = conn.cursor()

# Get all tables
cursor.execute("SELECT name FROM sqlite_master WHERE type='table'")
tables = cursor.fetchall()
print('Tables:', tables)

# Get users table schema
cursor.execute('PRAGMA table_info(users)')
users_columns = cursor.fetchall()
print('\nColumns in users table:')
for col in users_columns:
    print(f'  {col}')

# Get ai_reports table schema to check for user_id foreign key
cursor.execute('PRAGMA table_info(ai_reports)')
reports_columns = cursor.fetchall()
print('\nColumns in ai_reports table:')
for col in reports_columns:
    print(f'  {col}')

# Check foreign key constraints
cursor.execute("SELECT sql FROM sqlite_master WHERE type='table' AND name='ai_reports'")
reports_sql = cursor.fetchone()
print('\nai_reports table SQL:')
print(reports_sql[0])

conn.close()
