# Technology Stack

**Analysis Date:** 2026-05-09

## Languages

**Primary:**
- Python 3.x - Core testing and benchmarking logic (`crossword_tester.py`, `categorize_questions.py`, `categorize_errors.py`)
- JavaScript/Node.js - Backend API server (`backend/server.js`)
- TypeScript/React - Frontend dashboard (`frontend/src/`)

## Runtime

**Environment:**
- Node.js (Express) - Backend runtime
- Python 3.x - Core application logic
- Browser - Frontend runtime

**Package Manager:**
- npm - JavaScript/Node.js dependencies
- pip - Python dependencies

## Frameworks

**Core:**
- Express.js v4.18.2 - Backend web framework
- React v18.2.0 - Frontend UI library

**Testing:**
- No dedicated testing framework detected (core functionality is production code)

**Build/Dev:**
- Create React App v5.0.1 - Frontend build tool
- Nodemon v3.0.1 - Development server

## Key Dependencies

**Critical:**
- litellm - Universal LLM interface for multiple providers
- pandas - Data manipulation and CSV export
- recharts - Data visualization charts for frontend

**Infrastructure:**
- express - Web server and routing
- cors - Cross-origin resource sharing
- axios - HTTP client for frontend
- dotenv - Environment variable management

## Configuration

**Environment:**
- `.env` file for API keys (exists but contents not read)
- Environment variables loaded via `dotenv`

**Build:**
- `backend/package.json` - Node.js dependencies
- `frontend/package.json` - React dependencies
- `requirements.txt` - Python dependencies

## Platform Requirements

**Development:**
- Node.js (Express runtime)
- Python 3.x
- npm and pip package managers

**Production:**
- Node.js server for backend
- Static file server for frontend (React build)
- Python runtime for core testing logic

---

*Stack analysis: 2026-05-09*
```