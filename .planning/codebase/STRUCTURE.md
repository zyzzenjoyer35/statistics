# Codebase Structure

**Analysis Date:** 2026-05-09

## Directory Layout

```
cellerAI/
├── backend/                 # Backend API server
│   ├── node_modules/       # Dependencies (ignored in git)
│   ├── package.json        # Backend dependencies
│   └── server.js           # Main backend file
├── frontend/               # React frontend application
│   ├── node_modules/       # Dependencies (ignored in git)
│   ├── public/             # Static assets
│   │   └── index.html      # HTML entry point
│   ├── src/                # Source code
│   │   ├── App.js          # Main application component
│   │   ├── index.js        # React entry point
│   │   └── index.css       # Global styles
│   └── package.json        # Frontend dependencies
├── dataset.json            # Raw dataset questions
├── categorized_dataset.json # Categorized questions
├── classified_errors.json # Error classifications
├── logs/                   # Model performance logs
└── .planning/              # Documentation and planning
    └── codebase/           # Architecture and planning docs
```

## Directory Purposes

**Backend Directory (`backend/`):**
- Purpose: Node.js server and API endpoints
- Contains: Express application, data analysis logic
- Key files: `server.js` (main application), `package.json` (dependencies)

**Frontend Directory (`frontend/`):**
- Purpose: React web application and user interface
- Contains: React components, styles, build configuration
- Key files: `src/App.js` (main component), `src/index.js` (entry point)

**Data Directory (Root):**
- Purpose: Data files for analysis
- Contains: Datasets, categorized data, error classifications
- Key files: `dataset.json`, `categorized_dataset.json`, `classified_errors.json`

**Logs Directory (`logs/`):**
- Purpose: Model performance evaluation logs
- Contains: JSON files for each model's performance data
- Pattern: `{provider}_{model-name}.json`

**Planning Directory (`.planning/codebase/`):**
- Purpose: Architecture and planning documentation
- Contains: Architecture analysis and structure documentation

## Key File Locations

**Entry Points:**
- `backend/server.js`: Backend API server
- `frontend/src/index.js`: Frontend React application
- `frontend/public/index.html`: HTML document entry point

**Configuration:**
- `backend/package.json`: Backend dependencies and scripts
- `frontend/package.json`: Frontend dependencies and scripts

**Core Logic:**
- `backend/server.js`: Data analysis and API endpoints
- `frontend/src/App.js`: Application logic and UI components

**Testing:**
- No test files detected
- Testing not implemented

## Naming Conventions

**Files:**
- JavaScript files: `*.js` (lowercase, no underscores)
- Configuration files: `package.json` (lowercase)
- Data files: `*.json` (lowercase with underscores)

**Functions:**
- Backend: camelCase (`readJsonFile`, `getLogFiles`, `parseModelName`)
- Frontend: camelCase (`fetchAnalysisData`, `renderAccuracyTable`)

**Variables:**
- Backend: camelCase (`app`, `PORT`, `ROOT_DIR`)
- Frontend: camelCase (`activeTab`, `analysisData`, `loading`)

## Where to Add New Code

**New Analysis Endpoints:**
- Implementation: `backend/server.js` (add new GET route)
- Tests: Not applicable (no testing framework)

**New Visualization Components:**
- Implementation: `frontend/src/App.js` (add new render function)
- Styles: `frontend/src/App.css` (add new CSS classes)

**New Data Files:**
- Location: Root directory (same as existing data files)
- Format: JSON with consistent structure

**New Dependencies:**
- Backend: Update `backend/package.json`
- Frontend: Update `frontend/package.json`

## Special Directories

**Node Modules Directories:**
- Purpose: Package management and dependency storage
- Generated: Yes (via npm install)
- Committed: No (excluded in .gitignore)

**Public Directory:**
- Purpose: Static web assets
- Generated: No (committed to git)
- Committed: Yes

**Logs Directory:**
- Purpose: Runtime data storage
- Generated: Yes (during analysis)
- Committed: No (excluded in gitignore)

---

*Structure analysis: 2026-05-09*