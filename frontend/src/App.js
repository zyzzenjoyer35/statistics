import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from 'recharts';
import './App.css';

const API_BASE = 'http://localhost:5000/api';

function App() {
  const [activeTab, setActiveTab] = useState('semantic');
  const [analysisData, setAnalysisData] = useState(null);
  const [wordLengthData, setWordLengthData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (activeTab === 'semantic') {
      fetchAnalysisData();
    } else {
      fetchWordLengthData();
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
          <button onClick={() => activeTab === 'semantic' ? fetchAnalysisData() : fetchWordLengthData()} className="retry-button">
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
      </main>

      <footer className="app-footer">
        <p>Dashboard analityczny dla badania rozwiązywania polskich krzyżówek przez modele LLM</p>
      </footer>
    </div>
  );
}

export default App;
