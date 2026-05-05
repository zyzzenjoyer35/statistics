# Codebase Structure

**Analysis Date:** 2026-05-05

## Directory Layout

```
cellerAI/
├── crossword_tester.py    # Main evaluation script
├── dataset.json           # Polish crossword clue test data
├── requirements.txt       # Python dependencies
├── .env                   # API keys and configuration (not committed)
├── .gitignore             # Git ignore rules
├── results.csv            # Aggregated results pivot table
├── results_details.csv    # Detailed per-attempt results
├── results_log.json       # Legacy log format
├── logs/                  # Per-model detailed execution logs
│   ├── anthropic_claude-haiku-4.5.json
│   ├── anthropic_claude-opus-4.7.json
│   ├── anthropic_claude-sonnet-4.6.json
│   ├── google_gemini-3.1-flash-lite-preview.json
│   ├── google_gemma-4-26b-a4b-it.json
│   ├── google_gemma-4-31b-it.json
│   ├── mistralai_ministral-14b-2512.json
│   ├── mistralai_mistral-small-2603.json
│   ├── ollama_SpeakLeash_bielik-11b-v3.0-instruct_Q4_K_M.json
│   ├── openai_gpt-5.4-nano.json
│   ├── openai_gpt-oss-120b.json
│   ├── openai_gpt-oss-20b.json
│   ├── qwen_qwen3.5-flash-02-23.json
│   ├── x-ai_grok-4.1-fast.json
│   └── x-ai_grok-4.20.json
├── docs/                  # Research documentation
│   ├── arxiv.md           # ArXiv paper references
│   └── pomysly-badawcze.md # Research ideas and hypotheses
└── .planning/             # GSD planning artifacts
    └── codebase/          # Codebase analysis documents
```

## Directory Purposes

**Root Directory:**
- Purpose: Contains all project code, configuration, and generated outputs
- Contains: Main script, data files, configuration, output files
- Key files: `crossword_tester.py`, `dataset.json`, `requirements.txt`

**logs/ Directory:**
- Purpose: Stores per-model detailed execution logs for checkpointing and analysis
- Contains: JSON files with complete attempt history for each evaluated model
- Key files: One JSON per model (e.g., `anthropic_claude-sonnet-4.6.json`)
- Generated: Yes (created by `crossword_tester.py`)
- Committed: Yes (logs are preserved for reproducibility)

**docs/ Directory:**
- Purpose: Research documentation and literature review
- Contains: Markdown files with research context and experimental hypotheses
- Key files: `arxiv.md` (paper references), `pomysly-badawcze.md` (research ideas)
- Generated: No (manual documentation)

**.planning/codebase/ Directory:**
- Purpose: GSD system artifacts for codebase analysis
- Contains: Architecture and structure documentation
- Generated: Yes (by GSD codebase mapper)

## Key File Locations

**Entry Points:**
- `crossword_tester.py`: Main script that executes the full evaluation workflow when run directly

**Configuration:**
- `crossword_tester.py` (lines 16-31): Model configuration (`MODELS_TO_TEST` list)
- `crossword_tester.py` (lines 45-52): System prompt template
- `requirements.txt`: Python dependencies (pandas, litellm, tenacity)
- `.env`: API keys for OpenRouter and other services (not in version control)

**Core Logic:**
- `crossword_tester.py` (lines 33-36): Data loading from JSON
- `crossword_tester.py` (lines 38-43): Answer cleaning and normalization
- `crossword_tester.py` (lines 54-103): LLM API interaction with retry logic
- `crossword_tester.py` (lines 105-112): Hint mask generation
- `crossword_tester.py` (lines 125-269): Main evaluation orchestration

**Testing Data:**
- `dataset.json`: Polish crossword clues with expected answers (19 questions)
- `logs/*.json`: Per-model execution logs with full attempt details

**Output Files:**
- `results.csv`: Pivot table showing hints required per model per question
- `results_details.csv`: Row-by-row attempt results
- `results_log.json`: Legacy log format (appears to be subset attempt data)

**Documentation:**
- `docs/arxiv.md`: Curated list of research papers on LLMs and crossword solving
- `docs/pomysly-badawcze.md`: Research hypotheses and experimental ideas in Polish

## Naming Conventions

**Files:**
- Snake case for Python files: `crossword_tester.py`
- Lowercase for configuration: `requirements.txt`, `.env`
- CamelCase for research documentation: `pomysly-badawcze.md`
- Log files: `{provider}_{model-name}.json` with underscores replacing slashes

**Directories:**
- Lowercase: `logs`, `docs`, `.planning`

**Variables and Functions:**
- Snake case: `load_data()`, `clean_answer()`, `process_crosswords()`
- UPPER_CASE for constants: `MODELS_TO_TEST`, `SYSTEM_PROMPT`

**JSON Keys:**
- snake_case: `correct_answer`, `elapsed_ms`, `completion_tokens`
- Polish keys in dataset: `pytanie`, `liter`, `odpowiedz`

## Where to Add New Code

**New Feature:**
- Primary code: Add functions to `crossword_tester.py` before the `if __name__ == "__main__"` block
- Tests: No test framework present; create `test_crossword_tester.py` with pytest if needed

**New Component/Module:**
- Implementation: Create new `.py` files in root directory (e.g., `hint_strategies.py` for alternative mask generation)
- Import: Add to `crossword_tester.py` imports at top of file

**Utilities:**
- Shared helpers: Add to `crossword_tester.py` or create `utils.py` in root directory

**New Models to Test:**
- Add to `MODELS_TO_TEST` list in `crossword_tester.py` (line 16)
- Format: OpenRouter model identifier (e.g., `openrouter/provider/model-name`)

**New Test Data:**
- Add entries to `dataset.json` following existing schema:
  ```json
  {
    "pytanie": "Question text",
    "liter": 5,
    "odpowiedz": "ANSWER"
  }
  ```

**New Output Formats:**
- Add to `process_crosswords()` function after line 248 (before summary section)
- Use pandas DataFrame manipulation for CSV/JSON outputs

## Special Directories

**logs/ Directory:**
- Purpose: Checkpointed execution logs for resumability and detailed analysis
- Generated: Yes (created by `crossword_tester.py` line 128)
- Committed: Yes (preserved in version control)
- Format: One JSON file per model, slugified from model identifier
- Schema: Array of question results, each with `attempts` array containing full LLM call details

**docs/ Directory:**
- Purpose: Research context and experimental planning
- Generated: No (manually maintained)
- Committed: Yes
- Language: Mixed English (arxiv.md) and Polish (pomysly-badawcze.md)
- Content: Literature review, experimental hypotheses, methodology notes

**.planning/ Directory:**
- Purpose: GSD system artifacts for project planning
- Generated: Yes (by GSD commands)
- Committed: Yes
- Structure: `.planning/codebase/` for analysis documents

## File Schemas

**dataset.json Schema:**
```json
[
  {
    "pytanie": "string (Polish question)",
    "liter": "number (answer length)",
    "odpowiedz": "string (uppercase answer)"
  }
]
```

**logs/{model}.json Schema:**
```json
[
  {
    "question": "string (question text)",
    "correct_answer": "string (uppercase answer)",
    "model": "string (model identifier)",
    "guessed": "boolean (success flag)",
    "required_hints": "number or null",
    "attempts": [
      {
        "hints": "number (hints provided)",
        "mask": "string (letter mask)",
        "raw_answer": "string (model output)",
        "cleaned_answer": "string (normalized answer)",
        "correct": "boolean (match flag)",
        "messages": "array (conversation history)",
        "usage": "object (token usage and cost)",
        "elapsed_ms": "number (response time)",
        "response_model": "string (actual model used)",
        "reasoning": "string or null (for reasoning models)",
        "thinking_blocks": "array or null (for thinking models)"
      }
    ]
  }
]
```

**results.csv Schema:**
- Columns: `Answer` (correct answer), then one column per model containing hints required or "FAIL"
- Index: Question text
- Format: Pivot table for quick comparison across models

**results_details.csv Schema:**
- Columns: `question`, `correct_answer`, `model`, `guessed` (boolean), `hints` (number)
- Rows: One per (model, question) pair
- Format: Flat table suitable for filtering and analysis

---

*Structure analysis: 2026-05-05*
