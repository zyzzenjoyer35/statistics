const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Paths
const ROOT_DIR = path.resolve(__dirname, '..');
const LOGS_DIR = path.join(ROOT_DIR, 'logs');
const DATASET_PATH = path.join(ROOT_DIR, 'dataset.json');
const CATEGORIZED_DATASET_PATH = path.join(ROOT_DIR, 'categorized_dataset.json');

// Helper function to read JSON file
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

// Helper function to get all log files
function getLogFiles() {
    try {
        if (!fs.existsSync(LOGS_DIR)) {
            return [];
        }
        return fs.readdirSync(LOGS_DIR)
            .filter(file => file.endsWith('.json'))
            .map(file => path.join(LOGS_DIR, file));
    } catch (error) {
        console.error('Error reading logs directory:', error.message);
        return [];
    }
}

// Helper function to parse model name from filename
function parseModelName(filename) {
    // Remove .json extension
    return filename.replace('.json', '').replace('_', '/');
}

// API: Get all questions (categorized or uncategorized)
app.get('/api/questions', (req, res) => {
    const categorized = readJsonFile(CATEGORIZED_DATASET_PATH);
    const uncategorized = readJsonFile(DATASET_PATH);

    if (categorized) {
        res.json({ questions: categorized, source: 'categorized' });
    } else if (uncategorized) {
        res.json({ questions: uncategorized, source: 'uncategorized' });
    } else {
        res.status(404).json({ error: 'No dataset found' });
    }
});

// API: Get semantic taxonomy analysis
app.get('/api/analysis/semantic-taxonomy', (req, res) => {
    try {
        // Load categorized dataset
        const categorizedData = readJsonFile(CATEGORIZED_DATASET_PATH);
        if (!categorizedData) {
            return res.status(404).json({ error: 'Categorized dataset not found. Please run categorization first.' });
        }

        // Load all log files
        const logFiles = getLogFiles();
        if (logFiles.length === 0) {
            return res.status(404).json({ error: 'No log files found in logs/ directory' });
        }

        // Define model groups
        const polishModels = ['google/gemma', 'qwen/qwen', 'mistralai/mistral', 'mistralai/ministral'];
        const englishModels = ['openai/gpt', 'anthropic/claude', 'x-ai/grok'];

        // Category names
        const categoryNames = {
            1: 'Wiedza ogólna / encyklopedyczna',
            2: 'Definicje słownikowe',
            3: 'Metafora i gra słowna',
            4: 'Nazwy własne i popkultura',
            5: 'Polskie realia kulturowe'
        };

        // Initialize results structure
        const results = {
            models: [],
            categories: categoryNames,
            accuracyByCategory: {},
            categoryCounts: {},
            polishVsEnglishCategory5: {
                polishAccuracy: null,
                englishAccuracy: null,
                difference: null,
                polishModels: [],
                englishModels: []
            }
        };

        // Count questions per category
        categorizedData.forEach(item => {
            const cat = item.category || 0;
            results.categoryCounts[cat] = (results.categoryCounts[cat] || 0) + 1;
        });

        // Process each model's log
        const modelData = [];

        logFiles.forEach(logFile => {
            const logData = readJsonFile(logFile);
            if (!logData || logData.length === 0) return;

            const filename = path.basename(logFile);
            const modelName = parseModelName(filename);
            const fullModelName = `openrouter/${modelName}`;

            // Determine if model is Polish or English-focused
            const isPolish = polishModels.some(pm => modelName.includes(pm.replace('/', '_')));
            const isEnglish = englishModels.some(em => modelName.includes(em.replace('/', '_')));

            // Initialize category performance for this model
            const categoryPerformance = {};
            for (let cat = 1; cat <= 5; cat++) {
                categoryPerformance[cat] = { correct: 0, total: 0 };
            }

            // Analyze each question in the log
            logData.forEach(logEntry => {
                const question = logEntry.question;

                // Find the category for this question
                const categorizedItem = categorizedData.find(item => item.pytanie === question);
                if (!categorizedItem) return;

                const category = categorizedItem.category || 0;
                if (category < 1 || category > 5) return;

                categoryPerformance[category].total++;
                if (logEntry.guessed) {
                    categoryPerformance[category].correct++;
                }
            });

            // Calculate accuracy per category
            const accuracies = {};
            for (let cat = 1; cat <= 5; cat++) {
                const perf = categoryPerformance[cat];
                accuracies[cat] = perf.total > 0 ? (perf.correct / perf.total) * 100 : 0;
            }

            modelData.push({
                modelName,
                fullName: fullModelName,
                isPolish,
                isEnglish,
                accuracies,
                categoryPerformance
            });
        });

        // Organize results for frontend
        results.models = modelData.map(m => ({
            name: m.modelName,
            fullName: m.fullName,
            isPolish: m.isPolish,
            isEnglish: m.isEnglish,
            accuracies: m.accuracies
        }));

        // Build accuracy by category matrix
        for (let cat = 1; cat <= 5; cat++) {
            results.accuracyByCategory[cat] = modelData.map(m => ({
                model: m.modelName,
                accuracy: m.accuracies[cat],
                isPolish: m.isPolish,
                isEnglish: m.isEnglish
            }));
        }

        // Calculate Polish vs English for category 5
        const polishCat5Data = modelData.filter(m => m.isPolish && m.categoryPerformance[5].total > 0);
        const englishCat5Data = modelData.filter(m => m.isEnglish && m.categoryPerformance[5].total > 0);

        if (polishCat5Data.length > 0) {
            const polishTotal = polishCat5Data.reduce((sum, m) => sum + m.categoryPerformance[5].correct, 0);
            const polishDenom = polishCat5Data.reduce((sum, m) => sum + m.categoryPerformance[5].total, 0);
            results.polishVsEnglishCategory5.polishAccuracy = (polishTotal / polishDenom) * 100;
            results.polishVsEnglishCategory5.polishModels = polishCat5Data.map(m => m.modelName);
        }

        if (englishCat5Data.length > 0) {
            const englishTotal = englishCat5Data.reduce((sum, m) => sum + m.categoryPerformance[5].correct, 0);
            const englishDenom = englishCat5Data.reduce((sum, m) => sum + m.categoryPerformance[5].total, 0);
            results.polishVsEnglishCategory5.englishAccuracy = (englishTotal / englishDenom) * 100;
            results.polishVsEnglishCategory5.englishModels = englishCat5Data.map(m => m.modelName);
        }

        if (results.polishVsEnglishCategory5.polishAccuracy !== null &&
            results.polishVsEnglishCategory5.englishAccuracy !== null) {
            results.polishVsEnglishCategory5.difference =
                results.polishVsEnglishCategory5.polishAccuracy -
                results.polishVsEnglishCategory5.englishAccuracy;
        }

        res.json(results);

    } catch (error) {
        console.error('Error in semantic taxonomy analysis:', error);
        res.status(500).json({ error: error.message });
    }
});

// API: Health check
app.get('/api/health', (req, res) => {
    res.json({
        status: 'ok',
        logsDir: fs.existsSync(LOGS_DIR),
        datasetExists: fs.existsSync(DATASET_PATH),
        categorizedDatasetExists: fs.existsSync(CATEGORIZED_DATASET_PATH),
        logFileCount: getLogFiles().length
    });
});

// Start server
app.listen(PORT, () => {
    console.log(`Backend server running on port ${PORT}`);
    console.log(`API endpoints:`);
    console.log(`  GET /api/health`);
    console.log(`  GET /api/questions`);
    console.log(`  GET /api/analysis/semantic-taxonomy`);
});
