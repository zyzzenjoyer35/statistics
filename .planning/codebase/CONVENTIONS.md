# Coding Conventions

**Analysis Date:** 2026-05-09

## Naming Patterns

**Files:**
- Python: lowercase with underscores (e.g., `categorize_questions.py`)
- JavaScript: lowercase with dashes or camelCase (e.g., `App.js`, `server.js`)
- JSON: lowercase with underscores (e.g., `dataset.json`, `categorized_dataset.json`)

**Functions:**
- Python: lowercase_with_underscores (e.g., `categorize_question`, `classify_error`, `load_data`)
- JavaScript: camelCase (e.g., `fetchAnalysisData`, `fetchWordLengthData`, `readJsonFile`)

**Variables:**
- Python: lowercase_with_underscores (e.g., `system_prompt`, `user_prompt`, `model_answer`)
- JavaScript: camelCase (e.g., `activeTab`, `analysisData`, `error`)

**Constants:**
- Python: UPPERCASE_WITH_UNDERSCORES (e.g., `CATEGORIES`, `ERROR_CATEGORIES`)
- JavaScript: UPPERCASE_WITH_UNDERSCORES (e.g., `API_BASE`, `PORT`)

**Types:**
- TypeScript interfaces: PascalCase (not detected - not using TypeScript)
- React components: PascalCase (e.g., `App`)

## Code Style

**Formatting:**
- Python: Standard PEP 8 (4-space indentation, 79-char line limit)
- JavaScript: React default formatting (semi-colons, 2-space indentation)

**Linting:**
- Frontend: React Scripts ESLint (extends "react-app")
- Backend: No linting configuration detected
- Python: No linting configuration detected

## Import Organization

**JavaScript:**
```javascript
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { BarChart, Bar, LineChart, Line, ScatterChart, Scatter } from 'recharts';

// Local imports
import App from './App';
import './App.css';
```

**Python:**
```python
import json
import os
from pathlib import Path
from collections import defaultdict
from litellm import completion
```

**Node.js:**
```javascript
const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
```

## Error Handling

**JavaScript (Frontend):**
```javascript
try {
    setLoading(true);
    const response = await axios.get(`${API_BASE}/analysis/semantic-taxonomy`);
    setAnalysisData(response.data);
    setError(null);
} catch (err) {
    setError(err.response?.data?.error || 'Failed to fetch analysis data');
    console.error('Error fetching analysis:', err);
} finally {
    setLoading(false);
}
```

**JavaScript (Backend):**
```javascript
function readJsonFile(filePath) {
    try {
        if (!fs.existsSync(filePath)) {
            return null;
        }
        const data = fs.readFileSync(filePath, 'utf-8');
        return JSON.parse(data);
    } catch (error) {
        console.error(`Error reading ${filePath}:`, error.message);
        return null;
    }
}
```

**Python:**
```python
try:
    response = completion(
        model=model,
        messages=[
            {"role": "system", "content": SYSTEM_PROMPT},
            {"role": "user", "content": user_prompt}
        ],
        temperature=0.0,
        max_tokens=10,
        timeout=10
    )
except Exception as e:
    print(f"Error in LLM call: {e}")
    return None
```

## Logging

**JavaScript (Backend):**
```javascript
console.error(`Error reading ${filePath}:`, error.message);
console.error('Error reading logs directory:', error.message);
console.error('Error fetching analysis:', err);
```

**Python:**
```python
print(f"Error in LLM call: {e}")
```

## Comments

**When to Comment:**
- Function purpose and parameters
- Complex business logic
- API endpoints and their purposes
- Data transformations

**JSDoc/TSDoc:**
```javascript
/**
 * Categorize a single question using LLM
 * @param {string} question - The question text
 * @param {string} answer - The correct answer
 * @param {string} model - The model to use for classification
 * @returns {dict} Categorization result
 */
def categorize_question(question: str, answer: str, model: str = "openrouter/anthropic/claude-sonnet-4.6") -> dict:
```

## Function Design

**Size:** 
- Small, focused functions
- Single responsibility principle
- Generally under 50 lines

**Parameters:** 
- Reasonable number (3-5 max typical)
- Clear parameter names
- Optional parameters with defaults

**Return Values:** 
- Consistent return types
- Error handling with null/None returns
- Data structures consistent across functions

## Module Design

**Exports:**
- Node.js: Export specific functions (not detected yet)
- Python: Implicit return values

**Barrel Files:** 
- Not used in this codebase

---

*Convention analysis: 2026-05-09*