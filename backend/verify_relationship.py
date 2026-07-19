import sqlite3

conn = sqlite3.connect('database/rapidaid.db')
cursor = conn.cursor()

# Check if foreign key is enabled
cursor.execute('PRAGMA foreign_keys')
fk_status = cursor.fetchone()
print(f'Foreign keys enabled: {fk_status}')

# Get users table schema
cursor.execute('PRAGMA table_info(users)')
users_columns = cursor.fetchall()
print('\nUsers table schema:')
for col in users_columns:
    print(f'  {col}')

# Get ai_reports table schema
cursor.execute('PRAGMA table_info(ai_reports)')
reports_columns = cursor.fetchall()
print('\nAI Reports table schema:')
for col in reports_columns:
    print(f'  {col}')

# Check foreign key constraints on ai_reports
cursor.execute("PRAGMA foreign_key_list(ai_reports)")
fk_list = cursor.fetchall()
print('\nForeign key constraints on ai_reports:')
for fk in fk_list:
    print(f'  {fk}')

conn.close()
