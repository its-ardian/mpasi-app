#!/usr/bin/env python3
"""
merge_sources.py

Combines any number of MPASI recipe-source JSON files into a single
normalized dataset: combined_recipes.json

HOW TO ADD A NEW SOURCE:
1. Extract/convert the new source into a JSON file following the
   "source file schema" below (see SOURCE_SCHEMA.md for the full spec).
2. Drop the file into this directory (mpasi-data/).
3. Re-run: python3 merge_sources.py
4. combined_recipes.json is regenerated with the new source included.

SOURCE FILE SCHEMA (minimum required):
{
  "source_id": "short-unique-slug",       # optional, derived from filename if absent
  "source": "original filename or url",   # optional, for provenance
  "source_title": "Human readable title", # optional
  "publisher": "...",                     # optional
  "year": 2023,                           # optional
  "recipes": [
    {
      "id": "recipe-slug",
      "title": "...",
      "age_stage": "6-8 bulan" | "9-11 bulan" | "12-23 bulan" | "2-5 tahun" | "ibu hamil" | ...,
      "servings": 3,
      "page": 11,                          # optional
      "ingredient_groups": [
        {"group": null | "Bumbu Halus", "items": [{"item": "...", "amount": "..." | null}]}
      ],
      # EITHER flat "steps": [...] OR grouped "step_groups": [{"section": null|"...", "steps": [...]}]
      "steps": ["...", "..."],
      "fruit": {"item": "...", "amount": "..."} | null,        # optional
      "nutrition_per_serving": {"energi_kkal": 91, "protein_g": 3.1, ...},
      "energy_contribution_percent": 45,   # optional
      "allergens": ["..."],
      "source_notes": "..."                # optional
    }
  ]
}

The merger normalizes every recipe to use "step_groups" (converting flat
"steps" arrays automatically) and namespaces every recipe id as
"<source_id>:<recipe-id>" to guarantee global uniqueness across sources.
"""

import json
import re
import sys
from pathlib import Path

DATA_DIR = Path(__file__).parent
OUTPUT_FILE = DATA_DIR / "combined_recipes.json"
# Files that are themselves outputs / not sources
SKIP_FILES = {"combined_recipes.json"}

# --- meal_type classification -----------------------------------------
# Individual source files generally don't state whether a recipe is a
# full meal ("utama") or a snack ("camilan"). Rather than maintaining that
# by hand across every source file (where it's easy to lose on a re-merge,
# as happened once already), it's classified here on every run, so it's
# always present and always reproducible from the source data alone.
CAMILAN_PATTERNS = [
    r"^pure\b", r"^puree\b", r"puding", r"pudding",
    r"bola-bola", r"^bola\b", r"bubur susu",
]

# Recipes where the keyword heuristic misfires -- checked individually
# against ingredients/portion data, keyed by the final namespaced id.
MEAL_TYPE_OVERRIDES = {
    "kemenkes-2023:puding-kentang-ayam-telur": "utama",  # full combo dish despite the name
    "kemenkes-2023:bola-bola-nasi-rabuk-ikan": "utama",  # 468kcal/33% daily energy = main dish
}


def classify_meal_type(recipe_id, title):
    if recipe_id in MEAL_TYPE_OVERRIDES:
        return MEAL_TYPE_OVERRIDES[recipe_id]
    t = title.lower()
    return "camilan" if any(re.search(p, t) for p in CAMILAN_PATTERNS) else "utama"


def slugify(text: str) -> str:
    text = text.lower().strip()
    text = re.sub(r"[^a-z0-9]+", "-", text)
    return text.strip("-")


def normalize_recipe(recipe: dict, source_id: str) -> dict:
    normalized = dict(recipe)  # shallow copy

    # Namespace the id so recipes from different sources never collide
    original_id = recipe.get("id") or slugify(recipe.get("title", "untitled"))
    normalized["id"] = f"{source_id}:{original_id}"
    normalized["original_id"] = original_id
    normalized["source_id"] = source_id

    # Normalize steps -> step_groups
    if "step_groups" not in normalized:
        steps = normalized.pop("steps", [])
        normalized["step_groups"] = [{"section": None, "steps": steps}]
    else:
        normalized.pop("steps", None)

    # Ensure optional fields always exist so the app can rely on their presence
    normalized.setdefault("page", None)
    normalized.setdefault("fruit", None)
    normalized.setdefault("energy_contribution_percent", None)
    normalized.setdefault("source_notes", None)
    normalized.setdefault("allergens", [])
    normalized.setdefault("servings", 3)
    normalized.setdefault(
        "meal_type", classify_meal_type(normalized["id"], normalized["title"])
    )

    return normalized


def load_source(path: Path) -> dict:
    with open(path, encoding="utf-8") as f:
        data = json.load(f)

    if "recipes" not in data:
        raise ValueError(f"{path.name}: missing required 'recipes' array")

    source_id = data.get("source_id") or slugify(
        data.get("source_title") or data.get("source") or path.stem
    )

    source_meta = {
        "source_id": source_id,
        "filename": path.name,
        "source": data.get("source"),
        "source_title": data.get("source_title"),
        "publisher": data.get("publisher"),
        "year": data.get("year"),
        "isbn": data.get("isbn"),
        "note": data.get("note"),
        "recipe_count": len(data["recipes"]),
    }

    recipes = [normalize_recipe(r, source_id) for r in data["recipes"]]
    return source_meta, recipes


def main():
    source_files = sorted(
        p for p in DATA_DIR.glob("*.json") if p.name not in SKIP_FILES
    )

    if not source_files:
        print("No source JSON files found in", DATA_DIR)
        sys.exit(1)

    all_sources = []
    all_recipes = []
    seen_ids = set()

    for path in source_files:
        try:
            source_meta, recipes = load_source(path)
        except ValueError as e:
            print(f"Skipping {path.name}: {e}")
            continue

        for r in recipes:
            if r["id"] in seen_ids:
                print(f"WARNING: duplicate recipe id after namespacing: {r['id']}")
            seen_ids.add(r["id"])

        all_sources.append(source_meta)
        all_recipes.append((path.name, source_meta["source_id"], len(recipes)))
        print(f"Loaded {path.name}: {len(recipes)} recipes -> source_id='{source_meta['source_id']}'")

    # Re-run cleanly to collect normalized recipes into one flat list
    combined_recipes = []
    for path in source_files:
        source_meta, recipes = load_source(path)
        combined_recipes.extend(recipes)

    combined = {
        "generated_by": "merge_sources.py",
        "sources": all_sources,
        "total_recipes": len(combined_recipes),
        "recipes": combined_recipes,
    }

    with open(OUTPUT_FILE, "w", encoding="utf-8") as f:
        json.dump(combined, f, ensure_ascii=False, indent=2)

    print(f"\nWrote {OUTPUT_FILE.name}: {len(combined_recipes)} recipes from {len(all_sources)} source(s)")


if __name__ == "__main__":
    main()
