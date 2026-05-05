# Codebase Concerns

**Analysis Date:** 2026-05-05

## Technical Debt

**Monolithic Script:**
- Issue: Entire application (271 lines) is in a single file (`crossword_tester.py`) with no separation of concerns
- Files: `crossword_tester.py`
- Impact: Difficult to test, maintain, and extend. Adding features requires modifying one large file.
- Fix approach: Split into modules: `models.py` (data structures), `llm_client.py` (API calls), `crossword_solver.py` (core logic), `data_loader.py` (dataset handling), `results_exporter.py` (CSV/JSON output)

**Hard-coded Model List:**
- Issue: Model names are hard-coded in `MODELS_TO_TEST` list at line 16-31
- Files: `crossword_tester.py`
- Impact: Requires code changes to add/remove models, no programmatic model management
- Fix approach: Load models from configuration file or environment variables, create CLI argument for model selection

**No Configuration Management:**
- Issue: Parameters like timeouts, retry counts, temperature are scattered throughout code
- Files: `crossword_tester.py` (lines 54, 70-71)
- Impact: Difficult to adjust behavior without code changes
- Fix approach: Create a `config.py` or use `pydantic-settings` for centralized configuration

## Known Bugs

**Silent Failure on API Errors:**
- Symptoms: API errors are caught but only printed to console, then the test case is skipped
- Files: `crossword_tester.py` (lines 166-172)
- Trigger: Any exception from `call_llm()` (network timeouts, API failures, rate limits)
- Workaround: None - data is lost
- Impact: Incomplete results, no record of which questions failed and why

**Race Condition in Log Files:**
- Symptoms: Log files are written multiple times without proper locking
- Files: `crossword_tester.py` (lines 230-236)
- Trigger: Running multiple instances concurrently
- Impact: Data corruption or loss if multiple processes write to same log file
- Workaround: Run only one instance at a time

**Incomplete Error Recovery:**
- Symptoms: When `call_llm()` fails, the entire question-model combination is skipped permanently
- Files: `crossword_tester.py` (lines 166-172, 209-210)
- Trigger: Any exception during LLM call
- Impact: No retry mechanism for transient failures, data loss
- Workaround: Manually restart script after fixing underlying issue

## Security Considerations

**API Key Exposure Risk:**
- Risk: API keys loaded from `.env` and `.env.local` but no validation they exist
- Files: `crossword_tester.py` (lines 2-3)
- Current mitigation: `.env.local` is in `.gitignore`
- Recommendations:
  - Add validation that required API keys are present before starting
  - Use a secrets manager for production use
  - Document which API keys are required

**No Input Sanitization:**
- Risk: Dataset JSON is loaded without validation
- Files: `crossword_tester.py` (lines 33-36)
- Current mitigation: None
- Recommendations:
  - Validate dataset structure before processing
  - Sanitize question and answer strings to prevent injection attacks
  - Add schema validation using `pydantic` or `jsonschema`

**Unbounded External Data:**
- Risk: LLM responses are processed without size limits
- Files: `crossword_tester.py` (lines 82-83, 90-91)
- Current mitigation: `max_tokens=1024` for OpenRouter models (line 75)
- Recommendations:
  - Add response size validation
  - Truncate excessive responses
  - Log warnings for abnormally long responses

## Performance Bottlenecks

**Synchronous Processing:**
- Problem: All model calls are sequential, no parallel processing
- Files: `crossword_tester.py` (lines 137-231)
- Cause: Nested loops process models and questions one at a time
- Improvement path: Use `asyncio` or `multiprocessing` to process models in parallel

**Excessive JSON Serialization:**
- Problem: Log files are rewritten after every question (lines 230-231) and again at the end (lines 234-236)
- Files: `crossword_tester.py`
- Cause: Append operation writes entire array each time
- Improvement path: Use append-only JSONL format or write only at end of processing

**Large Log Files:**
- Problem: Logs directory is 1.2MB with 15 model logs, each containing full message history
- Files: `logs/` directory
- Cause: Every attempt stores full `messages` array (line 182)
- Improvement path:
  - Make message storage optional via flag
  - Store only metadata for successful attempts
  - Implement log rotation or compression

**No Result Caching:**
- Problem: Dataset.json is reloaded on every run, but no mechanism to skip already-completed tests
- Files: `crossword_tester.py` (lines 142-154)
- Cause: Caching only checks for exact question match, not parameters
- Improvement path: Add hash-based cache key including model name and parameters

## Fragile Areas

**String Matching:**
- Files: `crossword_tester.py` (lines 199, 206)
- Why fragile: Exact string comparison (`model_response == correct_answer`) rejects valid synonyms
- Safe modification: Add fuzzy matching or LLM-based semantic validation
- Test coverage: None - no test files exist in project

**Polish Character Handling:**
- Files: `crossword_tester.py` (line 41)
- Why fragile: `clean_answer()` removes all non-alphanumeric characters, including Polish diacritics (ą, ć, ę, ł, ń, ó, ś, ź, ż)
- Safe modification: Preserve Polish characters in the regex pattern
- Test coverage: None - no validation that Polish characters are handled correctly

**Model-Specific Logic:**
- Files: `crossword_tester.py` (lines 74-76)
- Why fragile: Hard-coded check for "openrouter/" prefix adds parameters only for those models
- Safe modification: Create model configuration registry
- Test coverage: None - no tests for different model providers

**Data Structure Assumptions:**
- Files: `crossword_tester.py` (lines 38-42, 138-140)
- Why fragile: Assumes dataset has "pytanie", "odpowiedz", and "liter" fields
- Safe modification: Add data validation with clear error messages
- Test coverage: None - no schema validation

## Scaling Limits

**Memory Usage:**
- Current capacity: All results stored in memory until end of processing
- Limit: With large datasets and many models, could exceed available RAM
- Scaling path: Stream results to disk incrementally, use generators

**No Rate Limiting:**
- Current capacity: Unlimited API calls, bounded only by retry logic
- Limit: API providers will block excessive requests
- Scaling path: Implement rate limiting with `tenacity` or custom backoff

**Fixed Timeout:**
- Current capacity: 10-second timeout for all models (line 71)
- Limit: Insufficient for reasoning models or slow providers
- Scaling path: Make timeout configurable per model or adaptive based on response size

## Dependencies at Risk

**No Version Pinning:**
- Risk: `requirements.txt` has no version numbers
- Impact: `pip install -r requirements.txt` may install incompatible versions
- Migration plan: Pin exact versions (e.g., `pandas==2.2.0`, `litellm==1.45.0`, `tenacity==8.2.3`)

**Missing Development Dependencies:**
- Risk: No testing framework, linter, or formatter specified
- Impact: Code quality cannot be enforced or tested
- Migration plan: Add `pytest`, `pytest-cov`, `ruff`, `mypy` to requirements

**LiteLLm Dependency:**
- Risk: Heavy dependency for simple LLM calling
- Impact: Large install size, potential API changes
- Migration plan: Consider direct API clients for critical providers (OpenAI, Anthropic)

## Missing Critical Features

**No Test Suite:**
- Problem: Zero test files in project
- Blocks: Confidence in refactoring, regression prevention
- Impact: Bugs may be introduced without detection
- Priority: High

**No CLI Interface:**
- Problem: Script must be modified to change parameters
- Blocks: Non-technical users, automation
- Impact: Poor usability, difficult to integrate into pipelines
- Priority: Medium

**No Progress Reporting:**
- Problem: Only basic console output, no ETA or progress bars
- Blocks: Long-running jobs monitoring
- Impact: Difficult to estimate completion time
- Priority: Low

**No Result Comparison:**
- Problem: No way to compare results between runs
- Blocks: A/B testing, model evaluation over time
- Impact: Hard to measure improvements or regressions
- Priority: Medium

## Test Coverage Gaps

**No Unit Tests:**
- What's not tested: Every function in `crossword_tester.py`
- Files: `crossword_tester.py`
- Risk: Any code change could break functionality
- Priority: High

**No Integration Tests:**
- What's not tested: Full workflow from dataset loading to CSV output
- Files: Entire application
- Risk: End-to-end functionality not validated
- Priority: High

**No Mock Tests:**
- What's not tested: Error handling, API failures, edge cases
- Files: `crossword_tester.py` (lines 166-172)
- Risk: Error paths never exercised
- Priority: Medium

**No Data Validation Tests:**
- What's not tested: Dataset schema, answer cleaning, mask generation
- Files: `crossword_tester.py` (lines 38-42, 105-112)
- Risk: Invalid data causes silent failures
- Priority: Medium

## Maintainability Issues

**No Documentation:**
- Issue: No docstrings, README, or inline comments explaining logic
- Files: `crossword_tester.py`
- Impact: Difficult for others to understand or contribute
- Fix approach: Add docstrings to all functions, create README.md with usage examples

**No Logging Framework:**
- Issue: Uses `print()` statements for all output
- Files: `crossword_tester.py` (lines 145, 146, 156, 194, 202, 205, 237, 249, 256, 268)
- Impact: Cannot control log levels, no structured logging, difficult to debug
- Fix approach: Use `logging` module with different levels (DEBUG, INFO, WARNING, ERROR)

**No Type Hints:**
- Issue: Only basic type hints (`ans: str`) on one function
- Files: `crossword_tester.py` (line 38)
- Impact: No static type checking, IDE autocompletion limited
- Fix approach: Add full type hints using `mypy` validation

**Inconsistent Naming:**
- Issue: Mix of English and Polish in variables and strings
- Files: `crossword_tester.py` (lines 138-139, 170, 268)
- Impact: Confusing for non-Polish speakers, inconsistent codebase
- Fix approach: Standardize on English for code, Polish only for user-facing strings

---

*Concerns audit: 2026-05-05*
