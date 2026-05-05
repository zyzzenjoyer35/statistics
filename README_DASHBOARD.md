# Crossword LLM Benchmarking Dashboard

Dashboard analityczny do wizualizacji wyników benchmarkingu modeli LLM na polskich krzyżówkach.

## Punkt 1: Taksonomia semantyczna pytań

Dashboard przedstawia analizę dokładności modeli w 5 kategoriach semantycznych:
1. Wiedza ogólna / encyklopedyczna
2. Definicje słownikowe
3. Metafora i gra słowna
4. Nazwy własne i popkultura
5. Polskie realia kulturowe

## Wymagania

- Node.js (v14+)
- npm
- Python 3.8+ (tylko do kategoryzacji pytań)

## Instalacja

### Backend (Node.js)

```bash
cd backend
npm install
```

### Frontend (React)

```bash
cd frontend
npm install
```

## Uruchomienie

### Krok 1: Kategoryzacja pytań (wymagane tylko raz)

**Uwaga:** Wymaga zainstalowanego Pythona z biblioteką `litellm`.

```bash
# W głównym katalogu projektu
python categorize_questions.py
```

Ten skrypt użyje LLM do automatycznej kategoryzacji wszystkich pytań z `dataset.json` i zapisze wynik do `categorized_dataset.json`.

### Krok 2: Uruchomienie backendu

```bash
cd backend
npm start
```

Backend będzie dostępny na `http://localhost:5000`

### Krok 3: Uruchomienie frontendu

W nowym terminalu:

```bash
cd frontend
npm start
```

Frontend będzie dostępny na `http://localhost:3000`

## Struktura projektu

```
cellerAI/
├── backend/
│   ├── server.js          # API backend (Express)
│   └── package.json
├── frontend/
│   ├── public/
│   │   └── index.html
│   ├── src/
│   │   ├── App.js         # Główny komponent React
│   │   ├── App.css
│   │   ├── index.js
│   │   └── index.css
│   └── package.json
├── logs/                  # Dane z benchmarkingu (automatycznie wczytywane)
├── dataset.json           # Oryginalne pytania
├── categorized_dataset.json # Skategoryzowane pytania (generowane)
└── categorize_questions.py # Skrypt do kategoryzacji
```

## API Endpoints

### `GET /api/health`
Sprawdza status backendu i dostępność plików.

**Response:**
```json
{
  "status": "ok",
  "logsDir": true,
  "datasetExists": true,
  "categorizedDatasetExists": true,
  "logFileCount": 12
}
```

### `GET /api/questions`
Zwraca wszystkie pytania (skategoryzowane lub nieskategoryzowane).

**Response:**
```json
{
  "questions": [...],
  "source": "categorized"
}
```

### `GET /api/analysis/semantic-taxonomy`
Główne endpoint analizy semantycznej.

**Response:**
```json
{
  "models": [
    {
      "name": "anthropic_claude-sonnet-4.6",
      "fullName": "openrouter/anthropic/claude-sonnet-4.6",
      "isPolish": false,
      "isEnglish": true,
      "accuracies": {
        "1": 85.5,
        "2": 92.3,
        "3": 78.1,
        "4": 88.9,
        "5": 45.2
      }
    }
  ],
  "categories": {
    "1": "Wiedza ogólna / encyklopedyczna",
    "2": "Definicje słownikowe",
    "3": "Metafora i gra słowna",
    "4": "Nazwy własne i popkultura",
    "5": "Polskie realia kulturowe"
  },
  "accuracyByCategory": { ... },
  "categoryCounts": { "1": 5, "2": 3, ... },
  "polishVsEnglishCategory5": {
    "polishAccuracy": 72.5,
    "englishAccuracy": 45.2,
    "difference": 27.3,
    "polishModels": ["google_gemma-4-31b-it", "qwen_qwen3.5-flash-02-23"],
    "englishModels": ["anthropic_claude-sonnet-4.6", "openai_gpt-5.4-nano"]
  }
}
```

## Funkcje dashboardu

1. **Grupowany wykres słupkowy** - Pokazuje dokładność każdego modelu w każdej kategorii
2. **Porównanie polskie vs angielskie** - Specjalna karta pokazująca różnicę w kategorii 5
3. **Szczegółowa tabela** - Tabela z wszystkimi wynikami
4. **Rozkład kategorii** - Statystyki ile pytań przypisano do każdej kategorii

## Troubleshooting

### "Categorized dataset not found"
Uruchom skrypt kategoryzacji:
```bash
python categorize_questions.py
```

### "No log files found"
Upewnij się, że katalog `logs/` istnieje i zawiera pliki `.json` z wynikami benchmarkingu.

### Błąd połączenia z backendem
Upewnij się, że backend działa na porcie 5000:
```bash
cd backend
npm start
```

### Python nie jest zainstalowany
Skrypt `categorize_questions.py` wymaga Pythona. Jeśli nie masz Pythona zainstalowanego:

1. Zainstaluj Python z https://python.org
2. Zainstaluj zależności:
```bash
pip install python-dotenv litellm
```

Alternatywnie, możesz ręcznie stworzyć plik `categorized_dataset.json` dodając pole `category` (1-5) i `category_name` do każdego pytania w `dataset.json`.

## Następne kroki

Po zakończeniu punktu 1, dashboard można rozszerzyć o kolejne punkty z `docs/pomysly-badawcze.md`:
- Punkt 2: Zależność skuteczności od długości słowa
- Punkt 4: Granica Pareto: koszt vs skuteczność
- Punkt 8: Reasoning - czy myślenie pomaga?
- Itp.
