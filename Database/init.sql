-- Runs automatically the first time the MySQL container starts.

CREATE TABLE IF NOT EXISTS conversations (
    id         INT AUTO_INCREMENT PRIMARY KEY,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS messages (
    id              INT AUTO_INCREMENT PRIMARY KEY,
    conversation_id INT NOT NULL,
    role            ENUM('user', 'assistant') NOT NULL,  -- who said it
    content         TEXT NOT NULL,
    created_at      DATETIME DEFAULT CURRENT_TIMESTAMP,
    -- deleting a conversation also deletes its messages
    FOREIGN KEY (conversation_id) REFERENCES conversations(id) ON DELETE CASCADE
);
