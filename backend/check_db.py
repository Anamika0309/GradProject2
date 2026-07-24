import sqlite3
conn = sqlite3.connect('blinkit.db')
cur = conn.cursor()
cur.execute("SELECT name FROM sqlite_master WHERE type='table'")
tables = [row[0] for row in cur.fetchall()]
print('Tables:', tables)
conn.close()
