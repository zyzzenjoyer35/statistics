# Architecture

**Analysis Date:** 2026-05-09

## Pattern Overview

**Overall:** Client-server architecture with data-driven analysis

**Key Characteristics:**
- Separated frontend and backend components
- RESTful API for data communication
- File-based data storage (JSON)
- Component-based React frontend
- Data analysis and aggregation patterns

## Layers

**Backend Layer:**
- Purpose: API server and data processing
- Location: `backend/server.js`
- Contains: Express.js application, API endpoints, data analysis logic
- Depends on: Node.js runtime, Express, CORS
- Used by: Frontend client applications

**Frontend Layer:**
- Purpose: User interface and data visualization
- Location: `frontend/src/`
- Contains: React components, charts, user interactions
- Depends on: React, Recharts, Axios
- Used by: Web browsers

**Data Layer:**
- Purpose: Data storage and persistence
- Location: Root directory (`dataset.json`, `categorized_dataset.json`, `classified_errors.json`)
- Contains: Raw datasets, categorized data, error classifications
- Depends on: File system, JSON format
- Used by: Backend analysis functions

**Analysis Layer:**
- Purpose: Multi-dimensional analysis of model performance
- Location: `backend/server.js` analysis endpoints
- Contains: Semantic taxonomy, word length, reasoning cost, Pareto frontier, error mode analyses
- Depends on: Backend data layer, statistical calculations
- Used by: Frontend visualization components

## Data Flow

**API Request Flow:**

1. User requests analysis via frontend
2. Frontend makes HTTP request to backend API
3. Backend reads relevant data files
4. Backend performs analysis calculations
5. Backend returns structured JSON response
6. Frontend processes and visualizes data

**Data Processing Flow:**

1. **Data Loading:** `readJsonFile()` helper loads JSON data
2. **Analysis Processing:** Multiple analysis functions transform raw data
3. **Aggregation:** Results are aggregated by model and categories
4. **Response Structuring:** Analysis results formatted for frontend consumption

**State Management:**
- Frontend uses React local state for active tab and data caching
- Backend is stateless, processes data on each request

## Key Abstractions

**API Endpoint Abstractions:**
- Purpose: Define analysis operations
- Examples: `/api/analysis/semantic-taxonomy`, `/api/analysis/word-length`
- Pattern: RESTful GET endpoints with query parameters

**Data Model Abstractions:**
- Purpose: Represent question and model data structures
- Examples: Question objects with `pytanie`, `odpowiedz`, `liter`, `category`
- Pattern: Consistent JSON structure across all data files

**Analysis Result Abstraction:**
- Purpose: Standardize analysis output format
- Examples: Accuracy percentages, cost metrics, correlation coefficients
- Pattern: Structured objects with model arrays and summary statistics

## Entry Points

**Backend Entry Point:**
- Location: `backend/server.js`
- Triggers: HTTP requests on port 5000
- Responsibilities: API routing, data analysis, error handling
- Functions: Express app initialization, middleware setup, route definitions

**Frontend Entry Point:**
- Location: `frontend/src/index.js`
- Triggers: React DOM rendering
- Responsibilities: App initialization, root component mounting
- Functions: React StrictMode wrapping, root DOM element targeting

**Frontend Main Component:**
- Location: `frontend/src/App.js`
- Triggers: User navigation and data fetching
- Responsibilities: Tab management, API calls, component rendering
- Functions: Data fetching hooks, chart rendering, state management

## Error Handling

**Strategy:** Comprehensive error handling with user-friendly messages

**Patterns:**
- Try-catch blocks for file operations
- HTTP status codes for API responses
- Graceful degradation when data is missing
- Retry functionality for failed API calls

## Cross-Cutting Concerns

**Logging:** Console logging for debugging and monitoring
**Validation:** Input validation and file existence checks
**Authentication:** None - open API access
**Caching:** No persistent caching, data reprocessed on each request

---

*Architecture analysis: 2026-05-09*