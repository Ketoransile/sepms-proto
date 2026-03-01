# 🚀 SEPMS — Smart Entrepreneurial Pitching & Matching System

A full-stack web platform that connects **entrepreneurs** with **investors** through AI-powered pitch analysis, semantic matching, and streamlined investment workflows.

---

## 📁 Project Structure

```
sepms/
├── frontend/        → Next.js (App Router) + Tailwind CSS + shadcn/ui
├── backend/         → Node.js + Express + Mongoose (Core API)
├── ai-service/      → Python + FastAPI (AI Processing Microservice)
├── plan.md          → Full implementation plan
└── README.md        → You are here
```

---

## 🛠 Tech Stack

| Layer           | Technology                                     |
| --------------- | ---------------------------------------------- |
| Frontend        | Next.js 15, React, Tailwind CSS v4, shadcn/ui  |
| Backend API     | Node.js, Express.js, Mongoose                  |
| AI Service      | Python, FastAPI, Uvicorn                        |
| Database        | MongoDB Atlas (Document Store + Vector Search)  |
| Authentication  | Firebase Authentication (JWT)                   |
| File Storage    | Cloudinary                                      |

---

## 🚀 Getting Started (Local Development)

### Prerequisites

- **Node.js** v18+ and **npm**
- **Python** 3.10+
- **MongoDB Atlas** account (or local MongoDB instance)
- **Git**

---

### 1. Clone the Repository

```bash
git clone <your-repo-url>
cd sepms
```

### 2. Start the Frontend (Next.js)

```bash
cd frontend
npm install
npm run dev
```

The frontend will be available at **http://localhost:3000**

### 3. Start the Backend (Express API)

```bash
cd backend
npm install

# Create your .env file from the template
cp .env.example .env
# Edit .env with your MongoDB Atlas URI

npm run dev
```

The backend API will be available at **http://localhost:5000**

> 💡 Health check: [http://localhost:5000/api/health](http://localhost:5000/api/health)

### 4. Start the AI Service (FastAPI)

```bash
cd ai-service

# Create & activate virtual environment
python -m venv venv

# Windows
.\venv\Scripts\activate

# macOS/Linux
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Create your .env file from the template
cp .env.example .env

# Start the server
uvicorn main:app --reload --port 8000
```

The AI service will be available at **http://localhost:8000**

> 💡 Health check: [http://localhost:8000/health](http://localhost:8000/health)  
> 📖 API Docs: [http://localhost:8000/docs](http://localhost:8000/docs)

---

## 🔗 Service Communication

```
┌─────────────────┐     ┌──────────────────┐     ┌─────────────────┐
│   Frontend       │────▶│   Backend API    │────▶│   AI Service    │
│   :3000          │     │   :5000          │     │   :8000         │
│   (Next.js)      │     │   (Express)      │     │   (FastAPI)     │
└─────────────────┘     └──────────────────┘     └─────────────────┘
                               │
                               ▼
                        ┌──────────────┐
                        │  MongoDB     │
                        │  Atlas       │
                        └──────────────┘
```

---

## 📝 Environment Variables

Each service has a `.env.example` template. Copy it and fill in your values:

| Service     | File Location              | Key Variables                          |
| ----------- | -------------------------- | -------------------------------------- |
| Backend     | `backend/.env`             | `MONGO_URI`, `PORT`, `CLIENT_URL`      |
| AI Service  | `ai-service/.env`          | `AI_SERVICE_PORT`, `GEMINI_API_KEY`    |

---

## 📌 Development Phases

- [x] **Phase 1:** Web Infrastructure Setup & Monorepo
- [ ] **Phase 2:** Identity & Web Access Management (RBAC)
- [ ] **Phase 3:** Web-Based Pitch Submission & Storage
- [ ] **Phase 4:** AI & Analysis Subsystem
- [ ] **Phase 5:** Investor Web Experience & Semantic Matching
- [ ] **Phase 6:** Web Communication & Admin Portals
- [ ] **Phase 7:** Web Testing & Deployment

See [`plan.md`](./plan.md) for the full implementation plan.

---

## 👥 Team

Built as part of the SEPMS capstone project.

---

## 📄 License

This project is proprietary. All rights reserved.
