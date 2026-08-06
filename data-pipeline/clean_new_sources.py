#!/usr/bin/env python3
"""
Cleans the four new source files per the agreed decisions:
1. menu_mpasi_buah_hati.json: drop broken duplicate stub, remap "6-12 Bulan"
   to a specific stage per-recipe (texture-based judgment call), translate
   English allergen labels to Indonesian, null out placeholder zero nutrition.
2. 14__Inspirasi_Menu_MPASI.json: recategorize "Selingan" -> "6-8 bulan",
   null out placeholder zero nutrition.
3. 15__Sharing_Menu_MPASI_46.json: normalize "6 bulan +" -> "6-8 bulan",
   null out placeholder zero nutrition.
4. 11__76_Resep_MPASI_by_Bumboo.json: normalize stage casing, remap
   "12+ Bulan" per-recipe, strip nutrition data (physically implausible —
   e.g. 22 kcal recipes with 69g protein), flag branded-ingredient recipes.
"""
import json

ALLERGEN_TRANSLATIONS = {
    "Beef": "daging sapi",
    "Dairy": "susu (dairy)",
    "Egg": "telur",
    "Gluten": "gluten",
    "Poultry": "unggas (ayam)",
    "Soy": "kedelai",
}

INFERRED_STAGE_NOTE = (
    "age_stage tidak dispesifikkan per resep di sumber asli (sumber menandai "
    "semua resep sebagai '6-12 Bulan' secara umum) — tahap usia di atas "
    "disimpulkan dari tekstur & cara masak resep ini, bukan dinyatakan "
    "eksplisit oleh sumber. Sebaiknya diverifikasi ulang."
)


def zero_nutrition_to_null(recipe):
    n = recipe.get("nutrition_per_serving")
    if n and all((v in (0, None)) for v in n.values()):
        recipe["nutrition_per_serving"] = None


# ---------------------------------------------------------------------------
# 1. menu_mpasi_buah_hati.json
# ---------------------------------------------------------------------------
with open("menu_mpasi_buah_hati.json", encoding="utf-8") as f:
    data = json.load(f)

# Drop the broken stub (no ingredients/steps/age_stage) — keep the complete
# "pure-alpukat" entry that follows it.
data["recipes"] = [
    r for r in data["recipes"] if not (r.get("id") == "pure-alpukat" and "steps" not in r)
]

STAGE_MAP = {
    # 6-8 bulan: recipe ends in a full blend/strain -> smooth puree texture
    "pure-alpukat": "6-8 bulan",
    "bubur-biskuit-alpukat": "6-8 bulan",
    "pure-pisang-alpukat": "6-8 bulan",
    "bubur-alpukat-tahu": "6-8 bulan",
    "pure-nasi-wortel": "6-8 bulan",
    "pure-kentang-wortel-tempe": "6-8 bulan",
    "pure-labu-apel": "6-8 bulan",
    "pure-pisang-apel": "6-8 bulan",
    "pure-pisang": "6-8 bulan",
    "pure-bayam-jagung": "6-8 bulan",
    "bubur-krim-sup-ayam": "6-8 bulan",
    "bubur-hati-ayam": "6-8 bulan",
    "pure-kentang": "6-8 bulan",
    "bubur-nasi-tempe": "6-8 bulan",
    "bubur-kentang-kari-daging": "6-8 bulan",
    "pure-brokoli": "6-8 bulan",
    "bubur-tahu-sayuran": "6-8 bulan",
    "bubur-manado": "6-8 bulan",
    "pure-alpukat-markisa": "6-8 bulan",
    # 9-11 bulan: diced/chopped, no final blend -> soft lumpy texture
    "pure-labu-brokoli": "9-11 bulan",
    "bubur-tahu-saus-tomat": "9-11 bulan",
    # 12-23 bulan: explicitly "cincang kasar" (coarsely chopped), no blending
    "tim-beras-merah-buah": "12-23 bulan",
}

for r in data["recipes"]:
    rid = r["id"]
    if rid in STAGE_MAP:
        r["age_stage"] = STAGE_MAP[rid]
        r["source_notes"] = INFERRED_STAGE_NOTE
    r["allergens"] = [ALLERGEN_TRANSLATIONS.get(a, a) for a in r.get("allergens", [])]
    zero_nutrition_to_null(r)

data["source_id"] = "menu-mpasi-buah-hati"
with open("menu_mpasi_buah_hati.json", "w", encoding="utf-8") as f:
    json.dump(data, f, ensure_ascii=False, indent=2)
print(f"menu_mpasi_buah_hati.json: {len(data['recipes'])} recipes cleaned")


# ---------------------------------------------------------------------------
# 2. 14__Inspirasi_Menu_MPASI.json
# ---------------------------------------------------------------------------
with open("14__Inspirasi_Menu_MPASI.json", encoding="utf-8") as f:
    data = json.load(f)

for r in data["recipes"]:
    if r.get("age_stage") == "Selingan":
        r["age_stage"] = "6-8 bulan"
        r["source_notes"] = (
            "Sumber menandai resep ini sebagai 'Selingan' (kategori camilan), "
            "bukan tahap usia. Dikategorikan ulang ke '6-8 bulan' berdasarkan "
            "posisinya di sumber (tepat setelah bagian resep 6-8 bulan)."
        )
    zero_nutrition_to_null(r)

data["source_id"] = "inspirasi-menu-mpasi"
with open("14__Inspirasi_Menu_MPASI.json", "w", encoding="utf-8") as f:
    json.dump(data, f, ensure_ascii=False, indent=2)
print(f"14__Inspirasi_Menu_MPASI.json: {len(data['recipes'])} recipes cleaned")


# ---------------------------------------------------------------------------
# 3. 15__Sharing_Menu_MPASI_46.json
# ---------------------------------------------------------------------------
with open("15__Sharing_Menu_MPASI_46.json", encoding="utf-8") as f:
    data = json.load(f)

for r in data["recipes"]:
    if r.get("age_stage") == "6 bulan +":
        r["age_stage"] = "6-8 bulan"
    zero_nutrition_to_null(r)

data["source_id"] = "sharing-menu-mpasi-46"
with open("15__Sharing_Menu_MPASI_46.json", "w", encoding="utf-8") as f:
    json.dump(data, f, ensure_ascii=False, indent=2)
print(f"15__Sharing_Menu_MPASI_46.json: {len(data['recipes'])} recipes cleaned")


# ---------------------------------------------------------------------------
# 4. 11__76_Resep_MPASI_by_Bumboo.json
# ---------------------------------------------------------------------------
with open("11__76_Resep_MPASI_by_Bumboo.json", encoding="utf-8") as f:
    data = json.load(f)

BUMBOO_STAGE_MAP = {
    "sup-cream-ayam-jagung": "12-23 bulan",  # soft/blended-ish, fine just past 1yr
    "creamy-meatballs": "2-5 tahun",         # composed dish w/ bite-sized meatballs
}

BAD_NUTRITION_NOTE = (
    "Nilai gizi pada sumber asli tidak masuk akal secara fisik (mis. resep "
    "22 kkal tercatat mengandung 69g protein — 1g protein = 4 kkal, jadi "
    "protein saja sudah jauh melebihi total kalori). Kemungkinan angka ini "
    "adalah %AKG atau nilai per takaran lain yang salah label. Dihapus "
    "daripada menampilkan data yang jelas keliru — perlu verifikasi ulang "
    "dari sumber asli sebelum diisi kembali."
)
BRANDED_NOTE = (
    "Resep ini menggunakan produk komersial bermerek (BUMBOO) sebagai bahan "
    "inti, bukan bumbu generik yang mudah disubstitusi."
)

for r in data["recipes"]:
    if r.get("age_stage") == "6-8 Bulan":
        r["age_stage"] = "6-8 bulan"
    elif r.get("age_stage") == "9-11 Bulan":
        r["age_stage"] = "9-11 bulan"
    elif r.get("age_stage") == "12+ Bulan":
        r["age_stage"] = BUMBOO_STAGE_MAP.get(r["id"], "12-23 bulan")

    r["nutrition_per_serving"] = None
    existing_note = r.get("source_notes")
    combined_note = BAD_NUTRITION_NOTE + " " + BRANDED_NOTE
    r["source_notes"] = (existing_note + " " + combined_note) if existing_note else combined_note

data["source_id"] = "bumboo-76-resep"
with open("11__76_Resep_MPASI_by_Bumboo.json", "w", encoding="utf-8") as f:
    json.dump(data, f, ensure_ascii=False, indent=2)
print(f"11__76_Resep_MPASI_by_Bumboo.json: {len(data['recipes'])} recipes cleaned")
