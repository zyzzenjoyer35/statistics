# Architecture

**Analysis Date:** 2026-05-05

## Pattern Overview

**Overall:** Batch Processing Evaluator with Progressive Hinting Strategy

**Key Characteristics:**
- Sequential evaluation of multiple LLM models against a fixed test dataset
- Progressive hinting mechanism: models receive increasingly revealed letters as prompts
- Resumable execution with per-model checkpointing and caching
- Multi-format output generation (CSV, JSON) for analysis
- Retry mechanism with exponential backoff for API reliability

## Layers

**Configuration Layer:**
- Purpose: Define models, prompts, and test parameters
- Location: `crossword_tester.py` (lines 16-52)
- Contains: Model list, system prompt, retry decorators
- Depends on: Environment variables (`.env`)
- Used by: Main processing loop

**Data Access Layer:**
- Purpose: Load test data and manage cached results
- Location: `crossword_tester.py` (lines 33-36, 118-123)
- Contains: `load_data()`, `load_existing_log()`, `model_log_path()`
- Depends on: Filesystem (JSON files)
- Used by: Main processing loop

**LLM Interaction Layer:**
- Purpose: Execute API calls to language models
- Location: `crossword_tester.py` (lines 54-103)
- Contains: `call_llm()` with retry logic, prompt construction
- Depends on: `litellm` library, external LLM APIs
- Used by: Main processing loop

**Hint Generation Layer:**
- Purpose: Create progressively revealed letter masks
- Location: `crossword_tester.py` (lines 105-112)
- Contains: `generate_mask()` function
- Depends on: Correct answer string
- Used by: Main processing loop

**Answer Validation Layer:**
- Purpose: Clean and compare model responses against expected answers
- Location: `crossword_tester.py` (lines 38-43)
- Contains: `clean_answer()` function
- Depends on: Regular expressions
- Used by: Main processing loop

**Execution Orchestration Layer:**
- Purpose: Coordinate the entire evaluation workflow
- Location: `crossword_tester.py` (lines 125-269)
- Contains: `process_crosswords()` main function
- Depends on: All other layers
- Used by: CLI entry point (`__main__`)

**Output Generation Layer:**
- Purpose: Produce analysis results in multiple formats
- Location: `crossword_tester.py` (lines 239-268)
- Contains: CSV generation, pivot tables, summary statistics
- Depends on: `pandas` library
- Used by: Execution orchestration layer

## Data Flow

**Main Evaluation Flow:**

1. **Initialization**: Load dataset from `dataset.json`, create `logs/` directory, load cached results for each model
2. **Question Loop**: Iterate through each question in the dataset
3. **Model Loop**: For each question, evaluate all configured models
4. **Cache Check**: Skip already-evaluated (model, question) pairs, use cached results
5. **Hint Loop**: For new evaluations, attempt with 0, 1, 2... N hints where N = answer length
6. **LLM Call**: Construct prompt with current mask, call LLM API
7. **Answer Validation**: Clean response, check against correct answer
8. **Failure Tracking**: Record incorrect answers to include in subsequent prompts as "wrong answers"
9. **Success/Bail**: Stop hint loop on correct answer or after exhausting all hints
10. **Log Persistence**: Immediately write results to per-model JSON log file
11. **Aggregation**: After all evaluations, compile results into CSV format
12. **Summary**: Calculate and display accuracy, cost, and token usage statistics

**State Management:**
- Resumable: Per-model JSON logs allow interrupted runs to continue from last checkpoint
- Cached results: Avoid re-evaluating (model, question) pairs already completed
- Immediate persistence: Each model-question result is written to disk before proceeding
- No in-memory state beyond current question/model being processed

## Key Abstractions

**Question-Answer Pair:**
- Purpose: Represents a single crossword clue
- Examples: `dataset.json` entries with `pytanie`, `liter`, `odpowiedz` fields
- Pattern: JSON array of objects with Polish language content

**Model Configuration:**
- Purpose: Defines which LLMs to evaluate
- Examples: `MODELS_TO_TEST` list in `crossword_tester.py` (line 16)
- Pattern: List of OpenRouter model identifiers (e.g., `openrouter/anthropic/claude-sonnet-4.6`)

**Hint Strategy:**
- Purpose: Progressive letter revelation to guide model toward correct answer
- Examples: Mask generation in `generate_mask()` function
- Pattern: Left-to-right prefix revelation (first N letters shown, rest as underscores)

**Attempt Record:**
- Purpose: Captures single LLM call with full context
- Examples: Entries in `logs/{model}.json` files with `attempts` arrays
- Pattern: Structured record including prompt, response, usage metrics, timing, and reasoning content

**Evaluation Result:**
- Purpose: Summarizes model performance on a single question
- Examples: Rows in `results.csv` and `results_details.csv`
- Pattern: Boolean success flag, required hints count, model ID, question text

## Entry Points

**Main Script Execution:**
- Location: `crossword_tester.py` (line 270-271)
- Triggers: Running `python crossword_tester.py` from command line
- Responsibilities: Invokes `process_crosswords()` with default dataset, model list, and output paths

**Imported Function Calls:**
- Location: `crossword_tester.py` (line 125, `process_crosswords()` function)
- Triggers: Programmatic use from other Python modules
- Responsibilities: Executes full evaluation workflow with customizable parameters

## Error Handling

**Strategy:** Retry with exponential backoff for transient failures, graceful degradation for permanent failures

**Patterns:**
- **API Retries**: `@retry` decorator (line 54) with exponential backoff (1-5 seconds) and 3 max attempts for LLM calls
- **Question Skipping**: On exception during LLM call, log error, mark question as skipped for that model, continue with next model
- **Cache Loading**: If log file doesn't exist, return empty list rather than failing
- **Directory Creation**: Use `os.makedirs(..., exist_ok=True)` to avoid race conditions

## Cross-Cutting Concerns

**Logging:** Console output with bracketed prefixes (`[OK]`, `[MISS]`, `[ERROR]`, `[SKIP]`) for status tracking

**Validation:** String normalization via `clean_answer()` removes punctuation, whitespace, and converts to uppercase for consistent comparison

**Authentication:** Environment-based API key loading via `dotenv` from `.env` and `.env.local` files

**Cost Tracking:** Per-request cost aggregation from LiteLLM usage metadata, displayed in summary

**Progress Indication:** Nested counters showing question number (X/Y) and model name for long-running evaluations

---

*Architecture analysis: 2026-05-05*
