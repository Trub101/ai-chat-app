import os
import mysql.connector


def run(sql, params=(), fetch=False):
    """Run one SQL query. Returns rows when fetch=True, otherwise the new row id."""
    conn = mysql.connector.connect(
        host=os.getenv("DB_HOST", "localhost"),
        port=int(os.getenv("DB_PORT", "3306")),
        user=os.getenv("MYSQL_USER"),
        password=os.getenv("MYSQL_PASSWORD"),
        database=os.getenv("MYSQL_DATABASE"),
    )
    cursor = conn.cursor(dictionary=True)
    cursor.execute(sql, params)
    result = cursor.fetchall() if fetch else cursor.lastrowid
    conn.commit()
    cursor.close()
    conn.close()
    return result


def list_conversations():
    # The title is the start of the first user message. Empty chats are hidden.
    return run(
        """
        SELECT c.id, c.created_at,
               (SELECT LEFT(m.content, 60) FROM messages m
                WHERE m.conversation_id = c.id AND m.role = 'user'
                ORDER BY m.id LIMIT 1) AS title
        FROM conversations c
        HAVING title IS NOT NULL
        ORDER BY c.id DESC
        """,
        fetch=True,
    )


def create_conversation():
    return run("INSERT INTO conversations () VALUES ()")


def conversation_exists(conversation_id):
    return bool(run("SELECT id FROM conversations WHERE id = %s", (conversation_id,), fetch=True))


def delete_conversation(conversation_id):
    run("DELETE FROM conversations WHERE id = %s", (conversation_id,))


def get_messages(conversation_id):
    return run(
        "SELECT id, role, content FROM messages WHERE conversation_id = %s ORDER BY id",
        (conversation_id,),
        fetch=True,
    )


def add_message(conversation_id, role, content):
    return run(
        "INSERT INTO messages (conversation_id, role, content) VALUES (%s, %s, %s)",
        (conversation_id, role, content),
    )
