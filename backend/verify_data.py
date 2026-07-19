import sqlite3

conn = sqlite3.connect('database/rapidaid.db')
cursor = conn.cursor()

# Query all records from ai_reports
cursor.execute('SELECT * FROM ai_reports')
rows = cursor.fetchall()

print(f"Total records in ai_reports: {len(rows)}")
print("\nRecords:")
for row in rows:
    print(f"ID: {row[0]}")
    print(f"Symptoms: {row[1]}")
    print(f"Possible Causes: {row[2]}")
    print(f"First Aid: {row[3]}")
    print(f"Severity: {row[4]}")
    print(f"Confidence: {row[5]}")
    print(f"Specialist: {row[6]}")
    print(f"Created At: {row[7]}")
    print("-" * 50)

conn.close()
