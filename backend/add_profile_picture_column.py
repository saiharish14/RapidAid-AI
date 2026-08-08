"""
Database Migration Script
Adds profile_picture column to users table
"""

import sqlite3
import os

def add_profile_picture_column():
    """Add profile_picture column to users table if it doesn't exist"""
    db_path = os.path.join(os.path.dirname(__file__), 'database', 'rapidaid.db')
    
    try:
        conn = sqlite3.connect(db_path)
        cursor = conn.cursor()
        
        # Check if column already exists
        cursor.execute("PRAGMA table_info(users)")
        columns = [column[1] for column in cursor.fetchall()]
        
        if 'profile_picture' not in columns:
            print("Adding profile_picture column to users table...")
            cursor.execute("ALTER TABLE users ADD COLUMN profile_picture TEXT")
            conn.commit()
            print("Successfully added profile_picture column")
        else:
            print("profile_picture column already exists")
        
        conn.close()
        return True
    except Exception as e:
        print(f"Error adding column: {e}")
        return False

if __name__ == "__main__":
    add_profile_picture_column()
