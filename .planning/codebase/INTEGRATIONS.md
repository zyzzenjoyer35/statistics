# External Integrations

**Analysis Date:** 2026-05-09

## APIs & External Services

**LLM Providers (via litellm):**
- OpenRouter - Primary LLM provider
  - Models: GPT-5.4-nano, GPT-OSS-20b, GPT-OSS-120b, Grok-4.1-fast, Gemma-4-31b-it, Gemini-3.1-flash-lite-preview, Qwen3.5-flash-02-23, Ministral-14b-2512, Mistral-small-2603, Claude-sonnet-4.6, Claude-opus-4.7
  - SDK: litellm
  - Auth: OPENROUTER_API_KEY (environment variable)

## Data Storage

**Databases:**
- File-based storage only
  - JSON files for logs and datasets
  - CSV files for results export
- No persistent database detected

**File Storage:**
- Local filesystem for logs and datasets
  - `logs/` directory for individual model JSON logs
  - `dataset.json` for crossword questions
  - `categorized_dataset.json` for semantic analysis

**Caching:**
- No dedicated caching service
- File-based caching via JSON logs

## Authentication & Identity

**Auth Provider:**
- Custom environment-based API key authentication
- No user authentication system detected

## Monitoring & Observability

**Error Tracking:**
- Console logging (built-in)
- No external error tracking service detected

**Logs:**
- File-based logging (`logs/` directory)
- Console output for debugging

## CI/CD & Deployment

**Hosting:**
- No production deployment detected
- Local development server setup

**CI Pipeline:**
- No CI/CD configuration detected

## Environment Configuration

**Required env vars:**
- `OPENROUTER_API_KEY` - Authentication for OpenRouter API

**Secrets location:**
- `.env` file (contents not read for security)

## Webhooks & Callbacks

**Incoming:**
- No webhook endpoints detected

**Outgoing:**
- No outgoing webhook functionality detected

---

*Integration audit: 2026-05-09*
```