# Technology Stack

**Analysis Date:** 2026-05-05

## Languages

**Primary:**
- Python 3.x - Core language for the entire application (`crossword_tester.py`)

**Secondary:**
- None detected

## Runtime

**Environment:**
- Python 3.x (specific version not locked)

**Package Manager:**
- pip
- Lockfile: Not present (only `requirements.txt` without pinned versions)

## Frameworks

**Core:**
- None (standalone Python script)

**Testing:**
- None (manual testing only)

**Build/Dev:**
- None (no build system or bundling)

## Key Dependencies

**Critical:**
- litellm - Unified API for multiple LLM providers (OpenRouter, Anthropic, Google, etc.)
- pandas - Data manipulation and CSV export for benchmark results
- tenacity - Retry logic with exponential backoff for API calls

**Utilities:**
- python-dotenv - Environment variable loading from `.env` and `.env.local` files

## Configuration

**Environment:**
- Loaded from `.env.local` (override) then `.env` (fallback)
- Key config: `OPENROUTER_API_KEY` (stored in `.env.local`, not committed)
- Model list: Hardcoded in `crossword_tester.py` (lines 16-31)

**Build:**
- No build configuration files
- Direct script execution: `python crossword_tester.py`

## Platform Requirements

**Development:**
- Python 3.x with pip
- Internet connection for OpenRouter API calls
- 10-second timeout per API call (hardcoded)
- File system write permissions for `logs/` directory and output CSVs

**Production:**
- Same as development (script runs locally, no deployment target)
- No server infrastructure required
- Persistent storage for log files and results

---

*Stack analysis: 2026-05-05*
