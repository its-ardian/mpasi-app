#!/usr/bin/env python3
"""
Converts MPASI_booster_anak_-_bubur_1.json (raw, Indonesian field names,
citation artifacts, comma-decimal numbers, no age_stage/id/servings) into
the app's source schema.
"""
import json
import re

GREEK_FIX = {
    "Α": "A", "Β": "B", "Ε": "E", "Ζ": "Z", "Η": "H", "Ι": "I", "Κ": "K",
    "Μ": "M", "Ν": "N", "Ο": "O", "Ρ": "P", "Τ": "T", "Υ": "Y", "Χ": "X",
    "É": "E",
}

UNIT_WORDS = {
    "sdm", "sdt", "g", "gr", "gram", "ml", "l", "liter", "buah", "batang",
    "keping", "potong", "lembar", "siung", "butir", "cm", "genggam",
    "tongkol", "kuntum", "helai", "tangkai", "iris", "bungkus",
}

ALLERGEN_KEYWORDS = [
    (r"\btelur\b|\bkuning telur\b|\bputih telur\b", "telur"),
    (r"\btenggiri\b", "ikan (tenggiri)"),
    (r"\btuna\b", "ikan (tuna)"),
    (r"\bkakap\b", "ikan (kakap)"),
    (r"\bsalmon\b", "ikan (salmon)"),
    (r"\bteri\b", "ikan (teri)"),
    (r"\budang\b", "udang"),
    (r"\btahu\b", "tahu (kedelai)"),
    (r"\btempe\b", "tempe (kedelai)"),
    (r"\bsusu kedelai\b|\bkacang kedelai\b|\bkedelai\b", "kedelai"),
    (r"\bsusu formula\b|\bsusu cair\b|\bsusu uht\b|\bkeju\b", "susu"),
    (r"\bkacang hijau\b|\bkacang polong\b|\bkacang merah\b", "kacang"),
    (r"\btepung terigu\b|\bbiskuit\b|\bhavermut\b", "gluten"),
    (r"\bhati ayam\b", "hati ayam"),
    (r"\bceker ayam\b|\bdaging ayam\b|\bfillet ayam\b", "ayam"),
    (r"\bdaging sapi\b", "daging sapi"),
]


def clean_text(s):
    if s is None:
        return s
    s = re.sub(r"\s*\[cite:\s*\d+\]", "", s)
    for g, l in GREEK_FIX.items():
        s = s.replace(g, l)
    return s.strip()


def title_case_id(s):
    slug = re.sub(r"[^a-z0-9]+", "-", s.lower()).strip("-")
    return slug


def parse_bahan(raw):
    """Split '1/2 sdm margarin' -> ('1/2 sdm', 'margarin').
    Falls back to (None, full_string) when there's no leading quantity."""
    s = clean_text(raw)
    tokens = s.split(" ")
    amount_tokens = []
    i = 0
    while i < len(tokens):
        tok = tokens[i]
        is_number = bool(re.match(r"^\d+([.,/]\d+)?$", tok)) or tok in {"±"} or tok.startswith("±")
        is_unit = tok.strip(",").lower() in UNIT_WORDS
        is_dash_range = tok == "-"
        if is_number or is_unit or is_dash_range:
            amount_tokens.append(tok)
            i += 1
        else:
            break
    if not amount_tokens:
        return None, s
    amount = " ".join(amount_tokens)
    item = " ".join(tokens[i:]).strip()
    if not item:
        # entire string was consumed as "amount" (rare) -- treat whole
        # thing as the item instead, safer than losing the ingredient name
        return None, s
    return amount, item


def parse_nilai(value):
    """'164,9 kkal' -> 164.9 ; '7,5 g' -> 7.5"""
    if value is None:
        return None
    v = clean_text(value)
    m = re.search(r"[\d.,]+", v)
    if not m:
        return None
    num = m.group(0).replace(".", "").replace(",", ".") if "," in m.group(0) else m.group(0)
    # handle plain "308.5" (dot-decimal, already correct) vs "164,9" (comma-decimal)
    if "," in m.group(0):
        num = m.group(0).replace(".", "").replace(",", ".")
    else:
        num = m.group(0)
    try:
        return round(float(num), 1)
    except ValueError:
        return None


def infer_allergens(ingredient_text_blob):
    found = []
    low = ingredient_text_blob.lower()
    for pattern, label in ALLERGEN_KEYWORDS:
        if re.search(pattern, low) and label not in found:
            found.append(label)
    return found


# Texture-based split requested: every recipe whose steps mention
# blending/pureeing/straining -> "9-11 bulan" (finer/still-processed);
# everything left chunky/unblended -> "12-23 bulan" (coarser/family-style).
# This is an inferred placement (the source gives no age info at all),
# confirmed with the user as the intended approach for this source.
def infer_age_stage(steps_text):
    low = steps_text.lower()
    pureed = any(k in low for k in ["blender", "haluskan", "saring"])
    return "9-11 bulan" if pureed else "12-23 bulan"


INFERRED_NOTE = (
    "age_stage tidak tersedia sama sekali di sumber asli (tidak ada per-resep, "
    "bab, atau bagian usia). Atas arahan pengguna, tahap usia disimpulkan dari "
    "tekstur akhir masakan: resep yang dihaluskan/disaring -> 9-11 bulan, "
    "resep yang tetap bertekstur -> 12-23 bulan. servings juga tidak "
    "dinyatakan di sumber; diasumsikan 1 porsi. Alergen disimpulkan dari "
    "bahan, bukan dinyatakan eksplisit oleh sumber."
)


def main():
    with open("MPASI_booster_anak_-_bubur_1.json", encoding="utf-8") as f:
        raw = json.load(f)

    out_recipes = []
    for r in raw["resep_bubur"]:
        title = clean_text(r["nama_menu"]).title()
        rid = title_case_id(title)

        items = []
        for b in r["bahan"]:
            amount, item = parse_bahan(b)
            items.append({"item": item, "amount": amount})

        steps = [clean_text(s) for s in r["cara_memasak"]]
        steps_text = " ".join(steps)

        nutrition = {
            "energi_kkal": parse_nilai(r["nilai_gizi"].get("energi")),
            "protein_g": parse_nilai(r["nilai_gizi"].get("protein")),
            "lemak_g": parse_nilai(r["nilai_gizi"].get("lemak")),
            "karbohidrat_g": parse_nilai(r["nilai_gizi"].get("karbohidrat")),
        }

        ingredient_blob = " ".join(i["item"] for i in items)
        allergens = infer_allergens(ingredient_blob)

        out_recipes.append({
            "id": rid,
            "title": title,
            "age_stage": infer_age_stage(steps_text),
            "servings": 1,
            "ingredient_groups": [{"group": None, "items": items}],
            "step_groups": [{"section": None, "steps": steps}],
            "nutrition_per_serving": nutrition,
            "allergens": allergens,
            "source_notes": INFERRED_NOTE,
        })

    out = {
        "source_id": "mpasi-booster-bubur",
        "source": clean_text(raw["sumber"]),
        "source_title": "350+ MPASI BB Booster Anak (bagian bubur)",
        "recipes": out_recipes,
    }

    with open("mpasi_booster_bubur.json", "w", encoding="utf-8") as f:
        json.dump(out, f, ensure_ascii=False, indent=2)

    print(f"Converted {len(out_recipes)} recipes")
    from collections import Counter
    print("age_stage split:", Counter(r["age_stage"] for r in out_recipes))
    print("\nSample recipe:")
    print(json.dumps(out_recipes[0], ensure_ascii=False, indent=2))


if __name__ == "__main__":
    main()
