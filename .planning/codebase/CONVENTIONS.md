# Coding Conventions

**Analysis Date:** 2026-05-05

## Naming Patterns

**Files:**
- Snake case for Python files: `crossword_tester.py`
- Snake case for data files: `dataset.json`, `requirements.txt`
- Snake case for log files: `{model_slug}.json`
- Snake case for output files: `results.csv`, `results_details.csv`, `results_log.json`

**Functions:**
- Snake case with descriptive names: `load_data()`, `clean_answer()`, `call_llm()`, `process_crosswords()`, `model_log_path()`, `load_existing_log()`, `generate_mask()`
- Function names use verbs: `load`, `clean`, `call`, `process`, `generate`

**Variables:**
- Snake case throughout: `correct_answer`, `required_hints`, `failed_attempts`, `model_response`, `question_text`
- Short names in tight loops: `df`, `f`, `e`, `m` (contextually clear)
- Hungarian-style prefixes for clarity: `t0`, `elapsed_ms`

**Constants:**
- UPPER_SNAKE_CASE for global constants: `MODELS_TO_TEST`, `SYSTEM_PROMPT`
- Constants defined at module level after imports

**Types:**
- Type hints used sparingly, primarily for function parameters: `ans: str`, `model: str`, `question: str`, `mask: str`, `expected_length: int`, `previous_fails: list`, `filepath='dataset.json'`

## Code Style

**Formatting:**
- No explicit formatting config detected (no `.prettierrc`, `black`, `autopep8`, `yapf`)
- 4-space indentation (standard Python)
- Lines generally kept under 100-120 characters
- Empty lines between logical sections (functions, imports, constants)

**Linting:**
- No explicit linting config detected (no `.flake8`, `.pylintrc`, `ruff.toml`)
- No `.gitignore` patterns suggest manual code review

**String Formatting:**
- f-strings preferred for variable interpolation: `f"Definicja: {question}\nLiczba liter: {expected_length}"`
- String concatenation for static strings: `"Jesteś precyzyjnym systemem rozwiązującym polskie krzyżówki. "`

## Import Organization

**Order:**
1. Environment configuration (`dotenv`)
2. Standard library imports (alphabetical: `json`, `os`, `re`, `time`)
3. Third-party imports (alphabetical: `litellm`, `pandas`)
4. Specific imports from packages (`from litellm import completion`, `from tenacity import retry, stop_after_attempt, wait_exponential`)

**Grouping:**
- Blank line between standard library and third-party imports
- No path aliases used

**Imports in functions:**
- All imports at module level (none inside functions)

## Error Handling

**Patterns:**
- Try-except blocks around external API calls (`call_llm()` function)
- Specific exception handling with type checking: `except Exception as e`
- Error logging with type name and message: `print(f"  [ERROR] {type(e).__name__}: {e}")`
- Graceful degradation: skip failed questions and continue processing
- Set `skipped` flag to avoid processing failed attempts

**Retry Logic:**
- Uses `tenacity` library with exponential backoff
- Decorator pattern: `@retry(stop=stop_after_attempt(3), wait=wait_exponential(multiplier=1, min=1, max=5))`
- Applied to `call_llm()` function (line 54)

**Null/Empty Handling:**
- Type checking in `clean_answer()`: `if not isinstance(ans, str): return ""`
- Safe access with `.get()` for dictionary lookups: `row.get("pytanie", "")`
- Safe dictionary usage: `response.usage.to_dict() if response.usage else {}`
- Safe attribute access: `getattr(msg, 'reasoning_content', None)`

## Logging

**Framework:** `print()` statements (no logging library)

**Patterns:**
- Progress tracking with counters: `f"[{count}/{len(data)}] Model: {model} | ..."`
- Status indicators in brackets: `[OK]`, `[MISS]`, `[ERROR]`, `[SKIP]`, `[CACHED]`
- Detailed information on success/failure with context
- Summary statistics at end of execution
- Log files written to `logs/` directory per model in JSON format

**Log Levels (implied):**
- `[OK]` - Successful guess
- `[MISS]` - Incorrect guess
- `[ERROR]` - Exception occurred
- `[SKIP]` - Question skipped due to error
- `[CACHED]` - Result loaded from cache

## Comments

**When to Comment:**
- Minimal inline comments (code is self-documenting)
- No docstrings for functions
- No module-level documentation
- No inline explanations of complex logic

**JSDoc/TSDoc:**
- Not applicable (Python project)
- No type documentation beyond simple type hints

**Code Comments:**
- None found in codebase
- Line 21-24: Commented-out model entries for testing
- Line 30: Commented-out model entry
- Function purpose inferred from names and context

## Function Design

**Size:** Functions range from 4-150 lines, with most under 30 lines

**Parameters:**
- Positional parameters with defaults for file paths: `filepath='dataset.json'`
- Required parameters for core logic: `model`, `question`, `mask`, `expected_length`, `previous_fails`
- List parameters for collections: `models`, `previous_fails`, `failed_attempts`

**Return Values:**
- Functions return specific types: `dict`, `str`, `list`, `None` (implicit)
- Dictionary returns for structured data: `call_llm()` returns dict with answer, usage, timing
- List returns for collections: `load_existing_log()` returns list of log entries
- String returns for processed data: `clean_answer()` returns string

**Side Effects:**
- File I/O in `load_data()` and log writing functions
- Directory creation: `os.makedirs("logs", exist_ok=True)`
- CSV export: `df.to_csv()`
- JSON export: `json.dump()` with `ensure_ascii=False, indent=2`

## Module Design

**Exports:**
- No explicit `__all__` exports
- Functions intended for external use: `process_crosswords()` (called from `__main__`)
- Helper functions: `load_data()`, `clean_answer()`, `call_llm()`, `generate_mask()`, `model_log_path()`, `load_existing_log()`

**Barrel Files:** Not used (single-module project)

**Module Structure:**
1. Imports and configuration (lines 1-14)
2. Global constants (lines 16-52)
3. Helper functions (lines 33-123)
4. Main processing function (lines 125-269)
5. Entry point guard (lines 270-271)

**Configuration:**
- Environment variables loaded via `dotenv` at module level
- Model list in global constant `MODELS_TO_TEST`
- System prompt in global constant `SYSTEM_PROMPT`

---

*Convention analysis: 2026-05-05*
