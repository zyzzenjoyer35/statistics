import json
import os
from pathlib import Path
from collections import defaultdict
from litellm import completion

# Error mode categories
ERROR_CATEGORIES = {
    1: "Synonim / bliskoznacznik",
    2: "Powiązana koncepcja",
    3: "Hiperonim / hiponim",
    4: "Błąd długości",
    5: "Błąd formy gramatycznej",
    6: "Błąd diakrytyki",
    7: "Halucynacja",
    8: "Odmowa / nieodpowiedź"
}

def classify_error(question, correct_answer, model_answer):
    """
    Use LLM to classify the error mode.
    Returns category number (1-8) and explanation.
    """
    system_prompt = """Jesteś ekspertem w analizie błędów językowych w rozwiązywaniu krzyżówek.
Twoim zadaniem jest sklasyfikować błędną odpowiedź modelu AI do jednej z 8 kategorii:

1. **Synonim / bliskoznacznik** - słowo o podobnym znaczeniu (np. poprawna: STAW, model: JEZIORO)
2. **Powiązana koncepcja** - słowo z tej samej dziedziny, ale niebędące synonimem (np. poprawna: DNO, model: RYBY)
3. **Hiperonim / hiponim** - szersza lub węższa kategoria (np. poprawna: JAMNIK, model: PIES)
4. **Błąd długości** - odpowiedź o innej niż oczekiwana liczbie liter (np. poprawna: RONDO (5), model: RONDOO (6))
5. **Błąd formy gramatycznej** - liczba mnoga zamiast pojedynczej, inna odmiana (np. poprawna: ŁZA, model: ŁZY)
6. **Błąd diakrytyki** - litera bez ogonka zamiast z, lub odwrotnie (np. poprawna: ŁZA, model: LZA)
7. **Halucynacja** - odpowiedź niezwiązana z pytaniem
8. **Odmowa / nieodpowiedź** - model nie udzielił sensownej odpowiedzi

Zwróć odpowiedź w formacie JSON:
{
    "category": <numer kategorii 1-8>,
    "explanation": "<krótkie wyjaśnienie>"
}"""

    user_prompt = f"""Pytanie: {question}
Poprawna odpowiedź: {correct_answer} ({len(correct_answer)} liter)
Odpowiedź modelu: {model_answer}

Sklasyfikuj ten błąd i zwróć JSON z numerem kategorii i wyjaśnieniem."""

    try:
        response = completion(
            model="gpt-4o-mini",  # Using a fast, capable model for classification
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_prompt}
            ],
            temperature=0.0,
            response_format={"type": "json_object"}
        )

        result = json.loads(response.choices[0].message.content)
        return int(result["category"]), result["explanation"]
    except Exception as e:
        print(f"Error classifying: {e}")
        return 7, f"Classification failed: {str(e)}"

def extract_errors_from_logs(logs_dir):
    """
    Extract all wrong answers from log files.
    Returns list of dicts with error details.
    """
    errors = []
    logs_path = Path(logs_dir)

    for log_file in logs_path.glob("*.json"):
        model_name = log_file.stem

        with open(log_file, 'r', encoding='utf-8') as f:
            log_data = json.load(f)

        for entry in log_data.get('results', []):
            question = entry.get('pytanie', '')
            correct_answer = entry.get('odpowiedz', '').upper()
            status = entry.get('status', 'incorrect')

            # Only process incorrect answers
            if status != 'correct':
                # Get the last attempt (most likely the cleaned answer)
                attempts = entry.get('attempts', [])
                model_answer = None

                if attempts:
                    # Try to find cleaned_answer or use the last attempt
                    for attempt in reversed(attempts):
                        if 'cleaned_answer' in attempt:
                            model_answer = attempt['cleaned_answer']
                            break
                    if not model_answer:
                        model_answer = attempts[-1].get('answer', '')
                else:
                    model_answer = entry.get('cleaned_answer', '')

                if model_answer and model_answer != correct_answer:
                    errors.append({
                        'model': model_name,
                        'question': question,
                        'correct_answer': correct_answer,
                        'model_answer': model_answer.upper(),
                        'correct_length': len(correct_answer),
                        'model_length': len(model_answer),
                        'attempts_count': len(attempts) if attempts else 0
                    })

    return errors

def main():
    logs_dir = "logs"

    print("Extracting errors from logs...")
    errors = extract_errors_from_logs(logs_dir)
    print(f"Found {len(errors)} errors to classify")

    if not errors:
        print("No errors found!")
        return

    # Classify each error
    print("\nClassifying errors...")
    for i, error in enumerate(errors, 1):
        print(f"Processing {i}/{len(errors)}: {error['question'][:30]}...")
        category, explanation = classify_error(
            error['question'],
            error['correct_answer'],
            error['model_answer']
        )
        error['category'] = category
        error['category_name'] = ERROR_CATEGORIES[category]
        error['explanation'] = explanation

    # Save classified errors
    output_file = "classified_errors.json"
    with open(output_file, 'w', encoding='utf-8') as f:
        json.dump(errors, f, ensure_ascii=False, indent=2)

    print(f"\n✓ Classification complete! Saved to {output_file}")

    # Generate summary
    print("\n" + "="*60)
    print("ERROR SUMMARY BY CATEGORY")
    print("="*60)

    category_counts = defaultdict(int)
    model_errors = defaultdict(lambda: defaultdict(int))

    for error in errors:
        category = error['category_name']
        model = error['model']

        category_counts[category] += 1
        model_errors[model][category] += 1

    print("\nOverall error distribution:")
    for cat, count in sorted(category_counts.items(), key=lambda x: x[1], reverse=True):
        print(f"  {cat}: {count} ({count/len(errors)*100:.1f}%)")

    print("\n" + "="*60)
    print("ERROR PROFILE BY MODEL")
    print("="*60)

    for model in sorted(model_errors.keys()):
        print(f"\n{model}:")
        total = sum(model_errors[model].values())
        for cat, count in sorted(model_errors[model].items(), key=lambda x: x[1], reverse=True):
            print(f"  {cat}: {count} ({count/total*100:.1f}%)")

if __name__ == "__main__":
    main()
