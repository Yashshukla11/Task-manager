# QuickTask - Task Management Application

A full-stack task management app with analytics dashboard.

## Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | React 18, Vite, Tailwind CSS, Chart.js |
| Backend | Node.js, Express, MongoDB, JWT |
| Analytics | Python, FastAPI, PyMongo |

## Prerequisites

- Node.js v18+
- Python 3.11+
- MongoDB (local or Atlas)

## Project Structure

```
├── frontend/          # React app (port 5173)
├── backend/           # Express API (port 5001)
├── analytics/         # FastAPI service (port 8001)
└── docker-compose.yml # Docker setup
```

## Setup

### 1. Clone & Install

```bash
# Backend
cd backend && npm install

# Frontend
cd frontend && npm install

# Analytics
cd analytics
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
```

### 2. Environment Variables

**backend/.env**
```
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/quicktask
```

**analytics/.env**
```
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/quicktask
```

### 3. Run Services

```bash
# Terminal 1 - Backend
cd backend && npm run dev

# Terminal 2 - Analytics
cd analytics && source venv/bin/activate && python app.py

# Terminal 3 - Frontend
cd frontend && npm run dev
```

### 4. Seed Database (Optional)

```bash
cd backend && npm run seed
```

Test credentials: `john@example.com` / `password123`

## API Endpoints

### Auth
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register user |
| POST | `/api/auth/login` | Login user |
| GET | `/api/auth/me` | Get current user |

### Tasks
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/tasks` | Get all tasks |
| POST | `/api/tasks` | Create task |
| PUT | `/api/tasks/:id` | Update task |
| DELETE | `/api/tasks/:id` | Delete task |

### Analytics
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/analytics/user-stats/:userId` | Get user stats |
| GET | `/api/analytics/productivity/:userId` | Get productivity data |

## Docker

```bash
docker-compose up --build
```

