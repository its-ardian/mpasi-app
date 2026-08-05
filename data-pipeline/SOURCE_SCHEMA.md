# Adding a new recipe source to the MPASI app

The app's recipe data is built by combining any number of **source files**
into one `combined_recipes.json` via `merge_sources.py`. This keeps recipe
extraction (which needs a human to check accuracy) separate from the app's
data layer (which just needs one consistent file to query).

## To add a new source

1. Extract the new source (PDF, PPTX, scanned book, etc.) into a JSON file
   that follows the schema below. If it's an image-based source, extract by
   reading each recipe page/slide and transcribing it faithfully — don't
   invent quantities or steps that aren't legible.
2. Save the file as `<slug>.json` inside `mpasi-data/`.
3. Run:
   ```
   python3 merge_sources.py
   ```
4. Check the console output — it reports how many recipes were loaded per
   source and warns on any duplicate IDs.
5. `combined_recipes.json` is regenerated. Commit it alongside the new
   source file.

## Source file schema

```json
{
  "source_id": "short-unique-slug",
  "source": "original filename or URL",
  "source_title": "Human-readable title of the book/document",
  "publisher": "Who published it",
  "year": 2023,
  "recipes": [
    {
      "id": "recipe-slug",
      "title": "Recipe Title",
      "age_stage": "6-8 bulan",
      "servings": 3,
      "page": 11,
      "ingredient_groups": [
        {
          "group": null,
          "items": [
            {"item": "nasi putih", "amount": "60 gr (6 sdm)"}
          ]
        },
        {
          "group": "Bumbu Halus",
          "items": [
            {"item": "bawang merah", "amount": "1 siung"}
          ]
        }
      ],
      "steps": [
        "Tumis bumbu halus hingga harum.",
        "Tambahkan nasi, aduk rata."
      ],
      "fruit": {"item": "jeruk", "amount": "100 gr"},
      "nutrition_per_serving": {
        "energi_kkal": 91,
        "protein_g": 3.1,
        "lemak_g": 3.5
      },
      "energy_contribution_percent": 45,
      "allergens": ["ikan (kembung)"],
      "source_notes": "Anything about data quality, typos in the original, or ambiguity worth flagging."
    }
  ]
}
```

### Field notes

- `source_id` — short, URL-safe slug (e.g. `kemenkes-2023`). If omitted,
  it's auto-derived from `source_title`/`source`/filename, but an explicit
  one is strongly preferred — auto-slugs from long titles are ugly.
- `id` (per recipe) — only needs to be unique *within* the source file.
  The merger namespaces it as `<source_id>:<id>` so cross-source collisions
  are impossible.
- `steps` vs `step_groups` — use flat `"steps": [...]` for simple recipes.
  For recipes with multiple cooked components (e.g. "make the rice" +
  "make the sauce"), use:
  ```json
  "step_groups": [
    {"section": "Cara Membuat Nasi", "steps": ["...", "..."]},
    {"section": "Cara Membuat Saus", "steps": ["...", "..."]}
  ]
  ```
  The merger normalizes flat `steps` into `step_groups` automatically, so
  the app only ever has to handle one shape.
- `nutrition_per_serving` — keys are not fixed. Different sources report
  different nutrients (e.g. some include `zat_besi_mg`/`seng_mg`, some
  don't). The app should render whatever keys are present rather than
  assuming a fixed set.
- `allergens` — if the source doesn't state allergens explicitly, they
  must be inferred from ingredients and reviewed by a human before being
  used for any safety-relevant filtering/warning feature. Note this in
  `source_notes` if the allergens are inferred rather than sourced.
- `fruit` — optional. Several sources prescribe a fruit side as a distinct
  nutritional component; keep it separate from `ingredient_groups` rather
  than folding it in, so the app can render it as its own plate section.

## Data-quality flags

If you spot something wrong or ambiguous in the original source (a typo,
an implausible number, a missing step, a copy-paste error), **do not
silently "fix" it**. Record what you see in `source_notes` on that recipe
and leave the raw value as printed. Some of these need a human with the
original document (or subject expertise) to resolve — silently correcting
guesses would hide real data-quality issues from whoever reviews the app's
content later.
