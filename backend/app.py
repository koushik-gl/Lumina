import os
import sqlite3
import random
from flask import Flask, request, jsonify
from flask_cors import CORS

app = Flask(__name__)
# Enable CORS for all routes to allow requests from the React frontend
CORS(app)

DB_NAME = "library.db"

# Simple recommendation database
RECOMMENDATIONS_DB = {
    'Fiction': [
        {'title': 'The Kite Runner', 'author': 'Khaled Hosseini'},
        {'title': 'To Kill a Mockingbird', 'author': 'Harper Lee'},
        {'title': 'The Alchemist', 'author': 'Paulo Coelho'}
    ],
    'Non-Fiction': [
        {'title': 'Sapiens', 'author': 'Yuval Noah Harari'},
        {'title': 'Educated', 'author': 'Tara Westover'},
        {'title': 'Thinking, Fast and Slow', 'author': 'Daniel Kahneman'}
    ],
    'Sci-Fi': [
        {'title': 'Neuromancer', 'author': 'William Gibson'},
        {'title': 'Snow Crash', 'author': 'Neal Stephenson'},
        {'title': 'The Three-Body Problem', 'author': 'Cixin Liu'},
        {'title': 'Ender\'s Game', 'author': 'Orson Scott Card'}
    ],
    'Fantasy': [
        {'title': 'The Name of the Wind', 'author': 'Patrick Rothfuss'},
        {'title': 'The Way of Kings', 'author': 'Brandon Sanderson'},
        {'title': 'The Hobbit', 'author': 'J.R.R. Tolkien'}
    ],
    'Mystery': [
        {'title': 'Gone Girl', 'author': 'Gillian Flynn'},
        {'title': 'The Girl with the Dragon Tattoo', 'author': 'Stieg Larsson'},
        {'title': 'The Da Vinci Code', 'author': 'Dan Brown'}
    ],
    'Classic': [
        {'title': 'Pride and Prejudice', 'author': 'Jane Austen'},
        {'title': 'Moby Dick', 'author': 'Herman Melville'},
        {'title': 'Crime and Punishment', 'author': 'Fyodor Dostoevsky'}
    ],
    'Biography': [
        {'title': 'Steve Jobs', 'author': 'Walter Isaacson'},
        {'title': 'Becoming', 'author': 'Michelle Obama'},
        {'title': 'Elon Musk', 'author': 'Walter Isaacson'}
    ],
    'Self-Help': [
        {'title': 'The Power of Habit', 'author': 'Charles Duhigg'},
        {'title': 'Deep Work', 'author': 'Cal Newport'},
        {'title': 'Can\'t Hurt Me', 'author': 'David Goggins'}
    ],
    'Dystopian': [
        {'title': 'Brave New World', 'author': 'Aldous Huxley'},
        {'title': 'Fahrenheit 451', 'author': 'Ray Bradbury'},
        {'title': 'The Handmaid\'s Tale', 'author': 'Margaret Atwood'}
    ],
    'History': [
        {'title': 'Guns, Germs, and Steel', 'author': 'Jared Diamond'},
        {'title': 'The Silk Roads', 'author': 'Peter Frankopan'},
        {'title': 'A Short History of Nearly Everything', 'author': 'Bill Bryson'}
    ]
}

def get_db_connection():
    """Establishes a connection to the SQLite database."""
    try:
        conn = sqlite3.connect(DB_NAME)
        conn.row_factory = sqlite3.Row # Allows accessing columns by name
        return conn
    except sqlite3.Error as e:
        print(f"Database connection error: {e}")
        return None

def init_db():
    """Initializes the database and creates the books table if it doesn't exist."""
    if not os.path.exists(DB_NAME):
        print(f"Initializing database: {DB_NAME}")
    
    conn = get_db_connection()
    if conn:
        try:
            with conn:
                conn.execute('''
                    CREATE TABLE IF NOT EXISTS books (
                        id INTEGER PRIMARY KEY AUTOINCREMENT,
                        title TEXT NOT NULL,
                        author TEXT NOT NULL,
                        genre TEXT NOT NULL,
                        year INTEGER NOT NULL,
                        rating INTEGER DEFAULT 0,
                        status TEXT NOT NULL
                    )
                ''')
            print("Database initialized successfully.")
        except sqlite3.Error as e:
            print(f"Error creating table: {e}")
        finally:
            conn.close()

# --- API Routes ---

@app.route('/books', methods=['GET'])
def get_books():
    """Fetch all books from the database."""
    conn = get_db_connection()
    if not conn:
        return jsonify({"error": "Database connection failed"}), 500
    
    try:
        books = conn.execute('SELECT * FROM books ORDER BY id DESC').fetchall()
        conn.close()
        return jsonify([dict(book) for book in books]), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/add', methods=['POST'])
def add_book():
    """Add a new book to the library."""
    data = request.get_json()
    
    # Basic validation
    required_fields = ['title', 'author', 'genre', 'year', 'status']
    if not data:
        return jsonify({"error": "No data provided"}), 400
    
    missing_fields = [field for field in required_fields if field not in data]
    if missing_fields:
        return jsonify({"error": f"Missing fields: {', '.join(missing_fields)}"}), 400

    conn = get_db_connection()
    if not conn:
        return jsonify({"error": "Database connection failed"}), 500

    try:
        cur = conn.cursor()
        cur.execute(
            'INSERT INTO books (title, author, genre, year, rating, status) VALUES (?, ?, ?, ?, ?, ?)',
            (data['title'], data['author'], data['genre'], data['year'], data.get('rating', 0), data['status'])
        )
        conn.commit()
        new_id = cur.lastrowid
        conn.close()
        return jsonify({"id": new_id, "message": "Book added successfully"}), 201
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/update/<int:id>', methods=['PUT'])
def update_book(id):
    """Update an existing book by ID."""
    data = request.get_json()
    if not data:
        return jsonify({"error": "No data provided"}), 400

    conn = get_db_connection()
    if not conn:
        return jsonify({"error": "Database connection failed"}), 500

    try:
        cur = conn.cursor()
        
        # Check if book exists
        book = cur.execute('SELECT id FROM books WHERE id = ?', (id,)).fetchone()
        if not book:
            conn.close()
            return jsonify({"error": "Book not found"}), 404

        cur.execute("""
            UPDATE books 
            SET title = ?, author = ?, genre = ?, year = ?, rating = ?, status = ?
            WHERE id = ?
        """, (data['title'], data['author'], data['genre'], data['year'], data.get('rating', 0), data['status'], id))
        
        conn.commit()
        conn.close()
        return jsonify({"message": "Book updated successfully"}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/delete/<int:id>', methods=['DELETE'])
def delete_book(id):
    """Delete a book by ID."""
    conn = get_db_connection()
    if not conn:
        return jsonify({"error": "Database connection failed"}), 500

    try:
        cur = conn.cursor()
        
        # Check if book exists
        book = cur.execute('SELECT id FROM books WHERE id = ?', (id,)).fetchone()
        if not book:
            conn.close()
            return jsonify({"error": "Book not found"}), 404

        cur.execute('DELETE FROM books WHERE id = ?', (id,))
        conn.commit()
        conn.close()
        return jsonify({"message": "Book deleted successfully"}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/recommend', methods=['GET'])
def recommend_book():
    """Analyze library and recommend a book based on favorite genre."""
    conn = get_db_connection()
    if not conn:
        return jsonify({"error": "Database connection failed"}), 500

    try:
        # Get all books to analyze preferences
        books_rows = conn.execute('SELECT title, genre FROM books').fetchall()
        conn.close()
        
        books = [dict(row) for row in books_rows]
        
        if not books:
            return jsonify({
                "message": "Your library is empty. Add some books to get recommendations!", 
                "book": None
            }), 200

        # Count genres
        genre_counts = {}
        for book in books:
            genre = book['genre']
            genre_counts[genre] = genre_counts.get(genre, 0) + 1
            
        # Find favorite genre
        favorite_genre = max(genre_counts, key=genre_counts.get)
        
        # Get potential recommendations
        potential_recs = RECOMMENDATIONS_DB.get(favorite_genre, [])
        
        # Filter out books user already has
        user_titles = {b['title'].lower() for b in books}
        valid_recs = [r for r in potential_recs if r['title'].lower() not in user_titles]
        
        if valid_recs:
            recommendation = random.choice(valid_recs)
            return jsonify({
                "message": f"Because you read a lot of {favorite_genre}, you might enjoy:",
                "book": recommendation
            }), 200
        else:
            return jsonify({
                "message": f"You're a {favorite_genre} expert! We don't have new suggestions right now.",
                "book": None
            }), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    # Initialize the DB before starting the app
    init_db()
    # Run the Flask app
    app.run(debug=True, host='0.0.0.0', port=5000)
