import sqlite3

conn = sqlite3.connect('database/rapidaid.db')
cursor = conn.cursor()

# Add user_id column to ai_reports table
try:
    cursor.execute('ALTER TABLE ai_reports ADD COLUMN user_id INTEGER')
    conn.commit()
    print("Successfully added user_id column to ai_reports table")
except sqlite3.OperationalError as e:
    if "duplicate column name" in str(e):
        print("user_id column already exists")
    else:
        print(f"Error: {e}")

# Verify the column was added
cursor.execute('PRAGMA table_info(ai_reports)')
columns = cursor.fetchall()
print('\nUpdated ai_reports columns:')
for col in columns:
    print(f'  {col}')

conn.close()
