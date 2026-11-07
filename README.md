# AI Chat

A full-stack chat app in the spirit of ChatGPT and Claude. You can hold long conversations with an AI
assistant (Anthropic's Claude), and every chat is saved so you can come back to it later and continue
with the full context.

**GitHub:** https://github.com/Trub101/ai-chat-app

**Developer:** Daniel Trubiner

## Features

- Chat with Claude: your messages on the right, AI replies on the left
- Sidebar with all previous chats: click one to continue it, or ✕ to delete it
- "New chat" button. A page refresh also starts a fresh chat, and old chats stay in the sidebar
- The AI gets the conversation history, so it remembers what was said (the last 30 messages are sent to keep long chats fast)
- "Thinking..." indicator, auto-scroll, Enter to send / Shift+Enter for a new line, clear error messages
- About page with project and developer info
- The API key stays on the server. The browser never sees it

## Tech stack

| Part | Technology |
|---|---|
| Frontend | React (Vite), React Router |
| Backend | Python, FastAPI, Pydantic |
| Database | MySQL 8 |
| AI | Anthropic Claude (`anthropic` Python SDK) |
| Run | Docker Compose |

## Architecture

```
Browser (React)  --/api-->  FastAPI  -->  Anthropic API (key from Backend/.env)
                               |
                               v
                             MySQL
```

When you send a message, the server loads the conversation from MySQL, sends it with the new
message to Claude, then saves both the message and the reply.

## Project structure

```
├── Database/
│   └── init.sql               # creates the tables
├── Backend/
│   ├── main.py                # FastAPI routes
│   ├── db.py                  # MySQL queries
│   ├── ai.py                  # Claude API call
│   ├── schemas.py             # Pydantic validation models
│   ├── requirements.txt
│   ├── Dockerfile
│   ├── .env.example           # template for the secret .env file
│   └── postman_collection.json
├── frontend/
│   ├── src/
│   │   ├── App.jsx, main.jsx, api.js, styles.css
│   │   ├── pages/             # Home.jsx, About.jsx
│   │   └── components/        # Navbar, Sidebar, ChatWindow, MessageInput
│   ├── nginx.conf, Dockerfile, vite.config.js, package.json
└── docker-compose.yml
```

## Database

| Table | Columns |
|---|---|
| `conversations` | `id`, `created_at` |
| `messages` | `id`, `conversation_id`, `role` (`user` / `assistant`), `content`, `created_at` |

## How to run

### 1. Create the secret `.env` file

Copy `Backend/.env.example` to `Backend/.env` and fill in:

- `ANTHROPIC_API_KEY`: your secret key from https://console.anthropic.com (it starts with `sk-ant-`)
- `MYSQL_ROOT_PASSWORD` and `MYSQL_PASSWORD`: any passwords you choose

### 2a. Run with Docker (recommended)

```bash
docker compose up --build
```

Open **http://localhost:3000**. To stop: `docker compose down`.

> If you change the MySQL passwords later, reset the database with `docker compose down -v`
> (this deletes the saved chats). MySQL only reads the passwords the first time it starts.

### 2b. Run without Docker (for development)

Start only MySQL with `docker compose up mysql`, or use your own MySQL and run `Database/init.sql` on it. Then:

```bash
# Backend (terminal 1)
cd Backend
python -m venv venv
venv\Scripts\activate          # Mac/Linux: source venv/bin/activate
pip install -r requirements.txt
uvicorn main:app --reload      # http://localhost:8000/docs

# Frontend (terminal 2)
cd frontend
npm install
npm run dev                    # http://localhost:3000
```

## API

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/conversations` | List previous chats |
| POST | `/api/conversations` | Start a new chat |
| DELETE | `/api/conversations/{id}` | Delete a chat and its messages |
| GET | `/api/conversations/{id}/messages` | Get all messages of a chat |
| POST | `/api/conversations/{id}/messages` | Send `{"content": "..."}` and get the AI reply |

Interactive docs: http://localhost:8000/docs. A Postman collection is in `Backend/postman_collection.json`.
