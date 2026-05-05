# External Integrations

**Analysis Date:** 2026-05-05

## APIs & External Services

**LLM Provider (Primary):**
- OpenRouter - Multi-model LLM API gateway
  - SDK/Client: `litellm` (unified Python library)
  - Auth: `OPENROUTER_API_KEY` environment variable
  - Endpoint: `litellm.completion()` function with model prefix `openrouter/`

**Models Integrated (via OpenRouter):**
- OpenAI: gpt-5.4-nano, gpt-oss-20b, gpt-oss-120b
- Google: gemma-4-31b-it, gemini-4-26b-a4b-it, gemini-3.1-flash-lite-preview
- Anthropic: claude-sonnet-4.6, claude-opus-4.7, claude-haiku-4.5
- xAI: grok-4.1-fast, grok-4.20
- Qwen: qwen3.5-flash-02-23
- Mistral: ministral-14b-2512, mistral-small-2603

**API Call Details:**
- Method: `litellm.completion()`
- Parameters: model, messages, temperature=0.0, timeout=10s, max_tokens=1024 (OpenRouter only)
- Special handling: `extra_body={"reasoning": {"max_tokens": 1000}}` for OpenRouter reasoning models
- Retry logic: 3 attempts with exponential backoff (1-5s) via `tenacity`

## Data Storage

**Databases:**
- None (file-based only)

**Local Storage:**
- JSON format: `dataset.json` (input), `logs/*.json` (per-model request logs)
- CSV format: `results.csv` (summary matrix), `results_details.csv` (full attempt history)
- Location: Project root directory

**File Storage:**
- Local filesystem only
- No cloud storage integration
- Logs directory auto-created if missing: `os.makedirs("logs", exist_ok=True)`

## Caching

**Request Caching:**
- File-based per-model caching in `logs/{model_slug}.json`
- Cache key: Question text
- Cache invalidation: Manual (delete log files to rerun)
- Implements resume functionality: Skips already-processed questions

## Authentication & Identity

**API Authentication:**
- Single API key: `OPENROUTER_API_KEY`
- Storage: `.env.local` (not committed to git)
- Loading: `python-dotenv` library with override pattern
- No user authentication (single-user script)

## Monitoring & Observability

**Error Tracking:**
- None (print-based error handling only)
- Errors logged to console, not external service

**Metrics Collection:**
- Built-in metrics in `crossword_tester.py`:
  - Request count per model
  - Total tokens used
  - Total cost (USD) from API response
  - Accuracy percentage per model
  - Average hints required per model
- Output: Console print statement summary

**Logging:**
- Detailed JSON logs per model: `logs/{model_slug}.json`
- Log contents:
  - Question and correct answer
  - All attempts (mask, raw response, cleaned response, correctness)
  - API usage data (tokens, cost)
  - Timing data (elapsed_ms)
  - Response model
  - Reasoning content (if available)
  - Thinking blocks (if available)
- Encoding: UTF-8 (Polish character support)

## CI/CD & Deployment

**Hosting:**
- None (local execution only)

**CI Pipeline:**
- None (manual script execution)

**Version Control:**
- Git (repo detected but not currently initialized in working directory)
- Ignored files: `__pycache__/`, `*.py[cod]`, `*.env.local`, `venv/`, `.idea/`, data/results files

## Environment Configuration

**Required env vars:**
- `OPENROUTER_API_KEY` - OpenRouter API authentication key (critical)

**Optional env vars:**
- None

**Secrets location:**
- `.env.local` (gitignored, local only)
- `.env` (committed template with placeholder values)

## Webhooks & Callbacks

**Incoming:**
- None (no server component)

**Outgoing:**
- None (polling-based API calls, no webhooks)

## Data Sources

**Input Data:**
- `dataset.json` - Polish crossword definitions
- Structure: Array of objects with `pytanie` (question), `liter` (letter count), `odpowiedz` (answer)
- Encoding: UTF-8
- Size: 19 entries in current dataset

**Output Data:**
- `results.csv` - Pivot table: questions × models, values = hints required
- `results_details.csv` - Full attempt history (one row per attempt)
- `results_log.json` - Additional JSON format output
- `logs/{model}.json` - Per-model detailed logs with API responses

---

*Integration audit: 2026-05-05*
