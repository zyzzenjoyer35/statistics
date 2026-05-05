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

// API: Word length analysis
app.get('/api/analysis/word-length', (req, res) => {
    try {
        // Load dataset to get word lengths
        const dataset = readJsonFile(DATASET_PATH);
        if (!dataset) {
            return res.status(404).json({ error: 'Dataset not found' });
        }

        // Load all log files
        const logFiles = getLogFiles();
        if (logFiles.length === 0) {
            return res.status(404).json({ error: 'No log files found in logs/ directory' });
        }

        // Create question length mapping
        const questionLengths = {};
        dataset.forEach(item => {
            questionLengths[item.pytanie] = {
                length: item.liter,
                answer: item.odpowiedz
            };
        });

        // Define length groups: 3, 4, 5, 6, 7+
        const lengthGroups = [3, 4, 5, 6, 7];

        // Initialize results structure
        const results = {
            models: [],
            lengthGroups: lengthGroups.map(l => l === 7 ? '7+' : l.toString()),
            accuracyByLength: {},
            wrongLengthByLength: {},
            avgHintsByLength: {},
            lengthDistribution: {}
        };

        // Calculate length distribution from dataset
        lengthGroups.forEach(len => {
            results.lengthDistribution[len] = 0;
        });
        dataset.forEach(item => {
            const len = item.liter >= 7 ? 7 : item.liter;
            if (lengthGroups.includes(len)) {
                results.lengthDistribution[len]++;
            }
        });

        // Process each model's log
        const modelData = [];

        logFiles.forEach(logFile => {
            const logData = readJsonFile(logFile);
            if (!logData || logData.length === 0) return;

            const filename = path.basename(logFile);
            const modelName = parseModelName(filename);
            const fullModelName = `openrouter/${modelName}`;

            // Initialize data for each length group
            const lengthPerformance = {};
            lengthGroups.forEach(len => {
                lengthPerformance[len] = {
                    total: 0,
                    correct: 0,
                    wrongLength: 0,
                    totalHints: 0,
                    guessedCount: 0
                };
            });

            // Analyze each question in the log
            logData.forEach(logEntry => {
                const question = logEntry.question;

                // Get the word length for this question
                const qInfo = questionLengths[question];
                if (!qInfo) return;

                const length = qInfo.length >= 7 ? 7 : qInfo.length;
                if (!lengthGroups.includes(length)) return;

                lengthPerformance[length].total++;

                // Check if model guessed correctly
                if (logEntry.guessed) {
                    lengthPerformance[length].correct++;
                    lengthPerformance[length].totalHints += (logEntry.required_hints || 0);
                    lengthPerformance[length].guessedCount++;
                }

                // Check attempts for wrong-length answers
                if (logEntry.attempts && logEntry.attempts.length > 0) {
                    logEntry.attempts.forEach(attempt => {
                        const cleanedAnswer = attempt.cleaned_answer || '';
                        if (cleanedAnswer.length !== qInfo.length) {
                            lengthPerformance[length].wrongLength++;
                        }
                    });
                }
            });

            // Calculate metrics for each length
            const accuracies = {};
            const wrongLengthPercent = {};
            const avgHints = {};

            lengthGroups.forEach(len => {
                const perf = lengthPerformance[len];

                // Accuracy: correct / total
                accuracies[len] = perf.total > 0 ? (perf.correct / perf.total) * 100 : 0;

                // Wrong length percentage: wrongLength / totalAttempts
                const totalAttempts = perf.total * (perf.guessedCount > 0 ?
                    (perf.totalHints / perf.guessedCount || 1) : 1);
                wrongLengthPercent[len] = totalAttempts > 0 ? (perf.wrongLength / totalAttempts) * 100 : 0;

                // Average hints: totalHints / guessedCount
                avgHints[len] = perf.guessedCount > 0 ? perf.totalHints / perf.guessedCount : 0;
            });

            modelData.push({
                modelName,
                fullName: fullModelName,
                accuracies,
                wrongLengthPercent,
                avgHints,
                lengthPerformance
            });
        });

        // Organize results for frontend
        results.models = modelData.map(m => ({
            name: m.modelName,
            fullName: m.fullName,
            accuracies: m.accuracies,
            wrongLengthPercent: m.wrongLengthPercent,
            avgHints: m.avgHints
        }));

        // Build data arrays for charts
        lengthGroups.forEach(len => {
            const label = len === 7 ? '7+' : len.toString();
            results.accuracyByLength[label] = modelData.map(m => ({
                model: m.modelName,
                accuracy: m.accuracies[len]
            }));
            results.wrongLengthByLength[label] = modelData.map(m => ({
                model: m.modelName,
                wrongLengthPercent: m.wrongLengthPercent[len]
            }));
            results.avgHintsByLength[label] = modelData.map(m => ({
                model: m.modelName,
                avgHints: m.avgHints[len]
            }));
        });

        res.json(results);

    } catch (error) {
        console.error('Error in word length analysis:', error);
        res.status(500).json({ error: error.message });
    }
});

// API: Reasoning cost analysis
app.get('/api/analysis/reasoning-cost', (req, res) => {
    try {
        // Load all log files
        const logFiles = getLogFiles();
        if (logFiles.length === 0) {
            return res.status(404).json({ error: 'No log files found in logs/ directory' });
        }

        // Identify reasoning models (models that have reasoning tokens)
        const reasoningModels = ['claude-opus', 'claude-sonnet', 'gpt-oss', 'qwen'];

        // First pass: calculate question difficulty (average hints required)
        const questionDifficulty = {}; // question -> avg hints across all models
        const questionHints = {}; // question -> array of hints from each model

        logFiles.forEach(logFile => {
            const logData = readJsonFile(logFile);
            if (!logData || logData.length === 0) return;

            logData.forEach(logEntry => {
                const question = logEntry.question;
                const hints = logEntry.guessed ? (logEntry.required_hints || 0) : null;

                if (hints !== null) {
                    if (!questionHints[question]) {
                        questionHints[question] = [];
                    }
                    questionHints[question].push(hints);
                }
            });
        });

        // Calculate average difficulty for each question
        Object.keys(questionHints).forEach(question => {
            const hints = questionHints[question];
            const avgHints = hints.reduce((sum, h) => sum + h, 0) / hints.length;
            questionDifficulty[question] = avgHints;
        });

        // Second pass: collect reasoning tokens for reasoning models
        const modelData = [];

        logFiles.forEach(logFile => {
            const logData = readJsonFile(logFile);
            if (!logData || logData.length === 0) return;

            const filename = path.basename(logFile);
            const modelName = parseModelName(filename);
            const fullModelName = `openrouter/${modelName}`;

            // Check if this is a reasoning model
            const isReasoningModel = reasoningModels.some(rm =>
                modelName.toLowerCase().includes(rm.toLowerCase())
            );

            if (!isReasoningModel) return;

            // Collect reasoning tokens for each question
            const reasoningData = [];

            logData.forEach(logEntry => {
                const question = logEntry.question;
                const difficulty = questionDifficulty[question];

                if (difficulty === undefined) return;

                // Extract reasoning tokens from attempts
                let totalReasoningTokens = 0;
                let attemptCount = 0;

                if (logEntry.attempts && logEntry.attempts.length > 0) {
                    logEntry.attempts.forEach(attempt => {
                        const usage = attempt.usage || {};
                        const completionDetails = usage.completion_tokens_details || {};
                        const reasoningTokens = completionDetails.reasoning_tokens || 0;

                        if (reasoningTokens > 0) {
                            totalReasoningTokens += reasoningTokens;
                            attemptCount++;
                        }
                    });
                }

                const avgReasoningTokens = attemptCount > 0 ? totalReasoningTokens / attemptCount : 0;

                reasoningData.push({
                    question,
                    difficulty,
                    avgReasoningTokens,
                    hintsRequired: logEntry.required_hints || 0,
                    guessed: logEntry.guessed
                });
            });

            // Calculate Pearson correlation between difficulty and reasoning tokens
            const correlation = calculatePearsonCorrelation(
                reasoningData.map(d => d.difficulty),
                reasoningData.map(d => d.avgReasoningTokens)
            );

            // Separate "trivial" questions (0 hints required)
            const trivialQuestions = reasoningData.filter(d => d.hintsRequired === 0 && d.avgReasoningTokens > 0);
            const avgTrivialReasoningTokens = trivialQuestions.length > 0 ?
                trivialQuestions.reduce((sum, d) => sum + d.avgReasoningTokens, 0) / trivialQuestions.length : 0;

            modelData.push({
                modelName,
                fullName: fullModelName,
                reasoningData,
                correlation,
                trivialQuestionCount: trivialQuestions.length,
                avgTrivialReasoningTokens,
                totalQuestions: reasoningData.length
            });
        });

        res.json({
            models: modelData,
            questionCount: Object.keys(questionDifficulty).length
        });

    } catch (error) {
        console.error('Error in reasoning cost analysis:', error);
        res.status(500).json({ error: error.message });
    }
});

// Helper function to calculate Pearson correlation
function calculatePearsonCorrelation(x, y) {
    if (x.length !== y.length || x.length < 2) return 0;

    const n = x.length;
    const sumX = x.reduce((a, b) => a + b, 0);
    const sumY = y.reduce((a, b) => a + b, 0);
    const sumXY = x.reduce((sum, xi, i) => sum + xi * y[i], 0);
    const sumX2 = x.reduce((sum, xi) => sum + xi * xi, 0);
    const sumY2 = y.reduce((sum, yi) => sum + yi * yi, 0);

    const numerator = n * sumXY - sumX * sumY;
    const denominator = Math.sqrt((n * sumX2 - sumX * sumX) * (n * sumY2 - sumY * sumY));

    if (denominator === 0) return 0;
    return numerator / denominator;
}

// API: Pareto frontier analysis
app.get('/api/analysis/pareto-frontier', (req, res) => {
    try {
        // Load all log files
        const logFiles = getLogFiles();
        if (logFiles.length === 0) {
            return res.status(404).json({ error: 'No log files found in logs/ directory' });
        }

        // Calculate accuracy and cost for each model
        const modelData = [];

        logFiles.forEach(logFile => {
            const logData = readJsonFile(logFile);
            if (!logData || logData.length === 0) return;

            const filename = path.basename(logFile);
            const modelName = parseModelName(filename);
            const fullModelName = `openrouter/${modelName}`;

            let correctCount = 0;
            let totalCount = 0;
            let totalCost = 0;
            let totalQuestions = 0;

            logData.forEach(logEntry => {
                totalCount++;
                if (logEntry.guessed) {
                    correctCount++;
                }

                // Calculate total cost from all attempts
                if (logEntry.attempts && logEntry.attempts.length > 0) {
                    logEntry.attempts.forEach(attempt => {
                        const usage = attempt.usage || {};
                        const cost = usage.cost || 0;
                        totalCost += cost;
                    });
                }
            });

            const accuracy = totalCount > 0 ? (correctCount / totalCount) * 100 : 0;
            const avgCostPerQuestion = totalCount > 0 ? totalCost / totalCount : 0;
            const qualityPriceRatio = avgCostPerQuestion > 0 ? accuracy / avgCostPerQuestion : 0;

            modelData.push({
                modelName,
                fullName: fullModelName,
                accuracy,
                avgCostPerQuestion,
                qualityPriceRatio,
                totalCost,
                correctCount,
                totalCount
            });
        });

        // Identify Pareto-optimal models
        // A model is Pareto-optimal if no other model is both cheaper AND more accurate
        const paretoOptimalModels = modelData.filter(model => {
            return !modelData.some(other =>
                other.modelName !== model.modelName &&
                other.avgCostPerQuestion <= model.avgCostPerQuestion &&
                other.accuracy >= model.accuracy &&
                (other.avgCostPerQuestion < model.avgCostPerQuestion || other.accuracy > model.accuracy)
            );
        });

        const paretoModelNames = new Set(paretoOptimalModels.map(m => m.modelName));

        // Find cheapest model with ≥80% accuracy
        const modelsAbove80 = modelData.filter(m => m.accuracy >= 80);
        const cheapestAbove80 = modelsAbove80.length > 0 ?
            modelsAbove80.reduce((cheapest, current) =>
                current.avgCostPerQuestion < cheapest.avgCostPerQuestion ? current : cheapest
            ) : null;

        // Find best quality/price ratio
        const bestQualityPriceRatio = modelData.length > 0 ?
            modelData.reduce((best, current) =>
                current.qualityPriceRatio > best.qualityPriceRatio ? current : best
            ) : null;

        // Mark models as Pareto-optimal or dominated
        const enrichedModelData = modelData.map(model => ({
            ...model,
            isParetoOptimal: paretoModelNames.has(model.modelName),
            isCheapestAbove80: cheapestAbove80 && model.modelName === cheapestAbove80.modelName,
            isBestQualityPriceRatio: bestQualityPriceRatio && model.modelName === bestQualityPriceRatio.modelName
        }));

        res.json({
            models: enrichedModelData,
            paretoOptimalModels: paretoOptimalModels,
            cheapestAbove80,
            bestQualityPriceRatio,
            summary: {
                totalModels: modelData.length,
                paretoOptimalCount: paretoOptimalModels.length,
                dominatedCount: modelData.length - paretoOptimalModels.length
            }
        });

    } catch (error) {
        console.error('Error in Pareto frontier analysis:', error);
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
    console.log(`  GET /api/analysis/word-length`);
    console.log(`  GET /api/analysis/reasoning-cost`);
    console.log(`  GET /api/analysis/pareto-frontier`);
});
