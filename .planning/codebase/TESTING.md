# Testing Patterns

**Analysis Date:** 2026-05-09

## Test Framework

**Runner:**
- Frontend: React Scripts Jest (included with React Scripts)
- Backend: No testing framework detected
- Python: No testing framework detected

**Assertion Library:**
- Frontend: Jest default assertions
- Backend: None detected
- Python: None detected

**Run Commands:**
```bash
# Frontend
npm test                     # Run all tests
npm start                    # Development server
npm run build                # Production build

# Backend
node server.js              # Production
npm run dev                 # Development with nodemon

# Python
python script.py           # No test commands detected
```

## Test File Organization

**Location:**
- No test files detected outside node_modules
- Tests expected to be co-located with source files (not implemented)

**Naming:**
- Pattern: *.test.js or *.spec.js (no files found)

**Structure:**
```
No test structure detected - testing framework not implemented
```

## Test Structure

**Suite Organization:**
No test suites detected

**Patterns:**
No testing patterns detected - framework not implemented

## Mocking

**Framework:** Not implemented

**Patterns:**
No mocking patterns detected

**What to Mock:**
- API calls (would need mocking for testing)
- File system operations (would need mocking for testing)
- LLM service calls (would need mocking for testing)

**What NOT to Mock:**
- Not applicable - no tests implemented

## Fixtures and Factories

**Test Data:**
No test fixtures detected

**Location:**
No dedicated test data directory

## Coverage

**Requirements:** No coverage requirements detected

**View Coverage:**
No coverage command available

## Test Types

**Unit Tests:**
- Not implemented
- Would test individual functions like `readJsonFile`, `parseModelName`, `categorize_question`

**Integration Tests:**
- Not implemented
- Would test API endpoints and data flow between frontend and backend

**E2E Tests:**
- Not implemented
- Would test complete user workflows

## Common Patterns

**Async Testing:**
Not implemented - would need:
```javascript
test('fetches data successfully', async () => {
    // Async test logic
});
```

**Error Testing:**
Not implemented - would need:
```javascript
test('handles API errors gracefully', async () => {
    // Error handling test logic
});
```

## Testing Gap Analysis

**Critical Missing Tests:**
1. **Frontend Component Tests:**
   - App component rendering
   - Data fetching hooks
   - Error state handling
   - User interactions

2. **Backend API Tests:**
   - HTTP endpoint responses
   - Error handling
   - Data validation
   - File system operations

3. **Python Script Tests:**
   - Data loading functions
   - LLM integration
   - Error classification
   - Data processing logic

**Recommendations:**
1. Implement Jest for frontend component testing
2. Add Express test server for backend API testing
3. Add pytest for Python function testing
4. Create test fixtures for sample data
5. Implement integration tests for end-to-end workflows
6. Add coverage reporting

---

*Testing analysis: 2026-05-09*