import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { BarChart, Bar, LineChart, Line, ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from 'recharts';
import './App.css';

const API_BASE = 'http://localhost:5000/api';

function App() {
  const [activeTab, setActiveTab] = useState('semantic');
  const [analysisData, setAnalysisData] = useState(null);
  const [wordLengthData, setWordLengthData] = useState(null);
  const [reasoningData, setReasoningData] = useState(null);
  const [paretoData, setParetoData] = useState(null);
  const [errorModesData, setErrorModesData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (activeTab === 'semantic') {
      fetchAnalysisData();
    } else if (activeTab === 'word-length') {
      fetchWordLengthData();
    } else if (activeTab === 'reasoning') {
      fetchReasoningData();
    } else if (activeTab === 'pareto') {
      fetchParetoData();
    } else if (activeTab === 'error-modes') {
      fetchErrorModesData();
    }
  }, [activeTab]);

  const fetchAnalysisData = async () => {
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
  };

  const fetchWordLengthData = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_BASE}/analysis/word-length`);
      setWordLengthData(response.data);
      setError(null);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to fetch word length data');
      console.error('Error fetching word length analysis:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchReasoningData = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_BASE}/analysis/reasoning-cost`);
      setReasoningData(response.data);
      setError(null);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to fetch reasoning data');
      console.error('Error fetching reasoning analysis:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchParetoData = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_BASE}/analysis/pareto-frontier`);
      setParetoData(response.data);
      setError(null);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to fetch Pareto frontier data');
      console.error('Error fetching Pareto analysis:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchErrorModesData = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_BASE}/analysis/error-modes`);
      setErrorModesData(response.data);
      setError(null);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to fetch error modes data');
      console.error('Error fetching error modes analysis:', err);
    } finally {
      setLoading(false);
    }
  };

  // Prepare data for grouped bar chart
  const prepareChartData = () => {
    if (!analysisData || !analysisData.models || !analysisData.categories) {
      return [];
    }

    // Transform data for Recharts
    const data = Object.entries(analysisData.categories).map(([catNum, catName]) => {
      const point = { category: catName };

      analysisData.models.forEach(model => {
        const acc = model.accuracies[catNum] || 0;
        point[model.name] = acc;
      });

      return point;
    });

    return data;
  };

  // Get unique colors for each model
  const getModelColors = () => {
    const colors = [
      '#8884d8', '#82ca9d', '#ffc658', '#ff7300', '#0088fe',
      '#00c49f', '#ffbb28', '#ff8042', '#8dd1e1', '#d084d0'
    ];
    return colors;
  };

  const renderCategory5Comparison = () => {
    if (!analysisData || !analysisData.polishVsEnglishCategory5) {
      return null;
    }

    const { polishAccuracy, englishAccuracy, difference, polishModels, englishModels } =
      analysisData.polishVsEnglishCategory5;

    if (polishAccuracy === null || englishAccuracy === null) {
      return (
        <div className="comparison-card">
          <h3>Porównanie: Modele polskie vs angielskie (Kategoria 5)</h3>
          <p>Niewystarczające dane do porównania</p>
        </div>
      );
    }

    const comparisonData = [
      { name: 'Modele polskie', accuracy: polishAccuracy },
      { name: 'Modele angielskie', accuracy: englishAccuracy }
    ];

    return (
      <div className="comparison-card">
        <h3>Porównanie: Modele polskie vs angielskie (Kategoria 5: Polskie realia kulturowe)</h3>

        <div className="comparison-stats">
          <div className="stat-box">
            <h4>Modele polskie</h4>
            <p className="stat-value">{polishAccuracy.toFixed(1)}%</p>
            <p className="stat-label">Dokładność</p>
            <p className="stat-models">{polishModels.join(', ')}</p>
          </div>

          <div className="stat-box">
            <h4>Modele angielskie</h4>
            <p className="stat-value">{englishAccuracy.toFixed(1)}%</p>
            <p className="stat-label">Dokładność</p>
            <p className="stat-models">{englishModels.join(', ')}</p>
          </div>

          <div className="stat-box highlight">
            <h4>Różnica</h4>
            <p className={`stat-value ${difference >= 0 ? 'positive' : 'negative'}`}>
              {difference >= 0 ? '+' : ''}{difference.toFixed(1)}%
            </p>
            <p className="stat-label">
              {difference >= 0 ? 'Modele polskie lepsze' : 'Modele angielskie lepsze'}
            </p>
          </div>
        </div>

        <div className="comparison-chart">
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={comparisonData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip formatter={(value) => `${value.toFixed(1)}%`} />
              <Bar dataKey="accuracy" fill="#8884d8">
                <Cell fill="#82ca9d" />
                <Cell fill="#8884d8" />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    );
  };

  const renderAccuracyTable = () => {
    if (!analysisData || !analysisData.models || !analysisData.categories) {
      return null;
    }

    return (
      <div className="table-container">
        <h3>Szczegółowa tabela dokładności</h3>
        <table>
          <thead>
            <tr>
              <th>Model</th>
              {Object.entries(analysisData.categories).map(([num, name]) => (
                <th key={num}>{num}. {name}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {analysisData.models.map((model, idx) => (
              <tr key={model.name}>
                <td className="model-name">
                  {model.name}
                  {model.isPolish && <span className="badge polish">PL</span>}
                  {model.isEnglish && <span className="badge english">EN</span>}
                </td>
                {Object.keys(analysisData.categories).map(catNum => (
                  <td key={catNum}>
                    {(model.accuracies[catNum] || 0).toFixed(1)}%
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  // Word Length Analysis Components
  const prepareWordLengthChartData = (dataKey) => {
    if (!wordLengthData || !wordLengthData.models || !wordLengthData.lengthGroups) {
      return [];
    }

    return wordLengthData.lengthGroups.map(length => {
      const point = { length };

      wordLengthData.models.forEach(model => {
        point[model.name] = model[dataKey][length] || 0;
      });

      return point;
    });
  };

  const renderWordLengthAccuracyChart = () => {
    if (!wordLengthData) return null;

    const data = prepareWordLengthChartData('accuracies');

    return (
      <div className="chart-container">
        <h2>Dokładność vs Długość słowa</h2>
        <ResponsiveContainer width="100%" height={400}>
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="length" label={{ value: 'Długość słowa (litery)', position: 'insideBottom', offset: -5 }} />
            <YAxis label={{ value: 'Dokładność (%)', angle: -90, position: 'insideLeft' }} />
            <Tooltip formatter={(value) => `${value.toFixed(1)}%`} />
            <Legend />
            {wordLengthData.models.map((model, idx) => (
              <Line
                key={model.name}
                type="monotone"
                dataKey={model.name}
                stroke={getModelColors()[idx % getModelColors().length]}
                name={model.name}
                strokeWidth={2}
                dot={{ r: 4 }}
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </div>
    );
  };

  const renderWrongLengthChart = () => {
    if (!wordLengthData) return null;

    const data = prepareWordLengthChartData('wrongLengthPercent');

    return (
      <div className="chart-container">
        <h2>Odsetek odpowiedzi o błędnej długości</h2>
        <ResponsiveContainer width="100%" height={400}>
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="length" label={{ value: 'Długość słowa (litery)', position: 'insideBottom', offset: -5 }} />
            <YAxis label={{ value: 'Błędna długość (%)', angle: -90, position: 'insideLeft' }} />
            <Tooltip formatter={(value) => `${value.toFixed(1)}%`} />
            <Legend />
            {wordLengthData.models.map((model, idx) => (
              <Line
                key={model.name}
                type="monotone"
                dataKey={model.name}
                stroke={getModelColors()[idx % getModelColors().length]}
                name={model.name}
                strokeWidth={2}
                dot={{ r: 4 }}
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </div>
    );
  };

  const renderAvgHintsChart = () => {
    if (!wordLengthData) return null;

    const data = prepareWordLengthChartData('avgHints');

    return (
      <div className="chart-container">
        <h2>Średnia liczba wymaganych podpowiedzi</h2>
        <ResponsiveContainer width="100%" height={400}>
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="length" label={{ value: 'Długość słowa (litery)', position: 'insideBottom', offset: -5 }} />
            <YAxis label={{ value: 'Średnia liczba podpowiedzi', angle: -90, position: 'insideLeft' }} />
            <Tooltip formatter={(value) => value.toFixed(2)} />
            <Legend />
            {wordLengthData.models.map((model, idx) => (
              <Bar
                key={model.name}
                dataKey={model.name}
                fill={getModelColors()[idx % getModelColors().length]}
                name={model.name}
              />
            ))}
          </BarChart>
        </ResponsiveContainer>
      </div>
    );
  };

  const renderWordLengthStats = () => {
    if (!wordLengthData || !wordLengthData.lengthDistribution) {
      return null;
    }

    const total = Object.values(wordLengthData.lengthDistribution).reduce((a, b) => a + b, 0);

    return (
      <div className="stats-container">
        <h3>Rozkład pytań według długości słowa</h3>
        <div className="category-stats">
          {Object.entries(wordLengthData.lengthDistribution).map(([length, count]) => {
            const percentage = ((count / total) * 100).toFixed(1);
            return (
              <div key={length} className="category-stat-item">
                <span className="category-number">{length} lit.</span>
                <span className="category-name">Pytania o tej długości</span>
                <span className="category-count">{count} ({percentage}%)</span>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  // Reasoning Analysis Components
  const renderReasoningCorrelation = () => {
    if (!reasoningData || !reasoningData.models || reasoningData.models.length === 0) {
      return (
        <div className="comparison-card">
          <h3>Korelacja: Trudność pytania vs Koszt reasoningu</h3>
          <p>Brak modeli reasoning w danych lub brak danych o tokenach myślenia.</p>
        </div>
      );
    }

    return (
      <div className="comparison-card">
        <h3>Korelacja: Trudność pytania vs Koszt reasoningu</h3>
        <div className="comparison-stats">
          {reasoningData.models.map((model, idx) => (
            <div key={model.modelName} className="stat-box">
              <h4>{model.modelName}</h4>
              <p className="stat-value">
                {model.correlation.toFixed(3)}
                {model.correlation > 0.5 && <span className="correlation-indicator positive">↑</span>}
                {model.correlation < -0.5 && <span className="correlation-indicator negative">↓</span>}
                {Math.abs(model.correlation) <= 0.5 && <span className="correlation-indicator neutral">→</span>}
              </p>
              <p className="stat-label">Korelacja Pearsona</p>
              <p className="stat-models">
                {model.correlation > 0.3 && 'Pozytywna - więcej myślenia na trudniejszych pytaniach'}
                {model.correlation < -0.3 && 'Negatywna - więcej myślenia na łatwych pytaniach'}
                {Math.abs(model.correlation) <= 0.3 && 'Słaba - brak wyraźnej zależności'}
              </p>
            </div>
          ))}
        </div>
        <p className="info-text">
          Korelacja bliska 1.0 oznacza, że model zużywa więcej tokenów myślenia na trudniejsze pytania.
          Korelacja bliska 0 oznacza brak zależności. Ujemna korelacja może wskazywać na "prze-myślanie" łatwych pytań.
        </p>
      </div>
    );
  };

  const renderTrivialQuestionsAnalysis = () => {
    if (!reasoningData || !reasoningData.models || reasoningData.models.length === 0) {
      return null;
    }

    return (
      <div className="comparison-card">
        <h3>Analiza "prze-myślania" na trywialnych pytaniach</h3>
        <p className="subtitle">Pytania rozwiązane od razu (0 podpowiedzi)</p>

        <div className="comparison-stats">
          {reasoningData.models.map((model, idx) => (
            <div key={model.modelName} className="stat-box">
              <h4>{model.modelName}</h4>
              <p className="stat-value">
                {model.avgTrivialReasoningTokens > 0 ? model.avgTrivialReasoningTokens.toFixed(0) : 'N/A'}
              </p>
              <p className="stat-label">Średnie tokeny myślenia</p>
              <p className="stat-models">
                {model.trivialQuestionCount} pytań trywialnych z {model.totalQuestions} wszystkich
              </p>
            </div>
          ))}
        </div>

        <div className="chart-container">
          <h4>Średnia liczba tokenów myślenia na pytaniach trywialnych</h4>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={reasoningData.models.map(m => ({
              name: m.modelName,
              tokens: m.avgTrivialReasoningTokens
            }))}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" angle={-15} textAnchor="end" height={100} />
              <YAxis label={{ value: 'Tokeny myślenia', angle: -90, position: 'insideLeft' }} />
              <Tooltip formatter={(value) => value.toFixed(0)} />
              <Bar dataKey="tokens" fill="#ff7300" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    );
  };

  const renderScatterPlot = () => {
    if (!reasoningData || !reasoningData.models || reasoningData.models.length === 0) {
      return null;
    }

    // Combine all reasoning data with model identifier
    const allData = [];
    reasoningData.models.forEach((model, idx) => {
      model.reasoningData.forEach(point => {
        allData.push({
          ...point,
          model: model.modelName,
          color: getModelColors()[idx % getModelColors().length]
        });
      });
    });

    return (
      <div className="chart-container">
        <h2>Wykres rozrzutu: Trudność vs Tokeny myślenia</h2>
        <ResponsiveContainer width="100%" height={500}>
          <ScatterChart data={allData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              dataKey="difficulty"
              type="number"
              label={{ value: 'Trudność pytania (średnia liczba podpowiedzi)', position: 'insideBottom', offset: -5 }}
              domain={[0, 'dataMax + 1']}
            />
            <YAxis
              dataKey="avgReasoningTokens"
              type="number"
              label={{ value: 'Tokeny myślenia', angle: -90, position: 'insideLeft' }}
              domain={[0, 'dataMax + 100']}
            />
            <Tooltip
              formatter={(value, name) => [name === 'difficulty' ? value.toFixed(2) : value.toFixed(0), name === 'difficulty' ? 'Trudność' : 'Tokeny myślenia']}
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  const data = payload[0].payload;
                  return (
                    <div className="custom-tooltip">
                      <p><strong>{data.model}</strong></p>
                      <p>Pytanie: {data.question.substring(0, 50)}...</p>
                      <p>Trudność: {data.difficulty.toFixed(2)}</p>
                      <p>Tokeny myślenia: {data.avgReasoningTokens.toFixed(0)}</p>
                      <p>Podpowiedzi: {data.hintsRequired}</p>
                    </div>
                  );
                }
                return null;
              }}
            />
            <Legend />
            {reasoningData.models.map((model, idx) => (
              <Scatter
                key={model.modelName}
                name={model.modelName}
                data={model.reasoningData}
                fill={getModelColors()[idx % getModelColors().length]}
              />
            ))}
          </ScatterChart>
        </ResponsiveContainer>
        <p className="info-text">
          Każdy punkt reprezentuje jedno pytanie. Poziomo: trudność pytania. Pionowo: tokeny myślenia.
          Modele, które efektywnie wykorzystują reasoning, powinny pokazywać pozytywną korelację.
        </p>
      </div>
    );
  };

  // Pareto Frontier Analysis Components
  const renderParetoSummary = () => {
    if (!paretoData) return null;

    const { summary, cheapestAbove80, bestQualityPriceRatio } = paretoData;

    return (
      <div className="comparison-card">
        <h3>Podsumowanie analizy Pareto</h3>
        <div className="comparison-stats">
          <div className="stat-box">
            <h4>Wszystkie modele</h4>
            <p className="stat-value">{summary.totalModels}</p>
            <p className="stat-label">Analizowano modele</p>
          </div>

          <div className="stat-box highlight">
            <h4>Optymalne Pareto</h4>
            <p className="stat-value">{summary.paretoOptimalCount}</p>
            <p className="stat-label">Niezdominowane modele</p>
          </div>

          <div className="stat-box">
            <h4>Zdominowane</h4>
            <p className="stat-value">{summary.dominatedCount}</p>
            <p className="stat-label">Modele do usunięcia</p>
          </div>
        </div>

        {cheapestAbove80 && (
          <div className="info-box success">
            <h4>💰 Najtańszy model z ≥80% dokładności:</h4>
            <p><strong>{cheapestAbove80.modelName}</strong></p>
            <p>Dokładność: {cheapestAbove80.accuracy.toFixed(1)}% | Koszt: ${cheapestAbove80.avgCostPerQuestion.toFixed(6)}/pytanie</p>
          </div>
        )}

        {bestQualityPriceRatio && (
          <div className="info-box info">
            <h4>🏆 Najlepszy stosunek jakość/cena:</h4>
            <p><strong>{bestQualityPriceRatio.modelName}</strong></p>
            <p>{bestQualityPriceRatio.qualityPriceRatio.toFixed(0)} punktów dokładności na $1</p>
          </div>
        )}
      </div>
    );
  };

  const renderParetoScatterPlot = () => {
    if (!paretoData || !paretoData.models) return null;

    const scatterData = paretoData.models.map(model => ({
      ...model,
      fill: model.isParetoOptimal ? '#2ecc71' : '#bdc3c7',
      radius: model.isParetoOptimal ? 8 : 5,
      opacity: model.isParetoOptimal ? 1 : 0.5
    }));

    return (
      <div className="chart-container">
        <h2>Granica Pareto: Koszt vs Dokładność</h2>
        <div className="chart-legend">
          <span className="legend-item">
            <span className="legend-color" style={{ background: '#2ecc71' }}></span>
            Optymalne Pareto (niezdominowane)
          </span>
          <span className="legend-item">
            <span className="legend-color" style={{ background: '#bdc3c7' }}></span>
            Zdominowane
          </span>
        </div>
        <ResponsiveContainer width="100%" height={500}>
          <ScatterChart data={scatterData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              dataKey="avgCostPerQuestion"
              type="number"
              label={{ value: 'Średni koszt na pytanie ($)', position: 'insideBottom', offset: -5 }}
              domain={[0, 'dataMax * 1.1']}
              tickFormatter={(value) => `$${value.toFixed(4)}`}
            />
            <YAxis
              dataKey="accuracy"
              type="number"
              label={{ value: 'Dokładność (%)', angle: -90, position: 'insideLeft' }}
              domain={[0, 100]}
              tickFormatter={(value) => `${value}%`}
            />
            <Tooltip
              formatter={(value, name) => {
                if (name === 'avgCostPerQuestion') return [`$${value.toFixed(6)}`, 'Koszt'];
                if (name === 'accuracy') return [`${value.toFixed(1)}%`, 'Dokładność'];
                return [value, name];
              }}
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  const data = payload[0].payload;
                  return (
                    <div className="custom-tooltip">
                      <p><strong>{data.modelName}</strong></p>
                      {data.isParetoOptimal && <p className="pareto-badge">✓ Optymalne Pareto</p>}
                      {data.isCheapestAbove80 && <p className="special-badge">💰 Najtańszy ≥80%</p>}
                      {data.isBestQualityPriceRatio && <p className="special-badge">🏆 Najlepszy stosunek jakość/cena</p>}
                      <p>Dokładność: {data.accuracy.toFixed(1)}%</p>
                      <p>Koszt: ${data.avgCostPerQuestion.toFixed(6)}/pytanie</p>
                      <p>Stosunek jakość/cena: {data.qualityPriceRatio.toFixed(0)} pkt/$</p>
                      <p>Poprawne: {data.correctCount}/{data.totalCount}</p>
                    </div>
                  );
                }
                return null;
              }}
            />
            <Scatter data={scatterData}>
              {scatterData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.fill} />
              ))}
            </Scatter>
          </ScatterChart>
        </ResponsiveContainer>
        <p className="info-text">
          <strong>Granica Pareto</strong> to zbiór modeli, dla których nie istnieje model jednocześnie tańszy i dokładniejszy.
          Modele na granicy Pareto (zielone) oferują optymalny kompromis między kosztem a jakością.
          Modele zdominowane (szare) są praktycznie "zbędne" - można je zastąpić lepszymi opcjami.
        </p>
      </div>
    );
  };

  const renderParetoTable = () => {
    if (!paretoData || !paretoData.models) return null;

    return (
      <div className="table-container">
        <h3>Szczegółowa tabela modeli</h3>
        <table>
          <thead>
            <tr>
              <th>Model</th>
              <th>Dokładność</th>
              <th>Koszt/pytanie</th>
              <th>Jakość/cena</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {paretoData.models
              .sort((a, b) => b.qualityPriceRatio - a.qualityPriceRatio)
              .map((model, idx) => (
                <tr key={model.modelName} className={model.isParetoOptimal ? 'pareto-optimal-row' : ''}>
                  <td className="model-name">
                    {model.modelName}
                    {model.isParetoOptimal && <span className="badge pareto">Pareto</span>}
                    {model.isCheapestAbove80 && <span className="badge cheapest">💰</span>}
                    {model.isBestQualityPriceRatio && <span className="badge best-ratio">🏆</span>}
                  </td>
                  <td>{model.accuracy.toFixed(1)}%</td>
                  <td>${model.avgCostPerQuestion.toFixed(6)}</td>
                  <td>{model.qualityPriceRatio.toFixed(0)}</td>
                  <td>
                    {model.isParetoOptimal ? (
                      <span className="status-optimal">Optymalne</span>
                    ) : (
                      <span className="status-dominated">Zdominowane</span>
                    )}
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>
    );
  };

  // Error Modes Analysis Components
  const renderErrorModesSummary = () => {
    if (!errorModesData || !errorModesData.categorySummary) return null;

    return (
      <div className="comparison-card">
        <h3>Podsumowanie trybów awarii</h3>
        <p className="subtitle">Rozkład błędów według kategorii (wszystkie modele)</p>
        <div className="comparison-stats">
          <div className="stat-box highlight">
            <h4>Całkowita liczba błędów</h4>
            <p className="stat-value">{errorModesData.totalErrors}</p>
            <p className="stat-label">Zaklasyfikowanych błędów</p>
          </div>
        </div>

        <div className="chart-container">
          <h4>Rozkład błędów według kategorii</h4>
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={errorModesData.categorySummary}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey="name"
                angle={-15}
                textAnchor="end"
                height={100}
                interval={0}
              />
              <YAxis label={{ value: 'Liczba błędów', angle: -90, position: 'insideLeft' }} />
              <Tooltip
                formatter={(value, name) => [value, 'Liczba']}
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const data = payload[0].payload;
                    return (
                      <div className="custom-tooltip">
                        <p><strong>{data.name}</strong></p>
                        <p>Liczba: {data.count}</p>
                        <p>Procent: {data.percentage.toFixed(1)}%</p>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Bar dataKey="count" fill="#e74c3c" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    );
  };

  const renderErrorModesMatrix = () => {
    if (!errorModesData || !errorModesData.models || !errorModesData.errorCategories) return null;

    return (
      <div className="table-container">
        <h3>Macierz trybów awarii według modeli</h3>
        <table>
          <thead>
            <tr>
              <th>Model</th>
              {Object.values(errorModesData.errorCategories).map((cat, idx) => (
                <th key={idx}>{cat}</th>
              ))}
              <th>Dominujący błąd</th>
              <th>Średnie próby</th>
            </tr>
          </thead>
          <tbody>
            {errorModesData.models.map((model, idx) => (
              <tr key={model.name}>
                <td className="model-name">{model.name}</td>
                {Object.keys(errorModesData.errorCategories).map(catId => (
                  <td key={catId}>
                    {model.errorDistribution[catId] !== undefined ?
                      `${model.errorDistribution[catId].toFixed(1)}%` : '0%'}
                  </td>
                ))}
                <td>
                  <span className="badge" style={{ background: '#e74c3c', color: 'white' }}>
                    {model.dominantCategoryName}
                  </span>
                </td>
                <td>{model.avgAttempts.toFixed(1)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  const renderModelErrorProfile = () => {
    if (!errorModesData || !errorModesData.models || errorModesData.models.length === 0) return null;

    // Prepare data for bar chart
    const chartData = errorModesData.models.map(m => ({
      model: m.name,
      totalErrors: m.totalErrors,
      dominantPercent: m.dominantPercentage
    }));

    return (
      <div className="chart-container">
        <h2>Profil błędów według modeli</h2>
        <ResponsiveContainer width="100%" height={400}>
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="model" angle={-15} textAnchor="end" height={100} />
            <YAxis label={{ value: 'Liczba błędów', angle: -90, position: 'insideLeft' }} />
            <Tooltip
              formatter={(value, name) => [value, name === 'totalErrors' ? 'Błędy' : 'Procent']}
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  const data = payload[0].payload;
                  return (
                    <div className="custom-tooltip">
                      <p><strong>{data.model}</strong></p>
                      <p>Liczba błędów: {data.totalErrors}</p>
                      <p>Dominujący typ: {data.dominantPercent.toFixed(1)}%</p>
                    </div>
                  );
                }
                return null;
              }}
            />
            <Legend />
            <Bar dataKey="totalErrors" fill="#e74c3c" name="Liczba błędów" />
          </BarChart>
        </ResponsiveContainer>
        <p className="info-text">
          <strong>Profil błędów</strong> pokazuje "osobowość" każdego modelu - jakie typy błędów najczęściej popełnia.
          Różne modele mogą mieć różne wzorce błędów (np. jeden częściej podaje synonimy, inny halucynuje).
        </p>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="App">
        <div className="loading-container">
          <div className="spinner"></div>
          <p>Ładowanie danych analizy...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="App">
        <div className="error-container">
          <h2>Błąd</h2>
          <p>{error}</p>
          <button onClick={() => {
            if (activeTab === 'semantic') fetchAnalysisData();
            else if (activeTab === 'word-length') fetchWordLengthData();
            else if (activeTab === 'reasoning') fetchReasoningData();
            else if (activeTab === 'pareto') fetchParetoData();
            else if (activeTab === 'error-modes') fetchErrorModesData();
          }} className="retry-button">
            Spróbuj ponownie
          </button>
          {error.includes('categorized') && (
            <div className="help-box">
              <h4>Uruchom kategoryzację pytań:</h4>
              <pre>python categorize_questions.py</pre>
            </div>
          )}
        </div>
      </div>
    );
  }

  const chartData = prepareChartData();
  const modelColors = getModelColors();

  return (
    <div className="App">
      <header className="app-header">
        <h1>Dashboard: Benchmarking LLM na polskich krzyżówkach</h1>
        <div className="tab-navigation">
          <button
            className={`tab-button ${activeTab === 'semantic' ? 'active' : ''}`}
            onClick={() => setActiveTab('semantic')}
          >
            Punkt 1: Taksonomia semantyczna
          </button>
          <button
            className={`tab-button ${activeTab === 'word-length' ? 'active' : ''}`}
            onClick={() => setActiveTab('word-length')}
          >
            Punkt 2: Długość słowa
          </button>
          <button
            className={`tab-button ${activeTab === 'reasoning' ? 'active' : ''}`}
            onClick={() => setActiveTab('reasoning')}
          >
            Punkt 3: Koszt reasoningu
          </button>
          <button
            className={`tab-button ${activeTab === 'pareto' ? 'active' : ''}`}
            onClick={() => setActiveTab('pareto')}
          >
            Punkt 4: Granica Pareto
          </button>
          <button
            className={`tab-button ${activeTab === 'error-modes' ? 'active' : ''}`}
            onClick={() => setActiveTab('error-modes')}
          >
            Punkt 5: Tryby awarii
          </button>
        </div>
      </header>

      <main className="app-main">
        {activeTab === 'semantic' && analysisData && (
          <>
            {/* Category 5 Comparison */}
            {renderCategory5Comparison()}

            {/* Grouped Bar Chart */}
            <div className="chart-container">
              <h2>Dokładność modeli według kategorii semantycznych</h2>
              <ResponsiveContainer width="100%" height={500}>
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis
                    dataKey="category"
                    angle={-15}
                    textAnchor="end"
                    height={100}
                    interval={0}
                  />
                  <YAxis label={{ value: 'Dokładność (%)', angle: -90, position: 'insideLeft' }} />
                  <Tooltip formatter={(value) => `${value.toFixed(1)}%`} />
                  <Legend />
                  {analysisData.models.map((model, idx) => (
                    <Bar
                      key={model.name}
                      dataKey={model.name}
                      fill={modelColors[idx % modelColors.length]}
                      name={model.name}
                    />
                  ))}
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Accuracy Table */}
            {renderAccuracyTable()}

            {/* Category Distribution */}
            {analysisData.categoryCounts && (
              <div className="stats-container">
                <h3>Rozkład pytań według kategorii</h3>
                <div className="category-stats">
                  {Object.entries(analysisData.categoryCounts).map(([cat, count]) => {
                    const total = Object.values(analysisData.categoryCounts).reduce((a, b) => a + b, 0);
                    const percentage = ((count / total) * 100).toFixed(1);
                    return (
                      <div key={cat} className="category-stat-item">
                        <span className="category-number">{cat}.</span>
                        <span className="category-name">{analysisData.categories[cat]}</span>
                        <span className="category-count">{count} ({percentage}%)</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </>
        )}

        {activeTab === 'word-length' && wordLengthData && (
          <>
            {/* Word Length Accuracy Chart */}
            {renderWordLengthAccuracyChart()}

            {/* Wrong Length Chart */}
            {renderWrongLengthChart()}

            {/* Average Hints Chart */}
            {renderAvgHintsChart()}

            {/* Word Length Distribution */}
            {renderWordLengthStats()}
          </>
        )}

        {activeTab === 'reasoning' && reasoningData && (
          <>
            {/* Correlation Analysis */}
            {renderReasoningCorrelation()}

            {/* Trivial Questions Analysis */}
            {renderTrivialQuestionsAnalysis()}

            {/* Scatter Plot */}
            {renderScatterPlot()}
          </>
        )}

        {activeTab === 'pareto' && paretoData && (
          <>
            {/* Summary */}
            {renderParetoSummary()}

            {/* Scatter Plot */}
            {renderParetoScatterPlot()}

            {/* Detailed Table */}
            {renderParetoTable()}
          </>
        )}

        {activeTab === 'error-modes' && errorModesData && (
          <>
            {/* Summary */}
            {renderErrorModesSummary()}

            {/* Model Error Profile Chart */}
            {renderModelErrorProfile()}

            {/* Error Matrix Table */}
            {renderErrorModesMatrix()}
          </>
        )}
      </main>

      <footer className="app-footer">
        <p>Dashboard analityczny dla badania rozwiązywania polskich krzyżówek przez modele LLM</p>
      </footer>
    </div>
  );
}

export default App;
