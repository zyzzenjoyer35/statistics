from dotenv import load_dotenv
load_dotenv('.env.local', override=True)
load_dotenv('.env')

import json
from litellm import completion
import os

CATEGORIES = """
1. **Wiedza ogólna / encyklopedyczna** — pytania o fakty (np. "Imię Kurosawy, reżysera" → AKIRA).
2. **Definicje słownikowe** — pytania z wyraźną jednoznaczną definicją (np. "Podwodny grunt" → DNO).
3. **Metafora i gra słowna** — pytania wymagające przeskoku semantycznego (np. "Kropla smutku" → ŁZA).
4. **Nazwy własne i popkultura** — postacie, produkty, marki (np. "Kaczor z kreskówek" → DONALD).
5. **Polskie realia kulturowe** — słownictwo silnie osadzone w polskim kontekście (np. BACA, kazania góralskie, polskie potrawy).
"""

SYSTEM_PROMPT = f"""Jesteś anotatorem danych dla bazy pytań krzyżówkowych. Twoim zadaniem jest przypisać każde pytanie do JEDNEJ z 5 kategorii semantycznych:

{CATEGORIES}

Zasady:
- Wybierz TYLKO JEDNĄ kategorię (odpowiedz numerem 1-5)
- Jeśli pytanie pasuje do wielu kategorii, wybierz tą, która najbardziej dominuje
- Odpowiedz tylko numerem kategorii, bez żadnego dodatkowego tekstu
"""

def load_dataset(filepath='dataset.json'):
    with open(filepath, 'r', encoding='utf-8') as f:
        return json.load(f)

def categorize_question(question: str, answer: str, model: str = "openrouter/anthropic/claude-sonnet-4.6") -> dict:
    """Categorize a single question using LLM"""
    user_prompt = f"""Pytanie: "{question}"
Odpowiedź: "{answer}"

Przypisz to pytanie do jednej z 5 kategorii (odpowiedz tylko numerem 1-5):"""

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

        raw_response = response.choices[0].message.content.strip()
        category_num = int(raw_response[0]) if raw_response and raw_response[0].isdigit() else 0

        category_names = {
            1: "Wiedza ogólna / encyklopedyczna",
            2: "Definicje słownikowe",
            3: "Metafora i gra słowna",
            4: "Nazwy własne i popkultura",
            5: "Polskie realia kulturowe"
        }

        return {
            "category": category_num,
            "category_name": category_names.get(category_num, "Nieznana"),
            "raw_response": raw_response
        }

    except Exception as e:
        print(f"Error categorizing question '{question}': {e}")
        return {
            "category": 0,
            "category_name": "Błąd kategoryzacji",
            "raw_response": str(e)
        }

def categorize_all_questions(dataset_path='dataset.json', output_path='categorized_dataset.json'):
    """Categorize all questions in the dataset"""
    data = load_dataset(dataset_path)

    print(f"Categorizing {len(data)} questions...")
    print("This will make one API call per question.\n")

    categorized_data = []

    for i, item in enumerate(data, 1):
        question = item.get("pytanie", "")
        answer = item.get("odpowiedz", "")

        print(f"[{i}/{len(data)}] Processing: {question}")

        categorization = categorize_question(question, answer)

        categorized_item = item.copy()
        categorized_item["category"] = categorization["category"]
        categorized_item["category_name"] = categorization["category_name"]

        categorized_data.append(categorized_item)

        # Small delay to avoid rate limiting
        if i < len(data):
            import time
            time.sleep(0.5)

    # Save categorized dataset
    with open(output_path, 'w', encoding='utf-8') as f:
        json.dump(categorized_data, f, ensure_ascii=False, indent=2)

    print(f"\n✓ Categorization complete! Saved to {output_path}")

    # Print summary
    category_counts = {}
    for item in categorized_data:
        cat = item["category"]
        category_counts[cat] = category_counts.get(cat, 0) + 1

    print("\nCategory distribution:")
    for cat in sorted(category_counts.keys()):
        count = category_counts[cat]
        percentage = (count / len(categorized_data)) * 100
        cat_name = next((item["category_name"] for item in categorized_data if item["category"] == cat), "Unknown")
        print(f"  {cat}. {cat_name}: {count} ({percentage:.1f}%)")

if __name__ == "__main__":
    categorize_all_questions()
